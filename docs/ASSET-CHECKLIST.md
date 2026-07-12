# ASSET-CHECKLIST.md — every shipped asset, its owner, and provenance

Nothing ships without a row here. Provenance must be "original," "Jamie-owned," or "licensed (link)."
Status: ☐ todo · ◐ in progress · ☑ done

## Characters

| Asset | Spec | Owner | Provenance | Status |
|---|---|---|---|---|
| Joey (illustrated) | Slender gray, yellow eyes; wheel-rim and saucer-wild production art | ChatGPT imagegen, 2026-07-11 | original | ☑ `public/assets/joey-phoebe-wheel.png`, `joey-phoebe-wilds.png` |
| Phoebe (illustrated) | Curvy tuxedo, white chest/paws; wheel-rim and saucer-wild production art | ChatGPT imagegen, 2026-07-11 | original | ☑ same files |
| AskJamie avatar | Existing cartoon | drop-in from askjamie.bot | Jamie-owned | ☑ (asset exists) |
| Chai Captain motifs | Tumbler, butterfly clip, cardigan palette — silhouette/mood only, no likeness | Claude SVG | original | ☐ |

## Symbols (production sprite atlas; equal 4×4 cells)

| Tier | Assets | Status |
|---|---|---|
| High | mermaid tumbler (iced, straw), midnight butterfly, Glee Mix Tape, crystal cluster | ☑ `public/assets/glee-symbol-atlas.png` |
| Mid | iced chai cup, unlit cinnamon candle, Glee cardigan, Glee Toolbox | ☑ same atlas |
| Low | butterfly hair clip, VHS tape, aurora keepsake, sacred Twelve charm | ☑ same atlas |
| Treats | Chicken Comets (yellow), Salmon Stars (blue), Boogie Bites (navy) | ☑ same atlas |
| Wilds | Joey-saucer and Phoebe-saucer | ☑ `public/assets/joey-phoebe-wilds.png` |
| Legend | UniGlee rainbow butterfly | ☑ symbol atlas |

Generated source prompts were constrained to original, unbranded illustration; no reference photo was uploaded or transformed. Engine IDs for five replaced prototype symbols remain temporarily stable so this art-only pass cannot perturb tested reel weights or payout math.

## UI / scenes

Cascade meter, wheel, Chai Bonus shelf (12 tumblers), Treat Jar, daily wheel, birthday reveal screen, app icon + PWA icon set (192/512/maskable), splash "Tap to open the Toolbox 🧰".

## Audio (all original, Web Audio synth or bundled OGG)

Saucer theremin, cascade arpeggio tiers 1-8, win plucks, fanfare, cat pop-in chirps (Joey boogie riff, Phoebe purr-trill), base loop (dreamy 70s soft-rock progression), free-spin loop (90s-grunge-tinged), UniGlee storm sting. Sound toggle default ON, must be perfect muted.

## Image-generation brief (for ChatGPT workflow — Route 2)

Style anchor for ALL raster art: "retro-bright mid-century cartoon, flat colors with soft grain, warm cream background, palette: burnt orange #d35b2d, teal, butter yellow, dusty pink, midnight navy sky with mint-green stars. Friendly rounded shapes, thick clean outlines, no text, no brands, transparent background, sticker-style."

- Joey prompt seed: "slender gray cat, bright yellow eyes, confident little dance pose, [style anchor]" — generate pose sheet in ONE image for consistency, then cut.
- Phoebe prompt seed: "plump happy tuxedo cat, black with white chest and paws, mid-flop luxurious pose, [style anchor]".
- Consistency rule: generate each character's full pose sheet in a single generation; regenerate whole sheet, never single poses.
- Reference photos: describe markings in words from `private-work/photo-triage.md` notes. Do NOT upload Glee photos to any external service.

## Provenance audit (release gate)

- [ ] Every shipped file traceable to a row above
- [ ] No file derived from `reference-photos/` without D5 approval logged
- [ ] Bundle grep clean: no brand strings (Starbucks, Tazo, Swig, Orijen, Cat Man Doo, Moolah, WMS, SciPlay)
