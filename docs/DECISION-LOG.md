# Decision Log — Glee-fully Chai Chasers

Single source of truth for product decisions. One owner per deliverable. Jamie rules; tools build only on settled decisions. Add new decisions as dated rows — never delete history.

## Open decisions

D1 through D5 were ruled by Jamie on 2026-07-10 and now sit in the settled table as S8 through S12. The two decisions below were raised on 2026-08-09 by the accuracy audit (`content/AUDIT-2026-08-09.md`) and are awaiting Jamie's ruling. Both are written so a one-word answer settles them.

### D6. Was the UniGlee tease and rarity redesign ever ruled?

**Raised:** 2026-08-09, by Claude, during the accuracy audit. **Owner:** Jamie. **Status:** open.

The live overkillhill.com project page was patched on 2026-07-17 describing a UniGlee redesign in two parts: a decorative "sighting" or tease that a player sees often at roughly 1 in 850 spins, and a real capture that is much rarer at roughly 1 in 4,212 spins. `content/PRD-OVERKILLHILL-PROJECT-PAGE-PATCH-2.md` attributes that copy to decisions **S33** and **S34**. Neither S33 nor S34 exists in this log, which ends at S32.

**The code implements neither half of it.**

| Page claim | Shipped reality | Evidence |
|---|---|---|
| Real capture at ~1 in 4,212 | Three independent per-reel rolls at 1/2,500, 1/4,000 and 1/7,500, combining to ~1 in 1,277 | `src/engine/uniglee.ts` lines 32 to 38, `UNIGLEE_REEL_RATES` and `UNIGLEE_ACTIVE_RATE` |
| Decorative sighting at ~1 in 850 | No such mechanic exists anywhere. `grep -rn "tease\|sighting" src/` returns zero hits. The only 850 in the engine tree is an oracle upper bound on the real capture rate, not a tease rate | `src/engine/simulation.test.ts` line 95 |
| The butterfly "shows itself often but is only truly caught" rarely | The engine enforces the opposite. `placeUniGleeTrigger` deliberately makes the trigger land line-valid "so the event cannot be a decorative, non-paying-looking scatter" | `src/engine/uniglee.ts`, `placeUniGleeTrigger` |
| Measured rate | 1 in 1,370 on the seeded oracle, against a spec target of ~1 in 1,277 | `npx vitest run src/engine/simulation.test.ts --reporter=verbose`; `docs/DESIGN-SPEC.md` line 85 |

**Ruling needed. One word is enough.**

- **(i) "Ruled."** The redesign was a real decision that simply never reached the engine. Log it here as settled S33 and S34 dated 2026-07-17, and open a simulation-gated engine task to build the tease mechanic and re-rate the capture. The public page becomes accurate once the engine catches up.
- **(ii) "Withdrawn."** It was a proposal that got dropped before it was ruled. Record it here as withdrawn and dated, and correct the public page to the shipped 1-in-1,277 behavior.

**Note for Jamie:** the live page currently asserts option (i) as present-tense fact about the shipped game. Until this is ruled, the page describes a mechanic the game does not have, and the page's own acceptance criterion ("a reader who fact-checks the page against the repo finds zero stale claims") fails.

### D7. UniGlee award size: is it 300/400/500 or 40/60/80?

**Raised:** 2026-08-09, by Claude, during the accuracy audit. **Owner:** Jamie. **Status:** open.

A settled decision, its own structural contract, and the shipped engine disagree about how many free spins a UniGlee capture awards.

| Source | Award | Evidence |
|---|---|---|
| S30, 2026-07-15, this log | 300 / 400 / 500 initial free spins | settled row S30 dated 2026-07-15 below |
| Structural contract | 300 / 400 / 500, tabulated by activating reel | `docs/UNIGLEE-MARATHON-AMENDMENT-2026-07-15.md` lines 9 to 15 |
| Shipped engine | 40 / 60 / 80 | `src/engine/uniglee.ts` line 94: `initialAwardSpins: reel * 20 as UniGleeAwardSpins`, over active reels 2, 3 and 4 |
| Shipped type | 40 / 60 / 80, enforced at the type level | `src/engine/laundry.ts` line 21 types `UniGleeAwardSpins` as the union of 40, 60 and 80 |
| README and both public pages | 40 / 60 / 80 | `README.md` line 31 |

Either the engine diverged from a live ruling, or S30 was superseded during the 2026-07 RTP retune without a log entry. Every artifact except S30 and its contract now says 40/60/80, which suggests the second, but this log is the only place that can settle it.

The stakes are quantified. UniGlee at 40/60/80 already contributes roughly six points of full-game RTP on its own and is the single largest source of per-seed RTP variance in the sim fleet.

**Ruling needed. One word is enough.**

- **(i) "Code."** 40/60/80 is canon. Add a dated superseding decision here, and append dated notes to S30 and to `docs/UNIGLEE-MARATHON-AMENDMENT-2026-07-15.md` rather than editing the original rulings. No engine work.
- **(ii) "S30."** 300/400/500 is canon. Open a simulation-gated engine task to raise the award, and re-measure full-game RTP before anything ships. A 7.5x increase on the largest bonus will not stay inside the 95% to 98% band without compensating changes elsewhere, and that compensation is itself an engine decision.

**Ties to D8.** The 2,000,000-spin fleet attributes **7.47 points of RTP to UniGlee alone**, the largest share of any bonus, at the current 40/60/80 award. The game is already measuring above band. D7 option (ii) would multiply the biggest contributor in a game that is already too generous, so **D7 and D8 should be ruled together**.

### D8. The documented RTP band does not match the measured game, and it never stated a player model

**Raised:** 2026-08-09, by Claude, after the converged simulation fleet. **Owner:** Jamie. **Status:** open.

`docs/DESIGN-SPEC.md` §4 records an overall RTP target of "~96.5% (95-98% band)". The measured full game does not meet it.

| Measure | Value | Source |
|---|---|---|
| Documented band | 95% to 98%, target ~96.5% | `docs/DESIGN-SPEC.md` §4 |
| Measured full-game RTP | **98.70%** | 2,000,000 paid spins, seeds 1 to 40 at 50,000 each |
| 95% confidence interval | 97.93% to 99.47% | same |
| Per-seed standard deviation | 2.49 | same |
| Per-seed span | 94.16% to 106.78% | same |
| Seeds landing inside the documented band | **10 of 40** | same |
| Base layer / bonus layer | 61.05% / 37.65% | same |
| Largest contributors | firefly free spins 10.64%, UniGlee 7.47%, doorbell panic 4.98% | same |

Reproduce with `for s in $(seq 1 40); do npx tsx scripts/sim-agent.ts a$s $s 50000; done`.

The entire confidence interval sits above 98%. This is not sampling noise: earlier seven-seed readings of 95.66% and 97.56% appeared to confirm the band, but at a per-seed sd of 2.49 a seven-seed sample cannot resolve a band 3 points wide. The first adequately powered measurement puts the game out of band.

**A second problem sits underneath the first: the band never stated a player model.** `scripts/sim-agent.ts` plays both interactive bonuses at their ceiling. Bold Chai Pump receives a steady six pumps per second for the entire 30-second window (lines 72 to 79), and the Moonlit Keepsake Trail is played by a perfect-memory player who always completes all six pairs and always collects the 40-spin handoff (line 183). So **98.70% is a generous-play ceiling, not an expected value.** Real play sits below it by an amount nobody has measured, because no realistic-play variant of the harness exists. A single RTP number without a stated player model cannot be checked by anyone, which is how three successive figures went unchallenged.

**Ruling needed. One word is enough.**

- **(i) "Restate."** Declare the 95% to 98% figure as base game plus common bonuses only, and publish the full-game figure separately with its player model attached. Documentation change only, no engine work.
- **(ii) "Model."** Keep one combined band but define the assumed player in the spec, and add a realistic-play variant to `scripts/sim-agent.ts` so both the ceiling and the expected value are measurable. Tooling work, no engine retune.
- **(iii) "Retune."** Bring the full game back inside 95% to 98%. This means making a birthday gift measurably stingier, and it runs against Principle 4, "Generous by Design." If chosen, it is simulation-gated engine work and should be ruled together with D7.

**This is a documentation-accuracy question, not a player-facing defect.** The game uses fictional Glee-coins only, with no purchase, wager, cash-out, or odds claim, so a player is not harmed by the game paying better than a document predicted. Nothing needs to ship urgently. What is not acceptable is continuing to publish 95% to 98% as a verified figure while the measured value sits outside it.

## Settled decisions

> ### Numbering errata (recorded 2026-08-09, nothing renumbered)
>
> Two settled rows below both carry the label **S30**:
>
> - **S30, 2026-07-14, Handbag Wild.** Rare non-cat late-reel wild carrying a randomized x3 / x5 / x10 line multiplier. Contract: `docs/HANDBAG-WILD-2026-07-14.md`.
> - **S30, 2026-07-15, UniGlee marathon structure.** Reel-activated trigger, fixed five-act order, quarter allocations. Contract: `docs/UNIGLEE-MARATHON-AMENDMENT-2026-07-15.md`.
>
> **Both decisions stand exactly as ruled.** This is a label collision, not a conflict of substance: the two rulings govern different mechanics and neither amends the other. This log's standing rule is never to delete history, and external artifacts already cite these IDs, so **no ID has been changed and no row has been moved**.
>
> **Proposed canonical renumbering. NOT APPLIED. Awaiting Jamie's approval.**
>
> - The earlier-dated row, `S30, 2026-07-14, Handbag Wild`, keeps **S30**. It is the first ruling to use the number and it is the one its own contract document cites.
> - The later row, `S30, 2026-07-15, UniGlee marathon structure`, is re-labelled to the next free number rather than shifting S31 and S32. That keeps every other settled ID stable.
> - The re-labelled row would carry an inline `(was S30, relabelled 2026-08-09)` marker so the retired ID stays searchable, matching the existing `S8 (was D1)` convention already used in this table.
> - If Jamie prefers the opposite assignment, the same shape applies with the two rows swapped.
>
> **Which number to use is blocked on D6.** D6 asks whether S33 and S34 already exist as rulings that were made but never logged. If D6 is ruled "withdrawn", the UniGlee row becomes **S33**. If D6 is ruled "ruled", S33 and S34 are already spoken for and the UniGlee row becomes **S35**. Rule D6 first, then apply this renumbering to whatever number is genuinely free.

| # | Date | Decision | Rationale |
|---|---|---|---|
| S1 | 2026-07-09 | Title: **Glee-fully Chai Chasers** | Jamie's call; drops "Invaders from the Planet…" naming echo |
| S2 | 2026-07-09 | Vite + TypeScript + Tailwind SPA, GitHub Pages, localStorage only, PWA | Jamie's brief |
| S3 | 2026-07-10 | **Iced chai only.** No hot chai anywhere in the game | Canon — Glee hates hot chai |
| S4 | 2026-07-10 | No photos of Glee in repo or game; abstract "Chai Captain" presence only | Glee's stated preference + vision doc §6 |
| S5 | 2026-07-10 | `reference-photos/` purged from git history and gitignored | Glee photos were publicly pushed; remediation in `private-work/photo-triage.md` |
| S6 | 2026-07-10 | No copyrighted audio/clips; no brand names/logos (IP-GUARDRAILS.md) | Public repo, zero-risk posture |
| S7 | 2026-07-10 | Treat rules: **Phoebe helps for any treat; Joey only for Bougie Bites** | Canon from Jamie; spelling corrected 2026-07-13 |
| S8 (was D1) | 2026-07-10 | **Slot framing.** Real paylines, RNG, variance, free-spin ladder, a generous fictional economy, and honest meters | Jamie ruled: Claude vision superimposed on the Codex foundation. Preserve the play rhythm Glee enjoys inside an original game made for her |
| S9 (was D2) | 2026-07-10 | **Vanilla TypeScript** (no React) | Jamie ruled. One animation-heavy screen; pure-TS engine either way |
| S10 (was D3) | 2026-07-10 | **Hybrid cats:** illustrated saucer-cat wilds on reels; real-photo sticker-cutouts for pop-ins and scenes | Legibility at symbol size + photographic charm where the surprise lands |
| S11 (was D4) | 2026-07-10 | **Currency = Glee-coins** (slot semantics). **Chai Sparks = XP/progression**, repurposed from Codex proposal | Slot feel preserved; Codex's non-monetary progress idea survives as the meta-game |
| S12 (was D5) | 2026-07-10 | Cat-only photos may ship publicly as curated cutout assets (list in `private-work/photo-triage.md`); `reference-photos/` stays gitignored; each shipped derivative gets an ASSET-CHECKLIST row | Cats aren't people; Glee photos remain absolute-never (S4) |
| S13 | 2026-07-10 | `docs/DESIGN-SPEC.md` v2 is the **canonical spec**; COLLABORATIVE-VISION.md is the honored pre-alpha foundation (adoption/supersession table in spec §2) | Jamie's ruling; Replit joins the party building from DESIGN-SPEC only |
| S15 | 2026-07-10 | **Likeness policy refined (amends S4/S10):** a cartoon/avatar-style Glee IS permitted in the game — Jamie's call. What's banned is *photorealism*: no photos or photorealistic renderings of Glee, Joey, or Phoebe in the shipped product. Cats ship as original illustrations. Reference photos are inspiration for markings/personality/easter eggs only | Jamie 2026-07-10: "not the least bit afraid of an avatar/cartoon version of her... I just don't want the end product to have a photorealistic version" |
| S16 | 2026-07-10 | **Photo purge deferred (amends S5 timing):** Jamie's informed call — photos stay in git *history* during the build sprint (current public tree is already clean; his rename + gitignore untracked the folder). Full history purge (`private-work/photo-triage.md`) executes when the game ships. CI deploy gate passes on tree-cleanliness; oracle gate split into a non-blocking visible job so iterative deploys flow | Jamie 2026-07-10; release checklist still requires purge before "done" |
| S17 | 2026-07-10 | **Public narrative policy:** the game's public story, in every artifact (README, docs, posts, commit messages, in-game copy), is "a personalized birthday gift built around a genre Glee loves." No alternate motivations may be stated or implied. Raw working notes and pasted prompt dumps are never committed; existing instances removed from the tree, with history cleanup folded into the ship-time remediation task | Jamie's editorial direction 2026-07-10; enforcement line added to CANON.md |
| S18 | 2026-07-11 | **Production-art reset:** replace the generic gnome, duplicate cassette, mailbox, teapot, and yarn-ball presentation with Glee's Toolbox, cardigan, butterfly clip, aurora keepsake, and sacred Twelve charm. Joey and Phoebe physically frame the free-spin wheel and ship as distinct illustrated characters. Preserve engine IDs during the art pass so the validated math cannot drift | Jamie's quality ruling: the functional build did not yet have gift-worthy polish or enough personally meaningful objects |
| S14 | 2026-07-10 | **Replit owns the Round-2 implementation sprint** (math fix, free spins/wheel, presentation overhaul, cat moments) with a mandatory validation loop. **Claude owns the spec oracle** (`src/engine/simulation.test.ts` — may not be weakened) and reviews Replit's output. The retained validation log records the quantified slice-1 gaps and subsequent repair. | Jamie's direction 2026-07-10: quantified gaps (RTP 14% vs 96%, free spins 1/1235 vs 1/35, "built in 1987" presentation) require a forced test-and-iterate loop |
| S19 | 2026-07-12 | **Cross-tool consolidation baseline:** GitHub `main` commit `1b6d72d` is the integrated running-state baseline. Claude remains authoritative for the canonical spec, engine math, and simulation oracle. The S18 Codex/ChatGPT art and UI are authoritative for current presentation and interaction. Replit must pull this GitHub state before any bounded follow-up and may never sync an older checkpoint over it. GitHub is the only production source of truth | Jamie's direction: keep the superior current vision, consolidate each tool's strongest contribution, and prevent Claude/Replit/Codex from overwriting one another |
| S20 | 2026-07-12 | **The game is the Chai Chase, not the GPT Toolbox.** Remove Toolbox, Tools, Tool-ettes, branch/leaf organization metaphors, and related launch/audio language from current game-facing presentation. Joey and Phoebe help Glee pursue an intensely flavored iced chai through her music, books, PNW/Alaska keepsakes, and shared-life memories | Jamie clarified that the Toolbox vocabulary belongs only to the separate custom-GPT organization system |
| S21 | 2026-07-12 | **Twelve is a chai-specific historical wink, not sacred numerology.** It may appear when directly referencing the remembered intense chai order, but it must not drive unrelated charms, levels, pick counts, multipliers, decoration, or repeated copy | Jamie clarified that the meaning was Glee's preference for strong chai flavor, not the number itself |
| S22 | 2026-07-12 | **UniGlee becomes a mythic bonus marathon:** a rainbow-butterfly event occurring no more frequently than 1/300 and no more rarely than 1/1,000 base spins, awarding 100–500 free spins assembled through an entry cascade sequence and played across varied Joey/Phoebe/keepsake chapters. Exact distribution and RTP compensation remain Claude-owned engine work gated by simulation | Jamie's direction: restore UniGlee as a genuinely rare, story-worthy event with meaningful duration and variety |
| S23 | 2026-07-12 | **Character and bonus audio must be distinct.** Base play, free-spin chapters, UniGlee, Joey, Phoebe, treat types, and chapter transitions receive recognizable original motifs; no copyrighted samples or melodies | Jamie requested deeper soundtrack variety and character-specific sound identity |
| S24 | 2026-07-12 | **Doorbell Panic bonus (formerly Stranger Danger Panic).** An original house-doorbell blocker may appear on reels 1–2; a pair on the first two positions of any payline triggers a direct 5–20-spin bonus where Joey and Phoebe land as randomly placed wilds on payline coordinates each round. No real-product name, logo, or trade dress is used | Jamie's requested Joey/Phoebe stranger-at-the-door gag; mechanic is documented in `docs/DOORBELL-PANIC-2026-07-12.md` |
| S25 | 2026-07-13 | **Limited aggregate reach measurement is permitted.** The game may use one Google Analytics tag (`G-89W66VMGPB`) to understand how people discover and reach Glee-fully Chai Chasers. It must not add advertising, personalization, accounts, custom user identifiers, or game-state telemetry. | Jamie's direction: understand the gift's reach while retaining the project's no-purchase, no-ad, no-product-backend posture. Scope and review rules live in `docs/ANALYTICS-PRIVACY.md`. |
| S26 | 2026-07-13 | **We're Multiplying is an opening-spin, single-wild modifier.** Each counted free spin independently rolls no multiplier 15%, ×2 35%, ×3 30%, ×5 15%, or ×10 5%. A qualifying spin has exactly one marked wild, bound to reels 2/3/4/5 respectively; it applies only to paylines that use it. Cascades never create, replace, or stack multiplier wilds, and repeated ×10 spins are permitted across the same bonus. | Jamie's approved detail ruling; implementation contract: `docs/WE-RE-MULTIPLYING-2026-07-13.md`. |
| S27 | 2026-07-14 | **Human-scale economy and official AskJamie avatar.** A fresh game starts at 500 Glee-coins with a default 1-coin wager; wager levels are 1 / 2 / 5 / 10 / 25 / 50 and the automatic refill is +500. The board perch uses Jamie's provided official illustrated AskJamie avatar instead of the inline robot. | Jamie's explicit UI ruling: keep the numbers beautiful and understandable for a normal human player, and use the official AskJamie icon. |
| S28 | 2026-07-14 | **The 5×4 board uses 40 fixed paylines.** The resting board may optionally show a faint payline guide from Settings; winning lines always receive a brief light-gold highlight after each winning cascade step. | Jamie's ruling: 20 visible symbols are better represented by the modern 40-line format; transient winning paths preserve clarity on iPhone. |
| S29 | 2026-07-14 | **Treat Time is a direct primary-board bonus for the current release.** Morning triggers at 1/100 for 7–14 spins with Phoebe/Chicken Comets; Nighttime triggers at 1/300 for 14–50 spins with the existing Chicken/Salmon/Bougie mapping. Each round casts 2–10 unique treat wilds, ordinary cascade retriggers remain active, and any other free-spin session earned on the same base spin is shown afterward rather than discarded. | Close-out ruling authorized by Jamie's 2026-07-14 request to finish the bounded Treat Time work quickly; player-facing contract: `docs/TREAT-TIME-CONTRACT-2026-07-14.md`. |
| S30 | 2026-07-15 | **UniGlee marathon structure amended for release.** A reel-3/4/5 active-line trigger awards 300/400/500 initial free spins. Joey's Laundry Helper is always first; We're Multiplying, Keepsake Collection, and Nighttime Treat Time occupy acts 2–4 in seeded random order at 25% of the initial award each; Phoebe's Lap Quest is always last and adds its own spins/coins. Retriggers earned in acts 1–4 remain local to that act. | Jamie's release ruling; structural contract: `docs/UNIGLEE-MARATHON-AMENDMENT-2026-07-15.md`. |
| S30 | 2026-07-14 | **Handbag Wild is a rare, non-cat, high-value wild.** It appears from a single late-reel candidate, lands 85% of the time, and carries a randomized ×3/×5/×10 line multiplier. It is available on primary and bonus boards through the shared reel-strip/refill path. | Jamie's request to close the current RTP gap with a generic handbag symbol while keeping the game unbranded; math and provenance contract: `docs/HANDBAG-WILD-2026-07-14.md`. |
| S31 | 2026-07-15 | **Iced Chai Wild Rain is a one-shot Wild Chai Storm.** At the start of the wheel-awarded bonus session, every standard iced-chai symbol on the opening board converts into a mermaid-cup `wild_chai`. The storm does not repeat on cascades or retriggered spins. Presentation uses an orange-gold pumpkin-fall glow, chai-like drops, and glitter sparkles without pumpkins or fall leaves. | Jamie's explicit ruling 2026-07-15; implementation contract: `docs/ICED-CHAI-WILD-RAIN-2026-07-14.md`. |
| S32 | 2026-07-15 | **Moonlit Keepsake Trail is a dedicated memory bonus in the existing reel staging area.** It deals 12 cards as six randomly arranged pairs from the standard symbol pool, allows two mismatches, and awards exactly 40 standard free spins only after all six pairs are found. Twelve is an explicit exception for this one memory bonus and must not spread to levels, caps, multipliers, charms, or general game copy. | Jamie's revised keepsake-trail ruling; implementation contract: `docs/MOONLIT-KEEPSAKE-TRAIL-2026-07-14.md`. |

## Workstream owners

| Workstream | Owner | Notes |
|---|---|---|
| Product decisions, decision log, Notion mirror | Jamie | |
| Engine (math, tests, RTP sim) | Claude | Pure TS, vitest; frequency table in spec §4 is the test oracle |
| UI implementation | S18/S19 baseline; Claude or Codex for bounded integration | Replit may take one bounded post-pull task only; no broad regeneration or rollback |
| Art direction, raster art | ChatGPT image workflow, brief in ASSET-CHECKLIST.md | Illustrated symbols + style anchor |
| Cat cutouts (photo processing) | Claude (sandbox) | From curated list only (S12) |
| Copy: quips, scenes, birthday reveal | Claude, canon-checked | `BIRTHDAY_MESSAGE` constant is Jamie's own words — nobody writes that but him |
| QA, device testing | Jamie | iPhone portrait first |
