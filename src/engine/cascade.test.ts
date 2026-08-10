import { describe, expect, it } from "vitest";
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
  it("terminates when sticky lap-quest wilds permanently hold a winning payline", () => {
    // ── Why this used to hang ──────────────────────────────────────────────
    // cascadeColumnAroundStickyWilds restores sticky wilds regardless of
    // whether their row is in removedByReel.  A sticky wild_phoebe at every
    // position of a payline (row 0, all 5 reels) means:
    //   1. evaluateLines detects a win (wild matches any symbol).
    //   2. removedByReel marks row 0 on every reel.
    //   3. cascadeGrid restores all five wilds (sticky; removedRows is ignored).
    //   4. Rows 1-3 were never removed → gravity does not touch them.
    //   5. The post-cascade grid is byte-for-byte identical to the pre-cascade grid.
    //   6. evaluateLines detects the same win again → infinite loop.
    //
    // ── What the guard does ───────────────────────────────────────────────
    // The unchanged-grid detection (Guard 1 in cascade.ts) snapshots the grid
    // at the start of each iteration.  On the second winning cascade it finds
    // currentSnapshot === prevSnapshot and breaks, returning a finite result.
    // Guard 2 (hard 52-iteration cap) provides a backstop for cases where the
    // grid changes slowly between iterations but wins persist.
    const baseGrid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, (_, row) => ({
        symbol: row === 0 ? "wild_phoebe" as const : "tumbler" as const,
      })),
    );
    // Five sticky Lap Quest wilds, one per reel at row 0 — the winning payline.
    const stickyWilds: StickyWild[] = Array.from({ length: 5 }, (_, reel) => ({
      position: [reel, 0] as [number, number],
      symbol: "wild_phoebe" as const,
      sticky: "lap_quest" as const,
    }));

    const result = spin({
      rng: mulberry32(20260810),
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 0,
      startingGrid: baseGrid,
      stickyWilds,
      spinArea: "secondary",   // suppresses main-spin-only triggers
      allowDoorbells: false,
      includeBoldChaiPump: false,
      allowTreatTimeBonus: false,
      allowUniGlee: false,
    });

    // Must terminate and return a result object (not hang).
    expect(result).toBeDefined();
    // At least one winning cascade happened (the sticky-wild payline fired).
    expect(result.cascades).toBeGreaterThanOrEqual(1);
    // The unchanged-grid guard fires by the second cascade attempt, so the
    // total is well below the hard cap.
    expect(result.cascades).toBeLessThanOrEqual(52);
    // The loop exited cleanly — steps must include a terminal no-win entry.
    expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
  });

  it("terminates via the hard cap when a sticky wild changes the grid but always wins", () => {
    // A single sticky wild_phoebe on one reel still guarantees a win on every
    // payline that passes through that cell — but the non-sticky cells change
    // each cascade (fresh symbols fill in from gravity).  The grid snapshot
    // differs between iterations, so Guard 1 does not fire; Guard 2 (hard cap)
    // must terminate the loop.
    //
    // Grid: 5 reels, row 0 = tumbler (so payline 0 wins on first step).
    // Sticky wild at reel 2 row 0 only — other positions get fresh symbols.
    const baseGrid: Grid = Array.from({ length: 5 }, (_, reel) =>
      Array.from({ length: 4 }, (_, row) => ({
        symbol: row === 0 ? (reel === 2 ? "wild_phoebe" as const : "tumbler" as const)
          : "treat_chicken" as const,
      })),
    );
    const stickyWilds: StickyWild[] = [{
      position: [2, 0] as [number, number],
      symbol: "wild_phoebe" as const,
      sticky: "lap_quest" as const,
    }];

    // Use a deterministic RNG that always returns 0 so gravity always fills
    // "tumbler" (the first symbol in the weighted draw list) — ensuring the
    // payline at row 0 continuously wins.
    const result = spin({
      rng: () => 0,   // always draws the lowest-weighted symbol (tumbler)
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

    expect(result).toBeDefined();
    expect(result.cascades).toBeGreaterThanOrEqual(1);
    // Guard 2 (hard 52-iteration cap) must have caught this.
    expect(result.cascades).toBeLessThanOrEqual(52);
    expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
  });
});
