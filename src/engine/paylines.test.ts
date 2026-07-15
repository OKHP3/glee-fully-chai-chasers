import { describe, expect, it } from "vitest";
import { evaluateLines, findDoorbellTrigger } from "./paylines";
import type { Grid } from "./types";

function flatGrid(symbol: Grid[number][number]["symbol"]): Grid {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 4 }, () => ({ symbol })),
  );
}

describe("evaluateLines", () => {
  it("pays 5-of-a-kind on the top row line", () => {
    const grid = flatGrid("tumbler");
    const wins = evaluateLines(grid, 1);
    const topLine = wins.find((w) => w.lineIndex === 0)!;
    expect(topLine.count).toBe(5);
    expect(topLine.payout).toBeCloseTo(1155.43, 2);
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
    expect(topLine.payout).toBeCloseTo(58.19, 2);
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
});
