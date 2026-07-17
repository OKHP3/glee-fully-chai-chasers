/**
 * UniGlee marathon structure. Pure TypeScript, zero DOM.
 *
 * This module owns the amended five-act plan and the active-line trigger
 * contract. Chapter payout/effect math remains in the chapter engines.
 */
import type { Rng } from "./rng";
import type { Grid, SymbolId, UniGleeTrigger } from "./types";
import { PAYLINES } from "./paylines";
import { baseLaundryAllocation, type UniGleeAwardSpins } from "./laundry";

export type UniGleeSubBonusId =
  | "joey_laundry_helper"
  | "were_multiplying"
  | "keepsake_collection"
  | "nighttime_treat_time"
  | "phoebe_lap_quest";

export const UNIGLEE_MIDDLE_SUB_BONUSES = [
  "were_multiplying",
  "keepsake_collection",
  "nighttime_treat_time",
] as const satisfies readonly UniGleeSubBonusId[];

export const UNIGLEE_ACTIVE_REELS = [2, 3, 4] as const;

/**
 * Per-reel independent capture odds (S34, 2026-07-17 — Jamie's 2,000/4,000/
 * 5,000 shape, scaled 4x rarer to land the combined rate near 1-in-4,500 so
 * the real trigger stays legendary against the much more common decorative
 * tease sighting in reels.ts): Reel 3 (index 2) 1-in-8,000 → 300 spins,
 * Reel 4 (index 3) 1-in-16,000 → 400 spins, Reel 5 (index 4) 1-in-20,000 →
 * 500 spins. Combined per-spin rate is their sum (~1 in 4,212).
 */
export const UNIGLEE_REEL_RATES: readonly [2 | 3 | 4, number][] = [
  [2, 1 / 8000],
  [3, 1 / 16000],
  [4, 1 / 20000],
];

/** Reel index -> initial marathon award, per the 2026-07-15 release contract. */
const UNIGLEE_REEL_AWARDS: Readonly<Record<2 | 3 | 4, UniGleeAwardSpins>> = {
  2: 300,
  3: 400,
  4: 500,
};

export const UNIGLEE_ACTIVE_RATE = UNIGLEE_REEL_RATES.reduce((sum, [, rate]) => sum + rate, 0);

/**
 * Rolls each active reel independently at its own capture rate (one RNG draw
 * per reel, in reel order). If more than one reel hits on the same spin, the
 * highest reel wins — deterministic, and the tie goes to the rarer, larger
 * award. Returns the capturing reel or undefined when no reel hits.
 */
export function rollUniGleeCapture(rng: Rng): 2 | 3 | 4 | undefined {
  let hit: 2 | 3 | 4 | undefined;
  for (const [reel, rate] of UNIGLEE_REEL_RATES) {
    if (rng() < rate) hit = reel;
  }
  return hit;
}

const ACTIVE_REEL_WEIGHTS: readonly [2 | 3 | 4, number][] = UNIGLEE_REEL_RATES;

const TRIGGER_SYMBOLS: readonly SymbolId[] = [
  "tumbler", "butterfly", "mixtape", "crystal", "chai", "candle", "cassette", "gnome",
  "mailbox", "vhs", "teapot", "yarn",
];

function weightedActiveReel(rng: Rng): 2 | 3 | 4 {
  let roll = rng() * ACTIVE_REEL_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [reel, weight] of ACTIVE_REEL_WEIGHTS) {
    if (roll < weight) return reel;
    roll -= weight;
  }
  return 2;
}

/**
 * Places one guaranteed active UniGlee capture on a selected payline. The
 * symbol is never placed on reels 1–2; the prefix is made line-valid so the
 * event cannot be a decorative, non-paying-looking scatter.
 */
export function placeUniGleeTrigger(rng: Rng, input: Grid, capturedReel?: 2 | 3 | 4): { grid: Grid; trigger: UniGleeTrigger } {
  const reel = capturedReel ?? weightedActiveReel(rng);
  const lineIndex = Math.floor(rng() * PAYLINES.length);
  const line = PAYLINES[lineIndex];
  const row = line[reel];
  const symbol = TRIGGER_SYMBOLS[Math.floor(rng() * TRIGGER_SYMBOLS.length)];
  const grid = input.map((column) => column.map((cell) => ({ ...cell })));
  for (let lineReel = 0; lineReel < reel; lineReel++) {
    grid[lineReel][line[lineReel]] = { symbol };
  }
  grid[reel][row] = { symbol: "uniglee" };
  const linePositions = Array.from({ length: reel + 1 }, (_, lineReel) => [lineReel, line[lineReel]] as [number, number]);
  return {
    grid,
    trigger: {
      reel,
      lineIndex,
      position: [reel, row],
      linePositions,
      initialAwardSpins: UNIGLEE_REEL_AWARDS[reel],
    },
  };
}

export interface UniGleeSubBonusPlan {
  id: UniGleeSubBonusId;
  /** Base spins assigned before any local retriggers. */
  baseSpins: number;
  /** Retriggers earned here stay in this sub-bonus queue. */
  ownsRetriggers: boolean;
  /** Lap Quest is additive and does not consume a quarter allocation. */
  isSweetener: boolean;
}

export interface UniGleeMarathonPlan {
  initialAwardSpins: UniGleeAwardSpins;
  quarterSpins: 75 | 100 | 125;
  /** Joey first, a seeded permutation of the middle three, Phoebe last. */
  order: readonly UniGleeSubBonusId[];
  baseSubBonuses: readonly UniGleeSubBonusPlan[];
  lapQuest: UniGleeSubBonusPlan;
}

/**
 * Builds the amended five-act order with a seeded permutation of acts 2–4.
 * No chapter RNG, payout, or bonus trigger is performed here.
 */
export function buildUniGleeMarathonPlan(
  rng: Rng,
  initialAwardSpins: UniGleeAwardSpins,
): UniGleeMarathonPlan {
  const middle = [...UNIGLEE_MIDDLE_SUB_BONUSES] as UniGleeSubBonusId[];
  for (let index = middle.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [middle[index], middle[swapIndex]] = [middle[swapIndex], middle[index]];
  }

  const quarterSpins = baseLaundryAllocation(initialAwardSpins);
  const baseIds: UniGleeSubBonusId[] = [
    "joey_laundry_helper",
    middle[0],
    middle[1],
    middle[2],
  ];
  const baseSubBonuses = baseIds.map((id) => ({
    id,
    baseSpins: quarterSpins,
    ownsRetriggers: true,
    isSweetener: false,
  }));
  const lapQuest: UniGleeSubBonusPlan = {
    id: "phoebe_lap_quest",
    baseSpins: 0,
    ownsRetriggers: true,
    isSweetener: true,
  };

  return {
    initialAwardSpins,
    quarterSpins,
    order: [baseIds[0], baseIds[1], baseIds[2], baseIds[3], lapQuest.id],
    baseSubBonuses,
    lapQuest,
  };
}

export interface UniGleeSubBonusAccounting {
  id: UniGleeSubBonusId;
  baseSpins: number;
  retriggerSpins: number;
  spinsPlayed: number;
  totalWin: number;
}

export interface UniGleeMarathonAccounting {
  initialAwardSpins: UniGleeAwardSpins;
  subBonuses: readonly UniGleeSubBonusAccounting[];
  lapQuestExtraSpins: number;
  lapQuestExtraCoins: number;
  totalSpinsPlayed: number;
  totalGleeCoinsWon: number;
}
