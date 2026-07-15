/**
 * Free spins & the AskJamie Wheel. Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §7.
 * The wheel picks one standard modifier; the Doorbell Panic bonus enters here
 * directly with its own wild-flight modifier. Free spins reuse cascade.ts's
 * spin() with the modifier's effect layered on top — modifier math lives here,
 * not in the UI.
 */
import type { Grid, SpinResult, TreatTimeMode, TreatTimeWild, WildMultiplier } from "./types";
import { spin } from "./cascade";
import { PAYLINES } from "./paylines";
import { REELS, spinGrid } from "./reels";
import type { Rng } from "./rng";
import { emptyTreatJar } from "./features";
import { castTreatTimeWilds } from "./treattime";
import { applyKeepsakeZone, rollKeepsakeZone } from "./keepsake-constellation";
import {
  applyJoeyLaundryEffect,
  baseLaundryAllocation,
  rollJoeyLaundryEffect,
  type JoeyLaundryEffect,
  type LaundryRollConfig,
  type UniGleeAwardSpins,
  type UniGleeSubBonusBudget,
} from "./laundry";

export type WheelWedge =
  | "multiplying"
  | "giant_gnome"
  | "chai_back"
  | "doorbell_panic"
  | "treat_time_morning"
  | "treat_time_nighttime";

const WHEEL_WEIGHTS: Array<[WheelWedge, number]> = [
  ["multiplying", 40],
  ["giant_gnome", 35],
  ["chai_back", 25],
];

/** Spins the AskJamie wheel — one modifier per bonus (docs §7). */
export function spinWheel(rng: Rng): WheelWedge {
  const total = WHEEL_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let roll = rng() * total;
  for (const [wedge, w] of WHEEL_WEIGHTS) {
    if (roll < w) return wedge;
    roll -= w;
  }
  return WHEEL_WEIGHTS[0][0];
}

/**
 * We're Multiplying is rolled once for each counted free spin. A cascade is
 * part of that spin, so it never rolls or creates an additional marked wild.
 */
export function rollWildMultiplier(rng: Rng): WildMultiplier | undefined {
  const r = rng();
  if (r < 0.15) return undefined;
  if (r < 0.50) return 2;
  if (r < 0.80) return 3;
  if (r < 0.95) return 5;
  return 10;
}

/** Multiplier values are tied to their original reel positions (zero-based). */
const MULTIPLIER_REEL: Record<WildMultiplier, number> = { 2: 1, 3: 2, 5: 3, 10: 4 };

export interface MultiplierWild {
  multiplier: WildMultiplier;
  position: [reel: number, row: number];
}

/**
 * Guarantees the single visible multiplier wild on a qualifying opening
 * result. The cell carries its marker through gravity if it survives, but
 * fresh cascade drops never receive a marker.
 */
function multiplyingStartingGrid(rng: Rng, multiplier: WildMultiplier): { grid: Grid; multiplierWild: MultiplierWild } {
  const grid = spinGrid(rng, { includeDoorbells: false, includeBoldChaiPump: false });
  const reel = MULTIPLIER_REEL[multiplier];
  const row = Math.floor(rng() * grid[reel].length);
  grid[reel][row] = {
    symbol: rng() < 0.5 ? "wild_joey" : "wild_phoebe",
    multiplier,
  };
  return { grid, multiplierWild: { multiplier, position: [reel, row] } };
}

export interface FreeSpinRoundResult extends SpinResult {
  /** The one opening-result multiplier wild, if this counted spin rolled one. */
  multiplierWild?: MultiplierWild;
  extraWildsAdded: number; // We Want Our Chai Back
  panicWildsAdded: number;
  treatTimeWilds?: TreatTimeWild[];
  treatTimeMode?: TreatTimeMode;
  /** Opening-grid Joey Laundry Helper effect, when this round belongs to Joey's chapter. */
  laundryEffect?: JoeyLaundryEffect;
}

export interface JoeyLaundryRoundInput {
  blockIndex: number;
  roundOrdinal: number;
  config: LaundryRollConfig;
}

function panicStartingGrid(rng: Rng): { grid: Grid; wildsAdded: number } {
  const grid = spinGrid(rng, { includeDoorbells: false, includeBoldChaiPump: false });
  const occupied = new Set<string>();
  const count = 3 + Math.floor(rng() * 4); // 3-6 cats, every round feels berserk

  for (let i = 0; i < count; i++) {
    const line = PAYLINES[Math.floor(rng() * PAYLINES.length)];
    let reel = Math.floor(rng() * REELS);
    let row = line[reel];
    let key = `${reel}:${row}`;
    let attempts = 0;
    while (occupied.has(key) && attempts < 10) {
      reel = Math.floor(rng() * REELS);
      row = line[reel];
      key = `${reel}:${row}`;
      attempts++;
    }
    occupied.add(key);
    grid[reel][row] = { symbol: i % 2 === 0 ? "wild_joey" : "wild_phoebe" };
  }

  return { grid, wildsAdded: occupied.size };
}

/** Runs one free-spin round with the chosen wedge's modifier applied. */
export function spinFreeRound(rng: Rng, wedge: WheelWedge, betPerLine: number): FreeSpinRoundResult {
  const panic = wedge === "doorbell_panic" ? panicStartingGrid(rng) : undefined;
  const multiplier = wedge === "multiplying" ? rollWildMultiplier(rng) : undefined;
  const multiplying = multiplier ? multiplyingStartingGrid(rng, multiplier) : undefined;
  const treatTimeMode: TreatTimeMode | undefined = wedge === "treat_time_morning"
    ? "morning"
    : wedge === "treat_time_nighttime"
      ? "nighttime"
      : undefined;
  const treatTime = treatTimeMode
    ? castTreatTimeWilds(rng, spinGrid(rng, { includeDoorbells: false, includeBoldChaiPump: false }), treatTimeMode)
    : undefined;
  const keepsakeZone = wedge === "giant_gnome" ? rollKeepsakeZone(rng) : undefined;
  const keepsakeGrid = keepsakeZone
    ? applyKeepsakeZone(spinGrid(rng, { includeDoorbells: false, includeBoldChaiPump: false }), keepsakeZone)
    : undefined;
  const base = spin({
    rng,
    betPerLine,
    treatJar: emptyTreatJar(),
    spinsSincePopIn: 999,
    startingGrid: panic?.grid ?? treatTime?.grid ?? multiplying?.grid ?? keepsakeGrid,
    keepsakeZone,
    allowDoorbells: false,
    includeBoldChaiPump: false,
    spinArea: "secondary",
    allowTreatTimeBonus: false,
  });
  const treatTimeMeta = treatTime
    ? { treatTimeWilds: treatTime.wilds, treatTimeMode }
    : {};

  if (wedge === "doorbell_panic") {
    return { ...base, ...treatTimeMeta, extraWildsAdded: 0, panicWildsAdded: panic?.wildsAdded ?? 0 };
  }

  if (treatTime) {
    return { ...base, ...treatTimeMeta, extraWildsAdded: 0, panicWildsAdded: 0 };
  }

  if (wedge === "multiplying") {
    return { ...base, ...treatTimeMeta, multiplierWild: multiplying?.multiplierWild, extraWildsAdded: 0, panicWildsAdded: 0 };
  }

  if (wedge === "chai_back") {
    // 1-3 extra wilds rain in — modeled as a flat coin bump scaled by how many
    // landed, since the visual "extra wilds" effect is UI-layer (docs §7).
    const extra = 1 + Math.floor(rng() * 3);
    const bonusWin = Math.round(base.totalWin * (0.08 * extra));
    return { ...base, ...treatTimeMeta, totalWin: base.totalWin + bonusWin, extraWildsAdded: extra, panicWildsAdded: 0 };
  }

  return { ...base, ...treatTimeMeta, extraWildsAdded: 0, panicWildsAdded: 0 };
}

/**
 * Resolves one Joey Laundry Helper counted round.
 *
 * Laundry is a chapter-local modifier: it preloads the opening grid, then
 * delegates payout, cascades, and ordinary retriggers to the shared cascade
 * engine. All other bonus triggers are suppressed so this round cannot nest
 * another bonus or leak a retrigger into a later chapter.
 */
export function spinJoeyLaundryRound(
  rng: Rng,
  betPerLine: number,
  input: JoeyLaundryRoundInput,
): FreeSpinRoundResult {
  const laundryEffect = rollJoeyLaundryEffect(rng, input.blockIndex, input.roundOrdinal, input.config);
  const startingGrid = applyJoeyLaundryEffect(
    spinGrid(rng, { includeDoorbells: false, includeBoldChaiPump: false }),
    laundryEffect,
  );
  const base = spin({
    rng,
    betPerLine,
    treatJar: emptyTreatJar(),
    spinsSincePopIn: 999,
    startingGrid,
    allowDoorbells: false,
    includeBoldChaiPump: false,
    spinArea: "secondary",
    allowTreatTimeBonus: false,
    allowUniGlee: false,
  });

  return {
    ...base,
    extraWildsAdded: 0,
    panicWildsAdded: 0,
    laundryEffect,
  };
}

export interface FreeSpinSessionResult {
  wedge: WheelWedge;
  rounds: FreeSpinRoundResult[];
  totalWin: number;
  bestCascade: number;
  retriggers: number;
}

export interface JoeyLaundrySessionResult {
  chapter: "joey_laundry_helper";
  budget: UniGleeSubBonusBudget;
  rounds: FreeSpinRoundResult[];
  totalWin: number;
  bestCascade: number;
  retriggers: number;
}

/**
 * Runs Joey's 25% UniGlee allocation as a chapter-local queue.
 *
 * This is intentionally not a UniGlee marathon runner. The parent owns the
 * global chapter order; this function only guarantees that Joey's allocation
 * and any spins earned by Joey are exhausted before it returns.
 */
export function runJoeyLaundrySession(
  rng: Rng,
  betPerLine: number,
  awardedSpins: UniGleeAwardSpins,
  config: LaundryRollConfig,
  blockIndex = 0,
): JoeyLaundrySessionResult {
  const initialAllocation = baseLaundryAllocation(awardedSpins);
  const budget: UniGleeSubBonusBudget = {
    initialAllocation,
    retriggerSpins: 0,
    remainingSpins: initialAllocation,
  };
  const rounds: FreeSpinRoundResult[] = [];
  let retriggers = 0;
  let totalWin = 0;
  let bestCascade = 0;
  let roundOrdinal = 0;

  while (budget.remainingSpins > 0) {
    budget.remainingSpins--;
    const round = spinJoeyLaundryRound(rng, betPerLine, {
      blockIndex,
      roundOrdinal,
      config,
    });
    roundOrdinal++;
    rounds.push(round);
    totalWin += round.totalWin;
    bestCascade = Math.max(bestCascade, round.cascades);
    if (round.freeSpinsAwarded > 0) {
      budget.retriggerSpins += round.freeSpinsAwarded;
      budget.remainingSpins += round.freeSpinsAwarded;
      retriggers++;
    }
  }

  return {
    chapter: "joey_laundry_helper",
    budget,
    rounds,
    totalWin,
    bestCascade,
    retriggers,
  };
}

/** Runs a full free-spin session: `spinsRemaining` rounds, with retriggers via the same ladder. */
export function runFreeSpinSession(
  rng: Rng,
  wedge: WheelWedge,
  betPerLine: number,
  spinsAwarded: number,
): FreeSpinSessionResult {
  let remaining = spinsAwarded;
  const rounds: FreeSpinRoundResult[] = [];
  let retriggers = 0;
  let totalWin = 0;
  let bestCascade = 0;

  while (remaining > 0) {
    remaining--;
    const round = spinFreeRound(rng, wedge, betPerLine);
    rounds.push(round);
    totalWin += round.totalWin;
    bestCascade = Math.max(bestCascade, round.cascades);
    if (round.freeSpinsAwarded > 0) {
      remaining += round.freeSpinsAwarded;
      retriggers++;
    }
  }

  return { wedge, rounds, totalWin, bestCascade, retriggers };
}

export function wheelWedgeLabel(wedge: WheelWedge): string {
  switch (wedge) {
    case "multiplying":
      return "We're Multiplying";
    case "giant_gnome":
      return "Keepsake Constellation";
    case "chai_back":
      return "Iced Chai Wild Rain";
    case "doorbell_panic":
      return "Doorbell Panic";
    case "treat_time_morning":
      return "Morning Treat Time";
    case "treat_time_nighttime":
      return "Nighttime Treat Time";
  }
}

export type { Grid };
