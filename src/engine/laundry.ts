/**
 * Joey's Laundry Helper chapter effect.
 *
 * Pure TypeScript: this module rolls the chapter's opening-grid modifiers and
 * applies them to a compatible 5×4 grid. It does not award spins or start a
 * session. Rates and multiplier weights are supplied by the UniGlee math
 * owner so this module does not silently tune RTP.
 */
import type { Rng } from "./rng";
import type { Grid } from "./types";

export type LaundryReel = 1 | 2 | 3;
export type LaundryRow = 0 | 1 | 2 | 3;
export type LaundryMultiplier = 2 | 3 | 5;

export const LAUNDRY_REELS = [1, 2, 3] as const satisfies readonly LaundryReel[];
export const LAUNDRY_MULTIPLIERS = [2, 3, 5] as const satisfies readonly LaundryMultiplier[];
export const LAUNDRY_ALLOCATION_FRACTION = 0.25;

/** 2026-07 RTP retune: marathon award reduced from 300/400/500 to 40/60/80. */
export type UniGleeAwardSpins = 40 | 60 | 80;

export function baseLaundryAllocation(awardedSpins: UniGleeAwardSpins): 10 | 15 | 20 {
  return (awardedSpins * LAUNDRY_ALLOCATION_FRACTION) as 10 | 15 | 20;
}

export interface LaundryRollConfig {
  sockDropRate: number;
  pawStrikeRate: number;
  multiplierWeights: Readonly<Record<LaundryMultiplier, number>>;
}

export interface LaundrySockDrop {
  reel: LaundryReel;
  wildPositions: Array<[reel: LaundryReel, row: LaundryRow]>;
}

export interface LaundryPawStrike {
  position: [reel: LaundryReel, row: LaundryRow];
  multiplier: LaundryMultiplier;
}

export interface JoeyLaundryEffect {
  chapter: "joey_laundry_helper";
  blockIndex: number;
  roundOrdinal: number;
  sockDrop?: LaundrySockDrop;
  pawStrike?: LaundryPawStrike;
}

export interface UniGleeSubBonusBudget {
  initialAllocation: number;
  retriggerSpins: number;
  remainingSpins: number;
}

function randomLaundryReel(rng: Rng): LaundryReel {
  return LAUNDRY_REELS[Math.floor(rng() * LAUNDRY_REELS.length)];
}

function randomLaundryRow(rng: Rng): LaundryRow {
  return Math.floor(rng() * 4) as LaundryRow;
}

function weightedMultiplier(rng: Rng, weights: Readonly<Record<LaundryMultiplier, number>>): LaundryMultiplier {
  const total = LAUNDRY_MULTIPLIERS.reduce((sum, multiplier) => sum + weights[multiplier], 0);
  if (total <= 0) throw new Error("Joey's Laundry Helper requires positive multiplier weights");
  let roll = rng() * total;
  for (const multiplier of LAUNDRY_MULTIPLIERS) {
    if (roll < weights[multiplier]) return multiplier;
    roll -= weights[multiplier];
  }
  return LAUNDRY_MULTIPLIERS[LAUNDRY_MULTIPLIERS.length - 1];
}

function sockDropFor(reel: LaundryReel): LaundrySockDrop {
  return {
    reel,
    wildPositions: [0, 1, 2, 3].map((row) => [reel, row as LaundryRow]),
  };
}

/** Rolls at most one sock drop and one paw strike for one counted round. */
export function rollJoeyLaundryEffect(
  rng: Rng,
  blockIndex: number,
  roundOrdinal: number,
  config: LaundryRollConfig,
): JoeyLaundryEffect {
  const sockDrop = rng() < config.sockDropRate
    ? sockDropFor(randomLaundryReel(rng))
    : undefined;
  const pawStrike = rng() < config.pawStrikeRate
    ? {
      position: [randomLaundryReel(rng), randomLaundryRow(rng)] as [LaundryReel, LaundryRow],
      multiplier: weightedMultiplier(rng, config.multiplierWeights),
    }
    : undefined;

  return {
    chapter: "joey_laundry_helper",
    blockIndex,
    roundOrdinal,
    sockDrop,
    pawStrike,
  };
}

/** Applies the rolled sock and paw effects to a compatible opening grid. */
export function applyJoeyLaundryEffect(grid: Grid, effect: JoeyLaundryEffect): Grid {
  const next = grid.map((column) => column.map((cell) => ({ ...cell })));
  for (const [reel, row] of effect.sockDrop?.wildPositions ?? []) {
    next[reel][row] = { symbol: "wild_joey" };
  }
  if (effect.pawStrike) {
    const [reel, row] = effect.pawStrike.position;
    next[reel][row] = { symbol: "wild_joey", multiplier: effect.pawStrike.multiplier };
  }
  return next;
}
