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
  // blocker / bonus trigger
  | "doorbell" | "chai_pump"
  // treats (feature symbols, reels 1/3/5 only)
  | "treat_chicken" | "treat_salmon" | "treat_bougie"
  // wilds & legend
  | "wild_joey" | "wild_phoebe" | "uniglee";

export type TreatKind = "chicken" | "salmon" | "bougie";

export type TreatTimeMode = "morning" | "nighttime";

export type LapQuestSpot = "window_perch" | "blanket_nest" | "moonlit_cushion";

/** A Phoebe wild that remains fixed for one complete cascade chain. */
export interface StickyWild {
  position: [reel: number, row: number];
  symbol: "wild_phoebe";
  sticky: "lap_quest";
}

/** Whether a spin is resolving on the primary board or a secondary bonus board. */
export type SpinArea = "main" | "secondary";

/** A single marked wild used by the We're Multiplying free-spin bonus. */
export type WildMultiplier = 2 | 3 | 5 | 10;

export interface TreatTimeWild {
  position: [reel: number, row: number];
  treat: TreatKind;
  wild: "joey" | "phoebe";
}

export interface TreatTimeTrigger {
  mode: TreatTimeMode;
  freeSpinsAwarded: number;
}

export interface Cell {
  symbol: SymbolId;
  /** Present only on the one marked wild that opened a multiplying free spin. */
  multiplier?: WildMultiplier;
  /** Present only on a fixed Phoebe comfort-wild in Lap Quest. */
  sticky?: "lap_quest";
}

/** 5 reels x 4 rows; grid[reel][row], row 0 = top. */
export type Grid = Cell[][];

/**
 * A locked giant Keepsake footprint used by the Keepsake Constellation
 * free-spin modifier. Its icon may re-roll after a winning cascade, but its
 * rectangle never changes during that spin.
 */
export interface KeepsakeZone {
  leftReel: 1 | 2;
  topRow: 0 | 1 | 2;
  width: 2 | 3;
  height: 2 | 3 | 4;
  symbol: SymbolId;
}

export interface LineWin {
  lineIndex: number;       // 0..39 (40 fixed paylines)
  symbol: SymbolId;
  count: number;           // consecutive from reel 0
  payout: number;          // in Sparks, bet-scaled
  positions: Array<[reel: number, row: number]>;
  /** Applied only when this winning line uses the marked multiplier wild. */
  multiplier?: WildMultiplier;
}

export interface DoorbellTrigger {
  lineIndex: number;
  positions: Array<[reel: number, row: number]>;
  freeSpinsAwarded: number;
}

/** A same-payline Bold Chai Pump pair captured during a base-game spin. */
export interface BoldChaiTrigger {
  lineIndex: number;
  positions: Array<[number, number]>;
}

export type BoldChaiPumpPhase = "ready" | "pumping" | "resetting" | "ended";

/** Pure state for the 30-second rapid-tap Bold Chai Pump bonus. */
export interface BoldChaiPumpState {
  phase: BoldChaiPumpPhase;
  startedAtMs?: number;
  resetUntilMs?: number;
  totalPumps: number;
  pumpsInCurrentCup: number;
  completedChais: number;
  freeSpinsAwarded: number;
}

export type BoldChaiPumpEvent =
  | { kind: "pump"; elapsedMs: number; fillLevel: number; freeSpinsAwarded: number }
  | { kind: "chai_completed"; elapsedMs: number; fillLevel: 12; freeSpinsAwarded: number; resetUntilMs: number }
  | { kind: "expired"; elapsedMs: number };

export interface BoldChaiPumpActionResult {
  state: BoldChaiPumpState;
  accepted: boolean;
  reason?: "ended" | "expired" | "resetting";
  event?: BoldChaiPumpEvent;
}

export interface BoldChaiPumpBonusResult {
  kind: "bold_chai_pump_result";
  totalPumps: number;
  completedChais: number;
  partialPumps: number;
  freeSpinsAwarded: number;
  endedBecause: "timeout";
}

export interface CascadeStep {
  grid: Grid;
  wins: LineWin[];
  meterAfter: number;      // consecutive-cascade count after this step
  specialtyAwarded: SpecialtyWild[];
  blastPositions?: Array<[number, number]>; // when a Sparkle Sort fired
  /** Present for each step of a Keepsake Constellation spin. */
  keepsakeZone?: KeepsakeZone;
  /** Present for a Lap Quest round; positions remain fixed through cascades. */
  stickyWilds?: StickyWild[];
}

export type SpecialtyWild = "sparkle_sort" | "drop_in" | "double_sparkle" | "facts_on_facts";

/** Free-spin ladder — docs/DESIGN-SPEC.md §1. Index by cascade count. */
export const FREE_SPIN_LADDER: Record<number, number> = {
  4: 7, 5: 10, 6: 15, 7: 20, 8: 50, 9: 75, 10: 100, 11: 200,
};

export interface CatVisit {
  cat: "joey" | "phoebe";
  fed: boolean;            // jar had a qualifying treat (Phoebe: any; Joey: bougie only — CANON S7)
  assist?: "sparkle_sort" | "drop_in" | "meter_nudge" | "shuffle_consolation";
  quip: string;
}

export interface SpinResult {
  steps: CascadeStep[];
  totalWin: number;
  cascades: number;
  freeSpinsAwarded: number;      // via FREE_SPIN_LADDER, doubled by double_sparkle
  doubleSparkleApplied: boolean; // true if freeSpinsAwarded was doubled this spin
  catVisit?: CatVisit;
  unigleeTriggered: boolean;
  treatsCollected: TreatKind[];
  doorbellPanic?: DoorbellTrigger;
  boldChaiPump?: BoldChaiTrigger;
  treatTimeBonus?: TreatTimeTrigger;
  stickyWilds?: StickyWild[];
}

export interface EngineConfig {
  reels: 5;
  rows: 4;
  paylines: number[][];          // 40 lines; each = row index per reel
  targetRtp: number;             // ~0.96, verified by 1M-spin simulation test
  catVisitBaseRate: number;      // ~1/32, pity-weighted (docs/DESIGN-SPEC.md §2)
  unigleeRate: number;           // ~1/400
}
