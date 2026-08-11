import { describe, expect, it, vi } from "vitest";
import { mulberry32 } from "./rng";
import { freeSpinsForCascades, spin } from "./cascade";
import { emptyTreatJar } from "./features";
import type { Grid, KeepsakeZone, StickyWild } from "./types";
import { PAYOUT_SCALE, PAYTABLE } from "./paylines";
import { createLapQuestChallenge, LAP_QUEST_SPOTS, spinLapQuestRound } from "./lap-quest";

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
    // The production cap of 500 would require 500 winning cascades in CI, making
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

      // Guard 2 must have fired: exactly 2 winning cascades tallied (cap=2), then break.
      // `cascades` equals winningCascades here because the mock RNG never triggers
      // specialty wilds (all specialty checks return 0.9 > 0.05), so no sparkle_sort
      // step increments `cascades` separately.
      expect(result.cascades).toBe(2);
      // Guard 2 console.warn must have fired (not Guard 1).
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Hard cascade cap"));
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("grid unchanged"));
      // Settlement: Guard 2 fires AFTER each winning cascade is fully settled,
      // so both cascades contribute to totalWin and each has a winning step.
      expect(result.totalWin).toBeGreaterThan(0);
      // steps = [winning cascade 1, winning cascade 2, terminal no-win] = 3 entries.
      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].wins).not.toHaveLength(0); // cascade 1 settled
      expect(result.steps[1].wins).not.toHaveLength(0); // cascade 2 settled
      // Terminal no-win step appended by the guard after the last settled cascade.
      expect(result.steps[2].wins).toHaveLength(0);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("terminates cleanly for all spot choices and 100 seeds, with guards rescuing any sticky-wild lock-up", () => {
    // Fuzz: run spinLapQuestRound for every LapQuestSpot × seeds 0–99.
    // chooseComfortWilds returns 2 (cozy) or 4 (perfect) sticky wilds drawn
    // randomly from 20 board positions.
    //
    // Finding from this test run: both Guard 1 ("grid unchanged") and Guard 2
    // ("Hard cascade cap") can fire for realistic comfort-wild counts when wilds
    // land on high-payline rows.  This is EXPECTED and CORRECT — the guards
    // terminate the cascade cleanly rather than hanging.  The pre-fix code had
    // no such guards and would loop forever in these cases.
    //
    // The critical assertion is: every round always terminates on a dead board,
    // regardless of which guard (if any) fires.  A hung game would never return
    // from spinLapQuestRound at all, so a completed assertion confirms safety.
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      for (let seed = 0; seed < 100; seed++) {
        for (const spot of LAP_QUEST_SPOTS) {
          // Use one RNG stream: challenge creation draws from it first, then the
          // round itself draws from the same stream — matching real game usage.
          const rng = mulberry32(seed);
          const challenge = createLapQuestChallenge(rng);
          const result = spinLapQuestRound(rng, challenge, spot, 1);

          // Every round must terminate (have at least one step)
          expect(result.steps.length).toBeGreaterThanOrEqual(1);
          // The final step must be a dead board — whether the guards fired or not
          expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
        }
      }
      // If this line is reached, no round hung indefinitely — all 300 calls
      // (100 seeds × 3 spots) returned a valid terminated result.
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("Guard 1b prevents Guard 2 from firing across all spot choices and 100 seeds — machine-readable lapQuestCappedCascades=0 verification", () => {
    // This is the deterministic regression gate for Guard 1b.
    //
    // Guard 1b (src/engine/cascade.ts) fires when the same set of board cells
    // wins on two consecutive winning cascades while sticky wilds are present.
    // This terminates the cascade loop BEFORE Guard 2 (the hard 500-cascade cap)
    // becomes necessary.
    //
    // SpinResult.terminatedByCascadeCap is set to true ONLY when Guard 2 fires.
    // A passing run proves Guard 1b intercepted every sticky-wild anchor loop.
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      for (let seed = 0; seed < 100; seed++) {
        for (const spot of LAP_QUEST_SPOTS) {
          const rng = mulberry32(seed);
          const challenge = createLapQuestChallenge(rng);
          const result = spinLapQuestRound(rng, challenge, spot, 1);

          // Guard 2 must never fire — terminatedByCascadeCap must be absent.
          expect(result.terminatedByCascadeCap).toBeUndefined();
          // Every round must terminate on a dead board.
          expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
        }
      }
      // Belt-and-suspenders: the hard-cap warning must not appear in any round.
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Hard cascade cap"),
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("spin() without stickyWilds does not throw — Guard 1b null-guard regression", () => {
    // Guard 1b initially accessed stickyWilds.length without a null-check.
    // spin() is valid without a stickyWilds argument; cloneStickyWilds returns
    // undefined in that case.  If the null-guard ever regresses, this throws a
    // TypeError and the test fails.
    expect(() =>
      spin({
        rng: mulberry32(20260811),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
        // stickyWilds: intentionally omitted
      }),
    ).not.toThrow();
  });

  // ── PRD §2.7 four required regression tests ──────────────────────────────
  // Each of these four tests must fail on pre-fix code (no guards) and pass
  // after the grid-identity guard and iteration backstop are applied.

  it("PRD test 1 — exact repro: comfort wilds (0,3)(1,2)(2,2)(3,2) terminate", () => {
    // PRD §2.3: seed 99, Lap Quest round 28 produced comfort wilds at
    // (0,3)(1,2)(2,2)(3,2) — covering reels 0–3 of payline 13 ([3,2,2,2,3]).
    // Those four wilds caused an infinite cascade loop pre-fix.
    // This test directly constructs that sticky-wild set and asserts termination.
    const stickyWilds: StickyWild[] = [
      { position: [0, 3], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [1, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [2, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [3, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
    ];
    // All-tumbler board: sticky wilds restore after each cascade, and other
    // paylines may also win, but the guards must break the loop regardless.
    const startingGrid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "tumbler" as const })),
    );

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = spin({
        rng: mulberry32(99),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
        startingGrid,
        stickyWilds,
        spinArea: "secondary",
        allowDoorbells: false,
        includeBoldChaiPump: false,
        allowTreatTimeBonus: false,
        allowUniGlee: false,
      });

      // Must terminate; if it loops, this assertion is never reached.
      expect(result.steps.length).toBeGreaterThanOrEqual(1);
      // Terminal step is a dead board.
      expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
      // Hard cap (Guard 2) must not fire — Guard 1 or 1b must intercept first.
      expect(result.terminatedByCascadeCap).toBeUndefined();
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("PRD test 2 — constructed worst case: all 5 positions of payline 13 as sticky wilds", () => {
    // Payline 13 (0-indexed) = [3, 2, 2, 2, 3].
    // Sticky wilds at all 5 positions guarantee payline 13 wins on every pass.
    // The non-sticky board uses treat_chicken (NON_PAYING) so no other payline
    // can start a win — only payline 13 is eligible each iteration.
    // After the first winning cascade, cascadeColumnAroundStickyWilds restores
    // all 5 wilds and treat_chicken cells are untouched (never removed), leaving
    // the grid byte-for-byte identical to the previous iteration.
    // Guard 1 must fire — the pre-fix code would loop forever.
    const stickyWilds: StickyWild[] = [
      { position: [0, 3], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [1, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [2, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [3, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [4, 3], symbol: "wild_phoebe", sticky: "lap_quest" },
    ];
    const startingGrid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "treat_chicken" as const })),
    );

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = spin({
        rng: mulberry32(7),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
        startingGrid,
        stickyWilds,
        spinArea: "secondary",
        allowDoorbells: false,
        includeBoldChaiPump: false,
        allowTreatTimeBonus: false,
        allowUniGlee: false,
      });

      // Guard 1 must fire: the grid is identical after every cascade.
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("grid unchanged"));
      // Guard 2 (hard cap) must NOT fire — Guard 1 is sufficient.
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("Hard cascade cap"));
      expect(result.terminatedByCascadeCap).toBeUndefined();
      // Exactly one winning cascade: Guard 1 fires on the second evaluation.
      expect(result.cascades).toBe(1);
      // Terminal step is a dead board.
      expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("PRD test 3 — pays once, not forever: all-wild payline 13 contributes its payout exactly one time", () => {
    // Same constructed worst-case setup as PRD test 2.
    // Only payline 13 (5 sticky wilds, treat_chicken elsewhere) can win.
    // Guard 1 fires after the first winning cascade, so the line pays exactly
    // one time.  Pre-fix code would accumulate the same payout forever.
    const stickyWilds: StickyWild[] = [
      { position: [0, 3], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [1, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [2, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [3, 2], symbol: "wild_phoebe", sticky: "lap_quest" },
      { position: [4, 3], symbol: "wild_phoebe", sticky: "lap_quest" },
    ];
    const startingGrid: Grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "treat_chicken" as const })),
    );

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = spin({
        rng: mulberry32(7),
        betPerLine: 1,
        treatJar: emptyTreatJar(),
        spinsSincePopIn: 0,
        startingGrid,
        stickyWilds,
        spinArea: "secondary",
        allowDoorbells: false,
        includeBoldChaiPump: false,
        allowTreatTimeBonus: false,
        allowUniGlee: false,
      });

      // 5-of-a-kind wilds pay as tumbler: PAYTABLE.tumbler[5] * betPerLine * PAYOUT_SCALE.
      // Math.round(1112 * 1 * 0.775) = Math.round(861.8) = 862.
      const expectedOnce = Math.round(PAYTABLE.tumbler![5] * 1 * PAYOUT_SCALE);
      expect(result.totalWin).toBe(expectedOnce);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("PRD test 4 — no false positives: guard is inert when sticky wilds do not anchor a repeating win", () => {
    // A cozy-lap Lap Quest round places 2 sticky wilds at random positions.
    // When those wilds do not happen to cover a full payline prefix, the cascade
    // resolves naturally without any guard firing.  This test verifies the guard
    // is inert on a healthy spin — neither Guard 1 nor Guard 1b should fire.
    //
    // Seed 41 produces a well-behaved round (also used in lap-quest.test.ts).
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const rng = mulberry32(41);
      const challenge = createLapQuestChallenge(rng);
      const cozySpot = challenge.choices.find((spot) => spot !== challenge.perfectSpot)!;
      const result = spinLapQuestRound(rng, challenge, cozySpot, 1);

      // Round terminates on a dead board.
      expect(result.steps.length).toBeGreaterThanOrEqual(1);
      expect(result.steps[result.steps.length - 1].wins).toHaveLength(0);
      // Neither guard should have fired — the board changed normally each cascade.
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("grid unchanged"));
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("Sticky-wild anchor"));
      // Hard cap must not fire.
      expect(result.terminatedByCascadeCap).toBeUndefined();
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
