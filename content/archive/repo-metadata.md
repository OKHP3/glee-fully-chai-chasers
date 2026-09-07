**DRAFT — DO NOT PUBLISH BEFORE 2026-07-17**

# Repo metadata block

For use in the README-overhaul PR description, and to paste into GitHub's repo Settings once the embargo lifts.

## GitHub "About" description (target: ≤350 characters)

> A free cascading-reels birthday game starring two cats, iced chai, butterflies, and fictional Glee-coins. Built by a council of AI tools from a canonical spec, decision log, and test-oracle-gated game engine. No purchases, ads, or accounts; limited aggregate reach measurement only. Not affiliated with any game studio or brand.

Character count: verify before publishing (target remains within GitHub's 350-character limit).

## Suggested topics

`slot-machine` `cascading-reels` `birthday-gift` `typescript` `vite` `pwa` `game-development` `ai-collaboration` `multi-agent` `game-engine` `vitest` `github-pages` `fan-made` `no-framework`

Fourteen topics; GitHub allows up to 20, so there's headroom if the team wants to add `procedural-generation` or `web-audio` once the audio system is fully documented.

## Social-preview image spec (1280x640)

Design brief for whoever builds this (ChatGPT image workflow or equivalent; not built here per scope).

**Scene:** the game's night-garden setting at full width. Midnight navy fading to violet at the top edge, sprinkled with mint-green stars. A soft aurora glow along the horizon line, echoing the free-spins palette.

**Foreground, left-to-right composition:**
- Left third: Joey (slender gray cat, yellow eyes) perched on a saucer, mid-boogie, same house illustration style as the in-game wild symbols.
- Center: the game's wordmark, "Glee-fully Chai Chasers," in the retro-bright display type used across the Glee-fully site family, with the two emoji (🎰🦋) worked in as small flourishes rather than literal rendered glyphs.
- Right third: Phoebe (curvy black-and-white tuxedo cat) seated next to the jewel-toned mermaid-pattern iced chai tumbler, both drawn at a scale that reads clearly as a thumbnail.

**Bottom band:** a short call-to-action treatment reading "Play free" in a rounded badge, burnt-orange accent (`#d35b2d`) to match the site-canon accent color, positioned bottom-center or bottom-right so it survives GitHub's crop into square avatars and wide link-preview cards alike.

**Hard constraints:**
- No text smaller than roughly 60px at 1280px width; this image gets scaled down aggressively in link previews.
- No photographic elements. Cats are original illustration only, matching the in-game symbol art (S15 in `docs/DECISION-LOG.md`): no photos or photorealistic renders of Joey, Phoebe, or Glee anywhere in this asset.
- No brand names, logos, or trade dress from any casino, beverage, or pet-food brand, per `docs/IP-GUARDRAILS.md`.
- Keep the palette inside the documented spec palette (`docs/DESIGN-SPEC.md` §11): midnight navy `#1a1f3c`, violet `#2d1f4c`, mint `#9fe8c5`, burnt orange `#d35b2d`, butter `#f5d576`, dusty pink `#e8a5b8`.

**File target:** `public/assets/social-preview.jpg`, 1280x640, JPEG. Set via repo Settings → General → Social preview once approved.
