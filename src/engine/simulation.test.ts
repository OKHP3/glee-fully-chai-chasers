/**
 * SPEC ORACLE — DESIGN-SPEC.md §4 event-frequency table as executable gates.
 * Committed by Claude (engine/math workstream owner, DECISION-LOG.md).
 *
 * These tests are EXPECTED TO FAIL until reel strips, wild stacking, UniGlee
 * gating, and paytable weights are simulation-tuned. That is the point:
 * do not delete, skip, weaken, or widen these gates to get to green.
 * Green means the game feels right. Seeded RNG = deterministic, no flake.
 */
import { describe, expect, it } from "vitest";
import { spin } from "./cascade";
import { LINES } from "./economy";
import { mulberry32 } from "./rng";

const SPINS = 200_000;
const SEED = 20260717; // her birthday, obviously

interface SimStats {
  rtp: number;
  winRate: number;        // spins with >=1 cascade / spins
  freeSpinRate: number;   // triggers / spins
  mega8Rate: number;      // 8+ cascade spins / spins
  unigleeRate: number;    // uniglee spins / spins
  catVisitRate: number;   // visits / spins
}

function simulate(): SimStats {
  const rng = mulberry32(SEED);
  const betPerLine = 1;
  let totalBet = 0, totalWin = 0, wins = 0, fs = 0, mega = 0, uni = 0, cats = 0;
  for (let i = 0; i < SPINS; i++) {
    const jar = { chicken: 6, salmon: 6, bougie: 6 }; // stocked jar, steady-state assumption
    const r = spin({ rng, betPerLine, treatJar: jar, spinsSincePopIn: 10 });
    totalBet += betPerLine * LINES;
    totalWin += r.totalWin;
    if (r.cascades > 0) wins++;
    if (r.freeSpinsAwarded > 0) fs++;
    if (r.cascades >= 8) mega++;
    if (r.unigleeTriggered) uni++;
    if (r.catVisit) cats++;
  }
  return {
    rtp: totalWin / totalBet,
    winRate: wins / SPINS,
    freeSpinRate: fs / SPINS,
    mega8Rate: mega / SPINS,
    unigleeRate: uni / SPINS,
    catVisitRate: cats / SPINS,
  };
}

/**
 * CI note: the Pages deploy job runs with SKIP_ORACLE=1 so iterative builds
 * can ship while the math is being tuned; a separate non-blocking CI job runs
 * the oracle on every push so the red/green status stays visible. Locally and
 * in Replit's validation loop, `npm test` always runs the full oracle.
 */
const skipOracle =
  typeof globalThis !== "undefined" &&
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.SKIP_ORACLE === "1";

describe.skipIf(skipOracle)(`spec oracle — ${SPINS.toLocaleString()} seeded spins vs DESIGN-SPEC §4`, () => {
  const s = simulate();

  // Full-game RTP retuned 2026-07 to land base + all bonuses in the 95-98%
  // band (~96.5% total). Base game alone now targets ~61%; bonuses carry the
  // rest. Previously: UniGlee rolled each reel independently
  // (1/2500, 1/4000, 1/7500; combined ~1/1,277 vs the old single 1/400 roll),
  // removing most guaranteed trigger-line wins from the base stream and
  // lowering base RTP roughly a point below the original ~96% target.
  it(`base RTP ~60.9% ±1 (actual: ${(s.rtp * 100).toFixed(2)}%)`, () => {
    expect(s.rtp).toBeGreaterThan(0.599);
    expect(s.rtp).toBeLessThan(0.619);
  });

  it(`any-win rate ~1 in 2.9 ±15% (actual: 1 in ${(1 / s.winRate).toFixed(2)})`, () => {
    expect(s.winRate).toBeGreaterThan(1 / 3.4);
    expect(s.winRate).toBeLessThan(1 / 2.5);
  });

  // 2026-07 retune: ladder entry raised from 4 to 6 cascades, dropping the
  // Firefly free-spin trigger from ~1 in 35 to ~1 in 150.
  it(`free spins ~1 in 150 ±20% (actual: 1 in ${(1 / Math.max(s.freeSpinRate, 1e-9)).toFixed(0)})`, () => {
    expect(s.freeSpinRate).toBeGreaterThan(1 / 188);
    expect(s.freeSpinRate).toBeLessThan(1 / 120);
  });

  it(`8+ cascade mega ~1 in 900, wide band (actual: 1 in ${(1 / Math.max(s.mega8Rate, 1e-9)).toFixed(0)})`, () => {
    expect(s.mega8Rate).toBeGreaterThan(1 / 1800);
    expect(s.mega8Rate).toBeLessThan(1 / 450);
  });

  it(`UniGlee ~1 in 1,277 combined per-reel odds (actual: 1 in ${(1 / Math.max(s.unigleeRate, 1e-9)).toFixed(0)})`, () => {
    expect(s.unigleeRate).toBeGreaterThan(1 / 2000);
    expect(s.unigleeRate).toBeLessThan(1 / 850);
  });

  it(`cat pop-in ~1 in 30 ±30% (actual: 1 in ${(1 / Math.max(s.catVisitRate, 1e-9)).toFixed(1)})`, () => {
    expect(s.catVisitRate).toBeGreaterThan(1 / 40);
    expect(s.catVisitRate).toBeLessThan(1 / 23);
  });
});
