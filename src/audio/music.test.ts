import { describe, expect, it } from "vitest";
import { BASE_SCORE_DURATION_SECONDS, setBoldChaiUrgency } from "./music";

describe("Chai Chase base score", () => {
  it("keeps the composed loop at exactly one minute", () => {
    expect(BASE_SCORE_DURATION_SECONDS).toBe(60);
  });

  it("exposes a safe urgency toggle before audio unlock", () => {
    expect(() => setBoldChaiUrgency(true)).not.toThrow();
    expect(() => setBoldChaiUrgency(false)).not.toThrow();
  });
});
