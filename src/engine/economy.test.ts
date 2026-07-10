import { describe, expect, it } from "vitest";
import {
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
