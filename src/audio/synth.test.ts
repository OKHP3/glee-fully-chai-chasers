import { describe, expect, it } from "vitest";
import { clampSfxVolume, SFX_VOLUME_MAX } from "./synth";

describe("Chai Chase sound effects mix", () => {
  it("keeps the former 100% level while allowing a 2x effects ceiling", () => {
    expect(SFX_VOLUME_MAX).toBe(2);
    expect(clampSfxVolume(1)).toBe(1);
    expect(clampSfxVolume(2)).toBe(2);
    expect(clampSfxVolume(3)).toBe(2);
    expect(clampSfxVolume(-1)).toBe(0);
  });
});
