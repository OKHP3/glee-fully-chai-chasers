# Glee-fully Chai Chasers 🎰🦋

A free, fan-made cascading-reels game starring Joey & Phoebe — two cats, a lot of iced chai, and zero real money. A birthday gift in the [Glee-fully™](https://glee-fully.tools/) universe.

**No wagering. No purchases. No ads. No accounts. No tracking.** Fictional currency only, saved in your browser. Not affiliated with any casino, game studio, or brand.

## Play

Live build: deployed via GitHub Pages (link lands here once the first build ships). Best on a phone in portrait — add it to your home screen for the full experience.

## For contributors (human and AI)

Start with **[AGENTS.md](AGENTS.md)** — reading order, coordination rules, and the privacy/IP rails. The short version: check `docs/DECISION-LOG.md` before building anything, keep game math in `src/engine/` (pure TS, tested), and never touch `reference-photos/` or `private-work/`.

```
npm install
npm run dev      # local dev
npm test         # vitest on the engine
npm run build    # production build (also runs in CI with privacy + brand gates)
```

## Why

Because Glee loves this kind of game, and Jamie loves Glee more than the casino loves her money.

---
*Inspired by Glee's sparkle, fueled by iced chai, and loaded with facts-on-facts.*
