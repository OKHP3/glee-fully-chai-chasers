import { describe, expect, it } from "vitest";
import { buildUniGleeMarathonPlan, placeUniGleeTrigger, UNIGLEE_ACTIVE_REELS, UNIGLEE_MIDDLE_SUB_BONUSES } from "./uniglee";
import { mulberry32 } from "./rng";
import { runUniGleeBaseMarathon } from "./uniglee-marathon";
import type { Grid } from "./types";

function blankGrid(): Grid {
  return Array.from({ length: 5 }, () => Array.from({ length: 4 }, () => ({ symbol: "mailbox" as const })));
}

describe("UniGlee marathon plan", () => {
  it.each([
    [300, 75],
    [400, 100],
    [500, 125],
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
    const plan = buildUniGleeMarathonPlan(mulberry32(9), 400);

    expect(plan.order[0]).toBe("joey_laundry_helper");
    expect(plan.order[4]).toBe("phoebe_lap_quest");
    expect([...plan.order.slice(1, 4)].sort()).toEqual([...UNIGLEE_MIDDLE_SUB_BONUSES].sort());
  });

  it("is deterministic for the same seeded RNG", () => {
    const first = buildUniGleeMarathonPlan(mulberry32(77), 500);
    const second = buildUniGleeMarathonPlan(mulberry32(77), 500);

    expect(second).toEqual(first);
  });

  it("marks the first four sub-bonuses as local retrigger owners", () => {
    const plan = buildUniGleeMarathonPlan(mulberry32(1), 300);

    expect(plan.baseSubBonuses.every((bonus) => bonus.ownsRetriggers && !bonus.isSweetener)).toBe(true);
    expect(plan.lapQuest.ownsRetriggers).toBe(true);
  });

  it("places UniGlee only on an active reel and a real payline prefix", () => {
    const placed = placeUniGleeTrigger(mulberry32(20260715), blankGrid());
    const { reel, lineIndex, position, initialAwardSpins, linePositions } = placed.trigger;
    expect(UNIGLEE_ACTIVE_REELS).toContain(reel);
    expect(position[0]).toBe(reel);
    expect(initialAwardSpins).toBe((reel + 1) * 100);
    expect(linePositions).toHaveLength(reel + 1);
    expect(linePositions[0][0]).toBe(0);
    expect(lineIndex).toBeGreaterThanOrEqual(0);
    expect(placed.grid[reel][position[1]].symbol).toBe("uniglee");
  });

  it("resolves all four base chapters with chapter-local spin accounting", () => {
    const result = runUniGleeBaseMarathon(mulberry32(9), 1, 300);
    expect(result.kind).toBe("uniglee_base_marathon_result");
    expect(result.chapters).toHaveLength(4);
    expect(result.chapters.reduce((sum, chapter) => sum + chapter.baseSpins, 0)).toBe(300);
    expect(result.totalSpins).toBeGreaterThanOrEqual(300);
    expect(result.chapters.every((chapter) => chapter.totalSpins >= chapter.baseSpins)).toBe(true);
  });
});
