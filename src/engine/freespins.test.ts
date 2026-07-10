import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { runFreeSpinSession, spinFreeRound, spinWheel, wheelWedgeLabel } from "./freespins";

describe("AskJamie wheel", () => {
  it("always lands on one of the three wedges", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const wedge = spinWheel(rng);
      expect(["multiplying", "giant_gnome", "chai_back"]).toContain(wedge);
      expect(wheelWedgeLabel(wedge).length).toBeGreaterThan(0);
    }
  });
});

describe("free spin rounds", () => {
  it("never produces a negative or NaN win", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 200; i++) {
      const round = spinFreeRound(rng, "multiplying", 1);
      expect(Number.isFinite(round.totalWin)).toBe(true);
      expect(round.totalWin).toBeGreaterThanOrEqual(0);
    }
  });

  it("giant_gnome and chai_back rounds also stay finite and non-negative", () => {
    const rng = mulberry32(43);
    for (let i = 0; i < 100; i++) {
      expect(spinFreeRound(rng, "giant_gnome", 1).totalWin).toBeGreaterThanOrEqual(0);
      expect(spinFreeRound(rng, "chai_back", 1).totalWin).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("free spin session", () => {
  it("terminates and accounts for retriggers extending the session", () => {
    const rng = mulberry32(99);
    const session = runFreeSpinSession(rng, "multiplying", 1, 8);
    expect(session.rounds.length).toBeGreaterThanOrEqual(8);
    expect(session.rounds.length).toBe(8 + session.rounds.filter((r) => r.freeSpinsAwarded > 0).reduce((s, r) => s + r.freeSpinsAwarded, 0));
    expect(session.totalWin).toBeGreaterThanOrEqual(0);
  });

  it("with zero spins awarded, runs zero rounds", () => {
    const session = runFreeSpinSession(mulberry32(1), "chai_back", 1, 0);
    expect(session.rounds.length).toBe(0);
    expect(session.totalWin).toBe(0);
  });
});
