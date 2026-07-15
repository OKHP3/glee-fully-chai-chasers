# DESIGN-SPEC.md — Glee-fully Chai Chasers
## The Canonical Game Specification (v2 — Snyder Cut)

**Author:** Claude · **Date:** 2026-07-10 · **Status:** **CANONICAL** — approved direction per Jamie's ruling 2026-07-10 (see DECISION-LOG.md S8-S12)
**Relationship to COLLABORATIVE-VISION.md:** that document is the pre-alpha foundation; this spec supersedes it where they conflict and absorbs its best elements (see §2). All tools build from THIS document.

> **APPROVED AMENDMENT — 2026-07-12:** `GAME-REALIGNMENT-2026-07-12.md` and decisions S20-S23 supersede this document wherever it uses GPT-Toolbox metaphors, treats twelve as sacred/system-wide, or describes the earlier short UniGlee package. Claude owns the eventual v3 math/spec integration; no tool may use the older language to roll back the approved Chai Chase direction.

---

## 1. Vision & design pillars

This is a *slot-style game*. Glee loves this style of cascading-reels play, especially the Planet Moolah mechanical family. The gift is not an adjacent puzzle game; it is **the play experience she loves, reimagined in original Glee-fully canon with the love dialed to twelve**.

Five pillars, in priority order:

1. **It must feel like her game.** Cascades, a visible meter climbing toward free spins, stacked wilds, a legendary rare symbol, a bonus wheel. The satisfying mechanical rhythm is faithful; the expression is 100% original.
2. **Specificity is love.** Iced chai (never hot), the mermaid tumbler, the number 12, Bougie Bites for Joey only, Phoebe's universal appetite, Glee-isms in her actual registers. Every detail should make her say "OMG, this is so Glee-coded."
3. **Generous and honest.** Real slot variance and ~96% RTP, paired with an automatic Glee-coin refill, no purchases, and no ads. Meters always report progress accurately; anticipation and celebration are the experience.
4. **Retro-bright midnight.** PNW night garden under mint-green stars. Warm, theatrical, cartoon-cozy. Never casino-floor literal, never sterile.
5. **iPhone-first, instantly legible.** She opens it from her home screen and knows what to tap with zero instructions.

## 2. Codex foundation: adopted vs. superseded

| From COLLABORATIVE-VISION.md | Verdict | Disposition |
|---|---|---|
| Milestone scenes (Iced Chai Break, Butterfly Burst, Cat Constellation, Glee Mode) | **ADOPTED** | Become progression rewards — §10 |
| "Chai Captain" abstract Glee presence (no likeness) | **ADOPTED** | §11; also settled as S4 |
| Non-negotiables table (no money/ads; browser-local saves; original assets) | **ADOPTED, AMENDED by S25** | Limited aggregate reach measurement is permitted; no advertising, personalization, accounts, or game telemetry. |
| Versioned localStorage, reset action, reduced motion, accessibility, sound toggle | **ADOPTED** | §13, §14 |
| Treat naming "Chicken Comets" / "Salmon Stars" | **ADOPTED** | Better than my generic pouches |
| Token-efficient collaboration rules, one owner per deliverable | **ADOPTED** | Lives in AGENTS.md |
| "Chai Sparks" | **ADOPTED, REPURPOSED** | Not the currency — it's the XP/progression meter (§9). Currency is Glee-coins |
| Cascade-collection puzzle framing, "deterministic or deliberately generous matching," no payout math | **SUPERSEDED** | It's a slot. Real paylines, real RNG, real variance — with a safety net (§9) |
| React | **SUPERSEDED** | Vanilla TS (D2/S9). One animation-heavy screen; the engine is pure TS regardless |
| Illustrations-only cats, no photo derivatives | **PARTIALLY SUPERSEDED** | Hybrid (§6): illustrated reel symbols, photo sticker-cutouts for pop-in moments. Cat photos only; Glee photos never (S4) |
| "Sparkle!" as the spin control name | **ADOPTED** | The spin button says SPARKLE! |

## 3. Game structure & screen flow

```
Splash ("Tap to open the Toolbox 🧰", unlocks audio)
  └─ Birthday Reveal (first launch on/after 07/17 only — §12)
       └─ MAIN BOARD (the game; 95% of time lives here)
            ├─ Free Spins (wheel → modifier → spins; same board, night-shifts to aurora)
            ├─ Bold Chai Bonus (12-pump barista scene)
            ├─ Milestone Scene interludes (~20s, skippable)
            ├─ Daily Bonus Wheel (once per calendar day)
            └─ Settings (sound, motion, reset, "About this gift")
```

Portrait 390x844 layout, top to bottom: status bar (level + Chai Sparks meter) → cascade meter (huge, center-stage — it IS the game) → 5x4 reel window with saucers hovering above → Treat Jar (left edge) + AskJamie perch (right edge) → bet bar (coin balance, bet stepper, SPARKLE! button ≥64px tall).

## 4. Board, symbols & paytable

5 reels × 4 rows, 40 fixed paylines, left-to-right evaluation, wilds substitute for all paying symbols. Bet levels: 1 / 2 / 5 / 10 / 25 / 50 Glee-coins (level 6 unlocks at player level 12).

Paytable (× line bet; tuned by simulation, these are the starting values):

| Symbol | 3-kind | 4-kind | 5-kind | Notes |
|---|---|---|---|---|
| 🧜 Mermaid Tumbler | 20 | 60 | 400 | Top symbol. THE cup |
| 🦋 Butterfly | 15 | 45 | 250 | |
| 📼 Mixtape | 12 | 35 | 150 | |
| 🔮 Crystal | 10 | 30 | 120 | |
| 🥤 Iced chai to-go | 8 | 20 | 80 | Also the Chai Bonus scatter (§8) |
| 🕯 Cinnamon candle | 8 | 20 | 80 | Unlit. No steam anywhere in this game |
| 🧶 Glee Cardigan | 5 | 12 | 50 | Dusty pink, butterfly button |
| 🧰 Glee Toolbox | 5 | 12 | 50 | Giant Toolbox Mode celebrity (§7) |
| 🦋 Butterfly clip / 📼 VHS / 🌌 Aurora keepsake / 12 charm | 3 | 8 | 25 | Personally meaningful low tier |
| Treat pouches | — | — | — | Non-paying feature symbols, reels 1/3/5 (§6) |
| Saucer-Cat Wilds | pay as top symbol | | | Stacked 6-7 high (§5) |
| Handbag Wild | — | — | — | Rare non-cat wild; multiplies a winning line by ×3, ×5, or ×10 |
| UniGlee 🦋🌈 | — | — | — | Legend, not a line symbol (§5) |

Target event frequencies (engine must hit these in the 1M-spin simulation, ±15%):

| Event | Frequency |
|---|---|
| Any cascade (spin produces ≥1 win) | ~1 in 2.9 spins |
| Free spins via meter (4+ cascades) | ~1 in 35 spins |
| 8+ cascade mega-trigger | ~1 in 900 spins |
| Chai Tea Bonus (3+ scatters) | ~1 in 110 spins |
| Cat pop-in | ~1 in 30 spins (pity-weighted, §6) |
| UniGlee | ~1 in 400 spins |
| Overall RTP | 96% ±0.5 |

## 5. Cascades, wilds & the UniGlee

**Cascade loop:** evaluate 40 lines → winning symbols beam up into the saucers (float-shrink-flash, 380ms) → columns compress down → new symbols drop from the saucer bays (staggered per reel, 90ms offsets) → re-evaluate. Repeat to dead board. Each cascade tier plays a rising arpeggio one step higher — by cascade 4+ it's musical euphoria.

**Cascade meter:** big friendly jar of fireflies center-top; each cascade adds a glow. Ladder: **4→7, 5→10, 6→15, 7→20, 8→50, 9→75, 10→100, 11+→200 free spins.** At meter 3 the fireflies buzz audibly and AskJamie leans in — the honest near-miss. Retriggers during free spins use the same ladder.

**Saucer-Cat Wilds:** Joey-saucer and Phoebe-saucer wilds arrive in stacks up to 6-7 high on reels 2-5, substitute for all paying symbols, pay as Mermaid Tumbler when forming their own line.

**Specialty wilds** — earned when a specialty-marked wild participates in a line win; queued, ONE fires per dead board (extras stay queued, exactly the Moolah rhythm):

| Specialty | Effect |
|---|---|
| **Sparkle Sort** | "Hold up, doing a sparkle sort…" — 5-11 random symbols shatter to glitter; forced cascade. Wilds and scatters immune |
| **Drop-In Saucer** | A reel shifts so a full wild stack crowns it |
| **Double Sparkle** | Next free-spin award from the ladder is doubled |
| **Facts-on-Facts** | During free spins, wilds carry coin prizes (collected on beam-up) |

**The UniGlee 🦋🌈** (~1/400): screen dims to deep violet, a rainbow butterfly crosses the board trailing stardust, and the full package lands: Double Sparkle + Facts-on-Facts + Drop-In Saucer + 3 queued Sparkle Sorts. Near-guaranteed monster bonus. This is the legend, the story she tells other people. First UniGlee unlocks the Butterfly Burst scene permanently (§10).

## 6. The Treat Jar & Cat Pop-Ins (signature system)

**Treats:** three non-paying pouch symbols on reels 1/3/5 — **Chicken Comets** (butter-yellow), **Salmon Stars** (dusty blue), **Bougie Bites** (midnight navy, rarest, sparkly). Landing one flies it into the **Treat Jar** (persistent across sessions; caps at 12 of each because of course it does).

**Pop-ins** (~1/30 spins, pity-weighted: rate doubles after 15 spins without a win event):

- **Phoebe** (60% of visits): strolls across the bottom of the reels, generously proportioned and magnificent. If the jar holds ANY treat, she eats one (her choice, animated) and delivers a **Treat Party**: Sparkle Sort blast + affectionate screen-wide purr shake. If a bonus is one cascade away, her party instead nudges the meter +1.
- **Joey** (40% of visits): appears on top of a saucer, judges the board with yellow eyes. Helps ONLY if **Bougie Bites** are stocked (canon S7). He does a two-second boogie first, then delivers a **Bougie Boost**: Drop-In Saucer wild stack + meter +1. Rarer treat, stronger assist — the economy of being Glee's favorite boy.
- **Jar empty / no Bougie Bites for Joey:** the cat knocks exactly one symbol off the board anyway (single-cell reshuffle — occasionally completes a line, always gets a chuckle) and exits with an unimpressed tail flick. Quip: *"Phoebe has reviewed your offering. Phoebe is unmoved."* / *"Joey requires Bougie Bites. Joey is a professional."*
- **Both cats simultaneously** (rare, ~1/500): **Cat Constellation** (§10) — guaranteed cascade + scene unlock progress.

All shipped cat art is **original illustration** (S15 — no photos or photorealistic renderings of the cats in the product): curvy tuxedo Phoebe, slender gray yellow-eyed Joey, drawn in the retro-bright house style for both reel wilds and pop-in moments. The reference photos inform markings, proportions, and personality only. Glee may appear as a cartoon avatar (S15), never photorealistic (S4).

## 7. Free spins & the AskJamie Wheel

Meter hits 4+ → celebration → **AskJamie spins Joey & Phoebe's Sparkle Wheel** (his avatar at the crank; Joey and Phoebe perched on the rim). One modifier per bonus:

| Wedge | Modifier |
|---|---|
| **We're Multiplying** (40%) | Each counted free spin rolls independently for no multiplier (15%), ×2 (35%), ×3 (30%), ×5 (15%), or ×10 (5%). A qualifying opening result contains exactly one marked wild: ×2 on reel 2, ×3 on reel 3, ×5 on reel 4, or ×10 on reel 5. It multiplies only winning lines that use it; cascade drops never create or stack multiplier wilds. See `docs/WE-RE-MULTIPLYING-2026-07-13.md`. |
| **Giant Toolbox Mode** (35%) | 2x2 mega-keepsakes land on reels 2-3/4-5, with Phoebe supervising from the open Toolbox |
| **Iced Chai Wild Rain** (25%) | AskJamie lobs iced chai tumblers onto the board — 1-3 extra wilds rain in per spin |

Free spins play on an aurora-shifted board (navy → violet-green), same cascade rules, retriggers live. Double Sparkle doubles the entry award. Exit screen always ends warm: total, best cascade, and a Glee-ism sized to the result (Glee-Lite for modest, Bleeds Glee for monsters).

## 8. Bold Chai Bonus (rapid-pump scene)

The main screen may trigger a dedicated Bold Chai feature scene within the existing reel-area dimensions. The player has **30 seconds** to tap the oversized pump as quickly as possible. Each registered pump advances the visible iced cup by one of **12 fill steps**; the 12th pump completes one strong chai and awards **10 free spins**. The cup then swaps to an empty iced cup over **3 seconds** while the clock continues running; taps during the swap or after timeout do nothing. Incomplete cups award no free spins.

Chai pump symbol should appear: 1/17 on reel 1 and 1/30 on reel 2 for a same-payline "Bold Chai" bonus trigger: approximately 1/510-spins

The pump blocker is main-screen-only and is suppressed in all secondary bonus screens, including Keepsake Collection and We're Multiplying. Bold Chai audio is one-shot per accepted pump, with an original iced-cube rattle during each cup swap and an original low shot-clock buzzer when the 30-second timer expires. The normal soundtrack continues during the scene, with urgency tempo handled by the music layer.

## 9. Economy & progression

- **Currency: Glee-coins** (S11). Bet/win/balance — full slot semantics, zero money language, never purchasable.
- Start: 500 Glee-coins with a default 1-coin wager. If balance < one current-bet spin: **AskJamie finds coins under the couch** — cheerful animation, +500 coins. The automatic refill keeps play uninterrupted and lands as a recurring joke.
- **Chai Sparks = XP** (Codex's term, repurposed): every spin earns Sparks (scaled by bet), filling the level meter. Levels unlock bet tiers, scenes (§10), and cosmetics (board trims, saucer colors, quip packs). **Level 12 is a major celebration.**
- **Daily Bonus Wheel:** once per calendar day, 100k-1M coins + a random treat for the jar. Streaks acknowledged, never punished ("Day 3! The cats noticed.").
- All persistence via versioned localStorage (`ccv1.*`), reset action in settings.

## 10. Milestone scenes (Codex adoption — as progression rewards)

Twenty-second skippable interludes, unlocked by clear milestones, then re-viewable from a collection shelf:

| Scene | Unlock |
|---|---|
| **Iced Chai Break** | Level 5 — the tumbler assembles itself under the stars, straw lands like Excalibur |
| **Butterfly Burst** | First UniGlee — the garden fills with butterflies spelling a tiny "G" |
| **Cat Constellation** | First double pop-in — Joey & Phoebe drawn in stars, boogie included |
| **Glee Mode** | Level 12 — the whole board goes full Bleeds-Glee: maximal sparkle, cursive neon, the best quips, permanent toggle unlocked |

Scenes award nothing but delight and a collection checkmark. That's the point.

## 11. Presentation

- **Palette:** midnight navy `#1a1f3c` → violet `#2d1f4c` sky, mint stars `#9fe8c5`, burnt orange `#d35b2d` (site-canon accent), butter `#f5d576`, dusty pink `#e8a5b8`.
- **The Chai Captain:** Glee's presence without likeness — her *things* own the top of the screen: the tumbler on a shelf, a cardigan on a hook, a butterfly clip by the meter. During Glee Mode they glow. She is the weather of this world, not a sprite in it.
- **Animation language:** transform/opacity only, springy ease-outs, 60fps. Cascade beam-ups are the hero animation — polish those first.
- **Audio:** Web Audio synth per src/audio/README.md. Base loop: dreamy 70s soft-rock progression (Rhodes-ish pad, brushed rhythm). Free spins: 90s-grunge-tinged loop (low fuzzed fifths, still warm). Theremin saucers, banjo-twang plucks, rising cascade arpeggio, purr-trill and boogie-riff cat motifs, brass fanfare. Vibes, never samples.
- **Copy deck registers** (per site persona): Glee-Lite for routine wins ("Done and sparkling."), Glee-Rich default ("Do you love this? Wait. No. *Really* love it?"), Bleeds Glee for bonuses and UniGlee ("OMG. This is SO Glee-coded. Freak'n facts on FACTS."). Homage lines nod at her shows by energy, never verbatim quotes.

## 12. The Birthday Reveal

First launch on/after 2026-07-17 (date check, one-time flag): night sky, two saucers fly in carrying a banner — **"Happy Birthday, Glee"** — Joey and Phoebe pop out, a chai tumbler descends into her hand silhouette, and one line from Jamie (text he writes himself, stored in one obvious constant: `BIRTHDAY_MESSAGE`). Then the Toolbox opens and the game begins with a full Treat Jar and 500 coins. Skippable after first view; re-watchable from the scene shelf.

## 13. Settings & accessibility

Sound toggle (default on), music/SFX split sliders, **reduced motion** (fades replace drops; honors `prefers-reduced-motion` automatically), quip volume (Lite/Rich/Bleeds), reset with confirm, "About this gift" (the README story, in-game). Aria-live announces wins; all controls labeled; touch targets ≥48px.

## 14. Technical contract

Vanilla TypeScript + Vite + Tailwind (S9). `src/engine/` pure TS, seeded RNG, vitest-covered (event-frequency table §4 is the test oracle). `src/ui/` renders `SpinResult` steps; owns zero math. PWA: manifest + service worker, offline after first load. Deploy: push → Actions (privacy gate, brand gate, tests) → Pages. Game persistence is localStorage only; there is no product backend. S25 permits one constrained Google Analytics tag for aggregate reach measurement, as defined in `docs/ANALYTICS-PRIVACY.md`.

## 15. Build order & cut lines (deadline: playable by 07/12, polished by 07/16)

1. **Core** (cannot cut): reels, paylines, cascades, meter, free spins, bet bar, balance, SPARKLE!, deploy, sound core, persistence.
2. **Signature** (cut last): Treat Jar + pop-ins, wheel modifiers, quip system, birthday reveal.
3. **Riches** (cut first if needed): Chai Bonus, UniGlee, scenes, daily wheel, XP/levels, cosmetics.

If the 17th arrives early, tier 1 + 2 IS the gift. Tier 3 ships as "new features appearing in your game" across the following weeks — a gift that keeps unwrapping.

## 16. Acceptance criteria (Codex's list, kept nearly whole)

- Glee opens it on her iPhone from a home-screen icon and understands it with zero instructions.
- Every tap resolves legibly and positively; no money or purchase language exists anywhere.
- Joey, Phoebe, iced chai, and the number 12 feel unmistakably specific to her.
- Visibly Glee-fully; not confusable with any casino game, beverage, or pet-food brand.
- Progress survives refresh and app restart; reset works.
- No Glee photo, unlicensed media, or private file in the repo, its history, or the bundle (CI-gated).
- Builds clean, no console errors, reduced motion respected, 60fps on a recent iPhone.
- Jamie watches her play it for ten minutes and she doesn't ask a single "how do I" question. She just plays.
