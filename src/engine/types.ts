/**
 * Core engine types — pure TypeScript, zero DOM.
 * Spec: docs/DESIGN-SPEC.md §1-§5. Canon: docs/CANON.md.
 * Everything here must be unit-testable in vitest with a seeded RNG.
 */

export type SymbolId =
  // high
  | "tumbler" | "butterfly" | "mixtape" | "crystal"
  // mid
  | "chai" | "candle" | "cassette" | "gnome"
  // low
  | "mailbox" | "vhs" | "teapot" | "yarn"
  // treats (feature symbols, reels 1/3/5 only)
  | "treat_chicken" | "treat_salmon" | "treat_boogie"
  // wilds & legend
  | "wild_joey" | "wild_phoebe" | "uniglee";

export type TreatKind = "chicken" | "salmon" | "boogie";

export interface Cell { symbol: SymbolId; }

/** 5 reels x 4 rows; grid[reel][row], row 0 = top. */
export type Grid = Cell[][];

export interface LineWin {
  lineIndex: number;       // 0..24 (25 fixed paylines)
  symbol: SymbolId;
  count: number;           // consecutive from reel 0
  payout: number;          // in Sparks, bet-scaled
  positions: Array<[reel: number, row: number]>;
}

export interface CascadeStep {
  grid: Grid;
  wins: LineWin[];
  meterAfter: number;      // consecutive-cascade count after this step
  specialtyAwarded: SpecialtyWild[];
  blastPositions?: Array<[number, number]>; // when a Sparkle Sort fired
}

export type SpecialtyWild = "sparkle_sort" | "drop_in" | "double_sparkle" | "facts_on_facts";

/** Free-spin ladder — docs/DESIGN-SPEC.md §1. Index by cascade count. */
export const FREE_SPIN_LADDER: Record<number, number> = {
  4: 7, 5: 10, 6: 15, 7: 20, 8: 50, 9: 75, 10: 100, 11: 200,
};

export interface CatVisit {
  cat: "joey" | "phoebe";
  fed: boolean;            // jar had a qualifying treat (Phoebe: any; Joey: boogie only — CANON S7)
  assist?: "sparkle_sort" | "drop_in" | "meter_nudge" | "shuffle_consolation";
  quip: string;
}

export interface SpinResult {
  steps: CascadeStep[];
  totalWin: number;
  cascades: number;
  freeSpinsAwarded: number;      // via FREE_SPIN_LADDER, doubled by double_sparkle
  catVisit?: CatVisit;
  unigleeTriggered: boolean;
  treatsCollected: TreatKind[];
}

export interface EngineConfig {
  reels: 5;
  rows: 4;
  paylines: number[][];          // 25 lines; each = row index per reel
  targetRtp: number;             // ~0.96, verified by 1M-spin simulation test
  catVisitBaseRate: number;      // ~1/32, pity-weighted (docs/DESIGN-SPEC.md §2)
  unigleeRate: number;           // ~1/400
}
