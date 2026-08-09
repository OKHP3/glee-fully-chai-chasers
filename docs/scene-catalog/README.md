# Scene Catalog: Glee-fully Chai Chasers

**Compiled:** 2026-08-09 · **Basis:** working tree at `main`, commit `b7d720d` and later
**Purpose:** a complete inventory of every unique scene, overlay, screen, and design artifact that exists in the shipped game today, so each can be assembled onto the Replit design canvas and reviewed visually without playing through rare outcomes.

**Nothing in this catalog is proposed, suggested, or invented.** Every entry describes something present in the source at a cited `file.ts:line`. Where a fact could not be resolved from source it is marked `UNVERIFIED` with the reason. Player-facing copy is quoted character for character, including the em dashes that exist in the shipped strings.

## The four documents

| File | Covers | Scenes | Lines |
|---|---|---|---|
| [PART-A-BASE-SURFACES.md](PART-A-BASE-SURFACES.md) | Splash, cabinet, reel area, Ice Notes, Settings, Paytable, cat pop-ins, celebrations, cascade states | 41 | 1,401 |
| [PART-B-BONUS-SCENES.md](PART-B-BONUS-SCENES.md) | Sparkle Wheel, free-spin board, Keepsake Trail, Chai Storm, Treat Time, Doorbell Panic, Bold Chai, summaries | 17 | 1,111 |
| [PART-C-UNIGLEE-AND-ASSETS.md](PART-C-UNIGLEE-AND-ASSETS.md) | UniGlee takeover and all five marathon acts, Joey's Laundry Helper, Phoebe's Lap Quest, plus the complete art and asset system | 23 | 1,253 |
| This file | Master register, nesting tree, reachability status, orphan inventory | index | |

**81 scenes total.**

---

## 1. Master scene register

Legend for **Force**: `hash` means a dev URL hash already exists. `export` means an exported function can render it. `none` means the function is module-private with no existing way to render it on demand.

### Part A, base and persistent surfaces

| # | SCENE-ID | Reachable | Force |
|---|---|---|---|
| 1 | `splash-standard` | yes | none |
| 2 | `splash-birthday` | yes, July 17 to 31 only, once per device per year | none |
| 3 | `board-root` | yes | `#board` |
| 4 | `board-marquee-header` | yes | `#board` |
| 5 | `board-chrome-buttons` | yes | `#board` |
| 6 | `board-marquee-status` | yes | `#board` |
| 7 | `board-level-pill` | yes | `#board` |
| 8 | `board-reel-window` | yes | `#board` |
| 9 | `board-night-garden` | yes | `#board` |
| 10 | `board-firefly-meter` | yes | `#board` |
| 11 | `board-treat-jar` | yes | `#board` |
| 12 | `board-askjamie-perch` | yes | `#board` |
| 13 | `board-askjamie-bubble` | yes | none |
| 14 | `board-bet-console` | yes | `#board` |
| 15 | `board-sparkle-button` | yes | `#board` |
| 16 | `ice-notes-card` | yes | `#board` |
| 17 | `ice-notes-side-panel` | yes, 900px and wider | `#board` |
| 18 | `settings-page` | yes | none |
| 19 | `settings-look-and-feel` | yes | none |
| 20 | `settings-sound` | yes | none |
| 21 | `settings-reduce-motion` | yes | none |
| 22 | `settings-payline-guide` | yes | none |
| 23 | `settings-about` | yes | none |
| 24 | `settings-start-fresh` | yes | none |
| 25 | `paytable-page` | yes | none |
| 26 | `cat-popin-phoebe-fed` | yes | none |
| 27 | `cat-popin-phoebe-unfed` | yes | none |
| 28 | `cat-popin-joey-fed` | yes | none |
| 29 | `cat-popin-joey-unfed` | yes | none |
| 30 | `win-status-only` | yes | none |
| 31 | `win-celebration-nice` | yes | none |
| 32 | `win-celebration-big` | yes | none |
| 33 | `win-celebration-huge` | yes | none |
| 34 | `levelup-celebration` | yes | `export` via `maybeLevelUpAfterBonus` |
| 35 | `cascade-resting-board` | yes | `#board` |
| 36 | `cascade-initial-pop` | yes | `#board` |
| 37 | `cascade-staggered-drop` | yes | `#board` |
| 38 | `cascade-win-highlight` | yes | `#board` |
| 39 | `cascade-beam-up` | yes | `#board` |
| 40 | `cascade-payline-guide-on` | yes | `#board` |
| 41 | `cascade-payline-guide-off` | yes | `#board` |

### Part B, bonus scenes

| # | SCENE-ID | Reachable | Force |
|---|---|---|---|
| 42 | `sparkle-wheel` | yes, 1 in 207 spins | none |
| 43 | `free-spin-board` | yes | none |
| 44 | `were-multiplying` | yes, 40 of 100 wheel landings | `export` via `renderGridHtml` for the badge |
| 45 | `moonlit-keepsake-trail` | yes, 35 of 100 wheel landings | `export` via `runKeepsakeMemoryBonus` |
| 46 | `standard-free-spins` | yes, on Trail success | none |
| 47 | `chai-storm-splash` | yes, round 0 only | none |
| 48 | `iced-chai-wild-rain-board` | yes, 25 of 100 wheel landings | `export` via `renderGridHtml` |
| 49 | `keepsake-constellation` | yes, **UniGlee chapter only** | `export` via `renderGridHtml` |
| 50 | `treat-time-entry-morning` | yes, 1 in 250 | none |
| 51 | `treat-time-entry-nighttime` | yes, 1 in 500 | none |
| 52 | `treat-time-main-board` | yes | none |
| 53 | `doorbell-panic-banner` | yes, suppressed if UniGlee fired same spin | none |
| 54 | `doorbell-panic-free-spins` | yes, 3 to 6 spins | none |
| 55 | `bold-chai-pump-scene` | yes, 30-second timed | none |
| 56 | `bold-chai-free-spins` | yes, 3 spins per completed cup | none |
| 57 | `treat-jar-free-spins` | yes, 1 in 25 | none |
| 58 | `bonus-summary` | yes | none |

### Part C, UniGlee marathon and the rarest content

Every scene below sits behind a UniGlee capture at roughly **1 in 1,229 paid spins**.

| # | SCENE-ID | Reachable | Force |
|---|---|---|---|
| 59 | `uniglee-takeover` | yes, 3 variants for 40, 60, 80 spins | none |
| 60 | `uniglee-marathon-sequence` | yes | none |
| 61 | `uniglee-chapter-banner` | yes | none |
| 62 | `joey-laundry-chapter-overlay` | yes | none |
| 63 | `joey-laundry-win-presentation` | 3 of 4 states reachable | none |
| 64 | `joey-laundry-sock-drop` | yes | none |
| 65 | `joey-laundry-paw-strike` | yes | none |
| 66 | `joey-laundry-combined-strike` | yes | none |
| 67 | `uniglee-act-were-multiplying` | yes | none |
| 68 | `uniglee-act-nighttime-treat-time` | yes | none |
| 69 | `uniglee-act-keepsake-collection` | yes | none |
| 70 | `lap-quest-chapter-controller` | yes | `#lap-quest` |
| 71 | `lap-quest-choice` | yes | `#lap-quest` |
| 72 | `lap-quest-reveal` | yes | `#lap-quest` |
| 73 | `lap-quest-round-play` | yes | `#lap-quest` |
| 74 | `lap-quest-ledge` | yes | `#lap-quest` |
| 75 | `lap-quest-ledge-exit-joey` | yes | `#lap-quest` |
| 76 | `lap-quest-ledge-exit-inactivity` | yes | `#lap-quest` |
| 77 | `lap-quest-ledge-exit-quiet` | UNVERIFIED | `#lap-quest` |
| 78 | `lap-quest-session-engine` | **no, dead code** | n/a |
| 79 | `uniglee-summary` | yes | none |
| 80 | `uniglee-marathon-levelup` | yes | none |
| 81 | `dev-hash-lap-quest` | dev route only | itself |

---

## 2. Nesting tree

Derived from the call graph, not from intuition. Part B produced the base and bonus branches; Part C produced the UniGlee expansion.

```
base spin (runSpin, src/ui/board.ts:818)
├── uniglee takeover (1 in 1,229)
│   └── uniglee marathon, five acts
│       ├── act 1, always first: joey_laundry_helper
│       │     └── sock drop / paw strike / combined strike
│       ├── acts 2 to 4, seeded shuffle of:
│       │     ├── were_multiplying     -> free-spin-board -> were-multiplying
│       │     ├── keepsake_collection  -> free-spin-board -> keepsake-constellation   (ONLY path)
│       │     └── nighttime_treat_time -> free-spin-board -> treat cast, no entry card
│       ├── act 5, always last: phoebe lap quest
│       │     ├── lap-quest-choice  (Window Perch / Blanket Nest / Moonlit Cushion)
│       │     ├── lap-quest-reveal  (perfect = 4 wilds, cozy = 2 wilds)
│       │     ├── lap-quest-ledge   (mounted unconditionally, drives act length)
│       │     └── exit: joey interrupt | inactivity | quiet
│       └── uniglee summary -> marathon level-up
├── doorbell-panic-banner              (skipped if uniglee fired same spin)
├── bold-chai-pump-scene               (skipped if uniglee or doorbell fired)
│   └── bold-chai-free-spins -> free-spin-board -> bonus-summary
├── treat-time-entry-morning   (1/250) -> treat-time-main-board
├── treat-time-entry-nighttime (1/500) -> treat-time-main-board
├── doorbell-panic-free-spins          -> free-spin-board -> bonus-summary
├── sparkle-wheel (1 in 207)
│   ├── multiplying     40/100 -> free-spin-board -> were-multiplying -> bonus-summary
│   ├── keepsake_memory 35/100 -> moonlit-keepsake-trail
│   │     ├── success -> standard-free-spins -> free-spin-board -> bonus-summary
│   │     └── failure -> board, NO summary
│   └── chai_back       25/100 -> free-spin-board
│         ├── chai-storm-splash (round 0 only)
│         ├── iced-chai-wild-rain-board
│         └── bonus-summary
└── treat-jar-free-spins (1 in 25, trailing sibling of everything above) -> bonus-summary
```

---

## 3. The Sparkle Wheel, answered precisely

The owner asked what the sections of the wheel are. From `src/ui/symbols.ts:70-74` and `src/engine/freespins.ts:35-39`:

**Three wedges are physically drawn.** The face is split into nine 40-degree landing sub-zones by nine rim pins, where every third pin is a wedge boundary.

| Wedge | Label shown | Weight | Lands on the wheel |
|---|---|---|---|
| `multiplying` | We're Multiplying | 40 | yes |
| `keepsake_memory` | Moonlit Keepsake Trail | 35 | yes |
| `chai_back` | Iced Chai Wild Rain | 25 | yes |
| `keepsake_collection` | Keepsake Collection | n/a | **no**, UniGlee chapter only |
| `doorbell_panic` | Doorbell Panic | n/a | **no**, `runDoorbellPanic` only |
| `treat_time_morning` | Morning Treat Time | n/a | **no**, `runTreatTimeBonus` only |
| `treat_time_nighttime` | Nighttime Treat Time | n/a | **no**, `runTreatTimeBonus` and UniGlee |

The `WheelWedge` type has seven members. `WHEEL_WEIGHTS` has three. The other four are used by systems that reuse the wedge vocabulary without ever touching the wheel.

One further detail: `keepsake_memory` does land, but it is intercepted before `spinFreeRound` and converted to a `"standard"` session, so `spinFreeRound` has no live `keepsake_memory` branch.

---

## 4. Phoebe's Lap Quest, resolved

There are three implementations in the tree. Part C traced the call graph and settled it:

| Implementation | Status |
|---|---|
| `showLapQuestChoice` + `showLapQuestReveal` (`board.ts`) | **Live.** Awaited at `board.ts:1650` and `1653` |
| `mountLapQuestLedge` (`src/ui/lap-quest-ledge.ts`) | **Live.** Called unconditionally at `board.ts:1654`. The round loop at `1679-1683` is gated on `ledge.finished` and the terminal status branches on `ledgeResult.reason` at `1691-1697`, so the ledge drives the act's length and outcome |
| `src/engine/lap-quest-session.ts` | **Dead.** All five exports have no caller outside the module and its own 8-test spec. Its phase vocabulary does not even match the live ledge (`petting` vs `active`), and its `lapCoinsByTick` ladder is never supplied, so no coin ladder exists in the shipped game |

They are not alternatives. The choice, the reveal, and the ledge all run in sequence as one act.

Correction to an earlier assumption: `board.ts:1655` injects `interruptAtMs` from the seeded `mulberry32` RNG, so the `Math.random()` fallback at `lap-quest-ledge.ts:56` is **not** on the production path.

---

## 5. Reachability: the constraint on the canvas exercise

This is the practical finding. Of 81 scenes:

| Situation | Count |
|---|---|
| Reachable on demand today via `#board` | 17 |
| Reachable on demand today via `#lap-quest` | 9 |
| Reachable via an exported function | 5 |
| **No existing way to render on demand** | **49** |
| Dead code, not reachable at all | 1 |

Both dev hashes are declared at `src/main.ts:29-46`, carry no environment guard, and are present in the built bundle `dist/assets/index-CfZIap50.js`.

The 49 scenes with no forcing route include the entire Sparkle Wheel sequence, every Treat Time and Doorbell Panic screen, the Bold Chai pump, all of Joey's Laundry Helper, the UniGlee takeover and summary, every cat pop-in, all four win and level-up celebrations, and both Settings and Paytable pages. They are module-private inside `board.ts` with no export.

Stated plainly and without proposing a fix: **most of the game's scenes cannot currently be rendered without playing to them.** That is a catalog fact, and it is the thing standing between this inventory and the canvas.

---

## 6. Orphans and dead artifacts found during the sweep

Recorded because they will otherwise waste review time on the canvas.

### Unreachable or inert presentation

| Item | Source | Why |
|---|---|---|
| `.shatter-out` and its keyframe | `style.css:2498-2504` | No TypeScript applies the class |
| `.symbol-sprite--wild` | `style.css:1812` | Rule with no emitter |
| `.symbol-asset--handbag` | `style.css:1834` | Rule with no emitter |
| `.symbol-art` | `style.css:1853` | Rule with no emitter |
| `.jar-meter-copy` | `style.css:956, 961` | Rule with no emitter |
| `.settings-row` | `style.css:1590` | Rule with no emitter |
| `.symbol-sprite--chai-wild` | `symbols.ts:38` | Emitted class with no CSS rule |
| `.lap-quest-mode` | Part C §16 | Emitted class with no CSS rule |
| `aurora-mode`, `panic-free-spins`, `treat-time-free-spins` | Part B | Classes with no rules anywhere |
| `.free-spins-panel-heading/-kicker/-stats` | Part B | Orphaned, heading moved to `#bonus-banner` |
| `.chai-splash-copy`, `-subtitle`, `-button` | `style.css:406-411` | Match no element `renderSplash` produces |
| `wheelSvg()` | `symbols.ts:119` | A second, unused wheel face with a `GO` hub, no call site |
| `askJamieSvg()` | `symbols.ts:274` | Exported, imported by nothing |
| `runJoeyLaundryChapter()` | `board.ts:2220` | Exported, no production caller |

### Copy that can never render

| String | Source | Why |
|---|---|---|
| `Joey caught a bonus sock — …` | `board.ts:2204` | `freespins.ts:332` zeroes `freeSpinsAwarded` every round |
| Retrigger clause in `bonus-summary` | Part B | `retriggers` is declared `0` and never incremented |
| Retrigger clause in Treat Time completion | Part B | Same cause |

### Assets

- `public/assets/optimized/social-preview.webp` is generated and validated but never loaded. `index.html:26` and `:36` both point at the JPEG master. It is the only unreferenced file under `public/`.
- Standard atlas cell 15 and special atlas cells 5 to 7 are transparent.

---

## 7. Two things the catalog surfaced that contradict existing documents

Recorded as observations, not as change requests.

**Keepsake Constellation is not a 2x2 giant symbol.** Six footprints exist with these weights: 2x2 at 19%, 2x3 at 15%, 2x4 at 11%, 3x2 at 15%, 3x3 at 8%, 3x4 at 5%, and no giant at 27%. The README and both public pages describe it as 2x2.

**The shipped game contains em dashes in player-facing copy.** At least eight strings, including the AskJamie button `aria-label`, the Settings about text, a level-up quip, four cat quips, the Keepsake Trail failure line, two Bold Chai status lines, and the Lap Quest Joey-interrupt speech bubble. Each is quoted verbatim in the parts and annotated with U+2014.

---

## 8. Open items marked UNVERIFIED

| Item | Part | Reason |
|---|---|---|
| `social-preview.webp` serving path | A | No reference in source; cannot tell if anything serves it |
| Volume `output` element always reads `(max)` | A | `board.ts:748` emits the literal and no handler updates it; cannot tell if intentional |
| Birthday window comment mismatch | A | CSS comment says "July 17 only", code says July 17 to 31. Shipped behavior follows the code |
| Firefly meter cap mismatch | A | `fireflyJarSvg` clamps 0 to 8, label is hard-coded `{n} / 6` |
| Doorbell Panic joint trigger probability | B | Reel rates are constants but payline alignment is never computed and not gated |
| Bold Chai Pump joint trigger probability | B | Same, plus the doorbell family must lose its rolls first |
| Bold Chai free-spin award frequency | B | Depends on tap speed, no expected cup count recorded |
| Moonlit Keepsake Trail success rate | B | Player skill, no completion-rate constant or test |
| Treat Jar completion frequency | B | No simulation gate for 24-treat bag fills |
| Takeover fallback variant reachability | C | Cannot resolve from source |
| `lap-quest-ledge-exit-quiet` reachability | C | Cannot resolve from source |
| Perfect-lap frequency | C | Player-driven, not derivable from constants |
| Lap Quest round count per chapter | C | Loop has no code bound |
| Lap Quest RTP contribution | C | Excluded from the sim harness |
| Audio on the `#lap-quest` route | C | `unlock()` is skipped on that path |
| `baloo2-800.woff2` licence and glyph coverage | C | No checklist row |
| Depiction of `chai-pump.svg` | C | Nothing beyond its `aria-label` |
| `uniglee-marathon.ts:18` comment | C | Claims 75/100/125 allocations, code yields 10/15/20 |
