import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import {
  BOLD_CHAI_REEL_ONE_RATE,
  BOLD_CHAI_REEL_TWO_RATE,
  DOORBELL_REEL_ONE_RATE,
  DOORBELL_REEL_TWO_RATE,
  REELS,
  ROWS,
  cascadeColumn,
  spinGrid,
} from "./reels";

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
    expect(DOORBELL_REEL_ONE_RATE).toBeCloseTo(1 / 17);
    expect(DOORBELL_REEL_TWO_RATE).toBeCloseTo(1 / 30);
    expect(DOORBELL_REEL_ONE_RATE * DOORBELL_REEL_TWO_RATE).toBeCloseTo(1 / 510);
  });

  it("suppresses doorbell events for bonus grids", () => {
    for (let seed = 0; seed < 5000; seed++) {
      const grid = spinGrid(mulberry32(seed), { includeDoorbells: false, includeBoldChaiPump: false });
      expect(grid[0].some((cell) => cell.symbol === "doorbell")).toBe(false);
      expect(grid[1].some((cell) => cell.symbol === "doorbell")).toBe(false);
    }
  });

  it("uses the locked Bold Chai Pump odds without changing Doorbell tuning", () => {
    expect(BOLD_CHAI_REEL_ONE_RATE).toBeCloseTo(1 / 17);
    expect(BOLD_CHAI_REEL_TWO_RATE).toBeCloseTo(1 / 30);
    expect(BOLD_CHAI_REEL_ONE_RATE * BOLD_CHAI_REEL_TWO_RATE).toBeCloseTo(1 / 510);
    expect(DOORBELL_REEL_ONE_RATE).toBeCloseTo(1 / 17);
    expect(DOORBELL_REEL_TWO_RATE).toBeCloseTo(1 / 30);
  });

  it("keeps Bold Chai Pump blockers on reels 1 and 2 only", () => {
    for (let seed = 0; seed < 5000; seed++) {
      const grid = spinGrid(mulberry32(seed));
      for (const reel of [2, 3, 4]) {
        expect(grid[reel].some((cell) => cell.symbol === "chai_pump")).toBe(false);
      }
    }
  });

  it("suppresses Bold Chai Pump landings on secondary bonus grids", () => {
    for (let seed = 0; seed < 5000; seed++) {
      const grid = spinGrid(mulberry32(seed), { includeBoldChaiPump: false });
      expect(grid.flat().some((cell) => cell.symbol === "chai_pump")).toBe(false);
    }
  });

  it("selects Doorbell-only when Doorbell and Pump candidates collide", () => {
    const values = [
      0.5, 0.5, 0.5, 0.5, 0.5, // five reel stops
      0, 0, // Doorbell reel 1: candidate + row 0
      0, 0, // Doorbell reel 2: candidate + row 0
      0, 0, // Pump reel 1: candidate + row 0
      0, 0, 0, // Pump candidates; Doorbell rows 0/0
    ];
    let index = 0;
    const grid = spinGrid(() => values[index++] ?? 0.5);

    expect(grid[0][0].symbol).toBe("doorbell");
    expect(grid[1][0].symbol).toBe("doorbell");
    expect(grid.flat().some((cell) => cell.symbol === "chai_pump")).toBe(false);
  });

  it("selects Chai Pump-only when no Doorbell candidate exists", () => {
    const values = [
      0.5, 0.5, 0.5, 0.5, 0.5, // five reel stops
      1, 1, // Doorbell reel 1/2: no candidates
      0, 0, // Pump reel 1/2: candidates
      0, 0, // Pump reel 1/2 rows
    ];
    let index = 0;
    const grid = spinGrid(() => values[index++] ?? 0.5);

    expect(grid[0][0].symbol).toBe("chai_pump");
    expect(grid[1][0].symbol).toBe("chai_pump");
    expect(grid.flat().some((cell) => cell.symbol === "doorbell")).toBe(false);
  });

  it("never mixes Doorbell and Chai Pump families across many spins", () => {
    for (let seed = 0; seed < 20_000; seed++) {
      const grid = spinGrid(mulberry32(seed));
      const hasDoorbell = grid.flat().some((cell) => cell.symbol === "doorbell");
      const hasPump = grid.flat().some((cell) => cell.symbol === "chai_pump");
      expect(hasDoorbell && hasPump).toBe(false);
    }
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
