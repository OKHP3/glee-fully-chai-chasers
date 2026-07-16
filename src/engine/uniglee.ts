/**
 * UniGlee marathon structure. Pure TypeScript, zero DOM.
 *
 * This module owns the amended five-act plan only. Chapter payout/effect math,
 * the reel-activated trigger, and the eventual session runner remain separate
 * engine work so this contract can be integrated without nesting bonuses.
 */
import type { Rng } from "./rng";
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
