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
7. `docs/IP-GUARDRAILS.md` — non-negotiable public-repo safety rules.
8. `docs/RESEARCH-BRIEF.md` — mechanics research only; do not copy its named products into game-facing work.
9. `docs/ASSET-CHECKLIST.md` — provenance and release inventory.
10. `docs/ANALYTICS-PRIVACY.md` — the only permitted measurement policy.

Historical handoffs, assessments, pasted prompts, and `attached_assets/` are context only. In particular, do not build from `docs/DESIGN-HANDOFF.md`, `docs/REPLIT-HANDOFF.md`, or `docs/REPLIT-IMPLEMENTATION-BRIEF.md` when they conflict with the canonical documents above.

## Current implementation (verified 2026-07-13)

This is one Git repository and one Vite SPA; no nested project was found in scope. `HEAD` is a descendant of the protected integration baseline commit recorded in `docs/IMPLEMENTATION-BASELINE.md`.

Implemented and integrated in the current tree:

- splash/audio-unlock flow and the main five-reel × four-row, 40-payline cascade board;
- pure-TypeScript reel, payline, cascade, specialty-wild, economy, cat-visit, Treat Jar, Doorbell Panic, Treat Time, Bold Chai, free-spin, wheel, and Keepsake Constellation logic;
- illustrated Joey/Phoebe presentation, cat pop-ins, Firefly Cascade meter, real post-spin resting grids, and cascade beam/drop motion;
- UniGlee rare-event takeover presentation (the approved 100–500-spin marathon is not implemented yet);
- original Web Audio SFX plus a 60-second synthesized base score; music chapter stems remain future work;
- versioned browser-local persistence for balance, bet, XP, Treat Jar, meter, progress, settings, and reset; and
- GitHub Pages deployment configuration, PWA manifest/icons, and the current public art under `public/assets/` and `public/icons/`.

Still planned or partial, and not evidence of being shipped merely because the spec describes them: Birthday Reveal, Chai Tea Bonus pick shelf, daily bonus, milestone scenes/collection shelf, full 100–500-spin UniGlee marathon with persistence/fast mode/summary, additional chapter-specific bonus presentation, service-worker/offline verification, final audio mix/stems, production AskJamie integration, asset optimization, and device-regression gallery.

The approved realignment also leaves a math migration gap: legacy uses of twelve remain in some engine constants (including level/treat-cap behavior). Do not expand those uses or silently retune them; any migration belongs to the engine owner and must be simulation-backed.

## Repository map and architecture

```text
docs/               canonical product, canon, IP, privacy, handoff, and decision documents
src/engine/         pure TypeScript game math; zero DOM imports; Vitest coverage
src/ui/             DOM rendering, controls, overlays, animation, and screens
src/audio/          original Web Audio synthesis, base music loop, and SFX
src/state.ts        versioned localStorage persistence and reset
src/main.ts         splash entry point and board bootstrap; #board is dev-only QA bypass
public/assets/      shipped raster art
public/icons/       favicon, touch, PWA, and maskable icons
index.html          metadata, manifest, and constrained reach-measurement tag
.github/workflows/  CI and GitHub Pages deployment
.github/skills/     local HEIC conversion utility; private material stays private
private-work/       local-only working material; never ship or commit
reference-photos/   local-only visual references; never ship or commit
```

The engine/UI boundary is mandatory: engine code stays browser-DOM-free and testable; UI consumes typed engine results and owns presentation timing, not game math. Audio remains independently muteable. The app is vanilla TypeScript (not React), Vite, Tailwind CSS v4 through `@tailwindcss/vite`, and browser Web Audio/localStorage.

## Development and validation

```bash
npm ci
npm run dev       # Vite dev server, port 5000
npm test          # Vitest; 14 files / 79 tests, with the RTP release gate currently failing (see below)
npm run build     # tsc --noEmit, then Vite production build; currently passes
npm run preview   # preview the production build on port 5000
```

CI uses Node 22, `npm ci`, tests, and the production build. The Pages workflow also checks that private folders are absent and rejects configured brand strings from `dist/`; its spec-oracle job is visible but non-blocking while the approved UniGlee math work remains incomplete.

Known validation issue at this checkpoint: the seeded 200,000-spin RTP oracle in `src/engine/simulation.test.ts` currently measures **93.54%**, below the approved **96% ±0.5** target, so `npm test` has one failing test (78 passing / 79 total). This appeared after the 40-payline integration; its correction belongs to the engine owner and must be simulation-backed. Do not weaken the oracle or its threshold. `npm run build` now passes; the former `treat_boogie` test-fixture type mismatch was resolved in commit `6189af0`.

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

Update this file when verified architecture, commands, deployment behavior, protected baselines, privacy rules, or shipped-vs-planned status changes. Keep detailed mechanics and product decisions in their canonical documents instead of duplicating them here. Re-read every changed guidance file and run the practical checks that the change affects.
