# PART C: UniGlee marathon and the complete art/asset system

**Scope.** This file catalogs two things as they exist in the repository at the commit it was written against: (1) every screen and visual state in the UniGlee capture and its five-act marathon, including all three Phoebe's Lap Quest implementations, and (2) the full art and asset inventory (files on disk, sprite atlases, inline SVG generators, the asset manifest, and the validator). Every statement carries a `file:line` citation. Copy is quoted character for character, including curly apostrophes, the ellipsis character, and em dashes that appear inside source strings. Nothing here is a proposal: where the source is ambiguous or a fact could not be resolved from code, the entry says `UNVERIFIED` and names exactly what could not be resolved.

## Table of contents

1. [Reachability summary](#1-reachability-summary)
2. [UniGlee capture and takeover](#2-uniglee-capture-and-takeover)
3. [Marathon act structure](#3-marathon-act-structure)
4. [Act 1: Joey's Laundry Helper](#4-act-1-joeys-laundry-helper)
5. [Acts 2 to 4: the shuffled middle](#5-acts-2-to-4-the-shuffled-middle)
6. [Keepsake Collection act vs Moonlit Keepsake Trail wedge](#6-keepsake-collection-act-vs-moonlit-keepsake-trail-wedge)
7. [Act 5: Phoebe's Lap Quest, all three implementations](#7-act-5-phoebes-lap-quest-all-three-implementations)
8. [UniGlee summary and in-marathon level-up](#8-uniglee-summary-and-in-marathon-level-up)
9. [Forcing routes](#9-forcing-routes)
10. [Asset inventory: files on disk](#10-asset-inventory-files-on-disk)
11. [The two sprite atlases](#11-the-two-sprite-atlases)
12. [catSprite sprite-sheet mapping](#12-catsprite-sprite-sheet-mapping)
13. [Every inline SVG generator](#13-every-inline-svg-generator)
14. [asset-manifest.ts and validate:assets](#14-asset-manifestts-and-validateassets)
15. [ASSET-CHECKLIST.md provenance rows](#15-asset-checklistmd-provenance-rows)
16. [Unreferenced and orphaned assets](#16-unreferenced-and-orphaned-assets)
17. [UNVERIFIED items](#17-unverified-items)

---

## 1. Reachability summary

| Scene ID | Reachable in production | Evidence |
|---|---|---|
| `uniglee-takeover` | yes | `board.ts:885` inside `if (result.unigleeTriggered)` at `board.ts:881` |
| `uniglee-chapter-banner` | yes | `board.ts:2034-2042` via `board.ts:1565` |
| `joey-laundry-chapter-overlay` | yes | `board.ts:1563` |
| `joey-laundry-sock-drop` | yes | `laundry.ts:83`, `sockDropRate: 0.25` at `uniglee.ts:13` |
| `joey-laundry-paw-strike` | yes | `laundry.ts:86`, `pawStrikeRate: 0.18` at `uniglee.ts:14` |
| `joey-laundry-combined-strike` | yes | `board.ts:2292-2295` |
| `joey-laundry-win-presentation` | yes, 3 of its 4 states | `board.ts:2203-2211`; its retrigger state is unreachable because `freespins.ts:332` zeroes `freeSpinsAwarded` on every round, so `board.ts:2203` can never be true |
| `uniglee-act-were-multiplying` | yes | `uniglee-marathon.ts:56-58` |
| `uniglee-act-keepsake-collection` | yes | `uniglee-marathon.ts:60-61` |
| `uniglee-act-nighttime-treat-time` | yes | `uniglee-marathon.ts:62` |
| `lap-quest-choice` | yes | `board.ts:1650` from `board.ts:1584` |
| `lap-quest-reveal` | yes | `board.ts:1653` |
| `lap-quest-round-play` | yes | `board.ts:1677` |
| `lap-quest-ledge` | **yes** | `board.ts:1654` calls `mountLapQuestLedge` unconditionally |
| `lap-quest-ledge-exit-joey` | yes | `lap-quest-ledge.ts:225` `interruptTimer` always armed |
| `lap-quest-ledge-exit-inactivity` | yes | `lap-quest-ledge.ts:180` |
| `lap-quest-ledge-exit-quiet` | UNVERIFIED | see entry |
| `lap-quest-session-engine` | **no** | zero non-test importers; see §7 call graph |
| `uniglee-summary` | yes | `board.ts:1591` |
| `uniglee-marathon-levelup` | yes | `board.ts:1581`, `board.ts:1589` |
| `dev-hash-lap-quest` | dev only | `main.ts:41-47` |

---

## 2. UniGlee capture and takeover

### uniglee-takeover
**Display name:** `UNI-GLEE!`
**Source:** `src/ui/board.ts:1508`, `showUnigleeTakeover`
**Reachable in production:** yes. `board.ts:881` tests `result.unigleeTriggered`; the flag is set by `cascade.ts:266-267` which calls `rollUniGleeCapture(rng)` only when `allowUniGlee && spinArea === "main"`, that is, on paid base-game spins only.
**How it is reached:** `cascade.ts:266` rolls three independent per-reel captures. `uniglee.ts:46-51` `rollUniGleeCapture` draws once per reel in reel order and keeps the highest hitting reel. On a hit, `cascade.ts:271` calls `placeUniGleeTrigger`, which writes a `uniglee` symbol at `[reel, row]` on a randomly chosen payline and makes the prefix reels line-valid (`uniglee.ts:70-99`).
**Rarity:** `UNIGLEE_REEL_RATES` = reel index 2 at `1/2500`, index 3 at `1/4000`, index 4 at `1/7500` (`uniglee.ts:32-36`). `UNIGLEE_ACTIVE_RATE` is their sum, 0.000783333, that is 1 in 1,276.6 (`uniglee.ts:38`). `docs/GAME-MECHANICS.md:1028` records the measured fleet rate as 1 in 1,229 and the seeded-oracle rate as 1 in 1,370.
**Parent scene:** none. It is appended to `.cc-root` (`board.ts:1527`).
**Can contain:** nothing. It is a timed, non-interactive overlay removed after 3200 ms (`board.ts:1528-1531`).
**DOM root:** `div.uniglee-takeover`
**Verbatim copy:**

| Element | String |
|---|---|
| `.uniglee-title` | `UNI-GLEE!` |
| `.uniglee-sub` | `The mythical capture is yours.` |
| `.uniglee-award` | `${award} SPIN MARATHON · REEL ${(trigger?.reel ?? 2) + 1}` |

The award line has no static text beyond ` SPIN MARATHON · REEL `. The separator is U+00B7 MIDDLE DOT.

**Assets:**
- 14 butterflies, each `symbolSvg("butterfly")` (`board.ts:1517`). `butterfly` resolves through the manifest to the **standard atlas, column 1, row 0** (`asset-manifest.ts:42`), so these are `span.symbol-sprite.symbol-sprite--atlas` background-image sprites drawn from `public/assets/atlases/standard-symbol-atlas.{png,webp}`, not inline SVG.
- `.uniglee-avatar` is `gleeAvatarSvg()`, inline SVG in `src/ui/symbols.ts:247`, viewBox `0 0 96 96`.

**CSS:** prefix `.uniglee-` (`style.css:2020-2067`). `@keyframes butterfly-rise` (`style.css:2041`); the overlay itself replays `@keyframes win-tier-fade`; the avatar replays `@keyframes win-pop`.
**States and variants:** three, driven solely by `award` and by `trigger.reel`. The three are strictly coupled because `initialAwardSpins` is computed as `reel * 20` (`uniglee.ts:94`).

| Variant | Capturing reel index | Displayed reel | Award line | Per-spin rate |
|---|---|---|---|---|
| 40-spin | 2 | `REEL 3` | `40 SPIN MARATHON · REEL 3` | 1 in 2,500 |
| 60-spin | 3 | `REEL 4` | `60 SPIN MARATHON · REEL 4` | 1 in 4,000 |
| 80-spin | 4 | `REEL 5` | `80 SPIN MARATHON · REEL 5` | 1 in 7,500 |

A fourth degenerate case exists in code: if `result.unigleeTrigger` is `undefined` the award falls back to `40` (`board.ts:883`) and the reel to `2`, rendering `40 SPIN MARATHON · REEL 3`. `cascade.ts:271` only builds a trigger when `!startingGrid`, so a main-area spin with a supplied starting grid could produce `unigleeTriggered` without a trigger object. UNVERIFIED whether any production call path supplies a `startingGrid` on a main-area spin.

**Butterfly geometry (deterministic, not random):** for `i` in 0..13, `left = 4 + ((i * 41) % 92)` percent, `animation-delay = (i % 7) * 0.25` s, `animation-duration = 3.2 + (i % 4) * 0.6` s (`board.ts:1512-1516`). Every playthrough shows the identical butterfly arrangement.
**Audio:** `playUniGleeSting()` at `board.ts:882`, `startUniGleeMusic()` at `board.ts:884`, `stopUniGleeMusic()` at `board.ts:887`.
**Forcing route:** none found. There is no exported entry point and no dev hash for the takeover. The only precondition is `result.unigleeTriggered === true` from `runSpin`.

---

## 3. Marathon act structure

### uniglee-marathon-sequence
**Display name:** (no visible title; the marathon has no container screen of its own)
**Source:** `src/ui/board.ts:1544`, `runUniGleeMarathonBonus`; plan built by `src/engine/uniglee-marathon.ts:40`, `runUniGleeBaseMarathon`; order built by `src/engine/uniglee.ts:120`, `buildUniGleeMarathonPlan`
**Reachable in production:** yes, `board.ts:886`.
**How it is reached:** immediately after `showUnigleeTakeover` resolves. Seed is `seed ^ 0x51f15e5d` where `seed = productionSeed()` (`board.ts:831`, `board.ts:886`).
**Rarity:** one per UniGlee capture, so the same 1 in 1,229 measured / 1 in 1,276.6 specified.
**Parent scene:** none.
**Can contain:** `uniglee-chapter-banner`, `joey-laundry-chapter-overlay`, `uniglee-act-were-multiplying`, `uniglee-act-keepsake-collection`, `uniglee-act-nighttime-treat-time`, `lap-quest-choice`, `lap-quest-reveal`, `lap-quest-round-play`, `lap-quest-ledge`, `uniglee-marathon-levelup`, `uniglee-summary`.
**DOM root:** none of its own. Acts 1 to 4 render into `.joey-laundry-overlay` or `.free-spins-panel`; act 5 renders over the live cabinet.
**Verbatim copy:** the only string the controller itself writes is the closing status line at `board.ts:1592`: `UNI-GLEE complete · +${totalWin.toLocaleString()} coins · ${totalSpins} spins played`.

**The five acts.** `buildUniGleeMarathonPlan` (`uniglee.ts:120-155`) fixes act 1 as `joey_laundry_helper`, applies a Fisher-Yates shuffle to the three middle IDs using the injected RNG (`uniglee.ts:125-128`), and appends `phoebe_lap_quest` last (`uniglee.ts:150`).

| Act | Sub-bonus ID | Fixed or shuffled | Base spins | Owns retriggers | Sweetener |
|---|---|---|---|---|---|
| 1 | `joey_laundry_helper` | fixed first (`uniglee.ts:131`) | `quarterSpins` | true | false |
| 2 | one of the middle three | seeded shuffle (`uniglee.ts:124-128`) | `quarterSpins` | true | false |
| 3 | one of the middle three | seeded shuffle | `quarterSpins` | true | false |
| 4 | one of the middle three | seeded shuffle | `quarterSpins` | true | false |
| 5 | `phoebe_lap_quest` | fixed last (`uniglee.ts:150`) | `0` | true | **true** (`uniglee.ts:148`) |

The shuffled set is `UNIGLEE_MIDDLE_SUB_BONUSES = ["were_multiplying", "keepsake_collection", "nighttime_treat_time"]` (`uniglee.ts:19-23`). Six orderings are possible; each is equally likely under a uniform RNG.

`quarterSpins = baseLaundryAllocation(initialAwardSpins)` = `awardedSpins * 0.25` (`laundry.ts:23-26`, `uniglee.ts:130`):

| Award | Per-act base spins (acts 1 to 4) | Total base spins in acts 1 to 4 |
|---|---|---|
| 40 | 10 | 40 |
| 60 | 15 | 60 |
| 80 | 20 | 80 |

Act 5 adds spins on top of that total and is explicitly `isSweetener: true` with `baseSpins: 0`.

**Per-act ceiling:** `UNIGLEE_CHAPTER_SPIN_CAP = 500` (`uniglee-marathon.ts:18`). The comment on that line reads `/** Per-act ceiling; initial allocations are 75/100/125, so normal play never approaches it. */`. Those numbers contradict the 10/15/20 that `baseLaundryAllocation` actually returns for the shipped 40/60/80 awards. The comment is stale relative to the 2026-07 retune noted at `laundry.ts:21`. The executable value is 10/15/20.

**Retriggers.** Every act runs exactly its allocation. `runFreeSpinSession` zeroes `freeSpinsAwarded` on each round (`freespins.ts:408`) and `runJoeyLaundrySession` does the same (`freespins.ts:332`). `retriggers` is initialised to `0` and never incremented in either function (`freespins.ts:314`, `freespins.ts:393`), so the summary's retrigger count is always `0` for acts 1 to 4. Act 5 increments its own local `retriggers` when `nextRound.freeSpinsAwarded > 0` (`board.ts:1673`).

**Inter-act transition screen or chapter card:** there is **no dedicated transition overlay and no standalone chapter card**. Act identity is carried entirely by the banner described next. Between acts the controller performs only balance/XP bookkeeping (`board.ts:1573-1581`), which may interpose `uniglee-marathon-levelup`.

**Forcing route:** none found for the marathon as a whole.

---

### uniglee-chapter-banner
**Display name:** the current act's chapter title
**Source:** `src/ui/board.ts:2034-2042` inside `playFreeSpinSession`; label and title supplied at `board.ts:1565-1568`; titles from `src/ui/board.ts:1535`, `uniGleeChapterTitle`
**Reachable in production:** yes, for acts 2 to 4. Act 1 does not use this banner; it draws its own header (see §4).
**How it is reached:** `runUniGleeMarathonBonus` passes `{ label: "UniGlee · Chapter " + n, title }` for every non-Joey chapter (`board.ts:1565-1568`). `chapterNumber(id)` is `marathon.plan.order.indexOf(id) + 1` (`board.ts:1558`), so the number is the act's position in the shuffled order.
**Rarity:** three appearances per marathon.
**Parent scene:** `uniglee-marathon-sequence`
**Can contain:** nothing.
**DOM root:** `#bonus-banner`, which gains the class `bonus-banner--active` (`board.ts:2042`).
**Verbatim copy:**

| Element | String |
|---|---|
| `.bonus-banner-kicker` | `UniGlee · Chapter ${chapterNumber}` |
| `.bonus-banner-title` | the chapter title, exactly as below |
| `.bonus-banner-stats` | `Spin <span id="fs-index">1</span> of <span id="fs-total">${session.initialSpins}</span> · Round win: <span id="fs-round-win">0</span>` |
| panel `aria-label` | `${displayWedgeLabel} bonus spins` |

**Exact chapter labels, from `board.ts:1535` onward:**

| Line | `id` | Returned label |
|---|---|---|
| `board.ts:1537` | `joey_laundry_helper` | `Joey’s Laundry Helper` |
| `board.ts:1538` | `were_multiplying` | `We’re Multiplying` |
| `board.ts:1539` | `keepsake_collection` | `Keepsake Collection` |
| `board.ts:1540` (`default`) | anything else, in practice `nighttime_treat_time` | `Nighttime Treat Time` |

`Joey’s` and `We’re` use U+2019 RIGHT SINGLE QUOTATION MARK. `Nighttime Treat Time` is returned from the `default` arm, not from a named case.

**Assets:** none of its own.
**CSS:** `.bonus-banner`, `.bonus-banner--active`, `.bonus-banner-heading`, `.bonus-banner-kicker`, `.bonus-banner-title`, `.bonus-banner-stats` (`style.css:890-918`). `.bonus-banner--active .level-chip--cabinet { display: none; }` (`style.css:869`).
**States and variants:** three per marathon, one per middle act; the kicker number varies with the shuffled position, so the same title can appear as Chapter 2, 3, or 4.
**Forcing route:** none found.

---

## 4. Act 1: Joey's Laundry Helper

### joey-laundry-chapter-overlay
**Display name:** `Joey’s Laundry Helper`
**Source:** `src/ui/board.ts:2132`, `playJoeyLaundryChapter`. Engine: `src/engine/laundry.ts` (effect rolls) and `src/engine/freespins.ts:299`, `runJoeyLaundrySession`.
**Reachable in production:** yes. `board.ts:1562-1563` dispatches on `chapter.id === "joey_laundry_helper"`, which is always act 1 (`uniglee.ts:131`).
**How it is reached:** always the first act of every marathon, on every capture.
**Rarity:** exactly one per UniGlee capture, so 1 in 1,229 paid spins (`docs/GAME-MECHANICS.md:810`). Round count equals `session.rounds.length`, which is 10, 15, or 20.
**Parent scene:** `uniglee-marathon-sequence`
**Can contain:** `joey-laundry-sock-drop`, `joey-laundry-paw-strike`, `joey-laundry-combined-strike`.
**DOM root:** `div.joey-laundry-overlay`, appended to `root` (not to `.cc-root`) at `board.ts:2159`. `role="region"`, `aria-label="Joey's Laundry Helper sub-bonus"` (straight apostrophe, `board.ts:2139`).

**Shell structure** (`board.ts:2140-2158`):

| Node | Classes / id |
|---|---|
| night garden backdrop | `div.night-garden.aurora`, content from `gardenDecor()` |
| shell | `div.relative.z-10.h-full.w-full.flex.flex-col.cc-shell.free-spins-shell.joey-laundry-shell` |
| marquee | `header.marquee.joey-laundry-header` containing `div.marquee-row` |
| chapter chip | `span.level-chip` |
| title | `h1.marquee-title` |
| meter | `div.jar-meter.joey-laundry-meter` > `div.jar-meter-text` |
| cabinet | `main.cabinet-frame.joey-laundry-cabinet` |
| Joey perch art | `div.joey-laundry-perch`, `aria-hidden="true"` |
| grid | `div#laundry-grid.reel-grid` |
| status | `div#laundry-status.status-line`, `aria-live="polite"` |

**Verbatim copy:**

| Element | String | Line |
|---|---|---|
| `.level-chip` | `UniGlee · Chapter 1` | `board.ts:2145` |
| `.marquee-title` | `Joey’s Laundry Helper` | `board.ts:2146` |
| `.jar-meter-text` | `Laundry spin <span id="laundry-index">1</span> of <span id="laundry-total">${session.rounds.length}</span> · Round win: <span id="laundry-round-win">0</span>` | `board.ts:2150` |
| overlay `aria-label` | `Joey's Laundry Helper sub-bonus` | `board.ts:2139` |

The `UniGlee · Chapter 1` chip is a hard-coded literal, not derived from `plan.order`. It is correct only because Joey is fixed as act 1.

**Assets:**
- `catSprite("joey", "assist")` for the perch (`board.ts:2153`), which is a CSS background crop of `public/assets/joey-phoebe-wilds.png` with the WebP `image-set` alternate `public/assets/optimized/joey-phoebe-wilds.webp` (`symbols.ts:114`).
- `gardenDecor()` (`board.ts:330`) for the backdrop, which itself composes `saucerSvg`, `miniStar`, and `gardenForegroundSvg`.
- Board symbols through `renderGridHtml` (`board.ts:2180`), so both atlases plus the two symbol SVGs.
- Sock and paw art: inline SVG in `board.ts:2310` `laundrySockSvg` and `board.ts:2314` `laundryPawSvg`.

**CSS:** prefix `.joey-laundry-` (`style.css:2909-2981`). `@keyframes laundry-joey-perch` (`style.css:2982`), `laundry-column-charge` (`style.css:2987`), `laundry-sock-fall` (`style.css:2992`), `laundry-paw-strike` (`style.css:2997`). Reduced-motion block at `style.css:3003-3009` disables all four.

**States and variants:**

| State | Trigger | Visible result |
|---|---|---|
| entry | always | `playJoeyCue()` then a `520 ms` hold (`80 ms` if reduced motion), `board.ts:2170-2171` |
| per-round opening drop | every round, step 0 | every `.cell` gets `symbol-pop` with a staggered `--drop-delay` (`board.ts:2180-2184`) |
| per-round cascade step | steps 1+ | every `.cell` gets `beam-drop` (`board.ts:2183`) |
| winning step | `step.wins.length > 0` | `win-flash` on each winning position (`board.ts:2194-2196`), cascade arpeggio and win pluck |
| non-winning step | otherwise | `playCascadeTick()` (`board.ts:2198`) |
| reduced motion | `data-reduced-motion="true"` on `.cc-root` or the OS media query (`board.ts:2167-2168`) | step hold `28 ms` instead of `170 ms`, effect duration `80 ms` instead of `720 ms` |

**Forcing route:** `playJoeyLaundryChapter` is **exported** (`board.ts:2132`), so it can be called directly with a `JoeyLaundrySessionResult`. `runJoeyLaundryChapter` is also exported (`board.ts:2220`) and additionally persists balance and re-renders the board; it has **no production caller** (only its own definition appears in `src/`). Neither is bound to a dev hash.

---

### joey-laundry-win-presentation
**Display name:** (no visible title; status-line text inside the act)
**Source:** `src/ui/board.ts:2202-2213`
**Reachable in production:** partly. See the state table.
**How it is reached:** evaluated once at the end of each counted round, after all cascade steps.
**Rarity:** per round; up to 20 rounds per marathon.
**Parent scene:** `joey-laundry-chapter-overlay`
**Can contain:** nothing.
**DOM root:** `#laundry-status.status-line`, `aria-live="polite"`
**Verbatim copy:**

| State | String | Line | Reachable |
|---|---|---|---|
| retrigger | `Joey caught a bonus sock — +${round.freeSpinsAwarded} Laundry spin${round.freeSpinsAwarded === 1 ? "" : "s"}.` | `board.ts:2204` | **no** |
| round win | `Joey’s Laundry Helper · +${round.totalWin.toLocaleString()} coins` | `board.ts:2208` | yes |
| round with no win | status left unchanged from the previous write | `board.ts:2203-2211` | yes |
| chapter complete | `Joey’s Laundry Helper complete · ${session.rounds.length} spins · +${session.totalWin.toLocaleString()} coins` | `board.ts:2213` | yes |

The retrigger string contains U+2014 EM DASH. It is unreachable because `runJoeyLaundrySession` overwrites the last pushed round with `{ ...round, freeSpinsAwarded: 0 }` on every iteration (`freespins.ts:332`), so `round.freeSpinsAwarded > 0` at `board.ts:2203` is never true. `playBonusFanfare()` on that branch (`board.ts:2205`) is likewise unreachable; the fanfare the player actually hears is the chapter-complete one at `board.ts:2214`.

**Assets:** none.
**CSS:** `.status-line`.
**States and variants:** four, as tabled; three reachable.
**Forcing route:** call `playJoeyLaundryChapter` (exported) with a hand-built session whose rounds carry `freeSpinsAwarded > 0` to render the otherwise dead retrigger state.

---

### joey-laundry-sock-drop
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:2233`, `animateLaundryEffects`, sock branch at `board.ts:2246-2273`; art at `board.ts:2310` `laundrySockSvg`; roll at `src/engine/laundry.ts:83`
**Reachable in production:** yes.
**How it is reached:** `rollJoeyLaundryEffect` rolls `rng() < config.sockDropRate` once per counted round (`laundry.ts:83`). On a hit, `sockDropFor(reel)` marks all four rows of one reel (`laundry.ts:73-78`) and `applyJoeyLaundryEffect` writes `{ symbol: "wild_joey" }` into each (`laundry.ts:110-112`). Reel is uniform over `LAUNDRY_REELS = [1, 2, 3]` (`laundry.ts:15`, `laundry.ts:57-59`), that is board reels 2, 3, and 4 as displayed.
**Rarity:** `sockDropRate: 0.25` (`uniglee-marathon.ts:13`), so 1 in 4 counted rounds.
**Parent scene:** `joey-laundry-chapter-overlay`
**Can contain:** nothing.
**DOM root:** `div.joey-laundry-effect-layer` appended to `.joey-laundry-cabinet` (`board.ts:2240-2242`), containing `div.joey-laundry-sock-column` and `div.joey-laundry-sock`.
**Verbatim copy:** status line `Sock on reel ${effect.sockDrop.reel + 1}: full column wild.` (`board.ts:2268`). Because the engine reel is 1, 2, or 3, the rendered numbers are `2`, `3`, or `4`.
**Assets:** inline SVG in `src/ui/board.ts:laundrySockSvg`, viewBox `0 0 58 78`, a yellow (`#f5d576`) sock shape with two pink (`#e8a5b8`) bands and `#2d1f4c` ink.
**CSS:** `.joey-laundry-sock-column` (`style.css:2955`), `.joey-laundry-sock-column.is-landed` (`style.css:2965`), `.joey-laundry-sock` (`style.css:2966`). Custom property `--sock-drop-distance` is set in JS (`board.ts:2266`). `@keyframes laundry-column-charge`, `@keyframes laundry-sock-fall`.
**States and variants:** two, the charging column and the landed column (`is-landed` added after `560 ms`, or `0 ms` under reduced motion, `board.ts:2298-2300`). The whole layer is removed after `720 ms` (`80 ms` reduced).
**Forcing route:** none found directly; reachable by supplying a session to the exported `playJoeyLaundryChapter`.

---

### joey-laundry-paw-strike
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:2273-2290`; art at `board.ts:2314` `laundryPawSvg`; roll at `src/engine/laundry.ts:86-92`
**Reachable in production:** yes.
**How it is reached:** `rng() < config.pawStrikeRate` per counted round, then a uniform reel from `[1,2,3]` and a uniform row from 0 to 3 (`laundry.ts:61-63`), then a weighted multiplier.
**Rarity:** `pawStrikeRate: 0.18` (`uniglee-marathon.ts:14`). Multiplier weights `{ 2: 60, 3: 30, 5: 10 }` (`uniglee-marathon.ts:15`), so given a strike: ×2 at 60%, ×3 at 30%, ×5 at 10%.
**Parent scene:** `joey-laundry-chapter-overlay`
**Can contain:** nothing.
**DOM root:** `div.joey-laundry-paw` inside `div.joey-laundry-effect-layer`.
**Verbatim copy:** `Joey’s paw strike: ${effect.pawStrike.multiplier} times wild on reel ${reel + 1}, row ${row + 1}.` (`board.ts:2288`).
**Assets:** inline SVG in `src/ui/board.ts:laundryPawSvg`, viewBox `0 0 88 110`, a mint (`#9fe8c5`) paw with `#2d1f4c` ink. The identical viewBox is used by `treatTimeHandSvg` (`board.ts:2410`), but the path data differs.
**CSS:** `.joey-laundry-paw` (`style.css:2974`), `.joey-laundry-paw svg` (`style.css:2981`), `@keyframes laundry-paw-strike`.
**States and variants:** three multiplier values, ×2, ×3, ×5. The struck cell is rewritten as `{ symbol: "wild_joey", multiplier }` (`laundry.ts:115`) and therefore renders with `.multiplier-wild` and a `.multiplier-badge` reading `×${visibleMultiplier}` with `aria-label="${visibleMultiplier} times wild"` (`board.ts:398-400`).
**Forcing route:** none found directly.

---

### joey-laundry-combined-strike
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:2292-2295`
**Reachable in production:** yes.
**How it is reached:** both a sock drop and a paw strike land in the same round **and** on the same reel: `effect.sockDrop.reel === effect.pawStrike.position[0]` (`board.ts:2288`).
**Rarity:** `0.25 × 0.18 = 0.045` for both effects in a round, times `1/3` for the same reel, so roughly 1.5% of counted rounds.
**Parent scene:** `joey-laundry-chapter-overlay`
**Can contain:** nothing.
**DOM root:** the same effect layer; the difference is the status string only.
**Verbatim copy:** `Joey caught a sock and enhanced reel ${effect.sockDrop!.reel + 1} with a ${effect.pawStrike!.multiplier} times wild.` (`board.ts:2294`). When both effects land on **different** reels the two individual messages are joined with a single space (`board.ts:2295`, `messages.join(" ")`).
**Assets:** both the sock and paw inline SVGs.
**CSS:** as above.
**States and variants:** two, same-reel and different-reel phrasing.
**Forcing route:** none found directly.

---

## 5. Acts 2 to 4: the shuffled middle

All three render through the same presenter, `playFreeSpinSession` (`board.ts:2006`), with the UniGlee label and title injected (`board.ts:1565-1568`). They share a DOM root and differ only in the engine modifier applied per round.

| Scene ID | `WheelWedge` passed | Engine modifier | Source |
|---|---|---|---|
| `uniglee-act-were-multiplying` | `multiplying` | one marked multiplier wild per round | `freespins.ts:176`, `freespins.ts:106` |
| `uniglee-act-keepsake-collection` | `keepsake_collection` | one giant locked keepsake rectangle per round | `freespins.ts:188`, `keepsake-constellation.ts:56` |
| `uniglee-act-nighttime-treat-time` | `treat_time_nighttime` | cast treat-time wilds | `freespins.ts:179-185` |

### uniglee-act-were-multiplying
**Display name:** `We’re Multiplying`
**Source:** `src/ui/board.ts:2006` `playFreeSpinSession`; wedge chosen at `uniglee-marathon.ts:57`
**Reachable in production:** yes.
**How it is reached:** whichever of positions 2, 3, or 4 the seeded shuffle assigns to `were_multiplying`.
**Rarity:** once per marathon, guaranteed; its act number is uniform over {2, 3, 4}.
**Parent scene:** `uniglee-marathon-sequence`
**Can contain:** nothing.
**DOM root:** `section.free-spins-panel.text-amber-100` appended to `.cabinet-frame`; inner `div#fs-grid.reel-grid` and `div#fs-status.status-line` (`board.ts:2028-2031`, `board.ts:2046`). The standard grid `#reel-grid` is hidden for the duration (`board.ts:2045`) and restored in the `finally` block (`board.ts:2116`).
**Verbatim copy:**

| Element | String |
|---|---|
| banner kicker | `UniGlee · Chapter ${n}` |
| banner title | `We’re Multiplying` |
| banner stats | `Spin X of Y · Round win: Z` |
| `#fs-status`, multiplier round | `×${round.multiplierWild.multiplier} wild on reel ${round.multiplierWild.position[0] + 1}!` (`board.ts:2070`) |
| `#fs-status`, winning round | `+${round.totalWin.toLocaleString()} coins` (`board.ts:2107`) |
| `#fs-status`, losing round | `""` (`board.ts:2110`) |

**Assets:** board symbols through `renderGridHtml`; `bgLayer` gains `aurora` and `document.body` gains `aurora-mode` (`board.ts:2018-2019`).
**CSS:** `.free-spins-panel` (`style.css:544`), `.free-spins-panel > .reel-grid` (`style.css:590`), `.free-spins-panel > .status-line` (`style.css:594`), `.multiplier-wild`, `.multiplier-badge`.
**States and variants:** multiplier values from `rollWildMultiplier` (`freespins.ts:75-82`): none at 15%, ×2 at 35%, ×3 at 30%, ×5 at 15%, ×10 at 5%. The wild's reel is fixed per multiplier by `MULTIPLIER_REEL = { 2: 1, 3: 2, 5: 3, 10: 4 }` (`freespins.ts:85`), so ×2 always appears on displayed reel 2, ×3 on reel 3, ×5 on reel 4, ×10 on reel 5. The wild symbol is `wild_joey` or `wild_phoebe` at even odds (`freespins.ts:112`).
**Forcing route:** none found. `playFreeSpinSession` is module-private.

### uniglee-act-nighttime-treat-time
**Display name:** `Nighttime Treat Time`
**Source:** `src/ui/board.ts:2006`; wedge at `uniglee-marathon.ts:62`
**Reachable in production:** yes.
**How it is reached:** the shuffle assigns `nighttime_treat_time` to act 2, 3, or 4.
**Rarity:** once per marathon.
**Parent scene:** `uniglee-marathon-sequence`
**Can contain:** the treat-time cast animation, `animateTreatTimeCast` (`board.ts:2362`), invoked at `board.ts:2077` when `round.treatTimeWilds?.length`.
**DOM root:** `section.free-spins-panel.text-amber-100.treat-time-free-spins.treat-time-cabinet` (`board.ts:2026`).
**Verbatim copy:** banner title `Nighttime Treat Time` (the `default` arm of `uniGleeChapterTitle`, `board.ts:1540`). Note that inside `playFreeSpinSession` the un-overridden title for a treat-time wedge would be `IT'S TREAT TIME!` (`board.ts:2024`), but the UniGlee caller always supplies `presentation.title`, so `IT'S TREAT TIME!` does **not** appear in the marathon.
**Assets:** `treatTimeHandSvg()` inline SVG (`board.ts:2410`, viewBox `0 0 88 110`) used by the cast animation.
**CSS:** `.treat-time-free-spins`, `.treat-time-cabinet`.
**States and variants:** per-round treat wild casts; no distinct terminal state.
**Forcing route:** none found.

---

## 6. Keepsake Collection act vs Moonlit Keepsake Trail wedge

These are two different features that share the word "Keepsake". They do not share code, DOM, or art.

| | Keepsake Collection (UniGlee act) | Moonlit Keepsake Trail (wheel wedge) |
|---|---|---|
| Engine wedge ID | `keepsake_collection` | `keepsake_memory` |
| Label source | `board.ts:1539` and `freespins.ts:431` | `freespins.ts:429` |
| Label text | `Keepsake Collection` | `Moonlit Keepsake Trail` |
| Mechanic | one locked giant rectangle painted over reels 2 to 4 | twelve-card memory match |
| Engine module | `src/engine/keepsake-constellation.ts` | `src/engine/keepsake-memory.ts` |
| UI function | `playFreeSpinSession` (`board.ts:2006`) | `runKeepsakeMemoryBonus` (`board.ts:1083`) |
| DOM root | `section.free-spins-panel` | `section.keepsake-memory-scene` |
| Art | `.keepsake-constellation-symbol` drawn with `symbolSvg(zone.symbol)`, an atlas sprite | `public/assets/keepsake-memory-card-back.png` and `public/assets/keepsake-memory-mismatch-overlay.png`, plus `keepsakeMemoryTrailSvg()` |
| Reached from | UniGlee marathon only | AskJamie wheel, weight 35 of 100 (`freespins.ts:36`) |

### uniglee-act-keepsake-collection
**Display name:** `Keepsake Collection`
**Source:** `src/ui/board.ts:2006` `playFreeSpinSession`; zone roll at `src/engine/keepsake-constellation.ts:56` `rollKeepsakeZone`, called from `freespins.ts:188`; rendering at `src/ui/board.ts:412-418` inside `renderGridHtml`
**Reachable in production:** yes.
**How it is reached:** the shuffle assigns `keepsake_collection` to act 2, 3, or 4. This wedge is **not** on the AskJamie wheel: `WHEEL_WEIGHTS` contains only `multiplying`, `keepsake_memory`, and `chai_back` (`freespins.ts:34-38`), so the UniGlee marathon is the only way to reach it.
**Rarity:** once per marathon, so 1 in 1,229 paid spins (`docs/GAME-MECHANICS.md:964` and `:989` record the same 1-in-1,229 figure for the marathon acts).
**Parent scene:** `uniglee-marathon-sequence`
**Can contain:** nothing.
**DOM root:** `section.free-spins-panel`; the zone itself is `div.keepsake-constellation` > `div.keepsake-constellation-symbol` emitted inside `#fs-grid` (`board.ts:412-418`).
**Verbatim copy:**

| Element | String |
|---|---|
| banner kicker | `UniGlee · Chapter ${n}` |
| banner title | `Keepsake Collection` |
| zone `aria-label` | `${keepsakeZone.width} by ${keepsakeZone.height} giant keepsake` (`board.ts:413`) |
| `#fs-status` | `+${round.totalWin.toLocaleString()} coins` or `""` |

The zone element also carries `aria-live="polite"` (`board.ts:413`).

**Assets:** the giant keepsake is `symbolSvg(keepsakeZone.symbol)` (`board.ts:416`), which resolves through the manifest, so it is an atlas sprite for any of the twelve standard symbols and for `wild_joey` / `wild_phoebe`.
**CSS:** `.keepsake-constellation` (`style.css:1191`), `.keepsake-constellation-symbol` (`style.css:1202`), `@keyframes keepsake-constellation-shimmer` (`style.css:1223`), disabled under reduced motion (`style.css:1229`). Placement uses inline `grid-column: ${leftReel + 1} / span ${width}` and `grid-row: ${topRow + 1} / span ${height}` (`board.ts:414`).
**States and variants:** seven per-round outcomes from `KEEPSAKE_ZONE_WEIGHTS` (`keepsake-constellation.ts:11-23`):

| Footprint | Weight | Share |
|---|---|---|
| no zone | 27 | 27% |
| 2 wide × 2 high | 19 | 19% |
| 2 × 3 | 15 | 15% |
| 2 × 4 | 11 | 11% |
| 3 × 2 | 15 | 15% |
| 3 × 3 | 8 | 8% |
| 3 × 4 | 5 | 5% |

Icon selection: the twelve standard symbols share 98% evenly (8.1667% each), `wild_joey` 1%, `wild_phoebe` 1% (`keepsake-constellation.ts:31-35`). Position: a 3-wide zone is always anchored at `leftReel = 1`; a 2-wide zone is at `leftReel` 1 or 2 (`keepsake-constellation.ts:61`). `topRow` is uniform over `0 .. 4 - height` (`keepsake-constellation.ts:62`).
**Forcing route:** none found.

---

## 7. Act 5: Phoebe's Lap Quest, all three implementations

### 7.1 Call-graph finding

There are three separate Lap Quest implementations. Two of them are reachable and they run **together**, in sequence, as one act. The third is dead.

```
runSpin (board.ts:818)
  └─ board.ts:886  runUniGleeMarathonBonus
       └─ board.ts:1584  runLapQuestChapter            [exported, board.ts:1644]
            ├─ board.ts:1650  showLapQuestChoice        [board.ts:1708]  ← implementation A
            ├─ board.ts:1651  spinLapQuestRound         [engine/lap-quest.ts:107]
            ├─ board.ts:1653  showLapQuestReveal        [board.ts:1745]  ← implementation A
            ├─ board.ts:1654  mountLapQuestLedge        [ui/lap-quest-ledge.ts:52]  ← implementation B
            └─ board.ts:1677  playLapQuestRound         [board.ts:1764]  (loop, ~900 ms cadence)

main.ts:46  runLapQuestChapter(app, state, () => 0)     [dev hash #lap-quest]

src/engine/lap-quest-session.ts                          ← implementation C
  importers: src/engine/lap-quest-session.test.ts only
```

| Implementation | File | Reachable by a real player | Evidence |
|---|---|---|---|
| A. Three-spot pick and reveal | `board.ts:1708` `showLapQuestChoice`, `board.ts:1745` `showLapQuestReveal` | **yes** | awaited at `board.ts:1650` and `board.ts:1653` inside `runLapQuestChapter`, which `runUniGleeMarathonBonus` awaits at `board.ts:1584` on every capture |
| B. 90-second petting ledge | `src/ui/lap-quest-ledge.ts:52` `mountLapQuestLedge` | **yes** | called unconditionally at `board.ts:1654`; the chapter's round loop is gated on `ledge.finished` at `board.ts:1679-1683` and the final status text branches on `ledgeResult.reason` at `board.ts:1691-1697` |
| C. Pure timed-session state machine | `src/engine/lap-quest-session.ts` (283 lines) | **no** | a repo-wide grep for `lap-quest-session`, `createLapQuestSession`, `advanceLapQuestSession`, `petLapQuestSession`, and `terminateLapQuestSession` returns matches only in `src/engine/lap-quest-session.ts` itself, `src/engine/lap-quest-session.test.ts` (8 `it` blocks), and prose in `AGENTS.md`, `docs/IMPLEMENTATION-BASELINE.md:151`, `docs/GAME-MECHANICS.md:105`, `:1006`, `:1716`, and `content/PRD-LAP-QUEST-REPAIR-AND-DESIGN.md:142`. No `src/` or `scripts/` module imports it. |

The consequence, stated plainly: **A and B are both reachable, and a player who captures UniGlee sees A then B in the same act. C is dead code.** `docs/GAME-MECHANICS.md:1006` records the same conclusion for C: "It has no production caller. The UI uses its own DOM timer instead, and no coin ladder is supplied, so Lap Quest pays only whatever its cascade rounds pay." `content/PRD-LAP-QUEST-REPAIR-AND-DESIGN.md:141` describes B as "Unclear whether it is reachable in production"; the call at `board.ts:1654` resolves that as reachable.

---

### lap-quest-chapter-controller
**Display name:** (no visible title; a controller, not a screen)
**Source:** `src/ui/board.ts:1644`, `runLapQuestChapter`
**Reachable in production:** yes, `board.ts:1584`.
**How it is reached:** after acts 1 to 4 complete. `rng` defaults to `mulberry32(productionSeed())` but the marathon passes `mulberry32(seed ^ 0x6a09e667)` (`board.ts:1584`).
**Rarity:** once per capture.
**Parent scene:** `uniglee-marathon-sequence`
**Can contain:** `lap-quest-choice`, `lap-quest-reveal`, `lap-quest-ledge`, `lap-quest-round-play`.
**DOM root:** none of its own.
**Verbatim copy:** the three terminal status lines written to `#marquee-status` (`board.ts:1691-1697`):

| `ledgeResult.reason` | String |
|---|---|
| `joey_interrupt` | `Phoebe's Lap Quest · Joey whisked her away · +${totalWin.toLocaleString()} coins` |
| `inactivity` | `Phoebe's Lap Quest · she wandered off · +${totalWin.toLocaleString()} coins` |
| anything else | `Phoebe's Lap Quest · complete · +${totalWin.toLocaleString()} coins` |

These three use the straight ASCII apostrophe, unlike the curly apostrophe used inside `playLapQuestRound`.

**Round loop:** `playRound(round)` runs once for the first round, then `while (!ledgeEnded) { await Promise.race([ledge.finished, sleep(900)]); ... }` (`board.ts:1678-1683`), re-rolling `spinLapQuestRound` each iteration. Every re-roll calls `resolveLapQuestChoice` again and therefore **re-picks the comfort wilds** (`lap-quest.ts:108`, `lap-quest.ts:93-97`).
**Assets:** none of its own.
**CSS:** none of its own.
**States and variants:** returns `LapQuestChapterSummary` or `undefined`; in practice always a summary since there is no early return.
**Forcing route:** **exported** at `board.ts:1644` and re-exported through `main.ts:9`; reachable via the `#lap-quest` dev hash (see §9).

---

### lap-quest-choice
**Display name:** `Phoebe’s Lap Quest`
**Source:** `src/ui/board.ts:1708`, `showLapQuestChoice`; challenge from `src/engine/lap-quest.ts:63`, `createLapQuestChallenge`
**Reachable in production:** yes, awaited at `board.ts:1650`.
**How it is reached:** first thing `runLapQuestChapter` does.
**Rarity:** once per capture.
**Parent scene:** `lap-quest-chapter-controller`
**Can contain:** nothing.
**DOM root:** `div.lap-quest-overlay`, appended to `.cc-root` (`board.ts:1731`). Attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="lap-quest-title"` (`board.ts:1712-1714`).
**Verbatim copy:**

| Element | String |
|---|---|
| `h2#lap-quest-title.lap-quest-title` | `Phoebe’s Lap Quest` |
| `p.lap-quest-copy` | `Phoebe is conducting a comfort survey. Which cozy place should she investigate?` |
| `.lap-quest-choices` `aria-label` | `Choose Phoebe's cozy place` |
| `.lap-quest-choice-spark` | `✦` (U+2726) |
| choice `strong` | `Window Perch`, `Blanket Nest`, or `Moonlit Cushion` |
| choice `small` | `<small> Phoebe-approved comfort</small>`; note the leading space inside the element |

Spot labels come from `LAP_QUEST_SPOT_LABELS` (`lap-quest.ts:15-19`): `window_perch` → `Window Perch`, `blanket_nest` → `Blanket Nest`, `moonlit_cushion` → `Moonlit Cushion`. All three are always offered; only their order is shuffled (`lap-quest.ts:64`).

**Assets:** `catSprite("phoebe", "strut")` (`board.ts:1717`), a background crop of `public/assets/joey-phoebe-wilds.png`.
**CSS:** `.lap-quest-overlay` (`style.css:2083`), `.lap-quest-panel` (`style.css:2096`), `.lap-quest-cat` (`style.css:2106`), `.lap-quest-title` (`style.css:2113`), `.lap-quest-copy` (`style.css:2122`), `.lap-quest-choices` (`style.css:2129`), `.lap-quest-choice` and its hover/focus states (`style.css:2135-2159`). `@keyframes lap-quest-fade-in` (`style.css:2181`), `@keyframes lap-quest-cat-settle` (`style.css:2182`). Overlay z-index 56.
**States and variants:** six choice orderings from the Fisher-Yates shuffle at `lap-quest.ts:52-58`. The perfect spot is chosen independently at `lap-quest.ts:65` and is **not** revealed on this screen. Focus is set to the first button (`board.ts:1741`). Buttons are `{ once: true }` listeners; the overlay resolves and removes itself on the first click (`board.ts:1734-1740`).
**Forcing route:** via `#lap-quest`. With the dev route's `rng = () => 0`, `shuffle` performs no swaps, so the order is exactly Window Perch, Blanket Nest, Moonlit Cushion, and `perfectSpot = choices[0] = window_perch`.

---

### lap-quest-reveal
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:1745`, `showLapQuestReveal`
**Reachable in production:** yes, `board.ts:1653`.
**How it is reached:** immediately after the choice resolves and one round has been spun.
**Rarity:** once per capture.
**Parent scene:** `lap-quest-chapter-controller`
**Can contain:** nothing.
**DOM root:** `div.lap-quest-reveal`, `role="status"`, appended to `.cc-root` (`board.ts:1749`, `board.ts:1755`). Auto-removed after `1050 ms` (`board.ts:1757-1761`).
**Verbatim copy:**

| Variant | `strong` | `span` |
|---|---|---|
| `perfectLap === true` | `Perfect lap located.` | `Phoebe has made a decision.` |
| `perfectLap === false` | `A cozy lap will do beautifully.` | `Phoebe is settling in.` |

**Assets:** `catSprite("phoebe", "eat")` (`board.ts:1751`).
**CSS:** `.lap-quest-reveal` (`style.css:2161`), `.lap-quest-reveal strong` and `span` (`style.css:2169-2170`), `.lap-quest-reveal-cat` (`style.css:2171`).
**States and variants:** two, keyed on `round.perfectLap`. Audio differs: `playLapQuestReveal(round.perfectLap)` (`board.ts:1756`, `src/audio/synth.ts:179`). Comfort-wild count differs downstream: `LAP_QUEST_WILD_COUNTS = { cozy: 2, perfect: 4 }` (`lap-quest.ts:21-24`). With three spots and one perfect spot, a uniform random pick is perfect 1 time in 3; the player's pick is not constrained, so the true rate depends on player behaviour and is UNVERIFIED.
**Forcing route:** via `#lap-quest`, where `perfectSpot` is `window_perch`, so clicking the first card yields the perfect variant and clicking either other card yields the cozy variant.

---

### lap-quest-round-play
**Display name:** (no visible title; plays on the live board)
**Source:** `src/ui/board.ts:1764`, `playLapQuestRound`
**Reachable in production:** yes, `board.ts:1677`.
**How it is reached:** once for the opening round, then on each `900 ms` loop iteration until the ledge finishes.
**Rarity:** `docs/GAME-MECHANICS.md:1696` estimates 15 to 30 rounds per chapter. The code does not cap the count; the loop exits only when `ledge.finished` resolves.
**Parent scene:** `lap-quest-chapter-controller`
**Can contain:** nothing.
**DOM root:** the existing `#reel-grid`. `.cc-shell` gains the class `lap-quest-mode` for the duration (`board.ts:1770`, removed at `board.ts:1798`). **There is no CSS rule for `.lap-quest-mode` anywhere in `src/style.css`**. The class is applied and removed but styles nothing.
**Verbatim copy:**

| When | String | Line |
|---|---|---|
| round start | `Phoebe’s Lap Quest · ${LAP_QUEST_SPOT_LABELS[round.selectedSpot]}` | `board.ts:1772` |
| round end, win | `Phoebe’s Lap Quest · +${round.totalWin.toLocaleString()} coins` | `board.ts:1794` |
| round end, no win | `Phoebe’s Lap Quest · cozy and complete` | `board.ts:1795` |
| on each pet | `Phoebe's Lap Quest · ${petCount} gentle pet${petCount === 1 ? "" : "s"}` | `board.ts:1659` |

The first three use U+2019; the pet counter uses a straight apostrophe.

**Assets:** board symbols through `renderGridHtml`.
**CSS:** comfort-wild cells receive `.lap-quest-wild` from `renderGridHtml` when `cell.sticky === "lap_quest"` (`board.ts:407`), styled at `style.css:2173`. On step 0 each comfort-wild cell also gets `.lap-quest-wild-land` (`board.ts:1777`), `@keyframes lap-quest-wild-land` (`style.css:2187`). All cells get `.beam-drop` (`board.ts:1781`).
**States and variants:** 2 comfort wilds on a cozy lap, 4 on a perfect lap; positions re-rolled every round from all 20 board positions (`lap-quest.ts:76-97`). Step cadence `360 ms` (`board.ts:1790`), then a `420 ms` tail (`board.ts:1796`).
**Audio:** `playLapQuestWildLand(round.comfortWilds.length)` (`board.ts:1779`), plus the usual cascade cues.
**Forcing route:** via `#lap-quest`.

---

### lap-quest-ledge
**Display name:** `Phoebe's Lap Quest` (the `.lap-quest-ledge-copy strong`, straight apostrophe)
**Source:** `src/ui/lap-quest-ledge.ts:52`, `mountLapQuestLedge`
**Reachable in production:** yes. `board.ts:1654` calls it with no conditional guard.
**How it is reached:** mounted immediately after `showLapQuestReveal` resolves.
**Rarity:** once per capture.
**Parent scene:** `lap-quest-chapter-controller`
**Can contain:** `lap-quest-ledge-exit-joey`, `lap-quest-ledge-exit-inactivity`, `lap-quest-ledge-exit-quiet`.
**DOM root:** `section.lap-quest-ledge` appended to `root.querySelector(".cabinet-frame") ?? root` (`lap-quest-ledge.ts:60`, `:92`). `role="region"`, `aria-label="Phoebe's Lap Quest ledge"`, `data-phase` initialised to `"grace"` (`lap-quest-ledge.ts:62-65`). The surface is `pointer-events: none` (`style.css:2199`) so the reel controls beneath remain usable; only the pet button takes pointer input.

**Child DOM** (`lap-quest-ledge.ts:66-91`):

| Node | Notes |
|---|---|
| `div.lap-quest-ledge-surface` | `aria-hidden`, contains `span.lap-quest-ledge-stitch` and `span.lap-quest-ledge-glow` |
| `div.lap-quest-phoebe-wrap` | `data-exit="none"` set at mount time on **this** element, while the exit CSS selectors target `data-exit` on the `section` |
| `div.lap-quest-phoebe` | `role="img"`, `aria-label="Phoebe resting across the cozy lap ledge"`, contains `phoebeLedgeSvg()` |
| `div.lap-quest-phoebe-speech` | `aria-hidden`, wraps a single `span` |
| `button.lap-quest-pet-target` | `aria-label="Pet Phoebe to keep her cozy"`, `aria-describedby="lap-quest-help"`, starts `disabled` |
| `span.lap-quest-paw-mark` | `aria-hidden`, glyph `✦` |
| `div.lap-quest-joey-entrant` | `aria-hidden`, contains `catSprite("joey", "assist")` |
| `div.lap-quest-ledge-copy` | `strong` plus `span#lap-quest-help` |
| `div.lap-quest-ledge-timer` | `aria-live="polite"`, `aria-atomic="true"`; `.lap-quest-timer-label`, `.lap-quest-timer-value`, `small` |
| `div.lap-quest-ledge-progress` | `aria-hidden`, one inner `span` whose width is set in JS |
| `div.lap-quest-ledge-status` | `aria-live="polite"`, `aria-atomic="true"` |

**Verbatim copy, static markup:**

| Element | String |
|---|---|
| section `aria-label` | `Phoebe's Lap Quest ledge` |
| `.lap-quest-phoebe` `aria-label` | `Phoebe resting across the cozy lap ledge` |
| initial speech bubble | `I’m getting comfy…` (U+2019 and U+2026) |
| pet button `aria-label` | `Pet Phoebe to keep her cozy` |
| `.lap-quest-paw-mark` | `✦` |
| `.lap-quest-ledge-copy strong` | `Phoebe's Lap Quest` |
| `#lap-quest-help` initial | `Phoebe is settling in.` |
| `.lap-quest-timer-label` initial | `Grace lap` |
| `.lap-quest-timer-value` initial | `15` |
| timer `small` | `s` |
| Joey entrant `aria-label` (set at interrupt) | `Joey arrived to interrupt the lap` |

**Verbatim copy, every announce string.** `announce(message, spoken = message)` writes `message` to both `#lap-quest-help` and `.lap-quest-ledge-status`, and writes `spoken` to the speech bubble (`lap-quest-ledge.ts:133-137`).

| Call site | Screen-reader / help / status text | Speech-bubble text |
|---|---|---|
| `lap-quest-ledge.ts:177` (`beginActive`) | `Pet Phoebe to keep her cozy.` | `Pet me, please!` |
| `lap-quest-ledge.ts:188` (`pet`) | `Soft pets: ${petCount}. Phoebe is staying put.` | one of the three pet lines below |
| `lap-quest-ledge.ts:150` (joey interrupt) | `Joey arrived. Phoebe is scampering off the ledge.` | `Oh no—Joey!` (contains U+2014) |
| `lap-quest-ledge.ts:157` (inactivity) | `Phoebe lost interest and curled away.` | same as the message |
| `lap-quest-ledge.ts:161` (cancelled) | `The lap quest was tucked away.` | same as the message |
| `lap-quest-ledge.ts:161` (other) | `The lap quest is complete.` | same as the message |

Pet lines, cycled by `petLines[(petCount - 1) % 3]` (`lap-quest-ledge.ts:187`):

| Pet number | Line |
|---|---|
| 1, 4, 7, … | `Yes, right there!` |
| 2, 5, 8, … | `Keep petting me!` |
| 3, 6, 9, … | `I could do this all day!` |

The inactivity speech line is `I need more attention…` (`lap-quest-ledge.ts:157`, U+2026). Note that the inactivity, cancelled, and complete announces pass only one argument, so the bubble shows the same text as the status.

`.lap-quest-timer-label` is rewritten to `Pet Phoebe` when the active phase begins (`lap-quest-ledge.ts:176`).

**Timing constants** (`lap-quest-ledge.ts:43-45`, overridable via options):

| Constant | Default | Effective value in production |
|---|---|---|
| `DEFAULT_GRACE_MS` | `15_000` | 15 s, not overridden by `board.ts:1654` |
| `DEFAULT_INACTIVITY_MS` | `5_000` | 5 s, floor-clamped to 1000 ms at `lap-quest-ledge.ts:54` |
| `DEFAULT_MAX_MS` | `90_000` | 90 s |
| `interruptAtMs` | `graceMs + Math.floor(Math.random() * (maxMs - graceMs + 1))` when not supplied (`lap-quest-ledge.ts:56`) | supplied by `board.ts:1655` as `15_000 + Math.floor(rng() * 75_001)`, then clamped to `[graceMs, maxMs]` (`lap-quest-ledge.ts:57`) |

Because `board.ts:1655` supplies `interruptAtMs` from the seeded `mulberry32` RNG, the `Math.random()` fallback at `lap-quest-ledge.ts:56` is not used on the production path. `content/PRD-LAP-QUEST-REPAIR-AND-DESIGN.md:192` describes that fallback as a live defect; the production caller does inject the seeded value.

**Phases and states:**

| `data-phase` | Enters when | Pet button | Timer label | Timer value shown |
|---|---|---|---|---|
| `grace` | at mount (`lap-quest-ledge.ts:66`) | `disabled`, `tabIndex` default | `Grace lap` | `Math.ceil(graceRemainingMs / 1000)` |
| `active` | `graceTimer` fires at `graceMs` (`lap-quest-ledge.ts:217`, `beginActive` at `:170`) | enabled, `tabIndex = 0` | `Pet Phoebe` | `Math.ceil(activeRemainingMs / 1000)`, where `activeRemainingMs = max(0, interruptAtMs - elapsed)` |
| `ending` | any `finish()` (`lap-quest-ledge.ts:139`) | `disabled`, `tabIndex = -1` | unchanged | frozen |

The progress bar width is `Math.min(100, (elapsedMs / interruptAtMs) * 100)` percent, repainted every `250 ms` (`500 ms` under reduced motion) (`lap-quest-ledge.ts:210-213`).

**Petting behaviour:** `pet()` is a no-op unless `phase === "active"` (`lap-quest-ledge.ts:178`). Each accepted pet increments `petCount`, retriggers the `is-petted` bounce by removing the class, forcing reflow with `void phoebe.offsetWidth`, and re-adding it (`lap-quest-ledge.ts:183-186`), plays `playLapQuestPet()`, fires `options.onPet`, and resets the inactivity timer (`lap-quest-ledge.ts:190-192`). Input is bound to `pointerdown` and to `Enter` / `Space` keydown (`lap-quest-ledge.ts:195-205`).

**Exit reasons.** `LapQuestLedgeEndReason` is `"joey_interrupt" | "inactivity" | "engine_end" | "cancelled"` (`lap-quest-ledge.ts:5`).

| Reason | Fired by | `data-exit` | Removal delay (normal / reduced motion) |
|---|---|---|---|
| `joey_interrupt` | `interruptTimer` at `interruptAtMs` (`lap-quest-ledge.ts:218`) | `joey` | 720 ms / 40 ms |
| `inactivity` | `inactivityTimer`, armed at `beginActive` and reset on each pet (`lap-quest-ledge.ts:178`, `:192`) | `self` | 520 ms / 40 ms |
| `engine_end` | `controller.end()` with its default argument (`lap-quest-ledge.ts:226`) | `quiet` | 520 ms / 40 ms |
| `cancelled` | `controller.destroy()` (`lap-quest-ledge.ts:228`) | `quiet` | 520 ms / 40 ms |

`engine_end` and `cancelled` share `data-exit="quiet"` and differ only in announce text.

**Assets:**
- Phoebe: inline SVG in `src/ui/lap-quest-ledge.ts:232`, `phoebeLedgeSvg()`, viewBox `0 0 320 126`. Two gradients, `lapPhoebeBody` (`#77669d` to `#2d1f4c`) and `lapPhoebeChest` (`#fff4e0` to `#e8c6d4`); ink `#20163a`; the ledge cushion uses `#b9788e` and `#e8a5b8`.
- Joey: `catSprite("joey", "assist")` (`lap-quest-ledge.ts:80`), a crop of `public/assets/joey-phoebe-wilds.png`.
- Everything else is CSS only.

**CSS:** prefix `.lap-quest-ledge-`, `.lap-quest-phoebe-`, `.lap-quest-pet-`, `.lap-quest-paw-`, `.lap-quest-joey-` (`style.css:2194-2335`). Keyframes: `lap-quest-ledge-arrive` (`:2336`), `lap-quest-speech-pop` (`:2337`), `lap-quest-speech-fade` (`:2338`), `lap-quest-pet-bounce` (`:2339`), `lap-quest-joey-arrive` (`:2340`), `lap-quest-phoebe-scurry` (`:2341`), `lap-quest-phoebe-self-exit` (`:2342`). Reduced-motion block at `style.css:3038-3049`.

**Audio:** `playLapQuestStart()` at mount (`lap-quest-ledge.ts:216`), `playLapQuestPet()` per pet, `playLapQuestJoeyInterrupt()` and `playLapQuestSelfExit()` on the two loud exits. All are defined in `src/audio/synth.ts:179-215`.

**Forcing route:** `mountLapQuestLedge` is **exported** and takes `interruptAtMs`, `graceMs`, `inactivityMs`, `maxMs`, and `reducedMotion` as options, so any phase or exit can be produced on demand. Reaching it through the game uses the `#lap-quest` dev hash, which with `rng = () => 0` yields `interruptAtMs = 15_000`, that is, Joey arrives at the exact instant grace ends.

---

### lap-quest-ledge-exit-joey
**Display name:** (no visible title)
**Source:** `src/ui/lap-quest-ledge.ts:148-153`
**Reachable in production:** yes; the interrupt timer is always armed at mount (`lap-quest-ledge.ts:218`).
**How it is reached:** `interruptAtMs` elapses before any other terminator.
**Rarity:** the dominant exit. `interruptAtMs` is uniform over `[15_000, 90_000]` ms; the only competing terminator is a 5-second post-grace inactivity lapse.
**Parent scene:** `lap-quest-ledge`
**Can contain:** nothing.
**DOM root:** `section.lap-quest-ledge[data-phase="ending"][data-exit="joey"]`
**Verbatim copy:** status/help `Joey arrived. Phoebe is scampering off the ledge.`; speech bubble `Oh no—Joey!`; Joey element gains `role="img"` and `aria-label="Joey arrived to interrupt the lap"` and loses `aria-hidden` (`lap-quest-ledge.ts:151-153`).
**Assets:** `catSprite("joey", "assist")`, revealed rather than created at this moment.
**CSS:** `.lap-quest-ledge[data-exit="joey"] .lap-quest-joey-entrant` runs `lap-quest-joey-arrive` 620 ms (`style.css:2332`); `.lap-quest-ledge[data-exit="joey"] .lap-quest-phoebe-wrap` runs `lap-quest-phoebe-scurry` 700 ms (`style.css:2333`); the speech bubble runs `lap-quest-speech-fade` (`style.css:2277-2279`). Joey starts at `left: -72px` and `opacity: 0` (`style.css:2331`).
**States and variants:** one.
**Forcing route:** `mountLapQuestLedge(root, { interruptAtMs: 0 })`, or `controller.end("joey_interrupt")`.

### lap-quest-ledge-exit-inactivity
**Display name:** (no visible title)
**Source:** `src/ui/lap-quest-ledge.ts:159-162`
**Reachable in production:** yes.
**How it is reached:** 5 seconds elapse in the `active` phase with no pet, either from the start of the active phase or from the last pet.
**Rarity:** requires `interruptAtMs > graceMs + 5000` and a 5-second silent stretch. Not further quantified in source.
**Parent scene:** `lap-quest-ledge`
**Can contain:** nothing.
**DOM root:** `section.lap-quest-ledge[data-phase="ending"][data-exit="self"]`
**Verbatim copy:** status/help `Phoebe lost interest and curled away.`; speech bubble `I need more attention…`.
**Assets:** CSS only.
**CSS:** `.lap-quest-ledge[data-exit="self"] .lap-quest-phoebe-wrap` runs `lap-quest-phoebe-self-exit` 520 ms (`style.css:2334`).
**States and variants:** one.
**Forcing route:** `mountLapQuestLedge(root, { graceMs: 0, inactivityMs: 1000, interruptAtMs: 90_000 })` and then not petting.

### lap-quest-ledge-exit-quiet
**Display name:** (no visible title)
**Source:** `src/ui/lap-quest-ledge.ts:159-162`
**Reachable in production:** UNVERIFIED. `board.ts` never calls `ledge.end()` or `ledge.destroy()`, so on the production path this branch is reached only if the promise resolves some other way. No such path was found in `src/`. The branch is definitively reachable for library consumers through the exported controller, and the chapter's own fallback status line (`Phoebe's Lap Quest · complete · …`, `board.ts:1697`) exists to cover it.
**How it is reached:** `controller.end()` defaulting to `"engine_end"`, or `controller.destroy()` giving `"cancelled"`.
**Rarity:** not reachable by timers.
**Parent scene:** `lap-quest-ledge`
**Can contain:** nothing.
**DOM root:** `section.lap-quest-ledge[data-phase="ending"][data-exit="quiet"]`
**Verbatim copy:** `The lap quest was tucked away.` for `cancelled`, `The lap quest is complete.` for anything else. Both are written to help, status, and the speech bubble.
**Assets:** CSS only.
**CSS:** `.lap-quest-ledge[data-exit="quiet"] .lap-quest-phoebe-wrap` runs `lap-quest-phoebe-self-exit` at 280 ms (`style.css:2335`), the same keyframes as the inactivity exit but faster.
**States and variants:** two, distinguished only by the announce string.
**Forcing route:** call `controller.end()` or `controller.destroy()` on the object returned by `mountLapQuestLedge`.

---

### lap-quest-session-engine
**Display name:** none. This module has no display surface.
**Source:** `src/engine/lap-quest-session.ts`, 283 lines. Public API: `createLapQuestSession` (`:153`), `advanceLapQuestSession` (`:180`), `petLapQuestSession` (`:231`), `terminateLapQuestSession` (`:273`).
**Reachable in production:** **no.** Its only importer is `src/engine/lap-quest-session.test.ts` (8 `it` blocks at lines 20, 28, 38, 53, 62, 82, 95, 108). Confirmed by grepping every identifier it exports across `src/`, `scripts/`, `index.html`, and `vite.config.ts`.
**How it is reached:** it is not.
**Rarity:** never.
**Parent scene:** none.
**Can contain:** nothing.
**DOM root:** none. The file header states `Pure timed-session state machine for Phoebe's Lap Quest` and the module imports only `Rng`.
**Verbatim copy:** no player-visible strings. The only string literals are `RangeError` messages: `Lap Quest duration bounds are invalid` (`:76`), `Lap Quest timers must be greater than zero` (`:79`), `Lap Quest awards cannot be negative` (`:83`), `Lap Quest clock cannot move backwards` (`:148`), `capAtMs cannot precede the session clock` (`:190`), and `${label} must be finite` (`:66`).
**Assets:** none.
**CSS:** none.
**States and variants:** `LapQuestPhase` is `"grace" | "petting" | "ended"` (`:12`). Note `petting`, whereas the live ledge uses `active`. `LapQuestEndReason` is `"joey_interrupt" | "unpetted" | "cap_reached" | "marathon_ended"` (`:7-11`). Note `unpetted`, `cap_reached`, and `marathon_ended`, none of which exist in the live ledge, and the absence of `engine_end` and `cancelled`, which do. Termination priority when several deadlines have passed: earliest timestamp wins, ties broken by priority `cap_reached` (3) > `joey_interrupt` (2) > `unpetted` (1) (`:203-213`). `parentEnded` short-circuits everything to `marathon_ended` (`:196-198`).

Comparison of the two timing models:

| Concern | `lap-quest-session.ts` (dead) | `lap-quest-ledge.ts` (live) |
|---|---|---|
| Clock | injected by caller, `atMs` argument | `performance.now()` internally |
| Phase names | `grace`, `petting`, `ended` | `grace`, `active`, `ending` |
| End reasons | `joey_interrupt`, `unpetted`, `cap_reached`, `marathon_ended` | `joey_interrupt`, `inactivity`, `engine_end`, `cancelled` |
| Coin ladder | `lapCoinsByTick`, caller supplied | none; no ladder is ever supplied |
| Point ticks | `pointTickMs` accrual loop (`:104-115`) | none |
| Joey deadline | sampled from RNG inside `createLapQuestSession` (`:167`) | injected as `interruptAtMs` |
| Idempotence after end | explicit (`:181`, `:232`, `:274`) | `ended` guard in `finish` (`:138`) |

**Forcing route:** none found; there is no caller to force. The module is directly importable and fully unit-testable.

---

## 8. UniGlee summary and in-marathon level-up

### uniglee-summary
**Display name:** `UNI-GLEE COMPLETE!`
**Source:** `src/ui/board.ts:1595`, `showUniGleeSummary`; awaited at `board.ts:1591`
**Reachable in production:** yes.
**How it is reached:** after act 5 resolves and its totals are folded in.
**Rarity:** once per capture.
**Parent scene:** `uniglee-marathon-sequence`
**Can contain:** nothing.
**DOM root:** `div.uniglee-summary-overlay`, `role="dialog"`, `aria-modal="true"`, appended to `.cc-root` (`board.ts:1604-1606`, `board.ts:1617`).
**Verbatim copy and every displayed value:**

| Element | String | Value source |
|---|---|---|
| `.uniglee-summary-title` | `UNI-GLEE COMPLETE!` | static |
| `.uniglee-summary-copy` | `The mythical marathon is captured.` | static |
| `.uniglee-summary-stats span:first b` | `${totalSpins}` | sum of `chapter.totalSpins` for acts 1 to 4 plus `lapQuest.totalSpins` (`board.ts:1575`, `board.ts:1587`) |
| `.uniglee-summary-stats span:first small` | `spins played` | static |
| `.uniglee-summary-stats span:second b` | `${totalWin.toLocaleString()}` | sum of `chapter.totalWin` plus `lapQuest.totalWin` (`board.ts:1574`, `board.ts:1586`) |
| `.uniglee-summary-stats span:second small` | `Glee-coins won` | static |
| `.uniglee-summary-note` | `${award} initial spins · ${retriggers} local retrigger${retriggers === 1 ? "" : "s"} · Phoebe’s sweetener included` | `award` is 40, 60, or 80; `retriggers` per below |
| `#uniglee-summary-continue.sparkle-btn` | `Return to the chase` | static |
| status line after dismissal | `UNI-GLEE complete · +${totalWin.toLocaleString()} coins · ${totalSpins} spins played` (`board.ts:1592`) | as above |

The `retriggers` figure is `totalRetriggers`, accumulated at `board.ts:1576` from `chapter.retriggers` and at `board.ts:1588` from `lapQuest.retriggers`. Acts 1 to 4 always report `0` (see §3), so the number displayed is exactly the Lap Quest round count on which `freeSpinsAwarded > 0` (`board.ts:1673`). The singular/plural switch means `1 local retrigger` and `0 local retriggers` are both producible.

**Assets:** `symbolSvg("butterfly")` (`board.ts:1608`), an atlas sprite from the standard atlas at column 1, row 0.
**CSS:** `.uniglee-summary-overlay` (`style.css:2068`), `.uniglee-summary-butterfly` (`:2069`), `.uniglee-summary-title` (`:2070`), `.uniglee-summary-copy` (`:2071`), `.uniglee-summary-stats` (`:2072-2075`), `.uniglee-summary-note` (`:2076`), `@keyframes uniglee-summary-float` (`:2077`). Fixed position, z-index 80.
**States and variants:** the copy is invariant; the four numeric values vary. There is also a dismissal-path variant: the overlay is dismissed by clicking the button (`board.ts:1628`), and `#sparkle-btn` is deliberately re-enabled (`board.ts:1624-1625`) so `wireControls` can detect this overlay and route a SPARKLE press to the same dismissal.
**Audio:** `playBonusFanfare()` at `board.ts:1618`.
**Forcing route:** none found; `showUniGleeSummary` is module-private.

### uniglee-marathon-levelup
**Display name:** `LEVEL ${newLevel}!`
**Source:** `src/ui/board.ts:2489`, `showLevelUpCelebration`, reached via `src/ui/board.ts:2455`, `maybeLevelUpAfterBonus`
**Reachable in production:** yes; called after each of acts 1 to 4 (`board.ts:1581`) and after act 5 (`board.ts:1589`).
**How it is reached:** `applyBonusSpinXp(state, totalSpins)` crosses one or more level thresholds. Each crossed level fires its own celebration and its own coin grant, in a loop (`board.ts:2470-2481`).
**Rarity:** depends on accumulated XP; not a fixed rate.
**Parent scene:** `uniglee-marathon-sequence`
**Can contain:** nothing.
**DOM root:** `div.levelup-overlay`, `aria-live="assertive"`, `aria-label="Level ${newLevel} reached!"`, appended to `root` (`board.ts:2494-2497`, `board.ts:2537`).
**Verbatim copy:**

| Element | String |
|---|---|
| `.levelup-msg-level` | `LEVEL ${newLevel}!` |
| `.levelup-msg-quip` | one of four, below |
| `.levelup-msg-coins` | `+${coinReward.toLocaleString()} coins`, where `coinReward = 200 * lvl` (`board.ts:2475`) |
| `.levelup-msg-hint` | `Tap to continue` |

Quips (`board.ts:2504-2509`), where `catName` is `Joey` or `Phoebe` chosen at even odds (`board.ts:2473`):
`${catName} is impressed — Sparks are flying!`, `${catName} demands extra treats for this!`, `${catName} zoomed in just to celebrate!`, `Even ${catName} couldn't resist cheering!`. The first contains U+2014.

**Assets:** `saucerSvg(cat === "joey" ? 1 : 4)`, inline SVG in `src/ui/symbols.ts:151`, viewBox `0 0 64 40`.
**CSS:** `.levelup-overlay` (`style.css:3055`), `.levelup-saucer`, `.levelup-saucer--from-left`, `.levelup-saucer--from-right`, `.levelup-burst`, `.levelup-spark`, `.levelup-msg*`, `.levelup-overlay--out`.
**States and variants:** left or right saucer entry chosen at even odds (`board.ts:2500`); 14 sparks with randomised angle, distance, size, and one of three colours `#f5d576`, `#6bd6c9`, `#ff9ecb` (`board.ts:2513-2519`); dismissed by click or automatically after `3600 ms` (`board.ts:2551`).
**Forcing route:** `maybeLevelUpAfterBonus` is **exported** (`board.ts:2455`) and takes an injectable `celebrateFn` whose default is `showLevelUpCelebration` (`board.ts:2460-2465`). `src/ui/board.test.ts:158-245` exercises it directly.

---

## 9. Forcing routes

### dev-hash-lap-quest
**Display name:** (no visible title; a URL route)
**Source:** `src/main.ts:41-47`
**Reachable in production:** the code ships in the production bundle. It is gated only on `location.hash`, not on a build flag or `import.meta.env.DEV`. The comment at `main.ts:36-38` reads: `Dev-only QA aids: these hashes skip the splash tap-in gate so screenshots/ manual QA can reach the board or the Lap Quest presentation without a user gesture. Never referenced by game logic; real players never enter them.`
**How it is reached:** load the app with `#lap-quest` in the URL.
**Rarity:** never by accident.
**Parent scene:** none.
**Can contain:** `lap-quest-choice`, `lap-quest-reveal`, `lap-quest-ledge`, `lap-quest-round-play`.
**DOM root:** whatever `renderBoard` produces, then the Lap Quest overlays.
**Verbatim copy:** none of its own.

Exact behaviour, line by line (`main.ts:41-47`):

```
} else if (location.hash === "#lap-quest") {
  const state = loadGameState();
  setSfxEnabled(state.soundOn);
  setMusicEnabled(state.soundOn);
  setSfxVolume(state.sfxVolume);
  setMusicVolume(state.musicVolume);
  renderBoard(app, state);
  requestAnimationFrame(() => { void runLapQuestChapter(app, state, () => 0); });
}
```

Differences from the normal boot: `renderSplash` is skipped, `unlock()` is not called, `playChaiChaseStart()` is not called, and `startBaseMusic()` is not called. Because `unlock()` never runs, audio may be suppressed by browser autoplay policy; UNVERIFIED whether any sound is audible on this route.

The injected RNG is the constant function `() => 0`, which makes the whole chapter deterministic:

| Consumer | Effect of `rng() === 0` | Line |
|---|---|---|
| `createLapQuestChallenge` shuffle | no swaps; order is Window Perch, Blanket Nest, Moonlit Cushion | `lap-quest.ts:52-58` |
| `perfectSpot` | `choices[0]` = `window_perch` | `lap-quest.ts:65` |
| `chooseComfortWilds` shuffle | no swaps; wilds land on the first 2 or 4 of `allBoardPositions()`, that is reel 0 rows 0..3 then reel 1 | `lap-quest.ts:76-97` |
| `interruptAtMs` | `15_000 + 0` = 15000 ms | `board.ts:1655` |
| `spinGrid` / `spin` | fully deterministic | `lap-quest.ts:109-110` |

**Forcing route:** this entry *is* the forcing route. The sibling route `#board` (`main.ts:29-35`) renders the board with no splash and no Lap Quest.

**Other forcing handles that exist in the codebase:**

| Handle | Kind | Source | What it forces |
|---|---|---|---|
| `#board` | dev hash | `main.ts:29` | the board with the splash skipped |
| `#lap-quest` | dev hash | `main.ts:41` | the whole Lap Quest act, deterministically |
| `runLapQuestChapter` | exported function | `board.ts:1644` | acts 5's four screens, with an injectable RNG |
| `mountLapQuestLedge` | exported function | `lap-quest-ledge.ts:52` | any ledge phase or exit, via `graceMs`, `inactivityMs`, `maxMs`, `interruptAtMs`, `reducedMotion`, and the returned `end()` / `destroy()` |
| `playJoeyLaundryChapter` | exported function | `board.ts:2132` | the whole Joey act from a supplied session, including the unreachable retrigger status |
| `runJoeyLaundryChapter` | exported function, **no production caller** | `board.ts:2220` | the Joey act plus balance persistence and a board re-render |
| `runKeepsakeMemoryBonus` | exported function | `board.ts:1083` | the Moonlit Keepsake Trail scene |
| `maybeLevelUpAfterBonus` | exported function with injectable `celebrateFn` | `board.ts:2455` | the level-up overlay |
| `renderGridHtml` | exported function | `board.ts:384` | any grid, including a `keepsakeZone` and arbitrary winning line indices |
| `runUniGleeBaseMarathon` | exported engine function | `uniglee-marathon.ts:40` | a complete acts 1 to 4 result object for any seed and award |
| `placeUniGleeTrigger` | exported engine function | `uniglee.ts:70` | a grid carrying a guaranteed UniGlee capture on a chosen reel |

No forcing route exists for `showUnigleeTakeover`, `showUniGleeSummary`, `showLapQuestChoice`, `showLapQuestReveal`, `playFreeSpinSession`, or `uniGleeChapterTitle`; all six are module-private in `board.ts`.

---

## 10. Asset inventory: files on disk

Every file under `public/assets/`, `public/icons/`, `public/fonts/`, and `asset-source/`. Dimensions were read with `sharp` and `file`. "Depicts" is taken from the asset's own `<title>`/`<desc>`/`aria-label`, from the `alt` text set by the code that renders it, or from `docs/ASSET-CHECKLIST.md`; where none of those exist the cell says UNVERIFIED.

### 10.1 public/assets: raster masters and derivatives

| Path | Dimensions | Bytes | Depicts | Referenced by |
|---|---|---|---|---|
| `public/assets/askjamie-avatar.jpg` | 1024 × 1024 | 131,307 | "Official illustrated human avatar used at the board perch" (`ASSET-CHECKLIST.md`) | `board.ts:292` via `publicPicture`; `scripts/generate-assets.mjs:30,41`; `scripts/validate-assets.mjs:66` |
| `public/assets/optimized/askjamie-avatar.webp` | 1024 × 1024 | 51,938 | same | `board.ts:292` via `optimizedAsset` (`board.ts:157`); `validate-assets.mjs:66` |
| `public/assets/chai-chase-splash.png` | 853 × 1844 | 2,310,862 | alt `Illustrated cats Joey and Phoebe with cosmic iced chai treasures` (`splash.ts:86`) | `splash.ts:85`; `generate-assets.mjs:31,42`; `validate-assets.mjs:67` |
| `public/assets/optimized/chai-chase-splash.webp` | 853 × 1844 | 198,288 | same | `splash.ts:83`; `validate-assets.mjs:67` |
| `public/assets/joey-phoebe-wheel.png` | 1536 × 1024 | 1,886,977 | alt `Joey and Phoebe perched on the free-spin wheel` (`symbols.ts:45`) | `symbols.ts:45` `wheelHeroArt`; `generate-assets.mjs:33,43`; `validate-assets.mjs:68` |
| `public/assets/optimized/joey-phoebe-wheel.webp` | 1536 × 1024 | 108,984 | same | `symbols.ts:45`; `validate-assets.mjs:68` |
| `public/assets/joey-phoebe-wilds.png` | 1774 × 887 | 1,993,758 | two-cell sheet, Joey left half and Phoebe right half; also the crop source for special-atlas cells 1 and 2 (`generate-assets.mjs:355-356`) | `symbols.ts:114` `catSprite`; `generate-assets.mjs:34,44,338`; `validate-assets.mjs:69` |
| `public/assets/optimized/joey-phoebe-wilds.webp` | 1774 × 887 | 145,744 | same | `symbols.ts:114`; `validate-assets.mjs:69` |
| `public/assets/keepsake-memory-card-back.png` | 1254 × 1254 | 3,173,805 | "deep-purple/gold card with original butterfly-and-crystal-ball motif" (`ASSET-CHECKLIST.md`) | `board.ts:1239`; `generate-assets.mjs:35,45`; `validate-assets.mjs:71-72` |
| `public/assets/optimized/keepsake-memory-card-back.webp` | 1254 × 1254 | 204,744 | same | `board.ts:1239` via `publicPicture`; `validate-assets.mjs:72` |
| `public/assets/keepsake-memory-mismatch-overlay.png` | 1254 × 1254 | 2,367,685 | "red circular strike-through for two mismatched cards" (`ASSET-CHECKLIST.md`) | `board.ts:1241`; `generate-assets.mjs:36,46`; `validate-assets.mjs:75-76` |
| `public/assets/optimized/keepsake-memory-mismatch-overlay.webp` | 1254 × 1254 | 92,170 | same | `board.ts:1241` via `publicPicture`; `validate-assets.mjs:76` |
| `public/assets/social-preview.jpg` | 1280 × 640 | 140,831 | "GitHub + web social preview — Joey, Phoebe, jewel-toned iced chai, rainbow butterfly, and keepsakes" (`ASSET-CHECKLIST.md`) | `index.html:26` `og:image`, `index.html:36` `twitter:image`; `generate-assets.mjs:37,47`; `validate-assets.mjs:78` |
| `public/assets/optimized/social-preview.webp` | 1280 × 640 | 100,268 | same | **no runtime reference**; only `generate-assets.mjs` and `validate-assets.mjs:78` |

### 10.2 public/assets/atlases

| Path | Dimensions | Bytes | Grid | Referenced by |
|---|---|---|---|---|
| `public/assets/atlases/standard-symbol-atlas.png` | 1280 × 1280 | 2,207,007 | 4 × 4 cells of 320 px | `asset-manifest.ts:29`; `validate-assets.mjs:49`; written by `generate-assets.mjs:349` |
| `public/assets/atlases/standard-symbol-atlas.webp` | 1280 × 1280 | 477,740 | same | `asset-manifest.ts:28`; `validate-assets.mjs:50` |
| `public/assets/atlases/special-symbol-atlas.png` | 1280 × 640 | 577,243 | 4 × 2 cells of 320 px | `asset-manifest.ts:35`; `validate-assets.mjs:56`; written by `generate-assets.mjs:361` |
| `public/assets/atlases/special-symbol-atlas.webp` | 1280 × 640 | 141,054 | same | `asset-manifest.ts:34`; `validate-assets.mjs:57` |

### 10.3 public/assets/symbols

| Path | viewBox | Bytes | Depicts | Referenced by |
|---|---|---|---|---|
| `public/assets/symbols/doorbell.svg` | `0 0 48 48` | 3,156 | `aria-label="Doorbell"`; gradient `doorbellBody` from `#f6c977` through `#bd5b4d` to `#522b67` | `asset-manifest.ts:66`, rendered by `symbols.ts:24` as `img.symbol-asset.symbol-asset--vector` |
| `public/assets/symbols/chai-pump.svg` | `0 0 48 48` | 2,515 | `aria-label="Bold Chai Pump"` | `asset-manifest.ts:67`, same render path |

### 10.4 public/assets/bold-chai

All 19 files share viewBox `0 0 480 640`. All are referenced from `board.ts` through `boldChaiAsset` (`board.ts:165`).

| Path | `<title>` | `<desc>` | Referenced by |
|---|---|---|---|
| `pump-body.svg` | `Bold Chai pump reservoir` | `Front-facing amber chai reservoir with a mint collar and retro-bright highlights.` | `board.ts:958` |
| `plunger-up.svg` | `Bold Chai plunger raised` | `Raised oversized pump plunger for the Bold Chai interaction.` | `board.ts:959` initial, `board.ts:983` via `setPlungerState("up")` |
| `plunger-mid.svg` | `Bold Chai plunger midway` | `Mid-stroke oversized pump plunger for the Bold Chai interaction.` | `board.ts:983` via `setPlungerState("mid")` |
| `plunger-down.svg` | `Bold Chai plunger depressed` | `Fully depressed oversized pump plunger for the Bold Chai interaction.` | `board.ts:983` via `setPlungerState("down")` |
| `spout.svg` | `Bold Chai spout` | `Front-facing oversized metal-toned chai dispensing spout.` | `board.ts:960` |
| `cup-empty.svg` | `Empty clear iced chai cup` | `Clear plastic cup with ice, ready to receive layered chai fill artwork.` | `board.ts:962`, `board.ts:1008` |
| `cup-swap.svg` | `Bold Chai cup swap state` | `Empty iced cup with playful motion arcs and lifted ice cubes for the three-second cup replacement beat.` | `board.ts:1003` |
| `fill-01.svg` … `fill-12.svg` | `Bold Chai fill level NN of 12` | `<Ordinal>-twelfths chai liquid fill layer for the clear cup.` (`fill-12` reads `Full twelve-twelfths …`) | `board.ts:961` for `fill-01`; all twelve via `board.ts:1011`, `` `fill-${String(pumpState.pumpsInCurrentCup).padStart(2, "0")}.svg` `` |

`BOLD_CHAI_PUMPS_PER_CUP = 12` (`src/engine/bold-chai-pump.ts:13`), so all twelve fill frames are reachable.

### 10.5 public/icons, public/fonts, public root

| Path | Dimensions | Bytes | Depicts | Referenced by |
|---|---|---|---|---|
| `public/icons/favicon-16.png` | 16 × 16 | 1,011 | app icon | `index.html:19` |
| `public/icons/favicon-32.png` | 32 × 32 | 3,049 | app icon | `index.html:18` |
| `public/icons/apple-touch-icon-180.png` | 180 × 180 | 49,823 | app icon | `index.html:20` |
| `public/icons/icon-192.png` | 192 × 192 | 12,566 | PWA icon | `public/manifest.webmanifest:16` |
| `public/icons/icon-512.png` | 512 × 512 | 64,697 | PWA icon | `public/manifest.webmanifest:17` |
| `public/icons/icon-maskable-512.png` | 512 × 512 | 63,765 | PWA maskable icon | `public/manifest.webmanifest:18` |
| `public/fonts/baloo2-800.woff2` | n/a | 18,612 | the `Baloo Display` webfont at weight 800 | `style.css:18` `@font-face` |
| `public/manifest.webmanifest` | n/a | 749 | PWA manifest | `index.html:17` |

The exact glyph coverage and licence of `baloo2-800.woff2` are UNVERIFIED; the font file has no row in `docs/ASSET-CHECKLIST.md`.

### 10.6 asset-source

| Path | Dimensions | Bytes | Depicts | Referenced by |
|---|---|---|---|---|
| `asset-source/glee-symbol-atlas.png` | 1254 × 1254 | 2,634,919 | the 4 × 4 master symbol sheet; cells 0 to 11 are pay symbols, 12 to 14 the treats, 15 the UniGlee butterfly (`generate-assets.mjs:341-343`, `:353`) | `generate-assets.mjs:29,55,337` |
| `asset-source/handbag-wild.png` | 1254 × 1254 | 1,284,067 | "Generic compact crossbody satchel; rare non-cat high-value wild" (`ASSET-CHECKLIST.md`) | `generate-assets.mjs:32,55,339`, composited as special-atlas cell 3 (`:357`) |
| `asset-source/README.md` | n/a | 412 | prose explaining that this directory holds provenance-traceable masters kept outside `public/` so Vite does not copy them into the deployed game | not code-referenced |

---

## 11. The two sprite atlases

### 11.1 How a cell is addressed

`symbolSvg` (`src/ui/symbols.ts:18`) branches on `asset.kind`. For `kind: "atlas"` it computes (`symbols.ts:33-39`):

```
x = atlas.columns === 1 ? 0 : (asset.column / (atlas.columns - 1)) * 100
y = atlas.rows    === 1 ? 0 : (asset.row    / (atlas.rows    - 1)) * 100
background-size:     ${atlas.columns * 100}% ${atlas.rows * 100}%
background-position: ${x}% ${y}%
```

This is the standard CSS percentage-positioning identity: at `background-size: N00%`, a position of `k/(N-1) × 100%` aligns cell `k` exactly. The emitted element is
`<span class="symbol-sprite symbol-sprite--atlas" style="background-image:url('<png>');background-image:image-set(url('<webp>') type('image/webp'), url('<png>') type('image/png'));background-size:…;background-position:…" aria-hidden="true"></span>`.
The PNG declaration is written first and then overridden by the `image-set` declaration, so browsers that do not understand `image-set` fall back to the PNG.

`wild_chai` additionally receives the class `symbol-sprite--chai-wild` (`symbols.ts:38`). **No CSS rule matches `.symbol-sprite--chai-wild`** anywhere in `src/style.css`; the class is emitted and asserted in a test (`board.test.ts:139`) but styles nothing.

### 11.2 Standard atlas: `assets/atlases/standard-symbol-atlas.{png,webp}`

1280 × 1280, `columns: 4`, `rows: 4` (`asset-manifest.ts:26-30`). `background-size: 400% 400%`. Cell pitch 320 px with a 12 px safe inset on every side, so the drawn art is 296 × 296 (`generate-assets.mjs:21-24`).

| Cell | Column | Row | Symbol ID | Paytable name (`board.ts:169-180`) | background-position |
|---|---|---|---|---|---|
| 0 | 0 | 0 | `tumbler` | Mermaid Tumbler | `0% 0%` |
| 1 | 1 | 0 | `butterfly` | Midnight Butterfly | `33.333…% 0%` |
| 2 | 2 | 0 | `mixtape` | Glee Mix Tape | `66.666…% 0%` |
| 3 | 3 | 0 | `crystal` | Crystal Cluster | `100% 0%` |
| 4 | 0 | 1 | `chai` | Iced Chai To-Go | `0% 33.333…%` |
| 5 | 1 | 1 | `candle` | Cinnamon Candle | `33.333…% 33.333…%` |
| 6 | 2 | 1 | `cassette` | Glee Cardigan | `66.666…% 33.333…%` |
| 7 | 3 | 1 | `gnome` | Moonlit Book Stack | `100% 33.333…%` |
| 8 | 0 | 2 | `mailbox` | Butterfly Hair Clip | `0% 66.666…%` |
| 9 | 1 | 2 | `vhs` | VHS Tape | `33.333…% 66.666…%` |
| 10 | 2 | 2 | `teapot` | Aurora Keepsake | `66.666…% 66.666…%` |
| 11 | 3 | 2 | `yarn` | Shared-Life Locket | `100% 66.666…%` |
| 12 | 0 | 3 | `treat_chicken` | Chicken Comets | `0% 100%` |
| 13 | 1 | 3 | `treat_salmon` | Salmon Stars | `33.333…% 100%` |
| 14 | 2 | 3 | `treat_bougie` | Bougie Bites | `66.666…% 100%` |
| 15 | 3 | 3 | **unused** | n/a | n/a |

Five engine IDs are deliberately misleading: `cassette` depicts the Glee Cardigan, `gnome` the Moonlit Book Stack, `mailbox` the Butterfly Hair Clip, `teapot` the Aurora Keepsake, and `yarn` the Shared-Life Locket. `docs/ASSET-CHECKLIST.md` explains this: "Engine IDs for five replaced prototype symbols remain temporarily stable so this art-only pass cannot perturb tested reel weights or payout math."

Cell 15 of the *master* sheet (`asset-source/glee-symbol-atlas.png`) holds the UniGlee butterfly, which is composited into the **special** atlas cell 0 rather than the standard atlas: `generate-assets.mjs:344-349` builds the standard atlas from master cells 0 to 14 only, and `generate-assets.mjs:354` places master cell 15 at special cell 0. So standard cell 15 is transparent.

Treat names come from `ASSET-CHECKLIST.md` ("Chicken Comets (yellow), Salmon Stars (blue), Bougie Bites (navy)"), not from `PAYTABLE_SYMBOLS`, which lists only the twelve pay symbols.

### 11.3 Special atlas: `assets/atlases/special-symbol-atlas.{png,webp}`

1280 × 640, `columns: 4`, `rows: 2` (`asset-manifest.ts:32-36`). Emitted `background-size: 400% 200%`. Note that the base `.symbol-sprite` rule sets `background-size: 400% 400%` (`style.css:1798`) and `.symbol-sprite--atlas` repeats it (`style.css:1807`); the inline style on the element overrides both, so special-atlas sprites resolve correctly at `400% 200%`.

| Cell | Column | Row | Symbol ID | Art source | background-position |
|---|---|---|---|---|---|
| 0 | 0 | 0 | `uniglee` | master atlas cell 15, the rainbow butterfly (`generate-assets.mjs:354`) | `0% 0%` |
| 1 | 1 | 0 | `wild_joey` | left half of `joey-phoebe-wilds.png` (`generate-assets.mjs:355`) | `33.333…% 0%` |
| 2 | 2 | 0 | `wild_phoebe` | right half of `joey-phoebe-wilds.png` (`generate-assets.mjs:356`) | `66.666…% 0%` |
| 3 | 3 | 0 | `wild_handbag` | `asset-source/handbag-wild.png`, background removal disabled (`generate-assets.mjs:357`) | `100% 0%` |
| 4 | 0 | 1 | `wild_chai` | master atlas cell 0, the mermaid tumbler reused (`generate-assets.mjs:358`) | `0% 100%` |
| 5, 6, 7 | 1, 2, 3 | 1 | **unused** | transparent by design (`generate-assets.mjs:352`) | n/a |

`generate-assets.mjs:351-352` states the order explicitly: "Fixed special-atlas order: UniGlee, Joey wild, Phoebe wild, handbag wild, then the mermaid tumbler reused as Wild Chai. Cells 5–7 remain transparent."

### 11.4 The two non-atlas symbol kinds

| Kind | Symbols | Emitted markup | Source |
|---|---|---|---|
| `svg` | `doorbell`, `chai_pump` | `<img class="symbol-asset symbol-asset--vector" src="…" alt="" aria-hidden="true" />` | `symbols.ts:21-23` |
| `image` | none currently in the manifest | `<picture class="symbol-picture"><source type="image/webp" srcset="…"><img class="symbol-asset" …></picture>`, or a bare `img` when no `optimized` is given | `symbols.ts:25-31` |

The `image` branch is live code with no current manifest entry using it. That is a latent, currently unreachable render path.

---

## 12. catSprite sprite-sheet mapping

`catSprite(cat, pose)` is defined at `src/ui/symbols.ts:111`. The critical fact: **the pose does not change the sprite cell.** Only the cat does.

```
const position = cat === "joey" ? "0% 50%" : "100% 50%";
```

`background-size: 200% 100%` comes from `.cat-pop-asset` (`style.css:1843`). The sheet is `public/assets/joey-phoebe-wilds.png` (1774 × 887) with the WebP alternate `public/assets/optimized/joey-phoebe-wilds.webp`, declared through the same PNG-then-`image-set` pair used by the atlases (`symbols.ts:114`).

| `cat` | `pose` | background-position | Emitted classes | `aria-label` |
|---|---|---|---|---|
| `joey` | `strut` | `0% 50%` | `cat-pop-asset cat-pop-asset--joey cat-pop-asset--strut` | `Joey` |
| `joey` | `eat` | `0% 50%` | `… cat-pop-asset--eat` | `Joey` |
| `joey` | `assist` | `0% 50%` | `… cat-pop-asset--assist` | `Joey` |
| `joey` | `unimpressed` | `0% 50%` | `… cat-pop-asset--unimpressed` | `Joey` |
| `phoebe` | `strut` | `100% 50%` | `cat-pop-asset cat-pop-asset--phoebe cat-pop-asset--strut` | `Phoebe` |
| `phoebe` | `eat` | `100% 50%` | `… cat-pop-asset--eat` | `Phoebe` |
| `phoebe` | `assist` | `100% 50%` | `… cat-pop-asset--assist` | `Phoebe` |
| `phoebe` | `unimpressed` | `100% 50%` | `… cat-pop-asset--unimpressed` | `Phoebe` |

Eight combinations, two distinct crops. The pose is expressed purely in CSS (`style.css:1848-1851`):

| Pose class | CSS effect | Line |
|---|---|---|
| `--strut` | no rule exists; the base `.cat-pop-asset` styling applies | n/a |
| `--eat` | `animation: cat-eat-bob .36s ease-in-out infinite alternate` | `style.css:1848` |
| `--assist` | mint drop-shadow `rgba(159,232,197,.62)` layered over the base shadow | `style.css:1849` |
| `--unimpressed` | `transform: rotate(-3deg) translateX(-4px)` plus `saturate(.76)` | `style.css:1850` |

`@keyframes cat-eat-bob { to { transform: translateY(4px) scale(.985); } }` (`style.css:1851`). Base `.cat-pop-asset` also sets `border-radius: 24px`, `filter: drop-shadow(0 14px 18px rgba(0,0,0,.45))`, and `transform-origin: 50% 80%` (`style.css:1838-1847`).

Pose sequences used by `showCatPopIn` (`board.ts:1483`): Joey when fed `["strut", "assist", "eat"]`, either cat when fed `["strut", "eat"]`, either cat when not fed `["strut", "unimpressed"]`, advanced every 750 ms.

Every `catSprite` call site:

| Call | Cat, pose | Line |
|---|---|---|
| cat pop-in sequence | both, all four poses | `board.ts:1486` |
| Lap Quest choice panel | `phoebe`, `strut` | `board.ts:1717` |
| Lap Quest reveal | `phoebe`, `eat` | `board.ts:1752` |
| Joey Laundry perch | `joey`, `assist` | `board.ts:2153` |
| Lap Quest ledge Joey entrant | `joey`, `assist` | `lap-quest-ledge.ts:80` |

---

## 13. Every inline SVG generator

### 13.1 src/ui/symbols.ts

| Function | Line | viewBox | What it draws |
|---|---|---|---|
| `wheelMechanicalSvg` | 53 | `0 0 200 200` | The Sparkle Wheel mechanical face: three 120-degree wedges filled with the gradients `mechanicalTeal`, `mechanicalPink`, `mechanicalGold`; nine gold pins at 40-degree intervals, every third one enlarged to r=4.2 as a wedge boundary; three icon medallions at `(143,68)`, `(100,146)`, `(57,68)`; a hub with `mechanicalHub` radial gradient; drop-shadow filter `mechanicalShadow`. |
| `catSprite` | 111 | n/a | Not an SVG. Emits a `span` with a CSS background crop. Listed here because it sits in the same module. |
| `wheelSvg` | 119 | `0 0 200 200` | The AskJamie Wheel prize face: rim gradient `wheelRim`, three wedges `wedgeTeal` / `wedgePink` / `wedgeGold`, 12 rim dots at 30-degree intervals, a hub with `hubGrad`, and the text `GO` in Verdana 700 at 13 px. |
| `saucerSvg` | 151 | `0 0 64 40` | One flying saucer: hull ellipse with `saucerHull{v}` gradient, dome ellipse with `saucerDome{v}` gradient, a highlight ellipse, and four running lights at `#ffe27a`, `#ff9ecb`, `#8ec9ff`, `#ffe27a` carrying the classes `saucer-light-a` / `saucer-light-b`. |
| `gardenForegroundSvg` | 183 | `0 0 390 90` | Flat night-garden silhouette: a `fgFade` vertical fade, a ground band, 14 fence pickets at 27 px pitch plus a rail, two shrubs, a mailbox group at `translate(150 46)`, a three-book stack at `translate(230 58) rotate(-3)`, and two more shrubs. |
| `fireflyJarSvg` | 216 | `0 0 64 56` | The cascade meter jar: lid rect, jar body path with `jarGlass` gradient, rim ellipse, a `jarGlow` radial whose opacity scales with fill, and `clamped` fireflies each with an `<animate>` opacity pulse. |
| `gleeAvatarSvg` | 247 | `0 0 96 96` | The Glee celebration avatar: ground shadow, cardigan body with `gleeCardigan`, head with `gleeSkin`, hair and high bun with `gleeHair`, two eyes with catchlights, a smile, a two-part butterfly hair clip in `#ff9ecb` and `#8ec9ff`, and an iced-chai cup group at `translate(64 58)`. |
| `askJamieSvg` | 274 | `0 0 64 64` | The AskJamie perch avatar: ground shadow, antenna with a `#ffe27a` tip, rounded body with `ajBody`, a dark visor panel, two `#8ec9ff` eyes with catchlights, a smile, and two side nubs. |

`INK` is the shared outline colour `#20163a` (`symbols.ts:15`).

### 13.2 src/ui/board.ts

| Function or site | Line | viewBox | What it draws |
|---|---|---|---|
| `iceNotesBodyHtml` star | 119 | `0 0 20 20` | A four-point sparkle in `currentColor` for the Ice Notes card header. |
| paytable button glyph | 248 | `0 0 24 24` | An open-book outline, `stroke="#f5d576"`, stroke-width 1.8. |
| settings button glyph | 254 | `0 0 24 24` | A gear outline with a centre circle at r=3.2. |
| `miniStar` | 324 | `0 0 24 24` | A five-point star, fill `#f5d576`, stroke `#2d1f4c`. |
| `renderGridHtml` payline overlay | 426 | `0 0 100 100` | `preserveAspectRatio="none"`; one `path.payline-path` per payline, `pathLength="1"`, points at `10 + reel*20, 12.5 + row*25`, carrying `.is-guide` and `.is-winning` modifiers. |
| `keepsakeMemoryTrailSvg` | 1257 | `0 0 500 320` | `preserveAspectRatio="none"`; the same S-curve stroked three times, as a dark casing at width 92, as a `keepsake-trail-fill` gradient at width 76, and as a dashed gold `2 13` highlight; three waypoint dots. |
| `laundrySockSvg` | 2310 | `0 0 58 78` | A yellow `#f5d576` sock with two pink `#e8a5b8` bands and `#2d1f4c` ink. |
| `laundryPawSvg` | 2314 | `0 0 88 110` | A mint `#9fe8c5` cat paw with four toes and `#2d1f4c` ink. |
| `treatTimeHandSvg` | 2410 | `0 0 88 110` | A yellow `#f5d576` hand or paw with a thumb arc, `#2d1f4c` ink. Same viewBox as the laundry paw, different geometry. |

### 13.3 src/ui/lap-quest-ledge.ts

| Function | Line | viewBox | What it draws |
|---|---|---|---|
| `phoebeLedgeSvg` | 232 | `0 0 320 126` | Phoebe reclining across the ledge: a `#b9788e` cushion path with a lighter `#e8a5b8` sheen, a body ellipse at `cx=160 cy=63 rx=96 ry=30` with the `lapPhoebeBody` gradient, a head and two ears in `#4d3f73`, one `#f5d576` eye, a smile, two white-chest strokes using `lapPhoebeChest`, a `#4d3f73` tail arc at the right, and a `#d4c0e8` back highlight. |

### 13.4 src/splash.ts

| Constant | Line | viewBox | What it draws |
|---|---|---|---|
| `PAW_SVG` | 69 | `0 0 24 24` | A four-toe cat paw print, single path, no explicit fill so it inherits `currentColor`. |

### 13.5 SVG files on disk, for completeness

The 19 Bold Chai files and the two symbol files listed in §10.3 and §10.4 are external SVG assets, not generators. Both symbol files use viewBox `0 0 48 48`; all Bold Chai files use `0 0 480 640`.

---

## 14. asset-manifest.ts and validate:assets

### 14.1 `src/ui/asset-manifest.ts`

68 lines. Three exports:

| Export | Line | Contents |
|---|---|---|
| `SYMBOL_IDS` | 10 | 22 IDs, `as const satisfies readonly SymbolId[]`, so the array is compile-time checked against the engine's `SymbolId` union |
| `SYMBOL_ATLASES` | 22 | `standard` (4 × 4) and `special` (4 × 2), each with `columns`, `rows`, `webp`, `png` |
| `SYMBOL_ASSETS` | 40 | `Record<SymbolId, SymbolAsset>`, exhaustive by type. 20 `atlas` entries and 2 `svg` entries |

`SymbolAsset` is a three-arm discriminated union (`asset-manifest.ts:5-8`): `atlas` with `{ atlas, column, row }`, `image` with `{ source, optimized? }`, `svg` with `{ source }`. All paths are stored without a leading slash and are prefixed with `import.meta.env.BASE_URL` at render time (`symbols.ts:20`).

Its unit test, `src/ui/asset-manifest.test.ts` (28 lines, 2 `it` blocks), asserts that `Object.keys(SYMBOL_ASSETS)` equals `SYMBOL_IDS` when both are sorted, and that for every atlas-backed symbol the column and row are inside the declared grid and the rendered HTML contains the atlas WebP path, the atlas PNG path, and the exact string `background-size:${columns * 100}% ${rows * 100}%`.

### 14.2 What `npm run validate:assets` checks

`package.json:11` maps the script to `node scripts/validate-assets.mjs`. The script deliberately reads the TypeScript manifest **as text** rather than importing it, so it needs no TypeScript runtime (`validate-assets.mjs:5-9`). It collects failures and exits non-zero if any accumulated.

| Check | Implementation | Failure message pattern |
|---|---|---|
| Manifest is parseable | locates `export const SYMBOL_ASSETS`, then the `{` and the terminating `\n};` (`:107-114`) | `Could not parse SYMBOL_ASSETS from src/ui/asset-manifest.ts` |
| Every canonical ID present | compares extracted keys against a hard-coded 22-entry `EXPECTED_SYMBOL_IDS` (`:21-44`, `:131-137`) | `Manifest is missing canonical symbol ID: X` |
| No unknown IDs | reverse comparison (`:138-140`) | `Manifest contains unknown symbol ID: X` |
| No duplicate IDs | array length vs Set size (`:141-143`) | `Manifest contains duplicate canonical symbol IDs` |
| Exact ID count | length vs 22 (`:144-148`) | `Manifest has N symbol IDs; expected 22` |
| Atlas files exist, are the right format, and are the right pixel size | `sharp().metadata()` against `ATLAS_EXPECTATIONS`: standard 1280 × 1280, special 1280 × 640, each as both PNG and WebP (`:46-61`, `:184-200`) | `standard atlas PNG: … is Npx wide; expected 1280px` |
| Every WebP derivative exists and matches its master's dimensions | 7 master/derivative pairs in `WEBP_DERIVATIVES` (`:64-79`, `:202-227`) | `WebP derivative X is WxH; expected the master dimensions WxH` |
| Every manifest SVG source exists | for each `source: "….svg"` extracted from the manifest (`:255-259`) | `Manifest SVG source is missing: X` |
| Every SVG under `public/assets/`, recursively, has a root `<svg>` | regex (`:269`) | `SVG has no root <svg> element: X` |
| No SVG contains forbidden content | seven patterns (`:244-253`) | `SVG contains <content type>: X` |

The seven forbidden-content patterns are `<image>` elements, `<script>` elements, `<foreignObject>` elements, `DOCTYPE`/`ENTITY` declarations, external `href`/`xlink:href` references with a scheme or protocol-relative prefix, external `url(...)` references, and CSS `@import`. This is a supply-chain and SVG-injection gate, not a visual check.

On success it prints `Asset validation passed: 22 manifest IDs, 2 atlases, 7 WebP derivatives, 2 manifest SVG sources.` (`:281-286`).

**What it does not check:** it never validates the 19 Bold Chai SVGs against any expected list (they are only swept by the forbidden-content scan), never checks `public/icons/`, never checks `public/fonts/`, never checks that every file in `public/assets/` is referenced by code, and never opens `asset-source/`. Note that `inspectRaster` has a `source/` prefix branch (`:161-163`) that would resolve into `asset-source/`, but its existence check at `:164` calls `fileExists`, which always resolves against `public/` (`:96-103`); no current caller passes a `source/`-prefixed path, so the branch is dead.

### 14.3 `npm run assets:generate`

`package.json:10` maps to `node scripts/generate-assets.mjs`. It refuses to run if any master's dimensions differ from the hard-coded `MASTER_DIMENSIONS` table (`generate-assets.mjs:60-70`), builds both atlases at 320 px cells with a 12 px inset, and writes the 7 optimized WebP derivatives at `quality: 84`. Atlas PNGs are written at `compressionLevel: 9` and atlas WebPs at `quality: 92, effort: 6, alphaQuality: 95` (`:333-334`).

---

## 15. ASSET-CHECKLIST.md provenance rows

`docs/ASSET-CHECKLIST.md` states the gate: "Nothing ships without a row here. Provenance must be 'original,' 'Jamie-owned,' or 'licensed (link).'" Status glyphs are `☐` todo, `◐` in progress, `☑` done.

| Section | Asset | Owner | Provenance | Status | Files |
|---|---|---|---|---|---|
| Characters | Joey (illustrated) | ChatGPT imagegen, 2026-07-11 | original | ☑ | `public/assets/joey-phoebe-wheel.png`, `joey-phoebe-wilds.png` |
| Characters | Phoebe (illustrated) | ChatGPT imagegen, 2026-07-11 | original | ☑ | same files |
| Characters | AskJamie avatar | Jamie-provided asset, 2026-07-14 | Jamie-owned | ☑ | `public/assets/askjamie-avatar.jpg` |
| Characters | Chai Captain motifs | Claude SVG | original | ☐ | none yet |
| Symbols | High tier: mermaid tumbler, midnight butterfly, Glee Mix Tape, crystal cluster | n/a | n/a | ☑ | `standard-symbol-atlas.{png,webp}`, source `asset-source/glee-symbol-atlas.png` |
| Symbols | Mid tier: iced chai cup, unlit cinnamon candle, Glee cardigan, Moonlit Book Stack | n/a | n/a | ☑ | same atlas |
| Symbols | Low tier: butterfly hair clip, VHS tape, aurora keepsake, shared-life keepsake locket | n/a | n/a | ☑ | same atlas |
| Symbols | Treats: Chicken Comets (yellow), Salmon Stars (blue), Bougie Bites (navy) | n/a | n/a | ☑ | same atlas |
| Symbols | Wilds: Joey-saucer and Phoebe-saucer | n/a | n/a | ☑ | `special-symbol-atlas.{png,webp}`, pop-in fallback `joey-phoebe-wilds.png` |
| Symbols | Handbag Wild: generic compact crossbody satchel | n/a | n/a | ☑ | source `asset-source/handbag-wild.png`, runtime `special-symbol-atlas.{png,webp}` |
| Symbols | Legend: UniGlee rainbow butterfly | n/a | n/a | ☑ | `special-symbol-atlas.{png,webp}` |
| Symbols | Wild Chai: mermaid iced-chai cup wild | n/a | n/a | ☑ | `special-symbol-atlas.{png,webp}` |
| UI / scenes | Chai Chase splash background | ChatGPT imagegen, 2026-07-12 | original; derived only from existing original game art | ☑ | `public/assets/chai-chase-splash.png` |
| UI / scenes | Cascade meter, wheel, Treat Jar, app icon + PWA icon set | mixed project implementation | original | ☑ | `public/icons/` |
| UI / scenes | GitHub + web social preview | ChatGPT imagegen, 2026-07-13 | original | ☑ | `public/assets/social-preview.jpg` |
| UI / scenes | Keepsake Trail memory card back | ChatGPT imagegen, 2026-07-15 | original; chroma-key removed locally; no private references | ☑ | `public/assets/keepsake-memory-card-back.png` |
| UI / scenes | Keepsake Trail mismatch overlay | ChatGPT imagegen, 2026-07-15 | original; chroma-key removed locally; no private references | ☑ | `public/assets/keepsake-memory-mismatch-overlay.png` |
| UI / scenes | Chai Bonus shelf, daily wheel, birthday reveal screen | assigned when implemented | original required | ☐ | none yet |
| Audio | Chai Chase base score, 60-second 80 BPM 20-bar loop | Codex, 2026-07-12 | original Web Audio synthesis; no samples or external melodic source | ☑ | `src/audio/music.ts` |
| Produced media | Chai Chasers showcase video, 45-second 16:9 | Replit Agent + Jamie Hill, 2026-08-07 | original; all source images original; background music original | ☑ | `artifacts/chai-chasers-video/public/chai-chasers-showcase.mp4` |

The release-gate checklist at the foot of the file has three unchecked boxes: every shipped file traceable to a row, no file derived from `reference-photos/` without D5 approval, and a bundle grep clean of brand strings.

Assets on disk with **no row** in this checklist: `public/fonts/baloo2-800.woff2`, `public/assets/symbols/doorbell.svg`, `public/assets/symbols/chai-pump.svg`, and all 19 files under `public/assets/bold-chai/`.

---

## 16. Unreferenced and orphaned assets

### 16.1 Files in `public/` that no runtime code references

| Path | Referenced by | Assessment |
|---|---|---|
| `public/assets/optimized/social-preview.webp` | only `scripts/generate-assets.mjs:37,47` and `scripts/validate-assets.mjs:78` | The only WebP derivative with no runtime consumer. `index.html:26` and `index.html:36` both point at the JPEG. It is generated, validated, and shipped, but never loaded by the page. |

Every other file under `public/` has at least one reference in `src/`, `index.html`, or `public/manifest.webmanifest`. Both atlases, both symbol SVGs, all 19 Bold Chai SVGs, all six icons, the font, and the manifest are reachable.

### 16.2 Unused atlas cells

| Atlas | Cells | Status |
|---|---|---|
| standard | cell 15 (column 3, row 3) | transparent; the generator composites only cells 0 to 14 (`generate-assets.mjs:344-349`) |
| special | cells 5, 6, 7 (row 1, columns 1 to 3) | transparent by design (`generate-assets.mjs:352`) |

### 16.3 CSS classes with no emitter, and emitted classes with no CSS

| Class | Direction | Evidence |
|---|---|---|
| `.symbol-sprite--wild` | CSS rule at `style.css:1812`, never emitted | no occurrence in `src/**/*.ts` |
| `.symbol-asset--handbag` | CSS rule at `style.css:1834`, never emitted | `wild_handbag` is an atlas symbol (`asset-manifest.ts:60-65`), so it renders as `.symbol-sprite`, never as `.symbol-asset` |
| `.symbol-sprite--chai-wild` | emitted at `symbols.ts:38`, no CSS rule | asserted by `board.test.ts:139` but styles nothing |
| `.lap-quest-mode` | added and removed at `board.ts:1770` and `board.ts:1798`, no CSS rule | no occurrence in `src/style.css` |
| `.symbol-art` | CSS rule at `style.css:1854`, never emitted | no occurrence in `src/**/*.ts` |

### 16.4 Code with no production caller

| Symbol | File | Note |
|---|---|---|
| whole module | `src/engine/lap-quest-session.ts` | 283 lines, 8 tests, importer set = its own test file only |
| `runJoeyLaundryChapter` | `board.ts:2220` | exported, never called in `src/` or `scripts/` |
| the `image` arm of `SymbolAsset` | `asset-manifest.ts:7`, rendered at `symbols.ts:25-31` | no manifest entry uses `kind: "image"` |
| the `source/` prefix branch of `inspectRaster` | `validate-assets.mjs:161-163` | unreachable because `fileExists` always resolves against `public/` |
| the `Joey caught a bonus sock — …` status | `board.ts:2204` | `freeSpinsAwarded` is zeroed at `freespins.ts:332` |

---

## 17. UNVERIFIED items

| Item | What could not be resolved |
|---|---|
| `uniglee-takeover` fallback variant | Whether any production path can set `unigleeTriggered` without producing a `unigleeTrigger`. `cascade.ts:271` builds the trigger only when `!startingGrid`, and `cascade.ts:266` requires `spinArea === "main"`. No main-area caller supplying a `startingGrid` was found, but the combination is not structurally prevented. |
| `lap-quest-ledge-exit-quiet` reachability | `board.ts` never calls `ledge.end()` or `ledge.destroy()`. The `engine_end` and `cancelled` presentations therefore appear unreachable in the shipped flow, yet `board.ts:1697` provides a status line specifically for that case. Whether some path resolves `ledge.finished` with a quiet reason could not be established from source. |
| Perfect-lap frequency | `perfectSpot` is one of three, but the player chooses freely, so the observed perfect-lap rate depends on player behaviour and cannot be derived from engine constants. |
| Lap Quest round count per chapter | The loop at `board.ts:1679-1683` is bounded only by the ledge timer and a 900 ms cadence; the number of rounds is not a constant. `docs/GAME-MECHANICS.md:1696` estimates 15 to 30 but the code sets no bound. |
| Lap Quest RTP contribution | `docs/GAME-MECHANICS.md:1012` states act 5 sits entirely outside the measured 98.70% figure because `scripts/sim-agent.ts:139` sums only `runUniGleeBaseMarathon`'s four chapters. |
| Audio on the `#lap-quest` route | `unlock()` is not called on that branch (`main.ts:41-47`), so whether any sound is audible depends on browser autoplay policy. Not determinable from source. |
| `baloo2-800.woff2` licence and glyph coverage | The file has no row in `docs/ASSET-CHECKLIST.md` and no licence file accompanies it. |
| Depiction of `public/assets/symbols/chai-pump.svg` beyond its `aria-label` | The file has an `aria-label="Bold Chai Pump"` but no `<title>` or `<desc>`, unlike the Bold Chai scene assets. |
| Stale comment at `uniglee-marathon.ts:18` | The comment claims per-act allocations of 75/100/125; the executable code yields 10/15/20. Which figure the owner intends is a design question the source does not answer. |
