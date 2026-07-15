import { describe, expect, it } from "vitest";
import { evaluateLines, findBoldChaiTrigger, findDoorbellTrigger, PAYLINES } from "./paylines";
import type { Grid } from "./types";

function flatGrid(symbol: Grid[number][number]["symbol"]): Grid {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 4 }, () => ({ symbol })),
  );
}

describe("evaluateLines", () => {
  it("defines 40 unique valid five-reel paylines", () => {
    expect(PAYLINES).toHaveLength(40);
    expect(new Set(PAYLINES.map((line) => line.join(","))).size).toBe(40);
    for (const line of PAYLINES) {
      expect(line).toHaveLength(5);
      expect(line.every((row) => row >= 0 && row < 4)).toBe(true);
    }
  });

  it("pays 5-of-a-kind on the top row line", () => {
    const grid = flatGrid("tumbler");
    const wins = evaluateLines(grid, 1);
    const topLine = wins.find((w) => w.lineIndex === 0)!;
    expect(topLine.count).toBe(5);
    expect(topLine.payout).toBeCloseTo(1341.07, 2);
  });

  it("does not pay treats or UniGlee as line symbols", () => {
    const grid = flatGrid("treat_chicken");
    expect(evaluateLines(grid, 1)).toHaveLength(0);
    const uniglee = flatGrid("uniglee");
    expect(evaluateLines(uniglee, 1)).toHaveLength(0);
  });

  it("lets wilds substitute and pay as tumbler", () => {
    const grid: Grid = [
      [{ symbol: "wild_joey" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "tumbler" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "tumbler" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "yarn" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "yarn" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
    ];
    const wins = evaluateLines(grid, 1);
    const topLine = wins.find((w) => w.lineIndex === 0)!;
    expect(topLine.symbol).toBe("tumbler");
    expect(topLine.count).toBe(3);
    expect(topLine.payout).toBeCloseTo(67.54, 2);
  });

  it("recognizes a Handbag Wild on every fixed payline shape", () => {
    for (const [lineIndex, line] of PAYLINES.entries()) {
      const grid = flatGrid("treat_chicken");
      for (let reel = 0; reel < 4; reel++) grid[reel][line[reel]] = { symbol: "tumbler" };
      grid[4][line[4]] = { symbol: "wild_handbag", handbagMultiplier: 10 };

      const win = evaluateLines(grid, 1).find((candidate) => candidate.lineIndex === lineIndex);
      expect(win).toMatchObject({
        symbol: "tumbler",
        count: 5,
        positions: line.map((row, reel) => [reel, row]),
      });
    }
  });

  it("treats a converted mermaid cup as an ordinary wild", () => {
    const grid: Grid = [
      [{ symbol: "wild_chai" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "tumbler" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "tumbler" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "yarn" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "yarn" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
    ];
    const topLine = evaluateLines(grid, 1).find((win) => win.lineIndex === 0)!;
    expect(topLine.symbol).toBe("tumbler");
    expect(topLine.count).toBe(3);
  });

  it("stops counting at the first non-matching, non-wild symbol", () => {
    const grid: Grid = [
      [{ symbol: "yarn" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "yarn" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "tumbler" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "yarn" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
      [{ symbol: "yarn" }, { symbol: "x" as never }, { symbol: "x" as never }, { symbol: "x" as never }],
    ];
    expect(evaluateLines(grid, 1)).toHaveLength(0);
  });

  it("treats a doorbell as a dead-space blocker and detects the paired trigger", () => {
    const grid: Grid = Array.from({ length: 5 }, (_, reel) =>
      Array.from({ length: 4 }, (_, row) => ({
        symbol: reel < 2 && row === 0 ? "doorbell" as const : "treat_chicken" as const,
      })),
    );
    grid[2][0] = { symbol: "tumbler" };
    grid[3][0] = { symbol: "tumbler" };
    grid[4][0] = { symbol: "tumbler" };

    expect(evaluateLines(grid, 1)).toHaveLength(0);
    expect(findDoorbellTrigger(grid, 9)).toEqual({
      lineIndex: 0,
      positions: [[0, 0], [1, 0]],
      freeSpinsAwarded: 9,
    });
  });

  it("treats a Chai Pump as non-paying and detects the paired trigger", () => {
    const grid: Grid = Array.from({ length: 5 }, (_, reel) =>
      Array.from({ length: 4 }, (_, row) => ({
        symbol: reel < 2 && row === 0 ? "chai_pump" as const : "treat_chicken" as const,
      })),
    );
    expect(evaluateLines(grid, 1)).toHaveLength(0);
    expect(findBoldChaiTrigger(grid)).toEqual({ lineIndex: 0, positions: [[0, 0], [1, 0]] });
  });
});
