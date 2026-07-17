import { describe, expect, it, vi, afterEach } from "vitest";
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

describe("playLevelUpFanfare sfxEnabled guard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("creates no oscillators when sfxEnabled is false, creates oscillators when true", async () => {
    const createOscillator = vi.fn(() => ({
      type: "sine" as OscillatorType,
      frequency: { value: 440 },
      connect: vi.fn().mockReturnThis(),
      start: vi.fn(),
      stop: vi.fn(),
    }));
    const gainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
    };
    const mockCtx = {
      createOscillator,
      createGain: vi.fn(() => gainNode),
      currentTime: 0,
      state: "running" as AudioContextState,
      destination: {} as AudioDestinationNode,
      resume: vi.fn().mockResolvedValue(undefined),
    };

    function FakeAudioContext() { return mockCtx; }
    vi.stubGlobal("window", { AudioContext: FakeAudioContext });

    vi.resetModules();
    const synth = await import("./synth");
    synth.unlock();

    synth.setSfxEnabled(false);
    synth.playLevelUpFanfare();
    expect(createOscillator).not.toHaveBeenCalled();

    synth.setSfxEnabled(true);
    synth.playLevelUpFanfare();
    expect(createOscillator).toHaveBeenCalled();
  });
});
