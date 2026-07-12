/**
 * Balance, bet levels, and XP/level progression. Pure TS, zero DOM.
 * Spec: docs/DESIGN-SPEC.md §9. Currency = Glee-coins; Chai Sparks = XP.
 */
export const BET_LEVELS = [25, 50, 125, 250, 625, 1250] as const;
export type BetLevel = (typeof BET_LEVELS)[number];

export const LEVEL_6_UNLOCK_PLAYER_LEVEL = 12;
export const LINES = 25;
export const STARTING_BALANCE = 1_000_000;
export const BUST_PROOF_REFILL = 500_000;

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
