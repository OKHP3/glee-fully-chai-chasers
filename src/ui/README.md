# `src/ui` — rendering and interaction

The UI is vanilla TypeScript and owns DOM rendering, controls, overlays, accessibility labels, animation timing, and reduced-motion presentation. It consumes typed results from `src/engine/` and must not own game math, payout rules, symbol weights, or RNG.

Key surfaces include the splash/audio unlock, mobile-first cabinet board, cascade choreography, wheel, cat pop-ins, Treat Jar, Ice Notes, bonus staging, settings, and persisted-state controls. Preserve the protected presentation baseline described in `docs/IMPLEMENTATION-BASELINE.md`; use bounded improvements rather than broad regeneration of board, symbol, CSS, or production-art files.

For UI changes, run `npm test` and `npm run build`, then inspect an iPhone-sized viewport, reduced motion, mute behavior, and browser console.
