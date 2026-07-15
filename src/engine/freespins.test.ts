import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { convertChaiToWilds, rollWildMultiplier, runFreeSpinSession, spinFreeRound, spinWheel, wheelWedgeLabel } from "./freespins";
import type { Grid } from "./types";

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
  it("uses the approved no / 2x / 3x / 5x / 10x multiplier boundaries", () => {
    const roll = (value: number) => rollWildMultiplier(() => value);
    expect(roll(0)).toBeUndefined();
    expect(roll(0.1499)).toBeUndefined();
    expect(roll(0.15)).toBe(2);
    expect(roll(0.4999)).toBe(2);
    expect(roll(0.50)).toBe(3);
    expect(roll(0.7999)).toBe(3);
    expect(roll(0.80)).toBe(5);
    expect(roll(0.9499)).toBe(5);
    expect(roll(0.95)).toBe(10);
  });

  it("places exactly one opening-result multiplier wild on its matching reel", () => {
    const round = spinFreeRound(() => 0.2, "multiplying", 1);
    expect(round.multiplierWild).toEqual({ multiplier: 2, position: [1, 0] });
    expect(round.steps[0].grid.flat().filter((cell) => cell.multiplier !== undefined)).toHaveLength(1);
  });

  it("converts every standard iced chai on the opening board into a mermaid-cup wild", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "tumbler" as const })),
    );
    grid[0][1] = { symbol: "chai" };
    grid[3][2] = { symbol: "chai" };

    const converted = convertChaiToWilds(grid);

    expect(converted.chaiRain.wilds).toEqual([
      { position: [0, 1], symbol: "wild_chai" },
      { position: [3, 2], symbol: "wild_chai" },
    ]);
    expect(converted.grid[0][1]).toEqual({ symbol: "wild_chai" });
    expect(converted.grid[3][2]).toEqual({ symbol: "wild_chai" });
    expect(converted.grid[1][1]).toEqual({ symbol: "tumbler" });
  });

  it("fires the Wild Chai Storm once at session entry, never on retriggers", () => {
    const session = runFreeSpinSession(mulberry32(20260715), "chai_back", 1, 8);

    expect(session.rounds[0].chaiRain).toBeDefined();
    expect(session.rounds.slice(1).every((round) => round.chaiRain === undefined)).toBe(true);
  });

  it("does not fire the storm for Bold Chai's legacy session path", () => {
    const session = runFreeSpinSession(mulberry32(20260715), "chai_back", 1, 3, { allowChaiStorm: false });

    expect(session.rounds.every((round) => round.chaiRain === undefined)).toBe(true);
  });

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

  it("rolls a real Keepsake Constellation zone rather than applying a flat win uplift", () => {
    const rng = mulberry32(8675309);
    let zones = 0;
    for (let i = 0; i < 1_000; i++) {
      const round = spinFreeRound(rng, "giant_gnome", 1);
      const zone = round.steps[0].keepsakeZone;
      if (zone) {
        zones++;
        expect(round.steps[0].grid[zone.leftReel][zone.topRow].symbol).toBe(zone.symbol);
      }
    }
    expect(zones).toBeGreaterThan(650);
    expect(zones).toBeLessThan(800);
  });

  it("doorbell panic rounds preload several Joey/Phoebe wilds", () => {
    const round = spinFreeRound(mulberry32(1234), "doorbell_panic", 1);
    const firstGrid = round.steps[0].grid;
    const wildCount = firstGrid.flat().filter((cell) => cell.symbol === "wild_joey" || cell.symbol === "wild_phoebe").length;
    expect(round.panicWildsAdded).toBeGreaterThanOrEqual(3);
    expect(round.panicWildsAdded).toBeLessThanOrEqual(6);
    expect(wildCount).toBeGreaterThanOrEqual(round.panicWildsAdded);
    expect(round.multiplierWild).toBeUndefined();
  });

  it("never introduces doorbells inside any bonus round", () => {
    const wedges = ["multiplying", "giant_gnome", "chai_back", "doorbell_panic", "treat_time_morning", "treat_time_nighttime"] as const;
    for (const [wedgeIndex, wedge] of wedges.entries()) {
      for (let seed = 0; seed < 100; seed++) {
        const round = spinFreeRound(mulberry32(seed + wedgeIndex * 1000), wedge, 1);
        expect(round.steps.flatMap((step) => step.grid.flat()).some((cell) => cell.symbol === "doorbell")).toBe(false);
      }
    }
  });

  it("never introduces Chai Pumps inside any bonus round", () => {
    const wedges = ["multiplying", "giant_gnome", "chai_back", "doorbell_panic", "treat_time_morning", "treat_time_nighttime"] as const;
    for (const [wedgeIndex, wedge] of wedges.entries()) {
      for (let seed = 0; seed < 100; seed++) {
        const round = spinFreeRound(mulberry32(seed + wedgeIndex * 1000), wedge, 1);
        expect(round.steps.flatMap((step) => step.grid.flat()).some((cell) => cell.symbol === "chai_pump")).toBe(false);
      }
    }
  });
});

describe("free spin session", () => {
  it("adds three separate ten-spin retriggers to the playable bank", () => {
    const session = runFreeSpinSession(mulberry32(519), "multiplying", 1, 67);
    const retriggerRounds = session.rounds.filter((round) => round.freeSpinsAwarded > 0);

    expect(session.initialSpins).toBe(67);
    expect(retriggerRounds.map((round) => round.freeSpinsAwarded)).toEqual([10, 10, 10]);
    expect(session.retriggers).toBe(3);
    expect(session.retriggerSpins).toBe(30);
    expect(session.totalSpins).toBe(97);
    expect(session.rounds).toHaveLength(97);
    expect(session.rounds[session.rounds.length - 1]?.spinsRemaining).toBe(0);
  });

  it("terminates and accounts for retriggers extending the session", () => {
    const rng = mulberry32(99);
    const session = runFreeSpinSession(rng, "multiplying", 1, 8);
    const awardedByRounds = session.rounds.reduce((sum, round) => sum + round.freeSpinsAwarded, 0);
    expect(session.rounds.length).toBeGreaterThanOrEqual(8);
    expect(session.initialSpins).toBe(8);
    expect(session.retriggerSpins).toBe(awardedByRounds);
    expect(session.totalSpins).toBe(8 + awardedByRounds);
    expect(session.rounds.length).toBe(session.totalSpins);
    expect(session.rounds[session.rounds.length - 1]?.spinsRemaining).toBe(0);
    expect(session.totalWin).toBeGreaterThanOrEqual(0);
  });

  it("with zero spins awarded, runs zero rounds", () => {
    const session = runFreeSpinSession(mulberry32(1), "chai_back", 1, 0);
    expect(session.initialSpins).toBe(0);
    expect(session.retriggerSpins).toBe(0);
    expect(session.totalSpins).toBe(0);
    expect(session.rounds.length).toBe(0);
    expect(session.totalWin).toBe(0);
  });
});
