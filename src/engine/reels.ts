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
import type { Cell, Grid, SymbolId } from "./types";
import type { Rng } from "./rng";

export const REELS = 5;
export const ROWS = 4;

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
  return [repeat("treat_chicken", 5), repeat("treat_salmon", 4), repeat("treat_boogie", 2)];
}

/**
 * Saucer-cat wild stacks — placed as contiguous 6-7 runs on reels 2-5
 * (index 1-4), per docs §5. Two stacks per wild per reel keeps them rare
 * enough to feel special while making cascade chains/free-spin ladder
 * reachable (a single stack landing fully in view spans most of the window).
 */
function wildStackSegments(reelIndex: number): SymbolId[][] {
  if (reelIndex < 1) return [];
  const sizes: Record<number, [number, number]> = {
    1: [6, 6],
    2: [6, 7],
    3: [6, 7],
    4: [7, 7],
  };
  const [a, b] = sizes[reelIndex] ?? [6, 6];
  return [repeat("wild_joey", a), repeat("wild_phoebe", b)];
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
function windowFrom(reelIndex: number, stop: number): Cell[] {
  const strip = STRIPS[reelIndex];
  const len = strip.length;
  const column: Cell[] = [];
  for (let row = 0; row < ROWS; row++) {
    column.push({ symbol: strip[(stop + row) % len] });
  }
  return column;
}

/** Draws a fresh REELS x ROWS grid. grid[reel][row], row 0 = top. */
export function spinGrid(rng: Rng): Grid {
  const grid: Grid = [];
  for (let reel = 0; reel < REELS; reel++) {
    const stop = randomStop(rng, STRIPS[reel].length);
    grid.push(windowFrom(reel, stop));
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

/** Exposed for tuning/tests: draws one symbol per current strip weighting. */
export function drawSingle(rng: Rng, reelIndex: number): SymbolId {
  return drawSymbol(rng, reelIndex);
}
