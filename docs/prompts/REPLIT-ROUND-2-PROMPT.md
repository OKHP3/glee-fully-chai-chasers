# REPLIT ROUND 2 — Make It Feel Like 2027, Not 1987

> **OBSOLETE PROMPT — DO NOT RUN.** Replit must use `REPLIT-HANDOFF.md` v3 and `GAME-REALIGNMENT-2026-07-12.md` against the protected implementation baseline.

*(Paste everything below this line into Replit Agent.)*

---

Your vertical slice had solid bones — engine/UI boundaries held, tests were real, the handoff doc was honest. Keep working exactly that way. But the product verdict from the owner: **"This looks like it was built in 1987."** Measured against the canonical spec, the math is broken and the presentation layer barely exists. Round 2 is a quality sprint with a mandatory validation loop. You are not done when it compiles. You are done when the gates are green and the screenshots look like a modern casual mobile game.

## Ground rules (unchanged, non-negotiable)

1. `docs/DESIGN-SPEC.md` is canonical. `docs/CANON.md` and `docs/IP-GUARDRAILS.md` are law. Do not edit any doc except your own handoff/validation logs.
2. Likeness policy (DECISION-LOG S15): you MAY view `reference-photos/` for the cats' markings and personality, but NO photograph or photorealistic rendering of any person or cat ships in the product or gets committed to shipped asset paths. All shipped character art is original illustration. `private-work/` stays untouched. No brand names/logos/audio samples anywhere.
3. Engine (`src/engine/`) stays pure TS, zero DOM. UI computes zero math. Small conventional commits.
4. Do not delete, skip, `.skip()`, weaken, or widen `src/engine/simulation.test.ts`. Those gates are the definition of "the math is right." The oracle honors `SKIP_ORACLE=1` for the CI deploy job ONLY — never set it in your own runs; your validation loop always runs the full oracle. (Exception: if a gate is impossible because of a genuine spec contradiction, STOP and write the issue to `docs/REPLIT-VALIDATION-LOG.md` instead of hacking the test.)

## Workstream A — Fix the math (highest priority)

Current measured state (100k-spin sim): RTP **14%** (spec: 96%), free spins **1 in 1,235** (spec: 1 in 35), 8+ cascades **never**, UniGlee **1 in 5** (spec: 1 in 400). Root causes, in order:

1. **Replace per-cell random draws with real reel strips.** Build weighted circular strips per reel (~60-100 symbols each) including **wild stacks 6-7 symbols long** placed ON the strips (spec §5). Stacking is what makes cascade chains and the free-spin ladder reachable. Spin = pick a stop index per reel, read 4 visible rows.
2. **Gate the UniGlee** as a per-spin event (~1/400), not a strip symbol. On trigger it awards the full package per spec §5.
3. **Implement specialty wilds** (Sparkle Sort, Drop-In Saucer, Double Sparkle, Facts-on-Facts): earned on line hits by marked wilds, queued, exactly ONE fires per dead board, extras stay queued (spec §5). Sparkle Sort must be able to revive dead boards — it's a major driver of reaching 8+ cascades.
4. **Tune until `npx vitest run src/engine/simulation.test.ts` is fully green.** Tuning order: strip composition → paytable scaling → cascade-refill weighting. Log every tuning iteration's numbers.

## Workstream B — Free spins + the AskJamie Wheel

Implement spec §7 end to end: meter trigger → wheel with three wedges (We're Multiplying 40% with the 12x "TWELVE PUMPS!" callout, Giant Gnome Mode 35%, We Want Our Chai Back 25%) → aurora-shifted board → retriggers → warm exit summary. Free spins use the same engine `spin()` with the modifier applied — keep the modifier math in the engine, tested.

## Workstream C — The presentation overhaul (the "2027" bar)

Replace the emoji-in-gray-boxes look entirely. The quality bar: **a 2026-27 casual mobile slot (Jackpot Party-class), judged from a screenshot.** Concretely:

1. **Symbol art:** commit an original inline-SVG symbol set (all 19 symbols per spec §4) in the repo palette (navy `#1a1f3c`, violet `#2d1f4c`, mint `#9fe8c5`, orange `#d35b2d`, butter `#f5d576`, pink `#e8a5b8`). Thick friendly outlines, retro-bright, readable at 56px. No emoji anywhere in the shipped board.
2. **Scene:** layered night-garden background (gradient sky, twinkling mint stars, silhouetted garden foreground), a row of five hovering cat-saucers above the reels that bob idly and BEAM during cascades.
3. **Motion (transform/opacity only, 60fps):** reel spin with staggered stops and overshoot bounce; win-line flash; **beam-up** (winners float up into saucers, shrink + glow); **gravity drop-in** with per-reel stagger and squash landing; coin balance count-up ticker; cascade meter as a firefly jar that visibly fills and buzzes at 3; full-screen celebration overlays scaled to win size; UniGlee butterfly-storm takeover.
4. **Typography & layout polish:** real hierarchy, safe-area insets, glowing SPARKLE! button with idle pulse. Respect `prefers-reduced-motion` with deliberate short fades (not instant snaps).
   **Easter-egg density:** lean hard into `docs/CANON.md` — the jewel-toned mermaid-pattern tumbler as the top symbol, the number 12 recurring (12x callout, 12-slot jar caps, level-12 fanfare), mixtape/VHS/grunge-and-70s-soft-rock nods, cozy-witchy candle-and-crystal touches, quips in her three registers. Specificity is the whole gift.
5. **Audio:** add the two sequenced loops (dreamy 70s soft-rock base; grungier free-spin loop) to the existing synth — original composition only — plus cat pop-in motifs (Joey boogie riff, Phoebe purr-trill).

## Workstream D — Cat pop-ins as moments

Pop-ins become animated events, not status-line text: cat walks/struts across the board (illustrated SVG cats matching CANON.md descriptions — curvy tuxedo Phoebe, slender gray yellow-eyed Joey), eats treat with visible jar decrement, performs the assist with its own effect, exits with personality. Empty-jar consolation knock included. Quips per CANON.md registers.

## THE VALIDATION LOOP (mandatory, minimum 3 full cycles)

You have parallel subagents — use them (art generation, engine tuning, and UI motion can run concurrently). Skills in `.agents/skills/` are available. After EVERY workstream chunk, run the full loop:

```
1. npm run test          → all tests INCLUDING simulation.test.ts
2. npm run build         → tsc + vite clean, zero warnings
3. Open preview at 390x844. Play 25+ spins by hand.
4. Screenshot: idle board, mid-cascade, big win, free spins, wheel, cat pop-in.
5. Self-review each screenshot against DESIGN-SPEC §16 acceptance criteria AND
   the question: "Would a stranger guess 2027 casual game, or a CSS demo?"
6. Log the cycle in docs/REPLIT-VALIDATION-LOG.md: date, cycle #, sim numbers
   (RTP + all five rates), test count, defects found, defects fixed, screenshots' verdict.
7. Fix what failed. Repeat. Do not report done with any gate red or any
   screenshot you wouldn't put in an app store listing.
```

## Definition of done

- `simulation.test.ts` fully green (RTP 95.5-96.5%, free spins ~1/35, UniGlee ~1/400, mega ~1/900 band, cat ~1/30).
- All other tests green; build clean; zero console errors through 50 manual spins.
- Free spins, wheel, specialty wilds, UniGlee, cat pop-in moments all playable.
- Zero emoji in the shipped board; all art original SVG in-palette; no brand strings (CI gate enforces).
- `docs/REPLIT-VALIDATION-LOG.md` shows ≥3 completed cycles with improving numbers.
- Updated `docs/REPLIT-HANDOFF.md` (v2 section): what shipped, what's still stubbed (Chai Bonus §8, scenes §10, birthday reveal §12 remain future tiers — do NOT start them this round; depth over breadth).

Work in this priority order: A → B → C → D. If time runs short, a gorgeous, mathematically-correct core loop beats four half-features. Depth over breadth, always.
