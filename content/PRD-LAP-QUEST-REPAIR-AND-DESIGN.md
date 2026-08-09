# PRD, Build Directive. Phoebe's Lap Quest: Terminate the Hang, Close the Coverage Gap, Redesign the Ledge

**Target Repl:** a fresh Replit import of `https://github.com/OKHP3/glee-fully-chai-chasers` at `main`
**Author:** Claude (PM) · **Date:** 2026-08-09 · **Version:** Build 1.0
**Type:** DIRECTIVE BUILD. One P1 engine defect, one measurement gap, one design workstream. Not a refactor. Not a redesign of anything outside Lap Quest.
**Governance:** `docs/IMPLEMENTATION-BASELINE.md` §6 applies. Replit is a worker environment, never a second canonical repository. GitHub `main` is the only source of truth.

---

## 0. Mission statement (read twice)

Phoebe's Lap Quest is the closing act of the UniGlee marathon, the rarest and most story-worthy event in the game. It currently ships with a defect that can lock the player's browser tab, it is the only bonus excluded from the RTP harness, and its Phoebe artwork is the one cat in the game drawn off-baseline.

Three workstreams, in this order:

| # | Workstream | Type | Gate |
|---|---|---|---|
| A | Terminate the non-terminating cascade loop | P1 engine defect | Simulation-gated |
| B | Add Lap Quest to the full-game RTP harness | Measurement gap | Fleet re-run |
| C | Rebuild the ledge presentation in Replit's design canvas | Design | Jamie approves visually |

**A and B are one commit boundary and must ship together.** You cannot prove A is fixed without B, because the harness that would have caught this defect never ran the code path. C is independent and may proceed in parallel.

**Hard constraint that governs everything below:** this is a birthday gift with fictional currency and no real money. Correctness and warmth win over cleverness. If a choice is between a mathematically elegant fix and an obviously safe one, take the obviously safe one and say so.

---

## 1. Scope fences

**You may modify:**

- `src/engine/cascade.ts` (Workstream A, the guard only)
- `src/engine/cascade.test.ts` and `src/engine/lap-quest.test.ts` (new regression tests)
- `scripts/sim-agent.ts` (Workstream B)
- `src/ui/lap-quest-ledge.ts` and the `.lap-quest-*` block of `src/style.css` (Workstream C, only after Jamie approves the canvas)
- `docs/DECISION-LOG.md` (one new open decision, D9)

**You may NOT modify:** any reel strip, payout, paytable value, `PAYOUT_SCALE`, trigger probability, ladder tier, or wild-landing rate. Any file under `src/ui/` other than `lap-quest-ledge.ts`. `src/ui/board.ts`, `src/ui/symbols.ts`, or the production art in `public/assets/`, all of which are the protected S18 presentation baseline. The oracle's thresholds in `src/engine/simulation.test.ts`, which may not be weakened, widened, or skipped.

**You may not "while I'm here."** If you find another defect, file it in the handoff and stop.

---

## 2. Workstream A. The non-terminating cascade loop

### 2.1 Symptom

During Phoebe's Lap Quest, the game can enter a cascade loop that never exits. The browser tab becomes unresponsive and the player loses the entire UniGlee marathon in progress. There is no error, no console output, and no recovery short of closing the tab.

### 2.2 Root cause, exactly

Four facts combine:

1. `chooseComfortWilds` (`src/engine/lap-quest.ts:75`) scatters 2 or 4 `wild_phoebe` sticky wilds across the 20 board positions at random. Four on a perfect lap, two on a cozy one.
2. `wild_phoebe` is in `NEVER_SHATTER` (`src/engine/cascade.ts:68`).
3. `cascadeColumnAroundStickyWilds` (`src/engine/cascade.ts:143`) **restores** every sticky position after a cascade rather than clearing it. Line 154 rewrites the cell back with `sticky: "lap_quest"`.
4. The cascade loop in `spin()` exits only when `evaluateLines` returns no wins. It has no other exit and no iteration cap.

So when the sticky set happens to cover reel indices 0, 1, and 2 of any single payline, that line evaluates as a win on every pass. The win positions enter `removedByReel`, the sticky restore puts them straight back, `nextGrid` comes out symbol-identical to `grid`, and the loop pays the same line forever.

### 2.3 Reproduction

```
seed 99, Lap Quest round index 28
comfort wilds at (0,3) (1,2) (2,2) (3,2)
payline 13
```

Measured incidence: **1 in 29.1 rounds strictly non-terminating**, plus roughly 1 in 7.1 that are unbounded in practice. Lap Quest runs on every UniGlee capture and a typical marathon plays 15 to 30 rounds, so the probability of a locked tab is roughly **40% to 65% per capture**. UniGlee capture is about 1 in 1,229 paid spins.

### 2.4 Required fix: the grid-identity guard

Inside the cascade loop in `spin()`, after `nextGrid` is computed (`src/engine/cascade.ts:355`) and before the loop continues, compare `nextGrid` to `grid` by symbol identity across all 20 cells. If they are identical, push the final step and `break`.

Rationale: the loop's real termination condition is "the board stopped changing," not "there were no wins." An all-sticky winning line pays exactly once and the round ends, which is both correct and what a player would expect. This guard is impossible to trip on any spin that is actually progressing, so it cannot alter the behavior or the RTP of any currently-terminating spin.

### 2.5 Also required: the iteration backstop

Add a hard cap to the same loop. If `cascades` exceeds **500**, break and increment a counter exposed on `SpinResult` as `terminatedByCascadeCap`.

This is belt and braces, not the fix. Measured cascade depth is single digits and 8-or-more cascades already occurs only once in 980 spins, so 500 cannot bind in real play. Its job is to guarantee that no future sticky-wild, keepsake-zone, or blocker variant can ever hang the tab again. The counter exists so a nonzero value in the fleet output is a loud signal that something regressed.

### 2.6 Fixes considered and rejected

| Option | Why not |
|---|---|
| Cap iterations only, no identity guard | Turns an infinite hang into a 500-iteration payout stall that awards an absurd win. Treats the symptom. |
| Stop sticky wilds from restoring after a win | Changes Lap Quest's design. Sticky comfort wilds persisting is the entire point of the chapter. |
| Constrain `chooseComfortWilds` so it cannot cover a line prefix | A game-design change to fix an engine bug, and it would need Jamie's ruling. It also leaves the engine still capable of hanging from any other sticky source. |
| Exclude wild-only lines from paying at all | Silently removes real wins elsewhere in the game. Out of scope and not simulation-backed. |

### 2.7 Tests required

Add all four. Each must fail against current `main` and pass after the fix.

1. **Regression, exact repro.** Seed 99, round 28, the four wild positions above. Assert the round terminates and that `steps.length` is finite and small.
2. **Constructed worst case.** Place sticky wilds directly at reels 0, 1, 2 of payline 13 and assert termination in a bounded number of steps.
3. **Pays once, not forever.** Same setup, assert the all-wild line contributes its payout exactly one time.
4. **No false positives.** A normal Lap Quest round with sticky wilds that do not cover a line prefix must cascade and terminate exactly as it does today. Snapshot the step count against current behavior so the guard is proven inert on healthy spins.

Do not delete or weaken any existing test to make these pass.

---

## 3. Workstream B. Close the harness gap

`scripts/sim-agent.ts` never invokes Lap Quest. That is why a defect this severe survived a 2,000,000-spin measurement campaign. The harness runs the UniGlee marathon through `runUniGleeBaseMarathon`, which by design excludes act 5.

Required:

1. Add a Lap Quest stage to the harness so a captured UniGlee plays all five acts.
2. Model the player choice explicitly. The pick is one of three with one correct answer, so an uninformed player is right one time in three. Use a **random uniform pick**, not always-perfect, and state that model in a comment and in the harness output. Do not quietly assume the optimal choice the way Bold Chai and the Keepsake Trail currently do.
3. Add `lapQuest` to the bonus tally with the same shape as every other bucket.
4. Surface `terminatedByCascadeCap` in the report so a nonzero value is visible.

Then re-run the fleet: **40 seeds, 50,000 paid spins each**, via `npx tsx scripts/sim-agent.ts <id> <seed> 50000` for seeds 1 through 40. Report pooled RTP, per-seed spread, the 95% confidence interval, and Lap Quest's own contribution.

**Expect the number to move up.** The current published figure of 98.70% excludes Lap Quest entirely. Adding it can only add RTP. Do not tune anything to compensate. Report the new figure with its seeds and let Jamie rule it under D8, which is already open on exactly this question.

### 3.1 Provenance rule, non-negotiable

Every RTP or frequency figure you report ships with the exact command and seed range that produced it. Every full-game RTP claim states its player model. This project has already published three different unreproducible RTP numbers, and that is precisely why this defect went unseen.

---

## 4. Workstream C. Rebuild the ledge in Replit's design canvas

### 4.1 The problem with the current Phoebe

`phoebeLedgeSvg()` in `src/ui/lap-quest-ledge.ts` is a hand-rolled inline SVG: ten paths, two linear gradients, roughly 900 bytes of hand-tuned bezier. Every other cat in the shipped game renders from the S18 production raster atlas through `catSprite()`, which reads `public/assets/joey-phoebe-wilds.png`.

So the Lap Quest ledge is the only place in the game where Phoebe is drawn by a different hand, in a different medium, at a different level of finish. That is the whole diagnosis. It does not read as poor because the geometry is wrong. It reads as poor because it is off-baseline, and it sits in the most emotionally loaded moment the game has.

### 4.2 First, resolve which Lap Quest is canon

**Do not design until this is answered.** There are currently three Lap Quest presentations in the tree and they do not agree:

| Implementation | Status | Behavior |
|---|---|---|
| `showLapQuestChoice` + `showLapQuestReveal` in `board.ts` | Wired and live | Pick one of three cozy spots, reveal, wilds land |
| `mountLapQuestLedge` in `lap-quest-ledge.ts` | Built, 90-second petting minigame with grace period and a Joey interrupt | **Unclear whether it is reachable in production** |
| `lap-quest-session.ts` | 283 lines, 8 passing tests, **no production caller at all** | Dead |

Trace the call graph and report what is actually reachable from a real UniGlee capture. Then raise **D9** in `docs/DECISION-LOG.md` asking Jamie which presentation is canon and what happens to the other two. Do not delete anything. Do not wire anything up. Ask.

### 4.3 Design canvas deliverable

In Replit's design canvas, produce a preview of the Lap Quest bonus UI covering these states. Static frames are fine; motion is a bonus, not a requirement.

1. **Entry.** Phoebe arrives at the ledge, before any player input.
2. **The choice.** Three cozy spots presented: Window Perch, Blanket Nest, Moonlit Cushion.
3. **Perfect lap.** The correct spot, four comfort wilds landing.
4. **Cozy lap.** A wrong spot, two comfort wilds landing, warm rather than punishing.
5. **Joey interrupt.** The exit beat, if the ledge presentation survives D9.
6. **Mobile.** Every state at 390 wide. This game is iPhone-first and always has been.

### 4.4 Art direction for Phoebe

**Canon, non-negotiable:**

- Phoebe is a curvy black-and-white tuxedo cat. Joey is a slender gray cat with yellow eyes. Do not swap them.
- Original illustration only. No photographs and no photorealistic rendering of Phoebe, Joey, or Glee. Decision S15.
- Iced chai only. No hot chai, steam, kettles, or mugs anywhere in frame. Decision S3.
- No brand names, logos, or trade dress of any kind. See `docs/IP-GUARDRAILS.md`.
- Match the S18 production cat art in `public/assets/joey-phoebe-wilds.png`. That file is the style anchor. The new Phoebe must look like she came from the same hand as the wild symbols and the wheel art.

**Palette, from `docs/DESIGN-SPEC.md` §11:**

| Token | Hex |
|---|---|
| Midnight navy | `#1a1f3c` |
| Violet | `#2d1f4c` |
| Mint | `#9fe8c5` |
| Burnt orange | `#d35b2d` |
| Butter | `#f5d576` |
| Dusty pink | `#e8a5b8` |

**The feeling to hit:** this is the last act of the rarest event in the game, and it is the quiet one. Everything before it is spectacle. This should be a cat settling onto a lap in a dark warm room while an aurora happens outside the window. Restful, not triumphant. Get that and the artwork is right.

**Deliver two or three distinct directions, not one.** Jamie picks. Do not converge early.

### 4.5 Implementation constraint once a direction is approved

If the winning direction is raster, it goes through the existing atlas pipeline and `asset-source/`, so the generator stays reproducible. If it is vector, it replaces `phoebeLedgeSvg()` in place and nothing else moves. Either way `src/ui/board.ts`, `src/ui/symbols.ts`, and the shipped atlases are untouched.

**Do not implement before Jamie approves a canvas direction.** The canvas is the deliverable for this workstream.

---

## 5. One more defect, small, fix it in Workstream A

`mountLapQuestLedge` calls `Math.random()` to choose Joey's arrival time (`src/ui/lap-quest-ledge.ts:57`). Every other stochastic element in this game runs through the seeded `mulberry32` RNG, which is what makes the oracle a deterministic regression test. Route this through the injected RNG like everything else. The `interruptAtMs` option already exists as the injection point, so this is a small change.

---

## 6. Validation loop, all three cycles required

```
Cycle 1, mechanical:
1. The four new tests fail on current main. Prove it, paste the failure.
2. Apply the guard and the cap. All four now pass.
3. npx vitest run src  (do NOT pass --reporter=basic, it fails to resolve)
   Expect 174+ tests green, zero skipped, zero weakened.
4. npm run build  clean.
5. git diff. Outside the tests and sim-agent.ts, the diff should be small.
   If cascade.ts changed by more than roughly 20 lines, you did too much.

Cycle 2, measurement:
6. Run the 40-seed fleet at 50,000 paid spins. Report pooled RTP, per-seed
   spread, 95% CI, Lap Quest's contribution, and terminatedByCascadeCap.
7. terminatedByCascadeCap must be 0. Nonzero means the identity guard is
   not doing its job and the cap is masking it. Stop and report.
8. Re-run the oracle. All six gates green, thresholds untouched.

Cycle 3, soak:
9. Run 5,000 Lap Quest rounds across at least 20 seeds. Zero non-terminating,
   zero hitting the cap. Include seed 99 round 28 explicitly.
10. Manual check at 390x844: trigger a Lap Quest, confirm the round resolves
    and the tab stays responsive. Console clean.
```

---

## 7. Deliverables and handoff

- **Workstreams A and B: one commit.** `fix: terminate Lap Quest cascade loop and add Lap Quest to the RTP harness`
- **Workstream C: no code commit.** Design canvas link plus exported frames.
- `LAP-QUEST-HANDOFF.md` in the repl containing: the three validation cycles with real output, the before-and-after RTP figures with seeds and player model, the D9 call-graph findings, and anything you noticed but correctly did not touch.
- **Do not push to GitHub `main`.** Open a branch and show Jamie the diff. `docs/IMPLEMENTATION-BASELINE.md` §6.7 requires human review before merge, and this touches the engine.

---

## 8. Acceptance criteria

1. A player who catches a UniGlee can complete all five acts without the tab ever hanging, on any seed.
2. The full-game RTP figure includes Lap Quest, ships with its seeds and its player model, and nobody had to tune a constant to get there.
3. Every one of the six oracle gates is still green and none of their thresholds moved.
4. Jamie has picked a Phoebe direction from at least two options and it looks like it came from the same hand as the rest of the game.
5. D9 is open in the decision log with an honest account of which Lap Quest implementations exist and which one is actually reachable.

---

## 9. Why this one matters more than the web pages

Everything else in the current queue is documentation accuracy. This is the only item where a real person, on a real phone, loses something. Glee catches a UniGlee roughly once every 1,229 spins. When she does, this defect takes it away from her better than half the time, silently, with no error and nothing to report.

Fix this first.
