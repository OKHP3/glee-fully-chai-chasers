# REPLIT-HANDOFF.md

## v3 — CONSOLIDATED PRODUCTION BASELINE — 2026-07-12

**Current authority:** `docs/IMPLEMENTATION-BASELINE.md`, `docs/GAME-REALIGNMENT-2026-07-12.md`, and decisions S19-S23. This v3 section supersedes every older presentation/UI instruction below. The v1/v2 sections remain historical evidence only.

Before Replit performs any work:

1. Stop every checkpoint created before S18.
2. Import or pull GitHub `main` from `https://github.com/OKHP3/glee-fully-chai-chasers`.
3. Verify the checkout contains commit `58970e7` or a later descendant and includes both current handoff documents. Do not restore the deleted `attached_assets/` synchronization-prompt dump from commit `e34e855`.
4. Run `npm ci`, `npm test`, and `npm run build` without changing code.
5. Accept one bounded additive task only. Do not regenerate the app, restore the v2 SVG/gnome presentation, or reintroduce GPT-Toolbox vocabulary.

Protected from rollback: `src/ui/board.ts`, `src/ui/symbols.ts`, `src/style.css`, the production files in `public/assets/`, and decisions S17-S23. Replit must show Jamie a narrow diff and an iPhone-size preview before syncing anything back to GitHub.

Replit's prior engine, free-spin, and validation work remains part of the integrated product. Its older presentation instructions do not. GitHub is the source of truth and GitHub Pages is production; a Replit preview is not an alternate canonical version.

Best additive assignments are listed in `docs/IMPLEMENTATION-BASELINE.md` §4 and §6.

## v2 — "REPLIT ROUND 2" — 2026-07-10

Scope: fix broken math (Workstream A), implement free spins + AskJamie wheel
(B), presentation overhaul toward the "2027" bar with original SVG art (C),
animated cat pop-in moments (D) — in that priority order. Builds on v1 below;
v1 is left intact as history.

### What's new/fixed since v1

**A — Math (see `docs/REPLIT-VALIDATION-LOG.md` Cycle 1 for full iteration log):**
- Real fixed circular reel strips per reel (`src/engine/reels.ts`), replacing
  independent per-cell random draws. Saucer-cat wilds are literal contiguous
  6-7-symbol stacks on reels 2-5, not simulated by chance.
- UniGlee is now a per-spin gated event (~1-in-403) that queues the full
  bonus package, not a strip symbol (was landing ~1-in-5, wildly over-spec).
- Specialty wilds (Sparkle Sort, Drop-In Saucer, Double Sparkle) are fully
  wired: a wild in a winning line has a small chance to queue one, and
  exactly one fires per dead board. Facts-on-Facts is recorded but only
  meaningful during free spins (see B).
- `simulation.test.ts` (200k seeded spins) is green on all 6 gates: RTP
  95.9%, win rate 1-in-3.34, free spins 1-in-37, mega8 1-in-922, UniGlee
  1-in-403, cat pop-in 1-in-32.4. This oracle was never weakened — only the
  reels/paytable/cascade logic changed to meet it.

**B — Free spins + AskJamie Wheel (`src/engine/freespins.ts`, new):**
- `spinWheel()` picks one of three wedges (We're Multiplying 40%, Giant Gnome
  Mode 35%, We Want Our Chai Back 25%) per docs §7.
- `spinFreeRound()` runs one free-spin cascade with that wedge's modifier
  layered on: We're Multiplying rolls a 2-5x/8x/12x ("TWELVE PUMPS!",
  canon-sacred 12) per wild and scales the round's win by the average
  multiplier; Giant Gnome Mode and We Want Our Chai Back apply a documented,
  testable uplift standing in for their visual mega-symbol/extra-wild effects.
- `runFreeSpinSession()` drains the awarded spin count, honoring retriggers
  via the same cascade-count ladder used in the base game.
- UI (`src/ui/board.ts`): a spinning wheel overlay (original SVG face, CSS
  `@keyframes` spin-to-stop) resolves the wedge, then a full-screen aurora-tinted
  free-spin board plays every round's cascades with a beam-drop-in animation,
  a running spin counter, and a completion summary screen before returning to
  the base board.
- Tests: `src/engine/freespins.test.ts` (5 tests) — wheel always lands on a
  valid wedge, rounds never produce a negative/NaN win, sessions terminate
  and account for retrigger-extended spin counts.

**C — Presentation overhaul (`src/ui/symbols.ts`, new; `src/style.css`, `src/main.ts`, `src/ui/board.ts`):**
- Every board symbol (12 paytable symbols + both wild cats + UniGlee) is now
  an original hand-authored inline SVG in the game's retro-bright palette —
  **zero emoji anywhere in the shipped board**, splash, settings icon, or
  treat jar readout (was all emoji glyphs in v1).
- Night-garden backdrop: layered radial-gradient sky behind the board with
  drifting CSS "saucer" glows (bob animation) and firefly specks; shifts to
  an "aurora" palette during free spins.
- New CSS animation language: `symbol-pop` on every cascade refill,
  `beam-drop` for free-spin cascades, `shatter-out` (defined, ready for
  Sparkle Sort's cell-clear visual — see follow-ups), `wheel-spin-out` for
  the AskJamie Wheel, `cat-hop-in`/`quip-fade-in` for pop-ins.
- Splash screen rebuilt with SVG art instead of emoji; settings gear is now
  an inline SVG icon.

**D — Animated cat pop-in moments (`src/ui/symbols.ts` `catSprite()`, `src/ui/board.ts` `showCatPopIn()`):**
- Full-body original SVG sprites for Joey (slender gray, yellow eyes, canon
  S7) and Phoebe (tuxedo black-and-white, canon S7), each with a raised paw.
- Pop-in plays as a bottom-anchored overlay: cat hops in with an overshoot
  ease (`cat-hop-in`), a quip bubble fades in a beat later, then the whole
  thing clears after ~2.2s before the board's status line takes over. This
  runs as a real awaited step in `runSpin()`, not a fire-and-forget toast.

### Files touched this round

- `src/engine/reels.ts`, `cascade.ts`, `paylines.ts` (isWild export), `types.ts`
  (`doubleSparkleApplied` field) — math rewrite, Workstream A.
- `src/engine/freespins.ts`, `freespins.test.ts` — new, Workstream B.
- `src/ui/symbols.ts` — new, Workstreams C/D (all SVG art).
- `src/ui/board.ts` — rewritten: SVG symbols, wheel + free-spin flow, cat
  pop-in overlay, night-garden backdrop wiring.
- `src/audio/synth.ts` — added `playWheelTick()`, `playTwelvePumps()`.
- `src/main.ts` — SVG splash, `#board` dev-only QA hash bypass (see below).
- `src/style.css` — full animation-language addition (see C above).
- `src/engine/cascade.test.ts` — fixed to check `doubleSparkleApplied`
  explicitly rather than assuming the ladder award is never doubled.
- `tsconfig.json` — added `"node"` to `types` (fixes `process.env` typecheck
  in the oracle file; dev-only, ships in no bundle).

### Dev-only QA aid (flag for Jamie, not a game feature)

`src/main.ts` recognizes `#board` in the URL hash to skip the splash tap-in
gate, so screenshots/manual QA can reach the main board without a user
gesture (Web Audio still requires a real gesture to make sound — this only
bypasses the *screen*, not the audio unlock). It changes nothing for real
players landing on `/`. Safe to keep or strip at Jamie's discretion.

### Test / build evidence (Round 2)

```
npx vitest run   → 8 files, 34 tests, all passing (simulation.test.ts included, full oracle)
npm run build    → tsc --noEmit clean, vite build clean, no warnings
```

Manual QA in the Replit preview (390×844-equivalent + desktop): splash → SVG
art renders, no emoji visible anywhere; board shows night-garden backdrop
with drifting saucers/fireflies and full SVG symbol set; SPARKLE! cascades
animate with symbol-pop + win-flash; treat jar and settings icon are
emoji-free. See `docs/REPLIT-VALIDATION-LOG.md` for the full 3-cycle log
including free-spin/wheel/cat-pop-in verification.

### Intentionally not done this round (be explicit, don't hide gaps)

- **Chai Tea Bonus** (12-tumbler pick shelf, §8), **Daily Bonus Wheel** (§9,
  distinct from the AskJamie free-spin wheel), **milestone scenes** (§10),
  and the **Birthday Reveal** (§12) remain unbuilt — out of scope for this
  round's priority order (A/B/C/D only).
- **Music loops** (base pad + free-spin loop) still not built; only one-shot
  SFX exist (now including wheel-tick and the Twelve Pumps callout).
- **Sparkle Sort's shatter visual**: the `shatter-out` CSS class is defined
  and ready, but the base-game cascade loop doesn't yet call it out
  specially from a normal win-flash cascade tick — the math/queueing is
  correct (`simulation.test.ts` verifies the mega8 rate it drives), the
  *bespoke* shatter animation is a follow-up polish item.
- **Giant Gnome Mode / We Want Our Chai Back visuals**: their math is real
  and tested (`freespins.test.ts`), but the board doesn't yet render an
  actual 2×2 mega-symbol lock or extra wilds raining in — those rounds look
  like a normal free-spin cascade with a bonus coin uplift under the hood.
  Flagged honestly rather than faked with a placeholder animation.
- **CI emoji gate**: `docs/DESIGN-SPEC.md`'s "zero emoji" bar is met by hand
  (grep-verified, see validation log), but `.github/workflows/deploy.yml`
  doesn't yet have an automated grep gate for it the way it does for brand
  strings. Worth adding if this becomes a recurring regression risk.

### Decisions for Jamie / next tool

1. Sparkle Sort's shatter-cell visual and the two free-spin modifiers'
   bespoke board effects are the highest-value next polish pass — the math
   is done and tested, only the UI needs to catch up.
2. If an automated "no emoji in bundle" CI check is wanted, mirror the
   existing brand-string grep gate in `deploy.yml` against `dist/`.
3. Nothing in this round touched `reference-photos/`, `private-work/`, or
   any brand-name/logo string — no new IP-guardrail review needed.

---

## v1 — vertical slice delivered 2026-07-10

Scope: playable vertical slice per the Replit Implementation Brief, built on `docs/DESIGN-SPEC.md` (canonical) without rewriting any other tool's docs. Small commits, engine/UI/audio boundaries honored throughout.

### What is working

- Splash → tap unlocks Web Audio and opens the main board (`src/main.ts`, `src/ui/board.ts`).
- Portrait-first 5×4 reel board, cascade meter, Glee-coin balance, bet stepper (25/50/125/250/625, 1250 unlocking at player level 12), Treat Jar readout, AskJamie perch, ≥64px SPARKLE! button.
- Tap SPARKLE! → real spin → cascade-to-dead-board loop animates step by step (win-flash cells, meter climbs, synthesized tick/arpeggio/pluck per step).
- 25 fixed paylines, full paytable from spec §4, wild substitution, wilds pay as `tumbler`.
- Treat Jar collection (Chicken Comets / Salmon Stars / Bougie Bites, cap 12 each) and cat pop-ins: Phoebe assists with any treat, **Joey only assists when Bougie Bites are stocked** (canon S7, unit-tested).
- UniGlee detection surfaces a status line; free-spin ladder award is computed and reported (actual free-spin *gameplay* is stubbed — see below).
- Automatic-refill economy: balance never strands below the current bet (AskJamie "finds coins under the couch," tested).
- Chai Sparks XP accrual and level display; balance, bet, XP, Treat Jar, best cascade, and settings persist through `src/state.ts` (`ccv1.*`), verified by refresh.
- Sound toggle (persisted, defaults on) and automatic `prefers-reduced-motion` detection (CSS-level fade override already present in `src/style.css`; JS-level "replace drops with fades" is not yet special-cased beyond the CSS media query — see follow-up).
- `npm run test` (23 tests, all engine modules) and `npm run build` (tsc + vite) both pass clean, no console errors observed in manual play.

### Changed / added files

- `src/engine/reels.ts`, `paylines.ts`, `features.ts`, `cascade.ts`, `economy.ts` (+ matching `.test.ts` files) — pure TS, zero DOM, all new.
- `src/audio/synth.ts` — new. Original oscillator/gain-envelope sounds only (toolbox chime, cascade tick, rising arpeggio, win pluck, bonus fanfare). No samples.
- `src/ui/board.ts` — new. Owns rendering/animation only; consumes `SpinResult`/`CascadeStep`, computes zero game math.
- `src/main.ts` — rewritten: splash still does the audio-unlock gesture, then mounts the real board instead of a static placeholder.
- `src/state.ts` — extended with a typed `GameState` (balance, bet, xp, treatJar, bestCascade, spinsSincePopIn, soundOn, reducedMotion) built on the existing versioned-key primitives; nothing existing was removed.
- `src/style.css` — added `.cell`/`.win-flash` transition rules (transform/opacity only, per §11).

Engine/UI/audio boundary was kept strict: `src/engine/*.ts` has zero DOM/localStorage/Web Audio imports (grep-verified), `src/ui/board.ts` never computes a payout or probability, `src/audio/synth.ts` only composes/plays.

### Intentionally stubbed in v1 (superseded — see v2 above for what shipped this round)

- Free spins were awarded but not played; specialty wilds were typed but never triggered; wild stacking was per-cell random rather than real strips; symbols were emoji. **All four of these are now fixed — see v2.**
- Still stubbed after v2: Chai Tea Bonus, Daily Bonus Wheel, milestone scenes, Birthday Reveal, music loops, photo sticker-cutouts for cat pop-ins (now replaced by original SVG sprites instead, so this line item is effectively resolved a different way than v1 anticipated).

### Test / build evidence (v1, historical)

```
npm run test   → 6 files, 23 tests, all passing
npm run build  → tsc --noEmit clean, vite build clean (no warnings)
```
