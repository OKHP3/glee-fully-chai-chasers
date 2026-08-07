// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import type { Grid } from "../engine/types";
import type { GameState } from "../state";
import { createKeepsakeMemory } from "../engine/keepsake-memory";
import { mulberry32 } from "../engine/rng";
import { sparksForSpin } from "../engine/economy";
import { createKeepsakeMemoryController, maybeLevelUpAfterBonus, renderGridHtml } from "./board";

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
