/**
 * Cascade loop: evaluate 25 lines -> remove winners -> gravity refill ->
 * repeat to a dead board. Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §5.
 *
 * Round 2: real reel strips w/ wild stacking (reels.ts), UniGlee gated as a
 * per-spin event (not a strip symbol), and specialty wilds (Sparkle Sort /
 * Drop-In Saucer / Double Sparkle / Facts-on-Facts) queued off wild line wins
 * with exactly one firing per dead board, per docs §5.
 */
import type { CascadeStep, Grid, SpecialtyWild, SpinResult, SymbolId, TreatKind } from "./types";
import { FREE_SPIN_LADDER } from "./types";
import { REELS, ROWS, cascadeColumn, spinGrid, stripFor } from "./reels";
import { evaluateLines, isWild } from "./paylines";
import { rollCatVisit, type TreatJar } from "./features";
import type { Rng } from "./rng";

const TREAT_SYMBOL_TO_KIND: Record<string, TreatKind> = {
  treat_chicken: "chicken",
  treat_salmon: "salmon",
  treat_boogie: "boogie",
};

/** ~1/400 per spin (docs §5) — a legend, not a line symbol. */
export const UNIGLEE_RATE = 1 / 400;

/** Chance a wild participating in a line win queues a specialty (tuned for §4 mega-cascade band). */
const SPECIALTY_TRIGGER_CHANCE = 0.05;
const SPECIALTY_WEIGHTS: Array<[SpecialtyWild, number]> = [
  ["sparkle_sort", 50],
  ["drop_in", 30],
  ["double_sparkle", 12],
  ["facts_on_facts", 8],
];

function pickSpecialty(rng: Rng): SpecialtyWild {
  const total = SPECIALTY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let roll = rng() * total;
  for (const [kind, w] of SPECIALTY_WEIGHTS) {
    if (roll < w) return kind;
    roll -= w;
  }
  return SPECIALTY_WEIGHTS[0][0];
}

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

/** Highest ladder tier reached at or below `cascades`, or 0 if none. */
export function freeSpinsForCascades(cascades: number): number {
  let awarded = 0;
  for (const [tier, spins] of Object.entries(FREE_SPIN_LADDER)) {
    if (cascades >= Number(tier)) awarded = Math.max(awarded, spins);
  }
  return awarded;
}

const NEVER_SHATTER: SymbolId[] = ["uniglee", "wild_joey", "wild_phoebe"];

/** Sparkle Sort: 5-11 random non-wild/non-scatter cells shatter -> forced cascade. */
function applySparkleSort(rng: Rng, grid: Grid): { grid: Grid; positions: Array<[number, number]> } {
  const candidates: Array<[number, number]> = [];
  grid.forEach((column, reel) => {
    column.forEach((cell, row) => {
      if (!NEVER_SHATTER.includes(cell.symbol)) candidates.push([reel, row]);
    });
  });
  const count = Math.min(candidates.length, 5 + Math.floor(rng() * 7)); // 5-11
  const chosen: Array<[number, number]> = [];
  const pool = [...candidates];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  const removedByReel: Set<number>[] = Array.from({ length: REELS }, () => new Set<number>());
  for (const [reel, row] of chosen) removedByReel[reel].add(row);
  const nextGrid: Grid = grid.map((column, reel) => cascadeColumn(rng, reel, column, removedByReel[reel]));
  return { grid: nextGrid, positions: chosen };
}

/** Drop-In Saucer: a reel shifts so a full wild stack crowns it (docs §5). */
function applyDropIn(rng: Rng, grid: Grid): Grid {
  const reel = 1 + Math.floor(rng() * (REELS - 1)); // reels 2-5 (index 1-4)
  const wild: SymbolId = rng() < 0.5 ? "wild_joey" : "wild_phoebe";
  const strip = stripFor(reel);
  const column = grid[reel].map((cell) => ({ symbol: strip.length ? wild : cell.symbol }));
  return grid.map((col, i) => (i === reel ? column : col));
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
  const unigleeTriggered = rng() < UNIGLEE_RATE;

  let totalWin = 0;
  let cascades = 0;
  let doubleSparkleActive = false;
  const queue: SpecialtyWild[] = [];

  if (unigleeTriggered) {
    // "The full package": Double Sparkle + Facts-on-Facts + Drop-In Saucer + 3 queued Sparkle Sorts.
    queue.push("drop_in", "facts_on_facts", "sparkle_sort", "sparkle_sort", "sparkle_sort");
    doubleSparkleActive = true;
    grid = applyDropIn(rng, grid);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const wins = evaluateLines(grid, betPerLine);

    if (wins.length === 0) {
      if (queue.length > 0) {
        const specialty = queue.shift() as SpecialtyWild;
        if (specialty === "sparkle_sort") {
          const { grid: shattered, positions } = applySparkleSort(rng, grid);
          cascades++;
          steps.push({ grid, wins: [], meterAfter: cascades, specialtyAwarded: [specialty], blastPositions: positions });
          grid = shattered;
          continue;
        }
        if (specialty === "drop_in") {
          const dropped = applyDropIn(rng, grid);
          steps.push({ grid: dropped, wins: [], meterAfter: cascades, specialtyAwarded: [specialty] });
          grid = dropped;
          continue;
        }
        // double_sparkle / facts_on_facts are ladder/coin modifiers, not board mutations — record and move on.
        steps.push({ grid, wins: [], meterAfter: cascades, specialtyAwarded: [specialty] });
        continue;
      }
      steps.push({ grid, wins: [], meterAfter: cascades, specialtyAwarded: [] });
      break;
    }

    cascades++;
    totalWin += wins.reduce((sum, w) => sum + w.payout, 0);

    const specialtyAwarded: SpecialtyWild[] = [];
    for (const win of wins) {
      const hasWild = win.positions.some(([reel, row]) => isWild(grid[reel][row].symbol));
      if (hasWild && rng() < SPECIALTY_TRIGGER_CHANCE) {
        const kind = pickSpecialty(rng);
        queue.push(kind);
        specialtyAwarded.push(kind);
      }
    }

    const removedByReel: Set<number>[] = Array.from({ length: REELS }, () => new Set<number>());
    for (const win of wins) {
      for (const [reel, row] of win.positions) {
        removedByReel[reel].add(row);
      }
    }

    const nextGrid: Grid = grid.map((column, reel) => cascadeColumn(rng, reel, column, removedByReel[reel]));

    steps.push({ grid, wins, meterAfter: cascades, specialtyAwarded });
    grid = nextGrid;
  }

  const catVisit = rollCatVisit(rng, treatJar, spinsSincePopIn);
  const ladderAward = freeSpinsForCascades(cascades);
  const doubleSparkleApplied = doubleSparkleActive && ladderAward > 0;
  const freeSpinsAwarded = doubleSparkleApplied ? ladderAward * 2 : ladderAward;

  return {
    steps,
    totalWin,
    cascades,
    freeSpinsAwarded,
    doubleSparkleApplied,
    catVisit,
    unigleeTriggered,
    treatsCollected,
  };
}

export { ROWS, REELS };
