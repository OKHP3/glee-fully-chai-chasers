# Part B: Bonus Scenes (excluding the UniGlee marathon)

## Scope note

This catalog covers every bonus presentation surface in `Glee-fully Chai Chasers` except the base board/settings/paytable surfaces (Part A) and the UniGlee marathon takeover, chapter runner, Joey's Laundry Helper chapter, Phoebe's Lap Quest chapter, and UniGlee summary (Part C). It documents the Sparkle Wheel, the shared free-spin board and each of its wedge variants, the Moonlit Keepsake Trail memory bonus, the Wild Chai Storm splash and wild-chai cell conversion, the Keepsake Constellation giant symbol, both Treat Time entries and the main-board Treat Time run, the Doorbell Panic banner and its panic spins, the Bold Chai Pump rapid-tap scene and its free spins, the Treat Jar free spins, and the shared bonus summary. Every fact is cited to `file:line` against the working tree at `/root/gfcc`. Where the code does not determine an answer, the entry says `UNVERIFIED` and names exactly what could not be resolved. Nothing here is a proposal: no scene, string, asset, or state described below is absent from the source.

## Table of contents

| # | SCENE-ID | Display name |
|---|---|---|
| 1 | `sparkle-wheel` | Joey & Phoebe's Sparkle Wheel |
| 2 | `free-spin-board` | Free Spins (shared runner) |
| 3 | `were-multiplying` | We're Multiplying |
| 4 | `moonlit-keepsake-trail` | MOONLIT KEEPSAKE TRAIL |
| 5 | `standard-free-spins` | Standard Chai Chase |
| 6 | `chai-storm-splash` | WILD CHAI STORM |
| 7 | `iced-chai-wild-rain-board` | Iced Chai Wild Rain |
| 8 | `keepsake-constellation` | (no visible title) |
| 9 | `treat-time-entry-morning` | IT'S TREAT TIME! (morning) |
| 10 | `treat-time-entry-nighttime` | IT'S TREAT TIME! (nighttime) |
| 11 | `treat-time-main-board` | Treat Time on the main cabinet |
| 12 | `doorbell-panic-banner` | DOORBELL PANIC! |
| 13 | `doorbell-panic-free-spins` | Panic Spins |
| 14 | `bold-chai-pump-scene` | BOLD CHAI! |
| 15 | `bold-chai-free-spins` | BOLD CHAI! (free spins) |
| 16 | `treat-jar-free-spins` | TREAT JAR BONUS! |
| 17 | `bonus-summary` | Free Spins Complete! |

Total: 17 scenes.

---

### sparkle-wheel
**Display name:** "Free Spins!" (kicker) over "Joey & Phoebe's Sparkle Wheel" (`src/ui/board.ts:1971`, HTML source reads `Joey &amp; Phoebe's Sparkle Wheel`)

**Source:** `src/ui/board.ts:1958`, `showWheelScreen`. Selection math: `src/engine/freespins.ts:55` `spinWheel`, `src/engine/freespins.ts:66` `spinWheelLanding`, `src/engine/freespins.ts:35` `WHEEL_WEIGHTS`, `src/engine/freespins.ts:425` `wheelWedgeLabel`. Art: `src/ui/symbols.ts:43` `wheelHeroArt`, `src/ui/symbols.ts:53` `wheelMechanicalSvg`.

**Reachable in production:** yes. `runSpin` calls `runWheelAndFreeSpins` whenever `result.freeSpinsAwarded > 0` and no doorbell trigger is present (`src/ui/board.ts:917-919`); `runWheelAndFreeSpins` awaits `showWheelScreen` as its first action (`src/ui/board.ts:1905`).

**How it is reached:** a base spin reaches 6 or more cascades, awarding a ladder value (`src/engine/types.ts:221-223`, `src/engine/cascade.ts:63-69`), and `result.doorbellPanic` is undefined (`src/ui/board.ts:918`). If a UniGlee capture also fired, the marathon runs first (`src/ui/board.ts:881-887`) and the wheel still follows at line 919.

**Trigger probability:** ladder entry at 6+ cascades. `FREE_SPIN_LADDER = { 6: 6, 7: 9, 8: 15, 9: 25, 10: 40, 11: 60 }` (`src/engine/types.ts:221-223`). Award is doubled when Double Sparkle is active (`src/engine/cascade.ts:353-358`). Measured rate recorded in the repo: "free spins ~1 in 150 ±20%", gated between 1/188 and 1/120 (`src/engine/simulation.test.ts:83-87`). Wedge weights once the wheel opens: `multiplying` 40, `keepsake_memory` 35, `chai_back` 25, total 100 (`src/engine/freespins.ts:35-39`).

**Parent scene:** none. It is a top-level overlay hosted inside `.cabinet-frame`.

**Can contain:** `moonlit-keepsake-trail` (via the `keepsake_memory` wedge, `src/ui/board.ts:1907-1909`), `were-multiplying` (via `multiplying`), `iced-chai-wild-rain-board` (via `chai_back`), and, downstream of the Trail, `standard-free-spins`. All three wedge outcomes end at `bonus-summary`.

**DOM root:** `div.bonus-cabinet-overlay.wheel-scrim.text-amber-100`, appended to `root.querySelector(".cabinet-frame")` with fallback to `root` (`src/ui/board.ts:1968-1993`).

**Verbatim copy:**

| Element | String |
|---|---|
| `h2.wheel-heading > span` | `Free Spins!` |
| `h2.wheel-heading` remainder | `Joey &amp; Phoebe's Sparkle Wheel` (renders as `Joey & Phoebe's Sparkle Wheel`) |
| hero `img` alt (`src/ui/symbols.ts:46`) | `Joey and Phoebe perched on the free-spin wheel` |
| legend 1 (`src/ui/board.ts:1984`) | `<b>We're Multiplying</b> Extra sparkle` |
| legend 2 (`src/ui/board.ts:1985`) | `<b>Moonlit Keepsake Trail</b> memory match` |
| legend 3 (`src/ui/board.ts:1986`) | `<b>Iced Chai</b> wild rain` |
| `#wheel-result` after 2450 ms (`src/ui/board.ts:1996`) | `wheelWedgeLabel(wedge) + "!"`, i.e. one of `We're Multiplying!`, `Moonlit Keepsake Trail!`, `Iced Chai Wild Rain!` |

The `.wheel-legends` container carries `aria-hidden="true"` (`src/ui/board.ts:1983`), so the three legend strings are not exposed to screen readers. `#wheel-result` has no `aria-live` attribute (`src/ui/board.ts:1988`). The wheel SVG carries `aria-hidden="true"` (`src/ui/symbols.ts:62`). The only screen-reader-reachable text on this scene is the `h2` and the hero image `alt`.

**Assets:**
- `public/assets/joey-phoebe-wheel.png` with `public/assets/optimized/joey-phoebe-wheel.webp` as the `<source>` (`src/ui/symbols.ts:46`).
- Wheel face: inline SVG in `src/ui/symbols.ts:53` `wheelMechanicalSvg`.
- Glow ring, energy ring, pointer: CSS only (`src/style.css:2395`, `2421`, `2407`).

**CSS:** prefixes `.wheel-` (`.wheel-scrim`, `.wheel-heading`, `.wheel-stage`, `.wheel-hero-art`, `.wheel-hero-picture`, `.wheel-mechanical-face`, `.wheel-mechanical-svg`, `.wheel-pin`, `.wheel-pin--major`, `.wheel-icons`, `.wheel-glow-ring`, `.wheel-pointer`, `.wheel-energy-ring`, `.wheel-legends`) plus `#wheel-result`, all at `src/style.css:2348-2469`, and the shared `.bonus-cabinet-overlay` at `src/style.css:599-615`. Keyframes: `wheel-spin-out` (`src/style.css:2471-2474`) drives both `.wheel-mechanical-face` and `.wheel-energy-ring`; `ornament-twinkle` (`src/style.css:1021`) drives `.wheel-glow-ring`.

**States and variants:**

*Wheel face geometry, physically rendered.* Exactly **three** wedges are drawn on the wheel face, as three `<path>` elements (`src/ui/symbols.ts:70-74`):

| Wedge path | Gradient fill | Arc span, clockwise from 12 o'clock | Icon group | Maps to |
|---|---|---|---|---|
| `M100 100 L100 4 A96 96 0 0 1 183.1 148 Z` | `url(#mechanicalTeal)` `#a8f0e5` to `#238d89` | 0° to 120° | `translate(143 68)`, crossed strokes plus a four-point star | `multiplying` |
| `M100 100 L183.1 148 A96 96 0 0 1 16.9 148 Z` | `url(#mechanicalPink)` `#ff9ecb` to `#a82c63` | 120° to 240° | `translate(100 146)`, two overlapping rounded cards plus a dot | `keepsake_memory` |
| `M100 100 L16.9 148 A96 96 0 0 1 100 4 Z` | `url(#mechanicalGold)` `#fff0b0` to `#bd7d20` | 240° to 360° | `translate(57 68)`, cup with handle and straw | `chai_back` |

The wedges carry no text labels on the face itself. The three player-readable names appear only in the `.wheel-legends` strip below the wheel and in `#wheel-result` after the spin settles.

Nine gold pins ride the rim at radius 89, at 40° intervals starting from `-90°` in SVG terms, i.e. at clockwise-from-top angles 0, 40, 80, 120, 160, 200, 240, 280, 320 (`src/ui/symbols.ts:54-61`). Every third pin (`index % 3 === 0`, at 0, 120, 240) is a wedge boundary, rendered at `r=4.2` with class `wheel-pin wheel-pin--major`; the other six are rendered at `r=3` with class `wheel-pin` and divide each wedge into three 40° landing sub-zones. Hub: `r=23` circle filled `url(#mechanicalHub)` with a highlight circle and a short horizontal stroke (`src/ui/symbols.ts:76-78`).

*Type union versus reachable wedges.* `WheelWedge` (`src/engine/freespins.ts:26-33`) has seven members. `WHEEL_WEIGHTS` (`src/engine/freespins.ts:35-39`) has three. `spinWheel` iterates only `WHEEL_WEIGHTS` and falls back to `WHEEL_WEIGHTS[0][0]` (`src/engine/freespins.ts:55-63`), so the wheel can only ever return three values.

| `WheelWedge` member | Weight in `WHEEL_WEIGHTS` | Can `spinWheel` return it? | Where the value is actually used |
|---|---|---|---|
| `multiplying` | 40 | yes | wheel; also UniGlee chapter `were_multiplying` (`src/engine/uniglee-marathon.ts:57-58`) |
| `keepsake_memory` | 35 | yes | wheel only; converted to a `standard` session before any free spin runs (`src/ui/board.ts:1906-1913`) |
| `chai_back` | 25 | yes | wheel; also Bold Chai free spins (`src/ui/board.ts:1269`) and Treat Jar free spins (`src/ui/board.ts:1289-1295`) |
| `keepsake_collection` | absent | **no** | UniGlee chapter `keepsake_collection` only (`src/engine/uniglee-marathon.ts:59-60`) |
| `doorbell_panic` | absent | **no** | `runDoorbellPanic` only (`src/ui/board.ts:1943`) |
| `treat_time_morning` | absent | **no** | `runTreatTimeBonus` with `mode === "morning"` only (`src/ui/board.ts:1808`) |
| `treat_time_nighttime` | absent | **no** | `runTreatTimeBonus` nighttime (`src/ui/board.ts:1808`) and UniGlee chapter `nighttime_treat_time` (`src/engine/uniglee-marathon.ts:61`) |

So four of the seven type members never land on the wheel: `keepsake_collection`, `doorbell_panic`, `treat_time_morning`, `treat_time_nighttime`. They exist in the union because other systems reuse `FreeSpinMode` as the modifier key for `spinFreeRound` (`src/engine/freespins.ts:41`, `171-176`). A fifth, `keepsake_memory`, does land on the wheel but is never passed to `spinFreeRound`, because `runWheelAndFreeSpins` intercepts it and runs a `"standard"` session instead (`src/ui/board.ts:1906-1922`). `spinFreeRound` therefore has no live branch for `keepsake_memory`; it falls through to the default return at `src/engine/freespins.ts:216`.

*Landing state and rotation.* `spinWheelLanding` returns `{ wedge, subzone }` where `subzone = Math.min(2, Math.floor(rng() * 3))` (`src/engine/freespins.ts:66-70`). The sub-zone changes presentation only and does not alter the parent wedge's probability (`src/engine/freespins.ts:44-47`). `showWheelScreen` maps parent centres `{ multiplying: 60, keepsake_memory: 180, chai_back: 300 }`, offsets by `(subzone - 1) * 40`, and computes `finalDeg = 1080 + ((360 - subzoneCentre) % 360)` (`src/ui/board.ts:1964-1966`), i.e. three full turns plus the alignment that brings the chosen sub-zone centre under the fixed pointer at 12 o'clock. Both `.wheel-mechanical-face` and `#wheel-ring` receive `style="--wheel-final-deg:${finalDeg}deg"` and run the same 2.4 s `cubic-bezier(0.15, 0.7, 0.25, 1) forwards` animation (`src/ui/board.ts:1975`, `1978`; `src/style.css:2387`, `2433`).

*Energy ring.* `#wheel-ring.wheel-energy-ring` holds three empty `<span>` children (`src/ui/board.ts:1978-1980`). The ring itself is a `conic-gradient` with three bright arcs, masked to an annulus by `radial-gradient(circle, transparent 0 58%, #000 62% 72%, transparent 76%)`, `mix-blend-mode: screen` (`src/style.css:2421-2434`). The spans are concentric dotted borders at insets 4%, 10%, 17% in `rgba(255,244,224,.42)`, `rgba(107,214,201,.38)`, `rgba(232,165,184,.32)` (`src/style.css:2435-2437`).

*Timeline.* `playWheelTick()` fires on mount (`src/ui/board.ts:1994`). At 2450 ms the result text is written and `playBonusFanfare()` fires (`src/ui/board.ts:1995-1997`). At a further 1400 ms the overlay is removed and the promise resolves with the wedge (`src/ui/board.ts:1998-2001`). Total on-screen life is 3850 ms. The 2.4 s spin animation therefore settles 50 ms before the result string appears.

*Empty state.* `#wheel-result:empty { opacity: 0; }` (`src/style.css:2469`) hides the result pill for the first 2450 ms.

*Loss state:* none. Every wheel spin lands on a paying wedge.

**Forcing route:** none found. `showWheelScreen` is module-private (`src/ui/board.ts:1958`, no `export`). The only dev hashes in the app are `#board` and `#lap-quest` (`src/main.ts:30`, `36`), neither of which opens the wheel. There is no exported wrapper and no state precondition that renders it directly.

> Note on unused wheel art: `src/ui/symbols.ts:119` exports a second wheel renderer, `wheelSvg()`, described in its own comment as "The AskJamie Wheel face" with a `GO` hub label and 12 rim dots. A repo-wide search finds no call site (`src/ui/symbols.ts:119` is the only match). It is not what the player sees; `showWheelScreen` uses `wheelMechanicalSvg` (`src/ui/board.ts:1976`).

---

### free-spin-board
**Display name:** varies by wedge; see the variant table below. Banner title defaults to `Free Spins` (`src/ui/board.ts:2024`).

**Source:** `src/ui/board.ts:2006`, `playFreeSpinSession`. Session math: `src/engine/freespins.ts:383` `runFreeSpinSession`, `src/engine/freespins.ts:171` `spinFreeRound`.

**Reachable in production:** yes. Called from `runWheelAndFreeSpins` (`src/ui/board.ts:1915`, `1928`), `runDoorbellPanic` (`src/ui/board.ts:1945`), `runBoldChaiFreeSpins` (`src/ui/board.ts:1270`), `runTreatJarFreeSpins` (`src/ui/board.ts:1296`), and the UniGlee chapter loop (`src/ui/board.ts:1565`).

**How it is reached:** always as the second half of an already-triggered bonus. It never opens on its own.

**Trigger probability:** inherits the parent's. Spin count is the caller's `spinsAwarded`; the session plays exactly that many rounds because retriggers are zeroed (`src/engine/freespins.ts:396-402`).

**Parent scene:** `sparkle-wheel`, `moonlit-keepsake-trail`, `doorbell-panic-banner`, `bold-chai-pump-scene`, the Treat Jar completion path, and the UniGlee marathon chapter loop.

**Can contain:** `chai-storm-splash` (only when a `chai_back` session carries a `chaiRain` payload, `src/ui/board.ts:2056-2058`), `keepsake-constellation` (only in a `keepsake_collection` session, rendered per step by `renderGridHtml`), the treat-cast overlay used by `treat-time-main-board`, and `were-multiplying` badges. It is always followed by `bonus-summary` except on the Treat Time and UniGlee paths.

**DOM root:** `section.free-spins-panel` appended to `.cabinet-frame` (`src/ui/board.ts:2025-2046`), containing `#fs-grid.reel-grid` and `#fs-status.status-line[aria-live="polite"]`. The base `#reel-grid` is set `hidden` for the duration and restored in the `finally` block (`src/ui/board.ts:2045`, `2116`). The banner content is written into the pre-existing `#bonus-banner` (`src/ui/board.ts:2034-2043`), which gains `bonus-banner--active`.

**Verbatim copy:**

| Element | String |
|---|---|
| panel `aria-label` (`src/ui/board.ts:2027`) | `${displayWedgeLabel} bonus spins` |
| `.bonus-banner-kicker` (`src/ui/board.ts:2037`) | `${displayWedgeLabel}` |
| `.bonus-banner-title` (`src/ui/board.ts:2038`) | `${title}` |
| `.bonus-banner-stats` (`src/ui/board.ts:2040`) | `Spin <span id="fs-index">1</span> of <span id="fs-total">${session.initialSpins}</span> · Round win: <span id="fs-round-win">0</span>` |
| `#fs-status`, multiplier round (`src/ui/board.ts:2070`) | `×${multiplier} wild on reel ${reel + 1}!` |
| `#fs-status`, panic round (`src/ui/board.ts:2097`) | `DOORBELL PANIC! ${panicWildsAdded} flying wild cats!` |
| `#fs-status`, storm round with wilds (`src/ui/board.ts:2103`) | `WILD CHAI STORM! ${count} mermaid-cup wild chai!` |
| `#fs-status`, storm round with zero wilds (`src/ui/board.ts:2104`) | `WILD CHAI STORM! The chai sky is charged!` |
| `#fs-status`, winning round (`src/ui/board.ts:2107`) | `+${totalWin.toLocaleString()} coins` |
| `#fs-status`, losing round (`src/ui/board.ts:2109`) | empty string |

`displayWedgeLabel` and `title` resolution (`src/ui/board.ts:2023-2024`):

| Wedge / caller | `displayWedgeLabel` | `title` |
|---|---|---|
| `standard` | `Standard Chai Chase` | `Free Spins` |
| `multiplying` | `We're Multiplying` | `Free Spins` |
| `chai_back` with a chai-rain round | `Iced Chai Wild Rain` | `Free Spins` |
| `chai_back` without a chai-rain round | `Bold Chai` | `BOLD CHAI!` |
| `doorbell_panic` | `Doorbell Panic` | `Panic Spins` |
| `treat_time_morning` | `Morning Treat Time` | `IT'S TREAT TIME!` |
| `treat_time_nighttime` | `Nighttime Treat Time` | `IT'S TREAT TIME!` |
| `keepsake_collection` | `Keepsake Collection` | `Free Spins` |
| Treat Jar caller override (`src/ui/board.ts:1296`) | `Treat Jar Bonus` | `TREAT JAR BONUS!` |
| UniGlee caller override (`src/ui/board.ts:1565-1568`) | `UniGlee · Chapter ${n}` | chapter title |

**Assets:** none of its own. Cells are drawn by `renderGridHtml` (`src/ui/board.ts:384`) from the symbol atlases (`public/assets/atlases/standard-symbol-atlas.png|webp`, `public/assets/atlases/special-symbol-atlas.png|webp`) and the two vector symbols (`public/assets/symbols/doorbell.svg`, `public/assets/symbols/chai-pump.svg`), per `src/ui/asset-manifest.ts:39-68`. Doorbell and chai-pump symbols are suppressed in every bonus round (`src/engine/freespins.ts:196-197`), so in practice only atlas art appears.

**CSS:** `.free-spins-panel` and its `> .reel-grid` / `> .status-line` children (`src/style.css:544-598`); `.bonus-banner`, `.bonus-banner--active`, `.bonus-banner-heading`, `.bonus-banner-kicker`, `.bonus-banner-title`, `.bonus-banner-stats` (`src/style.css:890-917`); `.night-garden.aurora` (`src/style.css:441-447`) and `.aurora .aurora-ribbons` (`src/style.css:463`). Keyframes: `beam-drop` (`src/style.css:2481`) applied to every cell each step (`src/ui/board.ts:2086`); `aurora-drift` (`src/style.css:465`); `payline-win-flash` (`src/style.css:1159`) for winning lines; `multiplier-badge-pop` (`src/style.css:1625`) for marked wilds; `panic-wild-land` (`src/style.css:2899`) under `.panic-grid`.

**States and variants:**

*Aurora backdrop.* On entry `#bg-layer` gains the class `aurora` and `document.body` gains `aurora-mode` (`src/ui/board.ts:2018-2019`); both are removed in the `finally` block (`src/ui/board.ts:2117-2118`). `.night-garden.aurora` replaces the idle four-layer night gradient with a brighter one: `radial-gradient(ellipse at 30% 8%, rgba(107,214,201,0.28) …)`, `radial-gradient(ellipse at 75% 12%, rgba(201,155,255,0.3) …)`, `radial-gradient(ellipse at 50% 100%, rgba(232,97,140,0.14) …)`, `linear-gradient(180deg, #150d38 0%, #26154a 42%, #3d235c 78%, #4a2160 100%)` (`src/style.css:441-447`), transitioned over 600 ms by the base rule's `transition: background 600ms ease` (`src/style.css:438`). `.aurora .aurora-ribbons` raises ribbon opacity from `0.55` to `0.9` (`src/style.css:449`, `463`). **`aurora-mode` on `<body>` has no CSS rule anywhere in `src/style.css`** (searched repo-wide; the only two hits are the add and remove calls in `src/ui/board.ts:2019` and `2118`). It is an inert class.

*How it differs visually from the base board.* The base board's grid is `#reel-grid` inside `.cabinet-frame` with ornaments and the payline guide honouring `state.paylineGuideOn` (`src/ui/board.ts:275-278`). The free-spin board hides that grid entirely and inserts `section.free-spins-panel`, which adds its own rounded panel background `linear-gradient(180deg, rgba(17,25,61,0.95), rgba(26,16,58,0.96))` at `z-index: 2` (`src/style.css:544-556`), renders the grid with `showGuide` forced to `false` (`src/ui/board.ts:2074`), and adds a second `aria-live` status line inside the panel. The `#bonus-banner` above the cabinet fills with kicker/title/stats and hides the level chip (`.bonus-banner--active .level-chip--cabinet { display: none; }`, `src/style.css:869`). The firefly jar meter is **not** updated during a free-spin session; `updateJar` is called in `animateSteps` (`src/ui/board.ts:1363`) and in `playTreatTimeOnMainBoard` (`src/ui/board.ts:1878`) but never in `playFreeSpinSession`.

*Spin counter.* `#fs-index` is set to `String(r + 1)` each round (`src/ui/board.ts:2063`). `#fs-total` is set to `totalBeforeRound`, computed as `session.initialSpins` for the first round and `r + (rounds[r-1].spinsRemaining ?? rounds.length - r)` afterwards (`src/ui/board.ts:2064-2067`). Because `spinsRemaining` is recorded as `initialSpins - 1 - r` on each round (`src/engine/freespins.ts:402`), the displayed total is constant at `initialSpins` for the whole session. `#fs-round-win` shows `round.totalWin.toLocaleString()` (`src/ui/board.ts:2068`).

*Per-step animation.* Each cascade step rewrites `#fs-grid` with `renderGridHtml(step.grid, step.keepsakeZone, false, winningLineIndices)`, toggles `panic-grid` on the grid for the doorbell wedge, adds `beam-drop` to every `.cell`, plays `playCascadeArpeggio(step.meterAfter)` plus `playWinPluck()` on a winning step or `playCascadeTick()` otherwise, then sleeps 360 ms (`src/ui/board.ts:2073-2093`). Unlike the base `animateSteps`, there is no `--drop-delay` stagger, no `symbol-pop` on the first step, no `spawnParticles`, no `beamToSaucers`, no `beam-up`, and no `win-flash` class (compare `src/ui/board.ts:1338-1394`).

*Doorbell audio.* For the panic wedge a `setInterval(playDoorbellRing, 3000)` runs for the whole session, fired once immediately, and is cleared in `finally` (`src/ui/board.ts:2053-2054`, `2114`). Additionally, any step whose grid contains a `doorbell` cell rings once per round (`src/ui/board.ts:2081-2084`); bonus grids suppress doorbells (`src/engine/freespins.ts:196`), so this branch is unreachable inside a bonus session.

*Panel classes.* `panic-free-spins` is added for the doorbell wedge, and `treat-time-free-spins treat-time-cabinet` for either Treat Time wedge (`src/ui/board.ts:2026`). `.treat-time-cabinet { position: relative; }` exists (`src/style.css:2755`); **`panic-free-spins` and `treat-time-free-spins` have no CSS rules anywhere** (repo-wide search returns only the board.ts assignment). They are inert.

*Orphaned CSS.* `.free-spins-panel-heading`, `.free-spins-panel-kicker`, `.free-spins-panel-stats` (`src/style.css:558-589`) are never emitted; the panel's `innerHTML` contains only `#fs-grid` and `#fs-status` (`src/ui/board.ts:2028-2031`). The heading now lives in `#bonus-banner`.

*Teardown.* `finally` clears the bell timer, removes the panel, un-hides `#reel-grid`, strips the aurora classes, empties `#bonus-banner` and removes `bonus-banner--active` (`src/ui/board.ts:2113-2122`).

**Forcing route:** none found. `playFreeSpinSession` is module-private (`src/ui/board.ts:2006`). `runFreeSpinSession` is exported from the engine (`src/engine/freespins.ts:383`) but produces data only, no DOM.

---

### were-multiplying
**Display name:** `We're Multiplying` (`src/engine/freespins.ts:428`), shown as the banner kicker; banner title is `Free Spins`.

**Source:** `src/engine/freespins.ts:76` `rollWildMultiplier`, `src/engine/freespins.ts:86` `MULTIPLIER_REEL`, `src/engine/freespins.ts:114` `multiplyingStartingGrid`, `src/engine/freespins.ts:172-174` (wiring in `spinFreeRound`), `src/ui/board.ts:396-409` (badge rendering in `renderGridHtml`), `src/ui/board.ts:2069-2071` (status line).

**Reachable in production:** yes, by two paths. Sparkle Wheel `multiplying` wedge (`src/ui/board.ts:1926`) and UniGlee chapter `were_multiplying` (`src/engine/uniglee-marathon.ts:57-58`, presented at `src/ui/board.ts:1565`).

**How it is reached:** `spinFreeRound` is called with `wedge === "multiplying"`; it then rolls `rollWildMultiplier` once **per counted free spin**, not per cascade (`src/engine/freespins.ts:73-75`, `172`).

**Trigger probability:** wedge selection 40/100 on the wheel (`src/engine/freespins.ts:36`). Per counted spin, the multiplier roll is (`src/engine/freespins.ts:76-83`):

| Roll range | Result | Probability |
|---|---|---|
| `r < 0.15` | no marked wild that spin | 15% |
| `0.15 ≤ r < 0.50` | ×2 | 35% |
| `0.50 ≤ r < 0.80` | ×3 | 30% |
| `0.80 ≤ r < 0.95` | ×5 | 15% |
| `r ≥ 0.95` | ×10 | 5% |

**Parent scene:** `sparkle-wheel`, and the UniGlee marathon chapter loop.

**Can contain:** nothing. It is a modifier layered onto `free-spin-board`.

**DOM root:** the `.cell` elements inside `#fs-grid`; the marked cell gains class `multiplier-wild` and an inner `span.multiplier-badge` (`src/ui/board.ts:396-409`).

**Verbatim copy:**

| Element | String |
|---|---|
| badge text (`src/ui/board.ts:398`) | `×${visibleMultiplier}` |
| badge `aria-label` (`src/ui/board.ts:398`) | `${visibleMultiplier} times wild` |
| `#fs-status` (`src/ui/board.ts:2070`) | `×${multiplier} wild on reel ${reel + 1}!` |
| banner kicker | `We're Multiplying` |

**Assets:** the marked cell is `wild_joey` or `wild_phoebe`, chosen 50/50 (`src/engine/freespins.ts:118`), drawn from `public/assets/atlases/special-symbol-atlas.png|webp` at column 1 row 0 and column 2 row 0 (`src/ui/asset-manifest.ts:58-59`). The badge itself is CSS only.

**CSS:** `.cell.multiplier-wild` (`src/style.css:1597-1599`), `.multiplier-badge` (`src/style.css:1601-1623`). Keyframes: `multiplier-badge-pop`, 420 ms `cubic-bezier(.34, 1.56, .64, 1) both`, from `scale(.45) rotate(-12deg)` at opacity 0 (`src/style.css:1625-1628`). The badge is a pill, `min-width: 29px; height: 25px`, `linear-gradient(145deg, #d35b2d, #7c2730)`, `2px solid #fff4e0` border, positioned `top: 3px; right: 3px; z-index: 3`.

**States and variants:**
- No-wild spin (15%): no badge, no status text; the previous round's status text is left in place because the status is only overwritten when `round.multiplierWild` exists (`src/ui/board.ts:2069`).
- ×2, ×3, ×5, ×10: the badge value. Reel placement is fixed by value, zero-based: ×2 to reel index 1, ×3 to 2, ×5 to 3, ×10 to 4 (`src/engine/freespins.ts:86`). Row is uniform random within that reel (`src/engine/freespins.ts:117`).
- Exactly one marked wild exists per counted spin, on the opening board only. Cascade refills never receive a marker (`src/engine/freespins.ts:108-112`).
- `renderGridHtml` reads `cell.multiplier ?? cell.handbagMultiplier` (`src/ui/board.ts:396`), so the same badge markup also serves the base-game handbag wild. In a `multiplying` bonus round the starting grid is drawn with `includeDoorbells: false, includeBoldChaiPump: false` (`src/engine/freespins.ts:115`) but handbag wilds are still on the reel-5 strip (`src/engine/reels.ts:99-102`), so a second badge from a handbag multiplier is possible on reel index 4.
- Payout application: the first multiplier found among a win's positions multiplies the payout, and a handbag multiplier multiplies on top (`src/engine/cascade.ts:281-291`).

**Forcing route:** none found for the scene. The badge markup alone can be produced by calling the exported `renderGridHtml` with a grid cell carrying `multiplier` (`src/ui/board.ts:384`); this is what `src/ui/board.test.ts:114-127` does.

---

### moonlit-keepsake-trail
**Display name:** `MOONLIT KEEPSAKE TRAIL`

**Source:** `src/ui/board.ts:1083`, `runKeepsakeMemoryBonus`. State machine: `src/engine/keepsake-memory.ts` in full. Controller adapter: `src/ui/board.ts:202` `createKeepsakeMemoryController`. Card markup: `src/ui/board.ts:1236` `renderKeepsakeMemoryCard`. Flip animation: `src/ui/board.ts:1246` `animateKeepsakeCard`. Backdrop: `src/ui/board.ts:1257` `keepsakeMemoryTrailSvg`.

**Reachable in production:** yes. `runWheelAndFreeSpins` runs it when the wheel returns `keepsake_memory` (`src/ui/board.ts:1907-1909`).

**How it is reached:** Sparkle Wheel lands `keepsake_memory`. A fresh state is built with an independent `mulberry32(productionSeed())` stream (`src/ui/board.ts:1908`).

**Trigger probability:** 35/100 of wheel spins (`src/engine/freespins.ts:37`), which are themselves gated by the free-spin ladder (measured ~1 in 150 spins, `src/engine/simulation.test.ts:83-87`). Board layout: 6 distinct symbols sampled without replacement from the 12 standard paying symbols, duplicated to 12 cards, Fisher-Yates shuffled (`src/engine/keepsake-memory.ts:32-52`).

**Parent scene:** `sparkle-wheel` only.

**Can contain:** on success, `standard-free-spins`, then `bonus-summary` (`src/ui/board.ts:1914-1919`). On failure, nothing: `runWheelAndFreeSpins` calls `renderBoard` and returns (`src/ui/board.ts:1910-1913`), so **a failed Trail shows no bonus summary at all**.

**DOM root:** `section.keepsake-memory-scene[aria-label="Moonlit Keepsake Trail memory bonus"]`, appended to `.cabinet-frame`; `#reel-grid` is hidden for the duration (`src/ui/board.ts:1089-1111`).

**Verbatim copy:** every player-visible or screen-reader-readable string.

| Element / trigger | String |
|---|---|
| `.keepsake-memory-header strong` (`src/ui/board.ts:1096`) | `MOONLIT KEEPSAKE TRAIL` |
| `.keepsake-memory-header span` (`src/ui/board.ts:1097`) | `Six keepsakes. Twelve stops. One path to follow.` |
| scene `aria-label` (`src/ui/board.ts:1092`) | `Moonlit Keepsake Trail memory bonus` |
| grid `aria-label` (`src/ui/board.ts:1100`) | `Twelve keepsake memory cards` |
| `#keepsake-memory-status` initial (`src/ui/board.ts:1099`) | `The trail is laid out. Memorize the keepsakes…` |
| status after preview ends (`src/ui/board.ts:1223`) | `The trail is ready. Choose a keepsake.` |
| status after first pick (`src/ui/board.ts:1183`) | `A keepsake is glowing. Find its match.` |
| status on a match (`src/ui/board.ts:1192`) | `Pair found. Keep following the trail.` |
| status on the sixth pair (`src/ui/board.ts:1192`) | `The whole trail is glowing!` |
| status on first mismatch (`src/ui/board.ts:1202`) | `A near-match. The trail is still glowing.` |
| status on second mismatch (`src/ui/board.ts:1201`) | `The keepsakes are taking a little night walk.` |
| status after a survivable mismatch resolves (`src/ui/board.ts:1212`) | `Choose the next keepsake pair.` |
| `#keepsake-memory-pairs` (`src/ui/board.ts:1102`, updated `1143`) | `Pairs ${pairsFound} / 6` |
| mismatch track `<b>` (`src/ui/board.ts:1104`) | `Mismatches` |
| mismatch track `<em>` (`src/ui/board.ts:1107`, updated `1146`) | `${usedFails} / ${maxFails}` |
| mismatch track `aria-label` (`src/ui/board.ts:1103`, updated `1145`) | `Mismatches ${usedFails} of ${maxFails}` |
| strike 0 `aria-label` initial (`src/ui/board.ts:1105`) | `First mismatch unused` |
| strike 1 `aria-label` initial (`src/ui/board.ts:1106`) | `Second mismatch unused` |
| strike `aria-label` after update (`src/ui/board.ts:1149`) | `Used first mismatch` / `Unused first mismatch` / `Used second mismatch` / `Unused second mismatch` |
| result, success (`src/ui/board.ts:1159`) | `All six pairs found! You win 40 free spins!` |
| result, failure (`src/ui/board.ts:1160`) | `Trail over — no free spins this time. The night is still lovely.` |
| card `aria-label`, face down (`src/ui/board.ts:1231`) | `Hidden keepsake card ${index + 1}` |
| card `aria-label`, revealed (`src/ui/board.ts:1233`) | `${symbolName} memory card, revealed` |
| card `aria-label`, matched (`src/ui/board.ts:1233`) | `${symbolName} memory card, matched` |

`symbolName` resolves from `PAYTABLE_SYMBOLS` (`src/ui/board.ts:169-183`), falling back to the literal `Keepsake` when no entry matches (`src/ui/board.ts:1232`): `Mermaid Tumbler`, `Midnight Butterfly`, `Glee Mix Tape`, `Crystal Cluster`, `Iced Chai To-Go`, `Cinnamon Candle`, `Glee Cardigan`, `Moonlit Book Stack`, `Butterfly Hair Clip`, `VHS Tape`, `Aurora Keepsake`, `Shared-Life Locket`.

The status div is `aria-live="polite"` (`src/ui/board.ts:1099`); the result div is `role="status" aria-live="assertive"` and starts `hidden` (`src/ui/board.ts:1110`).

**Assets:**
- Card back: `public/assets/keepsake-memory-card-back.png`, with `public/assets/optimized/keepsake-memory-card-back.webp` as the `<source>` (`src/ui/board.ts:1239` via `publicPicture`, `src/ui/board.ts:161-163`). `alt=""`.
- Mismatch overlay: `public/assets/keepsake-memory-mismatch-overlay.png` plus `public/assets/optimized/keepsake-memory-mismatch-overlay.webp` (`src/ui/board.ts:1241`). `alt=""`, wrapper is `aria-hidden="true"`.
- Card fronts: symbol atlas art via `symbolSvg` (`src/ui/board.ts:1240`), i.e. `public/assets/atlases/standard-symbol-atlas.png|webp` for all 12 eligible symbols (`src/ui/asset-manifest.ts:42-53`).
- Trail backdrop: inline SVG in `src/ui/board.ts:1257` `keepsakeMemoryTrailSvg` (one 500×320 path stroked three times plus three dots).

**CSS:** prefixes `.keepsake-memory-` and `.keepsake-card-` / `.keepsake-mismatch-`, at `src/style.css:1066-1133`. Keyframes: `keepsake-card-back-out`, `keepsake-card-front-in`, `keepsake-card-back-in`, `keepsake-card-front-out` (all 470 ms `cubic-bezier(.24, .72, .32, 1) both`, `src/style.css:1110-1113`), `keepsake-mismatch-pop` (180 ms, `src/style.css:1114`), `keepsake-card-reduced-fade` (180 ms, `src/style.css:1131`). Reduced motion: both `@media (prefers-reduced-motion: reduce)` (`src/style.css:1124-1130`) and `.cc-root[data-reduced-motion="true"]` (`src/style.css:1132`) swap the four flip animations for the fade.

**States and variants:**

*Twelve-card grid.* `.keepsake-memory-grid` is `grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(4, minmax(0, 1fr))` (`src/style.css:1078`), i.e. 3 columns × 4 rows. Cards are `<button type="button" class="keepsake-memory-card-button">` with `perspective: 700px` and `min-height: 48px` (`src/style.css:1079`).

*Card back.* `.keepsake-card-back` is the default-facing face: `radial-gradient(circle at 50% 35%, rgba(120,86,166,.72), transparent 48%), linear-gradient(145deg, #3d2764, #1d153f 72%)` with an inset 1 px `rgba(245,213,118,.35)` border ring via `::before` and the PNG stretched `object-fit: fill` with a mint drop shadow (`src/style.css:1088-1091`).

*Face-up state.* `.keepsake-memory-card.is-revealed` rotates the back to `rotateY(180deg)` and the front to `rotateY(0deg)` (`src/style.css:1093-1094`). `.keepsake-card-front` is `radial-gradient(circle at 50% 30%, #fff5d7, #d9c6ad 82%)` and holds the symbol at 82% of the card (`src/style.css:1092`, `1095`).

*Preview state.* All 12 cards are created `revealed: true` (`src/engine/keepsake-memory.ts:72-75`) and the phase is `preview`. The UI owns a 2500 ms timer, after which `controller.begin()` flips every card down (`src/ui/board.ts:1221-1226`, `src/engine/keepsake-memory.ts:88-95`). `KEEPSAKE_MEMORY_PREVIEW_MS = 2_500` (`src/engine/keepsake-memory.ts:18`) is exported but not imported by the UI; the literal `2500` is hard-coded at `src/ui/board.ts:1226`.

*Active-pick state.* The picked card's button gains `is-active`, which adds a `drop-shadow(0 0 7px rgba(255,241,163,.95))` plus an `::after` ring `2px solid #fff1a3` (`src/style.css:1081-1082`).

*Mismatch overlay.* On a mismatch the two buttons gain `is-mismatch`, which sets `.keepsake-mismatch-mark { display: flex }` with `keepsake-mismatch-pop` (`src/style.css:1109`). The mark sits `inset: 4%`, `z-index: 4`, `background: rgba(126,21,50,.16)`, `transform: rotate(-8deg)` (`src/style.css:1108`). The reveal lasts 900 ms, owned by the UI (`src/ui/board.ts:1203-1213`); `KEEPSAKE_MEMORY_MISMATCH_REVEAL_MS = 900` (`src/engine/keepsake-memory.ts:19`) is exported but not imported by the UI, and 900 is hard-coded at `src/ui/board.ts:1212`.

*Two-strike indicator.* `.keepsake-mismatch-track` holds a `<b>` label, two `<i data-strike="0|1">` pips, and an `<em>` counter (`src/ui/board.ts:1105-1110`). Unfilled pip: 10×10 circle, `1px solid rgba(255,244,224,.72)`, `background: rgba(20,14,48,.52)`. Filled pip (`is-filled`): `border-color: #ffb2a4; background: #b73b50; box-shadow: 0 0 5px rgba(255,90,98,.78)` (`src/style.css:1118-1119`). `maxFails = KEEPSAKE_MEMORY_MAX_FAILS = 2` (`src/engine/keepsake-memory.ts:16`, `81`).

*Success state.* Sixth pair sets phase `complete` and `freeSpinsAwarded = KEEPSAKE_MEMORY_FREE_SPINS = 40` (`src/engine/keepsake-memory.ts:17`, `140-144`). The UI waits 450 ms, then shows the result panel (`src/ui/board.ts:1193`), plays `playKeepsakeSuccess()`, waits 1500 ms, removes the scene and resolves with 40 (`src/ui/board.ts:1161-1169`).

*Failure state.* Second mismatch sets phase `failed` and `freeSpinsAwarded = 0` (`src/engine/keepsake-memory.ts:157-162`). The result panel takes class `is-failure`, which softens the border to `rgba(255,178,164,.78)` (`src/style.css:1122`), plays `playKeepsakeFailure()`, and resolves with 0 after the same 1500 ms.

*Completion handoff.* `runKeepsakeMemoryBonus` resolves with `view.freeSpinsAwarded`. `runWheelAndFreeSpins` treats `0` as a full exit (`renderBoard`, return) and any non-zero value as the spin count for a `runFreeSpinSession(rng, "standard", …)` session, followed by `showBonusSummary` and `maybeLevelUpAfterBonus` (`src/ui/board.ts:1909-1922`). The wheel's own `spinsAwarded` argument is discarded on this path.

*Rejected picks.* `pickKeepsakeMemoryCard` returns `accepted: false` with reasons `preview`, `ended`, `resolving`, `invalid_index`, `matched_card`, `same_card` (`src/engine/keepsake-memory.ts:108-120`); the UI silently ignores all of them (`src/ui/board.ts:1174-1175`), so there is no visible rejection state.

**Forcing route:** `runKeepsakeMemoryBonus` **is exported** (`src/ui/board.ts:1083`), as are the controller factory `createKeepsakeMemoryController` (`src/ui/board.ts:202`) and the engine's `createKeepsakeMemory` (`src/engine/keepsake-memory.ts:69`). Rendering it on demand requires a DOM containing `.cabinet-frame` and `#reel-grid`, i.e. a prior `renderBoard` call. No dev hash exists for it; `#board` (`src/main.ts:30`) gets you the host DOM.

---

### standard-free-spins
**Display name:** kicker `Standard Chai Chase`, title `Free Spins` (`src/ui/board.ts:2023-2024`)

**Source:** `src/ui/board.ts:1914`, inside `runWheelAndFreeSpins`; session from the `"standard"` overload of `runFreeSpinSession` (`src/engine/freespins.ts:374-380`).

**Reachable in production:** yes, on exactly one path: a completed Moonlit Keepsake Trail.

**How it is reached:** `earnedSpins !== 0` returned by `runKeepsakeMemoryBonus` (`src/ui/board.ts:1909-1913`). In practice `earnedSpins` is always 40 or 0 (`src/engine/keepsake-memory.ts:17`).

**Trigger probability:** wheel `keepsake_memory` at 35/100, times the player's success at matching all six pairs within two mismatches. The success probability is not a constant in the repo. UNVERIFIED: player skill is the deciding factor and the code records no expected completion rate.

**Parent scene:** `moonlit-keepsake-trail` (which is itself inside `sparkle-wheel`).

**Can contain:** `bonus-summary`.

**DOM root:** as `free-spin-board`.

**Verbatim copy:** as `free-spin-board`, with `displayWedgeLabel = "Standard Chai Chase"` and `title = "Free Spins"`. Panel `aria-label` is `Standard Chai Chase bonus spins`.

**Assets:** as `free-spin-board`.

**CSS:** as `free-spin-board`.

**States and variants:** no modifier applies. `spinFreeRound` with `wedge === "standard"` skips every branch and returns the plain cascade result with `extraWildsAdded: 0, panicWildsAdded: 0` (`src/engine/freespins.ts:216`). The status line therefore only ever shows `+N coins` or empty (`src/ui/board.ts:2106-2110`).

**Forcing route:** none found.

---

### chai-storm-splash
**Display name:** `WILD CHAI STORM`

**Source:** `src/ui/board.ts:2318`, `showChaiStormSplash`. Conversion math: `src/engine/freespins.ts:94` `convertChaiToWilds`. Cell animation: `src/ui/board.ts:2349` `animateChaiStormConversions`.

**Reachable in production:** yes. `playFreeSpinSession` awaits it when the session's wedge is `chai_back` and some round carries a `chaiRain` payload (`src/ui/board.ts:2056-2058`).

**How it is reached:** Sparkle Wheel lands `chai_back`; `runFreeSpinSession` is called without `allowChaiStorm: false`, so round 0 gets `activateChaiStorm: true` (`src/ui/board.ts:1926`, `src/engine/freespins.ts:395`). `spinFreeRound` then runs `convertChaiToWilds` on a fresh grid (`src/engine/freespins.ts:186-188`).

**Trigger probability:** 25/100 of wheel spins (`src/engine/freespins.ts:38`). Exactly one storm per session, on round 0 only: `activateChaiStorm: options.allowChaiStorm !== false && rounds.length === 0` (`src/engine/freespins.ts:395`), asserted by `src/engine/freespins.test.ts:86-87`. The converted count is the number of `chai` cells on the opening board, which is not a fixed constant; the `chai` strip weight is 6 per reel (`src/engine/reels.ts:60`).

**Parent scene:** `free-spin-board` running the `chai_back` wedge, which is inside `sparkle-wheel`. Never reached from Bold Chai or Treat Jar free spins, both of which pass `allowChaiStorm: false` (`src/ui/board.ts:1269`, `1294`).

**Can contain:** nothing.

**DOM root:** `div.chai-storm-splash`, appended to the `section.free-spins-panel` passed in as `parent` (`src/ui/board.ts:2320`, `2339`).

**Verbatim copy:**

| Element | String |
|---|---|
| `.chai-storm-kicker` (`src/ui/board.ts:2333`) | `AskJamie pours the sky open` |
| `h2` (`src/ui/board.ts:2334`) | `WILD CHAI STORM` |
| `p` (`src/ui/board.ts:2335`) | `Chai storm! Chai storm!` |
| `small`, converted count above zero (`src/ui/board.ts:2336`) | `${convertedCount} mermaid cups are becoming wild chai.` |
| `small`, converted count zero (`src/ui/board.ts:2336`) | `The mermaid cups are listening.` |

The copy block is `role="status" aria-live="assertive"` (`src/ui/board.ts:2332`). Both the drop layer and the sparkle layer are `aria-hidden="true"` (`src/ui/board.ts:2330-2331`).

**Assets:** CSS only. No image or SVG.

**CSS:** `.chai-storm-splash`, `.chai-storm-copy`, `.chai-storm-kicker`, `.chai-storm-drops`, `.chai-storm-drop`, `.chai-storm-sparkles` (`src/style.css:621-706`). Keyframes: `chai-storm-splash-in` (260 ms fade), `chai-storm-copy-pop` (640 ms `cubic-bezier(.34, 1.56, .64, 1)`), `chai-storm-drop-fall`, `chai-storm-sparkle` (`src/style.css:735-749`).

**States and variants:**

*Drop presentation.* 28 `<span class="chai-storm-drop">` elements are generated with deterministic per-index custom properties (`src/ui/board.ts:2322-2328`): `--drop-left: (index * 37) % 100` percent, `--drop-delay: ((index * 0.071) % 0.8)` seconds to two decimals, `--drop-duration: (0.8 + (index % 5) * 0.12)` seconds to two decimals, `--drop-size: 5 + (index % 4) * 2` px. Each drop is a teardrop, `border-radius: 70% 70% 65% 65%`, `height: calc(var(--drop-size) * 1.55)`, `linear-gradient(150deg, #fff4e0, #f5d576 45%, #d35b2d)`, glowing `0 0 10px rgba(245,213,118,.8)`, starting at `top: -12%` and falling to `translateY(122vh)` while rotating 12deg to 24deg (`src/style.css:685-697`, `741-745`).

*Glitter presentation.* Six `<i>` elements inside `.chai-storm-sparkles` at fixed positions 18%/17%, 27%/76%, 72%/12%, 76%/84%, 13%/52%, 86%/53%, with staggered delays 0, 120, 220, 340, 440, 560 ms; each is a 7 px dot with `box-shadow: 0 0 11px 3px rgba(245,213,118,.9)` pulsing `scale(.35)` to `scale(1.7)` on a 980 ms alternating loop (`src/ui/board.ts:2331`, `src/style.css:698-712`, `746-749`).

*Duration.* 1320 ms normally, 720 ms when `matchMedia("(prefers-reduced-motion: reduce)")` matches (`src/ui/board.ts:2341-2345`). `playChaiStorm(convertedCount)` fires on mount (`src/ui/board.ts:2340`).

*Zero-conversion state.* When the opening board has no `chai` symbols, `convertedCount` is 0 and the `small` line changes as tabled above. The splash still plays.

**Forcing route:** none found. `showChaiStormSplash` is module-private (`src/ui/board.ts:2318`).

---

### iced-chai-wild-rain-board
**Display name:** kicker `Iced Chai Wild Rain` (`src/engine/freespins.ts:434`), title `Free Spins`

**Source:** `src/engine/freespins.ts:94` `convertChaiToWilds`, `src/engine/freespins.ts:186-188` and `212-214` (wiring), `src/ui/board.ts:2349` `animateChaiStormConversions`, `src/ui/board.ts:400-409` (cell markup).

**Reachable in production:** yes, only via the wheel's `chai_back` wedge with the storm active.

**How it is reached:** as `chai-storm-splash`. Round 0 of the session opens on the converted grid.

**Trigger probability:** 25/100 of wheel spins (`src/engine/freespins.ts:38`).

**Parent scene:** `sparkle-wheel` -> `free-spin-board`.

**Can contain:** `chai-storm-splash` precedes it within the same panel.

**DOM root:** `.cell.chai-wild-cell` elements inside `#fs-grid`, each with an inner `span.chai-wild-badge` (`src/ui/board.ts:400-409`).

**Verbatim copy:**

| Element | String |
|---|---|
| cell `aria-label` (`src/ui/board.ts:408`) | `Mermaid cup wild chai` (cell also carries `role="img"`) |
| `.chai-wild-badge` text (`src/ui/board.ts:401`) | `WILD CHAI` (span is `aria-hidden="true"`) |
| `#fs-status` (`src/ui/board.ts:2103-2104`) | `WILD CHAI STORM! ${n} mermaid-cup wild chai!` or `WILD CHAI STORM! The chai sky is charged!` |

**Assets:** the converted symbol is `wild_chai`, drawn from `public/assets/atlases/special-symbol-atlas.png|webp` at column 0 row 1 (`src/ui/asset-manifest.ts:66`). `symbolSvg` adds the extra class `symbol-sprite--chai-wild` for this ID only (`src/ui/symbols.ts:38`).

**CSS:** `.chai-wild-cell` (`src/style.css:713-717`), `.chai-wild-badge` (`src/style.css:718-731`), `.chai-wild-conversion` (`src/style.css:732-734`). Keyframes: `chai-wild-conversion`, 520 ms `cubic-bezier(.34, 1.56, .64, 1) both`, `scale(.74)` with `brightness(1.8) saturate(1.3)` easing to normal (`src/style.css:750-754`).

**States and variants:**
- Converted cell: `linear-gradient(160deg, rgba(211,91,45,.28), rgba(245,213,118,.18))` background with a 2 px inset `rgba(245,213,118,.62)` ring and a `0 0 12px 2px rgba(211,91,45,.46)` glow.
- Conversion cascade: `animateChaiStormConversions` adds `chai-wild-conversion` to each converted cell staggered 70 ms apart, resolving after `560 + targets.length * 70` ms. Under reduced motion the stagger is 0 and the wait is 100 ms (`src/ui/board.ts:2350-2359`).
- The animation runs only on round 0 step 0 (`src/ui/board.ts:2078-2080`).
- Rounds 1..n of the same session have no `chaiRain` payload (`src/engine/freespins.test.ts:87`), so they render as an ordinary free-spin board; any `wild_chai` cells drawn later would still get the badge, but `wild_chai` is not on any reel strip (`src/engine/reels.ts:51-102`), so this cannot happen.
- Zero-conversion state: `chaiRain.wilds` is an empty array; no cells are styled, and the status line uses the "chai sky is charged" variant.

**Forcing route:** the cell markup can be produced by calling the exported `renderGridHtml` with a grid containing `wild_chai` cells (`src/ui/board.ts:384`); `src/ui/board.test.ts:128-141` does this. The full scene has no forcing route.

---

### keepsake-constellation
**Display name:** (no visible title)

**Source:** `src/engine/keepsake-constellation.ts` in full; zone roll wired at `src/engine/freespins.ts:185`; drawn at `src/ui/board.ts:413-419` inside `renderGridHtml`; grid mechanics at `src/engine/cascade.ts:107-140` `cascadeColumnAroundKeepsake` and `src/engine/keepsake-constellation.ts:92` `applyKeepsakeZone`.

**Reachable in production:** yes, but **only inside the UniGlee marathon**. `rollKeepsakeZone` is called only when `wedge === "keepsake_collection"` (`src/engine/freespins.ts:185`), and the only caller that passes that wedge is the UniGlee chapter runner (`src/engine/uniglee-marathon.ts:59-60`). It is unreachable from the Sparkle Wheel because `keepsake_collection` carries no weight (`src/engine/freespins.ts:35-39`). `spin()` accepts a `keepsakeZone` input (`src/engine/cascade.ts:213`) but no main-board caller supplies one (`src/ui/board.ts:838-845`, `234-238`).

**How it is reached:** a UniGlee capture fires, the marathon plan includes `keepsake_collection` among its middle three chapters (always, since all three of `UNIGLEE_MIDDLE_SUB_BONUSES` are used, `src/engine/uniglee.ts:19-23`, `src/engine/uniglee.ts:128-133`), and that chapter's rounds roll a non-empty zone.

**Trigger probability:** UniGlee capture is 1/2500 + 1/4000 + 1/7500 combined (`src/engine/uniglee.ts:31-35`), recorded as ~1 in 1,277 (`src/engine/uniglee.ts:38`, gated in `src/engine/simulation.test.ts:95-99`). Within the chapter, the zone is rolled once **per free spin** with these weights (`src/engine/keepsake-constellation.ts:11-19`):

| Entry | Footprint | Weight | Share of 100 |
|---|---|---|---|
| `{ weight: 27 }` | none, no giant that spin | 27 | 27% |
| `{ width: 2, height: 2 }` | 2×2 | 19 | 19% |
| `{ width: 2, height: 3 }` | 2×3 | 15 | 15% |
| `{ width: 2, height: 4 }` | 2×4 | 11 | 11% |
| `{ width: 3, height: 2 }` | 3×2 | 15 | 15% |
| `{ width: 3, height: 3 }` | 3×3 | 8 | 8% |
| `{ width: 3, height: 4 }` | 3×4 | 5 | 5% |

**Correction to the brief:** the giant symbol is not fixed at 2×2. Six footprints exist, of which 2×2 is the single most likely at 19%. Total weight is 100, and 73% of free spins produce a giant of some size.

Icon weights (`src/engine/keepsake-constellation.ts:24-34`): each of the 12 standard paying symbols carries `98 / 12 ≈ 8.1667`, `wild_joey` carries 1, `wild_phoebe` carries 1, so wild giants are exactly 2% of icon selections.

**Parent scene:** the UniGlee marathon's `keepsake_collection` chapter, presented through `free-spin-board` (`src/ui/board.ts:1565-1568`). No other parent.

**Can contain:** nothing.

**DOM root:** `div.keepsake-constellation`, appended after the five reel columns inside the grid container, holding one `div.keepsake-constellation-symbol` (`src/ui/board.ts:413-419`).

**Verbatim copy:**

| Element | String |
|---|---|
| `.keepsake-constellation` `aria-label` (`src/ui/board.ts:414`) | `${width} by ${height} giant keepsake` |

The container is also `aria-live="polite"` (`src/ui/board.ts:414`). No other text. The cells underneath the giant still render their own symbol markup with `aria-hidden="true"` images (`src/ui/symbols.ts:22-26`).

**Assets:** the giant reuses `symbolSvg(zone.symbol)` (`src/ui/board.ts:416`), so `public/assets/atlases/standard-symbol-atlas.png|webp` for the 12 paying symbols and `public/assets/atlases/special-symbol-atlas.png|webp` for the two rare wild giants (`src/ui/asset-manifest.ts:42-59`). The frame itself is CSS only.

**CSS:** `.keepsake-constellation` (`src/style.css:1191-1200`), `.keepsake-constellation-symbol` (`src/style.css:1202-1215`), `.keepsake-constellation-symbol svg` (`src/style.css:1217-1221`). Keyframes: `keepsake-constellation-shimmer`, 1.4 s `ease-in-out infinite alternate`, `scale(0.985)` at `brightness(0.96)` to `scale(1.015)` at `brightness(1.12)` (`src/style.css:1223-1226`), disabled under `@media (prefers-reduced-motion: reduce)` (`src/style.css:1228-1230`).

**States and variants:**

*How it is drawn.* The overlay is an absolutely positioned `inset: 6px` CSS grid of `repeat(5, minmax(0,1fr))` columns by `repeat(4, minmax(0,1fr))` rows with `gap: 4px`, matching the reel grid exactly, at `z-index: 3` and `pointer-events: none` (`src/style.css:1191-1200`). The single child is placed with inline `grid-column: ${leftReel + 1} / span ${width}; grid-row: ${topRow + 1} / span ${height}` (`src/ui/board.ts:415`), so the giant is one element spanning the footprint rather than a repeated symbol per cell. Its chrome is a 2 px `rgba(255,244,224,0.74)` border, `border-radius: 14px`, `radial-gradient(circle at 35% 25%, rgba(245,213,118,0.28), rgba(45,31,76,0.86) 72%)` fill, and a double glow `inset 0 0 22px rgba(159,232,197,0.28), 0 0 18px rgba(245,213,118,0.54)`.

*Placement.* Zero-based reels: a 3-wide zone is always anchored at `leftReel = 1`; a 2-wide zone is at `leftReel = 1` or `2` (`src/engine/keepsake-constellation.ts:62`). `topRow = Math.floor(rng() * (5 - height))` (`src/engine/keepsake-constellation.ts:63`). For `height: 4` this yields `topRow = 0` only; for `height: 3`, rows 0-1; for `height: 2`, rows 0-2. The zone therefore occupies only reels 1-3 (`src/engine/keepsake-constellation.ts:61`).

*Locked behaviour during cascades.* Every covered cell is painted with the zone's single symbol (`src/engine/keepsake-constellation.ts:92-99`), the giant does not fall, and ordinary symbols cascade in the independent segments above and below it (`src/engine/cascade.ts:107-140`).

*Re-roll on a win.* When a win touches the giant, the zone's symbol is re-rolled to a guaranteed different icon for the next cascade (`src/engine/cascade.ts:369-371`, `src/engine/keepsake-constellation.ts:49-54`). The `aria-label` changes only if width/height change, which they do not within a spin.

*Empty state.* 27% of chapter spins produce `undefined` and render no overlay at all (`src/engine/keepsake-constellation.ts:59`, `src/ui/board.ts:413`).

*Wild-giant state.* 2% of icon selections are `wild_joey` or `wild_phoebe`; visually identical framing, different atlas cell.

**Forcing route:** partial. `renderGridHtml` is exported (`src/ui/board.ts:384`) and takes a `keepsakeZone` as its second argument, so any footprint can be rendered on demand with a hand-built zone object. `rollKeepsakeZone`, `applyKeepsakeZone`, and `keepsakePositions` are all exported (`src/engine/keepsake-constellation.ts:57`, `92`, `73`). There is no dev hash and no exported scene runner.

---

### treat-time-entry-morning
**Display name:** `IT'S TREAT TIME!`

**Source:** `src/ui/board.ts:1825`, `showTreatTimeEntry` with `mode === "morning"`. Trigger math: `src/engine/treattime.ts:32` `rollTreatTimeTrigger`.

**Reachable in production:** yes. `runSpin` calls `runTreatTimeBonus` whenever `result.treatTimeBonus` exists (`src/ui/board.ts:913-914`), and `runTreatTimeBonus` awaits `showTreatTimeEntry` first (`src/ui/board.ts:1809`).

**How it is reached:** a main-board spin with `spinArea === "main"`, `allowTreatTimeBonus` true, and a supplied `treatTimeRng` (`src/engine/cascade.ts:349-351`); `runSpin` supplies `treatTimeRng: mulberry32(seed ^ 0x9e3779b9)` (`src/ui/board.ts:840`). Bonus rounds always pass `allowTreatTimeBonus: false` (`src/engine/freespins.ts:200`), so Treat Time cannot nest inside another bonus.

**Trigger probability:** `TREAT_TIME_TRIGGER_RATES.morning = 1 / 250` (`src/engine/treattime.ts:12`). With the default `"either"` mode the nighttime slice is tested first, so morning occupies `[1/500, 1/500 + 1/250)` (`src/engine/treattime.ts:44-46`). Spins awarded: `TREAT_TIME_SPIN_RANGES.morning = [5, 8]`, inclusive, uniform (`src/engine/treattime.ts:17`, `52-56`). A code comment at `src/engine/treattime.ts:26-30` records that an earlier comment claimed 1/100 and 1/300 and was corrected on 2026-08-09; the constants are authoritative.

**Parent scene:** none. It opens directly from a base spin.

**Can contain:** `treat-time-main-board`.

**DOM root:** `div.treat-time-entry.treat-time-entry--main.treat-time-entry--morning`, appended to `.cabinet-frame` (`src/ui/board.ts:1828-1838`).

**Verbatim copy:**

| Element | String |
|---|---|
| `.treat-time-entry-title` (`src/ui/board.ts:1833`) | `IT'S TREAT TIME!` |
| `.treat-time-entry-sub` (`src/ui/board.ts:1834`) | `Phoebe's morning Chicken Comets are READY!` |
| `.treat-time-entry-spins` (`src/ui/board.ts:1835`) | `${spinsAwarded} free spins · every spin gets a treat toss` |

The overlay has no `role`, no `aria-live`, and no `aria-label` (`src/ui/board.ts:1828-1837`). None of this copy is announced.

**Assets:** inline SVG in `src/ui/board.ts:2410` `treatTimeHandSvg`, mounted in `.treat-time-entry-hand` (`src/ui/board.ts:1831`). On this variant that element is hidden: `.treat-time-entry--main .treat-time-entry-hand { display: none; }` (`src/style.css:2729`). No raster assets.

**CSS:** `.treat-time-entry`, `.treat-time-entry--night`, `.treat-time-entry-hand`, `.treat-time-entry-copy`, `.treat-time-entry--main`, `.treat-time-entry-title`, `.treat-time-entry-sub`, `.treat-time-entry-spins` (`src/style.css:2684-2753`). Keyframes: `treat-time-entry-in` (260 ms fade, `src/style.css:2788`), `treat-time-copy-pop` (520 ms `cubic-bezier(.34, 1.56, .64, 1)`, `src/style.css:2789-2793`), `treat-time-hand-sweep` (declared at `src/style.css:2794-2799`, not used on this variant because the hand is hidden).

**States and variants:** morning fill is `radial-gradient(ellipse at 52% 48%, rgba(245,213,118,.42), rgba(21,15,48,.9) 78%)` (`src/style.css:2718-2724`). The `--main` variant is `inset: 8px` with `border-radius: 14px` and `align-items: stretch`, and the copy card is full width with `padding: 12px 14px` (`src/style.css:2718-2730`). Lifetime is 1350 ms, then the overlay is removed (`src/ui/board.ts:1840-1843`). `playTreatTimeCue(mode)` fires on mount (`src/ui/board.ts:1839`).

**Forcing route:** none found. `showTreatTimeEntry` is module-private (`src/ui/board.ts:1825`).

---

### treat-time-entry-nighttime
**Display name:** `IT'S TREAT TIME!`

**Source:** `src/ui/board.ts:1825`, `showTreatTimeEntry` with `mode === "nighttime"`.

**Reachable in production:** yes, from a base spin. **Not** reached on the UniGlee path: the marathon runs the nighttime Treat Time chapter through `playFreeSpinSession` directly (`src/ui/board.ts:1565-1568`) and never calls `showTreatTimeEntry`.

**How it is reached:** identical to the morning entry, with `selected === "nighttime"`.

**Trigger probability:** `TREAT_TIME_TRIGGER_RATES.nighttime = 1 / 500` (`src/engine/treattime.ts:13`). Under `"either"` mode nighttime is tested first and takes precedence (`src/engine/treattime.ts:44-45`). Spins awarded: `TREAT_TIME_SPIN_RANGES.nighttime = [8, 14]`, inclusive (`src/engine/treattime.ts:18`).

**Parent scene:** none.

**Can contain:** `treat-time-main-board`.

**DOM root:** `div.treat-time-entry.treat-time-entry--main.treat-time-entry--night` (`src/ui/board.ts:1829`).

**Verbatim copy:**

| Element | String |
|---|---|
| `.treat-time-entry-title` | `IT'S TREAT TIME!` |
| `.treat-time-entry-sub` (`src/ui/board.ts:1834`) | `Phoebe found the nighttime spread — Joey is awake too!` |
| `.treat-time-entry-spins` | `${spinsAwarded} free spins · every spin gets a treat toss` |

**Assets:** as the morning entry.

**CSS:** as the morning entry, plus `.treat-time-entry--main.treat-time-entry--night { background: radial-gradient(ellipse at 52% 48%, rgba(107,214,201,.34), rgba(21,15,48,.92) 78%); }` (`src/style.css:2726-2728`). The mint fill is the only visual difference from morning.

**States and variants:** as the morning entry.

**Forcing route:** none found.

---

### treat-time-main-board
**Display name:** no overlay title; the marquee status line carries the label.

**Source:** `src/ui/board.ts:1848`, `playTreatTimeOnMainBoard`; wild casting at `src/ui/board.ts:2362` `animateTreatTimeCast`; engine at `src/engine/treattime.ts:74` `castTreatTimeWilds`.

**Reachable in production:** yes, always immediately after either Treat Time entry (`src/ui/board.ts:1813`).

**How it is reached:** `runTreatTimeBonus` builds the session with wedge `treat_time_morning` or `treat_time_nighttime` (`src/ui/board.ts:1808`, `1812`) and plays it on the primary cabinet rather than in a bonus panel.

**Trigger probability:** inherits the entry's, 1/250 morning and 1/500 nighttime.

**Parent scene:** `treat-time-entry-morning` or `treat-time-entry-nighttime`.

**Can contain:** nothing. `spinFreeRound` for these wedges suppresses doorbells, the chai pump, and Treat Time itself (`src/engine/freespins.ts:196-201`).

**DOM root:** the existing `#reel-grid` inside `.cabinet-frame`; `.cc-shell` gains `treat-time-main-mode` for the duration (`src/ui/board.ts:1860`, removed at `1897`). The cast overlay is `div.treat-time-cast-layer` appended to `.cabinet-frame` (`src/ui/board.ts:2364-2366`).

**Verbatim copy:**

| Element | String |
|---|---|
| `#marquee-status` per round (`src/ui/board.ts:1866`) | `${Morning\|Nighttime} Treat Time · Spin ${n} of ${total}` |
| `#marquee-status` on a winning round (`src/ui/board.ts:1892`) | `Treat Time · +${totalWin.toLocaleString()} coins` |
| `setStatus` after the session (`src/ui/board.ts:1821`) | `IT'S TREAT TIME! Complete — +${totalWin.toLocaleString()} coins · ${totalSpins} spins` plus, when `retriggers > 0`, ` · ${retriggers} retrigger` (`s` appended when greater than 1) |

`#marquee-status` is `aria-live="polite"` (`src/ui/board.ts:260`).

**Assets:** cast tokens reuse `symbolSvg` for `treat_chicken`, `treat_salmon`, `treat_bougie` from `public/assets/atlases/standard-symbol-atlas.png|webp` at column 0/1/2 row 3 (`src/ui/board.ts:2370-2374`, `src/ui/asset-manifest.ts:54-56`). The casting hand is inline SVG in `src/ui/board.ts:2410` `treatTimeHandSvg`.

**CSS:** `.treat-time-main-mode .cabinet-shell` (`src/style.css:2731-2733`), `.treat-time-cast-layer`, `.treat-time-hand`, `.treat-time-token`, `.treat-time-wild-land` (`src/style.css:2756-2787`). Keyframes: `treat-time-hand-sweep` (900 ms here, `src/style.css:2794-2799`), `treat-time-token-toss` (820 ms, `src/style.css:2800-2805`), `treat-time-wild-land` (360 ms, `src/style.css:2806-2810`).

**States and variants:**

*Wild-cast presentation.* Per counted spin, `castTreatTimeWilds` places 0 to 4 unique treats on distinct cells (`TREAT_TIME_WILD_RANGE = { min: 0, max: 4 }`, `src/engine/treattime.ts:21`, `81`). Morning always casts `chicken`; nighttime rolls `chicken` at 45%, `salmon` at 35%, `bougie` at 20% (`src/engine/treattime.ts:59-65`). Each treat is stored in engine state as its character wild: `bougie` becomes `wild_joey`, `chicken` and `salmon` become `wild_phoebe` (`src/engine/treattime.ts:67-69`).

*The toss.* `animateTreatTimeCast` measures the stage rect, creates one absolutely positioned `div.treat-time-token` per wild sized to the target cell, starting at `left: 8px` and `top: max(8, stageHeight - 76)`, with `--target-x` / `--target-y` deltas and `--treat-delay: index * 38ms` (`src/ui/board.ts:2369-2397`). On the next animation frame the layer gains `is-casting`, which starts the hand sweep and every token toss. After 980 ms (90 ms under reduced motion) each target cell gains `treat-time-wild-land`, `playTreatLand(wilds.length)` fires, and the layer is removed (`src/ui/board.ts:2401-2406`).

*Landing style.* `.treat-time-wild-land` adds `inset 0 0 0 2px rgba(159,232,197,.74)` plus `0 0 18px 3px rgba(245,213,118,.7)` and a 360 ms overshoot from `scale(.72) brightness(1.7)` (`src/style.css:2784-2787`, `2806-2810`).

*Cabinet framing.* `treat-time-main-mode` adds a mint inner ring and butter glow to `.cabinet-shell` (`src/style.css:2731-2733`). The bonus panel is never created, `#reel-grid` is never hidden, and `#bonus-banner` is never filled: this is the one bonus that plays on the primary board.

*Per-step behaviour.* Unlike `playFreeSpinSession`, this runner calls `updateJar(root, step.meterAfter)`, `beamToSaucers(root)`, and adds `win-flash` to each winning cell (`src/ui/board.ts:1874-1887`), matching the base board rather than the free-spin panel. Step sleep is 360 ms, plus 400 ms between rounds (`src/ui/board.ts:1888`, `1894`).

*Zero-wild spin.* When `count` is 0, `round.treatTimeWilds` is an empty array, the `?.length` guard fails, and no cast overlay is created (`src/ui/board.ts:1870-1872`).

*Retrigger clause.* `session.retriggers` is always 0 (see `bonus-summary`), so the trailing retrigger phrase in the completion status is unreachable.

**Forcing route:** none found. `playTreatTimeOnMainBoard` and `runTreatTimeBonus` are both module-private (`src/ui/board.ts:1848`, `1802`).

---

### doorbell-panic-banner
**Display name:** `DOORBELL PANIC!`

**Source:** `src/ui/board.ts:1314`, `showDoorbellPanic`. Trigger detection: `src/engine/paylines.ts:83` `findBlockerTrigger` and `src/engine/paylines.ts:95` `findDoorbellTrigger`. Spin count: `src/engine/cascade.ts:238-241` `rollDoorbellFreeSpins`.

**Reachable in production:** yes, with one exception. `runSpin` calls it in the `else if (result.doorbellPanic)` branch (`src/ui/board.ts:888-890`), which is skipped when the same spin also triggered UniGlee (`src/ui/board.ts:881`). In that case `runDoorbellPanic` still runs later (`src/ui/board.ts:918`), so the panic spins can occur without the banner.

**How it is reached:** the doorbell symbol occupies both reel 1 and reel 2 on the same payline (`src/engine/paylines.ts:83-93`). Doorbell cells are placed only on the main board: reel 1 at `1/17` and reel 2 at `1/30`, each rolled independently, and only when no other blocker family was chosen (`src/engine/reels.ts:20-22`, `162-179`).

**Trigger probability:** `DOORBELL_REEL_ONE_RATE = 1 / 17`, `DOORBELL_REEL_TWO_RATE = 1 / 30` (`src/engine/reels.ts:21-22`). Both must land and the two placed rows must coincide with one of the 40 paylines' first two rows. Free spins awarded: `3 + Math.floor(rng() * 4)`, i.e. 3 to 6 inclusive, retuned from 5-20 in the 2026-07 pass (`src/engine/cascade.ts:238-241`). No measured doorbell rate is recorded in the repo. UNVERIFIED: the joint probability including payline alignment is not computed anywhere in the codebase, and `src/engine/simulation.test.ts` does not gate it.

**Parent scene:** none. It is a base-spin outcome.

**Can contain:** `doorbell-panic-free-spins`.

**DOM root:** `div.doorbell-panic-banner`, appended to `.cc-root` (`src/ui/board.ts:1323-1330`). The two triggering cells in `#reel-grid` additionally gain the class `doorbell-ringing` (`src/ui/board.ts:1320-1322`).

**Verbatim copy:**

| Element | String |
|---|---|
| `.doorbell-panic-title` (`src/ui/board.ts:1327`) | `DOORBELL PANIC!` |
| `.doorbell-panic-sub` (`src/ui/board.ts:1328`) | `Joey &amp; Phoebe fled into ${spinsAwarded} free spins!` (renders as `Joey & Phoebe fled into N free spins!`) |

The banner has no `role`, no `aria-live`, and no `aria-label` (`src/ui/board.ts:1323-1329`), and is `pointer-events: none` (`src/style.css:2839`). None of it is announced.

**Assets:** `public/assets/symbols/doorbell.svg` via `symbolSvg("doorbell")` (`src/ui/board.ts:1326`, `src/ui/asset-manifest.ts:67`). The `<img>` is `alt="" aria-hidden="true"` (`src/ui/symbols.ts:22-24`).

**CSS:** `.doorbell-ringing` (`src/style.css:2816-2822`), `.doorbell-panic-banner` (`src/style.css:2829-2843`), `.doorbell-panic-bell` (`src/style.css:2844-2848`), `.doorbell-panic-title` (`src/style.css:2850-2866`), `.doorbell-panic-sub` (`src/style.css:2868-2876`). Keyframes: `doorbell-ring` (180 ms alternating rotate/scale on the trigger cells, `src/style.css:2824-2827`), `panic-screen-shake` (150 ms alternating, on the banner itself, `src/style.css:2878-2881`), `panic-bell-pop` (460 ms, `src/style.css:2882-2886`), `panic-title-pop` (520 ms, `src/style.css:2887-2891`).

**States and variants:**
- Single state. Lifetime is 1550 ms, after which the overlay is removed and the promise resolves (`src/ui/board.ts:1331-1335`). The `doorbell-ringing` classes on the trigger cells are never explicitly removed; they disappear when the grid is re-rendered.
- `playStrangerDangerPanic()` fires immediately before the banner (`src/ui/board.ts:889`).
- Banner fill: `radial-gradient(ellipse at 50% 46%, rgba(211,91,45,.72), rgba(21,15,48,.88) 72%)` at `z-index: 55`.

**Forcing route:** none found. `showDoorbellPanic` is module-private (`src/ui/board.ts:1314`).

---

### doorbell-panic-free-spins
**Display name:** kicker `Doorbell Panic`, title `Panic Spins` (`src/ui/board.ts:2023-2024`, `src/engine/freespins.ts:432`)

**Source:** `src/ui/board.ts:1941`, `runDoorbellPanic`; wild placement at `src/engine/freespins.ts:146` `panicStartingGrid`.

**Reachable in production:** yes. `runSpin` routes to it when `result.freeSpinsAwarded > 0 && result.doorbellPanic` (`src/ui/board.ts:917-918`). Because `freeSpinsAwarded` is set to the doorbell's own award whenever a doorbell trigger exists (`src/engine/cascade.ts:354-359`), every doorbell trigger reaches this scene.

**How it is reached:** as `doorbell-panic-banner`.

**Trigger probability:** as `doorbell-panic-banner`. Session length 3 to 6 spins.

**Parent scene:** `doorbell-panic-banner` normally; when the same spin also captured UniGlee, this scene runs after the marathon with no banner (`src/ui/board.ts:881-887`, `917-918`).

**Can contain:** `bonus-summary` (`src/ui/board.ts:1951`).

**DOM root:** as `free-spin-board`, with the panel additionally classed `panic-free-spins` (no CSS) and `#fs-grid` toggled to `panic-grid` each step (`src/ui/board.ts:2026`, `2087`).

**Verbatim copy:** as `free-spin-board`, with `displayWedgeLabel = "Doorbell Panic"`, `title = "Panic Spins"`, panel `aria-label = "Doorbell Panic bonus spins"`, and the panic status line `DOORBELL PANIC! ${panicWildsAdded} flying wild cats!` (`src/ui/board.ts:2097`).

**Assets:** the placed wilds are `wild_joey` and `wild_phoebe` from `public/assets/atlases/special-symbol-atlas.png|webp` (`src/ui/asset-manifest.ts:58-59`).

**CSS:** as `free-spin-board`, plus `.panic-grid .cell[data-symbol="wild_joey"], .panic-grid .cell[data-symbol="wild_phoebe"]` (`src/style.css:2893-2897`). Keyframes: `panic-wild-land`, 420 ms `cubic-bezier(.34, 1.56, .64, 1) both`, dropping from `translateY(-90%) rotate(-15deg) scale(.45)` (`src/style.css:2899-2903`).

**States and variants:**

*Cat-wild placement round.* Each counted spin builds its opening grid from `panicStartingGrid` (`src/engine/freespins.ts:146-168`): `count = 3 + Math.floor(rng() * 4)`, i.e. 3 to 6 placements. Each placement picks a random payline, a random reel index, and takes that line's row on that reel; if the cell is already occupied it retries up to 10 times. Wilds alternate deterministically by index: even placements are `wild_joey`, odd are `wild_phoebe` (`src/engine/freespins.ts:164`). `panicWildsAdded` is the size of the occupied set, so collisions after 10 retries reduce the effective count below `count`. Range asserted 3 to 6 in `src/engine/freespins.test.ts:127-128`.

*Audio.* `playDoorbellRing` fires immediately and then every 3000 ms for the whole session (`src/ui/board.ts:2054-2055`). On a panic round the status update also fires `playJoeyCue()` and `playPhoebeCue()` and holds 520 ms (`src/ui/board.ts:2098-2100`).

*Every round is a panic round.* `panicWildsAdded` is at least 3, so the `> 0` branch always wins and the plain `+N coins` status never appears in this session (`src/ui/board.ts:2096-2110`).

*Loss state.* A round with no line wins still shows the panic status; the round-win stat reads `0`.

**Forcing route:** none found. `runDoorbellPanic` is module-private (`src/ui/board.ts:1941`).

---

### bold-chai-pump-scene
**Display name:** `BOLD CHAI!`

**Source:** `src/ui/board.ts:943`, `runBoldChaiBonus`. State machine: `src/engine/bold-chai-pump.ts` in full. Trigger detection: `src/engine/paylines.ts:101` `findBoldChaiTrigger`.

**Reachable in production:** yes. `runSpin` routes to it in the `else if (result.boldChaiPump)` branch (`src/ui/board.ts:891-892`), skipped when UniGlee or a doorbell fired on the same spin.

**How it is reached:** the `chai_pump` symbol occupies both reel 1 and reel 2 on the same payline (`src/engine/paylines.ts:83-93`, `101-103`). Pump cells are placed only when the doorbell family did not win the blocker selection (`src/engine/reels.ts:162-179`).

**Trigger probability:** `BOLD_CHAI_REEL_ONE_RATE = 1 / 17`, `BOLD_CHAI_REEL_TWO_RATE = 1 / 30` (`src/engine/reels.ts:25-26`), gated behind the doorbell family losing its own two rolls, and then requiring payline alignment. No measured rate is recorded. UNVERIFIED: the joint probability is not computed anywhere in the codebase and `src/engine/simulation.test.ts` does not gate it.

**Parent scene:** none. It is a base-spin outcome.

**Can contain:** `bold-chai-free-spins` (only when at least one cup is completed).

**DOM root:** `section.bold-chai-scene[aria-label="Bold Chai rapid pump bonus"]`, appended to `.cabinet-frame`; `#reel-grid` is hidden for the duration (`src/ui/board.ts:949-969`).

**Verbatim copy:**

| Element | String |
|---|---|
| scene `aria-label` (`src/ui/board.ts:952`) | `Bold Chai rapid pump bonus` |
| `.bold-chai-headline strong` (`src/ui/board.ts:954`) | `BOLD CHAI!` |
| `.bold-chai-headline span` (`src/ui/board.ts:954`) | `Barista mode · 12 pumps per strong chai` (the `12` is a literal, not `${BOLD_CHAI_PUMPS_PER_CUP}`) |
| `#bold-chai-seconds` initial (`src/ui/board.ts:955`) | `30.0` |
| timer `small` (`src/ui/board.ts:955`) | `seconds` |
| button `aria-label` (`src/ui/board.ts:965`) | `Press the chai pump` |
| button text (`src/ui/board.ts:966`) | `PRESS PUMP ` followed by `#bold-chai-count` |
| `#bold-chai-count` (`src/ui/board.ts:966`, repainted `999`) | `${pumpsInCurrentCup} / 12` |
| `#bold-chai-status` initial (`src/ui/board.ts:968`) | `Tap fast — make it strong!` |
| status while swapping (`src/ui/board.ts:1006`) | `Swap the cup — keep moving!` |
| status on cup completion (`src/ui/board.ts:1059`) | `Strong chai! Empty cup coming in…` |
| status at timeout (`src/ui/board.ts:1028`) | `Time! Counting your strong chais…` |
| cup `alt` while swapping (`src/ui/board.ts:1004`) | `Barista swapping the full iced chai cup` |
| cup `alt` otherwise (`src/ui/board.ts:1009`) | `Clear iced chai cup with ice` |

The timer div is `aria-live="polite"` (`src/ui/board.ts:955`) and the status div is `aria-live="polite"` (`src/ui/board.ts:968`). The layered art wrapper is `aria-hidden="true"` (`src/ui/board.ts:957`).

**Assets:** every file under `public/assets/bold-chai/` is used by this scene, resolved through `boldChaiAsset` (`src/ui/board.ts:165-167`).

| File | Where used |
|---|---|
| `public/assets/bold-chai/pump-body.svg` | static base layer (`src/ui/board.ts:958`) |
| `public/assets/bold-chai/plunger-up.svg` | initial plunger and rest state (`src/ui/board.ts:959`, `981`, `992`) |
| `public/assets/bold-chai/plunger-mid.svg` | plunger 68 ms after a press (`src/ui/board.ts:981`, `991`) |
| `public/assets/bold-chai/plunger-down.svg` | plunger at press instant (`src/ui/board.ts:981`, `990`) |
| `public/assets/bold-chai/spout.svg` | static layer above the plunger (`src/ui/board.ts:960`) |
| `public/assets/bold-chai/fill-01.svg` | initial `#bold-chai-fill` src, hidden (`src/ui/board.ts:961`) |
| `public/assets/bold-chai/fill-01.svg` … `fill-12.svg` | one per `pumpsInCurrentCup` value 1-12, selected by `fill-${String(n).padStart(2,"0")}.svg` (`src/ui/board.ts:1011`) |
| `public/assets/bold-chai/cup-empty.svg` | cup while pumping (`src/ui/board.ts:962`, `1008`) |
| `public/assets/bold-chai/cup-swap.svg` | cup during the reset window (`src/ui/board.ts:1003`) |

All 19 files in that directory are accounted for: `pump-body`, `spout`, `cup-empty`, `cup-swap`, `plunger-up`, `plunger-mid`, `plunger-down`, and `fill-01` through `fill-12`.

**CSS:** `.bold-chai-scene`, `.bold-chai-headline`, `.bold-chai-timer`, `.bold-chai-workbench`, `.bold-chai-layered-art`, `.bold-chai-layer`, `.bold-chai-fill`, `.bold-chai-cup`, `.bold-chai-pump-button`, `.bold-chai-status` (`src/style.css:1040-1058`), plus the state selectors `.bold-chai-scene[data-plunger-state="down"] .bold-chai-layered-art` and `.bold-chai-scene.is-resetting .bold-chai-layered-art` (`src/style.css:1059-1060`). Keyframes: `bold-chai-cup-rattle`, 130 ms `ease-in-out infinite alternate`, `translateX(-2px) rotate(-1.5deg)` to `translateX(2px) rotate(1.5deg)` (`src/style.css:1061`).

**States and variants:**

*Pump scene layering.* `.bold-chai-layered-art` is a `3 / 4` aspect box holding five absolutely positioned `<img>` layers in DOM order body, plunger, spout, fill (`z-index: 4`), cup (`z-index: 5`), with a `::after` inner glow at `z-index: 6` (`src/style.css:1048-1052`).

*Timer.* `BOLD_CHAI_DURATION_MS = 30_000` (`src/engine/bold-chai-pump.ts:12`). The countdown is repainted every animation frame as `(max(0, 30000 - elapsed) / 1000).toFixed(1)` (`src/ui/board.ts:998`). The clock starts on the **first accepted pump**, not on scene open: `startedAtMs` is undefined until then, so the display sits at `30.0` indefinitely if the player never presses (`src/engine/bold-chai-pump.ts:63-65`, `src/ui/board.ts:997`). `frame()` only checks expiry once `startedAtMs` is set (`src/ui/board.ts:1041`), so an untouched scene never ends.

*Twelve fill stages.* `BOLD_CHAI_PUMPS_PER_CUP = 12` (`src/engine/bold-chai-pump.ts:13`). `#bold-chai-fill` is `hidden` at 0 pumps and shows `fill-01.svg` through `fill-12.svg` for pump counts 1 to 12 (`src/ui/board.ts:1002-1015`). `scene.dataset.fillLevel` mirrors `pumpsInCurrentCup` every paint (`src/ui/board.ts:1001`); no CSS rule reads `data-fill-level`.

*Plunger states.* Three: `up`, `mid`, `down`, driven by `setPlungerState`, which swaps the `src` and writes `scene.dataset.plungerState` (`src/ui/board.ts:981-985`). A press sets `down` immediately, `mid` at 68 ms, `up` at 150 ms, cancelling any queued timers first (`src/ui/board.ts:987-993`). `data-plunger-state="down"` nudges the whole art group `translateY(2px) scale(.985)` (`src/style.css:1059`).

*Cup-swap state.* Reaching 12 pumps moves the machine to phase `resetting` with `resetUntilMs = now + BOLD_CHAI_CUP_RESET_MS`, `BOLD_CHAI_CUP_RESET_MS = 3_000` (`src/engine/bold-chai-pump.ts:16`, `71-88`). During that window the cup image becomes `cup-swap.svg`, the fill layer is hidden, the scene gains `is-resetting` and rattles, and the status reads `Swap the cup — keep moving!` (`src/ui/board.ts:1000-1006`). Pumps during the window are rejected with reason `resetting` (`src/engine/bold-chai-pump.ts:51-54`). The first pump after the window resets `pumpsInCurrentCup` to 0 and resumes (`src/engine/bold-chai-pump.ts:55`). `settleBoldChaiPump` also clears the reset once the window elapses even without input (`src/engine/bold-chai-pump.ts:108-110`).

*Award.* `BOLD_CHAI_FREE_SPINS_PER_CUP = 3` (`src/engine/bold-chai-pump.ts:14`), added on each completed cup (`src/engine/bold-chai-pump.ts:72-73`). `completeBoldChaiPump` reports `totalPumps`, `completedChais`, `partialPumps` (zeroed when the last cup was exactly full), `freeSpinsAwarded`, and `endedBecause: "timeout"` (`src/engine/bold-chai-pump.ts:114-125`). Only `freeSpinsAwarded` reaches the UI (`src/ui/board.ts:1029`).

*End state.* `finish()` plays `playBoldChaiTimerBuzzer()`, disables the button, forces the plunger to `up`, sets the status to `Time! Counting your strong chais…`, then after 750 ms clears `setBoldChaiUrgency(false)`, removes the scene, un-hides `#reel-grid`, and resolves (`src/ui/board.ts:1019-1036`).

*Zero-cup loss state.* If fewer than 12 pumps are registered, `freeSpinsAwarded` is 0, `boldChaiSpinsAwarded > 0` is false, and `runSpin` falls through with no free-spin session (`src/ui/board.ts:925`). No dedicated "you got nothing" copy exists; the scene simply closes on the `Time!` status.

*Input.* `pointerdown` on the button, and `Enter` or space via `keydown`, both `preventDefault()` and register a pump at `performance.now()` (`src/ui/board.ts:1063-1070`). Rejected pumps repaint but produce no feedback beyond the status text already showing.

*Audio.* `setBoldChaiUrgency(true)` on open and `false` on close (`src/ui/board.ts:1073`, `1031`); `playBoldChaiPumpPress(completed)` per accepted pump and `playBoldChaiCupSwap()` on completion (`src/ui/board.ts:1055-1059`).

**Forcing route:** none found for the scene. The engine is fully exported and DOM-free (`src/engine/bold-chai-pump.ts:18`, `47`, `103`, `114`), so state can be driven in isolation, but `runBoldChaiBonus` is module-private (`src/ui/board.ts:943`).

---

### bold-chai-free-spins
**Display name:** kicker `Bold Chai`, title `BOLD CHAI!` (`src/ui/board.ts:2023-2024`)

**Source:** `src/ui/board.ts:1268`, `runBoldChaiFreeSpins`.

**Reachable in production:** yes, when `runBoldChaiBonus` resolves with a non-zero award (`src/ui/board.ts:925-926`).

**How it is reached:** at least one full cup of 12 pumps inside the 30-second window.

**Trigger probability:** the pump trigger rate (see `bold-chai-pump-scene`), times the player completing at least one cup. Award is `3 × completedChais` (`src/engine/bold-chai-pump.ts:14`, `73`). UNVERIFIED: the repo records no expected number of completed cups; it depends entirely on tap speed.

**Parent scene:** `bold-chai-pump-scene`.

**Can contain:** `bonus-summary` (`src/ui/board.ts:1274`).

**DOM root:** as `free-spin-board`.

**Verbatim copy:** as `free-spin-board`. Because `allowChaiStorm: false` is passed (`src/ui/board.ts:1269`), no round carries a `chaiRain` payload, `chaiStormSession` is false, and the label/title resolve to `Bold Chai` / `BOLD CHAI!`. Panel `aria-label` is `Bold Chai bonus spins`. The status line only ever shows `+N coins` or empty.

**Assets:** as `free-spin-board`.

**CSS:** as `free-spin-board`.

**States and variants:** the session uses the `chai_back` wedge with the storm suppressed, so `spinFreeRound` returns `chaiRain: undefined` and the round is mechanically identical to a standard free spin (`src/engine/freespins.ts:186-188`, `212-214`). Asserted by `src/engine/freespins.test.ts:92-93`. This is the reason the wedge comment at `src/engine/freespins.ts:354` says Bold Chai "reuses the legacy wedge ID but must not launch Wild Chai Storm".

**Forcing route:** none found. `runBoldChaiFreeSpins` is module-private (`src/ui/board.ts:1268`).

---

### treat-jar-free-spins
**Display name:** kicker `Treat Jar Bonus`, title `TREAT JAR BONUS!` (`src/ui/board.ts:1294`)

**Source:** `src/ui/board.ts:1281`, `runTreatJarFreeSpins`. Jar math: `src/engine/features.ts:19-25`, `src/engine/features.ts:118` `settleTreatJar`.

**Reachable in production:** yes, from three call sites (`src/ui/board.ts:920`, `927`, `933`): after a wheel or panic session, after Bold Chai free spins, or on its own.

**How it is reached:** a treat bag fills to `TREAT_JAR_CAP = 24` (`src/engine/features.ts:19`), either as carried-over state settled at the start of a spin (`src/ui/board.ts:834-837`) or by treats collected during the spin (`src/ui/board.ts:858-866`), plus any `state.pendingTreatJarSpins` carried in (`src/ui/board.ts:832`).

**Trigger probability:** `TREAT_JAR_FREE_SPINS = { chicken: 1, salmon: 2, bougie: 3 }` (`src/engine/features.ts:21-25`), awarded per completed 24-treat bag. Treats appear only on reels 1, 3, and 5, with strip counts `treat_chicken` 5, `treat_salmon` 4, `treat_bougie` 2 per eligible reel (`src/engine/reels.ts:71-73`, `105`). No measured completion rate is recorded in the repo. UNVERIFIED: `src/engine/simulation.test.ts` does not gate treat-jar completion frequency.

**Parent scene:** none of its own; it always runs as a trailing sibling after whichever bonus preceded it, or directly after a base spin.

**Can contain:** `bonus-summary` (`src/ui/board.ts:1300`).

**DOM root:** as `free-spin-board`.

**Verbatim copy:**

| Element | String |
|---|---|
| `setStatus` before the session (`src/ui/board.ts:1288`) | `Treat Jar complete: ${awardLabels} free spins · no retriggers` |
| `awardLabels` component (`src/ui/board.ts:1287`) | `${treatJarLabel(treat)} +${TREAT_JAR_FREE_SPINS[treat]}`, joined by `, ` |
| `treatJarLabel` values (`src/ui/board.ts:1306-1312`) | `Chicken Comets`, `Salmon Stars`, `Bougie Bites` |
| banner kicker | `Treat Jar Bonus` |
| banner title | `TREAT JAR BONUS!` |
| panel `aria-label` | `Treat Jar Bonus bonus spins` |

A full example string for a single chicken bag: `Treat Jar complete: Chicken Comets +1 free spins · no retriggers`.

**Assets:** as `free-spin-board`.

**CSS:** as `free-spin-board`.

**States and variants:** the session is a `chai_back` wedge with `allowChaiStorm: false` and the deprecated `allowRetriggers: false` (`src/ui/board.ts:1289-1295`). `allowRetriggers` has no effect; the option is retained only so legacy callers compile (`src/engine/freespins.ts:346-351`). `showBonusSummary` is called with a hard-coded `0` for retriggers on this path (`src/ui/board.ts:1300`), unlike every other caller which passes `session.retriggers`.

**Forcing route:** none found. `runTreatJarFreeSpins` is module-private (`src/ui/board.ts:1281`).

---

### bonus-summary
**Display name:** `Free Spins Complete!`

**Source:** `src/ui/board.ts:2417`, `showBonusSummary`.

**Reachable in production:** yes, from five call sites: `runWheelAndFreeSpins` post-Trail (`src/ui/board.ts:1919`), `runWheelAndFreeSpins` main path (`src/ui/board.ts:1934`), `runDoorbellPanic` (`src/ui/board.ts:1951`), `runBoldChaiFreeSpins` (`src/ui/board.ts:1274`), `runTreatJarFreeSpins` (`src/ui/board.ts:1300`).

**How it is reached:** immediately after `playFreeSpinSession` returns and the balance is credited.

**Trigger probability:** not probabilistic. It is unconditional on every path listed above. It is **not** shown after Treat Time (`runTreatTimeBonus` uses `setStatus` instead, `src/ui/board.ts:1821`), after a failed Moonlit Keepsake Trail (`src/ui/board.ts:1909-1912`), or after the UniGlee marathon (which has its own summary, `src/ui/board.ts:1595`).

**Parent scene:** `free-spin-board` under any of the five callers.

**Can contain:** nothing. `maybeLevelUpAfterBonus` runs after it and may open the level-up overlay (`src/ui/board.ts:1920`, `1935`, `1952`, `1275`, `1301`).

**DOM root:** `div.bonus-cabinet-overlay.wheel-scrim.text-amber-100`, appended to `.cabinet-frame` with fallback to `root` (`src/ui/board.ts:2419-2427`).

**Verbatim copy:**

| Element | String |
|---|---|
| `h2` (`src/ui/board.ts:2422`) | `Free Spins Complete!` |
| `p`, base (`src/ui/board.ts:2423`) | `You won ${totalWin.toLocaleString()} coins across ${totalSpins} free spins` |
| `p`, retrigger clause when `retriggers > 0` (`src/ui/board.ts:2423`) | ` (with ${retriggers} retrigger!)` for 1, ` (with ${retriggers} retriggers!)` for more than 1 |
| `#bonus-continue` button (`src/ui/board.ts:2424`) | `Continue` |

The overlay has no `role`, no `aria-modal`, and no `aria-live` (compare the UniGlee summary at `src/ui/board.ts:1605-1606`, which sets both).

**Every value it displays:** exactly two numbers plus one conditional number.
- `totalWin`, passed as `session.totalWin` from every caller, formatted with `toLocaleString()`.
- `totalSpins`, passed as `session.totalSpins`, which equals `rounds.length` (`src/engine/freespins.ts:414`).
- `retriggers`, passed as `session.retriggers` from four callers and hard-coded `0` from the Treat Jar caller (`src/ui/board.ts:1300`).

**The retrigger clause is unreachable in production.** `runFreeSpinSession` declares `let retriggers = 0` and never increments it (`src/engine/freespins.ts:389`, returned at `417`); the loop explicitly zeroes each round's `freeSpinsAwarded` (`src/engine/freespins.ts:401-402`). The same holds for `runJoeyLaundrySession` (`src/engine/freespins.ts:301`, `331`). Retriggers are documented as blocked in every bonus by the 2026-07 RTP retune (`src/engine/freespins.ts:346-350`, `382`). So `retriggers` is always 0 at every call site, and the ` (with N retriggers!)` text can never render.

**Assets:** CSS only.

**CSS:** `.bonus-cabinet-overlay` (`src/style.css:599-611`), `.wheel-scrim` (`src/style.css:2348-2350`). The button reuses `.sparkle-btn` (`src/style.css:1481-1489` keyframes `sparkle-idle`, `sparkle-spin-pulse`). No dedicated keyframes.

**States and variants:**
- Zero-win state: renders `You won 0 coins across N free spins`. No distinct styling.
- Dismissal: clicking `#bonus-continue` removes the overlay and resolves, `{ once: true }` (`src/ui/board.ts:2437-2440`).
- Secondary dismissal: the overlay re-enables `#sparkle-btn` (`src/ui/board.ts:2434-2435`) so the SPARKLE handler can detect `#bonus-continue` and forward the click (`src/ui/board.ts:542-545`). The spin itself stays blocked because `runSpin` has not returned.
- `playBonusFanfare()` fires on mount (`src/ui/board.ts:2428`).

**Forcing route:** none found. `showBonusSummary` is module-private (`src/ui/board.ts:2417`).

---

## Nesting diagram

Derived from the call graph in `src/ui/board.ts:818-942`, `1268-1305`, `1903-1957`, `1802-1847`, and `src/engine/uniglee-marathon.ts:41-79`. Indentation means "opens from inside".

```
base spin (runSpin, src/ui/board.ts:818)
├── uniglee marathon                                  [Part C: not in this slice]
│   ├── uniglee chapter: joey_laundry_helper          [Part C]
│   ├── uniglee chapter: were_multiplying
│   │   └── free-spin-board  (wedge "multiplying")
│   │       └── were-multiplying                      (x2/x3/x5/x10 marked wild)
│   ├── uniglee chapter: keepsake_collection
│   │   └── free-spin-board  (wedge "keepsake_collection")
│   │       └── keepsake-constellation                (ONLY reachable here)
│   ├── uniglee chapter: nighttime_treat_time
│   │   └── free-spin-board  (wedge "treat_time_nighttime")
│   │       └── treat-cast overlay                    (no treat-time entry card on this path)
│   ├── phoebe lap quest chapter                      [Part C]
│   └── uniglee summary                               [Part C]
├── doorbell-panic-banner                             (skipped if uniglee fired this spin)
├── bold-chai-pump-scene                              (skipped if uniglee or doorbell fired)
│   └── bold-chai-free-spins                          (only if >= 1 cup completed)
│       └── free-spin-board  (wedge "chai_back", storm suppressed)
│           └── bonus-summary
├── treat-time-entry-morning                          (1/250)
│   └── treat-time-main-board                         (plays on the primary cabinet)
├── treat-time-entry-nighttime                        (1/500)
│   └── treat-time-main-board
├── doorbell-panic-free-spins                         (when result.doorbellPanic)
│   └── free-spin-board  (wedge "doorbell_panic")
│       └── bonus-summary
├── sparkle-wheel                                     (when ladder award and no doorbell)
│   ├── wedge multiplying (40/100)
│   │   └── free-spin-board
│   │       ├── were-multiplying
│   │       └── bonus-summary
│   ├── wedge keepsake_memory (35/100)
│   │   └── moonlit-keepsake-trail
│   │       ├── success -> standard-free-spins
│   │       │   └── free-spin-board (wedge "standard")
│   │       │       └── bonus-summary
│   │       └── failure -> board, no summary
│   └── wedge chai_back (25/100)
│       └── free-spin-board
│           ├── chai-storm-splash                     (round 0 only)
│           ├── iced-chai-wild-rain-board             (converted cells, round 0)
│           └── bonus-summary
└── treat-jar-free-spins                              (trailing sibling of all of the above)
    └── free-spin-board  (wedge "chai_back", storm suppressed, label overridden)
        └── bonus-summary
```

Scenes reachable by more than one path:

| Scene | Paths |
|---|---|
| `free-spin-board` | sparkle wheel (3 wedges), keepsake-trail success, doorbell panic, bold chai, treat jar, 3 UniGlee chapters |
| `were-multiplying` | sparkle wheel `multiplying` wedge; UniGlee chapter `were_multiplying` |
| `bonus-summary` | wheel post-Trail, wheel main, doorbell panic, bold chai, treat jar |
| `treat-time-main-board` | morning entry, nighttime entry |
| nighttime Treat Time free spins | `runTreatTimeBonus` (with entry card, on the main cabinet) and UniGlee chapter (no entry card, in the bonus panel) |
| `treat-jar-free-spins` | after a wheel/panic session, after bold chai free spins, or standalone |

Scenes reachable by exactly one path: `sparkle-wheel`, `moonlit-keepsake-trail`, `standard-free-spins`, `chai-storm-splash`, `iced-chai-wild-rain-board`, `keepsake-constellation`, `doorbell-panic-banner`, `doorbell-panic-free-spins`, `bold-chai-pump-scene`, `bold-chai-free-spins`.

---

## Trigger-rate table

All values sourced from engine constants. "Measured" is populated only where the repo records a simulated rate.

| Scene | Constant | Value | Source | Measured |
|---|---|---|---|---|
| free-spin entry (ladder) | `FREE_SPIN_LADDER` | 6 cascades -> 6 spins, 7 -> 9, 8 -> 15, 9 -> 25, 10 -> 40, 11 -> 60 | `src/engine/types.ts:221-223` | ~1 in 150 spins, gated 1/188 to 1/120 (`src/engine/simulation.test.ts:83-87`) |
| free-spin award doubling | Double Sparkle | award × 2 when active | `src/engine/cascade.ts:352-358` | none |
| sparkle-wheel: multiplying | `WHEEL_WEIGHTS[0]` | 40 of 100 | `src/engine/freespins.ts:36` | none |
| sparkle-wheel: keepsake_memory | `WHEEL_WEIGHTS[1]` | 35 of 100 | `src/engine/freespins.ts:37` | none |
| sparkle-wheel: chai_back | `WHEEL_WEIGHTS[2]` | 25 of 100 | `src/engine/freespins.ts:38` | none |
| sparkle-wheel sub-zone | `spinWheelLanding` | uniform 0/1/2, presentation only | `src/engine/freespins.ts:66-70` | none |
| were-multiplying: no wild | `rollWildMultiplier` | 15% per counted spin | `src/engine/freespins.ts:78` | none |
| were-multiplying: ×2 | `rollWildMultiplier` | 35% | `src/engine/freespins.ts:79` | none |
| were-multiplying: ×3 | `rollWildMultiplier` | 30% | `src/engine/freespins.ts:80` | none |
| were-multiplying: ×5 | `rollWildMultiplier` | 15% | `src/engine/freespins.ts:81` | none |
| were-multiplying: ×10 | `rollWildMultiplier` | 5% | `src/engine/freespins.ts:82` | none |
| moonlit-keepsake-trail: pairs | `KEEPSAKE_MEMORY_PAIR_COUNT` | 6 | `src/engine/keepsake-memory.ts:15` | none |
| moonlit-keepsake-trail: cards | `KEEPSAKE_MEMORY_CARD_COUNT` | 12 | `src/engine/keepsake-memory.ts:14` | none |
| moonlit-keepsake-trail: strikes | `KEEPSAKE_MEMORY_MAX_FAILS` | 2 | `src/engine/keepsake-memory.ts:16` | none |
| moonlit-keepsake-trail: award | `KEEPSAKE_MEMORY_FREE_SPINS` | 40 | `src/engine/keepsake-memory.ts:17` | none |
| chai-storm: occurrences | `activateChaiStorm` | exactly 1 per `chai_back` session, round 0 | `src/engine/freespins.ts:395` | asserted `src/engine/freespins.test.ts:86-87` |
| keepsake-constellation: no giant | `KEEPSAKE_ZONE_WEIGHTS[0]` | 27 of 100 per free spin | `src/engine/keepsake-constellation.ts:17` | none |
| keepsake-constellation: 2×2 | weight 19 | 19 of 100 | `src/engine/keepsake-constellation.ts:18` | none |
| keepsake-constellation: 2×3 | weight 15 | 15 of 100 | `src/engine/keepsake-constellation.ts:19` | none |
| keepsake-constellation: 2×4 | weight 11 | 11 of 100 | `src/engine/keepsake-constellation.ts:20` | none |
| keepsake-constellation: 3×2 | weight 15 | 15 of 100 | `src/engine/keepsake-constellation.ts:21` | none |
| keepsake-constellation: 3×3 | weight 8 | 8 of 100 | `src/engine/keepsake-constellation.ts:22` | none |
| keepsake-constellation: 3×4 | weight 5 | 5 of 100 | `src/engine/keepsake-constellation.ts:23` | none |
| keepsake-constellation: wild giant | `KEEPSAKE_ICON_WEIGHTS` | 2 of 100 icon picks (1 each cat) | `src/engine/keepsake-constellation.ts:29-34` | none |
| treat-time-entry-morning | `TREAT_TIME_TRIGGER_RATES.morning` | 1/250 | `src/engine/treattime.ts:12` | none |
| treat-time-entry-nighttime | `TREAT_TIME_TRIGGER_RATES.nighttime` | 1/500 | `src/engine/treattime.ts:13` | none |
| treat-time spins, morning | `TREAT_TIME_SPIN_RANGES.morning` | 5 to 8 inclusive | `src/engine/treattime.ts:17` | none |
| treat-time spins, nighttime | `TREAT_TIME_SPIN_RANGES.nighttime` | 8 to 14 inclusive | `src/engine/treattime.ts:18` | none |
| treat-time wilds per spin | `TREAT_TIME_WILD_RANGE` | 0 to 4 inclusive | `src/engine/treattime.ts:21` | none |
| treat-time treat mix, nighttime | `treatForMode` | chicken 45%, salmon 35%, bougie 20% | `src/engine/treattime.ts:61-64` | none |
| doorbell reel 1 | `DOORBELL_REEL_ONE_RATE` | 1/17 | `src/engine/reels.ts:21` | none |
| doorbell reel 2 | `DOORBELL_REEL_TWO_RATE` | 1/30 | `src/engine/reels.ts:22` | none |
| doorbell spins awarded | `rollDoorbellFreeSpins` | 3 to 6 inclusive | `src/engine/cascade.ts:238-241` | none |
| doorbell panic wilds per round | `panicStartingGrid` | 3 to 6 placements | `src/engine/freespins.ts:148` | asserted `src/engine/freespins.test.ts:127-128` |
| bold chai reel 1 | `BOLD_CHAI_REEL_ONE_RATE` | 1/17 | `src/engine/reels.ts:25` | none |
| bold chai reel 2 | `BOLD_CHAI_REEL_TWO_RATE` | 1/30 | `src/engine/reels.ts:26` | none |
| bold chai duration | `BOLD_CHAI_DURATION_MS` | 30,000 ms | `src/engine/bold-chai-pump.ts:12` | none |
| bold chai pumps per cup | `BOLD_CHAI_PUMPS_PER_CUP` | 12 | `src/engine/bold-chai-pump.ts:13` | none |
| bold chai spins per cup | `BOLD_CHAI_FREE_SPINS_PER_CUP` | 3 | `src/engine/bold-chai-pump.ts:14` | none |
| bold chai cup reset | `BOLD_CHAI_CUP_RESET_MS` | 3,000 ms | `src/engine/bold-chai-pump.ts:16` | none |
| treat jar bag size | `TREAT_JAR_CAP` | 24 | `src/engine/features.ts:19` | none |
| treat jar spins | `TREAT_JAR_FREE_SPINS` | chicken 1, salmon 2, bougie 3 | `src/engine/features.ts:21-25` | none |
| retriggers, all bonuses | `runFreeSpinSession` | always 0 | `src/engine/freespins.ts:389`, `401-402` | none |
| uniglee capture (context only) | `UNIGLEE_REEL_RATES` | 1/2500 + 1/4000 + 1/7500 | `src/engine/uniglee.ts:31-35` | ~1 in 1,277, gated 1/2000 to 1/850 (`src/engine/simulation.test.ts:95-99`) |

---

## Asset-usage map

Every file under `public/` referenced by a scene in this slice.

| Asset path | Used by | Reference |
|---|---|---|
| `public/assets/joey-phoebe-wheel.png` | `sparkle-wheel` hero art (`<img src>`) | `src/ui/symbols.ts:46` |
| `public/assets/optimized/joey-phoebe-wheel.webp` | `sparkle-wheel` hero art (`<source type="image/webp">`) | `src/ui/symbols.ts:46` |
| `public/assets/keepsake-memory-card-back.png` | `moonlit-keepsake-trail` card back | `src/ui/board.ts:1239` |
| `public/assets/optimized/keepsake-memory-card-back.webp` | `moonlit-keepsake-trail` card back webp source | `src/ui/board.ts:1239` via `src/ui/board.ts:157-163` |
| `public/assets/keepsake-memory-mismatch-overlay.png` | `moonlit-keepsake-trail` mismatch mark | `src/ui/board.ts:1241` |
| `public/assets/optimized/keepsake-memory-mismatch-overlay.webp` | `moonlit-keepsake-trail` mismatch mark webp source | `src/ui/board.ts:1241` |
| `public/assets/atlases/standard-symbol-atlas.png` | all 12 paying symbols and 3 treats, everywhere a grid or card front is drawn | `src/ui/asset-manifest.ts:30`, `42-56` |
| `public/assets/atlases/standard-symbol-atlas.webp` | same, webp branch of `image-set()` | `src/ui/asset-manifest.ts:29` |
| `public/assets/atlases/special-symbol-atlas.png` | `wild_joey`, `wild_phoebe`, `wild_handbag`, `wild_chai`, `uniglee` | `src/ui/asset-manifest.ts:36`, `57-66` |
| `public/assets/atlases/special-symbol-atlas.webp` | same, webp branch | `src/ui/asset-manifest.ts:35` |
| `public/assets/symbols/doorbell.svg` | `doorbell-panic-banner` bell; base-board doorbell cells | `src/ui/asset-manifest.ts:67`, `src/ui/board.ts:1326` |
| `public/assets/symbols/chai-pump.svg` | base-board chai-pump trigger cells (the scene itself uses the `bold-chai/` set) | `src/ui/asset-manifest.ts:68` |
| `public/assets/bold-chai/pump-body.svg` | `bold-chai-pump-scene` base layer | `src/ui/board.ts:958` |
| `public/assets/bold-chai/spout.svg` | `bold-chai-pump-scene` spout layer | `src/ui/board.ts:960` |
| `public/assets/bold-chai/plunger-up.svg` | plunger rest state | `src/ui/board.ts:959`, `972` |
| `public/assets/bold-chai/plunger-mid.svg` | plunger mid-return, 68 ms after a press | `src/ui/board.ts:972`, `978` |
| `public/assets/bold-chai/plunger-down.svg` | plunger at press instant | `src/ui/board.ts:972`, `976` |
| `public/assets/bold-chai/cup-empty.svg` | cup while pumping | `src/ui/board.ts:962`, `999` |
| `public/assets/bold-chai/cup-swap.svg` | cup during the 3-second reset | `src/ui/board.ts:993` |
| `public/assets/bold-chai/fill-01.svg` … `fill-12.svg` | one per pump count 1-12 | `src/ui/board.ts:961`, `1002` |

Inline SVG used by scenes in this slice:

| Function | Scene | Reference |
|---|---|---|
| `wheelMechanicalSvg` | `sparkle-wheel` face, 3 wedges + 3 icons + 9 pins + hub | `src/ui/symbols.ts:53` |
| `keepsakeMemoryTrailSvg` | `moonlit-keepsake-trail` backdrop | `src/ui/board.ts:1257` |
| `treatTimeHandSvg` | `treat-time-entry-*` (hidden on the `--main` variant) and `treat-time-main-board` cast layer | `src/ui/board.ts:2410`, used at `1832` and `2365` |
| `symbolSvg` | every grid cell, card front, giant keepsake, and treat token | `src/ui/symbols.ts:18` |

Assets defined but **not** used by any scene in this slice: `public/assets/joey-phoebe-wilds.png` and its webp (cat pop-ins and Lap Quest, Part A/C, `src/ui/symbols.ts:114`), `public/assets/chai-chase-splash.png` and its webp (splash screen, `src/splash.ts:100-104`), `public/assets/askjamie-avatar.jpg` and its webp (`src/ui/board.ts:292`), `public/assets/social-preview.jpg` and its webp.

CSS-only scenes, no asset at all: `chai-storm-splash`, `bonus-summary`, the wheel's glow ring, energy ring, and pointer, the multiplier badge, the keepsake constellation frame.

---

## Complete `@keyframes` inventory for the bonus areas

Every `@keyframes` in `src/style.css` that drives a scene in this slice, plus the shared board animations these scenes inherit.

| Keyframe | Line | Duration and easing at its use site | Drives |
|---|---|---|---|
| `wheel-spin-out` | `src/style.css:2471` | 2.4 s `cubic-bezier(0.15, 0.7, 0.25, 1) forwards` | `.wheel-mechanical-face` (`2387`), `.wheel-energy-ring` (`2433`) |
| `ornament-twinkle` | `src/style.css:1021` | 2.4 s `ease-in-out infinite` | `.wheel-glow-ring` (`2404`); also the cabinet ornaments |
| `aurora-drift` | `src/style.css:465` | 14 s `ease-in-out infinite` | `.aurora-ribbons span` (`456`), intensified during every free-spin session |
| `beam-drop` | `src/style.css:2481` | 360 ms `cubic-bezier(.2, .78, .3, 1.08) both`, `animation-delay: var(--drop-delay, 0ms)` | every `.cell` on every free-spin step (`src/ui/board.ts:2086`) and on base cascades |
| `beam-up` | `src/style.css:2492` | 260 ms `cubic-bezier(.55, .02, .9, .45) forwards` | base-board winning cells only; not applied in `playFreeSpinSession` |
| `shatter-out` | `src/style.css:2502` | 260 ms `ease-in forwards` | `.shatter-out`; no scene in this slice adds the class |
| `payline-win-flash` | `src/style.css:1159` | 700 ms `ease-out both` | `.payline-path.is-winning` in every grid render including bonus panels |
| `multiplier-badge-pop` | `src/style.css:1625` | 420 ms `cubic-bezier(.34, 1.56, .64, 1) both` | `.multiplier-badge` in `were-multiplying` |
| `chai-storm-splash-in` | `src/style.css:735` | 260 ms `ease-out both` | `.chai-storm-splash` |
| `chai-storm-copy-pop` | `src/style.css:736` | 640 ms `cubic-bezier(.34, 1.56, .64, 1) both` | `.chai-storm-copy` |
| `chai-storm-drop-fall` | `src/style.css:741` | `var(--drop-duration)` 0.80-1.28 s `ease-in var(--drop-delay) both` | the 28 `.chai-storm-drop` elements |
| `chai-storm-sparkle` | `src/style.css:746` | 980 ms `ease-in-out infinite alternate` | the 6 `.chai-storm-sparkles i` elements |
| `chai-wild-conversion` | `src/style.css:750` | 520 ms `cubic-bezier(.34, 1.56, .64, 1) both` | converted cells in `iced-chai-wild-rain-board` |
| `keepsake-card-back-out` | `src/style.css:1110` | 470 ms `cubic-bezier(.24, .72, .32, 1) both` | `.is-flipping-front .keepsake-card-back` |
| `keepsake-card-front-in` | `src/style.css:1111` | 470 ms same | `.is-flipping-front .keepsake-card-front` |
| `keepsake-card-back-in` | `src/style.css:1112` | 470 ms same | `.is-flipping-back .keepsake-card-back` |
| `keepsake-card-front-out` | `src/style.css:1113` | 470 ms same | `.is-flipping-back .keepsake-card-front` |
| `keepsake-mismatch-pop` | `src/style.css:1114` | 180 ms `ease-out both` | `.is-mismatch .keepsake-mismatch-mark` |
| `keepsake-card-reduced-fade` | `src/style.css:1131` | 180 ms `ease-out both` | replaces the four flip animations under reduced motion (`1126-1132`) |
| `keepsake-constellation-shimmer` | `src/style.css:1223` | 1.4 s `ease-in-out infinite alternate` | `.keepsake-constellation-symbol`, disabled under reduced motion (`1228`) |
| `bold-chai-cup-rattle` | `src/style.css:1061` | 130 ms `ease-in-out infinite alternate` | `.bold-chai-scene.is-resetting .bold-chai-layered-art` |
| `treat-time-entry-in` | `src/style.css:2788` | 260 ms `ease-out both` | `.treat-time-entry` |
| `treat-time-copy-pop` | `src/style.css:2789` | 520 ms `cubic-bezier(.34, 1.56, .64, 1) both` | `.treat-time-entry-copy` |
| `treat-time-hand-sweep` | `src/style.css:2794` | 1.2 s on `.treat-time-entry-hand` (`2703`, hidden on the `--main` variant), 900 ms on `.treat-time-cast-layer.is-casting .treat-time-hand` (`2772`) | the casting hand |
| `treat-time-token-toss` | `src/style.css:2800` | 820 ms `cubic-bezier(.2, .78, .3, 1.08) both`, `animation-delay: var(--treat-delay, 0ms)` | `.treat-time-token` |
| `treat-time-wild-land` | `src/style.css:2806` | 360 ms `cubic-bezier(.34, 1.56, .64, 1) both` | target cells after a treat lands |
| `doorbell-ring` | `src/style.css:2824` | 180 ms `ease-in-out infinite alternate` | the two `.doorbell-ringing` trigger cells |
| `panic-screen-shake` | `src/style.css:2878` | 150 ms `ease-in-out infinite alternate` | `.doorbell-panic-banner` |
| `panic-bell-pop` | `src/style.css:2882` | 460 ms `cubic-bezier(.34, 1.56, .64, 1) both` | `.doorbell-panic-bell` |
| `panic-title-pop` | `src/style.css:2887` | 520 ms `cubic-bezier(.34, 1.56, .64, 1) both` | `.doorbell-panic-title` |
| `panic-wild-land` | `src/style.css:2899` | 420 ms `cubic-bezier(.34, 1.56, .64, 1) both` | cat wilds inside `.panic-grid` |
| `sparkle-idle` | `src/style.css:1481` | see `1481-1489` | `.sparkle-btn`, reused by the `bonus-summary` Continue button |
| `sparkle-spin-pulse` | `src/style.css:1485` | see `1485-1489` | `.sparkle-btn.is-spinning` |
| `star-twinkle` | `src/style.css:481` | 5 s / 2.6 s `ease-in-out infinite` | background stars, visible behind every bonus panel |
| `firefly-drift` | `src/style.css:496` | 5 s `ease-in-out infinite` | background fireflies |
| `light-blink` | `src/style.css:510` | 1.6 s `ease-in-out infinite` | saucer running lights |
| `saucer-bob` | `src/style.css:512` | 6 s `ease-in-out infinite` | `.saucer-unit` |
| `levelup-overlay-in` | `src/style.css:3072` | see `3072-3075` | post-bonus level-up, entered from `maybeLevelUpAfterBonus` (`src/ui/board.ts:2455`) |
| `levelup-overlay-out` | `src/style.css:3076` | see `3076-3079` | same |
| `levelup-saucer-enter` | `src/style.css:3101` | see `3101-3112` | same |
| `levelup-saucer-crash` | `src/style.css:3113` | see `3113-3139` | same |
| `levelup-spark` | `src/style.css:3140` | 14 sparks, `animation-delay: 0.45 + i * 0.012 s` (`src/ui/board.ts:2513`) | same |
| `levelup-msg-reveal` | `src/style.css:3170` | see `3170` | same |

Keyframes present in `src/style.css` but **not** reachable from any scene in this slice: `chai-pulse` (`56`), `chai-rise` (`60`), `bulb-twinkle` (`784`), `title-shimmer-sweep` (`830`), `page-arrive` (`1651`), `preview-pulse` (`1744`), `cat-eat-bob` (`1851`), `symbol-pop` (`1859`), `particle-fly` (`1886`), `win-tier-fade` (`1907`), `win-pop` (`1925`), `burst-out` (`1959`), `cat-hop-in` (`1993`), `quip-fade-in` (`2011`), `butterfly-rise` (`2042`), `uniglee-summary-float` (`2077`), and the `lap-quest-*` and `laundry-*` families (`2181-2187`, `2336-2342`, `2982-2997`).
