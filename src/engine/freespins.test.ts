import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import {
  convertChaiToWilds,
  rollWildMultiplier,
  runFreeSpinSession,
  runJoeyLaundrySession,
  spinFreeRound,
  spinJoeyLaundryRound,
  spinWheel,
  wheelWedgeLabel,
  type FreeSpinMode,
} from "./freespins";
import type { Grid } from "./types";

const NO_LAUNDRY_EFFECTS = {
  sockDropRate: 0,
  pawStrikeRate: 0,
  multiplierWeights: { 2: 1, 3: 1, 5: 1 },
} as const;

describe("AskJamie wheel", () => {
  it("always lands on one of the three wedges", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const wedge = spinWheel(rng);
      expect(["multiplying", "keepsake_memory", "chai_back"]).toContain(wedge);
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

  it("keepsake_memory and chai_back rounds also stay finite and non-negative", () => {
    const rng = mulberry32(43);
    for (let i = 0; i < 100; i++) {
      const keepsakeRound = spinFreeRound(rng, "keepsake_memory", 1);
      expect(keepsakeRound.totalWin).toBeGreaterThanOrEqual(0);
      expect(keepsakeRound.steps.every((step) => step.keepsakeZone === undefined)).toBe(true);
      expect(spinFreeRound(rng, "chai_back", 1).totalWin).toBeGreaterThanOrEqual(0);
    }
  });

  it("runs successful Keepsake Trail awards as unmodified standard free spins", () => {
    const standard = spinFreeRound(mulberry32(8675309), "standard", 1);
    expect(standard.multiplierWild).toBeUndefined();
    expect(standard.extraWildsAdded).toBe(0);
    expect(standard.panicWildsAdded).toBe(0);
    expect(standard.steps.every((step) => step.keepsakeZone === undefined)).toBe(true);
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
    const wedges = ["multiplying", "keepsake_memory", "chai_back", "doorbell_panic", "treat_time_morning", "treat_time_nighttime"] as const;
    for (const [wedgeIndex, wedge] of wedges.entries()) {
      for (let seed = 0; seed < 100; seed++) {
        const round = spinFreeRound(mulberry32(seed + wedgeIndex * 1000), wedge, 1);
        expect(round.steps.flatMap((step) => step.grid.flat()).some((cell) => cell.symbol === "doorbell")).toBe(false);
      }
    }
  });

  it("never introduces Chai Pumps inside any bonus round", () => {
    const wedges = ["multiplying", "keepsake_memory", "chai_back", "doorbell_panic", "treat_time_morning", "treat_time_nighttime"] as const;
    for (const [wedgeIndex, wedge] of wedges.entries()) {
      for (let seed = 0; seed < 100; seed++) {
        const round = spinFreeRound(mulberry32(seed + wedgeIndex * 1000), wedge, 1);
        expect(round.steps.flatMap((step) => step.grid.flat()).some((cell) => cell.symbol === "chai_pump")).toBe(false);
      }
    }
  });

  it("plumbs Joey Laundry effects through a secondary round without nesting bonuses", () => {
    const round = spinJoeyLaundryRound(mulberry32(20260715), 1, {
      blockIndex: 0,
      roundOrdinal: 0,
      config: { ...NO_LAUNDRY_EFFECTS, sockDropRate: 1 },
    });

    expect(round.laundryEffect?.chapter).toBe("joey_laundry_helper");
    expect(round.laundryEffect?.sockDrop?.wildPositions).toHaveLength(4);
    expect(round.unigleeTriggered).toBe(false);
    expect(round.doorbellPanic).toBeUndefined();
    expect(round.boldChaiPump).toBeUndefined();
    expect(round.treatTimeBonus).toBeUndefined();
  });
});

describe("free spin session", () => {
  it("blocks retriggers: sessions play exactly their initial award", () => {
    const session = runFreeSpinSession(mulberry32(519), "multiplying", 1, 67);

    expect(session.initialSpins).toBe(67);
    expect(session.retriggers).toBe(0);
    expect(session.retriggerSpins).toBe(0);
    expect(session.totalSpins).toBe(67);
    expect(session.rounds).toHaveLength(67);
    expect(session.rounds.every((round) => round.freeSpinsAwarded === 0)).toBe(true);
    expect(session.rounds[session.rounds.length - 1]?.spinsRemaining).toBe(0);
  });

  it("terminates after the initial award with no retrigger extension", () => {
    const rng = mulberry32(99);
    const session = runFreeSpinSession(rng, "multiplying", 1, 8);
    expect(session.initialSpins).toBe(8);
    expect(session.retriggerSpins).toBe(0);
    expect(session.totalSpins).toBe(8);
    expect(session.rounds.length).toBe(8);
    expect(session.rounds.every((round) => round.freeSpinsAwarded === 0)).toBe(true);
    expect(session.rounds[session.rounds.length - 1]?.spinsRemaining).toBe(0);
    expect(session.totalWin).toBeGreaterThanOrEqual(0);
  });

  it("blocks retriggers across every wedge (engine-wide invariant)", () => {
    const wedges: FreeSpinMode[] = [
      "multiplying",
      "keepsake_memory",
      "keepsake_collection",
      "chai_back",
      "doorbell_panic",
      "treat_time_morning",
      "treat_time_nighttime",
      "standard",
    ];
    for (const wedge of wedges) {
      const session = runFreeSpinSession(mulberry32(2026), wedge as never, 1, 15);
      expect(session.retriggers).toBe(0);
      expect(session.retriggerSpins).toBe(0);
      expect(session.totalSpins).toBe(15);
      expect(session.rounds).toHaveLength(15);
      expect(session.rounds.every((round) => round.freeSpinsAwarded === 0)).toBe(true);
    }
  });

  it("supports additive Treat Jar spins without retriggers", () => {
    const session = runFreeSpinSession(mulberry32(519), "multiplying", 1, 67, { allowRetriggers: false });
    expect(session.initialSpins).toBe(67);
    expect(session.totalSpins).toBe(67);
    expect(session.retriggers).toBe(0);
    expect(session.retriggerSpins).toBe(0);
    expect(session.rounds).toHaveLength(67);
    expect(session.rounds.every((round) => round.freeSpinsAwarded === 0)).toBe(true);
    expect(session.rounds[session.rounds.length - 1]?.spinsRemaining).toBe(0);
  });

  it("with zero spins awarded, runs zero rounds", () => {
    const session = runFreeSpinSession(mulberry32(1), "chai_back", 1, 0);
    expect(session.initialSpins).toBe(0);
    expect(session.retriggerSpins).toBe(0);
    expect(session.totalSpins).toBe(0);
    expect(session.rounds.length).toBe(0);
    expect(session.totalWin).toBe(0);
  });

  it("keeps Joey's 25% allocation and retriggers inside Joey's queue", () => {
    const session = runJoeyLaundrySession(mulberry32(20260715), 1, 40, NO_LAUNDRY_EFFECTS);

    expect(session.chapter).toBe("joey_laundry_helper");
    expect(session.budget.initialAllocation).toBe(10);
    expect(session.budget.remainingSpins).toBe(0);
    expect(session.rounds.length).toBe(10 + session.budget.retriggerSpins);
    expect(session.rounds.length).toBe(10 + session.rounds.reduce((sum, round) => sum + round.freeSpinsAwarded, 0));
    expect(session.rounds.every((round) => round.laundryEffect?.chapter === "joey_laundry_helper")).toBe(true);
    expect(session.rounds.every((round) => round.unigleeTriggered === false)).toBe(true);
  });

  it("starts a successful Keepsake Trail handoff in explicit standard mode", () => {
    const session = runFreeSpinSession(mulberry32(20260715), "standard", 1, 40);
    expect(session.wedge).toBe("standard");
    expect(session.rounds).toHaveLength(40 + session.rounds.filter((round) => round.freeSpinsAwarded > 0).reduce((sum, round) => sum + round.freeSpinsAwarded, 0));
    expect(session.rounds.every((round) => round.multiplierWild === undefined && round.panicWildsAdded === 0 && round.extraWildsAdded === 0)).toBe(true);
  });
});
