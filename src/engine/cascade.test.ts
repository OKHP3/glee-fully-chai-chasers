import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { freeSpinsForCascades, spin } from "./cascade";
import { emptyTreatJar } from "./features";

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
      expect(result.freeSpinsAwarded).toBe(result.doubleSparkleApplied ? expected * 2 : expected);
    }
  });
});
