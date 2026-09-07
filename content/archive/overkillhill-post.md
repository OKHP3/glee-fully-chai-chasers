**DRAFT — DO NOT PUBLISH BEFORE 2026-07-17**

---

Suggested title: A Council of AIs Built My Wife a Slot Machine

Suggested slug: /writings/council-built-a-slot-machine/

---

I run a council of AI tools the same way I'd run a team of contractors on a house: one architect, several specialists, one owner who signs off before anything ships. Most of my writing on this site is about the protocol. This one has a protocol buried inside a birthday present, which is a better test than any synthetic brief I could invent.

The brief was simple to state and hard to deliver. My wife enjoys cascading-reels games: real paylines, wilds that stack, a meter climbing toward a bonus, and a legendary symbol rare enough to become a story she tells people. I wanted to give her one of her own: not a watered-down puzzle reskin, but the actual mechanical rhythm, rebuilt as a free browser game inside an original world made for her.

That's not a prompt. That's a spec, a math problem, and an art direction brief stacked on top of each other, and no single model does all three well in one pass. (For the record: the finished game is free, fan-made, fictional currency only, no wagering, no purchases, no ads, not affiliated with any casino, game studio, or brand. Now, the actual subject of this post.)

**The org chart**

Claude owned the canonical design document, the game engine's math, and the test suite that would grade everyone else's output. Codex laid the pre-alpha foundation and wrote the first collaboration rules. Replit ran the round-two implementation sprint. ChatGPT handled art direction. GitHub Copilot and Notion filled supporting roles. Every one of them got a bounded artifact to produce, not an open-ended "make it better." A mechanics table. A component. A scene script. A QA pass. Nothing broader than that, ever, because "improve the game" is how you get five incompatible opinions and no shipped product.

The forcing function was a decision log. Every settled call got a dated row with its rationale, and no tool was allowed to re-litigate a decision that already had one. When Codex's early puzzle-collection framing and my slot-machine framing disagreed, I ruled, wrote the ruling down, and every subsequent build read that ruling before touching code. Governance isn't a nice-to-have when the "team" resets its memory between sessions. It's the only thing holding continuity.

**The test that caught the lie**

Here's the part that actually justifies the article. The first full implementation pass looked done. Tests green. TypeScript clean. Engine and UI boundaries respected exactly as specified. And it was completely broken in a way that only a domain-specific oracle would catch.

Return-to-player target: 96%. Actual: 14%. The free-spin trigger was supposed to land once every 35 spins. It landed once every 1,235. An 8-plus cascade mega-win, supposed to happen once every 900 spins, happened zero times in 100,000 simulated spins. And the legendary UniGlee symbol, meant to be a 1-in-400 event worth telling people about, was landing every 5 spins, which turns a legend into wallpaper.

None of that shows up in a green CI run unless you build the oracle yourself. So I did: a seeded 200,000-spin simulation test, checked into the repo, that asserts RTP, free-spin frequency, mega-cascade frequency, and UniGlee frequency all land inside a defined band, and fails the build otherwise. That test doesn't get weakened, widened, or skipped to hit a deadline. It's still running in CI on every push. The fix that followed wasn't a patch, it was a rewrite of the symbol-draw model from independent per-cell randomness to real weighted reel strips with literal stacked wilds, tuned iteratively against that oracle until all six gates went green at once. Every iteration is logged with exact before-and-after numbers, because "trust me, it's better now" isn't a validation strategy.

The presentation had its own version of this problem. Everything technically rendered. It also looked, and I'm quoting my own internal review here, like it was built in 1987: flat emoji glyphs in gray boxes, zero animation, zero anticipation. Nothing architecturally wrong. The render layer was just unfinished, and unfinished work that passes its tests is the most dangerous kind, because nothing is screaming at you to go look.

**What this proves**

Multi-agent orchestration doesn't fail because the models are dumb. It fails because nobody wrote down what "correct" means before the work started, and nobody built a mechanism that catches drift after it starts. A spec that only exists in a chat history isn't a spec. A model that reviews its own output isn't a review. The pattern that worked here: one human owns the ruling, one document is canonical, one test is the oracle, and every tool gets a scope small enough to fail loudly instead of quietly.

The gift ships to my wife on July 17th. She'll never read this article, and she doesn't need to. The game just has to work, and when it didn't, the test told me before she could.
