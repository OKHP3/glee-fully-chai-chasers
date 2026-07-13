import { describe, expect, it } from "vitest";
import { BASE_SCORE_DURATION_SECONDS } from "./music";

describe("Chai Chase base score", () => {
  it("keeps the composed loop at exactly one minute", () => {
    expect(BASE_SCORE_DURATION_SECONDS).toBe(60);
  });
});
