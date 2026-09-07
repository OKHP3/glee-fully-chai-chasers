/**
 * Balance, bet levels, and XP/level progression. Pure TS, zero DOM.
 * Spec: docs/DESIGN-SPEC.md §9. Currency = Glee-coins; Chai Sparks = XP.
 */
export const BET_LEVELS = [1, 2, 5, 10, 25, 50] as const;
export type BetLevel = (typeof BET_LEVELS)[number];

export const LEVEL_6_UNLOCK_PLAYER_LEVEL = 12;
export const LINES = 40;
export const STARTING_BALANCE = 500;
export const BUST_PROOF_REFILL = 500;

/** Coins per bet-level index the player may currently use. */
export function availableBetLevels(playerLevel: number): number[] {
  return playerLevel >= LEVEL_6_UNLOCK_PLAYER_LEVEL ? [...BET_LEVELS] : BET_LEVELS.slice(0, 5);
}

export function betPerLine(bet: number): number {
  return bet / LINES;
}

/** Chai Sparks earned per spin, scaled by bet — docs §9. */
export function sparksForSpin(bet: number): number {
  return Math.max(1, Math.round(bet / 25));
}

/** Simple XP curve: level N needs N * 500 cumulative Sparks. */
export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= levelThreshold(level + 1)) level++;
  return level;
}

export function levelThreshold(level: number): number {
  return (level - 1) * 500;
}

export function xpIntoLevel(xp: number): { level: number; into: number; span: number } {
  const level = levelForXp(xp);
  const into = xp - levelThreshold(level);
  const span = levelThreshold(level + 1) - levelThreshold(level);
  return { level, into, span };
}

/**
 * Automatic-refill invariant (docs §9): if balance can't cover one more spin at the
 * current bet, AskJamie "finds coins under the couch." Returns the new
 * balance (unchanged if no refill was needed).
 */
export function applyBustProofRefill(balance: number, currentBet: number): { balance: number; refilled: boolean } {
  if (balance >= currentBet) return { balance, refilled: false };
  return { balance: balance + BUST_PROOF_REFILL, refilled: true };
}

/**
 * Awards Chai Sparks for every spin played inside a bonus session and returns
 * the player level before and after the grant. Mutates state.xp in place.
 *
 * Bonus sessions (free spins, treat-jar spins, UniGlee chapters, etc.) each
 * play multiple reels — each of those counts as a real spin for XP purposes.
 * The caller must still check whether levelAfter > levelBefore and show the
 * celebration if so.
 */
export function applyBonusSpinXp(
  state: { xp: number; bet: number },
  totalSpins: number,
): { levelBefore: number; levelAfter: number } {
  const levelBefore = levelForXp(state.xp);
  state.xp += sparksForSpin(state.bet) * totalSpins;
  const levelAfter = levelForXp(state.xp);
  return { levelBefore, levelAfter };
}
