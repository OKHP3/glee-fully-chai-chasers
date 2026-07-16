# PRD — "Glee-fully Chai Chasers" Project Page on overkillhill.com
**Target Repl:** OverKill-Hill (https://replit.com/t/overkill-hill/repls/OverKill-Hill)
**Author:** Claude (PM) · **Date:** 2026-07-15 · **Version:** 1.0
**Embargo:** Build now on a branch/checkpoint. `DO NOT MERGE TO MAIN / PUBLISH BEFORE 2026-07-17.` Jamie merges personally.

---

## 0. Mission statement (read twice)

Add exactly one new project page to overkillhill.com: `/projects/glee-fully-chai-chasers/`, presenting the game as a FoundRy project and a multi-agent-orchestration case study. The structural template is the existing **Abrahamic Reference Engine** page (`/projects/abrahamic-reference-engine/`) — an embedded GitHub Pages SPA with badges, hero, problem section, live demo, feature cards, principles, "what this is not," origin, and project-info sidebar. Clone that page's structure and components exactly; replace content with the copy in this PRD verbatim.

**Voice law (hard, brand-level):** decision-memo tone. **No em dashes anywhere in page copy.** Use periods, colons, commas, or parentheses instead. Natural contractions. Short standalone lines are intentional style, keep them. The page's final line ends hard: no soft outro, no reader questions.

**Public narrative rule (hard):** the game is a personalized birthday gift built around a genre Glee loves. That is the complete stated motivation. Do not invent, imply, or add any other. Do not name any real casino game, game studio, beverage brand, or pet-food brand anywhere on the page.

## 1. Scope fences

**You may create/modify ONLY:**
- `projects/glee-fully-chai-chasers/index.html` (new)
- The projects index page and nav dropdown (one new entry each, §7)
- `sitemap.xml` if present (one entry)
- `assets/img/projects/chai-chasers/` (new folder, this page's images only)

**You may NOT:** edit other project pages, writings, the manifesto, homepage sections other than nothing (homepage untouched; the FORGE banner is Jamie's manual call), global CSS beyond appended page-scoped rules under a comment, or add frameworks, trackers, or CDN fonts. If the repo has CI/link checks, run and pass them.

## 2. Discovery pass (before any HTML)

1. Open `/projects/abrahamic-reference-engine/index.html` in the repo. Inventory: badge row markup, hero pattern, section/anchor structure, card components, numbered principles component, the live-demo embed block (reload + fullscreen controls), the "Project Info" definition-list sidebar, "Related" list, "On This Page" TOC, meta tag pattern (og:, twitter:, canonical, theme-color `#2a2320`).
2. Reuse those exact components and classes. Your page must be indistinguishable in construction from ARE's.
3. Note nav markup: `Our Projects` dropdown lists each project; the projects index page lists cards.

## 3. Page identity

- **URL:** `https://overkillhill.com/projects/glee-fully-chai-chasers/`
- **Title tag:** `Glee-fully Chai Chasers | OverKill Hill P³™`
- **Meta description (≤160 chars):** `A free cascading-reels birthday game and a working case study in multi-agent AI orchestration. One PM, five tools, one spec, zero real money.`
- **OG/Twitter image:** self-host the game's `social-preview.jpg` (from https://github.com/OKHP3/glee-fully-chai-chasers `public/assets/`) at `assets/img/projects/chai-chasers/social-1280.jpg`. Alt: `Two cartoon cats beside a jewel-toned iced chai under an aurora night sky`.
- **Breadcrumb:** `overkillhill.com / projects / glee-fully-chai-chasers`
- **Badge row:** `Foundry Project` · `Open Source` · `v1.x Active` · `Multi-Agent Build` · `Zero Backend`

## 4. Page structure & final copy (verbatim; ARE component per section)

### 4.1 Hero

- **H1:** `Glee-fully Chai Chasers`
- **Tagline:** `One wife. Two cats. Five AI tools. Zero real money.`
- **Lede:**
  > A free, original, mobile-first cascading-reels game built as a birthday gift, and a working case study in multi-agent orchestration. One human PM directed Claude, Codex, Replit, ChatGPT, and Copilot against a canonical spec, a decision log, and a failing-test math oracle. Browser-only. Fictional currency. No purchases, no ads, no accounts.
- **CTA buttons (ARE button classes):** `Play Chai Chasers` → https://okhp3.github.io/glee-fully-chai-chasers/ · `View on GitHub` → https://github.com/OKHP3/glee-fully-chai-chasers · `Read the Governance Docs` → https://github.com/OKHP3/glee-fully-chai-chasers/tree/main/docs

### 4.2 Section "The Problem" (anchor `#problem`, four ARE-style cards)

1. **Multi-agent work usually produces multi-agent chaos.** `Point five AI tools at one repo and they overwrite each other, re-litigate settled questions, and regress each other's best work. The default outcome is churn wearing a productivity costume.`
2. **"Looks done" is not done.** `The first implementation pass compiled clean and passed 23 unit tests. It also paid out 14% RTP against a 96% spec. Every gate was green except the one that mattered, because that gate did not exist yet.`
3. **Vibes don't survive handoffs.** `"Make it feel like her favorite game" means nothing to the fourth tool in the chain. Canon has to be written down, or it evaporates at every boundary.`
4. **Personal projects deserve engineering discipline too.** `A birthday gift with a hard deadline is exactly where governance pays: no time to rebuild, no budget to waste, one shot at the reveal.`

### 4.3 Section "Live Demo" (anchor `#embed-demo`, ARE embed block adapted)

Keep ARE's reload and "Open Full Screen" controls. One structural change: the game is portrait-first, so the iframe sits in a centered phone-frame container instead of full width.

```html
<div class="chai-phone-frame">
  <iframe src="https://okhp3.github.io/glee-fully-chai-chasers/"
          title="Glee-fully Chai Chasers live demo" loading="lazy"
          allow="autoplay" referrerpolicy="strict-origin-when-cross-origin"></iframe>
</div>
```

```css
/* --- Chai Chasers project page --- */
.chai-phone-frame { width: min(400px, 92vw); aspect-ratio: 390 / 780;
  margin: 0 auto; border-radius: 28px; padding: 10px; background: #1a1f3c;
  box-shadow: 0 8px 40px rgba(0,0,0,.5), inset 0 0 0 2px rgba(245,213,118,.25); }
.chai-phone-frame iframe { width: 100%; height: 100%; border: 0; border-radius: 20px; }
```

**Caption under embed (verbatim):** `Best on a phone. Save state inside this embedded preview may live separately from the full-screen game (browser storage partitioning). Open it full screen for the real experience.`

### 4.4 Section "What It Does" (anchor `#what-it-does`, four cards)

1. **A real cascade engine.** `5x4 board, 40 paylines, tumbling wins, a cascade meter feeding a free-spin ladder, specialty wilds, and a 1-in-400 legendary event. Pure TypeScript, zero DOM imports, fully unit-tested.`
2. **A simulation oracle as the definition of done.** `A 200,000-spin seeded test asserts RTP 96% plus or minus 0.5 and five event-frequency bands. It shipped deliberately red, and no tool was permitted to weaken it. Green meant done. Nothing else did.`
3. **Personalization as product spec.** `Iced chai only. Two illustrated cats with different treat contracts. Keepsakes from one specific shared life. The specificity is the feature; genericness was treated as a defect.`
4. **Zero backend, zero money.** `GitHub Pages static deploy, localStorage saves, fictional currency with an automatic refill. CI gates block private assets and brand strings from every build.`

### 4.5 Section "The Orchestration Pattern" (anchor `#orchestration`; this replaces ARE's Agent Skills section and is the page's centerpiece)

Intro line: `Five tools, one product, no chaos. Here's the actual structure that made that sentence true.`

**Council table (ARE table styling):**

| Tool | Bounded role |
| --- | --- |
| Claude | Canonical spec, engine math, simulation oracle, PM and independent verification |
| Codex / ChatGPT Work | Pre-alpha foundation, product realignment, production art and UI baseline |
| Replit | Bounded implementation sprints under validation-loop prompts |
| GitHub | Single source of truth, CI gates, Pages deployment |
| Notion | Project hub and decision mirror |

**Five governance artifacts (mini-cards, each linking to the live file on GitHub):**

1. **The canonical spec** (`docs/DESIGN-SPEC.md`) `One document outranks every tool's opinion. Amendments are dated and ruled on, never improvised.`
2. **The decision log** (`docs/DECISION-LOG.md`) `Twenty-six settled decisions. Settled questions stay settled; no tool re-litigates a closed one.`
3. **The oracle** (`src/engine/simulation.test.ts`) `A deliberately failing test as a forcing function. It caught a 7x RTP miss and a 35x bonus-frequency miss that a green build would have shipped.`
4. **Layered authority** (`docs/IMPLEMENTATION-BASELINE.md`) `Each tool's strongest layer is protected from every other tool. Nobody regenerates someone else's best work.`
5. **Bounded prompts with validation loops** (`docs/prompts/`) `Every agent got scope fences, a rubric, and a minimum cycle count. "Improve the game" was never a task.`

### 4.6 Section "Principles" (anchor `#principles`, ARE numbered-principles component, five items)

1. **One spec to rule them all.** `Tools propose; the decision log disposes.`
2. **Tests are the product owner at 2 a.m.** `The oracle doesn't get tired, doesn't get charmed by a pretty build, and doesn't ship 14% RTP.`
3. **Bounded work or no work.** `Every agent got one deliverable, one file fence, one owner.`
4. **Generous by design.** `Real slot variance, honest meters, a bust-proof balance, no dark patterns. The fun is the anticipation, not the extraction.`
5. **The gift outranks the architecture.** `Every technical decision lost if it made the product less hers.`

### 4.7 Section "What This Is Not" (anchor `#what-is-not`, ARE list style)

Intro: `This project is not:`
- `a gambling product or a real-money system of any kind`
- `a casino affiliate, promotion, or template for wagering software`
- `affiliated with any game studio, beverage brand, or pet-food brand`
- `a data product (no accounts, no purchases, no ads, no cash-out)`

Closer: `It is a birthday gift with a public repo, and a demonstration that one person can direct a council of AI tools to ship a polished product in nine days.`

### 4.8 Section "Origin" (anchor `#origin`, ARE origin component)

> Chai Chasers went from first research prompt to shippable in nine days of nights and weekends. Spec and mechanics research landed July 9 and 10. The first implementation slice arrived July 10 and promptly failed the brand-new simulation oracle at 14% RTP, which is exactly what the oracle was for. A bounded Round-2 sprint rebuilt the math. A July 12 realignment reset the product fantasy and brought production art. Ship week tuned, froze, and wrapped it. The full narrative lives in [docs/STORY.md](https://github.com/OKHP3/glee-fully-chai-chasers/blob/main/docs/STORY.md); the receipts live in [docs/DECISION-LOG.md](https://github.com/OKHP3/glee-fully-chai-chasers/blob/main/docs/DECISION-LOG.md).

### 4.9 "Project Info" sidebar (ARE definition-list component, exact values)

Status: `Active / v1.x` · Type: `Gift / Foundry Project` · Stack: `Vite + TypeScript + Tailwind, vanilla DOM, Web Audio` · Hosting: `GitHub Pages, zero backend` · License: `MIT` · Cost: `Free` · Suite: `FoundRy` · GitHub: link `OKHP3/glee-fully-chai-chasers` · Live URL: link `okhp3.github.io/glee-fully-chai-chasers` · Maintained by: `OverKill Hill P³`

Sidebar buttons (ARE pattern): `▶ Play Chai Chasers` · `◻ GitHub Repo` · `⚐ Open an Issue`

### 4.10 "Related" (ARE list)

- `The Arcade on glee-fully.tools ↗` → https://glee-fully.tools/arcade/
- `Glee-fully Personalizable Tools ↗` → https://glee-fully.tools/
- `Abrahamic Reference Engine` → /projects/abrahamic-reference-engine/
- `All OverKill Hill Projects` → /projects/

### 4.11 "On This Page" TOC (ARE component)

`The Problem` `#problem` · `Live Demo` `#embed-demo` · `What It Does` `#what-it-does` · `The Orchestration Pattern` `#orchestration` · `Principles` `#principles` · `What This Is Not` `#what-is-not` · `Origin` `#origin`

## 5. Imagery

Self-host only, under `assets/img/projects/chai-chasers/`: the social preview (§3) and optionally one gameplay screenshot Jamie provides post-freeze (leave a clearly-commented `<!-- SCREENSHOT SLOT: idle board 390x844 -->` placeholder if not yet available). No hotlinking, no new AI-generated art, maximum two images. WebP with JPG fallback if other pages do that.

## 6. Accessibility & performance

Match ARE: one h1, ordered headings, keyboard navigation, iframe titled, contrast ≥ 4.5:1, no motion beyond what the site already does. Page weight excluding iframe ≤ 500KB. Lighthouse accessibility ≥ 95, performance ≥ 85 mobile.

## 7. Site integration (only edits outside the new page)

1. **Nav "Our Projects" dropdown:** add `Glee-fully Chai Chasers` after `Abrahamic Reference Engine`, matching existing markup, on every page carrying the nav (or the shared partial).
2. **Projects index page:** add one project card matching existing card markup: title `Glee-fully Chai Chasers`, one-liner `A free cascading-reels birthday game and a live case study in multi-agent AI orchestration.`, link to the new page.
3. **sitemap.xml** (if present): one entry.
4. Homepage FORGE banner: DO NOT touch. Jamie updates it manually at announce time.

## 8. Validation loop (minimum 2 full cycles; log in handoff)

1. Run any repo CI/link checks. Zero failures.
2. Side-by-side screenshots: your page vs ARE at 1440×900 and 390×844. Construction must be indistinguishable (same header, badges, sidebar, TOC, footer).
3. Every link resolves. The glee-fully.tools/arcade/ link may 404 until that page ships; note it in the handoff.
4. **Em-dash grep on the final HTML copy: zero hits** (the character `—` must not appear in any visible text you wrote). This is a brand rule, not a style suggestion.
5. Brand-string grep on visible text: `Moolah`, `Jackpot`, `Starbucks`, `Tazo`, `Swig`, `Orijen`, `SciPlay`, `casino` — zero hits, EXCEPT `casino` exactly twice inside §4.7's disallowed-things list.
6. Embed test: loads, playable, caption present, fullscreen control works.
7. Copy check: §4 text verbatim; the page's last visible line is §4.8's final sentence pattern ending on "receipts live in docs/DECISION-LOG.md" or the sidebar (no soft outro paragraph after Origin).

## 9. Deliverables & handoff

Branch/checkpoint `chai-chasers-project-page`, small conventional commits, plus `CHAI-CHASERS-PAGE-HANDOFF.md` at repo root: changes, validation results per cycle, screenshots, deviations with one-line justifications. DO NOT merge or publish. Jamie merges after 2026-07-17.

## 10. Acceptance criteria

A P³ reader lands, understands in 30 seconds that this is both a gift and a serious orchestration case study, plays the demo, clicks into at least one governance artifact, and leaves with the pattern. The page is structurally a sibling of the Abrahamic Reference Engine page. The copy is this PRD's copy. Zero em dashes. The embargo held.
