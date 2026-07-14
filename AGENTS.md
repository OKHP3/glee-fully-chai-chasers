# AGENTS.md — Glee-fully Chai Chasers

Canonical guide for every AI system working in this repo (Claude, ChatGPT/Codex, GitHub Copilot, Replit, Perplexity, Notion). `CLAUDE.md` imports this file. Read this before touching anything.

## What this is

A free, browser-based, mobile-first slot-style game — a birthday gift from Jamie to Glee Hill (07/17). Inspired by the *Invaders from the Planet Moolah* mechanical family, expressed entirely in original Glee-fully™ canon. Fictional Glee-coins only; no purchases, ads, or product backend. Limited aggregate reach measurement is permitted only under S25. Vite + TypeScript + Tailwind SPA deployed to GitHub Pages.

## Read in this order

1. `docs/DESIGN-SPEC.md` — **THE canonical spec** (v2, approved by Jamie 2026-07-10). Build from this.
2. `docs/IMPLEMENTATION-BASELINE.md` — **THE canonical running state and cross-tool handoff.** Rebase onto it; never overwrite it from an older checkpoint.
3. `docs/GAME-REALIGNMENT-2026-07-12.md` — **approved Chai Chase amendment.** No GPT-Toolbox metaphors; twelve is chai history, not system-wide mythology; UniGlee becomes the 100–500-spin mythic marathon.
4. `docs/DECISION-LOG.md` — settled decisions. **If a future decision is open, do not build on either side of it.**
5. `docs/COLLABORATIVE-VISION.md` — honored pre-alpha foundation (Codex); resolved and superseded where it conflicts with the spec (adoption table: spec §2).
6. `docs/CANON.md` — Glee-fully facts. Get these wrong and the gift fails. Iced chai ONLY.
7. `docs/IP-GUARDRAILS.md` — hard legal rules. Non-negotiable.
8. `docs/RESEARCH-BRIEF.md` — Planet Moolah mechanics study (what we may echo, with sources).
9. `docs/ASSET-CHECKLIST.md` — every asset, its owner, status, and provenance rule.

## Coordination rules (multi-tool, token-efficient)

- One owner per deliverable. Check `docs/DECISION-LOG.md` assignments before starting; don't rebuild a component another tool owns.
- Bounded artifacts only: a mechanics table, a component, a scene script, a QA pass. Not "improve the game."
- Don't silently replace others' docs. Add a dated section or companion file, propose, and let Jamie rule (per COLLABORATIVE-VISION §11).
- Before editing, identify the Git commit and compare it with `docs/IMPLEMENTATION-BASELINE.md`. Never copy an older Claude or Replit tree over the protected UI/art baseline.
- Engine code (`src/engine/`) is pure TypeScript with zero DOM imports and unit tests. UI code never contains game math. This boundary is the one architectural rule that is not up for debate.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`). Small commits; the human diff-reviews everything.

## Privacy & safety rails (hard)

- `reference-photos/` and `private-work/` are gitignored. NEVER commit, copy, or derive public assets from them without Jamie's explicit per-file approval. Photos of Glee never ship, period.
- No copyrighted audio/video (no Friends, Schitt's Creek, Stevie Nicks clips), no brand names/logos/trade dress (no WMS/L&W/SciPlay, Starbucks, Tazo, Swig Life, Cat Man Doo, Orijen) in shipped assets or code identifiers. Homage by silhouette, palette, and vibe only. See `docs/IP-GUARDRAILS.md`.
- Use fictional Glee-coins, generous math, accurate meters, and no purchase language.
- The only permitted measurement is the limited Google Analytics reach measurement defined in `docs/ANALYTICS-PRIVACY.md`: no advertising, personalization, accounts, custom identifiers, or game-state telemetry.

## Build commands

```
npm install
npm run dev        # local dev server
npm run build      # production build to dist/
npm run test       # vitest on src/engine
npm run preview    # serve the production build
```

Deploy is automatic: push to `main` → `.github/workflows/deploy.yml` → GitHub Pages.

## Repo map

```
docs/               product docs (see reading order above)
src/engine/         pure game math — reels, paylines, cascades, features, economy
src/ui/             DOM rendering, animation, screens
src/audio/          Web Audio synth engine, music loops, SFX
src/state.ts        versioned localStorage persistence
public/             manifest, icons, static assets
assets/             (future) shipped art with documented provenance
.agents/skills/     Jamie's skill foundry (cataloger, ADR, find-skills) — use for ADRs and skill work
.github/skills/     heic-image-convert utility skill
private-work/       LOCAL ONLY — triage notes, personal material
reference-photos/   LOCAL ONLY — visual brief; being purged from git history
```

## Quality bar

Glee opens it on her iPhone and understands what to tap with zero instructions. Every spin resolves legibly at 60fps. It feels like *her* game — cats, iced chai, butterflies, retro-bright warmth — not like a casino and not like anyone else's IP.

## Imported Claude Cowork project instructions
