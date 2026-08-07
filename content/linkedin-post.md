**DRAFT — DO NOT PUBLISH BEFORE 2026-07-17**

---

My wife loves cascading-reels games: real paylines, stacked wilds, a meter that climbs toward a bonus, and the kind of rare symbol that becomes a story when it lands. So for her birthday I directed a council of AI tools to build one especially for her.

Same satisfying mechanics and anticipation, reimagined with her cats, iced chai, butterflies, and a legendary rare symbol worth telling people about. It is a free, fan-made browser game with fictional Glee-coins, no purchases, no ads, no accounts, and no affiliation with any casino, game studio, or brand.

The interesting part isn't the gift. It's how a team of five different AI tools with no shared memory built one coherent product without me writing a line of game code myself. Claude owned the canonical spec and the math. Codex laid the foundation. Replit ran the implementation sprint. ChatGPT handled art direction. Everyone got a bounded task, never "make it better," always a specific deliverable against a spec I'd already approved.

The best proof point: the first build looked done. Tests green, clean architecture, nothing obviously wrong. It was still 7x off on payout rate and the marquee bonus was landing 75 times too often. Nobody caught that by reading code. A 200,000-spin simulation test caught it, because I'd built the oracle before I trusted the output. That test still runs on every push, and it doesn't get weakened to hit a deadline.

Multi-agent orchestration doesn't fail because the models are weak. It fails when nobody writes down what "correct" means before the work starts. Write the spec, build the oracle, give each tool a narrow enough job to fail loudly. That's the whole method, birthday gift or otherwise.

The game ships to my wife on July 17th. She doesn't know any of this happened. She just gets to open it and play.

#AIagents #ProductManagement #SoftwareArchitecture
