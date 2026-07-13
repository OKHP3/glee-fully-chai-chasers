import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { castTreatTimeWilds, rollTreatTimeTrigger, TREAT_TIME_WILD_RANGE } from "./treattime";
import { spinFreeRound, runFreeSpinSession } from "./freespins";
import { spin } from "./cascade";
import { emptyTreatJar } from "./features";
import { REELS, ROWS } from "./reels";
import type { Grid } from "./types";

function blankGrid(): Grid {
  return Array.from({ length: REELS }, () => Array.from({ length: ROWS }, () => ({ symbol: "treat_chicken" as const })));
}

describe("Treat Time trigger math", () => {
  it("integrates the trigger into a base spin without changing its cascade stream", () => {
    const result = spin({
      rng: mulberry32(20260713),
      treatTimeRng: () => 0,
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
    });
    expect(result.treatTimeBonus).toEqual({ mode: "nighttime", freeSpinsAwarded: 14 });
  });

  it("awards Morning Treat Time between 7 and 14 spins", () => {
    expect(rollTreatTimeTrigger(() => 0, "morning")).toEqual({ mode: "morning", freeSpinsAwarded: 7 });
    expect(rollTreatTimeTrigger(() => 0.999999, "morning")).toBeUndefined();
  });

  it("awards rarer Nighttime Treat Time between 14 and 50 spins", () => {
    let calls = 0;
    const lowest = () => (calls++ === 0 ? 0 : 0);
    expect(rollTreatTimeTrigger(lowest, "nighttime")).toEqual({ mode: "nighttime", freeSpinsAwarded: 14 });

    calls = 0;
    const highest = () => (calls++ === 0 ? 0.999999 : 0.999999);
    expect(rollTreatTimeTrigger(highest, "nighttime")).toBeUndefined();
  });

  it("keeps the default modes independently readable", () => {
    let calls = 0;
    const nighttime = () => (calls++ === 0 ? 0 : 0.5);
    expect(rollTreatTimeTrigger(nighttime)).toMatchObject({ mode: "nighttime", freeSpinsAwarded: 32 });

    calls = 0;
    const morning = () => (calls++ === 0 ? 0.005 : 0.5);
    expect(rollTreatTimeTrigger(morning)).toMatchObject({ mode: "morning", freeSpinsAwarded: 11 });
  });
});

describe("Treat Time wild casting", () => {
  it("casts 2–10 unique wilds and replaces the existing cells", () => {
    const result = castTreatTimeWilds(() => 0.999999, blankGrid(), "nighttime");
    expect(result.wilds.length).toBe(TREAT_TIME_WILD_RANGE.max);
    expect(new Set(result.wilds.map((wild) => wild.position.join(":"))).size).toBe(result.wilds.length);
    expect(result.wilds.every((wild) => wild.treat === "boogie" && wild.wild === "joey")).toBe(true);
    result.wilds.forEach(({ position }) => {
      expect(result.grid[position[0]][position[1]].symbol).toBe("wild_joey");
    });
  });

  it("keeps Morning Treat Time Phoebe-only", () => {
    const result = castTreatTimeWilds(() => 0, blankGrid(), "morning");
    expect(result.wilds.length).toBe(TREAT_TIME_WILD_RANGE.min);
    expect(result.wilds.every((wild) => wild.treat === "chicken" && wild.wild === "phoebe")).toBe(true);
  });
});

describe("Treat Time free-spin rounds", () => {
  it("preloads the returned treat wilds before cascade evaluation", () => {
    const round = spinFreeRound(mulberry32(20260713), "treat_time_nighttime", 1);
    expect(round.treatTimeMode).toBe("nighttime");
    expect(round.treatTimeWilds?.length).toBeGreaterThanOrEqual(2);
    expect(round.treatTimeWilds?.length).toBeLessThanOrEqual(10);
    round.treatTimeWilds?.forEach(({ position, wild }) => {
      expect(round.steps[0].grid[position[0]][position[1]].symbol).toBe(wild === "joey" ? "wild_joey" : "wild_phoebe");
    });
    expect(round.steps[round.steps.length - 1].wins).toHaveLength(0);
  });

  it("terminates a Treat Time session and honors cascade retriggers", () => {
    const session = runFreeSpinSession(mulberry32(77), "treat_time_morning", 1, 7);
    expect(session.rounds.length).toBeGreaterThanOrEqual(7);
    expect(session.rounds.every((round) => round.treatTimeMode === "morning")).toBe(true);
    expect(session.totalWin).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(session.totalWin)).toBe(true);
  });
});
