/**
 * 40 fixed paylines + paytable evaluation. Pure TS, zero DOM.
 * Spec: docs/DESIGN-SPEC.md §4. Left-to-right evaluation, wilds substitute
 * for all paying symbols (and pay as the top symbol when forming their own line).
 */
import type { BoldChaiTrigger, DoorbellTrigger, Grid, LineWin, SymbolId } from "./types";

/** Each line is a row index (0-3) per reel (5 entries). */
export const PAYLINES: number[][] = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3],
  [0, 1, 2, 1, 0],
  [3, 2, 1, 2, 3],
  [1, 0, 1, 0, 1],
  [2, 3, 2, 3, 2],
  [0, 0, 1, 0, 0],
  [3, 3, 2, 3, 3],
  [1, 2, 3, 2, 1],
  [2, 1, 0, 1, 2],
  [0, 1, 1, 1, 0],
  [3, 2, 2, 2, 3],
  [1, 1, 0, 1, 1],
  [2, 2, 3, 2, 2],
  [0, 2, 0, 2, 0],
  [3, 1, 3, 1, 3],
  [0, 1, 3, 1, 0],
  [3, 2, 0, 2, 3],
  [1, 3, 1, 3, 1],
  [2, 0, 2, 0, 2],
  [0, 3, 0, 3, 0],
  [3, 0, 3, 0, 3],
  [1, 2, 0, 2, 1],
  [0, 1, 2, 3, 3],
  [3, 2, 1, 0, 0],
  [0, 1, 2, 2, 1],
  [3, 2, 1, 1, 2],
  [0, 0, 1, 2, 3],
  [3, 3, 2, 1, 0],
  [1, 0, 0, 1, 2],
  [2, 3, 3, 2, 1],
  [1, 2, 2, 1, 0],
  [2, 1, 1, 2, 3],
  [0, 2, 1, 2, 3],
  [3, 1, 2, 1, 0],
  [1, 3, 2, 1, 1],
  [2, 0, 1, 2, 2],
  [0, 1, 3, 2, 1],
];

/** × line-bet multipliers. Wilds pay as `tumbler` when forming their own line. */
export const PAYTABLE: Partial<Record<SymbolId, { 3: number; 4: number; 5: number }>> = {
  tumbler: { 3: 56, 4: 167, 5: 1112 },
  butterfly: { 3: 42, 4: 125, 5: 694 },
  mixtape: { 3: 33, 4: 96, 5: 417 },
  crystal: { 3: 27, 4: 82, 5: 334 },
  chai: { 3: 21, 4: 56, 5: 222 },
  candle: { 3: 21, 4: 56, 5: 222 },
  cassette: { 3: 13, 4: 33, 5: 139 },
  gnome: { 3: 13, 4: 33, 5: 139 },
  mailbox: { 3: 8, 4: 21, 5: 69 },
  vhs: { 3: 8, 4: 21, 5: 69 },
  teapot: { 3: 8, 4: 21, 5: 69 },
  yarn: { 3: 8, 4: 21, 5: 69 },
};

/**
 * Doorbell visibility adds intentional dead-space blockers to reels 1–2.
 * This global tuning factor sets the full-game RTP (base + all bonuses) to
 * ~96.5%, inside the 95-98% target band. Solved linearly from fleet sims.
 */
export const PAYOUT_SCALE = 0.775;

const WILDS: SymbolId[] = ["wild_joey", "wild_phoebe", "wild_handbag", "wild_chai"];
/** Symbols that never pay on a line (treats are feature-only; UniGlee is a legend trigger). */
const NON_PAYING: SymbolId[] = ["treat_chicken", "treat_salmon", "treat_bougie", "uniglee", "doorbell", "chai_pump"];

export function isWild(symbol: SymbolId): boolean {
  return WILDS.includes(symbol);
}

function findBlockerTrigger(grid: Grid, symbol: "doorbell" | "chai_pump"): BoldChaiTrigger | undefined {
  for (const [lineIndex, line] of PAYLINES.entries()) {
    const first = [0, line[0]] as [number, number];
    const second = [1, line[1]] as [number, number];
    if (grid[0][line[0]].symbol === symbol && grid[1][line[1]].symbol === symbol) {
      return { lineIndex, positions: [first, second] };
    }
  }
  return undefined;
}

/** A matched first/second-reel doorbell pair triggers the panic bonus. */
export function findDoorbellTrigger(grid: Grid, freeSpinsAwarded: number): DoorbellTrigger | undefined {
  const trigger = findBlockerTrigger(grid, "doorbell");
  return trigger ? { ...trigger, freeSpinsAwarded } : undefined;
}

/** A matched first/second-reel pump pair triggers the Bold Chai bonus. */
export function findBoldChaiTrigger(grid: Grid): BoldChaiTrigger | undefined {
  return findBlockerTrigger(grid, "chai_pump");
}

/** Evaluates all 25 lines against a grid for a given per-line bet. Pure — no RNG. */
export function evaluateLines(grid: Grid, betPerLine: number): LineWin[] {
  const wins: LineWin[] = [];

  PAYLINES.forEach((line, lineIndex) => {
    const first = grid[0][line[0]].symbol;
    if (NON_PAYING.includes(first)) return;

    const matchSymbol: SymbolId = isWild(first) ? "tumbler" : first;
    const positions: Array<[number, number]> = [];
    let count = 0;

    for (let reel = 0; reel < line.length; reel++) {
      const row = line[reel];
      const symbol = grid[reel][row].symbol;
      const matches = symbol === matchSymbol || isWild(symbol);
      if (!matches) break;
      positions.push([reel, row]);
      count++;
    }

    if (count < 3) return;
    const payoutTable = PAYTABLE[matchSymbol];
    if (!payoutTable) return;
    const tier = (count >= 5 ? 5 : count) as 3 | 4 | 5;
    const payout = payoutTable[tier] * betPerLine * PAYOUT_SCALE;

    wins.push({ lineIndex, symbol: matchSymbol, count, payout, positions });
  });

  return wins;
}
