import { describe, expect, it } from "vitest";
import {
  applyBonusSpinXp,
  applyBustProofRefill,
  availableBetLevels,
  levelForXp,
  sparksForSpin,
  xpIntoLevel,
} from "./economy";

describe("economy", () => {
  it("locks bet level 6 until player level 12", () => {
    expect(availableBetLevels(1)).toHaveLength(5);
    expect(availableBetLevels(12)).toHaveLength(6);
  });

  it("never lets balance strand below the current bet", () => {
    const { balance, refilled } = applyBustProofRefill(10, 25);
    expect(refilled).toBe(true);
    expect(balance).toBeGreaterThanOrEqual(25);
  });

  it("does not refill when balance already covers the bet", () => {
    const { balance, refilled } = applyBustProofRefill(1000, 25);
    expect(refilled).toBe(false);
    expect(balance).toBe(1000);
  });

  it("computes level from cumulative Sparks", () => {
    expect(levelForXp(0).valueOf()).toBe(levelForXp(0));
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(500)).toBe(2);
    expect(xpIntoLevel(600).level).toBe(2);
  });

  it("scales Sparks earned with bet", () => {
    expect(sparksForSpin(25)).toBeGreaterThan(0);
    expect(sparksForSpin(1250)).toBeGreaterThan(sparksForSpin(25));
  });
});

describe("applyBonusSpinXp", () => {
  it("awards XP for each bonus spin and returns levels before and after", () => {
    const state = { xp: 0, bet: 25 };
    const { levelBefore, levelAfter } = applyBonusSpinXp(state, 10);
    expect(levelBefore).toBe(1);
    expect(levelAfter).toBe(1);
    expect(state.xp).toBe(sparksForSpin(25) * 10);
  });

  it("detects a level-up when bonus spins push XP across a threshold", () => {
    const sparksPerSpin = sparksForSpin(25);
    const spinsToLevel = Math.ceil(500 / sparksPerSpin);
    const state = { xp: 0, bet: 25 };
    const { levelBefore, levelAfter } = applyBonusSpinXp(state, spinsToLevel);
    expect(levelBefore).toBe(1);
    expect(levelAfter).toBeGreaterThan(1);
  });

  it("returns same level before and after when XP stays within the current band", () => {
    const state = { xp: 100, bet: 25 };
    const { levelBefore, levelAfter } = applyBonusSpinXp(state, 1);
    expect(levelBefore).toBe(levelAfter);
  });

  it("mutates state.xp in place", () => {
    const state = { xp: 200, bet: 25 };
    applyBonusSpinXp(state, 5);
    expect(state.xp).toBe(200 + sparksForSpin(25) * 5);
  });

  it("accounts for bet size when computing sparks", () => {
    const stateLow = { xp: 0, bet: 25 };
    const stateHigh = { xp: 0, bet: 1250 };
    applyBonusSpinXp(stateLow, 10);
    applyBonusSpinXp(stateHigh, 10);
    expect(stateHigh.xp).toBeGreaterThan(stateLow.xp);
  });
});
