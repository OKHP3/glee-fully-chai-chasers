import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { KEEPSAKE_ZONE_WEIGHTS, isKeepsakePosition, keepsakePositions, rollKeepsakeSymbol, rollKeepsakeZone } from "./keepsake-constellation";
import type { SymbolId } from "./types";

describe("Keepsake Constellation zone roll", () => {
  it("uses the approved unconditional zone weights", () => {
    expect(KEEPSAKE_ZONE_WEIGHTS.reduce((total, entry) => total + entry.weight, 0)).toBe(100);
    expect(KEEPSAKE_ZONE_WEIGHTS.map(({ width, height, weight }) => [width ?? 0, height ?? 0, weight])).toEqual([
      [0, 0, 27], [2, 2, 19], [2, 3, 15], [2, 4, 11], [3, 2, 15], [3, 3, 8], [3, 4, 5],
    ]);
  });

  it("only creates rectangles that fit wholly on reels 2–4", () => {
    const rng = mulberry32(20260713);
    for (let i = 0; i < 20_000; i++) {
      const zone = rollKeepsakeZone(rng);
      if (!zone) continue;
      const positions = keepsakePositions(zone);
      expect(positions).toHaveLength(zone.width * zone.height);
      expect(zone.leftReel).toBeGreaterThanOrEqual(1);
      expect(zone.leftReel + zone.width - 1).toBeLessThanOrEqual(3);
      expect(zone.topRow).toBeGreaterThanOrEqual(0);
      expect(zone.topRow + zone.height - 1).toBeLessThanOrEqual(3);
      expect(positions.every(([reel, row]) => isKeepsakePosition(zone, reel, row))).toBe(true);
    }
  });

  it("never selects a treat, trigger, or legend icon and keeps giant wilds rare", () => {
    const rng = mulberry32(7);
    const forbidden: SymbolId[] = ["treat_chicken", "treat_salmon", "treat_boogie", "doorbell", "uniglee"];
    let wilds = 0;
    const total = 50_000;
    for (let i = 0; i < total; i++) {
      const symbol = rollKeepsakeSymbol(rng);
      expect(forbidden).not.toContain(symbol);
      if (symbol === "wild_joey" || symbol === "wild_phoebe") wilds++;
    }
    expect(wilds / total).toBeGreaterThan(0.015);
    expect(wilds / total).toBeLessThan(0.025);
  });

  it("always changes the icon when a cascading giant re-rolls", () => {
    const symbols: SymbolId[] = ["tumbler", "wild_joey", "wild_phoebe", "yarn"];
    for (const previous of symbols) {
      expect(rollKeepsakeSymbol(() => 0.5, previous)).not.toBe(previous);
    }
  });
});
