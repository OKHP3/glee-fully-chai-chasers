**DRAFT — DO NOT PUBLISH BEFORE 2026-07-17**

# The story behind Glee-fully Chai Chasers

## The idea

Glee loves cascading-reels games, especially the Planet Moolah mechanical family: cascading wins, a meter climbing toward free spins, stacked wilds, a legendary rare symbol, and a bonus wheel. It is a genuinely fun style of game, and she is great company to watch play one.

So the idea was simple: what if she had her own? Not a licensed copy or a knockoff, but the same satisfying rhythm rebuilt entirely from scratch and aimed at exactly one person. Real paylines, real cascades, real variance, a free-spin wheel, and a legendary symbol you tell people about when it lands, all running on fictional Glee-coins inside an original world made for her.

That's Glee-fully Chai Chasers. Her favorite kind of game, plus everything she actually loves: two real cats playing themselves, an iced chai ritual (never hot, she'd never forgive us), butterflies, music-night keepsakes, books, PNW aurora, and a warm absurdist voice drawn from Glee's personality.

## The canon, explained

A few details in the game aren't random. They're specific on purpose, because specificity is what makes a gift feel like it was made for one person instead of generated for anyone.

**Iced chai, always.** Glee does not drink hot chai. The game's beverage symbol is an iced-only to-go cup and a jewel-toned mermaid-pattern tumbler with a straw, and there is no steam, kettle, or mug anywhere in the art. This is a hard rule, not a style choice: a hot-chai image anywhere in this product would be a canon violation.

**The chai.** Her old order's twelve pumps mattered because Glee wanted an unmistakably bold chai flavor, not because twelve was mystical. The aligned game keeps at most one chai-specific wink to that history and lets the intensely flavored iced drink—not numerology—drive the quest.

**Bougie Bites, for Joey only.** Joey and Phoebe are Glee's real cats, playing themselves as the game's wild symbols and occasional pop-in visitors. Phoebe is enthusiastic about literally any treat and shows up to help whenever the in-game Treat Jar holds anything at all. Joey is pickier: he's Glee's favorite boy, and in the game (as in life) he only responds to his specific treat, rendered here as "Bougie Bites." If the jar's empty or lacks his treat, he still shows up, judges the board, and leaves with a quip instead of a bonus. That asymmetry isn't a bug; it's the joke, and it's true to the actual cat.

**The mermaid tumbler.** The top-paying symbol in the game is an original illustration of a jewel-toned, mermaid-patterned 24oz tumbler with a straw, standing in for the real one Glee actually drinks from. It's drawn from scratch, not traced from any product, precisely so it can be hers without being anyone's trademark.

## The build, honestly

This wasn't built by one tool in one pass. It was directed by Jamie, working as a one-person product team pointing a small council of AI systems at a shared spec: Claude for the canonical design document, the game math, and the test suite that would grade everyone else's work; Codex for the pre-alpha foundation and the first collaboration rules; Replit for the round-two implementation sprint; ChatGPT for art direction; GitHub Copilot and Notion in supporting roles. Nobody was told to "improve the game." Every request was a bounded artifact: a spec, a mechanics table, a component, a test.

The most honest beat in the whole process is the moment it clearly wasn't working. The first full implementation pass technically ran (tests green, TypeScript clean, architecture boundaries respected) but the actual numbers were nowhere close to the spec: 14% return-to-player against a 96% target, a free-spin trigger 35 times rarer than intended, an 8-plus cascade mega-win that never once happened in 100,000 simulated spins, and a UniGlee legendary symbol landing 75 times too often, which turned the rarest, most special moment in the game into wallpaper. On top of the math, the presentation was flat emoji glyphs in gray boxes with no animation, which got flagged internally, bluntly, as looking like it was "built in 1987."

Rather than patch around it, the fix was structural: a seeded 200,000-spin simulation test (`src/engine/simulation.test.ts`) became the spec oracle, a single source of truth that every future build had to satisfy before it could ship. It checks RTP, free-spin frequency, mega-cascade frequency, UniGlee frequency, and cat pop-in frequency against the bands in the design spec, and it fails the build if any of them drift. Round two replaced the broken per-cell symbol draws with real weighted reel strips carrying literal stacked wilds, gated the UniGlee as its own rare event instead of a regular symbol, implemented the specialty-wild queue, and then tuned the paytable and strip weights iteratively against that oracle until all six gates went green at once. The presentation layer was rebuilt from zero: every symbol became original inline SVG art, the board got a night-garden backdrop with drifting fireflies, and the cascade sequence got a real beam-up-and-drop animation with a rising musical cue per tier. None of this shipped on faith; each cycle is logged with exact before-and-after numbers in `docs/REPLIT-VALIDATION-LOG.md`, and the test that catches regressions is still running in CI on every push.

## The reveal

The game ships quietly ahead of time so it can be tested, but nothing about it is meant to be seen before July 17, Glee's birthday. On first launch on or after that date, it opens with a short scene: two saucers carry a "Happy Birthday, Glee" banner across a night sky, Joey and Phoebe pop out, a chai tumbler descends into a silhouette of her hand, and then one line from Jamie, in his own words, plays before the Chai Chase begins. After that, it's just hers: a game that looks and sounds like the one she already loves, built entirely around the things and creatures she loves most, made for no reason other than that she'd have a great time playing it.

---

## Editorial log

**Cycle 1**

Fact-check pass: feature claims are split between the implemented baseline and the approved roadmap in `docs/IMPLEMENTATION-BASELINE.md` and `docs/GAME-REALIGNMENT-2026-07-12.md`. Confirmed in the current code: cascades, cascade meter/ladder, saucer-cat wilds, Treat Jar, illustrated cat pop-ins, AskJamie wheel/free-spin flow, UniGlee takeover, reduced motion, sound setting, manifest, and icons. The Chai Quest chapters, 100–500-spin UniGlee marathon, Birthday Reveal, Daily Bonus Wheel, milestone scenes, service-worker offline proof, and final music loops remain explicit future work until code and QA evidence exist.

Voice pass: README checked against warm-and-clear intent; STORY.md checked as narrative, including the honest "1987" presentation beat and the quantified math failure, both drawn verbatim from `docs/ASSESSMENT-REPLIT-SLICE-1.md` and `docs/REPLIT-VALIDATION-LOG.md` rather than invented. Both files reviewed for Jamie's standing no-em-dash rule; all em dashes replaced with periods, colons, semicolons, or parentheses.

Privacy pass: no photos of Glee, no surname beyond what's already public in the repo (none used), no home location, no health or financial detail. Cat names and personalities used only to the extent already public in `docs/CANON.md`. "Uncle-figure co-pilot" framing for AskJamie kept generic, no private detail attached.

**Cycle 2**

Fact-check pass: re-verified RTP, free-spin, and rate figures against `docs/REPLIT-VALIDATION-LOG.md` Cycle 1 final numbers (RTP 95.9%, free spins 1-in-37, 8+ cascade 1-in-922, UniGlee 1-in-403, cat pop-in 1-in-32.4) rather than the earlier target table, since STORY.md's build narrative discusses achieved results, not just spec targets. Confirmed disclaimer language (free, fan-made, fictional currency, no wagering, no purchases, not affiliated with any casino/studio/brand) present in both README.md and this document.

Voice pass: re-read both documents end to end for tone drift. Trimmed anywhere language edged toward sentimentality per the "no tidy resolutions that undercut the weight" instinct extended here to keep the reveal section warm but not saccharine. Re-grepped both files for em dashes: zero matches.

Privacy pass: final read confirms nothing here would embarrass Glee if she read it herself before the reveal. No content held back beyond the standard embargo.
