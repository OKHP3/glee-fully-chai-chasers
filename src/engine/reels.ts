/**
 * Reel strips — fixed circular tapes per reel, sampled by uniform stop index.
 * Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §4-§6.
 *
 * Real reel strips (not per-cell random draws): each reel is a fixed-order
 * tape ~70-90 symbols long. A spin picks one random stop per reel and reads
 * ROWS consecutive symbols (wrapping). Saucer-cat wilds are placed on the
 * tapes as contiguous runs of 6-7 (docs §5) so stacking is a natural
 * consequence of window position, not a special case. UniGlee is NOT a strip
 * symbol (docs §5 — "a legend, not a line symbol"); it's gated separately in
 * cascade.ts as a per-spin event at ~1/400.
 */
import type { Cell, Grid, HandbagWildMultiplier, SymbolId } from "./types";
import type { Rng } from "./rng";

export const REELS = 5;
export const ROWS = 4;

/** Doorbells use independent reel-specific appearance rates. */
export const DOORBELL_REEL_ONE_RATE = 1 / 17;
export const DOORBELL_REEL_TWO_RATE = 1 / 30;

/** Bold Chai Pump uses its own base-game blocker rolls. */
export const BOLD_CHAI_REEL_ONE_RATE = 1 / 17;
export const BOLD_CHAI_REEL_TWO_RATE = 1 / 30;

/** Most handbag landings stay special, but this gate keeps the multiplier rare. */
export const HANDBAG_WILD_LAND_RATE = 0.85;

export interface SpinGridOptions {
  /** Bonus screens suppress Doorbell landings as well. */
  includeDoorbells?: boolean;
  /** Bonus screens suppress the Bold Chai Pump landing event entirely. */
  includeBoldChaiPump?: boolean;
}

function repeat(symbol: SymbolId, count: number): SymbolId[] {
  return new Array(count).fill(symbol) as SymbolId[];
}

/** Interleaves segments round-robin so identical symbols don't clump end-to-end. */
function interleave(segments: SymbolId[][]): SymbolId[] {
  const out: SymbolId[] = [];
  const max = Math.max(...segments.map((s) => s.length));
  for (let i = 0; i < max; i++) {
    for (const seg of segments) if (seg[i]) out.push(seg[i]);
  }
  return out;
}

/** Base pay-symbol counts, shared shape across reels, gently tuned by reel index. */
function baseSegments(reelIndex: number): SymbolId[][] {
  // Higher reel index = slightly looser (classic "hero lands late" feel) —
  // kept subtle; overall RTP is tuned via these counts + paytable together.
  const tight = reelIndex <= 1;
  return [
    repeat("tumbler", tight ? 2 : 3),
    repeat("butterfly", tight ? 3 : 4),
    repeat("mixtape", 4),
    repeat("crystal", 5),
    repeat("chai", 6),
    repeat("candle", 6),
    repeat("cassette", 9),
    repeat("gnome", 9),
    repeat("mailbox", 16),
    repeat("vhs", 16),
    repeat("teapot", 16),
    repeat("yarn", 16),
  ];
}

/** Treats only appear on reels 1/3/5 (index 0, 2, 4) — docs §6. */
function treatSegments(): SymbolId[][] {
  return [repeat("treat_chicken", 5), repeat("treat_salmon", 4), repeat("treat_bougie", 2)];
}

/**
 * Saucer-cat wild stacks — placed as contiguous 5-6 runs on reels 2-4
 * and 6-high on reel 5
 * (index 1-4), per docs §5. Two stacks per wild per reel keeps them rare
 * enough to feel special while making cascade chains/free-spin ladder
 * reachable (a single stack landing fully in view spans most of the window).
 */
function wildStackSegments(reelIndex: number): SymbolId[][] {
  if (reelIndex < 1) return [];
  const sizes: Record<number, [number, number]> = {
    1: [5, 6],
    2: [5, 6],
    3: [5, 6],
    4: [6, 6],
  };
  const [a, b] = sizes[reelIndex] ?? [6, 6];
  return [repeat("wild_joey", a), repeat("wild_phoebe", b)];
}

/** One exceptionally rare, non-cat handbag wild on the final reel. */
function handbagWildSegments(reelIndex: number): SymbolId[][] {
  if (reelIndex !== 4) return [];
  return [repeat("wild_handbag", 1)];
}

/** Builds the fixed circular strip for a given reel index (0-based). */
export function buildStrip(reelIndex: number): SymbolId[] {
  const segments = [...baseSegments(reelIndex)];
  if (reelIndex === 0 || reelIndex === 2 || reelIndex === 4) segments.push(...treatSegments());
  const strip = interleave(segments);
  const wildSegs = wildStackSegments(reelIndex);
  // Wild stacks are appended as literal contiguous blocks (not interleaved) so
  // they land as true 6-7-high runs on the tape.
  for (const seg of wildSegs) strip.push(...seg);
  for (const seg of handbagWildSegments(reelIndex)) strip.push(...seg);
  return strip;
}

const STRIPS: SymbolId[][] = Array.from({ length: REELS }, (_, i) => buildStrip(i));

export function stripFor(reelIndex: number): SymbolId[] {
  return STRIPS[reelIndex];
}

function randomStop(rng: Rng, len: number): number {
  return Math.floor(rng() * len);
}

/** Draws a single fresh symbol for a reel by uniformly sampling its strip. */
function drawSymbol(rng: Rng, reelIndex: number): SymbolId {
  const strip = STRIPS[reelIndex];
  return strip[randomStop(rng, strip.length)];
}

/** Reads ROWS consecutive symbols from a reel's strip starting at `stop` (wrapping). */
function rollHandbagMultiplier(rng: Rng): HandbagWildMultiplier {
  const roll = rng();
  if (roll < 0.55) return 3;
  if (roll < 0.90) return 5;
  return 10;
}

function drawNonHandbagSymbol(rng: Rng, reelIndex: number): SymbolId {
  let symbol = drawSymbol(rng, reelIndex);
  while (symbol === "wild_handbag") symbol = drawSymbol(rng, reelIndex);
  return symbol;
}

function cellFrom(rng: Rng, reelIndex: number, symbol: SymbolId): Cell {
  if (symbol !== "wild_handbag") return { symbol };
  if (rng() >= HANDBAG_WILD_LAND_RATE) return cellFrom(rng, reelIndex, drawNonHandbagSymbol(rng, reelIndex));
  return { symbol, handbagMultiplier: rollHandbagMultiplier(rng) };
}

function windowFrom(rng: Rng, reelIndex: number, stop: number): Cell[] {
  const strip = STRIPS[reelIndex];
  const len = strip.length;
  const column: Cell[] = [];
  for (let row = 0; row < ROWS; row++) {
    column.push(cellFrom(rng, reelIndex, strip[(stop + row) % len]));
  }
  return column;
}

type BlockerFamily = "none" | "doorbell" | "chai_pump";

function selectBlockerFamily(rng: Rng, includeDoorbells: boolean, includeBoldChaiPump: boolean): {
  family: BlockerFamily;
  doorbellReelOne: boolean;
  doorbellReelTwo: boolean;
  pumpReelOne: boolean;
  pumpReelTwo: boolean;
} {
  const doorbellReelOne = includeDoorbells && rng() < DOORBELL_REEL_ONE_RATE;
  const doorbellReelTwo = includeDoorbells && rng() < DOORBELL_REEL_TWO_RATE;
  const pumpReelOne = includeBoldChaiPump && rng() < BOLD_CHAI_REEL_ONE_RATE;
  const pumpReelTwo = includeBoldChaiPump && rng() < BOLD_CHAI_REEL_TWO_RATE;
  const family = doorbellReelOne || doorbellReelTwo
    ? "doorbell"
    : pumpReelOne || pumpReelTwo
      ? "chai_pump"
      : "none";
  return { family, doorbellReelOne, doorbellReelTwo, pumpReelOne, pumpReelTwo };
}

function placeBlocker(grid: Grid, reel: number, symbol: "doorbell" | "chai_pump", rng: Rng): void {
  const row = Math.floor(rng() * ROWS);
  grid[reel][row] = { symbol };
}

/** Draws a fresh REELS x ROWS grid. grid[reel][row], row 0 = top. */
export function spinGrid(rng: Rng, options: SpinGridOptions = {}): Grid {
  const grid: Grid = [];
  for (let reel = 0; reel < REELS; reel++) {
    const stop = randomStop(rng, STRIPS[reel].length);
    grid.push(windowFrom(rng, reel, stop));
  }

  const selection = selectBlockerFamily(rng, options.includeDoorbells !== false, options.includeBoldChaiPump !== false);
  if (selection.family === "doorbell") {
    if (selection.doorbellReelOne) placeBlocker(grid, 0, "doorbell", rng);
    if (selection.doorbellReelTwo) placeBlocker(grid, 1, "doorbell", rng);
  } else if (selection.family === "chai_pump") {
    if (selection.pumpReelOne) placeBlocker(grid, 0, "chai_pump", rng);
    if (selection.pumpReelTwo) placeBlocker(grid, 1, "chai_pump", rng);
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
    fresh.push(cellFrom(rng, reelIndex, drawSymbol(rng, reelIndex)));
  }
  return [...fresh, ...survivors];
}

/** Exposed for tuning/tests: draws one symbol per current strip weighting. */
export function drawSingle(rng: Rng, reelIndex: number): SymbolId {
  return drawSymbol(rng, reelIndex);
}
