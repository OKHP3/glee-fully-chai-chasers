# IMPLEMENTATION-BASELINE.md — Running State and Tool Handoff

**Status:** canonical integration baseline
**Approved by:** Jamie
**Date:** 2026-07-12
**Integration base commit:** `58970e7eac25d8352371103217d3b70809ff6440` on GitHub `main` (includes Replit's bounded splash pointer-event fix and removes the obsolete raw synchronization-prompt attachment). The approved Chai Chase realignment lands as a reviewed descendant of this base.

This document answers one question for Claude, Codex, Replit, Copilot, Notion, and every future tool: **what is authoritative now, and how may it be changed without one system overwriting another system's best work?**

The answer is layered. No single tool's entire output owns the product.

## 1. Authority by layer

| Layer | Authority | Rule |
|---|---|---|
| Product vision, canon, mechanics, acceptance criteria | `docs/DESIGN-SPEC.md`, `docs/CANON.md`, `docs/IP-GUARDRAILS.md` | Claude's canonical specification remains authoritative. |
| Settled decisions and ownership | `docs/DECISION-LOG.md` | Jamie rules. Later decisions supersede earlier assignments where they conflict. |
| Engine math and event-frequency oracle | `src/engine/`, especially `simulation.test.ts` | Claude's pure-TypeScript engine boundary and test oracle may not be weakened. |
| Current presentation and interaction | Baseline commit above; `src/ui/board.ts`, `src/ui/symbols.ts`, `src/style.css`, `public/assets/` | The S18 Codex/ChatGPT production-art and UI pass is the protected integration baseline. |
| Production source and deployment | GitHub `main` and GitHub Pages | GitHub is the only source of truth. Replit is a worker/preview environment, not a second canonical repository. |

## 2. Why the presentation baseline changed

The earlier Claude/Replit build established a functioning engine, free-spin flow, Web Audio foundation, and validated math. Those contributions remain valuable. Its presentation layer, however, was superseded by Jamie's S18 quality ruling because it still used generic or weakly personal symbols, low-information prototype SVG art, indistinct Joey/Phoebe treatment, a character-light bonus wheel, stretched mobile reel cells, and a repeated decorative resting board.

The current baseline materially improves the gift in ways that should not be rolled back:

- a coherent production sprite atlas rather than tiny prototype SVG symbols;
- meaningful Glee-specific presentation: cardigan, moonlit book stack, butterfly clip, aurora keepsake, shared-life locket, iced chai, and the three treat pouches;
- distinct illustrated Joey and Phoebe art for wilds, pop-ins, and the free-spin wheel;
- Joey and Phoebe visibly framing the Sparkle Wheel while its energy ring spins independently;
- an iPhone-first 5×4 cabinet with near-square cells, safe-area handling, 48px utility controls, and a 68px SPARKLE! control;
- a prominent, accurate Firefly Cascade meter;
- genuine final-reel settlement after each spin instead of returning to a repeated seed board;
- beam-up and staggered-drop cascade choreography;
- corrected GitHub Pages manifest/icon paths and a clean browser load;
- the S17 public-narrative policy: birthday-gift story only, with no invented backstory.

The visual replacements intentionally retain several legacy engine identifiers. A UI/art task must not rename those identifiers or change reel weights, payouts, or probabilities.

## 3. Protected baseline

Do not broadly regenerate, replace, or roll back the following without Jamie's explicit approval and a side-by-side iPhone comparison:

- `src/ui/board.ts`
- `src/ui/symbols.ts`
- `src/style.css`
- `public/assets/atlases/standard-symbol-atlas.{png,webp}` and `public/assets/atlases/special-symbol-atlas.{png,webp}`
- `asset-source/glee-symbol-atlas.png` (source master for reproducible atlas generation)
- `public/assets/joey-phoebe-wheel.png`
- `public/assets/joey-phoebe-wilds.png`
- `docs/DECISION-LOG.md` decisions S17-S23
- the public-story language in `README.md`, `docs/STORY.md`, and `docs/CANON.md`

"Protected" does not mean frozen. It means future work must be a bounded improvement applied on top of this state, not a wholesale replacement from an older Claude or Replit checkpoint.

## 4. Running-state matrix

> **Superseded 2026-08-09.** This matrix reflects the state on 2026-07-12 and is retained as history. For what is actually shipped today, read **§9, the 2026-08-09 running-state refresh**, at the end of this document. Section 9 supersedes this section only. Sections 1 through 3 remain in force.

### Implemented and integrated

- 5×4, 40-line cascade engine and simulation-validated fictional Glee-coin economy
- event-frequency simulation oracle
- free-spin ladder, modifier selection, and free-spin session flow
- We're Multiplying opening-spin math: one reel-bound wild at most, line-specific awards, and no multiplier creation during cascades
- one-shot Wild Chai Storm: opening-board iced-chai symbols convert to mermaid-cup wild chai once per session
- persistent balance, XP, settings, Treat Jar, and cat-visit state
- original Web Audio one-shot SFX
- Treat Time direct primary-board bonus with Morning/Nighttime modes and typed wild-cast payload
- Moonlit Keepsake Trail memory bonus: dedicated reel-stage 12-card/6-pair screen, two-strike state machine, 40-spin standard handoff, original card/mismatch assets, and audio cues
- production symbol, Joey, Phoebe, wild, and wheel art
- mobile-first board, Firefly Cascade meter, Treat Jar, AskJamie perch, and controls
- real post-spin resting grid and cascade beam/drop motion
- UniGlee takeover and illustrated cat pop-ins
- GitHub Pages build/deploy workflow, manifest, and app icons

### Planned or only partially visualized

- Birthday Reveal
- Bold Chai Bonus keepsake pick shelf
- Claude-owned removal of legacy system-wide twelve mechanics (level unlock and Treat Jar cap) with simulation-backed RTP retuning
- Daily Bonus Wheel
- milestone scenes and collection shelf
- one-shot literal iced-chai Wild Chai Storm board behavior (implementation now present; RTP release gate remains pending)
- production music loops and final mix
- approved production AskJamie avatar integration
- service-worker/offline verification
- asset-size optimization and saved device-regression gallery

Documentation and public copy must distinguish this second list from shipped features. A specification is not evidence that its feature is implemented.

## 5. Required workflow for Claude

1. Pull GitHub `main` and read this file plus `docs/GAME-REALIGNMENT-2026-07-12.md` before proposing code.
2. Preserve the current presentation baseline; do not restore the older SVG/gnome/mailbox/teapot/yarn-ball UI.
3. Keep engine work inside pure TypeScript under `src/engine/` and keep the oracle intact.
4. Expose engine changes through the existing typed result boundary; UI owns no game math.
5. Submit one bounded diff with tests and identify any UI impact before editing protected files.

## 6. Required workflow for Replit

1. Stop work on every pre-S18 checkpoint.
2. Import or pull `https://github.com/OKHP3/glee-fully-chai-chasers`.
3. Verify the checked-out commit is the baseline above or a later descendant that includes S19-S23.
4. Run `npm ci`, `npm test`, and `npm run build` before making changes.
5. Accept only one bounded assigned gap; never ask Agent to regenerate or modernize the whole application.
6. Show Jamie the diff and an actual iPhone-size preview before syncing changes back.
7. Never push an older Replit-generated tree over GitHub `main`.

If the existing Replit App cannot cleanly pull from GitHub, create a fresh Replit import from GitHub rather than copying individual files or asking Agent to reconcile two whole codebases.

## 7. Required workflow for every tool

1. GitHub `main` → dedicated branch/checkpoint.
2. One bounded deliverable with one owner.
3. Preserve engine/UI separation and the privacy/IP rails.
4. Run tests and production build.
5. Compare at 390×844 or a current iPhone viewport; inspect console output.
6. Human-review the diff.
7. Merge to `main`; let GitHub Pages deploy that reviewed state.

Never exchange entire source trees between Claude, Codex, and Replit. Exchange narrow patches against the same Git commit.

## 8. Repository hygiene note

`dist_old_1783751579/` is a historical build artifact, not source and not a rollback candidate. `attached_assets/` contains empty paste placeholders and is not instruction input. Both should be removed in a dedicated cleanup change after Jamie reviews the deletion. No tool may treat either directory as current implementation guidance.

## 9. 2026-08-09 running-state refresh

**Status:** current running state. **Date:** 2026-08-09. **Basis commit:** `234ea74` on `main`.
**Scope:** this section supersedes **§4 only**. Sections 1 through 3 remain in force unchanged, including the authority table and the protected-baseline list, with the one addition recorded below. Sections 5 through 8 remain in force.

Added under the governance rule in this repository's own guidance: do not silently replace a settled document, add a dated section. Section 4 is left intact as the 2026-07-12 record.

### 9.1 Addition to the protected presentation surface (§3)

Three files have joined the protected presentation surface since §3 was written. Treat them exactly as the §3 list is treated: bounded improvement only, never wholesale regeneration or rollback from an older checkpoint, and never without Jamie's approval plus an iPhone-size comparison.

- `src/splash.ts` (splash screen, audio-unlock gate, and the July birthday window; the `BIRTHDAY_MESSAGE` constant is Jamie's own words and is edited by nobody but him)
- `src/ui/ice-notes.ts` (the in-game note deck and its copy)
- `src/ui/lap-quest-ledge.ts` (Phoebe's Lap Quest interactive ledge, timing, and phases)

The rest of §3 is unchanged.

### 9.2 Shipped since 2026-07-12

Everything listed in §4 as implemented remains implemented. The following shipped on top of it.

- **Joey's Laundry Helper.** `src/engine/laundry.ts`. Opening-grid chapter modifiers with sock-drop and paw-strike rolls and weighted multipliers. Ships as UniGlee act 1.
- **Phoebe's Lap Quest.** `src/engine/lap-quest.ts`, `src/ui/lap-quest-ledge.ts`. Interactive petting ledge with grace, active, and ending phases, a Joey interrupt. The ledge timer lives in the UI (`lap-quest-ledge.ts`); the engine owns only the round runner and sticky-wild placement. Ships as the final UniGlee act.
- **The playable UniGlee five-act marathon.** `src/engine/uniglee.ts`, `src/engine/uniglee-marathon.ts`. Reel-activated trigger on active reels, Laundry first, a seeded shuffle of We're Multiplying / Keepsake Collection / Nighttime Treat Time in the middle, Lap Quest last, quarter allocations, act-local retriggers, and a per-act termination ceiling. §4 listed the marathon as visualized only.
- **The Chai Sparks XP and wager-ladder economy.** `src/engine/economy.ts`. Wager levels 1 / 2 / 5 / 10 / 25 / 50 with the sixth gated behind player level 12, a 500-coin start, a 500-coin bust-proof refill, XP per spin, and XP-driven player levels. §4 listed only "persistent balance, XP, settings".
- **The splash and birthday-window flow.** `src/splash.ts`. Audio-unlock gate plus a birthday block that runs July 17 to 31 of any year and grants 10,000 Glee-coins once per device per calendar year. This directly changes §4's "Birthday Reveal" line: see 9.4.
- **Ice Notes.** `src/ui/ice-notes.ts`. The rotating in-game note deck.
- **Theme control and separate music and SFX volumes.** `src/state.ts`, persisted alongside balance, bet, XP, and Treat Jar.
- **The in-game paytable page.** `openPaytablePage` in `src/ui/board.ts`. Symbol guide, the 40-fixed-line explanation, and line-bet multiples.
- **Doorbell Panic, Bold Chai Pump, Keepsake Constellation, and Handbag Wild** are all shipped engine features with test coverage.
- **Repository posture.** A threat model (`docs/threat-model.md`), an ADR practice (`docs/adr/`), a promoted skill (`skills/okhp3-skill-promotion/`), a full-game RTP harness (`scripts/sim-agent.ts`), and a supply-chain posture in `pnpm-workspace.yaml`.

### 9.3 Verified engineering state

Re-measured on this commit, not quoted from another document. Every figure carries the command that produced it.

| Check | Result | Command |
|---|---|---|
| Test suite | 170 tests, 24 files, all passing | `npx vitest run src` |
| Type check and production build | Clean | `npm run build` |
| Oracle: base RTP | 61.08% | `npx vitest run src/engine/simulation.test.ts --reporter=verbose` |
| Oracle: any-win rate | 1 in 3.15 | same |
| Oracle: free-spin trigger | 1 in 151 | same |
| Oracle: 8+ cascade mega | 1 in 980 | same |
| Oracle: UniGlee capture | 1 in 1,370 | same |
| Oracle: cat pop-in | 1 in 32.3 | same |
| Full-game RTP | **98.70%** over 2,000,000 paid spins, seeds 1 to 40 | `for s in $(seq 1 40); do npx tsx scripts/sim-agent.ts a$s $s 50000; done` |
| Full-game RTP, 95% confidence interval | 97.93% to 99.47% | same |
| Full-game RTP, per-seed sd | 2.49 | same |
| Full-game RTP, per-seed span | 94.16% to 106.78% | same |
| Seeds inside the documented 95% to 98% band | 10 of 40 | same |
| Base layer contribution | 61.05% | same |
| Bonus layer contribution | 37.65% | same |
| Capped bonus sessions | 0 | same |

Per-bonus RTP contribution over the same fleet: firefly free spins 10.64% (We're Multiplying 5.21%, Moonlit Keepsake Trail 4.28%, Iced Chai Wild Rain 1.15%), UniGlee 7.47% at 1 in 1,229, doorbell panic 4.98%, morning treat time 4.44%, treat jar 4.32%, nighttime treat time 3.87%, bold chai 1.93%.

The base oracle measures the base game only. Full-game RTP requires the sim-agent fleet.

**Two caveats travel with 98.70% and must not be dropped when it is quoted.**

1. **It is above the documented band.** `docs/DESIGN-SPEC.md` §4 records 95% to 98%. The entire confidence interval sits above 98%, and only 10 of 40 seeds land in band. This is a documentation-accuracy question, not a player-facing defect, because the game uses fictional Glee-coins with no purchase, wager, or cash-out. Open as **D8** in `docs/DECISION-LOG.md`. Do not retune the engine to chase the band without Jamie's ruling.
2. **It assumes a perfect player.** The harness models both interactive bonuses at their ceiling: Bold Chai Pump at a steady six pumps per second for the full 30-second window (`scripts/sim-agent.ts` lines 72 to 79), and the Moonlit Keepsake Trail always completed by a perfect-memory player who always collects the 40-spin handoff (line 183). 98.70% is a generous-play ceiling. Real play sits below it by an unmeasured amount, because no realistic-play variant of the harness exists yet.

Earlier readings of 95.66% and 97.56%, both over seven seeds, were small-sample noise. At a per-seed sd of 2.49, seven seeds cannot resolve a band 3 points wide. Do not restate them.

### 9.4 Corrections to §4's "planned or only partially visualized" list

| §4 entry | Correct status as of 2026-08-09 |
|---|---|
| Birthday Reveal | **Partly shipped.** The birthday message and the 10,000-coin grant are live on the splash, gated to July 17 to 31 and claimable once per device per year (`src/splash.ts`). Only the Birthday Reveal **scene** is unshipped. Do not describe the birthday feature as unshipped. |
| One-shot literal Wild Chai Storm, "RTP release gate remains pending" | **Shipped and gated green.** The oracle and the sim-agent fleet both pass. |
| Approved production AskJamie avatar integration | **Shipped** per S27. |
| Bold Chai Bonus keepsake pick shelf | Still unshipped as a pick shelf. The Bold Chai Pump engine (`src/engine/bold-chai-pump.ts`) is shipped and is a different mechanic. |
| Removal of legacy system-wide twelve mechanics | Still open. S32 makes twelve an explicit, contained exception for the Moonlit Keepsake Trail only. Do not expand it. |
| Daily Bonus Wheel, milestone scenes, collection shelf | Still unshipped. |
| Production music loops and final mix, service-worker/offline verification, asset-size optimization, device-regression gallery | Still open. |
| In-flight UniGlee reload persistence and fast/skip controls | Still open, as the marathon contract states. |

### 9.5 Known documentation deltas, not resolved here

These are recorded so no tool treats them as settled. None of them is a code defect and none was "fixed" by editing a ruling.

- **UniGlee award size.** S30 (2026-07-15) says 300/400/500 initial free spins; full marathon structure is in GAME-MECHANICS.md §9. The engine awards 40/60/80 (`src/engine/uniglee.ts` line 94, typed in `src/engine/laundry.ts` line 21). Open as **D7** in `docs/DECISION-LOG.md`. Do not change either side until Jamie rules.
- **Full-game RTP is above the documented band.** `docs/DESIGN-SPEC.md` §4 records 95% to 98%; the converged fleet measures 98.70% with a 95% CI of 97.93% to 99.47%, and only 10 of 40 seeds land in band. The figure also assumes a perfect player on the two interactive bonuses. Open as **D8** in `docs/DECISION-LOG.md`. Documentation-accuracy question, not a player-facing defect. Do not retune to chase the band without a ruling.
- **Decision numbering.** Two settled rows both carry the label S30. Recorded as a numbering errata note in `docs/DECISION-LOG.md`; both rulings stand and nothing was renumbered.
- **UniGlee tease mechanic.** The live public page describes a decorative sighting at ~1/850 and a real capture at ~1/4,212, citing decisions S33 and S34 that do not exist. The engine implements neither. Open as **D6**.
- **`lib/` and `artifacts/`.** Replit workspace scaffolding that nothing under `src/` imports and that never reaches `dist/`. Not implementation guidance. Whether they stay in the repository is an open cleanup item.
