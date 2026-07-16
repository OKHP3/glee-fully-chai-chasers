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
  treatJar: tally(),
  catVisits: tally(),             // encountered = visits, played = fed visits
};

function simulateBoldChaiPlayer(rngSeedMix: number): number {
  // 6 pumps/second, deterministic cadence — no RNG used by the pump engine.
  let state = createBoldChaiPumpState();
  const start = 0;
  const intervalMs = 1000 / 6;
  for (let t = start; t < start + BOLD_CHAI_DURATION_MS; t += intervalMs) {
    state = pumpBoldChai(state, t).state;
  }
  return completeBoldChaiPump(state, start + BOLD_CHAI_DURATION_MS).freeSpinsAwarded;
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
    }
  } else if (result.doorbellPanic) {
    // UI shows the doorbell banner here; the session itself runs below only if freeSpinsAwarded > 0.
  } else if (result.boldChaiPump) {
    bonuses.boldChaiPump.encountered++;
    bonuses.boldChaiPump.played++;
    boldChaiSpinsAwarded = simulateBoldChaiPlayer(seed);
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
  }

  if (result.freeSpinsAwarded > 0) {
    if (result.doorbellPanic) {
      bonuses.doorbellPanic.encountered++;
      bonuses.doorbellPanic.played++;
      const session = runFreeSpinSession(mulberry32(nextSeed()), "doorbell_panic", BET_PER_LINE, result.freeSpinsAwarded);
      bonuses.doorbellPanic.freeSpinsPlayed += session.totalSpins;
      bonuses.doorbellPanic.win += session.totalWin;
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
      } else {
        const session = runFreeSpinSession(wheelRng, wedge, BET_PER_LINE, result.freeSpinsAwarded);
        wedgeBucket.freeSpinsPlayed += session.totalSpins;
        wedgeBucket.win += session.totalWin;
      }
      bonuses.fireflyFreeSpins.freeSpinsPlayed += wedgeBucket.freeSpinsPlayed;
    }
  }

  // UI: bold chai free spins run only when the ladder did NOT award spins this spin.
  if (result.freeSpinsAwarded === 0 && boldChaiSpinsAwarded > 0) {
    const session = runFreeSpinSession(mulberry32(nextSeed()), "chai_back", BET_PER_LINE, boldChaiSpinsAwarded, { allowChaiStorm: false });
    bonuses.boldChaiPump.freeSpinsPlayed += session.totalSpins;
    bonuses.boldChaiPump.win += session.totalWin;
  }

  if (treatJarSpins > 0) {
    bonuses.treatJar.encountered++;
    bonuses.treatJar.played++;
    const session = runFreeSpinSession(mulberry32(nextSeed()), "chai_back", BET_PER_LINE, treatJarSpins, { allowChaiStorm: false, allowRetriggers: false });
    bonuses.treatJar.freeSpinsPlayed += session.totalSpins;
    bonuses.treatJar.win += session.totalWin;
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
  bonuses.treatJar.win;

const totalFreeSpins =
  bonuses.fireflyFreeSpins.freeSpinsPlayed +
  bonuses.doorbellPanic.freeSpinsPlayed +
  bonuses.boldChaiPump.freeSpinsPlayed +
  bonuses.treatTimeMorning.freeSpinsPlayed +
  bonuses.treatTimeNighttime.freeSpinsPlayed +
  bonuses.uniglee.freeSpinsPlayed +
  bonuses.treatJar.freeSpinsPlayed;

const totalWin = baseWin + bonusWin;

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
  bonuses,
}, null, 2));
