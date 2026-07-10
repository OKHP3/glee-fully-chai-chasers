# ASSET-CHECKLIST.md — every shipped asset, its owner, and provenance

Nothing ships without a row here. Provenance must be "original," "Jamie-owned," or "licensed (link)."
Status: ☐ todo · ◐ in progress · ☑ done

## Characters

| Asset | Spec | Owner | Provenance | Status |
|---|---|---|---|---|
| Joey (illustrated) | Slender gray, yellow eyes, boogie pose set: idle, strut, boogie, unimpressed, assist | ChatGPT imagegen (brief below) or Claude SVG | original | ☐ |
| Phoebe (illustrated) | Curvy tuxedo, white chest/paws, pose set: idle, flop, treat-party, unimpressed, assist | same | original | ☐ |
| AskJamie avatar | Existing cartoon | drop-in from askjamie.bot | Jamie-owned | ☑ (asset exists) |
| Chai Captain motifs | Tumbler, butterfly clip, cardigan palette — silhouette/mood only, no likeness | Claude SVG | original | ☐ |

## Symbols (one SVG each, 256x256 design grid)

| Tier | Assets | Status |
|---|---|---|
| High | mermaid tumbler (iced, straw), butterfly, mixtape, crystal | ☐ |
| Mid | iced chai to-go cup, cinnamon candle (unlit ok — no hot-drink steam!), cassette, gnome | ☐ |
| Low | mailbox, VHS tape, teapot (cold-brew joke), yarn ball | ☐ |
| Treats | Chicken Comets (yellow pouch), Salmon Stars (blue pouch), Boogie Bites (navy pouch) | ☐ |
| Wilds | Joey-saucer, Phoebe-saucer (stacked variants) | ☐ |
| Legend | UniGlee rainbow butterfly | ☐ |

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
