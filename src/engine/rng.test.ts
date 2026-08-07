import { describe, expect, it } from "vitest";
import { mulberry32, pickWeighted } from "./rng";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it("stays in [0, 1)", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 10_000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("pickWeighted", () => {
  it("respects weights over a large sample", () => {
    const rng = mulberry32(7);
    let hits = 0;
    for (let i = 0; i < 100_000; i++) {
      if (pickWeighted(rng, [["a", 9], ["b", 1]]) === "b") hits++;
    }
    expect(hits / 100_000).toBeGreaterThan(0.08);
    expect(hits / 100_000).toBeLessThan(0.12);
  });
});
