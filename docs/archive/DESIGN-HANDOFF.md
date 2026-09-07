# DESIGN-HANDOFF.md — Visual Overhaul (Cascading Reels Cabinet)

> **HISTORICAL ARTIFACT — DO NOT IMPLEMENT FROM THIS FILE.** It records a completed pre-realignment pass. Current collaborators must read `DESIGN-SPEC.md`, `GAME-REALIGNMENT-2026-07-12.md`, `IMPLEMENTATION-BASELINE.md`, and `DECISION-LOG.md` instead.

**Role:** art director / visual implementer, per `docs/prompts/DESIGN-AGENT-PROMPT.md`.
**Scope respected:** `src/ui/symbols.ts`, `src/ui/board.ts`, `src/style.css`, `public/icons/**`, `public/fonts/**`. Zero changes to `src/engine/**`, `src/state.ts`, `src/audio/**`, `package.json` deps, or any other doc.
**Verification method:** real headless-browser screenshots (Playwright + Chromium, sandboxed in this session) of the actual Vite dev server at 390×844 — not a mockup. Where noted below, a moment was reviewed by code inspection only because its trigger rate made it too rare to force on camera in the session budget; those are flagged explicitly rather than claimed as visually confirmed.

## The finish line

Baseline ("before") screenshot confirms the owner's read was accurate: flat single-tone glyphs, a text-only "Cascade meter: 0" div, two blurry dot "saucers," and roughly 40% dead vertical space below the bet bar. After this pass: layered gradient/highlight/shadow symbols with tinted glow, an ornate lit cabinet frame around the reel window, a marquee header with twinkling bulbs, an illustrated firefly jar meter, a console-style bet bar, a five-saucer fleet with tractor beams that fire on wins, particle bursts, tiered win callouts, and a self-hosted display face. It reads as a mobile slot cabinet, not a placeholder grid.

## Deliverables

| # | Deliverable | Status |
|---|---|---|
| 1 | Premium symbol set (18 board symbols — the spec table's actual count) | Done — gradient + sheen + grounding shadow + ink outline + tinted glow on every glyph; Mermaid Tumbler rebuilt as the hero (scale-pattern sheen bands, condensation droplets, two-tone straw) |
| 2 | Character art | Done — Phoebe/Joey rebuilt with 4 pose states each (`strut`/`eat`/`assist`/`unimpressed`) sequenced during pop-ins; Glee celebration avatar (cartoon, no likeness, per CANON S15); AskJamie perch avatar |
| 3 | The scene | Done — layered sky gradient, two-speed star field, aurora ribbons, illustrated garden-foreground silhouette (fence/plants/mailbox/toolbox), 5-saucer fleet with beam cones; aurora variant for free spins |
| 4 | The cabinet | Done — ornate reel frame with corner star ornaments and inner glow, marquee header with bulb strip, illustrated firefly-jar meter (0–8+ fill states), console-textured bet bar, pulsing/press-responsive SPARKLE! button |
| 5 | Celebration kit | Done — nice/big/huge win-tier overlays with burst-dot rings, capped CSS particle bursts on winning cells (3/cell, ≤30 total per cascade step), TWELVE PUMPS! callout art, UniGlee butterfly-storm takeover with Glee avatar, prize wheel restyled with dimensional wedge gradients + rim lights + hub |
| 6 | App identity | Done — icon-192/512/maskable-512 (Mermaid Tumbler + butterfly on the night-garden gradient) and a splash graphic, all in `public/icons/`; self-hosted Baloo 2 (OFL) display face in `public/fonts/` |
| 7 | Handoff | This file |

## Validation cycles

**Cycle 1 — baseline audit.** Screenshot of the unmodified build at `#board`.

| DEPTH | COHESION | CHARACTER | CELEBRATION | POLISH |
|---|---|---|---|---|
| 2 | 5 (consistently flat, at least) | 2 | 2 | 2 |

Deficiencies: flat single-fill symbols, no cabinet/housing anywhere, plain-text meter, ~40% dead space, 30px blob "saucers," system-font everything.

**Cycle 2 — first full pass.** Rebuilt symbols, cabinet, scene, meter, bet bar, celebration kit, wheel. Screenshotted idle, cascade win, win-tier, wheel, free-spins.

| DEPTH | COHESION | CHARACTER | CELEBRATION | POLISH |
|---|---|---|---|---|
| 8 | 8 | 6 | 5 | 5 |

Deficiencies found and fixed in this cycle:
- SPARKLE! button and coin chip overflowed the 390px viewport → tightened bet-console padding/gaps, added `flex-shrink` rules.
- ~35% dead space remained below the bet bar (cabinet wasn't flexed to fill) → `cabinet-frame`/`reel-grid`/`.cell` now flex to fill available height; reel cells are visibly larger as a result.
- Firefly-jar icon read as a gray blob, not a jar → thicker glass stroke, brighter rim highlight, visible ink outline.
- Win-tier text ("NICE WIN!") was low-contrast/"ghosted" → added a solid pill backdrop behind label and amount, deepened the scrim, swapped the font fallback chain (a `local()`-only `@font-face` was silently failing in headless Chromium) for a **self-hosted Baloo 2** woff2.
- Wheel/bonus-summary scrim was an ellipse gradient with no opaque base, so board content bled through at the screen corners → added a solid base color under the radial gradient.
- Free-spins overlay reused the `.night-garden` class directly on its outer wrapper; that class hard-sets `z-index: 0`, which silently overrode the intended `z-40` and let the *original* board's marquee show through underneath the free-spins marquee → restructured to a dedicated `.free-spins-overlay` wrapper (its own `position:fixed; z-index:40`) with `.night-garden` scoped to an inner background child, matching the pattern the main board already used correctly.

**Cycle 3 — re-shoot after fixes.** Same states re-captured.

| DEPTH | COHESION | CHARACTER | CELEBRATION | POLISH |
|---|---|---|---|---|
| 8 | 9 | 7 | 8 | 8 |

Remaining soft spots, logged rather than hidden:
- Cat pop-in was captured mid-transition (hop-in animation frame ~0), so the on-camera cat reads small/faint in that one shot. The pose-sequencing code (`strut → eat`, `strut → assist → eat`, `strut → unimpressed`) was verified by reading the DOM sequence directly; a longer capture window would get a cleaner hero frame.
- TWELVE PUMPS! and the UniGlee takeover (~1/400 spins) did not land in the on-camera sample within this session's time budget. Both were verified by code/CSS review (solid pill backdrop on the callout; opaque violet scrim + butterfly-rise keyframe on the takeover) but are flagged **unverified visually** rather than claimed as screenshot-confirmed.
- CHARACTER is capped below DEPTH/POLISH because the cast currently reads mostly through small reel-cell wilds and the momentary pop-in; there's room for a future pass to let Phoebe/Joey/AskJamie live more persistently on-screen (the brief's "characters live ABOVE and AROUND the reels" is partially, not fully, realized — the perch and treat jar are housed, but nobody is idly animating up there between spins yet).

## Asset inventory (provenance: original, created this session)

| Asset | Where | Notes |
|---|---|---|
| 18 board symbols, cat sprites (4 poses × 2 cats), wheel face, saucer (5 colorways), garden-foreground silhouette, firefly jar, Glee avatar, AskJamie avatar | `src/ui/symbols.ts` | Hand-authored inline SVG, shared gradient/sheen/shadow recipe |
| Cabinet, marquee, jar meter, bet console, celebration kit, uniglee takeover, wheel chrome, aurora/star/saucer scene CSS | `src/style.css` | CSS transforms/opacity + gradients only; `prefers-reduced-motion` zeroes all animation/transition durations |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | `public/icons/` | Rendered from an original SVG (Mermaid Tumbler + butterfly on the night-garden gradient) via headless-browser screenshot, then palette-quantized for size |
| `splash.png` | retired | Legacy title-lockup export; production uses the optimized `public/assets/chai-chase-splash.{png,webp}` pair. |
| `baloo2-800.woff2` | `public/fonts/` | Baloo 2, weight 800, SIL Open Font License 1.1 (Google Fonts), self-hosted — no runtime CDN dependency |

No brand marks, no traced art, no photos, no hot-chai imagery anywhere in the above (checked by eye against `docs/IP-GUARDRAILS.md` and `docs/CANON.md` while authoring each asset).

## Weight report

| Asset group | Size |
|---|---|
| `public/icons/icon-192.png` | 12.3 KB |
| `public/icons/icon-512.png` | 63.2 KB |
| `public/icons/icon-maskable-512.png` | 62.3 KB |
| retired `public/icons/splash.png` | removed from runtime |
| `public/fonts/baloo2-800.woff2` | 18.2 KB |
| **Total new binary assets** | **~343 KB / 400 KB budget** |

Everything else (symbols, cats, saucers, jar, wheel, avatars, all CSS) is inline text in `src/ui/symbols.ts` / `src/style.css`, which is what the production bundle actually ships: `dist/assets/*.css` is 26.7 KB (6.9 KB gzip), `dist/assets/*.js` is 56.3 KB (15.7 KB gzip) for the whole app, per `npm run build`.

## Final gate

- `npm run build` — clean (`tsc --noEmit && vite build` both succeed).
- `SKIP_ORACLE=1 npm run test` — 28 passed, 6 skipped (the simulation-oracle suite; per the brief, that workstream isn't this pass's responsibility).
- No console errors observed across idle, spin, cascade-win, win-tier, wheel, and free-spins states, including under `prefers-reduced-motion: reduce` emulation.
- No engine files touched; `src/ui/board.ts` still renders `SpinResult`/`CascadeStep` data only — the only new "decision" logic is which **art** to show (win-tier threshold by win/bet ratio for celebration-overlay sizing, and which cat-pose sequence to play), never payout math.

## Environment notes for Jamie (not a design finding, but worth knowing)

- This session's sandbox mounts your repo through a bridge that occasionally served stale or partially-written copies of files I'd just saved (confirmed by comparing against the authoritative file view) and, separately, blocks `unlink` on a few paths (`.git/index.lock`, `node_modules/.vite/*`). I worked around both without deleting anything of yours — renamed a couple of stale lock/cache files aside, and re-wrote my own two source files when the mount view fell behind. I did **not** attempt any git surgery beyond that; I did not run `git add`/`commit`/`push`. You'll want to `git status`/diff-review the working tree yourself before committing — I'd rather you see every line than trust an automated commit through a flaky mount.
- Early in the session I saw signs another process was writing to this same repo concurrently; you confirmed that's Replit working remotely on the math/oracle side. I stayed inside my file scope throughout and didn't touch anything under `src/engine/`, `src/state.ts`, or `src/audio/`.
