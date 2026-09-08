import { describe, expect, it } from "vitest";
import { applyJoeyLaundryEffect, baseLaundryAllocation, rollJoeyLaundryEffect, type LaundryRollConfig } from "./laundry";
import type { Grid } from "./types";

const ALL_SOCKS: LaundryRollConfig = {
  sockDropRate: 1,
  pawStrikeRate: 0,
  multiplierWeights: { 2: 1, 3: 1, 5: 1 },
};

const ALL_PAWS: LaundryRollConfig = {
  sockDropRate: 0,
  pawStrikeRate: 1,
  multiplierWeights: { 2: 1, 3: 1, 5: 1 },
};

const BOTH_EFFECTS: LaundryRollConfig = {
  sockDropRate: 1,
  pawStrikeRate: 1,
  multiplierWeights: { 2: 1, 3: 1, 5: 1 },
};

function sequenceRng(values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

function blankGrid(): Grid {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 4 }, () => ({ symbol: "chai" as const })),
  );
}

describe("Joey's Laundry Helper", () => {
  it("allocates twenty-five percent of the parent UniGlee award", () => {
    expect(baseLaundryAllocation(300)).toBe(75);
    expect(baseLaundryAllocation(400)).toBe(100);
    expect(baseLaundryAllocation(500)).toBe(125);
  });

  it("rolls a sock drop only on a middle reel", () => {
    const effect = rollJoeyLaundryEffect(sequenceRng([0, 0]), 3, 7, ALL_SOCKS);

    expect(effect).toMatchObject({ chapter: "joey_laundry_helper", blockIndex: 3, roundOrdinal: 7 });
    expect(effect.sockDrop?.reel).toBeGreaterThanOrEqual(1);
    expect(effect.sockDrop?.reel).toBeLessThanOrEqual(3);
    expect(effect.sockDrop?.wildPositions).toHaveLength(4);
    expect(effect.pawStrike).toBeUndefined();
  });

  it("keeps sock columns on reels 2–4 and leaves reels 1 and 5 untouched", () => {
    for (const reelRoll of [0, 0.3333, 0.9999]) {
      const effect = rollJoeyLaundryEffect(sequenceRng([0, reelRoll]), 0, 0, ALL_SOCKS);
      expect(effect.sockDrop?.reel).toBeGreaterThanOrEqual(1);
      expect(effect.sockDrop?.reel).toBeLessThanOrEqual(3);
      expect(effect.sockDrop?.wildPositions).toEqual(
        [0, 1, 2, 3].map((row) => [effect.sockDrop!.reel, row]),
      );

      const grid = applyJoeyLaundryEffect(blankGrid(), effect);
      expect(grid[0].every((cell) => cell.symbol === "chai")).toBe(true);
      expect(grid[4].every((cell) => cell.symbol === "chai")).toBe(true);
      expect(grid.flat().filter((cell) => cell.multiplier !== undefined)).toHaveLength(0);
    }
  });

  it("rolls a single multiplier paw strike only on a middle reel", () => {
    const effect = rollJoeyLaundryEffect(sequenceRng([1, 0, 0, 0]), 1, 4, ALL_PAWS);

    expect(effect.sockDrop).toBeUndefined();
    expect(effect.pawStrike?.position[0]).toBeGreaterThanOrEqual(1);
    expect(effect.pawStrike?.position[0]).toBeLessThanOrEqual(3);
    expect(effect.pawStrike?.position[1]).toBeGreaterThanOrEqual(0);
    expect(effect.pawStrike?.position[1]).toBeLessThanOrEqual(3);
    expect([2, 3, 5]).toContain(effect.pawStrike?.multiplier);
    expect(effect.pawStrike?.multiplier).not.toBe(10);
  });

  it("supports each Laundry multiplier bucket without inheriting ×10", () => {
    for (const [roll, expected] of [[0, 2], [0.34, 3], [0.67, 5]] as const) {
      const effect = rollJoeyLaundryEffect(sequenceRng([1, 0, 0, 0, roll]), 0, 0, ALL_PAWS);
      expect(effect.pawStrike?.multiplier).toBe(expected);
      expect(effect.pawStrike?.position[0]).toBe(1);
      expect(effect.pawStrike?.position[1]).toBe(0);
    }
  });

  it("allows sock and paw effects to happen together and overlays the paw marker", () => {
    const effect = rollJoeyLaundryEffect(sequenceRng([0, 0, 0, 0, 0, 0]), 0, 0, BOTH_EFFECTS);
    const grid = applyJoeyLaundryEffect(blankGrid(), effect);
    const sockReel = effect.sockDrop?.reel;

    expect(effect.sockDrop).toBeDefined();
    expect(effect.pawStrike).toBeDefined();
    expect(effect.pawStrike?.position[0]).toBe(sockReel);
    expect(effect.sockDrop?.wildPositions.every(([reel, row]) => grid[reel][row].symbol === "wild_joey")).toBe(true);
    const [pawReel, pawRow] = effect.pawStrike!.position;
    expect(grid[pawReel][pawRow]).toEqual({ symbol: "wild_joey", multiplier: effect.pawStrike!.multiplier });
  });

  it("preserves exactly three ordinary sock wilds plus one paw marker on shared reels", () => {
    for (const reelRoll of [0, 0.34, 0.67]) {
      for (const rowRoll of [0, 0.25, 0.5, 0.75]) {
        const effect = rollJoeyLaundryEffect(
          sequenceRng([0, reelRoll, 0, reelRoll, rowRoll, 0]),
          0,
          0,
          BOTH_EFFECTS,
        );
        const grid = applyJoeyLaundryEffect(blankGrid(), effect);
        const reel = effect.pawStrike!.position[0];
        expect(effect.sockDrop!.reel).toBe(reel);
        expect(grid[reel].filter((cell) => cell.symbol === "wild_joey")).toHaveLength(4);
        expect(grid[reel].filter((cell) => cell.multiplier !== undefined)).toHaveLength(1);
        expect(grid[reel].filter((cell) => cell.multiplier === undefined)).toHaveLength(3);
      }
    }
  });

  it("can produce an ordinary round with neither effect", () => {
    const effect = rollJoeyLaundryEffect(sequenceRng([1, 1]), 2, 5, {
      ...ALL_SOCKS,
      sockDropRate: 0,
      pawStrikeRate: 0,
    });

    expect(effect.sockDrop).toBeUndefined();
    expect(effect.pawStrike).toBeUndefined();
    expect("freeSpinsAwarded" in effect).toBe(false);
  });
});
