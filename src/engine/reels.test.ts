import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { DOORBELL_REEL_ONE_RATE, DOORBELL_REEL_TWO_RATE, REELS, ROWS, cascadeColumn, spinGrid } from "./reels";

describe("spinGrid", () => {
  it("produces a deterministic REELS x ROWS grid for a seeded rng", () => {
    const grid = spinGrid(mulberry32(42));
    expect(grid).toHaveLength(REELS);
    for (const column of grid) {
      expect(column).toHaveLength(ROWS);
    }
  });

  it("only draws treat symbols on reels 0, 2, 4", () => {
    const rng = mulberry32(7);
    const grid = spinGrid(rng);
    [1, 3].forEach((reelIndex) => {
      for (const cell of grid[reelIndex]) {
        expect(cell.symbol.startsWith("treat_")).toBe(false);
      }
    });
  });

  it("keeps rare doorbell blockers on reels 1 and 2 only", () => {
    for (let seed = 0; seed < 5000; seed++) {
      const grid = spinGrid(mulberry32(seed));
      for (const reel of [2, 3, 4]) {
        expect(grid[reel].some((cell) => cell.symbol === "doorbell")).toBe(false);
      }
    }
  });

  it("uses the requested independent reel-specific doorbell odds", () => {
    expect(DOORBELL_REEL_ONE_RATE).toBeCloseTo(1 / 13);
    expect(DOORBELL_REEL_TWO_RATE).toBeCloseTo(1 / 23);
    expect(DOORBELL_REEL_ONE_RATE * DOORBELL_REEL_TWO_RATE).toBeCloseTo(1 / 299);
  });
});

describe("cascadeColumn", () => {
  it("keeps survivors and refills only the removed rows", () => {
    const rng = mulberry32(1);
    const column = [
      { symbol: "tumbler" as const },
      { symbol: "butterfly" as const },
      { symbol: "mixtape" as const },
      { symbol: "crystal" as const },
    ];
    const result = cascadeColumn(rng, 0, column, new Set([0, 1]));
    expect(result).toHaveLength(4);
    // Survivors (rows 2 and 3) land at the bottom, in original order.
    expect(result[2]).toEqual({ symbol: "mixtape" });
    expect(result[3]).toEqual({ symbol: "crystal" });
  });
});
