/**
 * Cascade loop: evaluate 25 lines -> remove winners -> gravity refill ->
 * repeat to a dead board. Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §5.
 *
 * Vertical-slice note: specialty wilds (Sparkle Sort / Drop-In Saucer /
 * Double Sparkle / Facts-on-Facts queueing), the AskJamie wheel, and Chai
 * Tea Bonus are intentionally NOT implemented here yet — see
 * docs/REPLIT-HANDOFF.md for the follow-up list. This module delivers the
 * core loop tier-1 needs: cascades, meter, free-spin ladder lookup, treat
 * collection, UniGlee detection, and one cat pop-in roll per spin.
 */
import type { CascadeStep, Grid, SpinResult, TreatKind } from "./types";
import { FREE_SPIN_LADDER } from "./types";
import { REELS, ROWS, cascadeColumn, spinGrid } from "./reels";
import { evaluateLines } from "./paylines";
import { rollCatVisit, type TreatJar } from "./features";
import type { Rng } from "./rng";

const TREAT_SYMBOL_TO_KIND: Record<string, TreatKind> = {
  treat_chicken: "chicken",
  treat_salmon: "salmon",
  treat_boogie: "boogie",
};

function collectTreats(grid: Grid): TreatKind[] {
  const found: TreatKind[] = [];
  for (const column of grid) {
    for (const cell of column) {
      const kind = TREAT_SYMBOL_TO_KIND[cell.symbol];
      if (kind) found.push(kind);
    }
  }
  return found;
}

function hasUniglee(grid: Grid): boolean {
  return grid.some((column) => column.some((cell) => cell.symbol === "uniglee"));
}

/** Highest ladder tier reached at or below `cascades`, or 0 if none. */
export function freeSpinsForCascades(cascades: number): number {
  let awarded = 0;
  for (const [tier, spins] of Object.entries(FREE_SPIN_LADDER)) {
    if (cascades >= Number(tier)) awarded = Math.max(awarded, spins);
  }
  return awarded;
}

export interface SpinInput {
  rng: Rng;
  betPerLine: number;
  treatJar: TreatJar;
  spinsSincePopIn: number;
}

/** Runs one full spin -> cascade-to-dead-board sequence. */
export function spin({ rng, betPerLine, treatJar, spinsSincePopIn }: SpinInput): SpinResult {
  let grid = spinGrid(rng);
  const steps: CascadeStep[] = [];
  const treatsCollected = collectTreats(grid);
  const unigleeTriggered = hasUniglee(grid);
  let totalWin = 0;
  let cascades = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const wins = evaluateLines(grid, betPerLine);
    if (wins.length === 0) {
      steps.push({ grid, wins: [], meterAfter: cascades, specialtyAwarded: [] });
      break;
    }

    cascades++;
    totalWin += wins.reduce((sum, w) => sum + w.payout, 0);

    const removedByReel: Set<number>[] = Array.from({ length: REELS }, () => new Set<number>());
    for (const win of wins) {
      for (const [reel, row] of win.positions) {
        removedByReel[reel].add(row);
      }
    }

    const nextGrid: Grid = grid.map((column, reel) => cascadeColumn(rng, reel, column, removedByReel[reel]));

    steps.push({ grid, wins, meterAfter: cascades, specialtyAwarded: [] });
    grid = nextGrid;
  }

  const catVisit = rollCatVisit(rng, treatJar, spinsSincePopIn);

  return {
    steps,
    totalWin,
    cascades,
    freeSpinsAwarded: freeSpinsForCascades(cascades),
    catVisit,
    unigleeTriggered,
    treatsCollected,
  };
}

export { ROWS, REELS };
