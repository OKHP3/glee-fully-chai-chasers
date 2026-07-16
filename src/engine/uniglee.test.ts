import { describe, expect, it } from "vitest";
import { buildUniGleeMarathonPlan, UNIGLEE_MIDDLE_SUB_BONUSES } from "./uniglee";
import { mulberry32 } from "./rng";

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
});

