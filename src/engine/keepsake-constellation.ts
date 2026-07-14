/**
 * Keepsake Constellation math. Pure TypeScript: no DOM imports.
 *
 * The bonus may contain one locked giant rectangle on reels 2–4. Its icon is
 * a normal paying symbol (with rare wilds), never a treat, Doorbell, UniGlee,
 * or any future non-paying trigger.
 */
import type { Grid, KeepsakeZone, SymbolId } from "./types";
import type { Rng } from "./rng";

export const KEEPSAKE_ZONE_WEIGHTS: ReadonlyArray<{
  width?: 2 | 3;
  height?: 2 | 3 | 4;
  weight: number;
}> = [
  { weight: 27 },
  { width: 2, height: 2, weight: 19 },
  { width: 2, height: 3, weight: 15 },
  { width: 2, height: 4, weight: 11 },
  { width: 3, height: 2, weight: 15 },
  { width: 3, height: 3, weight: 8 },
  { width: 3, height: 4, weight: 5 },
];

const STANDARD_KEEPSAKE_SYMBOLS: readonly SymbolId[] = [
  "tumbler", "butterfly", "mixtape", "crystal",
  "chai", "candle", "cassette", "gnome",
  "mailbox", "vhs", "teapot", "yarn",
];

/** Wild giant Keepsakes total 2% of icon selections: 1% for each cat. */
const KEEPSAKE_ICON_WEIGHTS: ReadonlyArray<readonly [SymbolId, number]> = [
  ...STANDARD_KEEPSAKE_SYMBOLS.map((symbol) => [symbol, 98 / STANDARD_KEEPSAKE_SYMBOLS.length] as const),
  ["wild_joey", 1],
  ["wild_phoebe", 1],
];

function weightedPick<T>(rng: Rng, entries: ReadonlyArray<readonly [T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  for (const [value, weight] of entries) {
    if (roll < weight) return value;
    roll -= weight;
  }
  return entries[entries.length - 1][0];
}

/** Rolls an eligible icon, optionally guaranteeing a change from `previous`. */
export function rollKeepsakeSymbol(rng: Rng, previous?: SymbolId): SymbolId {
  const eligible = previous
    ? KEEPSAKE_ICON_WEIGHTS.filter(([symbol]) => symbol !== previous)
    : KEEPSAKE_ICON_WEIGHTS;
  return weightedPick(rng, eligible);
}

/** Rolls the approved 27/19/15/11/15/8/5 per-free-spin zone distribution. */
export function rollKeepsakeZone(rng: Rng): KeepsakeZone | undefined {
  const choice = weightedPick(rng, KEEPSAKE_ZONE_WEIGHTS.map((entry) => [entry, entry.weight] as const));
  if (!choice.width || !choice.height) return undefined;

  // Reels are zero-based: valid footprints occupy only reels 1–3.
  const leftReel = choice.width === 3 ? 1 : (1 + Math.floor(rng() * 2)) as 1 | 2;
  const topRow = Math.floor(rng() * (5 - choice.height)) as 0 | 1 | 2;
  return {
    leftReel,
    topRow,
    width: choice.width,
    height: choice.height,
    symbol: rollKeepsakeSymbol(rng),
  };
}

export function keepsakePositions(zone: KeepsakeZone): Array<[reel: number, row: number]> {
  const positions: Array<[number, number]> = [];
  for (let reel = zone.leftReel; reel < zone.leftReel + zone.width; reel++) {
    for (let row = zone.topRow; row < zone.topRow + zone.height; row++) {
      positions.push([reel, row]);
    }
  }
  return positions;
}

export function isKeepsakePosition(zone: KeepsakeZone | undefined, reel: number, row: number): boolean {
  return !!zone
    && reel >= zone.leftReel
    && reel < zone.leftReel + zone.width
    && row >= zone.topRow
    && row < zone.topRow + zone.height;
}

/** Paints every covered cell with the zone's one shared icon. */
export function applyKeepsakeZone(grid: Grid, zone: KeepsakeZone): Grid {
  const next = grid.map((column) => column.map((cell) => ({ ...cell })));
  for (const [reel, row] of keepsakePositions(zone)) {
    next[reel][row] = { symbol: zone.symbol };
  }
  return next;
}

export function cloneKeepsakeZone(zone: KeepsakeZone | undefined): KeepsakeZone | undefined {
  return zone ? { ...zone } : undefined;
}
