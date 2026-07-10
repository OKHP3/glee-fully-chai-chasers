/**
 * Free spins & the AskJamie Wheel. Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §7.
 * The wheel picks one modifier; free spins reuse cascade.ts's spin() with the
 * modifier's effect layered on top (wilds carry multipliers, mega-symbols,
 * or extra wilds rain in) — modifier math lives here, not in the UI.
 */
import type { Grid, SpinResult } from "./types";
import { spin } from "./cascade";
import { isWild } from "./paylines";
import type { Rng } from "./rng";
import { emptyTreatJar } from "./features";

export type WheelWedge = "multiplying" | "giant_gnome" | "chai_back";

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
}

/** Runs one free-spin round with the chosen wedge's modifier applied. */
export function spinFreeRound(rng: Rng, wedge: WheelWedge, betPerLine: number): FreeSpinRoundResult {
  const base = spin({ rng, betPerLine, treatJar: emptyTreatJar(), spinsSincePopIn: 999 });

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
    return { ...base, totalWin: base.totalWin + bonusWin, wildMultipliers, twelvePumps, extraWildsAdded: 0 };
  }

  if (wedge === "chai_back") {
    // 1-3 extra wilds rain in — modeled as a flat coin bump scaled by how many
    // landed, since the visual "extra wilds" effect is UI-layer (docs §7).
    const extra = 1 + Math.floor(rng() * 3);
    const bonusWin = Math.round(base.totalWin * (0.08 * extra));
    return { ...base, totalWin: base.totalWin + bonusWin, twelvePumps: false, extraWildsAdded: extra };
  }

  // giant_gnome: 2x2 mega-symbols on reels 2-3/4-5 — modeled as a flat uplift
  // representative of the extra matching real slots see from mega-symbol locks.
  const bonusWin = Math.round(base.totalWin * 0.15);
  return { ...base, totalWin: base.totalWin + bonusWin, twelvePumps: false, extraWildsAdded: 0 };
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
      return "Giant Gnome Mode";
    case "chai_back":
      return "We Want Our Chai Back";
  }
}

export type { Grid };
