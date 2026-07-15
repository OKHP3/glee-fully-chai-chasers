/**
 * Cascade loop: evaluate 40 lines -> remove winners -> gravity refill ->
 * repeat to a dead board. Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §5.
 *
 * Round 2: real reel strips w/ wild stacking (reels.ts), UniGlee gated as a
 * per-spin event (not a strip symbol), and specialty wilds (Sparkle Sort /
 * Drop-In Saucer / Double Sparkle / Facts-on-Facts) queued off wild line wins
 * with exactly one firing per dead board, per docs §5.
 */
import type { CascadeStep, Grid, KeepsakeZone, SpecialtyWild, SpinArea, SpinResult, StickyWild, SymbolId, TreatKind, TreatTimeMode } from "./types";
import { FREE_SPIN_LADDER } from "./types";
import { REELS, ROWS, cascadeColumn, drawSingle, spinGrid, stripFor } from "./reels";
import { evaluateLines, findBoldChaiTrigger, findDoorbellTrigger, isWild } from "./paylines";
import { rollCatVisit, type TreatJar } from "./features";
import { rollTreatTimeTrigger } from "./treattime";
import type { Rng } from "./rng";
import { applyKeepsakeZone, cloneKeepsakeZone, isKeepsakePosition, rollKeepsakeSymbol } from "./keepsake-constellation";

const TREAT_SYMBOL_TO_KIND: Record<string, TreatKind> = {
  treat_chicken: "chicken",
  treat_salmon: "salmon",
  treat_bougie: "bougie",
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

const NEVER_SHATTER: SymbolId[] = ["uniglee", "wild_joey", "wild_phoebe", "doorbell", "chai_pump"];
const PERSISTENT_BLOCKERS: SymbolId[] = ["doorbell", "chai_pump"];

/** Sparkle Sort: 5-11 random non-wild/non-scatter cells shatter -> forced cascade. */
function applySparkleSort(rng: Rng, grid: Grid, keepsakeZone?: KeepsakeZone): { grid: Grid; positions: Array<[number, number]> } {
  const candidates: Array<[number, number]> = [];
  grid.forEach((column, reel) => {
    column.forEach((cell, row) => {
      if (!NEVER_SHATTER.includes(cell.symbol) && !isKeepsakePosition(keepsakeZone, reel, row)) candidates.push([reel, row]);
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
  const nextGrid = cascadeGrid(rng, grid, removedByReel, keepsakeZone);
  return { grid: nextGrid, positions: chosen };
}

/** Drop-In Saucer: a reel shifts so a full wild stack crowns it (docs §5). */
function applyDropIn(rng: Rng, grid: Grid, keepsakeZone?: KeepsakeZone): Grid {
  const reel = 1 + Math.floor(rng() * (REELS - 1)); // reels 2-5 (index 1-4)
  const wild: SymbolId = rng() < 0.5 ? "wild_joey" : "wild_phoebe";
  const strip = stripFor(reel);
  const column = grid[reel].map((cell) => PERSISTENT_BLOCKERS.includes(cell.symbol)
    ? { ...cell }
    : cell.sticky
      ? { ...cell }
    : { symbol: strip.length ? wild : cell.symbol });
  const next = grid.map((col, i) => (i === reel ? column : col));
  return keepsakeZone ? applyKeepsakeZone(next, keepsakeZone) : next;
}

/**
 * Keeps the giant rectangle physically fixed while ordinary symbols fall in
 * the independent spaces above and below it.
 */
function cascadeColumnAroundKeepsake(
  rng: Rng,
  reel: number,
  column: Grid[number],
  removedRows: Set<number>,
  zone: KeepsakeZone,
): Grid[number] {
  if (!isKeepsakePosition(zone, reel, zone.topRow)) return cascadeColumn(rng, reel, column, removedRows);

  const next: Grid[number] = Array.from({ length: ROWS }, () => ({ symbol: "tumbler" }));
  const locked = new Set<number>();
  for (let row = zone.topRow; row < zone.topRow + zone.height; row++) {
    locked.add(row);
    next[row] = { symbol: zone.symbol };
  }

  const fillSegment = (start: number, end: number): void => {
    const rows = Array.from({ length: end - start }, (_, index) => start + index);
    const survivors = rows.filter((row) => !removedRows.has(row)).map((row) => ({ ...column[row] }));
    const fresh = Array.from({ length: rows.length - survivors.length }, () => ({ symbol: drawSingle(rng, reel) }));
    [...fresh, ...survivors].forEach((cell, index) => { next[start + index] = cell; });
  };

  let start = 0;
  while (start < ROWS) {
    while (start < ROWS && locked.has(start)) start++;
    const end = start;
    while (start < ROWS && !locked.has(start)) start++;
    if (end < start) fillSegment(end, start);
  }
  return next;
}

function cascadeColumnAroundStickyWilds(
  rng: Rng,
  reel: number,
  column: Grid[number],
  removedRows: Set<number>,
  stickyRows: Set<number>,
): Grid[number] {
  if (stickyRows.size === 0) return cascadeColumn(rng, reel, column, removedRows);

  const next: Grid[number] = Array.from({ length: ROWS }, () => ({ symbol: "tumbler" }));
  stickyRows.forEach((row) => {
    next[row] = { ...column[row], sticky: "lap_quest" };
  });

  const fillSegment = (start: number, end: number): void => {
    const rows = Array.from({ length: end - start }, (_, index) => start + index);
    const survivors = rows.filter((row) => !removedRows.has(row)).map((row) => ({ ...column[row] }));
    const fresh = Array.from({ length: rows.length - survivors.length }, () => ({ symbol: drawSingle(rng, reel) }));
    [...fresh, ...survivors].forEach((cell, index) => { next[start + index] = cell; });
  };

  let segmentStart = 0;
  while (segmentStart < ROWS) {
    while (segmentStart < ROWS && stickyRows.has(segmentStart)) segmentStart++;
    const segmentEnd = segmentStart;
    while (segmentStart < ROWS && !stickyRows.has(segmentStart)) segmentStart++;
    if (segmentEnd < segmentStart) fillSegment(segmentEnd, segmentStart);
  }

  return next;
}

function cloneStickyWilds(stickyWilds: StickyWild[] | undefined): StickyWild[] | undefined {
  return stickyWilds?.map((wild) => ({ ...wild, position: [...wild.position] as [number, number] }));
}

function applyStickyWilds(grid: Grid, stickyWilds: StickyWild[] | undefined): Grid {
  if (!stickyWilds?.length) return grid;
  const next = grid.map((column) => column.map((cell) => ({ ...cell })));
  for (const wild of stickyWilds) {
    const [reel, row] = wild.position;
    next[reel][row] = { symbol: wild.symbol, sticky: wild.sticky };
  }
  return next;
}

function cascadeGrid(
  rng: Rng,
  grid: Grid,
  removedByReel: Set<number>[],
  keepsakeZone?: KeepsakeZone,
  stickyWilds?: StickyWild[],
): Grid {
  return grid.map((column, reel) => keepsakeZone
    ? cascadeColumnAroundKeepsake(rng, reel, column, removedByReel[reel], keepsakeZone)
    : cascadeColumnAroundStickyWilds(
      rng,
      reel,
      column,
      removedByReel[reel],
      new Set((stickyWilds ?? []).filter((wild) => wild.position[0] === reel).map((wild) => wild.position[1])),
    )
  );
}

export interface SpinInput {
  rng: Rng;
  betPerLine: number;
  treatJar: TreatJar;
  spinsSincePopIn: number;
  /** Optional preloaded board used by free-spin modifiers. */
  startingGrid?: Grid;
  /** Locked giant footprint for a single Keepsake Constellation free spin. */
  keepsakeZone?: KeepsakeZone;
  /** Bonus rounds suppress standard-spin-only doorbell events. */
  allowDoorbells?: boolean;
  /** Secondary screens suppress the main-spin-only Chai Pump event. */
  includeBoldChaiPump?: boolean;
  /** Treat Time is eligible only while resolving on the primary game board. */
  spinArea?: SpinArea;
  /** Additional opt-out for callers that intentionally suppress the feature. */
  allowTreatTimeBonus?: boolean;
  treatTimeMode?: TreatTimeMode | "either";
  /** Separate stream keeps the established cascade/RTP stream stable. */
  treatTimeRng?: Rng;
  /** Secondary chapter rounds suppress recursive UniGlee triggers. */
  allowUniGlee?: boolean;
  /** Fixed chapter wilds that survive the complete cascade chain. */
  stickyWilds?: StickyWild[];
}

export function rollDoorbellFreeSpins(rng: Rng): number {
  return 5 + Math.floor(rng() * 16);
}

/** Runs one full spin -> cascade-to-dead-board sequence. */
export function spin({
  rng,
  betPerLine,
  treatJar,
  spinsSincePopIn,
  startingGrid,
  keepsakeZone: inputKeepsakeZone,
  allowDoorbells = true,
  includeBoldChaiPump = true,
  spinArea = "main",
  allowTreatTimeBonus = true,
  treatTimeMode = "either",
  treatTimeRng,
  allowUniGlee = true,
  stickyWilds: inputStickyWilds,
}: SpinInput): SpinResult {
  let grid = startingGrid
    ? startingGrid.map((column) => column.map((cell) => ({ ...cell })))
    : spinGrid(rng, { includeDoorbells: allowDoorbells, includeBoldChaiPump });
  const stickyWilds = cloneStickyWilds(inputStickyWilds);
  grid = applyStickyWilds(grid, stickyWilds);
  const steps: CascadeStep[] = [];
  let keepsakeZone = cloneKeepsakeZone(inputKeepsakeZone);
  if (keepsakeZone) grid = applyKeepsakeZone(grid, keepsakeZone);
  const treatsCollected = collectTreats(grid);
  const unigleeTriggered = allowUniGlee && spinArea === "main" && rng() < UNIGLEE_RATE;

  let totalWin = 0;
  let cascades = 0;
  let doubleSparkleActive = false;
  const queue: SpecialtyWild[] = [];
  let doorbellPanic: SpinResult["doorbellPanic"];
  let boldChaiPump: SpinResult["boldChaiPump"];

  if (unigleeTriggered) {
    // "The full package": Double Sparkle + Facts-on-Facts + Drop-In Saucer + 3 queued Sparkle Sorts.
    queue.push("drop_in", "facts_on_facts", "sparkle_sort", "sparkle_sort", "sparkle_sort");
    doubleSparkleActive = true;
    grid = applyDropIn(rng, grid, keepsakeZone);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!doorbellPanic) {
      const trigger = findDoorbellTrigger(grid, 0);
      if (trigger) doorbellPanic = { ...trigger, freeSpinsAwarded: rollDoorbellFreeSpins(rng) };
    }
    if (!boldChaiPump) {
      const trigger = findBoldChaiTrigger(grid);
      if (trigger) boldChaiPump = trigger;
    }
    const wins = evaluateLines(grid, betPerLine).map((win) => {
      const multiplier = win.positions
        .map(([reel, row]) => grid[reel][row].multiplier)
        .find((value): value is NonNullable<typeof value> => value !== undefined);
      return multiplier
        ? { ...win, multiplier, payout: win.payout * multiplier }
        : win;
    });

    if (wins.length === 0) {
      if (queue.length > 0) {
        const specialty = queue.shift() as SpecialtyWild;
        if (specialty === "sparkle_sort") {
          const { grid: shattered, positions } = applySparkleSort(rng, grid, keepsakeZone);
          cascades++;
          steps.push({ grid, wins: [], meterAfter: cascades, specialtyAwarded: [specialty], blastPositions: positions, keepsakeZone: cloneKeepsakeZone(keepsakeZone), stickyWilds: cloneStickyWilds(stickyWilds) });
          grid = shattered;
          continue;
        }
        if (specialty === "drop_in") {
          const dropped = applyDropIn(rng, grid, keepsakeZone);
          steps.push({ grid: dropped, wins: [], meterAfter: cascades, specialtyAwarded: [specialty], keepsakeZone: cloneKeepsakeZone(keepsakeZone), stickyWilds: cloneStickyWilds(stickyWilds) });
          grid = dropped;
          continue;
        }
        // double_sparkle / facts_on_facts are ladder/coin modifiers, not board mutations — record and move on.
        steps.push({ grid, wins: [], meterAfter: cascades, specialtyAwarded: [specialty], keepsakeZone: cloneKeepsakeZone(keepsakeZone), stickyWilds: cloneStickyWilds(stickyWilds) });
        continue;
      }
      steps.push({ grid, wins: [], meterAfter: cascades, specialtyAwarded: [], keepsakeZone: cloneKeepsakeZone(keepsakeZone), stickyWilds: cloneStickyWilds(stickyWilds) });
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

    const giantWon = !!keepsakeZone && wins.some((win) => win.positions.some(([reel, row]) => isKeepsakePosition(keepsakeZone, reel, row)));
    const nextGrid = cascadeGrid(rng, grid, removedByReel, keepsakeZone, stickyWilds);

    steps.push({ grid, wins, meterAfter: cascades, specialtyAwarded, keepsakeZone: cloneKeepsakeZone(keepsakeZone), stickyWilds: cloneStickyWilds(stickyWilds) });
    if (giantWon && keepsakeZone) {
      keepsakeZone = { ...keepsakeZone, symbol: rollKeepsakeSymbol(rng, keepsakeZone.symbol) };
    }
    grid = keepsakeZone ? applyKeepsakeZone(nextGrid, keepsakeZone) : nextGrid;
  }

  const catVisit = rollCatVisit(rng, treatJar, spinsSincePopIn);
  const ladderAward = freeSpinsForCascades(cascades);
  // Keep this draw at the end of the spin so adding Treat Time does not
  // perturb the established cascade/RTP simulation stream.
  const treatTimeBonus = spinArea === "main" && allowTreatTimeBonus && treatTimeRng
    ? rollTreatTimeTrigger(treatTimeRng, treatTimeMode)
    : undefined;
  const doubleSparkleApplied = doubleSparkleActive && ladderAward > 0;
  const freeSpinsAwarded = doorbellPanic
    ? doorbellPanic.freeSpinsAwarded
    : doubleSparkleApplied
      ? ladderAward * 2
      : ladderAward;

  return {
    steps,
    // Payout tuning may use fractional internal values; awards remain whole
    // Glee-coins at the player-facing settlement boundary.
    totalWin: Math.round(totalWin),
    cascades,
    freeSpinsAwarded,
    doubleSparkleApplied,
    catVisit,
    unigleeTriggered,
    treatsCollected,
    doorbellPanic,
    boldChaiPump,
    treatTimeBonus,
    stickyWilds: cloneStickyWilds(stickyWilds),
  };
}

export { ROWS, REELS };
