/**
 * Free spins & the AskJamie Wheel. Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §7.
 * The wheel picks one standard modifier; the Doorbell Panic bonus enters here
 * directly with its own wild-flight modifier. Free spins reuse cascade.ts's
 * spin() with the modifier's effect layered on top — modifier math lives here,
 * not in the UI.
 */
import type { Grid, SpinResult, TreatTimeMode, TreatTimeWild } from "./types";
import { spin } from "./cascade";
import { isWild } from "./paylines";
import { PAYLINES } from "./paylines";
import { REELS, spinGrid } from "./reels";
import type { Rng } from "./rng";
import { emptyTreatJar } from "./features";
import { castTreatTimeWilds } from "./treattime";

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

/** We're Multiplying: 2-5x common, 8x uncommon, 12x jackpot ("TWELVE PUMPS!"). */
export function rollWildMultiplier(rng: Rng): number {
  const r = rng();
  if (r < 0.02) return 12; // the jackpot callout — docs §7, canon "12 pumps"
  if (r < 0.14) return 8;
  const common = [2, 3, 4, 5];
  return common[Math.floor(rng() * common.length)];
}

export interface FreeSpinRoundResult extends SpinResult {
  wildMultipliers?: Array<[number, number, number]>; // [reel, row, multiplier] for We're Multiplying
  twelvePumps: boolean; // true if any wild landed the 12x jackpot this round
  extraWildsAdded: number; // We Want Our Chai Back
  panicWildsAdded: number;
  treatTimeWilds?: TreatTimeWild[];
  treatTimeMode?: TreatTimeMode;
}

function panicStartingGrid(rng: Rng): { grid: Grid; wildsAdded: number } {
  const grid = spinGrid(rng);
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
  const treatTimeMode: TreatTimeMode | undefined = wedge === "treat_time_morning"
    ? "morning"
    : wedge === "treat_time_nighttime"
      ? "nighttime"
      : undefined;
  const treatTime = treatTimeMode
    ? castTreatTimeWilds(rng, spinGrid(rng), treatTimeMode)
    : undefined;
  const base = spin({
    rng,
    betPerLine,
    treatJar: emptyTreatJar(),
    spinsSincePopIn: 999,
    startingGrid: panic?.grid ?? treatTime?.grid,
    allowTreatTimeBonus: false,
  });
  const treatTimeMeta = treatTime
    ? { treatTimeWilds: treatTime.wilds, treatTimeMode }
    : {};

  if (wedge === "doorbell_panic") {
    return { ...base, ...treatTimeMeta, twelvePumps: false, extraWildsAdded: 0, panicWildsAdded: panic?.wildsAdded ?? 0 };
  }

  if (treatTime) {
    return { ...base, ...treatTimeMeta, twelvePumps: false, extraWildsAdded: 0, panicWildsAdded: 0 };
  }

  if (wedge === "multiplying") {
    const finalGrid = base.steps[base.steps.length - 1].grid;
    const wildMultipliers: Array<[number, number, number]> = [];
    let twelvePumps = false;
    let bonusWin = 0;
    finalGrid.forEach((column, reel) => {
      column.forEach((cell, row) => {
        if (isWild(cell.symbol)) {
          const mult = rollWildMultiplier(rng);
          wildMultipliers.push([reel, row, mult]);
          if (mult === 12) twelvePumps = true;
        }
      });
    });
    // Multiplier applies to the total win this round (simplified: average of
    // wild multipliers found, min 1x if no wilds landed) — keeps math testable
    // without re-deriving per-line wild contribution.
    if (wildMultipliers.length > 0) {
      const avg = wildMultipliers.reduce((s, [, , m]) => s + m, 0) / wildMultipliers.length;
      bonusWin = Math.round(base.totalWin * (avg - 1));
    }
    return { ...base, ...treatTimeMeta, totalWin: base.totalWin + bonusWin, wildMultipliers, twelvePumps, extraWildsAdded: 0, panicWildsAdded: 0 };
  }

  if (wedge === "chai_back") {
    // 1-3 extra wilds rain in — modeled as a flat coin bump scaled by how many
    // landed, since the visual "extra wilds" effect is UI-layer (docs §7).
    const extra = 1 + Math.floor(rng() * 3);
    const bonusWin = Math.round(base.totalWin * (0.08 * extra));
    return { ...base, ...treatTimeMeta, totalWin: base.totalWin + bonusWin, twelvePumps: false, extraWildsAdded: extra, panicWildsAdded: 0 };
  }

  // Legacy giant_gnome ID: 2x2 mega-keepsakes on reels 2-3/4-5 — modeled as
  // a flat uplift. The ID stays stable until Claude performs a math-safe migration.
  const bonusWin = Math.round(base.totalWin * 0.15);
  return { ...base, ...treatTimeMeta, totalWin: base.totalWin + bonusWin, twelvePumps: false, extraWildsAdded: 0, panicWildsAdded: 0 };
}

export interface FreeSpinSessionResult {
  wedge: WheelWedge;
  rounds: FreeSpinRoundResult[];
  totalWin: number;
  bestCascade: number;
  retriggers: number;
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
