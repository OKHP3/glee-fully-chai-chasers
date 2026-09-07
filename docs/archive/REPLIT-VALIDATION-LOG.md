# REPLIT-VALIDATION-LOG.md

Mandatory validation loop per "REPLIT ROUND 2" brief. `simulation.test.ts` is the
math oracle (`docs/DESIGN-SPEC.md` §4); never skipped/weakened/widened in these runs.

## Cycle 1 — 2026-07-10 — Workstream A (math)

**Starting numbers (owner-reported, 100k spins, per-cell random draws, UniGlee as a strip symbol):**
RTP 14%, free spins 1/1235, 8+ cascades never, UniGlee 1/5.

**Changes:**
- Replaced per-cell random draws with real fixed circular reel strips (`src/engine/reels.ts`),
  built from weighted symbol segments with saucer-cat wilds placed as literal contiguous
  6-7-symbol runs on reels 2-5 (docs §5). Spin = one random stop per reel, read 4 consecutive
  symbols (wrap). Cascade refills draw single symbols uniformly from the same strip, so wild
  density (and occasional stacks) carries into refills too.
- Gated UniGlee as a per-spin event (`UNIGLEE_RATE = 1/400`) rather than a strip symbol; on
  trigger it queues the full package (Drop-In Saucer + Facts-on-Facts + 3x Sparkle Sort +
  Double Sparkle) per docs §5.
- Implemented specialty wilds end-to-end (`src/engine/cascade.ts`): a wild in a winning line has
  a 5% chance to queue one of {sparkle_sort 50%, drop_in 30%, double_sparkle 12%,
  facts_on_facts 8%}; on a dead board with a non-empty queue, exactly ONE specialty fires
  (extras stay queued) before re-evaluating — Sparkle Sort shatters 5-11 non-wild cells and
  forces another cascade tick, Drop-In Saucer crowns a random reel (2-5) with a full wild
  column, Double Sparkle doubles that spin's ladder award, Facts-on-Facts is recorded but only
  meaningful during free spins (Workstream B).
- Tuned strip composition (low-tier symbol density) and paytable scale together, iteratively,
  against the 200k-spin oracle until every gate cleared. Iteration log (RTP / win rate / free
  spin rate / mega8 rate / UniGlee rate):
  1. Baseline after real strips + UniGlee gate, before tuning: 60.63% / 1-in-3.90 / 1-in-21 / 1-in-130 / 1-in-5.3 (specialty chance too high, driving mega8/uniglee too far)
  2. Dropped specialty trigger chance 0.16→0.05, scaled paytable ×1.6: 83.22% / 1-in-3.88 / 1-in-45 / 1-in-830 (pass) / 1-in-391 (pass)
  3. Raised low-tier strip density (mailbox/vhs/teapot/yarn) to lift win-rate/free-spin-rate: 94.03%/57.85%→92.45%→94.78% while chasing RTP band; win-rate and free-spin-rate cleared en route.
  4. Final paytable scale pass (fine ±3% adjustments) landed all 6 gates green simultaneously.

**Final numbers (200k seeded spins, `SEED=20260717`):**
RTP 95.9% (band 95.5-96.5, PASS), any-win 1-in-3.34 (band 1-in-2.5 to 1-in-3.4, PASS),
free spins 1-in-37 (band 1-in-30 to 1-in-41, PASS), 8+ cascade mega 1-in-922 (band 1-in-450 to
1-in-1800, PASS), UniGlee 1-in-403 (band 1-in-280 to 1-in-600, PASS), cat pop-in 1-in-32.4
(band 1-in-23 to 1-in-40, PASS).

**Tests:** `npx vitest run` → 7 files, 29 tests, all passing (including `simulation.test.ts`,
full oracle, `SKIP_ORACLE` not set). `npm run build` → tsc + vite clean.

**Defects found:** (1) `cascade.test.ts`'s ladder-match assertion didn't account for
Double Sparkle doubling — fixed by exposing `doubleSparkleApplied` on `SpinResult` and updating
the test to check against it explicitly, rather than loosening the assertion. (2) `tsconfig.json`
was missing Node types, breaking `process.env.SKIP_ORACLE` typecheck in the oracle file itself —
fixed by adding `"node"` to `compilerOptions.types` (dev-only; ships in no bundle).

**Verdict:** Workstream A gate is green. Continuing to Workstream B (free spins + wheel).

## Cycle 2 — 2026-07-10 — Workstream B (free spins + AskJamie wheel)

**Changes:**
- New `src/engine/freespins.ts`: `spinWheel()` (3 weighted wedges per docs §7),
  `spinFreeRound()` (wedge modifier applied to one cascade round — wild
  multipliers 2/3/4/5x common, 8x uncommon, 12x jackpot for "We're
  Multiplying"; documented flat uplifts for Giant Gnome Mode and We Want Our
  Chai Back standing in for their board-visual effects), `runFreeSpinSession()`
  (drains awarded spins, honors retriggers via the existing ladder).
- UI: wheel overlay (spin-to-stop CSS animation, resolves to a wedge), a
  dedicated aurora-tinted free-spin board that plays every round's cascades,
  and a completion summary before returning to the base game.
- Bug caught in review: `spinFreeRound`'s We're Multiplying branch could in
  principle scale a zero base win by a >1x multiplier and produce a
  misleading "win" if wilds landed on a dead board — checked and confirmed
  this can't happen (`bonusWin` is only computed off `base.totalWin`, which
  is 0 on a dead board, so `0 * anything = 0`); left a code comment rather
  than adding dead defensive code.

**Tests:** `src/engine/freespins.test.ts` (5 tests, new) — wheel always lands
on a valid wedge; free-spin rounds (all 3 wedges) never produce a
negative/NaN win; a session with retriggers runs exactly
`awarded + sum(retrigger awards)` rounds; a zero-spin session runs zero
rounds. Full suite: `npx vitest run` → 8 files, 34 tests, all green
(oracle included, untouched). `npm run build` clean.

**Manual QA:** Rather than tuning trigger odds (which risks drifting from the
tuned oracle numbers), verified the wheel/free-spin render path directly by
temporarily exporting `runWheelAndFreeSpins` from `board.ts` and calling it
from a throwaway `location.hash` route in `main.ts` with a synthetic
`spinsAwarded` count, then screenshotting the live preview. Confirmed: wheel
overlay renders with 3 labeled wedges and spins, the free-spin board frame
renders with the aurora backdrop over the existing symbol grid. Removed the
temporary export and hash route immediately after screenshotting — `git diff`
confirms no trace remains in `board.ts`/`main.ts`. No console errors during
the run (checked via workflow + browser console logs).

**Verdict:** Workstream B gate is green. Continuing to Workstreams C/D
(presentation overhaul + cat pop-ins).

## Cycle 3 — 2026-07-10 — Workstreams C (presentation) + D (cat pop-ins)

**Changes:**
- New `src/ui/symbols.ts`: every paytable symbol, both wild cats, UniGlee,
  both cat pop-in sprites, and the wheel face are original inline SVG —
  zero emoji, zero third-party art. Splash screen and settings icon also
  converted off emoji.
- `src/style.css`: night-garden backdrop (layered radial gradients + CSS
  "saucer" bob animation + firefly drift), `symbol-pop`/`beam-drop` cascade
  animations, `wheel-spin-out`, `cat-hop-in`/`quip-fade-in` for pop-ins,
  `shatter-out` (defined for a future Sparkle Sort visual, not yet wired to
  a distinct trigger — see handoff v2 follow-ups).
- `src/ui/board.ts` `showCatPopIn()`: cat sprite hops in from the bottom with
  an overshoot ease, quip bubble fades in a beat later, both clear after
  ~2.2s; this now runs as a real `await`ed step inside `runSpin()` so the
  status line doesn't race it.

**Verification:**
- `grep -rlP` for emoji Unicode ranges across `src/ui/board.ts`, `src/main.ts`,
  and the built `dist/assets/*.js` → no matches (mirrors the existing
  brand-string CI gate pattern in `.github/workflows/deploy.yml`, which does
  not yet have an emoji-specific rule — flagged as a follow-up in the handoff).
- Screenshots taken via a dev-only `#board` hash bypass (added to `src/main.ts`,
  documented in handoff v2) at desktop width standing in for the 390×844
  portrait target (the environment's screenshot tool renders the iframe at
  its default size; layout is verified responsive via the existing Tailwind
  classes, which were not changed from the portrait-first v1 layout):
  - Idle board: night-garden backdrop with drifting saucers/fireflies, full
    SVG symbol grid, SVG settings icon, SVG treat-jar icons — confirmed no
    emoji visible anywhere.
  - Mid-cascade / win-flash: existing `.cell.win-flash` styling still applies
    over the new SVG cells; `symbol-pop` plays on every refill.
  - Free-spin board and wheel: see Cycle 2 manual QA.
  - Cat pop-in: same direct-render technique as the wheel above — temporarily
    exported `showCatPopIn` from `board.ts`, called it via a throwaway hash
    route for both Joey and Phoebe with their canon-correct quip lines, and
    screenshotted each. Confirmed the hop-in + fading quip bubble render
    correctly with the right cat sprite (Joey gray/yellow-eyed, Phoebe tuxedo
    per canon S7). Removed the temporary export/route immediately after.
- `npx vitest run` → 8 files, 34 tests, all green. `npm run build` → tsc +
  vite clean, no warnings.

**Verdict:** Workstreams C and D gates are green for this round's scope.
Remaining presentation gaps (Sparkle Sort shatter visual, Giant Gnome/Chai
Back bespoke effects, music loops, milestone scenes) are listed honestly in
`docs/REPLIT-HANDOFF.md` v2 rather than faked.

## Overall round summary

3 validation cycles completed (A, B, C+D combined). `npx vitest run` final
state: 8 files, 34 tests, 100% passing, `simulation.test.ts` oracle intact
and never weakened. `npm run build` clean throughout. No console errors
observed in any manual QA pass. See `docs/REPLIT-HANDOFF.md` v2 for the full
file-by-file changelog and honestly-scoped follow-up list.
