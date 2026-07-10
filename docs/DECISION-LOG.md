# Decision Log — Glee-fully Chai Chasers

Single source of truth for product decisions. One owner per deliverable. Jamie rules; tools build only on settled decisions. Add new decisions as dated rows — never delete history.

## Open decisions

*(none — D1-D5 ruled by Jamie 2026-07-10; raise new ones as D6+)*

## Settled decisions

| # | Date | Decision | Rationale |
|---|---|---|---|
| S1 | 2026-07-09 | Title: **Glee-fully Chai Chasers** | Jamie's call; drops "Invaders from the Planet…" naming echo |
| S2 | 2026-07-09 | Vite + TypeScript + Tailwind SPA, GitHub Pages, localStorage only, PWA | Jamie's brief |
| S3 | 2026-07-10 | **Iced chai only.** No hot chai anywhere in the game | Canon — Glee hates hot chai |
| S4 | 2026-07-10 | No photos of Glee in repo or game; abstract "Chai Captain" presence only | Glee's stated preference + vision doc §6 |
| S5 | 2026-07-10 | `reference-photos/` purged from git history and gitignored | Glee photos were publicly pushed; remediation in `private-work/photo-triage.md` |
| S6 | 2026-07-10 | No copyrighted audio/clips; no brand names/logos (IP-GUARDRAILS.md) | Public repo, zero-risk posture |
| S7 | 2026-07-10 | Treat rules: **Phoebe helps for any treat; Joey only for Boogie Bites** | Canon from Jamie |
| S8 (was D1) | 2026-07-10 | **Slot framing.** Real paylines, RNG, variance, free-spin ladder — with bust-proof economy and honest meters | Jamie ruled: Claude vision superimposed on Codex foundation. It's her game, minus the money |
| S9 (was D2) | 2026-07-10 | **Vanilla TypeScript** (no React) | Jamie ruled. One animation-heavy screen; pure-TS engine either way |
| S10 (was D3) | 2026-07-10 | **Hybrid cats:** illustrated saucer-cat wilds on reels; real-photo sticker-cutouts for pop-ins and scenes | Legibility at symbol size + photographic charm where the surprise lands |
| S11 (was D4) | 2026-07-10 | **Currency = Glee-coins** (slot semantics). **Chai Sparks = XP/progression**, repurposed from Codex proposal | Slot feel preserved; Codex's non-monetary progress idea survives as the meta-game |
| S12 (was D5) | 2026-07-10 | Cat-only photos may ship publicly as curated cutout assets (list in `private-work/photo-triage.md`); `reference-photos/` stays gitignored; each shipped derivative gets an ASSET-CHECKLIST row | Cats aren't people; Glee photos remain absolute-never (S4) |
| S13 | 2026-07-10 | `docs/DESIGN-SPEC.md` v2 is the **canonical spec**; COLLABORATIVE-VISION.md is the honored pre-alpha foundation (adoption/supersession table in spec §2) | Jamie's ruling; Replit joins the party building from DESIGN-SPEC only |
| S15 | 2026-07-10 | **Likeness policy refined (amends S4/S10):** a cartoon/avatar-style Glee IS permitted in the game — Jamie's call. What's banned is *photorealism*: no photos or photorealistic renderings of Glee, Joey, or Phoebe in the shipped product. Cats ship as original illustrations. Reference photos are inspiration for markings/personality/easter eggs only | Jamie 2026-07-10: "not the least bit afraid of an avatar/cartoon version of her... I just don't want the end product to have a photorealistic version" |
| S16 | 2026-07-10 | **Photo purge deferred (amends S5 timing):** Jamie's informed call — photos stay in git *history* during the build sprint (current public tree is already clean; his rename + gitignore untracked the folder). Full history purge (`private-work/photo-triage.md`) executes when the game ships. CI deploy gate passes on tree-cleanliness; oracle gate split into a non-blocking visible job so iterative deploys flow | Jamie 2026-07-10; release checklist still requires purge before "done" |
| S14 | 2026-07-10 | **Replit owns the Round-2 implementation sprint** (math fix, free spins/wheel, presentation overhaul, cat moments) under `docs/prompts/REPLIT-ROUND-2-PROMPT.md` with a mandatory validation loop. **Claude owns the spec oracle** (`src/engine/simulation.test.ts` — may not be weakened) and reviews Replit's output. Slice-1 assessment: `docs/ASSESSMENT-REPLIT-SLICE-1.md` | Jamie's direction 2026-07-10: quantified gaps (RTP 14% vs 96%, free spins 1/1235 vs 1/35, "built in 1987" presentation) require a forced test-and-iterate loop |

## Workstream owners

| Workstream | Owner | Notes |
|---|---|---|
| Product decisions, decision log, Notion mirror | Jamie | |
| Engine (math, tests, RTP sim) | Claude | Pure TS, vitest; frequency table in spec §4 is the test oracle |
| UI implementation | Claude (vanilla TS per S9) | Replit may take bounded UI polish tasks AFTER core ships — coordinate here first |
| Art direction, raster art | ChatGPT image workflow, brief in ASSET-CHECKLIST.md | Illustrated symbols + style anchor |
| Cat cutouts (photo processing) | Claude (sandbox) | From curated list only (S12) |
| Copy: quips, scenes, birthday reveal | Claude, canon-checked | `BIRTHDAY_MESSAGE` constant is Jamie's own words — nobody writes that but him |
| QA, device testing | Jamie | iPhone portrait first |
