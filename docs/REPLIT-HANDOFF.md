# REPLIT-HANDOFF.md — vertical slice delivered 2026-07-10

Scope: playable vertical slice per the Replit Implementation Brief, built on `docs/DESIGN-SPEC.md` (canonical) without rewriting any other tool's docs. Small commits, engine/UI/audio boundaries honored throughout.

## What is working

- Splash → tap unlocks Web Audio and opens the main board (`src/main.ts`, `src/ui/board.ts`).
- Portrait-first 5×4 reel board, cascade meter, Glee-coin balance, bet stepper (25/50/125/250/625, 1250 unlocking at player level 12), Treat Jar readout, AskJamie perch, ≥64px SPARKLE! button.
- Tap SPARKLE! → real spin → cascade-to-dead-board loop animates step by step (win-flash cells, meter climbs, synthesized tick/arpeggio/pluck per step).
- 25 fixed paylines, full paytable from spec §4, wild substitution, wilds pay as `tumbler`.
- Treat Jar collection (Chicken Comets / Salmon Stars / Boogie Bites, cap 12 each) and cat pop-ins: Phoebe assists with any treat, **Joey only assists when Boogie Bites are stocked** (canon S7, unit-tested).
- UniGlee detection surfaces a status line; free-spin ladder award is computed and reported (actual free-spin *gameplay* is stubbed — see below).
- Bust-proof economy: balance can never strand below the current bet (AskJamie "finds coins under the couch," tested).
- Chai Sparks XP accrual and level display; balance, bet, XP, Treat Jar, best cascade, and settings persist through `src/state.ts` (`ccv1.*`), verified by refresh.
- Sound toggle (persisted, defaults on) and automatic `prefers-reduced-motion` detection (CSS-level fade override already present in `src/style.css`; JS-level "replace drops with fades" is not yet special-cased beyond the CSS media query — see follow-up).
- `npm run test` (23 tests, all engine modules) and `npm run build` (tsc + vite) both pass clean, no console errors observed in manual play.

## Changed / added files

- `src/engine/reels.ts`, `paylines.ts`, `features.ts`, `cascade.ts`, `economy.ts` (+ matching `.test.ts` files) — pure TS, zero DOM, all new.
- `src/audio/synth.ts` — new. Original oscillator/gain-envelope sounds only (toolbox chime, cascade tick, rising arpeggio, win pluck, bonus fanfare). No samples.
- `src/ui/board.ts` — new. Owns rendering/animation only; consumes `SpinResult`/`CascadeStep`, computes zero game math.
- `src/main.ts` — rewritten: splash still does the audio-unlock gesture, then mounts the real board instead of a static placeholder.
- `src/state.ts` — extended with a typed `GameState` (balance, bet, xp, treatJar, bestCascade, spinsSincePopIn, soundOn, reducedMotion) built on the existing versioned-key primitives; nothing existing was removed.
- `src/style.css` — added `.cell`/`.win-flash` transition rules (transform/opacity only, per §11).

Engine/UI/audio boundary was kept strict: `src/engine/*.ts` has zero DOM/localStorage/Web Audio imports (grep-verified), `src/ui/board.ts` never computes a payout or probability, `src/audio/synth.ts` only composes/plays.

## Intentionally stubbed (tier 2/3 per spec §15 cut lines — do not treat as bugs)

- **Free spins are awarded but not played.** The AskJamie wheel, modifier selection, and the aurora-shifted free-spin board (§7) are not implemented; the slice reports "N free spins earned (coming soon)" instead. This is the single biggest next chunk of work.
- **Specialty wilds** (Sparkle Sort, Drop-In Saucer, Double Sparkle, Facts-on-Facts) are typed (`SpecialtyWild`) but never triggered — `CascadeStep.specialtyAwarded` is always `[]`.
- **Chai Tea Bonus** (12-tumbler pick shelf, §8), **Daily Bonus Wheel** (§9), **milestone scenes** (§10), and the **Birthday Reveal** (§12) are not built.
- **Wild stacking** (6-7 high per spec §5) is simplified to independent per-cell wild draws; visually and mathematically this is a placeholder, not the final reel design.
- **Photo sticker-cutouts** for cat pop-ins are not wired in — pop-ins currently render as an emoji + status-line quip only, per S12/S10 asset gating (no approved cutout path was provided).
- **Music loops** (base 70s soft-rock pad, free-spin grunge-tinged loop) are not built; only one-shot SFX exist so far.
- **Reduced-motion JS behavior**: the CSS media query kills transition durations globally, but the brief's "fades replace drops without removing information" nuance isn't hand-tuned per animation yet — currently everything just snaps instantly under reduced motion rather than getting a deliberate short fade.
- **RTP validation**: no 1M-spin simulation test exists yet. Current reel weights are a reasonable first pass, not simulation-tuned to the ~96% RTP / event-frequency table in spec §4. Treat current odds as placeholder until Claude's engine/math workstream (owner per `docs/DECISION-LOG.md`) verifies or replaces the reel strips.

## Test / build evidence

```
npm run test   → 6 files, 23 tests, all passing
npm run build  → tsc --noEmit clean, vite build clean (no warnings)
```

Manually verified in the Replit preview (iframe, ~390×844-equivalent viewport): splash → tap unlocks audio and opens the board with no console errors; SPARKLE! spins, animates cascades, updates balance/meter/Treat Jar; refresh preserves balance/XP/Treat Jar/settings; sound toggle mutes SFX; reset button clears `ccv1.*` and reloads to starting state. Desktop viewport also checked — no overflow, no layout breakage.

## Decisions Jamie (or the next tool) should make next

1. **Who owns free-spin gameplay + the AskJamie wheel?** Per `docs/DECISION-LOG.md`, UI implementation is Claude's workstream; Replit can take bounded polish tasks after core ships. Recommend Claude take the free-spin screen using the same `SpinResult`/`CascadeStep` contract already established here.
2. **Reel-strip tuning / RTP simulation** — flagged as Claude's engine workstream. The current `reelWeights()` in `src/engine/reels.ts` is a clearly-documented placeholder; swapping in simulation-tuned weights doesn't change any public function signature.
3. **Cat photo cutouts** — waiting on Jamie to supply the curated, per-file-approved asset list (S12) before any photographic pop-in art ships.
4. Nothing in this slice touched `reference-photos/`, `private-work/`, or any brand-name/logo string — no new IP-guardrail review needed for these changes.
