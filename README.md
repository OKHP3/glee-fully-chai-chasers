# Glee-fully Chai Chasers 🎰🦋

**A birthday gift, playable in a browser.**

One-line hook: her own chai-chase cascade game, starring two cats, a mermaid tumbler, and keepsakes only she'll recognize.

**[▶ Play now](https://okhp3.github.io/glee-fully-chai-chasers/)** (best on an iPhone, added to your home screen)

`[SCREENSHOT: idle board, night-garden backdrop, full reel grid]`
`[SCREENSHOT: mid-cascade win with beam-up animation]`
`[SCREENSHOT: AskJamie wheel / free-spin aurora board]`

---

## The story, short version

Glee loves cascading-reels games: the kind with a meter that climbs toward something, wilds that stack, and a legendary symbol you tell people about when it lands. So Jamie built one especially for her.

Her game was created from scratch with the love turned all the way up. Real paylines, real cascades, a free-spin wheel, and a rare legendary symbol, all reimagined inside the Glee-fully universe with fictional Glee-coins, iced chai, butterflies, music-night keepsakes, books, PNW aurora, and two extremely opinionated cats.

It was built by a council of AI tools directed by her husband, Jamie, working from a canonical spec, a decision log, and a test suite that wouldn't let the math ship dishonest. That process is documented in `docs/` for anyone curious how a solo human can direct multiple AI systems toward one coherent product. This repo is as much a portfolio piece in AI project management as it is a birthday card.

## What it is

Five reels, four rows, 25 paylines. Tap **SPARKLE!** and the board cascades: winning symbols beam up, new ones drop in, and it keeps going until the board goes quiet. A firefly meter tracks your cascade streak; fill it and Joey's uncle-figure co-pilot AskJamie spins a wheel to send you into free spins. Along the way, Joey and Phoebe chase the intensely flavored iced chai through music, books, butterflies, aurora, and shared-life keepsakes. The rare UniGlee rainbow butterfly turns the night mythic when it appears. The balance is deliberately generous, and AskJamie cheerfully finds more Glee-coins under the couch whenever they are needed.

## Who built it

Jamie directed a council of AI tools, each with a bounded job. Claude wrote the canonical spec, the game engine's math, the test oracle, and the story you're reading now. Codex laid the pre-alpha foundation and the collaboration rules. Replit implemented the round-2 build against a simulation test that graded its own math. ChatGPT contributed art direction. GitHub Copilot and Notion rounded out review and documentation. Nobody merged unreviewed work, and nothing shipped until the numbers matched the spec. The full governance trail (decision log, canonical spec, validation cycles) lives in `docs/`.

## Feature tour

**Cascades.** Wins beam up into saucers, the board compresses, new symbols drop, and it re-evaluates until nothing's left to clear. Each cascade tier plays a rising note; by cascade four it's a small musical event.

**The cascade meter.** A jar of fireflies tracks your streak. Four or more cascades in one spin sends you to free spins; the ladder climbs from there.

**Saucer-Cat Wilds.** Joey and Phoebe appear as stacked wild symbols on the reels, up to six or seven high, substituting for anything.

**The Treat Jar.** Land Chicken Comets, Salmon Stars, or the rare Boogie Bites and they land in a persistent jar. Full jar, happier cats.

**Cat pop-ins.** Roughly once every 30 spins, Phoebe or Joey wanders across the board. Phoebe helps for any treat in the jar. Joey, Glee's favorite boy, only shows up for Boogie Bites. If the jar's empty, you get an unimpressed tail flick and a quip instead.

**Joey & Phoebe's Sparkle Wheel.** Free spins open with the cats perched on a jewel-lit wheel: wild multipliers, a Keepsake Constellation of mega-symbols, or an iced-chai wild rain.

**Chai Quest chapters — in development.** Future additions rotate through Phoebe's treat and lap quests, Joey's laundry “help,” music-night trails, and aurora book moments instead of repeating one generic bonus screen.

**UniGlee.** The legendary rainbow-butterfly event lives inside Jamie's permitted 1-in-300 to 1-in-1,000 band. Its next engine pass expands it into a 100–500-spin mythic marathon of varied cat and keepsake chapters, with the math simulation required to stay honest.

## How it was built

This repo runs on a written constitution, not vibes. `docs/DESIGN-SPEC.md` is the canonical game spec; every feature above traces back to a numbered section there. `docs/DECISION-LOG.md` records every settled call with its rationale, so no collaborator re-litigates a resolved question. `docs/CANON.md` locks down the facts that make this Glee's game and nobody else's (iced chai only, the cats' personalities, and which cat gets which treat). `docs/IP-GUARDRAILS.md` sets the legal guardrails everyone builds inside.

The math had to earn its numbers. `src/engine/simulation.test.ts` runs a 200,000-spin seeded simulation against the spec's target frequencies (RTP, free-spin rate, mega-cascade rate, UniGlee rate) and fails the build if any of them drift outside their band. The first implementation pass shipped at 14% RTP and a free-spin rate 35 times too rare; the test oracle caught it, and a documented validation loop (`docs/REPLIT-VALIDATION-LOG.md`) tuned the engine until every gate went green. That test still runs in CI on every push. It doesn't get weakened to make a deadline.

## Play it

Open the link on your phone, then use your browser's "Add to Home Screen" option; it installs as a PWA and works offline after the first load. Progress saves locally in your browser (no account, ever); a reset option lives in Settings if you want a clean start. Sound and reduced-motion toggles are both there too.

## The disclaimer

Free. Fan-made. Fictional currency only, saved in your browser. **No wagering. No purchases. No ads. No accounts. No tracking.** Not affiliated with any casino, game studio, or brand. This is a birthday gift, not a product.

## Credits

**Glee**: the muse, the reason, the whole point.
**Joey and Phoebe**: the real cats behind the reel wilds, playing themselves.
**Jamie**: director, PM, and the one who wrote the birthday message himself.
**The council of AI tools**: Claude, Codex, Replit, ChatGPT, GitHub Copilot, and Notion, each doing one bounded job well, none of them doing it alone.

For the build process and coordination rules, start at [`AGENTS.md`](AGENTS.md). For the long-form story behind the game, see [`docs/STORY.md`](docs/STORY.md).

---

*Inspired by Glee's sparkle, fueled by iced chai, and loaded with facts-on-facts. Made for Glee, down to the last butterfly.*
