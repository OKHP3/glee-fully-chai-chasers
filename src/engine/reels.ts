/**
 * Reel strips — weighted symbol pools per reel position.
 * Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §4-§6.
 *
 * Vertical-slice note: wild "stacking" (6-7 high, docs §5) and true weighted
 * reel STRIPS (fixed-order symbol tapes) are simplified here to per-draw
 * weighted picks. This keeps math testable now; swapping in real strips
 * later does not change the public spin()/refillColumn() contract.
 */
import type { Cell, Grid, SymbolId } from "./types";
import { pickWeighted, type Rng } from "./rng";

export const REELS = 5;
export const ROWS = 4;

/** Base weights shared by every reel (non-treat, non-wild symbols). */
const BASE_WEIGHTS: Array<[SymbolId, number]> = [
  ["tumbler", 2],
  ["butterfly", 3],
  ["mixtape", 4],
  ["crystal", 5],
  ["chai", 6],
  ["candle", 6],
  ["cassette", 8],
  ["gnome", 8],
  ["mailbox", 10],
  ["vhs", 10],
  ["teapot", 10],
  ["yarn", 10],
];

/** Treats only appear on reels 1/3/5 (index 0, 2, 4) — docs §6. */
const TREAT_WEIGHTS: Array<[SymbolId, number]> = [
  ["treat_chicken", 6],
  ["treat_salmon", 5],
  ["treat_boogie", 2],
];

/** Saucer-cat wilds only appear on reels 2-5 (index 1-4) — docs §5. */
const WILD_WEIGHTS: Array<[SymbolId, number]> = [
  ["wild_joey", 3],
  ["wild_phoebe", 3],
];

/** UniGlee is vanishingly rare and can land on any reel — docs §5 (~1/400 spins overall). */
const UNIGLEE_WEIGHT: [SymbolId, number] = ["uniglee", 1];

/** Builds the weighted symbol pool for a given reel index (0-based). */
export function reelWeights(reelIndex: number): Array<[SymbolId, number]> {
  const weights = [...BASE_WEIGHTS, UNIGLEE_WEIGHT];
  if (reelIndex === 0 || reelIndex === 2 || reelIndex === 4) {
    weights.push(...TREAT_WEIGHTS);
  }
  if (reelIndex >= 1 && reelIndex <= 4) {
    weights.push(...WILD_WEIGHTS);
  }
  return weights;
}

function drawSymbol(rng: Rng, reelIndex: number): SymbolId {
  return pickWeighted(rng, reelWeights(reelIndex));
}

/** Draws a fresh REELS x ROWS grid. grid[reel][row], row 0 = top. */
export function spinGrid(rng: Rng): Grid {
  const grid: Grid = [];
  for (let reel = 0; reel < REELS; reel++) {
    const column: Cell[] = [];
    for (let row = 0; row < ROWS; row++) {
      column.push({ symbol: drawSymbol(rng, reel) });
    }
    grid.push(column);
  }
  return grid;
}

/**
 * Applies gravity to one column after removing winning cells (marked `null`
 * in `removed`), then refills the vacated top cells with fresh draws.
 * Returns a brand-new column; never mutates the input.
 */
export function cascadeColumn(
  rng: Rng,
  reelIndex: number,
  column: Cell[],
  removedRows: Set<number>,
): Cell[] {
  const survivors = column.filter((_, row) => !removedRows.has(row));
  const missing = column.length - survivors.length;
  const fresh: Cell[] = [];
  for (let i = 0; i < missing; i++) {
    fresh.push({ symbol: drawSymbol(rng, reelIndex) });
  }
  return [...fresh, ...survivors];
}
