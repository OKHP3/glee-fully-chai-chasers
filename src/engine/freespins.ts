/**
 * Free spins & the AskJamie Wheel. Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §7.
 * The wheel picks one standard modifier; the Doorbell Panic bonus enters here
 * directly with its own wild-flight modifier. Free spins reuse cascade.ts's
 * spin() with the modifier's effect layered on top — modifier math lives here,
 * not in the UI.
 */
import type { ChaiRainResult, Grid, SpinResult, TreatTimeMode, TreatTimeWild, WildMultiplier } from "./types";
import { spin } from "./cascade";
import { PAYLINES } from "./paylines";
import { REELS, spinGrid } from "./reels";
import type { Rng } from "./rng";
import { emptyTreatJar } from "./features";
import { castTreatTimeWilds } from "./treattime";
import { rollKeepsakeZone } from "./keepsake-constellation";
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
  | "keepsake_memory"
  | "keepsake_collection"
  | "chai_back"
  | "doorbell_panic"
  | "treat_time_morning"
  | "treat_time_nighttime";

const WHEEL_WEIGHTS: Array<[WheelWedge, number]> = [
  ["multiplying", 40],
  ["keepsake_memory", 35],
  ["chai_back", 25],
];

/** A successful memory bonus hands off to ordinary free spins without a wedge modifier. */
export type FreeSpinMode = "standard" | WheelWedge;

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

/** Converts every standard iced-chai cell on one opening board into a wild. */
export function convertChaiToWilds(grid: Grid): { grid: Grid; chaiRain: ChaiRainResult } {
  const nextGrid = grid.map((column) => column.map((cell) => ({ ...cell })));
  const wilds: ChaiRainResult["wilds"] = [];

  nextGrid.forEach((column, reel) => {
    column.forEach((cell, row) => {
      if (cell.symbol !== "chai") return;
      nextGrid[reel][row] = { symbol: "wild_chai" };
      wilds.push({ position: [reel, row], symbol: "wild_chai" });
    });
  });

  return { grid: nextGrid, chaiRain: { wilds } };
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
  extraWildsAdded: number;
  panicWildsAdded: number;
  treatTimeWilds?: TreatTimeWild[];
  treatTimeMode?: TreatTimeMode;
  /** Opening-grid Joey Laundry Helper effect, when this round belongs to Joey's chapter. */
  laundryEffect?: JoeyLaundryEffect;
  /** Present only on the first round of the actual Wild Chai Storm session. */
  chaiRain?: ChaiRainResult;
  /** Remaining spins in the session after this round. */
  spinsRemaining?: number;
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
export function spinFreeRound(
  rng: Rng,
  wedge: FreeSpinMode,
  betPerLine: number,
  options: { activateChaiStorm?: boolean } = {},
): FreeSpinRoundResult {
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
  const keepsakeZone = wedge === "keepsake_collection" ? rollKeepsakeZone(rng) : undefined;
  const chaiStorm = wedge === "chai_back" && options.activateChaiStorm !== false
    ? convertChaiToWilds(spinGrid(rng, { includeDoorbells: false, includeBoldChaiPump: false }))
    : undefined;
  const base = spin({
    rng,
    betPerLine,
    treatJar: emptyTreatJar(),
    spinsSincePopIn: 999,
    startingGrid: panic?.grid ?? treatTime?.grid ?? multiplying?.grid ?? chaiStorm?.grid,
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
    return { ...base, ...treatTimeMeta, extraWildsAdded: 0, multiplierWild: multiplying?.multiplierWild, panicWildsAdded: 0 };
  }

  if (wedge === "chai_back") {
    return { ...base, ...treatTimeMeta, extraWildsAdded: 0, panicWildsAdded: 0, chaiRain: chaiStorm?.chaiRain };
  }

  return { ...base, ...treatTimeMeta, extraWildsAdded: 0, panicWildsAdded: 0 };
}

/**
 * Resolves one Joey Laundry Helper counted round.
 *
 * Laundry is a chapter-local modifier: it preloads the opening grid, then
 * delegates payout and cascades to the shared cascade engine. All other bonus
 * triggers are suppressed, and retriggers are blocked engine-wide, so this
 * round can never nest another bonus or extend a later chapter.
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
  wedge: FreeSpinMode;
  mode: FreeSpinMode;
  rounds: FreeSpinRoundResult[];
  initialSpins: number;
  retriggerSpins: number;
  totalSpins: number;
  totalWin: number;
  bestCascade: number;
  retriggers: number;
  terminatedByCap: boolean;
}

export interface JoeyLaundrySessionResult {
  chapter: "joey_laundry_helper";
  budget: UniGleeSubBonusBudget;
  rounds: FreeSpinRoundResult[];
  totalWin: number;
  initialSpins: number;
  retriggerSpins: number;
  totalSpins: number;
  bestCascade: number;
  retriggers: number;
  terminatedByCap: boolean;
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
  maxTotalSpins = Number.MAX_SAFE_INTEGER,
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

  while (budget.remainingSpins > 0 && rounds.length < maxTotalSpins) {
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
    // Retriggers are blocked in all bonuses: Joey's chapter plays exactly its
    // initial allocation, no matter what the cascade ladder awards mid-round.
    rounds[rounds.length - 1] = { ...round, freeSpinsAwarded: 0 };
  }

  return {
    chapter: "joey_laundry_helper",
    budget,
    rounds,
    totalWin,
    initialSpins: initialAllocation,
    retriggerSpins: budget.retriggerSpins,
    totalSpins: initialAllocation + budget.retriggerSpins,
    bestCascade,
    retriggers,
    terminatedByCap: budget.remainingSpins > 0,
  };
}

export interface FreeSpinSessionOptions {
  /** Bold Chai reuses the legacy wedge ID but must not launch Wild Chai Storm. */
  allowChaiStorm?: boolean;
  /**
   * @deprecated Retriggers are now blocked in every bonus session (2026-07
   * RTP retune): in-bonus cascades never extend the session. The option is
   * kept only so legacy callers keep compiling; it has no effect.
   */
  allowRetriggers?: boolean;
  /** Marathon-only deterministic guard against an unbounded retrigger chain. */
  maxTotalSpins?: number;
}

/** Runs a full free-spin session: exactly `spinsAwarded` rounds; retriggers are blocked in all bonuses. */
export interface StandardFreeSpinSessionResult extends Omit<FreeSpinSessionResult, "wedge" | "mode"> {
  wedge: "standard";
  mode: "standard";
}
export function runFreeSpinSession(
  rng: Rng,
  wedge: WheelWedge,
  betPerLine: number,
  spinsAwarded: number,
  options?: FreeSpinSessionOptions,
): FreeSpinSessionResult;
export function runFreeSpinSession(
  rng: Rng,
  wedge: "standard",
  betPerLine: number,
  spinsAwarded: number,
  options?: FreeSpinSessionOptions,
): StandardFreeSpinSessionResult;

/** Runs a full free-spin session: exactly `spinsAwarded` rounds; retriggers are blocked in all bonuses. */
export function runFreeSpinSession(
  rng: Rng,
  wedge: FreeSpinMode,
  betPerLine: number,
  spinsAwarded: number,
  options: FreeSpinSessionOptions = {},
): FreeSpinSessionResult | StandardFreeSpinSessionResult {
  const initialSpins = Math.max(0, spinsAwarded);
  let remaining = initialSpins;
  const rounds: FreeSpinRoundResult[] = [];
  let retriggers = 0;
  let retriggerSpins = 0;
  let totalWin = 0;
  let bestCascade = 0;
  const maxTotalSpins = Math.max(initialSpins, options.maxTotalSpins ?? Number.MAX_SAFE_INTEGER);

  while (remaining > 0 && rounds.length < maxTotalSpins) {
    remaining--;
    const round = spinFreeRound(rng, wedge, betPerLine, {
      activateChaiStorm: options.allowChaiStorm !== false && rounds.length === 0,
    });
    totalWin += round.totalWin;
    bestCascade = Math.max(bestCascade, round.cascades);
    // Retriggers are blocked in all bonuses: cascade ladder awards earned
    // during a bonus round are zeroed and never extend the session.
    rounds.push({ ...round, freeSpinsAwarded: 0, spinsRemaining: remaining });
  }

  return {
    wedge,
    mode: wedge,
    rounds,
    initialSpins,
    retriggerSpins,
    totalSpins: rounds.length,
    totalWin,
    bestCascade,
    retriggers,
    terminatedByCap: remaining > 0,
  };
}

export function wheelWedgeLabel(wedge: WheelWedge): string {
  switch (wedge) {
    case "multiplying":
      return "We're Multiplying";
    case "keepsake_memory":
      return "Moonlit Keepsake Trail";
    case "keepsake_collection":
      return "Keepsake Collection";
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
