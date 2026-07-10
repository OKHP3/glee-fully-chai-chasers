# Collaborative Vision: Glee-fully Iced Chai Chasers

**Status:** proposal for cross-tool review  
**Purpose:** provide a common product direction before parallel build work begins  
**Decision owner:** Jamie, with Glee's delight and comfort as the final quality bar

## 1. The promise

Build a small, public, browser-based birthday game that lets Glee enjoy the *feeling* of a bright, escalating casino-style cascade game without money, purchases, loss pressure, casino branding, or copied assets.

The game is an original Glee-fully experience: **iced chai, Joey, Phoebe, butterflies, warm absurdity, and a friendly AskJamie-style co-pilot**. Its job is to create repeatable moments of delight, not to simulate gambling.

## 2. Non-negotiables

| Keep | Do not include |
| --- | --- |
| Touch-first, mobile-browser play | Real money, wagering, purchases, ads, or a cash-out system |
| Original characters, art, copy, sound, and game rules | Casino/game logos, titles, art, reel strips, UI layouts, audio, or code |
| Generous, understandable progress | Punishing scarcity, deceptive near-misses, or loss-chasing prompts |
| Browser-local saves only | Accounts, backend, personal-data collection, or tracking by default |
| Glee-fully warmth and retro-bright style | Glee's actual photo or likeness in the public game without her clear approval |

The reference slot family is an *emotional/mechanical study* only: a cascade can lead to a visible, celebratory milestone. We must independently implement the rules, visual language, characters, sound, terminology, and board treatment.

## 3. The playable fantasy

Glee is the unseen **Chai Captain**: the person whose joy powers the universe, without using a portrait. Joey and Phoebe are the on-screen heart of the game.

- **Phoebe:** curvy black-and-white tuxedo cat; appears for any treat and delivers an enthusiastic, affectionate assist.
- **Joey:** slender gray cat with yellow eyes; Glee's extra-special “boogie cat” gets a distinct, celebratory assist.
- **Iced chai ritual:** a tall, straw-forward, original jewel-toned tumbler; never hot chai and no copied cup or beverage branding.
- **AskJamie co-pilot:** an original, consented companion character inspired by the existing friendly robot language; he provides gentle prompts, not a competing protagonist.

The board should feel like a tiny midnight garden/constellation: iced chai tumblers, butterflies, yarn, toolboxes, stars, Chicken Comets, and Salmon Stars. The visual direction is retro-bright and warmly theatrical rather than photoreal or casino-floor literal.

## 4. Core loop

1. Player taps **Sparkle!**.
2. A board settles; qualifying groups clear and cascade in a legible, energetic sequence.
3. The player earns **Chai Sparks**, a non-monetary progress measure.
4. Joey or Phoebe may join the sequence with an earned assist. Their appearances can be surprising, but milestone progress must remain fair and predictable.
5. Reaching a visible milestone opens a short positive scene: *Iced Chai Break*, *Butterfly Burst*, *Cat Constellation*, or *Glee Mode*.
6. Scene rewards are collection items, funny lines, and visual unlocks—not currency or odds-based prizes.

### MVP mechanics

- One polished board, reliable cascade animation, and one-tap play.
- Deterministic or deliberately generous matching rules; no concealed payout math.
- Three cat assists: Phoebe treat party, Joey boogie-cat boost, and a shared cat celebration.
- Four milestone scenes selected by clear progress, not paid/random access.
- Local-only persistence for settings, unlocked scenes, and best cascade.
- Sound toggle, reduced-motion behavior, accessible labels, and restart/reset controls.

## 5. Technical contract

- **Stack:** Vite + React + TypeScript + Tailwind; static SPA.
- **Hosting:** GitHub Pages or equivalent static hosting; no required backend.
- **Storage:** versioned `localStorage` only; offer a reset action.
- **Performance:** target a smooth recent iPhone experience; no large initial asset bundle; use WebP for display assets and PNG only where transparency/reference quality needs it.
- **Responsive design:** portrait first at 390 × 844, then desktop as a pleasant secondary layout.
- **Public assets:** only assets with known provenance. Keep source/reference photos separate from shipped files.

## 6. Asset and privacy policy

- Reference photos are a private visual brief unless Jamie explicitly marks an exact derivative as public-ready.
- Generated cat characters should be original illustrations informed by the pets' markings and personalities, not cutout photos.
- Do not use Glee's face. An abstract Chai Captain—colors, accessories, silhouette, or mood—is the right substitute.
- Do not use TV clips, recorded music, brand packaging, product logos, or casino media. Use original or appropriately licensed sound and art.
- HEIC conversions are stored as reusable project references; a PNG-backed SVG is a file-format compatibility wrapper, not true vector art.

## 7. Suggested division of work

This is a suggested split, not an assignment. Pick one owner per deliverable before parallel work starts.

| Workstream | High-value deliverable | Good-fit tools/services |
| --- | --- | --- |
| Product alignment | Approve this vision, settle open decisions, maintain a one-page decision log | Jamie + Notion |
| Game design | Exact cascade rules, assist triggers, milestone pacing, test cases | Codex / Claude / ChatGPT Work |
| Art direction | Original visual brief, cat character sheets, tumbler and symbol asset list | Claude / ChatGPT image workflows / Replit |
| Writing and delight | Character lines, scene copy, birthday reveal, accessibility text | Claude / ChatGPT Work |
| Implementation | Components, local state, animation, sound controls, responsive layout | Codex / GitHub Copilot / Replit |
| Quality and release | Mobile testing, accessibility, build checks, GitHub Pages workflow | Codex / GitHub / GitHub Copilot |

### Token-efficient rule

Do not ask multiple systems to build the same component. Ask each system for a bounded artifact: a mechanics table, a visual brief, a scene script, an implementation patch, or a QA checklist. Add results to the decision log, choose one direction, then implement once.

## 8. Two-day build sequence

1. **Align (first):** review this document; choose the board rule, art direction, and public-asset policy.
2. **Playable core:** build and test one board, cascades, Spark progress, and the Sparkle control on iPhone sizing.
3. **Personality pass:** add Joey/Phoebe assists, iced-chai ritual, AskJamie co-pilot, and one celebratory scene.
4. **Gift pass:** add three additional scenes, collection/progress, sound toggle, reduced motion, and birthday reveal.
5. **Release pass:** inspect mobile and desktop, validate accessibility/performance, ensure no private/copyrighted assets ship, deploy static site.

## 9. Acceptance criteria

The release is ready when:

- Glee can open it on an iPhone and understand what to tap without instructions.
- Every tap leads to a positive, legible outcome; no money or purchase language exists anywhere.
- Joey, Phoebe, and iced chai feel specific to her.
- The project is visibly Glee-fully, but not confusingly associated with any casino game or beverage/pet-food brand.
- Local progress survives a refresh and can be reset.
- No source photo, unlicensed media, personal likeness, or accidental private file is deployed.
- The app builds, has no console errors, respects reduced motion, and is tested at mobile and desktop widths.

## 10. Review questions for the team

1. Is “cascade puzzle/collection game” the right primary framing, or should the board be less slot-like?
2. What degree of randomness feels joyful without recreating the compulsion pattern the gift is meant to avoid?
3. Which three or four milestone scenes would most delight Glee?
4. Should the public build ship with no real-photo derivatives at all, with a separate private birthday build for any personal material?
5. What is the minimal delightful MVP that can be polished by the birthday deadline?

## 11. How to collaborate on this document

Do not silently replace this proposal. Add a dated section or link to a companion document with:

- the decision being challenged;
- the proposed alternative and why;
- implementation impact; and
- a recommendation for Jamie to approve.

After Jamie chooses a hybrid direction, replace the proposal status with **approved**, create a small prioritized task list, and assign each task to one service/tool owner.
