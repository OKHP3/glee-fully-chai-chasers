import { describe, expect, it } from "vitest";
import { evaluateLines } from "./paylines";
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
    expect(topLine.payout).toBe(1112);
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
    expect(topLine.payout).toBe(56);
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
});
