// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Grid, SpinResult } from "../engine/types";
import type { GameState } from "../state";
import { createKeepsakeMemory } from "../engine/keepsake-memory";
import { mulberry32 } from "../engine/rng";
import { sparksForSpin } from "../engine/economy";
import { spin } from "../engine/cascade";
import { createKeepsakeMemoryController, maybeLevelUpAfterBonus, renderBoard, renderGridHtml } from "./board";

// ── Module-level mocks ────────────────────────────────────────────────────────
// Audio modules require Web Audio API unavailable in jsdom.  Replace every
// imported symbol with a no-op vi.fn() so board.ts can be exercised without
// a real audio context.
vi.mock("../audio/synth", () => ({
  isUnlocked: vi.fn(() => true),
  unlock: vi.fn(),
  playBonusFanfare: vi.fn(),
  playChaiStorm: vi.fn(),
  playCascadeArpeggio: vi.fn(),
  playCascadeTick: vi.fn(),
  playDoorbellRing: vi.fn(),
  playBoldChaiCupSwap: vi.fn(),
  playBoldChaiPumpPress: vi.fn(),
  playBoldChaiTimerBuzzer: vi.fn(),
  playKeepsakeCardFlip: vi.fn(),
  playKeepsakeFailure: vi.fn(),
  playKeepsakeMatch: vi.fn(),
  playKeepsakeMismatch: vi.fn(),
  playKeepsakeSuccess: vi.fn(),
  playJoeyCue: vi.fn(),
  playLaundryPawStrike: vi.fn(),
  playLaundrySockDrop: vi.fn(),
  playPhoebeCue: vi.fn(),
  playLapQuestReveal: vi.fn(),
  playLapQuestWildLand: vi.fn(),
  playTreatLand: vi.fn(),
  playTreatTimeCue: vi.fn(),
  playLevelUpFanfare: vi.fn(),
  playUniGleeSting: vi.fn(),
  playWinPluck: vi.fn(),
  playWheelTick: vi.fn(),
  playSpinStart: vi.fn(),
  playStrangerDangerPanic: vi.fn(),
  SFX_VOLUME_MAX: 1,
  setMusicEnabled: vi.fn(),
  setSfxEnabled: vi.fn(),
  setSfxVolume: vi.fn(),
}));

vi.mock("../audio/music", () => ({
  isBaseMusicRunning: vi.fn(() => false),
  MUSIC_VOLUME_MAX: 1,
  setBoldChaiUrgency: vi.fn(),
  setMusicVolume: vi.fn(),
  startBaseMusic: vi.fn(),
  startUniGleeMusic: vi.fn(),
  stopBaseMusic: vi.fn(),
  stopUniGleeMusic: vi.fn(),
}));

// Mock the cascade engine so tests control spin outcomes precisely.
vi.mock("../engine/cascade", () => ({ spin: vi.fn() }));

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Minimal 5×4 grid: every cell is a plain "vhs" symbol (no wilds/bonuses). */
function minimalGrid(): Grid {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 4 }, () => ({ symbol: "vhs" as const })),
  );
}

/** Spin result with no bonus triggers, no wins, and no level-crossing XP. */
function noBonusResult(overrides: Partial<SpinResult> = {}): SpinResult {
  return {
    totalWin: 0,
    cascades: 0,
    treatsCollected: [],
    unigleeTriggered: false,
    unigleeTrigger: undefined,
    doorbellPanic: null,
    boldChaiPump: false,
    catVisit: null,
    freeSpinsAwarded: 0,
    treatTimeBonus: null,
    steps: [{ grid: minimalGrid(), wins: [], meterAfter: 0 }],
    ...overrides,
  } as unknown as SpinResult;
}

/** GameState with XP just below level 2 so a single small spin never level-ups. */
function makeSpinState(): GameState {
  return {
    xp: 490,   // level 2 needs 500 XP; sparksForSpin(25) ≈ 2 → stays at level 1
    bet: 25,
    balance: 10_000,
    treatJar: { chicken: 0, salmon: 0, bougie: 0 },
    pendingTreatJarSpins: 0,
    fireflyMeter: 0,
    bestCascade: 0,
    spinsSincePopIn: 0,
    soundOn: false,
    paylineGuideOn: false,
    musicVolume: 1,
    sfxVolume: 1,
    theme: "dark",
    reducedMotion: false,
  } as GameState;
}

// ── Existing test suites ──────────────────────────────────────────────────────

describe("free-spin multiplier overlay", () => {
  it("renders the one marked wild with its visible multiplier badge", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "tumbler" as const })),
    );
    grid[4][2] = { symbol: "wild_phoebe", multiplier: 10 };

    const html = renderGridHtml(grid);

    expect(html).toContain('class="cell multiplier-wild"');
    expect(html).toContain('class="multiplier-badge" aria-label="10 times wild">×10</span>');
    expect((html.match(/multiplier-badge/g) ?? [])).toHaveLength(1);
  });

  it("renders converted mermaid cups as accessible Wild Chai cells", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "tumbler" as const })),
    );
    grid[2][1] = { symbol: "wild_chai" };

    const html = renderGridHtml(grid);

    expect(html).toContain('data-symbol="wild_chai"');
    expect(html).toContain('aria-label="Mermaid cup wild chai"');
    expect(html).toContain("WILD CHAI");
    expect(html).toContain("symbol-sprite--chai-wild");
  });
});

describe("Moonlit Keepsake Trail presentation boundary", () => {
  it("forwards typed engine state and card indexes without deciding matches in UI", () => {
    const controller = createKeepsakeMemoryController(createKeepsakeMemory(mulberry32(20260715)));
    expect(controller.state.phase).toBe("preview");

    const ready = controller.begin();
    expect(ready.phase).toBe("choosing_first");
    const action = controller.pick(ready.cards[0].index);

    expect(action.accepted).toBe(true);
    expect(action.event).toEqual({ kind: "card_revealed", index: ready.cards[0].index });
    expect(controller.state).toBe(action.state);
  });
});

describe("maybeLevelUpAfterBonus — multi-threshold celebration", () => {
  /** Build the minimal GameState fields the function touches. */
  function makeState(overrides: Partial<Pick<GameState, "xp" | "bet" | "balance">> = {}): GameState {
    return {
      xp: 0,
      bet: 1250,
      balance: 1000,
      treatJar: { chicken: 0, salmon: 0, bougie: 0 },
      pendingTreatJarSpins: 0,
      fireflyMeter: 0,
      bestCascade: 0,
      spinsSincePopIn: 0,
      soundOn: false,
      paylineGuideOn: false,
      musicVolume: 1,
      sfxVolume: 1,
      theme: "system",
      reducedMotion: false,
      ...overrides,
    } as GameState;
  }

  it("calls celebrateFn once per crossed level when two thresholds are crossed", async () => {
    // sparksForSpin(1250) = 50; level 2 at 500 XP, level 3 at 1000 XP.
    // 20 spins × 50 = 1000 sparks → crosses levels 2 and 3 from a base of level 1.
    const state = makeState({ xp: 0, bet: 1250 });
    const spy = vi.fn().mockResolvedValue(undefined);
    const root = document.createElement("div");

    await maybeLevelUpAfterBonus(root, state, 20, spy);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("calls celebrateFn with the correct level numbers for each intermediate level", async () => {
    const state = makeState({ xp: 0, bet: 1250 });
    const calls: number[] = [];
    const spy = vi.fn().mockImplementation(
      (_root: HTMLElement, lvl: number) => { calls.push(lvl); return Promise.resolve(); },
    );
    const root = document.createElement("div");

    await maybeLevelUpAfterBonus(root, state, 20, spy);

    // Should celebrate level 2 first, then level 3 — in order.
    expect(calls).toEqual([2, 3]);
  });

  it("accumulates coin rewards for each crossed level independently", async () => {
    // Expected coins: 200*2 (level 2) + 200*3 (level 3) = 1000
    const startBalance = 500;
    const state = makeState({ xp: 0, bet: 1250, balance: startBalance });
    const spy = vi.fn().mockResolvedValue(undefined);
    const root = document.createElement("div");

    await maybeLevelUpAfterBonus(root, state, 20, spy);

    const coinsAwarded = state.balance - startBalance;
    expect(coinsAwarded).toBe(200 * 2 + 200 * 3); // 400 + 600 = 1000
    // Strictly more than if only the top level had been awarded (200*3 = 600)
    expect(coinsAwarded).toBeGreaterThan(200 * 3);
  });

  it("does not call celebrateFn when no threshold is crossed", async () => {
    // 1 spin at bet 25 earns ~2 sparks — nowhere near the 500-spark level-2 threshold.
    const state = makeState({ xp: 100, bet: 25 });
    const spy = vi.fn().mockResolvedValue(undefined);
    const root = document.createElement("div");
    const balanceBefore = state.balance;

    await maybeLevelUpAfterBonus(root, state, 1, spy);

    expect(spy).not.toHaveBeenCalled();
    expect(state.balance).toBe(balanceBefore);
  });

  it("calls celebrateFn once and awards correct coins for a single level-up", async () => {
    // Use sparksForSpin(1250)=50; put XP just below level 2 (needs 500) and
    // add exactly enough spins to cross exactly one threshold.
    const sparksPerSpin = sparksForSpin(1250); // 50
    const xpNeeded = 500; // level 2 threshold
    const spinsToLevel = Math.ceil(xpNeeded / sparksPerSpin); // 10
    const state = makeState({ xp: 0, bet: 1250 });
    const startBalance = state.balance;
    const spy = vi.fn().mockResolvedValue(undefined);
    const root = document.createElement("div");

    await maybeLevelUpAfterBonus(root, state, spinsToLevel, spy);

    expect(spy).toHaveBeenCalledTimes(1);
    // Exactly one level-up reward: 200 * 2 = 400 coins
    expect(state.balance - startBalance).toBe(200 * 2);
  });
});

// ── Sparkle button disabled lifecycle ────────────────────────────────────────

describe("sparkle button disabled lifecycle during a spin", () => {
  // animateSteps fires one window.setTimeout(next, 480) per step.
  // With a single-step result the timer resolves the promise after 480 ms.
  const ANIMATE_STEP_MS = 480;

  beforeEach(() => {
    vi.useFakeTimers();
    // Provide a default no-bonus result; individual tests override as needed.
    vi.mocked(spin).mockReturnValue(noBonusResult());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("disables the sparkle button immediately when runSpin is called", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    renderBoard(root, makeSpinState());

    const btn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    expect(btn.disabled).toBe(false); // not locked before the spin

    btn.click();

    // runSpin sets disabled=true synchronously before any await — the chime
    // guard in the click handler relies on this being true immediately.
    expect(btn.disabled).toBe(true);

    root.remove();
  });

  it("restores an enabled sparkle button after the full spin sequence resolves", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    renderBoard(root, makeSpinState());

    const btn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    btn.click();
    expect(btn.disabled).toBe(true); // locked mid-spin

    // Drain all pending timers (animateSteps + any status timeouts).
    await vi.runAllTimersAsync();

    // runSpin ends by calling renderBoard, which replaces root.innerHTML and
    // creates a brand-new #sparkle-btn.  That new button must not be disabled.
    const newBtn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    expect(newBtn).not.toBeNull();
    expect(newBtn.disabled).toBe(false);

    root.remove();
  });

  it("keeps the sparkle button locked through a win-celebration bonus hand-off", async () => {
    // totalWin = 125, bet = 25 → ratio 5× → "nice" tier → showWinCelebration
    // fires a 1400 ms setTimeout before resolving and calling renderBoard.
    vi.mocked(spin).mockReturnValue(noBonusResult({ totalWin: 125 }));

    const root = document.createElement("div");
    document.body.appendChild(root);
    renderBoard(root, makeSpinState());

    const btn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    btn.click();
    expect(btn.disabled).toBe(true);

    // Let animateSteps resolve (480 ms per step) — the celebration is now
    // queued but has NOT yet fired.
    await vi.advanceTimersByTimeAsync(ANIMATE_STEP_MS);

    // The hand-off point: animateSteps is done, but the win-celebration
    // overlay is still running.  The original sparkle button reference must
    // still be disabled — no re-enable happens before renderBoard.
    expect(btn.disabled).toBe(true);

    // Drain the remaining timers (1400 ms celebration + status clear timeout).
    await vi.runAllTimersAsync();

    // After renderBoard creates the new board, the fresh button is enabled.
    const newBtn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    expect(newBtn).not.toBeNull();
    expect(newBtn.disabled).toBe(false);

    root.remove();
  });

  it("removes is-spinning from the original button reference after a plain spin resolves", async () => {
    // No bonus, no win — the simplest possible spin path.
    vi.mocked(spin).mockReturnValue(noBonusResult());

    const root = document.createElement("div");
    document.body.appendChild(root);
    renderBoard(root, makeSpinState());

    // Hold the PRE-SPIN button reference.  runSpin re-queries the same node at
    // board.ts:924 (before renderBoard replaces innerHTML), so this is the
    // exact element that classList.remove("is-spinning") targets.
    const originalBtn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    originalBtn.click();
    expect(originalBtn.classList.contains("is-spinning")).toBe(true); // class was added

    // Drain all timers: animateSteps (480 ms) + status/ice-note timeouts.
    await vi.runAllTimersAsync();

    // The cleanup at board.ts:924-925 must have removed is-spinning from the
    // original node before renderBoard detached it.  The detached reference
    // still reflects the correct classList state.
    expect(originalBtn.classList.contains("is-spinning")).toBe(false);

    root.remove();
  });

  it("removes is-spinning from the original button reference after a win-celebration path resolves", async () => {
    // totalWin = 125, bet = 25 → 5× ratio → showWinCelebration fires a 1400 ms
    // overlay before the cleanup at board.ts:924-925 and before renderBoard.
    vi.mocked(spin).mockReturnValue(noBonusResult({ totalWin: 125 }));

    const root = document.createElement("div");
    document.body.appendChild(root);
    renderBoard(root, makeSpinState());

    const originalBtn = root.querySelector<HTMLButtonElement>("#sparkle-btn")!;
    originalBtn.click();
    expect(originalBtn.classList.contains("is-spinning")).toBe(true);

    // Drain all timers: animateSteps (480 ms) + celebration (1400 ms) + misc.
    await vi.runAllTimersAsync();

    // Even via the longer win-celebration path, the cleanup must have run on
    // the original node before renderBoard swapped the DOM.
    expect(originalBtn.classList.contains("is-spinning")).toBe(false);

    root.remove();
  });
});
