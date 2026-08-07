import { describe, expect, it } from "vitest";
import {
  advanceLapQuestSession,
  createLapQuestSession,
  petLapQuestSession,
  terminateLapQuestSession,
  type LapQuestSessionConfig,
} from "./lap-quest-session";
import { mulberry32 } from "./rng";

const CONFIG: LapQuestSessionConfig = {
  minDurationMs: 15_000,
  maxDurationMs: 90_000,
  inactivityTimeoutMs: 5_000,
  pointTickMs: 1_000,
  lapCoinsByTick: [2, 4, 6],
};

describe("Phoebe's Lap Quest timed session", () => {
  it("samples one Joey deadline within the inclusive contract bounds", () => {
    const early = createLapQuestSession(100, () => 0, CONFIG);
    const late = createLapQuestSession(100, () => 1, CONFIG);

    expect(early.joeyArrivalAtMs).toBe(100 + CONFIG.minDurationMs);
    expect(late.joeyArrivalAtMs).toBe(100 + CONFIG.maxDurationMs);
  });

  it("keeps grace pet-free and ends after five seconds of post-grace silence", () => {
    const state = createLapQuestSession(0, () => 0.9, CONFIG);
    expect(advanceLapQuestSession(state, 14_999, CONFIG).state.phase).toBe("grace");
    expect(advanceLapQuestSession(state, 15_000, CONFIG).state.phase).toBe("petting");

    const ended = advanceLapQuestSession(state, 20_000, CONFIG);
    expect(ended.endReason).toBe("unpetted");
    expect(ended.state.lapCoinsAwarded).toBe(12);
  });

  it("resets the inactivity watchdog without awarding for tap volume", () => {
    const state = createLapQuestSession(0, () => 0.9, CONFIG);
    const firstPet = petLapQuestSession(state, 15_000, CONFIG);
    const secondPet = petLapQuestSession(firstPet.state, 19_999, CONFIG);
    const stillSettled = advanceLapQuestSession(secondPet.state, 24_998, CONFIG);
    const ended = advanceLapQuestSession(secondPet.state, 24_999, CONFIG);

    expect(firstPet.accepted).toBe(true);
    expect(secondPet.accepted).toBe(true);
    expect(secondPet.state.petCount).toBe(2);
    expect(secondPet.pointsAwarded).toBe(0);
    expect(stillSettled.state.phase).toBe("petting");
    expect(ended.endReason).toBe("unpetted");
  });

  it("ends at the one-time Joey deadline and leaves prior points intact", () => {
    const state = createLapQuestSession(0, () => 0, CONFIG);
    const ended = advanceLapQuestSession(state, 15_000, CONFIG);

    expect(ended.endReason).toBe("joey_interrupt");
    expect(ended.state.lapCoinsAwarded).toBe(12);
    expect(ended.state.joeyArrivalAtMs).toBe(15_000);
  });

  it("supports explicit cap and parent termination reasons", () => {
    const capped = terminateLapQuestSession(
      createLapQuestSession(0, () => 0.9, CONFIG),
      25_000,
      "cap_reached",
      CONFIG,
    );
    const parentEnded = terminateLapQuestSession(
      createLapQuestSession(0, () => 0.9, CONFIG),
      25_000,
      "marathon_ended",
      CONFIG,
    );

    expect(capped.endReason).toBe("cap_reached");
    expect(parentEnded.endReason).toBe("marathon_ended");
    expect(capped.state.lapCoinsAwarded).toBe(12);
    expect(parentEnded.state.lapCoinsAwarded).toBe(12);
  });

  it("accrues the caller-supplied ladder by completed elapsed ticks", () => {
    const state = createLapQuestSession(0, () => 0.9, CONFIG);
    const first = advanceLapQuestSession(state, 999, CONFIG);
    const second = advanceLapQuestSession(first.state, 3_000, CONFIG);
    const later = advanceLapQuestSession(second.state, 10_000, CONFIG);

    expect(first.pointsAwarded).toBe(0);
    expect(second.pointsAwarded).toBe(12);
    expect(later.pointsAwarded).toBe(0);
    expect(later.state.lapCoinsAwarded).toBe(12);
    expect(later.state.lapCoinsAwarded).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic and does not reroll Joey when the player pets", () => {
    const run = () => {
      const initial = createLapQuestSession(2_000, mulberry32(20260715), CONFIG);
      const pet = petLapQuestSession(initial, 18_000, CONFIG);
      return advanceLapQuestSession(pet.state, 22_000, CONFIG).state;
    };

    expect(run()).toEqual(run());
    const initial = createLapQuestSession(2_000, mulberry32(20260715), CONFIG);
    const pet = petLapQuestSession(initial, 18_000, CONFIG);
    expect(pet.state.joeyArrivalAtMs).toBe(initial.joeyArrivalAtMs);
  });

  it("makes post-end advance and pet calls idempotent", () => {
    const state = createLapQuestSession(0, () => 0, CONFIG);
    const ended = advanceLapQuestSession(state, 15_000, CONFIG);
    const advancedAgain = advanceLapQuestSession(ended.state, 50_000, CONFIG);
    const pettedAgain = petLapQuestSession(ended.state, 15_001, CONFIG);

    expect(advancedAgain.state).toEqual(ended.state);
    expect(advancedAgain.pointsAwarded).toBe(0);
    expect(pettedAgain.accepted).toBe(false);
    expect(pettedAgain.rejectionReason).toBe("session_ended");
    expect(pettedAgain.state).toEqual(ended.state);
  });
});
