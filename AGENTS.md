# AGENTS.md — Glee-fully Chai Chasers

Canonical working guide for AI and human collaborators in this repository. `CLAUDE.md` points here. Product and mechanics authority remains in the documents listed below; this file is the concise operational map.

## Project identity

Glee-fully Chai Chasers is a free, original, mobile-first browser game made as Jamie's personalized birthday gift for Glee, built around the cascading-reels game style she loves. Joey and Phoebe help Glee chase an intensely flavored iced chai through a retro-bright midnight PNW setting. The game uses fictional Glee-coins only: no purchases, wagering, cash-out, ads, accounts, or product backend. Limited aggregate Google Analytics reach measurement is allowed only under `docs/ANALYTICS-PRIVACY.md` (Decision S25).

Confirmed public motivation: it is a personalized birthday gift built around a genre Glee loves. Do not invent a different backstory or imply affiliation with any casino, game studio, beverage brand, pet-food brand, television show, or music artist.

## Read before product or implementation work

Read these in order when the task touches product behavior, UI, content, or architecture:

1. `docs/DESIGN-SPEC.md` — canonical game specification, v2.
2. `docs/IMPLEMENTATION-BASELINE.md` — current integration authority and protected presentation baseline.
3. `docs/GAME-REALIGNMENT-2026-07-12.md` — approved Chai Chase amendment and UniGlee marathon direction.
4. `docs/DECISION-LOG.md` — settled decisions, ownership, and open decisions.
5. `docs/COLLABORATIVE-VISION.md` — honored pre-alpha foundation, superseded where the spec says so.
6. `docs/CANON.md` — Glee, Joey, Phoebe, iced-chai, treat, and narrative canon.
7. `docs/IP-GUARDRAILS.md` — non-negotiable public-repo safety rules (includes explicit WMS / SciPlay / Moolah brand prohibitions).
8. `docs/ASSET-CHECKLIST.md` — provenance and release inventory.
9. `docs/ANALYTICS-PRIVACY.md` — the only permitted measurement policy.

Historical handoffs, assessments, pasted prompts, and `attached_assets/` are context only. In particular, do not build from `docs/DESIGN-HANDOFF.md`, `docs/REPLIT-HANDOFF.md`, or `docs/REPLIT-IMPLEMENTATION-BRIEF.md` when they conflict with the canonical documents above.

## Current implementation (verified 2026-08-09)

This is one Git repository and one Vite SPA; no nested project was found in scope. `HEAD` is a descendant of the protected integration baseline commit recorded in `docs/IMPLEMENTATION-BASELINE.md`.

Implemented and integrated in the current tree:

- splash/audio-unlock flow and the main five-reel × four-row, 40-payline cascade board;
- the splash birthday window (`src/splash.ts`): during July 17 to 31 of any year the splash shows Jamie's birthday message and grants 10,000 Glee-coins, once per device per calendar year. The `BIRTHDAY_MESSAGE` constant is Jamie's own words and nobody edits it;
- pure-TypeScript reel, payline, cascade, specialty-wild, economy, cat-visit, Treat Jar, Doorbell Panic, Treat Time, Bold Chai, free-spin, wheel, Moonlit Keepsake Trail memory-bonus, and one-shot Wild Chai Storm logic;
- the Chai Sparks XP and wager-ladder economy (`src/engine/economy.ts`): wager levels 1 / 2 / 5 / 10 / 25 / 50 with the sixth gated behind player level 12, 500-coin start, 500-coin bust-proof refill, and XP-driven player levels;
- Joey's Laundry Helper (`src/engine/laundry.ts`) and Phoebe's Lap Quest (`src/engine/lap-quest.ts`, `src/engine/lap-quest-session.ts`, `src/ui/lap-quest-ledge.ts`), both shipped as playable UniGlee acts;
- illustrated Joey/Phoebe presentation, cat pop-ins, Firefly Cascade meter, real post-spin resting grids, and cascade beam/drop motion;
- Moonlit Keepsake Trail 12-card memory staging, mismatch strike indicators, dedicated card-turn presentation, and original bonus audio/assets;
- UniGlee reel-activated takeover plus the playable five-act marathon, typed chapter accounting, and separate long-form synthesized marathon score. The shipped initial award is **40 / 60 / 80** spins (`src/engine/uniglee.ts` line 94, typed in `src/engine/laundry.ts` line 21), which contradicts S30's 300/400/500. That conflict is open as **D7** in `docs/DECISION-LOG.md`; do not "fix" either side until Jamie rules;
- the in-game paytable page (`openPaytablePage` in `src/ui/board.ts`): symbol guide, 40-fixed-line explanation, and line-bet multiples;
- Ice Notes (`src/ui/ice-notes.ts`): the rotating in-game note deck;
- theme control and separate music and SFX volume levels, persisted in `src/state.ts`;
- original Web Audio SFX plus a 60-second synthesized base score; music chapter stems remain future work;
- versioned browser-local persistence for balance, bet, XP, Treat Jar, meter, progress, settings, and reset; and
- GitHub Pages deployment configuration, PWA manifest/icons, and the current public art under `public/assets/` and `public/icons/`.

Still planned or partial, and not evidence of being shipped merely because the spec describes them: the Birthday Reveal **scene**, Chai Tea Bonus pick shelf, daily bonus, milestone scenes/collection shelf, in-flight UniGlee reload persistence and fast/skip controls, additional chapter-specific bonus presentation, service-worker/offline verification, final audio mix/stems, production AskJamie integration, asset optimization, and device-regression gallery.

Note the Birthday Reveal distinction, because it has been mis-stated before. The birthday **message** and the **10,000-coin grant** are shipped, on the splash, gated to the July 17 to 31 window and claimable once per device per year. Only the Reveal **scene**, the animated moment described in the spec, is unshipped. Do not describe the birthday feature as unshipped in any public artifact.

The approved realignment also leaves a math migration gap: legacy uses of twelve remain in some engine constants (including level/treat-cap behavior). Do not expand those uses or silently retune them; any migration belongs to the engine owner and must be simulation-backed.

## Repository map and architecture

```text
docs/               canonical product, canon, IP, privacy, handoff, and decision documents
docs/adr/           architecture decision records
content/            public-facing copy, page PRDs, and dated accuracy audits; owned by the content agent
skills/             promoted, repo-local Agent Skills (currently okhp3-skill-promotion)
scripts/            build and validation tooling
scripts/sim-agent.ts  full-game RTP harness; plays every bonus through the engine entry points board.ts uses
src/engine/         pure TypeScript game math; zero DOM imports; Vitest coverage
src/ui/             DOM rendering, controls, overlays, animation, and screens
src/audio/          original Web Audio synthesis, base music loop, and SFX
src/splash.ts       splash screen, audio-unlock gate, and the July birthday window
src/state.ts        versioned localStorage persistence, theme, volumes, and reset
src/main.ts         splash entry point and board bootstrap; #board is dev-only QA bypass
public/assets/      shipped raster art
asset-source/       atlas-only source masters used by the reproducible asset generator
public/icons/       favicon, touch, PWA, and maskable icons
index.html          metadata, manifest, and constrained reach-measurement tag
.github/workflows/  CI and GitHub Pages deployment
.github/skills/     local HEIC conversion utility; private material stays private
lib/                Replit workspace scaffolding; the game never imports it (see below)
artifacts/          Replit workspace scaffolding; the game never imports it (see below)
private-work/       local-only working material; never ship or commit
reference-photos/   local-only visual references; never ship or commit
```

**`lib/` and `artifacts/` are not part of the game.** They are Replit workspace scaffolding carried in the pnpm workspace: `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, `lib/db`, and `artifacts/api-server`, `artifacts/chai-chasers`, `artifacts/chai-chasers-video`, `artifacts/mockup-sandbox`. Nothing under `src/`, `index.html`, or `vite.config.ts` imports any of them, and nothing from them reaches `dist/`. Verify with `grep -rn "from \"lib/\|artifacts/" src/ index.html vite.config.ts`, which returns nothing. Do not treat them as implementation guidance, do not build against their APIs, and do not assume the game has a backend because `lib/db` exists. It does not: the game is client-only with localStorage. Whether they stay in the repo at all is an open cleanup item.

The engine/UI boundary is mandatory: engine code stays browser-DOM-free and testable; UI consumes typed engine results and owns presentation timing, not game math. Audio remains independently muteable. The app is vanilla TypeScript (not React), Vite, Tailwind CSS v4 through `@tailwindcss/vite`, and browser Web Audio/localStorage.

## Development and validation

```bash
npm ci
npm run dev       # Vite dev server, port 5000
npm test          # Vitest; full suite, 170 tests across 24 files, including the RTP release oracle
npm run build     # tsc --noEmit, then Vite production build; currently passes
npm run preview   # preview the production build on port 5000
```

CI uses Node 22, `npm ci`, tests, and the production build. The Pages workflow also checks that private folders are absent and rejects configured brand strings from `dist/`; its spec-oracle job is visible but non-blocking while the approved UniGlee math work remains incomplete.

### Validation status (re-measured 2026-08-09 on commit `234ea74`)

Every figure below was produced by running the stated command on this tree, not quoted from another document. Re-run before citing.

| Check | Result | Command |
|---|---|---|
| Full test suite | 170 tests, 24 files, all passing | `npx vitest run src` |
| Type check and production build | Clean | `npm run build` |
| Oracle: base RTP | 61.08% | `npx vitest run src/engine/simulation.test.ts --reporter=verbose` |
| Oracle: any-win rate | 1 in 3.15 | same |
| Oracle: free-spin trigger | 1 in 151 | same |
| Oracle: 8+ cascade mega | 1 in 980 | same |
| Oracle: UniGlee capture | 1 in 1,370 | same |
| Oracle: cat pop-in | 1 in 32.3 | same |

The seeded 200,000-spin oracle in `src/engine/simulation.test.ts` is **green** on all six gates. Note that it measures the **base game only**, at a base RTP near 61%. It does not measure bonus-session RTP, so it cannot by itself confirm the full-game band.

Full-game RTP comes from a second harness, `scripts/sim-agent.ts`, which plays every bonus through the same engine entry points `src/ui/board.ts` uses. Converged figure measured 2026-08-09 across **2,000,000 paid spins**, seeds 1 through 40 at 50,000 spins each:

```bash
for s in $(seq 1 40); do npx tsx scripts/sim-agent.ts a$s $s 50000; done
```

| Measure | Value |
|---|---|
| Full-game RTP | **98.70%** |
| 95% confidence interval | 97.93% to 99.47% |
| Per-seed standard deviation | 2.49 |
| Per-seed span | 94.16% to 106.78% |
| Seeds inside the documented 95% to 98% band | **10 of 40** |
| Base layer contribution | 61.05% |
| Bonus layer contribution | 37.65% |
| Capped bonus sessions (runaway check) | 0 |

Per-bonus RTP contribution over the same fleet: firefly free spins 10.64% (We're Multiplying 5.21%, Moonlit Keepsake Trail 4.28%, Iced Chai Wild Rain 1.15%), UniGlee 7.47% at 1 in 1,229, doorbell panic 4.98%, morning treat time 4.44%, treat jar 4.32%, nighttime treat time 3.87%, bold chai 1.93%.

**Two things about this number matter more than the number itself.**

**It is above the documented band.** `docs/DESIGN-SPEC.md` §4 records 95% to 98%. The converged measurement is 98.70%, and the whole confidence interval sits above 98%. Only 10 of 40 seeds land in band. This is a documentation-accuracy problem, not a player-facing defect: the game uses fictional Glee-coins only, with no purchase, wager, or cash-out. It is open as **D8** in `docs/DECISION-LOG.md`. Do not retune the engine to chase the band without Jamie's ruling.

**It assumes a perfect player.** `scripts/sim-agent.ts` models the two interactive bonuses at their ceiling: Bold Chai Pump receives a steady six pumps per second for the entire 30-second window (`scripts/sim-agent.ts` lines 72 to 79), and the Moonlit Keepsake Trail is played by a perfect-memory player who always completes all six pairs and always collects the 40-spin handoff (line 183). **98.70% is therefore a generous-play ceiling. Real play sits below it**, by an amount nobody has measured, because no realistic-play variant of the harness exists yet. Any full-game RTP claim that omits this player model is incomplete.

For the record, this figure replaced two earlier small-sample readings that were both noise: 95.66% over seven unrecorded seeds, and 97.56% over seven recorded seeds. Neither was wrong so much as under-powered. Seven seeds at a per-seed sd of 2.49 cannot resolve a band 3 points wide.

The Moonlit Keepsake Trail feature is covered by the full suite; its human-success-dependent 40-spin handoff remains documented as a combined-RTP consideration. The oracle remains unweakened; do not modify its thresholds, widen its bands, or skip a gate. Any future engine change ships only with all six gates green plus a fresh sim-agent fleet reading.

## Safe collaboration rules

- Check `git status`, current commit, and the baseline before editing. Preserve user changes and never use destructive version-control commands.
- Keep work bounded to one deliverable with one owner. Check `docs/DECISION-LOG.md` assignments first.
- Work on a branch/checkpoint from GitHub `main`; human-review the diff. Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`) and small commits.
- Never copy an older Claude, Replit, or generated tree over the protected current UI/art baseline. In particular, do not broadly regenerate `src/ui/board.ts`, `src/ui/symbols.ts`, `src/style.css`, or the production art.
- Do not silently replace settled docs. Add a dated section or companion proposal when a decision is genuinely open; Jamie rules.
- For source changes, add or update tests and run the full suite plus production build. Check a 390×844/iPhone-sized viewport, reduced motion, mute behavior, accessibility labels, and browser console when the change affects UI.

## Privacy, canon, and IP hard rails

- Iced chai only; no hot chai, steam, kettle, or mug imagery. Twelve is at most a chai-specific historical wink, not general mythology.
- Never commit, copy, or derive public assets from `reference-photos/` or `private-work/` without Jamie's explicit per-file approval. Photos or photorealistic renderings of Glee never ship. Cat assets must follow the approved provenance rows.
- No copyrighted audio/video, recognizable melodies, brand names/logos/trade dress, or source-derived art. Homage is limited to broad mechanics, silhouette, palette, and vibe; consult `docs/IP-GUARDRAILS.md`.
- Use fictional Glee-coins and honest meters. Never add purchase language, odds claims, advertising, personalization, accounts, custom identifiers, game-state telemetry, or analytics beyond `docs/ANALYTICS-PRIVACY.md`.

## Keeping this guide current

**Never quote a metric from another document in this repository. Re-run it and cite the command.**

That is the whole lesson of the 2026-08 accuracy cleanup. RTP figures, event frequencies, test counts, and spin counts were copied from document to document until five artifacts agreed with each other and none of them agreed with the code. A number that came from another Markdown file is not evidence, no matter how many files repeat it. If you are about to write a percentage, a frequency, or a test count into any file in this repository, run the command that produces it, quote today's output, and record the command and the date next to the number. If a figure depends on random seeds, record the seeds too. If you cannot re-run it, say so and mark the figure as unverified rather than restating it as fact.

**Any RTP or event-frequency figure must ship with the command and the seed range that produced it, and any full-game RTP claim must additionally state its player model.**

This episode is the worked example, so here it is in full. The full-game RTP was reported as 96.1% with no source, then 95.66% over seven seeds nobody wrote down, then 97.56% over seven recorded seeds. All three were quoted as settled fact. The converged value over 2,000,000 spins on seeds 1 to 40 is 98.70%, which is **outside the band every one of those figures was used to confirm**, and it holds only under a perfect-play model for the two interactive bonuses. Three rounds of confident restatement, and the first genuinely powered measurement moved the answer out of band. A seven-seed sample against a per-seed sd of 2.49 was never capable of resolving a 3-point band, but nothing in the documents said so, because none of them recorded sample size, seeds, or player model. Record all three, every time.

When syncing files between the cloud container and the Mac clone, record the transfer path and verify by checksum on both sides: if `SendUserFile` is unavailable, the documented fallback is a gzipped `git diff` sent as base64 through `device_bash` and applied with `git apply`.

The same applies in reverse: when the code and a document disagree, the code is what players experience, but the document may record a real ruling. Do not silently change either one. Note the delta with the source line, and raise it as an open decision for Jamie.

Update this file when verified architecture, commands, deployment behavior, protected baselines, privacy rules, or shipped-vs-planned status changes. Keep detailed mechanics and product decisions in their canonical documents instead of duplicating them here. Re-read every changed guidance file and run the practical checks that the change affects.
