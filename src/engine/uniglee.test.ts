import { describe, expect, it } from "vitest";
import { buildUniGleeMarathonPlan, placeUniGleeTrigger, rollUniGleeCapture, UNIGLEE_ACTIVE_REELS, UNIGLEE_MIDDLE_SUB_BONUSES, UNIGLEE_REEL_RATES, UNIGLEE_ACTIVE_RATE } from "./uniglee";
import { mulberry32 } from "./rng";
import { runUniGleeBaseMarathon } from "./uniglee-marathon";
import type { Grid } from "./types";

function blankGrid(): Grid {
  return Array.from({ length: 5 }, () => Array.from({ length: 4 }, () => ({ symbol: "mailbox" as const })));
}

describe("UniGlee marathon plan", () => {
  it.each([
    [40, 10],
    [60, 15],
    [80, 20],
  ] as const)("allocates 25%% quarters for a %i-spin award", (award, quarter) => {
    const plan = buildUniGleeMarathonPlan(mulberry32(20260715), award);

    expect(plan.quarterSpins).toBe(quarter);
    expect(plan.baseSubBonuses).toHaveLength(4);
    expect(plan.baseSubBonuses.every((bonus) => bonus.baseSpins === quarter)).toBe(true);
    expect(plan.baseSubBonuses.reduce((sum, bonus) => sum + bonus.baseSpins, 0)).toBe(award);
    expect(plan.lapQuest).toMatchObject({
      id: "phoebe_lap_quest",
      baseSpins: 0,
      isSweetener: true,
    });
  });

  it("keeps Joey first and Phoebe last while shuffling only the middle three", () => {
    const plan = buildUniGleeMarathonPlan(mulberry32(9), 60);

    expect(plan.order[0]).toBe("joey_laundry_helper");
    expect(plan.order[4]).toBe("phoebe_lap_quest");
    expect([...plan.order.slice(1, 4)].sort()).toEqual([...UNIGLEE_MIDDLE_SUB_BONUSES].sort());
  });

  it("is deterministic for the same seeded RNG", () => {
    const first = buildUniGleeMarathonPlan(mulberry32(77), 80);
    const second = buildUniGleeMarathonPlan(mulberry32(77), 80);

    expect(second).toEqual(first);
  });

  it("marks the first four sub-bonuses as local retrigger owners", () => {
    const plan = buildUniGleeMarathonPlan(mulberry32(1), 40);

    expect(plan.baseSubBonuses.every((bonus) => bonus.ownsRetriggers && !bonus.isSweetener)).toBe(true);
    expect(plan.lapQuest.ownsRetriggers).toBe(true);
  });

  it("places UniGlee only on an active reel and a real payline prefix", () => {
    const placed = placeUniGleeTrigger(mulberry32(20260715), blankGrid());
    const { reel, lineIndex, position, initialAwardSpins, linePositions } = placed.trigger;
    expect(UNIGLEE_ACTIVE_REELS).toContain(reel);
    expect(position[0]).toBe(reel);
    expect(initialAwardSpins).toBe(reel * 20);
    expect(linePositions).toHaveLength(reel + 1);
    expect(linePositions[0][0]).toBe(0);
    expect(lineIndex).toBeGreaterThanOrEqual(0);
    expect(placed.grid[reel][position[1]].symbol).toBe("uniglee");
  });

  it("rolls each reel independently at its own capture rate", () => {
    const rng = mulberry32(20260716);
    const draws = 3_000_000;
    const hits: Record<number, number> = { 2: 0, 3: 0, 4: 0 };
    let total = 0;
    for (let i = 0; i < draws; i++) {
      const reel = rollUniGleeCapture(rng);
      if (reel !== undefined) {
        hits[reel]++;
        total++;
      }
    }
    for (const [reel, rate] of UNIGLEE_REEL_RATES) {
      const measured = hits[reel] / draws;
      expect(measured).toBeGreaterThan(rate * 0.85);
      expect(measured).toBeLessThan(rate * 1.15);
    }
    const combined = total / draws;
    expect(combined).toBeGreaterThan(UNIGLEE_ACTIVE_RATE * 0.9);
    expect(combined).toBeLessThan(UNIGLEE_ACTIVE_RATE * 1.1);
  });

  it("resolves a simultaneous multi-reel hit deterministically to the highest reel", () => {
    // rng always below every rate -> all three reels hit; highest reel must win.
    const reel = rollUniGleeCapture(() => 0);
    expect(reel).toBe(4);
  });

  it("honors an explicitly captured reel when placing the trigger", () => {
    for (const reel of UNIGLEE_ACTIVE_REELS) {
      const placed = placeUniGleeTrigger(mulberry32(5), blankGrid(), reel);
      expect(placed.trigger.reel).toBe(reel);
      expect(placed.trigger.initialAwardSpins).toBe(reel * 20);
    }
  });

  it("resolves all four base chapters with chapter-local spin accounting", () => {
    const result = runUniGleeBaseMarathon(mulberry32(9), 1, 40);
    expect(result.kind).toBe("uniglee_base_marathon_result");
    expect(result.chapters).toHaveLength(4);
    expect(result.chapters.reduce((sum, chapter) => sum + chapter.baseSpins, 0)).toBe(40);
    expect(result.totalSpins).toBeGreaterThanOrEqual(40);
    expect(result.chapters.every((chapter) => chapter.totalSpins >= chapter.baseSpins)).toBe(true);
  });
});
