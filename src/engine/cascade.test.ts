import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { freeSpinsForCascades, spin } from "./cascade";
import { emptyTreatJar } from "./features";
import type { Grid } from "./types";
import { PAYOUT_SCALE, PAYTABLE } from "./paylines";

describe("spin", () => {
  it("is deterministic for a given seed", () => {
    const jar = emptyTreatJar();
    const a = spin({ rng: mulberry32(123), betPerLine: 1, treatJar: jar, spinsSincePopIn: 0 });
    const b = spin({ rng: mulberry32(123), betPerLine: 1, treatJar: jar, spinsSincePopIn: 0 });
    expect(a.totalWin).toBe(b.totalWin);
    expect(a.cascades).toBe(b.cascades);
    expect(a.steps.length).toBe(b.steps.length);
  });

  it("always ends on a dead board (last step has no wins)", () => {
    for (let seed = 0; seed < 25; seed++) {
      const result = spin({
        rng: mulberry32(seed),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
      });
      expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
    }
  });

  it("looks up the free-spin ladder correctly by cascade count", () => {
    expect(freeSpinsForCascades(0)).toBe(0);
    expect(freeSpinsForCascades(3)).toBe(0);
    expect(freeSpinsForCascades(4)).toBe(7);
    expect(freeSpinsForCascades(6)).toBe(15);
    expect(freeSpinsForCascades(11)).toBe(200);
    expect(freeSpinsForCascades(50)).toBe(200);
  });

  it("a spin's freeSpinsAwarded always matches the ladder for its cascade count", () => {
    for (let seed = 0; seed < 300; seed++) {
      const result = spin({
        rng: mulberry32(seed),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
      });
      const expected = freeSpinsForCascades(result.cascades);
      const expectedAward = result.doorbellPanic
        ? result.doorbellPanic.freeSpinsAwarded
        : result.doubleSparkleApplied
          ? expected * 2
          : expected;
      expect(result.freeSpinsAwarded).toBe(expectedAward);
    }
  });

  it("awards 5–20 spins when a first/second-reel doorbell pair lands", () => {
    const grid: Grid = Array.from({ length: 5 }, (_, reel) =>
      Array.from({ length: 4 }, (_, row) => ({
        symbol: reel < 2 && row === 0 ? "doorbell" as const : "treat_chicken" as const,
      })),
    );
    const result = spin({
      rng: mulberry32(20260712),
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
      startingGrid: grid,
    });

    expect(result.doorbellPanic?.freeSpinsAwarded).toBeGreaterThanOrEqual(5);
    expect(result.doorbellPanic?.freeSpinsAwarded).toBeLessThanOrEqual(20);
    expect(result.freeSpinsAwarded).toBe(result.doorbellPanic?.freeSpinsAwarded);
  });

  it("multiplies only paylines that use the one marked wild", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "treat_chicken" as const })),
    );
    for (let reel = 0; reel < 5; reel++) grid[reel][0] = { symbol: "tumbler" };
    grid[2][0] = { symbol: "wild_joey", multiplier: 3 };

    const result = spin({
      rng: () => 0.5,
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
      startingGrid: grid,
    });
    const firstWin = result.steps[0].wins[0];

    expect(result.steps[0].wins).toHaveLength(1);
    expect(firstWin.multiplier).toBe(3);
    expect(firstWin.payout).toBe(PAYTABLE.tumbler![5] * PAYOUT_SCALE * 3);
  });
});
