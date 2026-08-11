/**
 * Simulation agent — plays N paid spins mirroring the full board flow in
 * src/ui/board.ts runSpin(): treat jar settling, cat visits, and every bonus
 * resolved through the same engine entry points the UI uses.
 *
 * Usage: npx tsx scripts/sim-agent.ts <agentId> <seed> <paidSpins>
 * Prints a single JSON report to stdout.
 *
 * Player models for interactive bonuses (noted in the report):
 *  - Bold Chai Pump: steady 6 pumps/second for the full 30s window.
 *  - Moonlit Keepsake Trail: perfect-memory player (always completes, +40 spins).
 *  - Phoebe's Lap Quest: uninformed random-uniform choice among the three
 *    offered spots, so the player finds the perfect lap 1 time in 3; pets often
 *    enough to prevent inactivity, so the chapter ends at Joey's arrival.
 */
import { spin } from "../src/engine/cascade";
import { LINES } from "../src/engine/economy";
import { mulberry32 } from "../src/engine/rng";
import { runFreeSpinSession, spinWheel } from "../src/engine/freespins";
import {
  settleTreatJar,
  collectTreat,
  consumeForVisit,
  emptyTreatJar,
} from "../src/engine/features";
import {
  createBoldChaiPumpState,
  pumpBoldChai,
  completeBoldChaiPump,
  BOLD_CHAI_DURATION_MS,
} from "../src/engine/bold-chai-pump";
import { runUniGleeBaseMarathon } from "../src/engine/uniglee-marathon";
import { spinLapQuestRound, createLapQuestChallenge, LAP_QUEST_SPOTS } from "../src/engine/lap-quest";
import type { TreatKind } from "../src/engine/types";

const [, , agentIdArg, seedArg, spinsArg] = process.argv;
const AGENT_ID = agentIdArg ?? "agent";
const SEED = Number(seedArg ?? 1);
const PAID_SPINS = Number(spinsArg ?? 5000);
const BET_PER_LINE = 1;
const TOTAL_BET_PER_SPIN = BET_PER_LINE * LINES;

interface BonusTally {
  encountered: number;
  played: number;
  freeSpinsPlayed: number;
  win: number;
  cappedSessions: number;
}
const tally = (): BonusTally => ({ encountered: 0, played: 0, freeSpinsPlayed: 0, win: 0, cappedSessions: 0 });

/**
 * Safety guard kept from the pre-retune era: bonus retriggers are now blocked
 * engine-wide and Treat Time casts 0-4 wilds per free spin, so sessions are
 * bounded by their initial award. We still cap at 5,000 rounds per session and
 * COUNT every capped session — a nonzero count means the block regressed.
 */
const SESSION_CAP = 5000;

const bonuses = {
  fireflyFreeSpins: tally(),      // cascade-ladder trigger -> Sparkle Wheel
  wheelMultiplying: tally(),
  wheelKeepsakeMemory: tally(),
  wheelChaiBack: tally(),
  wheelDoorbellPanic: tally(),
  doorbellPanic: tally(),         // doorbell pair trigger (own session, no wheel)
  boldChaiPump: tally(),
  treatTimeMorning: tally(),
  treatTimeNighttime: tally(),
  uniglee: tally(),
  lapQuest: tally(),
  treatJar: tally(),
  catVisits: tally(),             // encountered = visits, played = fed visits
};

function simulateBoldChaiPlayer(): number {
  // 6 pumps/second, deterministic cadence — no RNG used by the pump engine.
  let state = createBoldChaiPumpState();
  const start = 0;
  const intervalMs = 1000 / 6;
  for (let t = start; t < start + BOLD_CHAI_DURATION_MS; t += intervalMs) {
    state = pumpBoldChai(state, t).state;
  }
  return completeBoldChaiPump(state, start + BOLD_CHAI_DURATION_MS).freeSpinsAwarded;
}

interface CascadeCapResult {
  terminatedByCascadeCap?: boolean;
}

let terminatedByCascadeCap = 0;

function recordCascadeCap(result: CascadeCapResult): void {
  if (result.terminatedByCascadeCap) terminatedByCascadeCap++;
}

function recordRoundCascadeCaps(rounds: readonly CascadeCapResult[]): void {
  for (const round of rounds) recordCascadeCap(round);
}

/**
 * Mirrors board.ts runLapQuestChapter without its DOM delays. The ledge clock
 * starts after the choice/reveal and first round are generated. A round already
 * in progress when Joey arrives finishes before the chapter returns.
 */
function simulateLapQuest(
  rng: ReturnType<typeof mulberry32>,
  playerChoiceRng: ReturnType<typeof mulberry32>,
): {
  totalWin: number;
  totalSpins: number;
  terminatedByCascadeCap: number;
} {
  const challenge = createLapQuestChallenge(rng);
  // Explicit player model: random uniform, not always-perfect (1-in-3 perfect).
  // The player's tap is independent of the chapter RNG, matching live play.
  const selectedSpot = challenge.choices[Math.floor(playerChoiceRng() * challenge.choices.length)];
  const firstRound = spinLapQuestRound(rng, challenge, selectedSpot, BET_PER_LINE);
  const interruptAtMs = 15_000 + Math.floor(rng() * 75_001);
  let elapsedMs = 0;
  let totalWin = 0;
  let totalSpins = 0;
  let cappedCascades = 0;

  const playRound = (round: ReturnType<typeof spinLapQuestRound>): void => {
    totalWin += round.totalWin;
    totalSpins++;
    if (round.terminatedByCascadeCap) cappedCascades++;
    // playLapQuestRound: 360ms per cascade step, then a 420ms result hold.
    elapsedMs += round.steps.length * 360 + 420;
  };

  playRound(firstRound);
  while (elapsedMs < interruptAtMs) {
    // runLapQuestChapter waits up to 900ms before beginning the next round.
    elapsedMs += Math.min(900, interruptAtMs - elapsedMs);
    if (elapsedMs >= interruptAtMs) break;
    playRound(spinLapQuestRound(rng, challenge, selectedSpot, BET_PER_LINE));
  }

  return { totalWin, totalSpins, terminatedByCascadeCap: cappedCascades };
}

const rootRng = mulberry32(SEED);
const nextSeed = () => Math.floor(rootRng() * 0xffffffff);

let baseWin = 0;
let bonusWin = 0;
let totalBet = 0;
let baseWinningSpins = 0;
let mega8 = 0;
let jar = emptyTreatJar();
let spinsSincePopIn = 10;
let pendingTreatJarSpins = 0;

for (let i = 0; i < PAID_SPINS; i++) {
  // --- treat jar settlement before the spin (mirrors runSpin) ---
  let treatJarSpins = pendingTreatJarSpins;
  pendingTreatJarSpins = 0;
  const settled = settleTreatJar(jar);
  jar = settled.jar;
  treatJarSpins += settled.freeSpinsAwarded;

  const seed = nextSeed();
  const result = spin({
    rng: mulberry32(seed),
    treatTimeRng: mulberry32(seed ^ 0x9e3779b9),
    allowTreatTimeBonus: true,
    betPerLine: BET_PER_LINE,
    treatJar: jar,
    spinsSincePopIn,
  });
  recordCascadeCap(result);

  totalBet += TOTAL_BET_PER_SPIN;
  baseWin += result.totalWin;
  if (result.cascades > 0) baseWinningSpins++;
  if (result.cascades >= 8) mega8++;

  for (const treat of result.treatsCollected) {
    const collected = collectTreat(jar, treat as TreatKind);
    jar = collected.jar;
    treatJarSpins += collected.freeSpinsAwarded;
  }

  if (result.catVisit) {
    bonuses.catVisits.encountered++;
    if (result.catVisit.fed) bonuses.catVisits.played++;
    spinsSincePopIn = 0;
    jar = consumeForVisit(jar, result.catVisit);
  } else {
    spinsSincePopIn++;
  }

  // --- bonus resolution, mirroring runSpin() precedence ---
  // UI precedence (board.ts): uniglee -> doorbellPanic (banner only) -> boldChaiPump
  let boldChaiSpinsAwarded = 0;
  if (result.unigleeTriggered) {
    bonuses.uniglee.encountered++;
    bonuses.uniglee.played++;
    const award = result.unigleeTrigger?.initialAwardSpins ?? 300;
    const marathon = runUniGleeBaseMarathon(mulberry32(seed ^ 0x51f15e5d), BET_PER_LINE, award);
    for (const chapter of marathon.chapters) {
      bonuses.uniglee.win += chapter.totalWin;
      bonuses.uniglee.freeSpinsPlayed += chapter.totalSpins;
      if (chapter.session.terminatedByCap) bonuses.uniglee.cappedSessions++;
      recordRoundCascadeCaps(chapter.session.rounds);
    }
    const lapQuest = simulateLapQuest(
      mulberry32(seed ^ 0x6a09e667),
      mulberry32(seed ^ 0xbb67ae85),
    );
    bonuses.lapQuest.encountered++;
    bonuses.lapQuest.played++;
    bonuses.lapQuest.freeSpinsPlayed += lapQuest.totalSpins;
    bonuses.lapQuest.win += lapQuest.totalWin;
    bonuses.lapQuest.cappedSessions += lapQuest.terminatedByCascadeCap > 0 ? 1 : 0;
    terminatedByCascadeCap += lapQuest.terminatedByCascadeCap;
  } else if (result.doorbellPanic) {
    // UI shows the doorbell banner here; the session itself runs below only if freeSpinsAwarded > 0.
  } else if (result.boldChaiPump) {
    bonuses.boldChaiPump.encountered++;
    bonuses.boldChaiPump.played++;
    boldChaiSpinsAwarded = simulateBoldChaiPlayer();
  }

  if (result.treatTimeBonus) {
    const bucket = result.treatTimeBonus.mode === "morning" ? bonuses.treatTimeMorning : bonuses.treatTimeNighttime;
    bucket.encountered++;
    bucket.played++;
    const wedge = result.treatTimeBonus.mode === "morning" ? "treat_time_morning" : "treat_time_nighttime";
    const session = runFreeSpinSession(mulberry32(nextSeed()), wedge as never, BET_PER_LINE, result.treatTimeBonus.freeSpinsAwarded, { maxTotalSpins: SESSION_CAP });
    bucket.freeSpinsPlayed += session.totalSpins;
    bucket.win += session.totalWin;
    if (session.terminatedByCap) bucket.cappedSessions++;
    recordRoundCascadeCaps(session.rounds);
  }

  if (result.freeSpinsAwarded > 0) {
    if (result.doorbellPanic) {
      bonuses.doorbellPanic.encountered++;
      bonuses.doorbellPanic.played++;
      const session = runFreeSpinSession(mulberry32(nextSeed()), "doorbell_panic", BET_PER_LINE, result.freeSpinsAwarded);
      bonuses.doorbellPanic.freeSpinsPlayed += session.totalSpins;
      bonuses.doorbellPanic.win += session.totalWin;
      recordRoundCascadeCaps(session.rounds);
    } else {
      bonuses.fireflyFreeSpins.encountered++;
      bonuses.fireflyFreeSpins.played++;
      const wheelRng = mulberry32(nextSeed());
      const wedge = spinWheel(wheelRng);
      const wedgeBucket =
        wedge === "multiplying" ? bonuses.wheelMultiplying :
        wedge === "keepsake_memory" ? bonuses.wheelKeepsakeMemory :
        wedge === "chai_back" ? bonuses.wheelChaiBack :
        bonuses.wheelDoorbellPanic;
      wedgeBucket.encountered++;
      wedgeBucket.played++;
      if (wedge === "keepsake_memory") {
        // Perfect-memory player: always completes, engine awards 40 standard spins.
        const session = runFreeSpinSession(wheelRng, "standard", BET_PER_LINE, 40);
        wedgeBucket.freeSpinsPlayed += session.totalSpins;
        wedgeBucket.win += session.totalWin;
        recordRoundCascadeCaps(session.rounds);
      } else {
        const session = runFreeSpinSession(wheelRng, wedge, BET_PER_LINE, result.freeSpinsAwarded);
        wedgeBucket.freeSpinsPlayed += session.totalSpins;
        wedgeBucket.win += session.totalWin;
        recordRoundCascadeCaps(session.rounds);
      }
      bonuses.fireflyFreeSpins.freeSpinsPlayed += wedgeBucket.freeSpinsPlayed;
    }
  }

  // UI: bold chai free spins run only when the ladder did NOT award spins this spin.
  if (result.freeSpinsAwarded === 0 && boldChaiSpinsAwarded > 0) {
    const session = runFreeSpinSession(mulberry32(nextSeed()), "chai_back", BET_PER_LINE, boldChaiSpinsAwarded, { allowChaiStorm: false });
    bonuses.boldChaiPump.freeSpinsPlayed += session.totalSpins;
    bonuses.boldChaiPump.win += session.totalWin;
    recordRoundCascadeCaps(session.rounds);
  }

  if (treatJarSpins > 0) {
    bonuses.treatJar.encountered++;
    bonuses.treatJar.played++;
    const session = runFreeSpinSession(mulberry32(nextSeed()), "chai_back", BET_PER_LINE, treatJarSpins, { allowChaiStorm: false, allowRetriggers: false });
    bonuses.treatJar.freeSpinsPlayed += session.totalSpins;
    bonuses.treatJar.win += session.totalWin;
    recordRoundCascadeCaps(session.rounds);
  }
}

// fireflyFreeSpins.freeSpinsPlayed was accumulated incorrectly (cumulative wedge totals); rebuild from wedges.
bonuses.fireflyFreeSpins.freeSpinsPlayed =
  bonuses.wheelMultiplying.freeSpinsPlayed +
  bonuses.wheelKeepsakeMemory.freeSpinsPlayed +
  bonuses.wheelChaiBack.freeSpinsPlayed +
  bonuses.wheelDoorbellPanic.freeSpinsPlayed;
bonuses.fireflyFreeSpins.win =
  bonuses.wheelMultiplying.win +
  bonuses.wheelKeepsakeMemory.win +
  bonuses.wheelChaiBack.win +
  bonuses.wheelDoorbellPanic.win;

bonusWin =
  bonuses.fireflyFreeSpins.win +
  bonuses.doorbellPanic.win +
  bonuses.boldChaiPump.win +
  bonuses.treatTimeMorning.win +
  bonuses.treatTimeNighttime.win +
  bonuses.uniglee.win +
  bonuses.lapQuest.win +
  bonuses.treatJar.win;

const totalFreeSpins =
  bonuses.fireflyFreeSpins.freeSpinsPlayed +
  bonuses.doorbellPanic.freeSpinsPlayed +
  bonuses.boldChaiPump.freeSpinsPlayed +
  bonuses.treatTimeMorning.freeSpinsPlayed +
  bonuses.treatTimeNighttime.freeSpinsPlayed +
  bonuses.uniglee.freeSpinsPlayed +
  bonuses.lapQuest.freeSpinsPlayed +
  bonuses.treatJar.freeSpinsPlayed;

const totalWin = baseWin + bonusWin;

// ── Lap Quest dedicated fleet ─────────────────────────────────────────────────
// Run 50 rounds per spot (150 total) to verify Guard 1b prevents Guard 2 (the
// hard cascade cap) from firing.  lapQuestCappedCascades === 0 in every report
// means Guard 1b resolved every sticky-wild anchor loop before Guard 2 was
// needed.  A nonzero value indicates a regression.
const LAP_QUEST_ROUNDS_PER_SPOT = 50;
let lapQuestCappedCascades = 0;
for (const spot of LAP_QUEST_SPOTS) {
  for (let r = 0; r < LAP_QUEST_ROUNDS_PER_SPOT; r++) {
    const lapRng = mulberry32(nextSeed());
    const challenge = createLapQuestChallenge(lapRng);
    const lapResult = spinLapQuestRound(lapRng, challenge, spot, BET_PER_LINE);
    if (lapResult.terminatedByCascadeCap) lapQuestCappedCascades++;
  }
}

console.log(JSON.stringify({
  agent: AGENT_ID,
  seed: SEED,
  paidSpins: PAID_SPINS,
  totalBet,
  baseWin,
  bonusWin,
  totalWin,
  baseRtp: baseWin / totalBet,
  totalRtp: totalWin / totalBet,
  baseWinningSpins,
  mega8,
  totalFreeSpinsPlayed: totalFreeSpins,
  playerModel: {
    boldChaiPump: "steady 6 pumps/second for the full 30-second window",
    moonlitKeepsakeTrail: "perfect memory; always completes and receives the 40-spin handoff",
    lapQuestChoice: "random uniform among three offered spots; 1-in-3 perfect lap",
    lapQuestPetting: "pets often enough to prevent inactivity; chapter ends at seeded Joey arrival",
  },
  terminatedByCascadeCap,
  lapQuestCappedCascades,
  bonuses,
}, null, 2));
