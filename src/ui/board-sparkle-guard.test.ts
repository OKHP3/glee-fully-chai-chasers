// @vitest-environment jsdom
/**
 * Board integration test: confirms playSpinStart() cannot fire when
 * the sparkle button is disabled (reel mid-spin or locked).
 *
 * This test catches any accidental reordering of the guard in wireControls.
 * See: src/ui/board.ts — sparkleBtn click handler.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --- module mocks (hoisted before imports) -----------------------------------

vi.mock("../audio/synth", async (importOriginal) => {
  const real = await importOriginal<typeof import("../audio/synth")>();
  return {
    ...real,
    // Replace only what the click handler calls so we can spy cleanly.
    isUnlocked: vi.fn().mockReturnValue(true),
    unlock: vi.fn(),
    playSpinStart: vi.fn(),
    // These are called elsewhere in the board init; stub them silently.
    setSfxEnabled: vi.fn(),
    setSfxVolume: vi.fn(),
    setMusicEnabled: vi.fn(),
  };
});

vi.mock("../audio/music", () => ({
  MUSIC_VOLUME_MAX: 7,
  startBaseMusic: vi.fn(),
  stopBaseMusic: vi.fn(),
  startUniGleeMusic: vi.fn(),
  stopUniGleeMusic: vi.fn(),
  setBoldChaiUrgency: vi.fn(),
  setMusicVolume: vi.fn(),
  clampMusicVolume: (v: number) => Math.min(7, Math.max(0, v)),
}));

// ---------------------------------------------------------------------------

import { renderBoard } from "./board";
import * as synth from "../audio/synth";
import type { GameState } from "../state";

function makeState(): GameState {
  return {
    balance: 1000,
    bet: 1,
    xp: 0,
    treatJar: { chicken: 0, salmon: 0, bougie: 0 },
    pendingTreatJarSpins: 0,
    fireflyMeter: 0,
    bestCascade: 0,
    spinsSincePopIn: 0,
    soundOn: true,
    paylineGuideOn: false,
    musicVolume: 1,
    sfxVolume: 0.82,
    theme: "dark",
    reducedMotion: false,
  };
}

describe("sparkle button disabled guard — playSpinStart cannot fire mid-spin", () => {
  let root: HTMLDivElement;

  beforeEach(() => {
    // jsdom does not implement matchMedia; stub it so resolveTheme doesn't throw.
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });

    vi.mocked(synth.playSpinStart).mockClear();
    vi.mocked(synth.isUnlocked).mockReturnValue(true);

    root = document.createElement("div");
    document.body.appendChild(root);
    renderBoard(root, makeState());
  });

  afterEach(() => {
    document.body.removeChild(root);
    vi.clearAllMocks();
  });

  it("does NOT call playSpinStart when sparkle button is disabled", () => {
    const btn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    btn.disabled = true;
    // Use dispatchEvent (not btn.click()) so the registered listener runs
    // even though the button is disabled — this is the condition that mimics
    // a mid-spin or locked reel. The guard inside wireControls is what must
    // prevent playSpinStart from firing, not the native disabled suppression.
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(synth.playSpinStart).not.toHaveBeenCalled();
  });

  it("DOES call playSpinStart when sparkle button is enabled", () => {
    const btn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    btn.disabled = false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    // playSpinStart is synchronous and fires before the async runSpin call.
    expect(synth.playSpinStart).toHaveBeenCalledOnce();
  });
});
