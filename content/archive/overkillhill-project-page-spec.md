# OverkillHill.com Project Page Spec — Glee-fully Chai Chasers

> `DRAFT — DO NOT PUBLISH BEFORE 2026-07-17`
> Target: `overkillhill.com/projects/glee-fully-chai-chasers/` in the OKHP3/OverKill-Hill repo.
> Template: mirror the Abrahamic Reference Engine project page structure exactly (badges, hero, problem, live embed, feature cards, principles, what-this-is-not, origin, project-info sidebar, related, on-page TOC). ARE is the closest sibling: both are embedded GitHub Pages SPAs.
> Voice: OKH decision-memo. No em dashes anywhere. Contractions natural. Short standalone lines are intentional. Page copy ends hard.

## Badges row

`Foundry Project` · `Open Source` · `v1.x Active` · `Multi-Agent Build` · `Zero Backend`

## Hero

**H1:** Glee-fully Chai Chasers

**Tagline:** One wife. Two cats. Five AI tools. Zero real money.

**Lede (3 lines max):** A free, original, mobile-first cascading-reels game built as a birthday gift, and a working case study in multi-agent orchestration. One human PM directed Claude, Codex, Replit, ChatGPT, and Copilot against a canonical spec, a decision log, and a failing-test math oracle. Browser-only. Fictional currency. No purchases, no ads, no accounts.

**CTA buttons:** [Play Chai Chasers](https://okhp3.github.io/glee-fully-chai-chasers/) · [View on GitHub](https://github.com/OKHP3/glee-fully-chai-chasers) · [Read the Governance Docs](https://github.com/OKHP3/glee-fully-chai-chasers/tree/main/docs)

## Section: The Problem (ARE's "Reference Gap" analog — 4 cards)

1. **Multi-agent work usually produces multi-agent chaos.** Point five AI tools at one repo and they overwrite each other, re-litigate settled questions, and regress each other's best work. The default outcome is churn wearing a productivity costume.
2. **"Looks done" is not done.** The first implementation pass compiled clean, passed 23 unit tests, and paid out 14% RTP against a 96% spec. Every gate was green except the one that mattered, because that gate didn't exist yet.
3. **Vibes don't survive handoffs.** "Make it feel like her favorite game" means nothing to the fourth tool in the chain. Canon has to be written down, or it evaporates at every boundary.
4. **Personal projects deserve engineering discipline too.** A birthday gift with a hard deadline is exactly the environment where governance pays: no time to rebuild, no budget to waste, one shot at the reveal.

## Section: Live Demo (embed)

Same reload/fullscreen chrome as ARE, with one structural change: the game is portrait-first (390x844), so the iframe sits in a centered phone-frame container (~400px wide, fixed aspect) rather than full-width. Prominent "Open Full Screen" CTA above the fold.

**Required caveat line under the embed:** "Best on a phone. Save state inside this embedded preview may be separate from the full-screen game (browser storage partitioning); open full screen for the real experience."

## Section: What It Does (feature cards, 4)

1. **A real cascade engine.** 5x4 board, 40 paylines, tumbling wins, a cascade meter feeding a free-spin ladder, specialty wilds, and a 1-in-400 legendary event. Pure TypeScript, zero DOM imports, fully unit-tested.
2. **A simulation oracle as the definition of done.** A 200,000-spin seeded test asserts RTP 96% ±0.5 and five event-frequency bands. It shipped deliberately red and no tool was permitted to weaken it. Green meant done. Nothing else did.
3. **Personalization as product spec.** Iced chai only. Two illustrated cats with different treat contracts. Keepsakes from one specific shared life. The specificity is the feature; genericness was treated as a defect.
4. **Zero backend, zero money.** GitHub Pages static deploy, localStorage saves, fictional currency with an automatic refill. CI gates block private assets and brand strings from every build.

## Section: The Orchestration Pattern (replaces ARE's "Agent Skills" — this is the case-study meat)

Table of the council with bounded roles: Claude (canonical spec, engine math, simulation oracle, PM/verification), Codex/ChatGPT Work (pre-alpha foundation, realignment, production art + UI baseline), Replit (bounded implementation sprints under validation-loop prompts), GitHub (single source of truth + Pages CI/CD), Notion (project hub).

Followed by the five governance artifacts as mini-cards, each linking to the real file in the repo:
1. **Canonical spec** (DESIGN-SPEC.md): one document outranks every tool's opinion.
2. **Decision log** (DECISION-LOG.md): S1-S26; settled questions stay settled.
3. **The oracle** (simulation.test.ts): a failing test as a forcing function. It caught a 7x RTP miss and a 35x bonus-frequency miss that a green build would have shipped.
4. **Layered authority** (IMPLEMENTATION-BASELINE.md): each tool's strongest layer is protected from every other tool.
5. **Bounded prompts with validation loops** (docs/prompts/): every agent got scope fences, a screenshot/simulation rubric, and a minimum cycle count.

## Section: Principles (5, ARE-style)

1. **One spec to rule them all.** Tools propose; the decision log disposes.
2. **Tests are the product owner at 2 a.m.** The oracle doesn't get tired, doesn't get charmed by a pretty build, and doesn't ship 14% RTP.
3. **Bounded work or no work.** Every agent got one deliverable, one file fence, one owner.
4. **Generous by design.** Real slot variance, honest meters, bust-proof balance, no dark patterns. The fun is the anticipation, not the extraction.
5. **The gift outranks the architecture.** Every technical decision lost if it made the product less hers.

## Section: What This Is Not

Not a gambling product. Not a casino affiliate. Not a template for real-money gaming. Not affiliated with any game studio, beverage brand, or pet-food brand. No wagering, purchases, ads, accounts, or cash-out exists anywhere in it. It's a birthday gift with a public repo, and a demonstration that one person can direct a council of AI tools to ship a polished product in nine days.

## Section: Origin

Short build chronology (keep it tight, five beats): spec and research (July 9-10) · first slice and the oracle catch (July 10) · Round-2 sprint (July 11) · the Chai Chase realignment and production art (July 12-14) · ship week (July 15-17). Link to `docs/STORY.md` for the narrative and `docs/DECISION-LOG.md` for the receipts.

**S17 compliance check for whoever builds this page:** the public motivation is "a personalized birthday gift built around a genre Glee loves." Full stop. No other motivation may be stated or implied anywhere on the page.

## Project Info sidebar

Status: Active / v1.x · Type: Gift / Foundry Project · Stack: Vite + TypeScript + Tailwind, vanilla DOM, Web Audio · Hosting: GitHub Pages, zero backend · License: MIT · Cost: Free · Suite: FoundRy · Repo: OKHP3/glee-fully-chai-chasers · Live: okhp3.github.io/glee-fully-chai-chasers

## Related links

Glee-fully.tools Arcade page (once live) · OKHP3/Glee-fullyTools · Mermaid Theme Builder · All OverKill Hill Projects

## Meta

- **meta-description (OKH voice, ≤160 chars):** "A free cascading-reels birthday game and a working case study in multi-agent AI orchestration. One PM, five tools, one spec, zero real money."
- **OG image:** reuse the game's social-preview.jpg (1280x640) from the game repo.
- **Nav:** add under Our Projects after Abrahamic Reference Engine.

## Publish checklist

- [ ] Embargo lifted (Glee has the gift, 07/17+)
- [ ] Final screenshots captured from the shipped build
- [ ] Play link verified live; embed tested in Safari and Chrome, desktop and mobile
- [ ] Em-dash grep on final HTML copy: zero hits
- [ ] S17 narrative check: one motivation only
- [ ] Cross-link added from the game README and the glee-fully.tools Arcade page
