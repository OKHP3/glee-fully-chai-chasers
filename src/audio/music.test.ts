import { describe, expect, it } from "vitest";
import { BASE_SCORE_DURATION_SECONDS, clampMusicVolume, MUSIC_VOLUME_MAX, setBoldChaiUrgency } from "./music";

describe("Chai Chase base score", () => {
  it("keeps the composed loop at exactly one minute", () => {
    expect(BASE_SCORE_DURATION_SECONDS).toBe(60);
  });

  it("keeps the former 100% level while allowing a 3x music ceiling", () => {
    expect(MUSIC_VOLUME_MAX).toBe(3);
    expect(clampMusicVolume(1)).toBe(1);
    expect(clampMusicVolume(3)).toBe(3);
    expect(clampMusicVolume(4)).toBe(3);
    expect(clampMusicVolume(-1)).toBe(0);
  });

  it("exposes a safe urgency toggle before audio unlock", () => {
    expect(() => setBoldChaiUrgency(true)).not.toThrow();
    expect(() => setBoldChaiUrgency(false)).not.toThrow();
  });
});
