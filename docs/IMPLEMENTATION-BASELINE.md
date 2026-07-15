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
- `public/assets/glee-symbol-atlas.png`
- `public/assets/joey-phoebe-wheel.png`
- `public/assets/joey-phoebe-wilds.png`
- `docs/DECISION-LOG.md` decisions S17-S23
- the public-story language in `README.md`, `docs/STORY.md`, and `docs/CANON.md`

"Protected" does not mean frozen. It means future work must be a bounded improvement applied on top of this state, not a wholesale replacement from an older Claude or Replit checkpoint.

## 4. Running-state matrix

### Implemented and integrated

- 5×4, 40-line cascade engine and simulation-validated fictional Glee-coin economy
- event-frequency simulation oracle
- free-spin ladder, modifier selection, and free-spin session flow
- We're Multiplying opening-spin math: one reel-bound wild at most, line-specific awards, and no multiplier creation during cascades
- one-shot Wild Chai Storm: opening-board iced-chai symbols convert to mermaid-cup wild chai once per session
- persistent balance, XP, settings, Treat Jar, and cat-visit state
- original Web Audio one-shot SFX
- Treat Time direct primary-board bonus with Morning/Nighttime modes and typed wild-cast payload
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
- a replacement for the legacy 2×2 Toolbox modifier, expressed as an approved keepsake/chapter effect
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
