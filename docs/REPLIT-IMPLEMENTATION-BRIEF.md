# Replit Implementation Brief — Glee-fully Iced Chai Chasers

## Your role

You are joining a shared, multi-agent repository. Build a polished, **functional vertical slice** of this static, mobile-first game for Glee's iPhone 17 Pro Max. Do not restart it, replace the architecture, or rewrite others' documents. Extend the current repository deliberately and leave clear, small commits.

This is a free birthday gift—not a commercial product, not real gambling, and not a copy of any existing game.

## Read before writing code

Read these files in order and treat them as binding:

1. `AGENTS.md`
2. `docs/DESIGN-SPEC.md` (canonical product specification)
3. `docs/DECISION-LOG.md` (settled decisions)
4. `docs/CANON.md`
5. `docs/IP-GUARDRAILS.md`
6. `docs/ASSET-CHECKLIST.md`

`docs/COLLABORATIVE-VISION.md` is useful historical context, but the canonical spec wins if they conflict.

Before every change: inspect `git status`, existing code, and the most recent commits. Preserve unrelated work. Do not use `git reset`, overwrite documentation, or reimplement a module that another agent has actively filled in.

## What exists today

- Vite + **vanilla TypeScript** + Tailwind static SPA.
- GitHub Pages workflow already exists.
- `src/main.ts` is still a splash-screen walking skeleton.
- `src/engine/` has a seedable RNG, types, and a test; the rest of the pure engine is intentionally unfinished.
- `src/state.ts` already provides versioned `localStorage` helpers (`ccv1.*`).
- `src/audio/` is specified as original Web Audio synth only; no samples or music files are present.

Some comments in `src/main.ts`, `src/ui/README.md`, and `src/engine/README.md` predate the settled decisions. Do **not** follow their stale “pending decision” wording. `AGENTS.md` and `docs/DESIGN-SPEC.md` are authoritative. In particular: use vanilla TypeScript, use **Glee-coins** as fictional balance and **Chai Sparks** as XP, and make everything iced chai.

## Deliverable: playable vertical slice

Make the current splash lead into a real, enjoyable first-play loop. The player should be able to:

1. Tap **“Tap to open the Toolbox”** and enter the game. That tap must initialize/resume Web Audio on iOS.
2. See a portrait-first 5 × 4 reel board, a large cascade meter, Glee-coin balance, bet controls, Treat Jar, AskJamie perch, and a large ≥64px **SPARKLE!** button.
3. Tap **SPARKLE!** and watch a legible, animated spin/cascade sequence.
4. Receive a positive result: win/coin update, Chai Spark XP, cascade-meter movement, and a concise Glee-coded status line.
5. Hear original synthesized feedback when sound is enabled; continue perfectly when muted or under reduced motion.
6. Refresh and retain balance, XP, settings, and Treat Jar values through `src/state.ts`.

The slice may use a deliberately small, testable subset of the full paytable and one simple bonus overlay. It must feel complete for one minute of play; do not pretend all of the canonical features are finished.

## Architecture boundary

Respect this boundary:

- `src/engine/`: pure TypeScript. No DOM, CSS, Web Audio, or browser-storage imports. Seeded/deterministic where testable.
- `src/ui/`: render and animate engine events. UI never decides wins, probabilities, paylines, or rewards.
- `src/audio/`: Web Audio composition and playback only.
- `src/state.ts`: persistence only.

If engine modules are absent, add the smallest clean interfaces needed for the vertical slice—such as `spin()`, `SpinResult`, and `CascadeStep`—with Vitest coverage. Do not rewrite completed engine work. Keep event math separate from display timing.

## Visual direction

- Midnight PNW garden: navy/violet background, mint stars, butter yellow, burnt orange, dusty pink.
- Iced chai only: tall straw tumbler. No mug, steam, kettle, or hot-drink imagery.
- Use original code-native/SVG placeholder symbols initially; do not use reference photos, external images, product packaging, or brand marks.
- Phoebe: beloved curvy tuxedo cat; Joey: slender gray cat with yellow eyes. Make their assists visually distinct, warm, and respectful.
- AskJamie is a supporting co-pilot, never the protagonist.
- Do not imitate a casino-floor layout or visual identity; the cascade structure is enough.

## Sound, pizzazz, and feedback

Build the sensory layer with original Web Audio nodes—oscillators, gain envelopes, filters, and short sequenced tones. No copyrighted clips, samples, or sound-alikes.

Minimum sound palette:

- a short friendly “toolbox opens” chime;
- soft reel/cascade ticks;
- a rising arpeggio for cascade tiers;
- a small win pluck and warm bonus fanfare;
- separate music and SFX controls, persisted and defaulting to sound on after the first explicit tap.

For iPhone Safari:

- Initialize `AudioContext` only from the opening tap, then call `resume()` as needed after visibility changes.
- Use `prefers-reduced-motion` and a visible settings toggle. Reduced motion replaces drops/shakes with brief fades and does not remove game information.
- Use CSS transform/opacity animations and `requestAnimationFrame`; avoid layout-thrashing timers and heavy canvas dependencies.
- Make haptics a **feature-detected progressive enhancement only** (`navigator.vibrate?.(...)` behind a safe helper). Do not make the experience depend on it, advertise that it works on iOS, or add a native wrapper. iPhone web apps do not provide dependable general-purpose handset haptics; sound and visual hit feedback are the primary tactile illusion. A native switch control may produce platform haptics on modern iOS, but that is not a game-event API.

Suggested visual feedback: button compression, reel settle bounce, mint sparkle particles, meter pulse at cascade three, brief screen glow for a win, and a cat-tail/ear reaction for an assist. No flashing that ignores reduced motion.

## Safety, provenance, and privacy

- No photos of Glee, ever.
- Do not touch `reference-photos/` or `private-work/`; both are ignored/private. Do not upload them to Replit or another service.
- Do not ship cat-photo cutouts until Jamie supplies a per-file approved asset path and the asset is recorded in `docs/ASSET-CHECKLIST.md`.
- Never use the names/logos/trade dress of casino, beverage, pet-food, television, or music brands. Search all new source strings before handoff.
- No purchases, ads, accounts, telemetry, real-currency words, cash-out, or odds/RTP displayed to the player.
- Keep the automatic balance refill reliable and the progress meter accurate. Quiet spins remain warm, quick, and judgment-free.

## Scope and cut line

### Build now

- Main board + functioning SPARKLE loop
- One cascade/win animation path
- Local state for balance/XP/settings
- Audio unlock, sound toggle, reduced-motion option
- Basic original visual system and responsive iPhone layout
- Build/test pass

### Leave as clearly marked follow-up work

- Full 25-line math/RTP simulation, specialty-wild queue, UniGlee package
- All free-spin wheel variants, daily wheel, 12-tumbler bonus, all scenes
- Cat photo cutouts and generated production art
- Offline service worker, if it risks the core build

## Acceptance checks

Run and report:

```text
npm install
npm run test
npm run build
```

Then inspect the game at **430 × 932** (a practical iPhone 17 Pro Max target) and a desktop viewport. Verify:

- no clipped controls, horizontal overflow, or accidental browser zoom;
- all primary controls have ≥48px hit targets, and SPARKLE! is ≥64px tall;
- no console errors;
- first tap unlocks audio without autoplay errors;
- muted and reduced-motion modes both preserve gameplay;
- refresh preserves the intended local state;
- text and assets contain none of the prohibited brand strings.

## Collaboration handoff

At the end, make a concise `docs/REPLIT-HANDOFF.md` that lists:

- what is working;
- changed files and the engine/UI/audio boundaries honored;
- what remains intentionally stubbed;
- test/viewport evidence; and
- any decision Jamie must make next.

Do not commit/push unless Jamie explicitly asks. Keep changes reviewable and build on the canonical spec rather than replacing it.
