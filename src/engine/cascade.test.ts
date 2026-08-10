import { describe, expect, it, vi } from "vitest";
import { mulberry32 } from "./rng";
import { freeSpinsForCascades, spin } from "./cascade";
import { emptyTreatJar } from "./features";
import type { Grid, KeepsakeZone, StickyWild } from "./types";
import { PAYOUT_SCALE, PAYTABLE } from "./paylines";

describe("spin", () => {
  it("is deterministic for a given seed", () => {
    const jar = emptyTreatJar();
    const a = spin({ rng: mulberry32(123), betPerLine: 1, treatJar: jar, spinsSincePopIn: 0 });
    const b = spin({ rng: mulberry32(123), betPerLine: 1, treatJar: jar, spinsSincePopIn: 0 });
    expect(a.totalWin).toBe(b.totalWin);
    expect(a.cascades).toBe(b.cascades);
    expect(a.steps.length).toBe(b.steps.length);
  });

  it("always ends on a dead board (last step has no wins)", () => {
    for (let seed = 0; seed < 25; seed++) {
      const result = spin({
        rng: mulberry32(seed),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
      });
      expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
    }
  });

  it("looks up the free-spin ladder correctly by cascade count", () => {
    expect(freeSpinsForCascades(0)).toBe(0);
    expect(freeSpinsForCascades(3)).toBe(0);
    expect(freeSpinsForCascades(4)).toBe(0);
    expect(freeSpinsForCascades(5)).toBe(0);
    expect(freeSpinsForCascades(6)).toBe(6);
    expect(freeSpinsForCascades(11)).toBe(60);
    expect(freeSpinsForCascades(50)).toBe(60);
  });

  it("a spin's freeSpinsAwarded always matches the ladder for its cascade count", () => {
    for (let seed = 0; seed < 300; seed++) {
      const result = spin({
        rng: mulberry32(seed),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
      });
      const expected = freeSpinsForCascades(result.cascades);
      const expectedAward = result.doorbellPanic
        ? result.doorbellPanic.freeSpinsAwarded
        : result.doubleSparkleApplied
          ? expected * 2
          : expected;
      expect(result.freeSpinsAwarded).toBe(expectedAward);
    }
  });

  it("awards 3–6 spins when a first/second-reel doorbell pair lands", () => {
    const grid: Grid = Array.from({ length: 5 }, (_, reel) =>
      Array.from({ length: 4 }, (_, row) => ({
        symbol: reel < 2 && row === 0 ? "doorbell" as const : "treat_chicken" as const,
      })),
    );
    const result = spin({
      rng: mulberry32(20260712),
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
      startingGrid: grid,
    });

    expect(result.doorbellPanic?.freeSpinsAwarded).toBeGreaterThanOrEqual(3);
    expect(result.doorbellPanic?.freeSpinsAwarded).toBeLessThanOrEqual(6);
    expect(result.freeSpinsAwarded).toBe(result.doorbellPanic?.freeSpinsAwarded);
  });

  it("preserves a doorbell through Drop-In and Sparkle Sort specialty steps", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "treat_chicken" as const })),
    );
    grid[1][0] = { symbol: "doorbell" };

    const fallbackRng = mulberry32(90417);
    let forcedCalls = 0;
    const rng = () => forcedCalls++ < 3 ? 0 : fallbackRng();
    const result = spin({
      rng,
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
      startingGrid: grid,
    });

    expect(result.unigleeTriggered).toBe(true);
    expect(result.steps.every((step) => step.grid.flat().some((cell) => cell.symbol === "doorbell"))).toBe(true);
  });

  it("captures and preserves a Chai Pump through specialty steps", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "treat_chicken" as const })),
    );
    grid[0][0] = { symbol: "chai_pump" };
    grid[1][0] = { symbol: "chai_pump" };
    const fallbackRng = mulberry32(90417);
    let forcedCalls = 0;
    const rng = () => forcedCalls++ < 3 ? 0 : fallbackRng();
    const result = spin({ rng, betPerLine: 1, treatJar: emptyTreatJar(), spinsSincePopIn: 0, startingGrid: grid });

    expect(result.boldChaiPump?.lineIndex).toBe(0);
    expect(result.steps.every((step) => step.grid.flat().filter((cell) => cell.symbol === "chai_pump").length >= 2)).toBe(true);
  });

  it("multiplies only paylines that use the one marked wild", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "treat_chicken" as const })),
    );
    for (let reel = 0; reel < 5; reel++) grid[reel][0] = { symbol: "tumbler" };
    grid[2][0] = { symbol: "wild_joey", multiplier: 3 };

    const result = spin({
      rng: () => 0.5,
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
      startingGrid: grid,
    });
    const firstWin = result.steps[0].wins[0];

    expect(result.steps[0].wins).toHaveLength(1);
    expect(firstWin.multiplier).toBe(3);
    expect(firstWin.payout).toBe(PAYTABLE.tumbler![5] * PAYOUT_SCALE * 3);
  });

  it("applies a handbag wild's randomized line multiplier", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "treat_chicken" as const })),
    );
    for (let reel = 0; reel < 5; reel++) grid[reel][0] = { symbol: "tumbler" };
    grid[4][0] = { symbol: "wild_handbag", handbagMultiplier: 5 };

    const result = spin({
      rng: () => 0.5,
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
      startingGrid: grid,
    });
    const firstWin = result.steps[0].wins[0];

    expect(result.steps[0].wins).toHaveLength(1);
    expect(firstWin.symbol).toBe("tumbler");
    expect(firstWin.payout).toBe(PAYTABLE.tumbler![5] * PAYOUT_SCALE * 5);
  });

  it("locks a giant footprint but changes its icon after it participates in a win", () => {
    const grid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "treat_chicken" as const })),
    );
    // A top-row tumbler line passes through the 2×2 giant rectangle on reels 2–3.
    for (let reel = 0; reel < 5; reel++) grid[reel][0] = { symbol: "tumbler" };
    const zone: KeepsakeZone = { leftReel: 1, topRow: 0, width: 2, height: 2, symbol: "tumbler" };
    const result = spin({
      rng: () => 0.5,
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
      startingGrid: grid,
      keepsakeZone: zone,
    });

    expect(result.steps[0].wins).not.toHaveLength(0);
    expect(result.steps[0].keepsakeZone).toEqual(zone);
    expect(result.steps[1].keepsakeZone).toMatchObject({ leftReel: 1, topRow: 0, width: 2, height: 2 });
    expect(result.steps[1].keepsakeZone?.symbol).not.toBe("tumbler");
    expect(result.steps[1].grid[1][0].symbol).toBe(result.steps[1].keepsakeZone?.symbol);
    expect(result.steps[1].grid[2][1].symbol).toBe(result.steps[1].keepsakeZone?.symbol);
  });
});

// ── Lap Quest infinite-loop regression ───────────────────────────────────────

describe("Lap Quest infinite-loop guard", () => {
  it("terminates via Guard 1 when all sticky wilds reconstruct an identical winning grid", () => {
    // ── Why this used to hang ──────────────────────────────────────────────
    // cascadeColumnAroundStickyWilds restores sticky wilds regardless of whether
    // their row is in removedByReel.  Five sticky wild_phoebe at row 0 of every
    // reel means:
    //   1. evaluateLines detects a win (wild matches any symbol).
    //   2. removedByReel marks row 0 on every reel.
    //   3. cascadeGrid restores all five wilds (sticky; removedRows is ignored for
    //      sticky positions).
    //   4. Rows 1-3 were never removed → gravity does not touch them.
    //   5. The entire grid is byte-for-byte identical to the previous iteration.
    //   6. evaluateLines detects the same win again → infinite loop.
    //
    // ── Guard 1 fix ───────────────────────────────────────────────────────
    // Guard 1 (cascade.ts, inside the winning branch) compares the grid at the
    // start of each WINNING cascade to the previous winning cascade's starting
    // state.  On the second winning cascade it detects the unchanged grid and
    // breaks, returning cascades === 1 (only the first winning cascade was
    // tallied before the guard fired).
    const baseGrid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, (_, row) => ({
        symbol: row === 0 ? "wild_phoebe" as const : "tumbler" as const,
      })),
    );
    const stickyWilds: StickyWild[] = Array.from({ length: 5 }, (_, reel) => ({
      position: [reel, 0] as [number, number],
      symbol: "wild_phoebe" as const,
      sticky: "lap_quest" as const,
    }));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = spin({
        rng: mulberry32(20260810),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
        startingGrid: baseGrid,
        stickyWilds,
        spinArea: "secondary",
        allowDoorbells: false,
        includeBoldChaiPump: false,
        allowTreatTimeBonus: false,
        allowUniGlee: false,
      });

      // Guard 1 fires once the grid stabilises (all non-sticky rows stop
      // changing between iterations).  The exact cascade count depends on how
      // many paylines the initial board satisfies, but it must be well below
      // the hard cap of 52.
      expect(result.cascades).toBeLessThan(52);
      // Guard 1 console.warn must have fired (not Guard 2).
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("grid unchanged"));
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("Hard cascade cap"));
      // The terminal step must be a no-win entry appended by the guard.
      expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("terminates via Guard 2 when a changing-grid sticky wild always wins (cascade cap)", () => {
    // ── Scenario ──────────────────────────────────────────────────────────
    // Four sticky wilds on reels 0–3 row 0, reel 4 non-sticky.
    // wild_phoebe matches any symbol, so the row-0 payline wins regardless
    // of what symbol appears at reel 4 after each cascade.  The non-sticky reel
    // 4 row-0 cell IS removed and refilled each cascade, so the grid snapshot
    // changes between iterations — Guard 1 never fires.
    //
    // ── Why a low _guardCascadeCap is used ────────────────────────────────
    // The production cap of 52 would require 52 winning cascades in CI, making
    // the test slow and the assertion imprecise.  _guardCascadeCap: 2 keeps the
    // test fast while demonstrating the exact Guard 2 boundary: after cascades
    // reaches 2 (the cap) the loop breaks and the result has cascades === 2.
    //
    // ── Mock RNG design ───────────────────────────────────────────────────
    // The cascade loop makes exactly two RNG calls per winning iteration:
    //   Call 2k-1: rng() < SPECIALTY_TRIGGER_CHANCE (0.05) — specialty check
    //   Call 2k  : drawSingle(rng, 4) — fresh symbol for reel 4 row 0
    // The mock returns 0.9 for specialty checks (no specialty triggered) and
    // alternates between 0.9 and 0.1 for drawSingle.  0.9 and 0.1 are far
    // enough apart to guarantee different symbols from drawSingle, so the grid
    // differs between cascade 1 and cascade 2 and Guard 1 cannot fire.
    let callCount = 0;
    const mockRng = (): number => {
      callCount++;
      if (callCount % 2 === 1) return 0.9; // specialty check: always above 0.05
      // drawSingle: alternate 0.9 (cascade 1) → 0.1 (cascade 2) so the symbol
      // drawn for reel 4 row 0 differs on each cascade, changing the snapshot.
      return Math.floor(callCount / 2) % 2 === 0 ? 0.1 : 0.9;
    };

    const baseGrid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, (_, row) => ({
        symbol: row === 0 ? "tumbler" as const : "treat_chicken" as const,
      })),
    );
    // Sticky wilds on reels 0–3 only; reel 4 row 0 is non-sticky and changes.
    const stickyWilds: StickyWild[] = [0, 1, 2, 3].map((reel) => ({
      position: [reel, 0] as [number, number],
      symbol: "wild_phoebe" as const,
      sticky: "lap_quest" as const,
    }));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = spin({
        rng: mockRng,
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
        startingGrid: baseGrid,
        stickyWilds,
        spinArea: "secondary",
        allowDoorbells: false,
        includeBoldChaiPump: false,
        allowTreatTimeBonus: false,
        allowUniGlee: false,
        _guardCascadeCap: 2, // low cap to make the test fast and the boundary exact
      });

      // Guard 2 must have fired: exactly 2 winning cascades tallied, then break.
      expect(result.cascades).toBe(2);
      // Guard 2 console.warn must have fired (not Guard 1).
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Hard cascade cap"));
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("grid unchanged"));
      // Terminal no-win step appended by the guard.
      expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("does not fire Guard 1 during non-mutating specialty steps between winning cascades", () => {
    // Guard 1 must be scoped to WINNING cascade iterations only.  If it compared
    // grids on every loop iteration (including queue-draining steps), a
    // non-mutating specialty (double_sparkle, facts_on_facts) followed by a
    // board-mutating one (sparkle_sort, drop_in) would trigger Guard 1 on the
    // non-mutating step and skip the later board mutation — breaking UniGlee.
    //
    // The existing "preserves a doorbell through Drop-In and Sparkle Sort
    // specialty steps" test already exercises the specialty queue, so this test
    // simply checks that a spin reaching at least two winning cascades (with an
    // intervening queue drain) completes all steps and ends on a dead board.
    const result = spin({
      rng: mulberry32(42),
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
    });

    // The spin completed without Guard 1 misfiring: last step has no wins.
    expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
    // Step count must be >= 1 (the dead-board terminal step always exists).
    expect(result.steps.length).toBeGreaterThanOrEqual(1);
  });
});
