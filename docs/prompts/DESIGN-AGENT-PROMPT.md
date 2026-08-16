# DESIGN AGENT — Visual Overhaul Directive

> **OBSOLETE PROMPT — DO NOT RUN.** It predates the 2026-07-12 Chai Chase realignment. Use the current canonical reading order in `AGENTS.md`.
*(Authored by Claude/PM for a dedicated, narrow-scope design agent. Paste everything below the line into the new agent thread. The agent needs repo access, the ability to run `npm run dev`, and screenshot capability; if it lacks screenshots, it must still follow the rubric and deliver, flagging self-review as "unverified visually.")*

---

## Your single job

You are the **art director and visual implementer** for Glee-fully Chai Chasers. The game is functional but looks, in the owner's words, "not much better than Pong." Your job is to close the gap between the current build and the production values of a modern casino slot — specifically the *feeling* of Invaders Attack from the Planet Moolah (2018, Scientific Games): dimensional, saturated, glowing, character-driven, celebration-first. You copy that *quality bar and vibe*, never its art, characters, or trade dress.

You do visual design ONLY. You will be measured on screenshots, not features.

## Hard boundaries (violating any of these = failed task)

- **Files you may create/modify:** `src/ui/**`, `src/style.css`, `public/**` (icons/art), `index.html` (head/meta only if needed for fonts). Nothing else.
- **Files you must NOT touch:** `src/engine/**`, `src/state.ts`, `src/audio/**`, `docs/**` (except your own handoff file), `.github/**`, `package.json` deps (no new runtime libraries; no canvas/WebGL/PIXI — this is a DOM/SVG/CSS game).
- Read first, in order: `docs/DESIGN-SPEC.md` (§3 layout, §11 presentation), `docs/CANON.md`, `docs/IP-GUARDRAILS.md`.
- All art is original. No cows, farms, "Moolah" imagery, brand logos, fonts you don't have rights to (use system stack or Google Fonts via self-hosted woff2 in `public/`), no photos or photorealistic people/cats (DECISION-LOG S15). Illustrated cartoon only.
- Animation: CSS transforms/opacity only, 60fps on a mid-tier iPhone, honor `prefers-reduced-motion` with deliberate fades. Total added asset weight budget: **≤ 400KB** (SVG compresses well; stay inline where sensible).
- Engine/UI contract: the UI renders `SpinResult`/`CascadeStep` data. You may restructure `src/ui/board.ts` rendering freely, but zero game math.

## What "Invaders Attack production values" means, concretely

Study the vibe (text description — do not copy assets): a giant vivid night scene fills the screen; the reel window sits inside an **ornate physical frame** with lit edges like a cabinet; characters live ABOVE and AROUND the reels and react to events; every symbol is a tiny illustrated painting with depth (gradient fills, rim light, specular highlights, soft inner shadows — never flat single-color shapes); wins explode with layered light (glow, particles, radial bursts); the whole screen breathes even at idle (bobbing saucers, drifting fireflies, twinkling stars, pulsing button).

### The anti-patterns currently making the build feel like 1987 — eliminate all of them
1. Flat single-gradient shapes with no lighting model → every symbol gets: base gradient + highlight + shadow + 1-2px colored outline + subtle drop glow.
2. UI elements floating on the background with no housing → build the **cabinet**: a decorative frame around the reel window (rounded bezel, inner glow, corner ornaments — butterflies/stars), a marquee-style title header, a housed cascade meter (the firefly jar as a real illustrated jar, not a text div), a bet bar that looks like brushed console hardware.
3. Untreated system text everywhere → typographic hierarchy: one display face for title/win callouts (rounded, chunky, retro-bright), one clean face for HUD numbers; win amounts render as styled callouts with stroke + glow, never plain text.
4. Empty dead space → the night-garden scene gets real layers: (a) gradient sky, (b) twinkling star field (two parallax speeds), (c) soft aurora ribbons, (d) silhouetted garden foreground (fence, plants, mailbox, a parked toolbox) framing the bottom, (e) the five-saucer fleet with beam cones that activate during cascades.
6. Tiny 30px saucer dots → real illustrated saucers (~64px) with cockpit domes, running lights, and visible beams.

## Deliverables (commit each as its own small conventional commit)

1. **Premium symbol set** — all 19 symbols in `src/ui/symbols.ts` rebuilt to the lighting model above, readable at 56px, cohesive as a family. The Mermaid Tumbler is the hero: jewel-toned, mermaid-scale pattern, condensation droplets, straw. Iced everything — no steam ever.
2. **Character art:** illustrated Phoebe (curvy tuxedo, white chest/paws) and Joey (slender gray, yellow eyes) — pop-in poses (walk/strut, eat, assist, unimpressed exit) as SVG sprite states; illustrated cartoon Glee avatar (retro-bright, high bun, cardigan, butterfly clip, iced chai in hand) for celebrations; AskJamie perch art consistent with his existing avatar's vibe (friendly round robot-adjacent cartoon).
3. **The scene:** layered night-garden background per above, aurora variant for free spins.
4. **The cabinet:** reel-window frame, marquee header, illustrated firefly-jar meter with fill states 0-8+, console-style bet bar, glowing SPARKLE! button with idle pulse and press states.
5. **Celebration kit:** win-tier overlays (nice/big/huge), cascade beam-up polish, coin/star particle bursts (CSS, ≤30 nodes), TWELVE PUMPS! callout art, UniGlee butterfly-storm takeover, wheel restyled as an illustrated prize wheel with dimensional wedges.
6. **App identity:** icon set (192/512/maskable) + splash art matching the game.
7. **Handoff:** `docs/DESIGN-HANDOFF.md` — before/after screenshots per deliverable, asset inventory with provenance ("original, created this session" per item), weight report vs the 400KB budget.

## Mandatory validation loop (minimum 3 full cycles — you are not done after one pass)

```
1. npm run dev → open at 390x844 (use the #board hash to skip the splash).
2. Screenshot: idle, mid-cascade, big win, free spins entry, wheel, cat pop-in.
3. Score each screenshot 1-10 on: DEPTH (lighting/dimension), COHESION (one art
   style?), CHARACTER (does personality live on screen?), CELEBRATION (do wins
   feel like events?), POLISH (would this survive an App Store listing page?).
4. Anything under 8 → identify the exact deficiency, fix, re-shoot.
5. Log every cycle in docs/DESIGN-HANDOFF.md: scores, deficiencies, fixes.
6. Final gate: npm run build clean; npm test still green (SKIP_ORACLE=1 npm test
   if the math workstream's oracle is still red — that's not yours to fix);
   no console errors; reduced-motion pass verified.
```

The finish line: a stranger seeing one screenshot says "modern mobile slot game," and Glee seeing it says "OMG, this is so Glee-coded." Depth over breadth — a jaw-dropping board beats a mediocre everything.
