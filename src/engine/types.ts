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
  | "wild_joey" | "wild_phoebe" | "wild_handbag" | "wild_chai" | "uniglee";

/** The paying-symbol subset used by the Moonlit Keepsake Trail cards. */
export type KeepsakeSymbolId =
  | "tumbler" | "butterfly" | "mixtape" | "crystal"
  | "chai" | "candle" | "cassette" | "gnome"
  | "mailbox" | "vhs" | "teapot" | "yarn";

export type KeepsakeMemoryPhase =
  | "preview"
  | "choosing_first"
  | "choosing_second"
  | "resolving_match"
  | "resolving_mismatch"
  | "complete"
  | "failed";

export interface KeepsakeMemoryCard {
  index: number;
  symbol: KeepsakeSymbolId;
  revealed: boolean;
  matched: boolean;
}

export interface KeepsakeMemoryState {
  kind: "keepsake_memory";
  phase: KeepsakeMemoryPhase;
  cards: KeepsakeMemoryCard[];
  firstPick?: number;
  pairsFound: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  fails: 0 | 1 | 2;
  maxFails: 2;
  freeSpinsAwarded: 0 | 40;
}

export type KeepsakeMemoryEvent =
  | { kind: "preview_complete" }
  | { kind: "card_revealed"; index: number }
  | { kind: "match"; indices: [number, number]; pairsFound: number }
  | { kind: "mismatch"; indices: [number, number]; fails: 1 | 2 }
  | { kind: "completed"; freeSpinsAwarded: 40 }
  | { kind: "failed"; freeSpinsAwarded: 0 };

export interface KeepsakeMemoryActionResult {
  state: KeepsakeMemoryState;
  accepted: boolean;
  event?: KeepsakeMemoryEvent;
  reason?: "preview" | "invalid_index" | "matched_card" | "same_card" | "resolving" | "ended";
}

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
export type HandbagWildMultiplier = 3 | 5 | 10;

export interface TreatTimeWild {
  position: [reel: number, row: number];
  treat: TreatKind;
  wild: "joey" | "phoebe";
}

export interface TreatTimeTrigger {
  mode: TreatTimeMode;
  freeSpinsAwarded: number;
}

/** Opening-board conversion performed once by the Iced Chai Wild Rain wheel wedge. */
export interface ChaiRainWild {
  position: [reel: number, row: number];
  symbol: "wild_chai";
}

export interface ChaiRainResult {
  /** Every standard iced-chai cell converted by the one-shot storm. */
  wilds: ChaiRainWild[];
}

export interface Cell {
  symbol: SymbolId;
  /** Present only on the one marked wild that opened a multiplying free spin. */
  multiplier?: WildMultiplier;
  /** Present only on a fixed Phoebe comfort-wild in Lap Quest. */
  sticky?: "lap_quest";
  /** Present on a Handbag Wild; scales a winning line that uses this symbol. */
  handbagMultiplier?: HandbagWildMultiplier;
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

/** Active UniGlee capture on reels 3, 4, or 5 (zero-based 2, 3, or 4). */
export interface UniGleeTrigger {
  reel: 2 | 3 | 4;
  lineIndex: number;
  position: [reel: 2 | 3 | 4, row: number];
  linePositions: Array<[reel: number, row: number]>;
  initialAwardSpins: 40 | 60 | 80;
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

/**
 * Free-spin ladder — docs/DESIGN-SPEC.md §1. Index by cascade count.
 * 2026-07 retune: entry threshold raised from 4 to 6 cascades to bring the
 * Firefly free-spin bonus frequency (and its RTP contribution) down.
 */
export const FREE_SPIN_LADDER: Record<number, number> = {
  6: 6, 7: 9, 8: 15, 9: 25, 10: 40, 11: 60,
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
  unigleeTrigger?: UniGleeTrigger;
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
