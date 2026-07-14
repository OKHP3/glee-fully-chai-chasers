# Assessment: Replit Vertical Slice 1
**Reviewer:** Claude · **Date:** 2026-07-10 · **Verdict: solid skeleton, broken math, absent presentation. Fixable in one focused round.**

## What Replit got right (credit where due)

- Architecture discipline: engine/UI/audio boundaries held exactly as specified; `src/engine/` has zero DOM imports (verified); UI computes no math.
- 23 real unit tests, all passing; `tsc` clean; production build clean (verified independently in sandbox).
- Canon rules encoded and tested: Joey refuses to assist without Bougie Bites; the automatic-refill invariant holds; `ccv1.*` persistence works.
- The handoff doc is honest — stubs are labeled as stubs, placeholder weights flagged as placeholder.

## What's broken — quantified (100k-spin seeded simulation vs DESIGN-SPEC §4)

| Metric | Spec | Replit slice | Factor off |
|---|---|---|---|
| RTP | 96% ±0.5 | **14.1%** | ~7x too stingy — the game feels dead |
| Free-spin trigger | 1 in 35 spins | **1 in 1,235** | 35x too rare — Glee would never see a bonus |
| 8+ cascade mega | 1 in 900 | **0 in 100,000** | unreachable |
| UniGlee | 1 in 400 | **1 in 5.3** | 75x too common — the legend is wallpaper |
| Cat pop-in | 1 in 30 | 1 in 31.4 | ✅ on spec |
| Any-win rate | 1 in 2.9 | 1 in 3.4 | close, tunable |

Root causes: (1) per-cell independent symbol draws instead of reel strips — no stacked wilds (spec §5 requires 6-7 high stacks; stacking is what makes cascade chains and big lines possible); (2) UniGlee weighted like a regular symbol instead of gated at ~1/400 per spin; (3) paytable values plugged in without any simulation tuning; (4) free-spin ladder unreachable because cascade chains die immediately without wild stacks and specialty wilds (`specialtyAwarded` is always `[]`).

## Presentation gap (the "1987" problem)

Symbols are emoji glyphs in flat gray boxes. Cascade "animation" is `innerHTML` replacement — no reel spin, no beam-up, no gravity drop, no anticipation, no win-line rendering, no celebrations, no background scene, no character presence. The original game communicates 90% of its joy through motion and escalation; the slice has neither. Nothing here is architecturally wrong — the render layer is simply unfinished.

## Deploy status

GitHub Pages 404s. Two causes: (a) Pages may not be enabled (Settings → Pages → Source: GitHub Actions); (b) **the CI privacy gate fails the build by design because `reference-photos/` is still in the committed tree** — the photo purge (private-work/photo-triage.md) remains unexecuted and blocking. This is the gate doing its job.

## Disposition

Keep: all engine module structure, tests, state, audio synth skeleton, board layout skeleton. Replace/finish: reel-strip model with stacked wilds, UniGlee gating, specialty wilds, simulation-tuned weights, the entire animation/art layer, free-spin gameplay + wheel. The forcing function is `src/engine/simulation.test.ts` (committed by Claude): CI-run spec-oracle gates that fail until the math meets DESIGN-SPEC §4. Round-2 instructions: `docs/prompts/REPLIT-ROUND-2-PROMPT.md`.
