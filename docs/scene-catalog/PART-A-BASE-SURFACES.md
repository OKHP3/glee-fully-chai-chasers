# Part A: Base and Persistent Surfaces

**Scope.** This catalog covers only the base and persistent surfaces of Glee-fully Chai Chasers: the two splash-screen variants, the main board cabinet and every persistent element inside it, the Ice Notes card and its wide-viewport side-panel variant with a complete content inventory, the Settings page, the Paytable page, the cat pop-in overlays with the complete quip pools, the win-tier and level-up celebration overlays, and the cascade presentation states of the reel window. Bonus scenes (free spins, wheel, Doorbell Panic, Bold Chai, Keepsake Trail, UniGlee, Lap Quest, Treat Time, Joey Laundry, Chai Storm) are owned by another agent and are excluded except where a shared helper such as `renderGridHtml` is documented here. Every fact carries a `file:line` citation. Copy is quoted character for character from source, including apostrophes, ellipses, HTML entities, em dashes, and emoji. Where source could not resolve a question, the entry says `UNVERIFIED` and names the unresolved item.

## Table of contents

| # | SCENE-ID | Surface |
|---|---|---|
| 1 | `splash-standard` | Splash screen, non-birthday variant |
| 2 | `splash-birthday` | Splash screen, birthday-window variant |
| 3 | `board-root` | Main board / cabinet (parent scene) |
| 4 | `board-marquee-header` | Marquee header, bulbs, title |
| 5 | `board-chrome-buttons` | Symbol-guide and Settings chrome buttons |
| 6 | `board-marquee-status` | Status / win message line |
| 7 | `board-level-pill` | Level pill in the bonus banner |
| 8 | `board-reel-window` | Reel window and cabinet frame |
| 9 | `board-night-garden` | Night-garden backdrop layers |
| 10 | `board-firefly-meter` | Firefly-jar cascade meter |
| 11 | `board-treat-jar` | Treat Jar display |
| 12 | `board-askjamie-perch` | AskJamie perch |
| 13 | `board-askjamie-bubble` | AskJamie speech bubble |
| 14 | `board-bet-console` | Bet console |
| 15 | `board-sparkle-button` | SPARKLE! button |
| 16 | `ice-notes-card` | Ice Notes card, compact bottom layout |
| 17 | `ice-notes-side-panel` | Ice Notes side panel at 900px and above |
| 18 | `settings-page` | Settings page (parent scene) |
| 19 | `settings-look-and-feel` | Look and feel / theme section |
| 20 | `settings-sound` | Sound section, both volume controls |
| 21 | `settings-reduce-motion` | Reduce motion section |
| 22 | `settings-payline-guide` | Payline guide section |
| 23 | `settings-about` | About this gift card |
| 24 | `settings-start-fresh` | Start fresh reset and its confirm dialog |
| 25 | `paytable-page` | Symbol guide page |
| 26 | `cat-popin-phoebe-fed` | Phoebe pop-in, fed |
| 27 | `cat-popin-phoebe-unfed` | Phoebe pop-in, unfed |
| 28 | `cat-popin-joey-fed` | Joey pop-in, fed |
| 29 | `cat-popin-joey-unfed` | Joey pop-in, unfed |
| 30 | `win-status-only` | Sub-threshold win, status line only |
| 31 | `win-celebration-nice` | NICE WIN! overlay |
| 32 | `win-celebration-big` | BIG WIN! overlay |
| 33 | `win-celebration-huge` | HUGE WIN! overlay |
| 34 | `levelup-celebration` | Level-up saucer celebration |
| 35 | `cascade-resting-board` | Resting board |
| 36 | `cascade-initial-pop` | First cascade step, symbol pop |
| 37 | `cascade-staggered-drop` | Subsequent cascade steps, staggered drop |
| 38 | `cascade-win-highlight` | Winning-line highlight |
| 39 | `cascade-beam-up` | Beam-up removal and saucer tractor beams |
| 40 | `cascade-payline-guide-on` | Payline guide enabled |
| 41 | `cascade-payline-guide-off` | Payline guide disabled |

Appendices: [Ice Notes complete content inventory](#appendix-a-ice-notes-complete-content-inventory), [Cat quip pools](#appendix-b-cat_quip_pools-complete), [Design tokens](#appendix-c-design-token-table), [Keyframes](#appendix-d-keyframes-inventory), [Asset usage](#appendix-e-asset-usage-map), [Unverified and unreachable](#appendix-f-unverified-items-and-unreachable-code).

---

### splash-standard
**Display name:** "Glee-fully Chai Chasers" (title rendered as `Glee-fully<br>Chai Chasers`, `src/splash.ts:94`)
**Source:** `src/splash.ts:55`, `renderSplash`
**Reachable in production:** yes. `src/main.ts:47-48` renders the splash whenever `location.hash` is neither `#board` nor `#lap-quest`, which is the default first load.
**How it is reached:** app boot with no matching hash (`src/main.ts:47`); `showBirthday` defaults to `isBirthdayBonusAvailable()` (`src/splash.ts:58`) and is `false` outside July 17 through July 31 local time or when the current year's claim flag is already set (`src/splash.ts:28-34`).
**Parent scene:** none
**DOM root:** `div.chai-splash` (`src/splash.ts:78`), written into `#app` (`src/main.ts:12`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Art section `aria-label` | `src/splash.ts:81` | `Joey and Phoebe under a cosmic chai sky` |
| Art `img` alt | `src/splash.ts:86` | `Illustrated cats Joey and Phoebe with cosmic iced chai treasures` |
| Eyebrow | `src/splash.ts:93` | `A cozy cosmic collectible game` |
| Title | `src/splash.ts:94` | `Glee-fully<br>Chai Chasers` |
| Hook | `src/splash.ts:95` | `Chase sparkling treasures with Joey and Phoebe while building the perfect iced chai.` |
| Primary button | `src/splash.ts:101` | `Start the Chai Chase` |
| Secondary button | `src/splash.ts:104` | `How it works ↓` (U+2193) |
| Loop `aria-label` | `src/splash.ts:107` | `The three-step chai chase loop` |
| Step 1 icon | `src/splash.ts:109` | `✦` |
| Step 1 label | `src/splash.ts:110` | `Sparkle` |
| Step 2 icon | `src/splash.ts:114` | inline paw SVG (`PAW_SVG`, `src/splash.ts:69`) |
| Step 2 label | `src/splash.ts:115` | `Collect treats` |
| Step 3 icon | `src/splash.ts:119` | `★` |
| Step 3 label | `src/splash.ts:120` | `Grow the Cascade` |

**Assets:** `public/assets/optimized/chai-chase-splash.webp` (`src/splash.ts:83`), `public/assets/chai-chase-splash.png` (`src/splash.ts:85`); paw glyph is inline SVG in `src/splash.ts:69`. Base path is `import.meta.env.BASE_URL` with a `/` fallback (`src/splash.ts:73-75`).
**CSS:** `.chai-splash`, `.chai-splash__orb`, `.chai-splash__art`, `.chai-splash__content`, `.chai-splash__inner`, `.chai-splash__eyebrow`, `.chai-splash-title`, `.chai-splash__hook`, `.chai-splash__actions`, `.chai-splash__primary`, `.chai-splash__secondary`, `.chai-splash__loop`, `.chai-splash__step`, `.chai-splash__step-icon`, `.chai-splash__step-label`, `.chai-splash__connector` (`src/style.css:65-302`). Keyframes: `chai-pulse` (`src/style.css:56`, on the orb, 7s ease-in-out infinite, `src/style.css:104`) and `chai-rise` (`src/style.css:60`, on `.chai-splash__inner`, .7s ease both, `src/style.css:143`).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Desktop two-column | viewport above 767px; art pinned `inset: 0 0 0 48%`, content 50% width | `src/style.css:111`, `src/style.css:137` |
| Mobile art-first stack | `max-width: 767px`; art becomes `48dvh` band, content padded to clear it, `.chai-splash__inner` animation removed, connectors hidden | `src/style.css:305-342` |
| Short viewport | `max-height: 760px` overrides for `.chai-splash-copy`, `.chai-splash-title`, `.chai-splash-subtitle`, `.chai-splash-button` | `src/style.css:406-411` |
| 600px and above | splash gets `border-radius: 24px` and `min-height: calc(100dvh - 32px)` | `src/style.css:2576-2577` |
| 900px and above | `min-height: calc(100dvh - clamp(48px, 8vw, 112px))` | `src/style.css:2665-2666` |
| Reduced motion | orb and inner animations forced off, primary transition off | `src/style.css:413-421` |
| Primary button hover / active / focus-visible | pointer and keyboard states | `src/style.css:225-244` |

**Forcing route:** `renderSplash` is exported (`src/splash.ts:55`) and takes an explicit third argument; `renderSplash(el, () => {}, false)` renders this variant on demand. No hash route reaches it other than the default boot path.

---

### splash-birthday
**Display name:** "Glee-fully Chai Chasers" with the "Happy Birthday, Glee!" panel
**Source:** `src/splash.ts:60-67` (the `birthdayBlock` branch inside `renderSplash`, `src/splash.ts:55`)
**Reachable in production:** yes. `src/main.ts:48` calls `renderSplash(app, tapIn)` with no third argument, so `showBirthday` resolves through `isBirthdayBonusAvailable()` (`src/splash.ts:58`).
**How it is reached:** local device clock is at or after July 17 00:00 and before August 1 00:00 of the current year, and `ccv1.birthdayBonusClaimed_<year>` is not `true` (`src/splash.ts:28-34`, key prefix `src/state.ts:13`). Tapping the primary button then calls `claimBirthdayBonus` (`src/main.ts:16-17`), which sets the year flag and adds 10000 to balance (`src/splash.ts:37-42`). Note: the CSS section comment reads `/* ── Birthday bonus panel (July 17 only, one-time) ── */` (`src/style.css:344`), which does not match the July 17 through July 31 window implemented at `src/splash.ts:31-33`.
**Parent scene:** `splash-standard` (same `renderSplash` output; this variant adds one block and changes the button)
**DOM root:** `div.chai-bday-panel` inside `section.chai-splash__content` (`src/splash.ts:61`, `src/splash.ts:91`)
**Verbatim copy:** all `splash-standard` strings apply, with these differences and additions.

| Element | Source | Text |
|---|---|---|
| Panel emoji | `src/splash.ts:62` | `🎂🦋🎉` (U+1F382, U+1F98B, U+1F389) |
| Headline | `src/splash.ts:63` | `Happy Birthday, Glee!` |
| Jamie's message (`BIRTHDAY_MESSAGE`) | `src/splash.ts:16-20`, rendered at `src/splash.ts:64` | `I built you a tiny universe where the coins never run out, the chai is always iced, and the cats finally have jobs. Every sparkle in it is something you taught me to see. Do you love it? Wait. No. Really love it? Happy birthday, my bride. Eternal love, Jamie` |
| Coin line, raw source | `src/splash.ts:65` | `<span class="chai-bday-coins">+10&thinsp;000&nbsp;Glee&#8209;coins</span>&nbsp;are waiting in your wallet. Tap in to collect&nbsp;them!` |
| Coin line, as rendered | `src/splash.ts:65` | `+10 000 Glee‑coins are waiting in your wallet. Tap in to collect them!` (thin space U+2009 after `+10`, no-break spaces U+00A0 before `Glee`, before `are`, and before `them!`, non-breaking hyphen U+2011 in `Glee‑coins`) |
| Primary button | `src/splash.ts:101` | `🎂 Start the Chai Chase` |

`BIRTHDAY_MESSAGE` is marked in source as do-not-edit (`src/splash.ts:12-15`).
**Assets:** same as `splash-standard`; the emoji are literal characters, not image assets.
**CSS:** `.chai-bday-panel`, `.chai-bday-emoji`, `.chai-bday-headline`, `.chai-bday-body`, `.chai-bday-coins`, `.chai-splash-button--bday` (`src/style.css:345-398`). Panel is `role="status" aria-live="polite"` (`src/splash.ts:61`).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Panel present, gold button | `showBirthday === true` | `src/splash.ts:60`, `src/splash.ts:99` |
| Compact panel | `max-height: 760px` reduces panel margin, padding, emoji size, headline size | `src/style.css:400-404` |
| Gold button hover | `filter: brightness(1.09)` | `src/style.css:398` |

**Forcing route:** `renderSplash(el, () => {}, true)` (exported, `src/splash.ts:55`). Alternatively remove the localStorage key `ccv1.birthdayBonusClaimed_<year>` while the device clock is inside the July window (`src/splash.ts:33`, `src/state.ts:13`).

---

### board-root
**Display name:** (no visible title on the container itself; the marquee inside reads `Glee-fully Chai Chasers`)
**Source:** `src/ui/board.ts:223`, `renderBoard`
**Reachable in production:** yes. Reached from the splash via `tapIn` (`src/main.ts:14-27`, `renderBoard` call at `src/main.ts:26`) and directly through the `#board` hash (`src/main.ts:32-38`). The hash routes are labelled dev-only in the comment at `src/main.ts:29-31` but are not guarded by any environment check; the strings `#board` and `#lap-quest` are present in the shipped bundle `dist/assets/index-CfZIap50.js`.
**How it is reached:** click `#tap-in` on the splash (`src/splash.ts:134` wires the handler; `src/main.ts:48` supplies `tapIn`), or load the page with `location.hash === "#board"` (`src/main.ts:32`). `renderBoard` is also re-invoked at the end of a non-bonus spin (`src/ui/board.ts:938`).
**Parent scene:** none
**DOM root:** `div.cc-root` with `data-theme` and `data-reduced-motion` attributes (`src/ui/board.ts:240`), containing `div.cc-shell` (`src/ui/board.ts:242`). The full class attribute is `relative h-full w-full flex flex-col text-amber-100 overflow-hidden cc-root`.
**Verbatim copy:** the container itself carries no text. Child scenes 4 through 17 hold all copy.
**Assets:** none at this level.
**CSS:** `.cc-root` (`src/style.css:29-37`), `.cc-shell` (`src/style.css:39-50`). Theme override block `.cc-root[data-theme="light"]` (`src/style.css:1773-1787`). Reduced-motion override `.cc-root[data-reduced-motion="true"] *` (`src/style.css:1769`).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Dark theme | `state.theme` is `dark`, or `system` with no light `prefers-color-scheme` match | `src/ui/board.ts:562-565` |
| Light theme | `state.theme` is `light`, or `system` with `matchMedia("(prefers-color-scheme: light)")` matching | `src/ui/board.ts:564`, styles at `src/style.css:1773-1787` |
| Reduced motion on | `data-reduced-motion="true"`; all animations and transitions clamped to .01ms | `src/ui/board.ts:240`, `src/style.css:1769` |
| Narrow phone | `max-width: 380px` re-lays the bet console into a grid and hides the AskJamie label | `src/style.css:2517-2557` |
| 600px and above | `.cc-root` padding 16px, shell rounded 24px | `src/style.css:2568-2578` |
| 900px and above | shell becomes a named CSS grid with an Ice Notes side column | `src/style.css:2580-2603` |
| Short viewport 480px and below | companion row and status line hidden | `src/style.css:2672-2675` |
| Short viewport 360px and below | marquee bulbs hidden | `src/style.css:2676-2678` |

**Forcing route:** `#board` hash (`src/main.ts:32`). `renderBoard` is exported (`src/ui/board.ts:223`) and accepts an optional `visibleGrid` third argument to pin the reel contents (`src/ui/board.ts:226`).

---

### board-marquee-header
**Display name:** `Glee-fully Chai Chasers`
**Source:** `src/ui/board.ts:243-261` inside `renderBoard`
**Reachable in production:** yes, rendered unconditionally by `renderBoard` (`src/ui/board.ts:243`).
**How it is reached:** present whenever the board is rendered.
**Parent scene:** `board-root`
**DOM root:** `header.marquee` (`src/ui/board.ts:243`); bulb strip `div.marquee-bulbs` (`src/ui/board.ts:244`); title `h1.marquee-title` (`src/ui/board.ts:246`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Title | `src/ui/board.ts:246` | `Glee-fully <span>Chai Chasers</span>` (the span is tinted mint, `src/style.css:806`) |

**Assets:** CSS only. Bulbs are 16 `span.bulb` elements generated by `bulbRow()` with `animation-delay` of `(i % 4) * 0.18s` (`src/ui/board.ts:320-322`).
**CSS:** `.marquee` (`src/style.css:760-769`), `.marquee-bulbs` and `.bulb` (`src/style.css:771-783`), `.marquee-row` (`src/style.css:786`), `.marquee-title` (`src/style.css:792-806`), shimmer pseudo-element (`src/style.css:809-835`). Keyframes: `bulb-twinkle` (`src/style.css:784`, 1.8s ease-in-out infinite), `title-shimmer-sweep` (`src/style.css:830-835`, 1.05s cubic-bezier(0.4, 0, 0.2, 1) forwards).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Resting | default | `src/style.css:809-826` (`opacity: 0` sweep layer) |
| Shimmer sweep | every SPARKLE press adds `.marquee-title--shimmer`, removed on `animationend` | `src/ui/board.ts:529-537` |
| Left-aligned title | viewport 900px and above | `src/style.css:2618` |
| Reduced title size | `max-width: 380px` sets 13px; `max-height: 720px` sets `clamp(16px, 4vw, 24px)` | `src/style.css:2521`, `src/style.css:2562` |
| Bulbs hidden | `max-height: 360px` | `src/style.css:2676-2678` |
| Light theme | marquee background and title color swap | `src/style.css:1776-1777` |

**Forcing route:** `#board`, then press SPARKLE to fire the shimmer (`src/ui/board.ts:527-537`). No isolated route for the shimmer state.

---

### board-chrome-buttons
**Display name:** (no visible title; icon buttons)
**Source:** `src/ui/board.ts:247-258`
**Reachable in production:** yes, rendered unconditionally in the marquee row.
**How it is reached:** present whenever the board is rendered; wired at `src/ui/board.ts:523-524`.
**Parent scene:** `board-marquee-header`
**DOM root:** `button#paytable-btn.chrome-btn` and `button#settings-btn.chrome-btn` (`src/ui/board.ts:247`, `src/ui/board.ts:253`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Paytable button `aria-label` | `src/ui/board.ts:247` | `Open symbol guide and game rules` |
| Paytable button `title` | `src/ui/board.ts:247` | `Symbol guide` |
| Settings button `aria-label` | `src/ui/board.ts:253` | `Settings` |

**Assets:** inline SVG in `src/ui/board.ts:248-251` (open-book glyph) and `src/ui/board.ts:254-257` (gear glyph); both stroke `#f5d576`, stroke-width `1.8`.
**CSS:** `.chrome-btn` (`src/style.css:871-883`), 48px minimum hit target, `:active` scale 0.94. 44px at `max-width: 380px` (`src/style.css:2524`).
**States and variants:** default and `:active` (`src/style.css:883`). Clicking opens `settings-page` or `paytable-page` (`src/ui/board.ts:523-524`).
**Forcing route:** `#board`, then click. No separate route.

---

### board-marquee-status
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:260` (element), `src/ui/board.ts:429-436` (`setStatus`)
**Reachable in production:** yes; the element is always rendered, and `setStatus` writes into it.
**How it is reached:** `setStatus(root, message)` sets `textContent` and clears it after 4000ms (`src/ui/board.ts:429-436`). Callers in this slice: bust-proof refill (`src/ui/board.ts:825`), AskJamie daily claim (`src/ui/board.ts:493`), sub-threshold win (`src/ui/board.ts:1437`).
**Parent scene:** `board-root`
**DOM root:** `div#marquee-status.marquee-status` with `aria-live="polite"` (`src/ui/board.ts:260`). A second element, `div#status-line.status-line` with `aria-live="polite"` (`src/ui/board.ts:298`), is retained for screen readers but collapsed to zero height and zero padding (`src/style.css:1376-1379`, comment at `src/style.css:1374-1375`).
**Verbatim copy:**

| Message | Source | Text |
|---|---|---|
| Bust-proof refill | `src/ui/board.ts:825` | `AskJamie found coins under the couch! +500 coins` |
| AskJamie daily claim | `src/ui/board.ts:493` | `AskJamie slipped you +500 coins!` |
| Sub-threshold win | `src/ui/board.ts:1437` | `+{amount} coins`, where amount is `amount.toLocaleString()` |

**Assets:** CSS only.
**CSS:** `.marquee-status` (`src/style.css:1391-1408`); collapsed at `max-height: 0; opacity: 0`, expanding to `max-height: 3em; opacity: 1; padding-top: 5px` via `:not(:empty)` (`src/style.css:1404-1408`), transition 220ms ease. `.status-line` base rule at `src/style.css:1381-1388`.
**States and variants:** empty (collapsed) and non-empty (expanded). Auto-clears after 4000ms; a new message resets the timer (`src/ui/board.ts:432-435`).
**Forcing route:** `setStatus` is not exported. Reachable by pressing the AskJamie perch on the board (`src/ui/board.ts:493`) or by spinning with a balance below the current bet (`src/ui/board.ts:823-825`).

---

### board-level-pill
**Display name:** `Lvl {n}`
**Source:** `src/ui/board.ts:264-266`
**Reachable in production:** yes, rendered unconditionally inside the bonus banner.
**How it is reached:** always present on the board; hidden while the bonus banner is active (`src/style.css:869`).
**Parent scene:** `board-root` (inside `div#bonus-banner.bonus-banner`, `src/ui/board.ts:264`)
**DOM root:** `span.level-chip.level-chip--cabinet` (`src/ui/board.ts:265`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| `aria-label` | `src/ui/board.ts:265` | `Player level` |
| Body | `src/ui/board.ts:265` | `Lvl ${level.level}<em>${level.into}/${level.span} Sparks</em>` |

Level values come from `xpIntoLevel` (`src/ui/board.ts:230`, `src/engine/economy.ts:38-43`): level 1 at 0 XP, each level needing `(level - 1) * 500` cumulative Sparks (`src/engine/economy.ts:34-36`), so `span` is 500 for every level and the resting first-load pill reads `Lvl 1` with `0/500 Sparks`.
**Assets:** CSS only.
**CSS:** `.level-chip` (`src/style.css:837-850`), `.level-chip--cabinet` (`src/style.css:852-867`), hidden by `.bonus-banner--active .level-chip--cabinet` (`src/style.css:869`). Banner container `.bonus-banner` (`src/style.css:890-897`).
**States and variants:** visible (idle banner) and hidden (banner active during a bonus session, class added at `src/ui/board.ts:2042`). Smaller type at `max-width: 380px` (`src/style.css:2522-2523`). Light theme color override (`src/style.css:1778`).
**Forcing route:** `#board` with a chosen `ccv1.xp` value in localStorage (`src/state.ts:89`, `src/state.ts:13`).

---

### board-reel-window
**Display name:** (no visible title; `aria-label` is `Reel board`)
**Source:** `src/ui/board.ts:268-276` (frame), `src/ui/board.ts:384-427` (`renderGridHtml`)
**Reachable in production:** yes, rendered unconditionally.
**How it is reached:** always present on the board. On first render the grid comes from a fixed seed `mulberry32(20260717)` at `betPerLine: 1` unless a `visibleGrid` is supplied (`src/ui/board.ts:232-237`).
**Parent scene:** `board-root`
**DOM root:** `main.cabinet-frame` (`src/ui/board.ts:268`) inside `div.cabinet-shell` (`src/ui/board.ts:263`), containing `div#reel-grid.reel-grid` with `role="img"` (`src/ui/board.ts:273`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Grid `aria-label` | `src/ui/board.ts:273` | `Reel board` |
| Multiplier badge | `src/ui/board.ts:398` | `×{n}` with `aria-label` `{n} times wild` |
| Wild Chai badge | `src/ui/board.ts:401` | `WILD CHAI` (`aria-hidden="true"`) |
| Wild Chai cell `aria-label` | `src/ui/board.ts:408` | `Mermaid cup wild chai` |
| Keepsake zone `aria-label` | `src/ui/board.ts:414` | `{width} by {height} giant keepsake` |

**Assets:** symbol art resolves through `symbolSvg` (`src/ui/symbols.ts:18-40`) and the manifest (`src/ui/asset-manifest.ts:40-68`): atlas sprites from `assets/atlases/standard-symbol-atlas.{webp,png}` and `assets/atlases/special-symbol-atlas.{webp,png}` (`src/ui/asset-manifest.ts:26-36`), plus `assets/symbols/doorbell.svg` and `assets/symbols/chai-pump.svg` (`src/ui/asset-manifest.ts:66-67`). Corner ornaments are inline SVG from `miniStar()` (`src/ui/board.ts:324-328`).
**CSS:** `.cabinet-shell` (`src/style.css:969-985`), `.cabinet-shell-divider` (`src/style.css:987-992`), `.cabinet-frame` with `aspect-ratio: 5 / 4` (`src/style.css:994-1007`), `.ornament` and its corner modifiers (`src/style.css:1009-1020`), `.reel-grid` 5-column grid (`src/style.css:1023-1035`), `.reel-col` (`src/style.css:1162-1167`), `.cell` (`src/style.css:1169-1183`), `.multiplier-badge` (`src/style.css:1601-1622`), `.cell.multiplier-wild` (`src/style.css:1597-1599`), `.chai-wild-cell` and `.chai-wild-badge` (`src/style.css:713-731`), `.payline-overlay` and `.payline-path` (`src/style.css:1134-1160`), `.keepsake-constellation` (`src/style.css:1191-1226`). Keyframes: `ornament-twinkle` (`src/style.css:1021`, 3.4s ease-in-out infinite), `multiplier-badge-pop` (`src/style.css:1625`, 420ms cubic-bezier(.34, 1.56, .64, 1) both), `keepsake-constellation-shimmer` (`src/style.css:1223`, 1.4s ease-in-out infinite alternate).
**States and variants:** structural cell modifiers emitted by `renderGridHtml` (`src/ui/board.ts:402-407`):

| Cell class | Condition | Source |
|---|---|---|
| `cell` | always | `src/ui/board.ts:403` |
| `multiplier-wild` | `cell.multiplier ?? cell.handbagMultiplier` present | `src/ui/board.ts:396`, `src/ui/board.ts:404` |
| `chai-wild-cell` | symbol is `wild_chai` | `src/ui/board.ts:400`, `src/ui/board.ts:405` |
| `lap-quest-wild` | `cell.sticky === "lap_quest"` | `src/ui/board.ts:406` |

Grid dimensions are `REELS` by `ROWS` from `src/engine/reels.ts` (`src/ui/board.ts:391-393`). The payline overlay always renders all 40 `PAYLINES` paths (`src/ui/board.ts:421-425`). Compact spacing at `max-width: 380px` (`src/style.css:2526-2531`).
**Forcing route:** `renderGridHtml` is exported (`src/ui/board.ts:384`) and takes `grid`, `keepsakeZone`, `showGuide`, and `winningLineIndices`, so any cell state can be rendered directly. `renderBoard`'s third parameter pins the visible grid (`src/ui/board.ts:226`).

---

### board-night-garden
**Display name:** (no visible title; decorative)
**Source:** `src/ui/board.ts:241` (mount), `src/ui/board.ts:330-373` (`gardenDecor`)
**Reachable in production:** yes, rendered unconditionally behind the shell.
**How it is reached:** always present on the board.
**Parent scene:** `board-root`
**DOM root:** `div#bg-layer.night-garden` (`src/ui/board.ts:241`)
**Verbatim copy:** none. Every element in this layer is decorative; the saucer SVG carries `aria-hidden="true"` (`src/ui/symbols.ts:162`), as does the foreground SVG (`src/ui/symbols.ts:184`).
**Assets:** inline SVG in `src/ui/symbols.ts:151-176` (`saucerSvg`, five color variants) and `src/ui/symbols.ts:183-213` (`gardenForegroundSvg`). No image files.
**CSS:** `.night-garden` (`src/style.css:427-439`), `.night-garden.aurora` (`src/style.css:441-447`), `.aurora-ribbons` (`src/style.css:449-463`), `.star`, `.star-slow`, `.star-fast` (`src/style.css:470-479`), `.firefly` (`src/style.css:486-494`), `.saucer-unit`, `.saucer-art`, `.saucer-light-a`, `.saucer-light-b` (`src/style.css:501-509`), `.saucer-beam` (`src/style.css:517-533`), `.garden-foreground` (`src/style.css:535-542`). Keyframes: `aurora-drift` (`src/style.css:465`, 14s ease-in-out infinite), `star-twinkle` (`src/style.css:481`, 5s slow / 2.6s fast), `firefly-drift` (`src/style.css:496`, 5s ease-in-out infinite), `light-blink` (`src/style.css:510`, 1.6s, variant b delayed 0.8s), `saucer-bob` (`src/style.css:512`, 6s ease-in-out infinite).
**States and variants:**

| Layer | Count and placement | Source |
|---|---|---|
| Aurora ribbons | 3 spans, delays 0s / -5s / -9s | `src/ui/board.ts:367`, `src/style.css:460-462` |
| Stars | 26, `top: 4 + ((i*17) % 55)%`, `left: 3 + ((i*41) % 94)%`, delay `(i%6)*0.5s`, every third one `star-fast` | `src/ui/board.ts:338-343`, `src/ui/board.ts:359-361` |
| Saucers | 5 fixed positions with variants 1 through 5 and delays 0s, 0.8s, 1.6s, 2.4s, 1.2s | `src/ui/board.ts:331-337` |
| Fireflies | 6, `top: 45 + ((i*37) % 30)%`, `left: 8 + ((i*53) % 84)%`, delay `(i%5)*0.7s` | `src/ui/board.ts:344-348` |
| Foreground silhouette | single SVG band, 11% height, min 60px | `src/ui/board.ts:371`, `src/style.css:535-542` |
| Beam firing | `.saucer-beam.beaming` grows to 340px at 0.6 opacity for 700ms | `src/style.css:530-533`, `src/ui/board.ts:1396-1403` |
| Aurora palette | `.night-garden.aurora` is applied only by the UniGlee marathon container (`src/ui/board.ts:2141`), not by `renderBoard` | `src/style.css:441-447` |
| Light theme | layer opacity .5, saturate .84, brightness 1.55 | `src/style.css:1774` |

**Forcing route:** `#board`. `gardenDecor` is not exported. `beamToSaucers` is not exported; the beam state is reachable only by winning a line (`src/ui/board.ts:1368`).

---

### board-firefly-meter
**Display name:** `Firefly Cascade`
**Source:** `src/ui/board.ts:284-290`; icon regeneration in `updateJar` (`src/ui/board.ts:438-443`)
**Reachable in production:** yes, rendered unconditionally in the companion row.
**How it is reached:** always present on the board; the count updates after each cascade step via `updateJar(root, step.meterAfter)` (`src/ui/board.ts:1363`).
**Parent scene:** `board-root` (inside `div.companion-row`, `src/ui/board.ts:279`)
**DOM root:** `div.jar-meter.jar-meter--inline` (`src/ui/board.ts:284`), icon holder `div#jar-icon.jar-meter-icon` (`src/ui/board.ts:287`), count `strong#meter-count.jar-meter-count` (`src/ui/board.ts:288`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Container `aria-label` | `src/ui/board.ts:284` | `Firefly cascade meter` |
| Kicker | `src/ui/board.ts:285` | `Firefly Cascade` |
| Count | `src/ui/board.ts:288`, `src/ui/board.ts:442` | `{n} / 6` |

**Assets:** inline SVG from `fireflyJarSvg(fillLevel)` (`src/ui/symbols.ts:216-244`). Fill level is clamped to 0 through 8 (`src/ui/symbols.ts:217`) and drives both the number of firefly circles and the drop-shadow glow radius (`src/ui/symbols.ts:219-224`), while the printed label is always out of 6 (`src/ui/board.ts:288`).
**CSS:** `.jar-meter` (`src/style.css:921-925`), full-size variant `.jar-meter:not(.jar-meter--inline)` (`src/style.css:927-937`), compact variant `.jar-meter--inline` (`src/style.css:939-952`), `.jar-meter-body` (`src/style.css:953`), `.jar-meter-icon` (`src/style.css:954-955`), `.jar-meter-kicker` (`src/style.css:957-958`), `.jar-meter-count` (`src/style.css:959-960`), `.jar-firefly` (`src/style.css:962`). Firefly opacity pulse is an inline SVG `<animate>` (values `0.5;1;0.5`, dur `1.6s`, `repeatCount="indefinite"`, begin `i * 0.2s`) at `src/ui/symbols.ts:222`, not a CSS keyframe.
**States and variants:** nine icon fill states (0 through 8 fireflies) from `fireflyJarSvg` (`src/ui/symbols.ts:217-223`). Two housings: inline (used on the board, `src/ui/board.ts:284`) and full-size standalone (`src/style.css:927`, comment cites the Joey Laundry chapter). Light theme count color override (`src/style.css:1777`). Hidden with the whole companion row at `max-height: 480px` (`src/style.css:2672-2675`).
**Forcing route:** `#board` with `ccv1.fireflyMeter` set in localStorage (`src/state.ts:92`); `updateJar` is not exported.

---

### board-treat-jar
**Display name:** `Treat Jar`
**Source:** `src/ui/board.ts:280-283`, chips built by `treatJarHtml` (`src/ui/board.ts:375-382`)
**Reachable in production:** yes, rendered unconditionally in the companion row.
**How it is reached:** always present on the board.
**Parent scene:** `board-root`
**DOM root:** `div#treat-jar.treat-jar-housing` (`src/ui/board.ts:280`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Container `aria-label` | `src/ui/board.ts:280` | `Treat Jar` |
| Title | `src/ui/board.ts:281` | `Treat Jar` |
| Chip 1 `title` | `src/ui/board.ts:378` | `Chicken Comets` |
| Chip 2 `title` | `src/ui/board.ts:379` | `Salmon Stars` |
| Chip 3 `title` | `src/ui/board.ts:380` | `Bougie Bites` |

Each chip prints the raw integer count for its treat (`src/ui/board.ts:378-380`). Counts are capped by `TREAT_JAR_CAP = 24` in the engine (`src/engine/features.ts:19`).
**Assets:** three atlas sprites via `symbolSvg("treat_chicken" | "treat_salmon" | "treat_bougie")` (`src/ui/board.ts:378-380`), which map to the standard atlas row 3, columns 0 through 2 (`src/ui/asset-manifest.ts:53-55`), files `assets/atlases/standard-symbol-atlas.webp` and `.png` (`src/ui/asset-manifest.ts:28-29`).
**CSS:** `.treat-jar-housing` (`src/style.css:1246-1256`), `.treat-jar-title` (`src/style.css:1257`), `.treat-chips-row` (`src/style.css:1258`), `.treat-chip` (`src/style.css:1259`), `.treat-icon` (`src/style.css:1260`). Compact at `max-width: 380px` (`src/style.css:2534-2537`).
**States and variants:** counts 0 through 23 per treat as rendered; the display has no separate empty state. Hidden with the companion row at `max-height: 480px` (`src/style.css:2673`).
**Forcing route:** `#board` with `ccv1.treatJar` set in localStorage (`src/state.ts:66`, `src/state.ts:90`). `treatJarHtml` is not exported.

---

### board-askjamie-perch
**Display name:** `AskJamie`
**Source:** `src/ui/board.ts:291-295`; behavior in `wireAskJamie` (`src/ui/board.ts:457-495`)
**Reachable in production:** yes, rendered unconditionally and wired at `src/ui/board.ts:525`.
**How it is reached:** always present on the board.
**Parent scene:** `board-root`
**DOM root:** `button#askjamie-perch.askjamie-housing` (`src/ui/board.ts:291`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Button `aria-label` | `src/ui/board.ts:291` | `AskJamie — tap for daily bonus` (em dash U+2014) |
| Label | `src/ui/board.ts:293` | `AskJamie` |

**Assets:** `public/assets/askjamie-avatar.jpg` with `public/assets/optimized/askjamie-avatar.webp` source, emitted by `publicPicture("askjamie-avatar.jpg", "askjamie-picture")` (`src/ui/board.ts:292`, helpers at `src/ui/board.ts:153-163`). The `alt` defaults to the empty string (`src/ui/board.ts:161`).
**CSS:** `.askjamie-housing` (`src/style.css:1262-1286`), `.askjamie-icon` (`src/style.css:1287-1301`), `.askjamie-icon img` (`src/style.css:1302-1308`), `.askjamie-picture` (`src/style.css:1309`). `.askjamie-label` has no base rule; its only declaration is `display: none` at `max-width: 380px` (`src/style.css:2539`).
**States and variants:** default (opacity .9), hover (opacity 1, icon scaled 1.06 with a stronger glow, `src/style.css:1281`, `src/style.css:1298-1301`), focus-visible (mint outline, `src/style.css:1282-1286`), icon 38px at `max-width: 380px` (`src/style.css:2538`). Hidden with the companion row at `max-height: 480px` (`src/style.css:2673`).
**Forcing route:** `#board`, then click the perch. `wireAskJamie` is not exported.

---

### board-askjamie-bubble
**Display name:** (no visible title; speech bubble)
**Source:** `src/ui/board.ts:294` (element), `src/ui/board.ts:462-494` (`showBubble` and the click handler)
**Reachable in production:** yes.
**How it is reached:** click `#askjamie-perch` (`src/ui/board.ts:473`). If `ccv1.askjamieLastClaim` equals today's `YYYY-MM-DD` key (`src/ui/board.ts:452-455`, `src/ui/board.ts:475`) the already-claimed bubble shows for 6000ms; otherwise 500 coins are added, the balance chip is rewritten, and the claim bubble shows for 8000ms (`src/ui/board.ts:480-492`).
**Parent scene:** `board-askjamie-perch`
**DOM root:** `div#askjamie-bubble.askjamie-bubble` (`src/ui/board.ts:294`), gaining `.askjamie-bubble--visible` while shown (`src/ui/board.ts:465`)
**Verbatim copy:**

| Variant | Source | Text |
|---|---|---|
| Already claimed today | `src/ui/board.ts:476` | `Come back tomorrow for more coins! 🌙` (U+1F319) |
| Claim granted, message | `src/ui/board.ts:489` | `+500 coins! 🎉 Want to learn more about us?` (U+1F389) |
| Claim granted, link text | `src/ui/board.ts:490` | `Visit us →` |
| Accompanying status message | `src/ui/board.ts:493` | `AskJamie slipped you +500 coins!` |

Link `href` is chosen uniformly at random from `ASKJAMIE_URLS` (`src/ui/board.ts:445-450`, `src/ui/board.ts:487`): `https://glee-fully.tools/arcade/`, `https://glee-fully.tools/about/`, `https://overkillhill.com/projects/glee-fully-chai-chasers/`, `https://overkillhill.com/manifesto/`. The anchor uses `target="_blank" rel="noopener noreferrer"` (`src/ui/board.ts:490`).
**Assets:** CSS only.
**CSS:** `.askjamie-bubble` (`src/style.css:1312-1336`), tail `::after` (`src/style.css:1337-1346`), `.askjamie-bubble--visible` (`src/style.css:1347-1351`), `.aj-msg` (`src/style.css:1352-1358`), `.aj-link` with hover and focus-visible (`src/style.css:1359-1372`). Transition 180ms ease on opacity and transform; no keyframes.
**States and variants:** hidden (`aria-hidden="true"`, opacity 0, `pointer-events: none`), visible-claimed (6000ms), visible-granted with link (8000ms). The hide timer is reset on each show (`src/ui/board.ts:466-470`).
**Forcing route:** `#board`, click the perch. To force the already-claimed variant, set `ccv1.askjamieLastClaim` to today's date key (`src/ui/board.ts:475`, format at `src/ui/board.ts:452-455`).

---

### board-bet-console
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:300-309`; bet stepping wired at `src/ui/board.ts:505-521`
**Reachable in production:** yes, rendered unconditionally.
**How it is reached:** always present on the board.
**Parent scene:** `board-root`
**DOM root:** `footer.bet-console` (`src/ui/board.ts:300`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Coin chip `aria-label` | `src/ui/board.ts:301` | `Glee-coin balance` |
| Coin chip body | `src/ui/board.ts:301` | `{balance.toLocaleString()}<em>coins</em>` |
| Decrease button `aria-label` | `src/ui/board.ts:303` | `Decrease bet` |
| Decrease button glyph | `src/ui/board.ts:303` | `−` (U+2212 MINUS SIGN) |
| Bet display | `src/ui/board.ts:304` | the current bet as a bare integer |
| Increase button `aria-label` | `src/ui/board.ts:305` | `Increase bet` |
| Increase button glyph | `src/ui/board.ts:305` | `+` (U+002B) |

Selectable bet values come from `availableBetLevels(level)` (`src/ui/board.ts:231`): `[1, 2, 5, 10, 25, 50]` at player level 12 and above, otherwise the first five (`src/engine/economy.ts:5-16`). Starting balance is 500 (`src/engine/economy.ts:10`, `src/state.ts:87`); starting bet is 1 (`src/state.ts:88`).
**Assets:** CSS only.
**CSS:** `.bet-console` (`src/style.css:1414-1427`), `.coin-chip` (`src/style.css:1429-1443`), `.bet-console > .chrome-btn` (`src/style.css:1445-1451`), `.bet-display` (`src/style.css:1453-1459`). A `div.flex-1` spacer sits between the coin chip and the stepper (`src/ui/board.ts:302`).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Default row layout | above 480px | `src/style.css:1414-1427` |
| Tightened row | `max-width: 480px` | `src/style.css:2511-2515` |
| Two-row grid layout | `max-width: 380px`; coin chip spans row 1, stepper and SPARKLE on row 2, spacer hidden | `src/style.css:2542-2556` |
| Bet at floor or ceiling | the step handlers no-op when the index is at an end | `src/ui/board.ts:505-521` |
| Light theme | console background and bet display color swap | `src/style.css:1776-1777` |

**Forcing route:** `#board` with `ccv1.balance`, `ccv1.bet`, and `ccv1.xp` set in localStorage (`src/state.ts:87-89`).

---

### board-sparkle-button
**Display name:** `SPARKLE!`
**Source:** `src/ui/board.ts:306-308`; handler at `src/ui/board.ts:527-559`
**Reachable in production:** yes, rendered unconditionally.
**How it is reached:** always present on the board.
**Parent scene:** `board-bet-console`
**DOM root:** `button#sparkle-btn.sparkle-btn` containing a `<span>` (`src/ui/board.ts:306-308`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Button label | `src/ui/board.ts:307` | `SPARKLE!` |

The button has no `aria-label`; the visible text is the accessible name.
**Assets:** CSS only.
**CSS:** `.sparkle-btn` (`src/style.css:1461-1477`), `:active` (`src/style.css:1478`), `.sparkle-btn.is-spinning` (`src/style.css:1479`). Keyframes: `sparkle-idle` (`src/style.css:1481`, 2.4s ease-in-out infinite box-shadow pulse), `sparkle-spin-pulse` (`src/style.css:1485`, 0.5s ease-in-out infinite brightness pulse).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Idle | default; `sparkle-idle` glow loop | `src/style.css:1475` |
| Pressed | `:active`; translateY(2px) scale(0.97) | `src/style.css:1478` |
| Spinning | `.is-spinning` added at spin start, removed after the spin resolves | `src/ui/board.ts:829`, `src/ui/board.ts:911` |
| Disabled | `sparkleBtn.disabled = true` during a spin | `src/ui/board.ts:828`, guard at `src/ui/board.ts:556` |
| Overlay dismisser | while `#bonus-continue`, `#uniglee-summary-continue`, or a `.levelup-overlay:not(.levelup-overlay--out)` exists, the press forwards the click and returns | `src/ui/board.ts:542-549` |
| Narrow phone | min-width 108px at 480px, 0 with 16px type at 380px | `src/style.css:2514`, `src/style.css:2556` |

Every press also restarts the marquee title shimmer (`src/ui/board.ts:529-537`) and, when not disabled, unlocks audio, starts base music, and plays the spin-start cue (`src/ui/board.ts:551-558`).
**Forcing route:** `#board`, then press. The disabled and spinning states are only reachable mid-spin.

---

### ice-notes-card
**Display name:** `ICE NOTES`
**Source:** `src/ui/board.ts:133-138` (`iceNotesCardHtml`), body at `src/ui/board.ts:115-131` (`iceNotesBodyHtml`), mounted at `src/ui/board.ts:311`
**Reachable in production:** yes, rendered unconditionally by `renderBoard`.
**How it is reached:** always present on the board. The starting entry index is randomized at module load: `Math.floor(Math.random() * ICE_NOTES.length)` (`src/ui/board.ts:113`). After every spin the card advances via `advanceIceNote` (`src/ui/board.ts:921`, `src/ui/board.ts:928`, `src/ui/board.ts:934`, `src/ui/board.ts:939`), which picks a new index with `nextIceNoteIndex` (never an immediate repeat, `src/ui/ice-notes.ts:140-145`).
**Parent scene:** `board-root`
**DOM root:** `aside#ice-notes-card.ice-notes-card` (`src/ui/board.ts:134`); the swapping region is `div.ice-notes-body` with `aria-live="polite"` (`src/ui/board.ts:136`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Card `aria-label` | `src/ui/board.ts:134` | `Chai ingredient note` |
| Eyebrow | `src/ui/board.ts:135` | `ICE NOTES` |
| Ingredient name | `src/ui/board.ts:122` | one of 22 ingredient strings, see Appendix A |
| Fact text | `src/ui/board.ts:122` | one of 66 fact strings, see Appendix A |
| Profile label 1 | `src/ui/board.ts:125` | `Flavor` |
| Profile label 2 | `src/ui/board.ts:126` | `Chai role` |
| Profile label 3 | `src/ui/board.ts:127` | `Source` |
| Profile label 4 | `src/ui/board.ts:128` | `Gathering` |

The fourth label reads `Gathering` in the UI while the underlying field is named `harvest` (`src/ui/ice-notes.ts:13`, rendered at `src/ui/board.ts:128`).
**Assets:** inline four-point-star SVG in `src/ui/board.ts:119-121`. No image files.
**CSS:** `.ice-notes-card` (`src/style.css:1491-1505`), `.ice-notes-body` and `.ice-notes-body--fading` (`src/style.css:1508-1516`), `.ice-notes-eyebrow` (`src/style.css:1518-1526`), `.ice-notes-header` (`src/style.css:1528`), `.ice-notes-icon` (`src/style.css:1530`), `.ice-notes-name-group` with a two-line clamp (`src/style.css:1532-1540`), `.ice-notes-name` (`src/style.css:1542`), `.ice-notes-text` (`src/style.css:1544`), `.ice-notes-profile` two-column grid (`src/style.css:1546-1551`), `dt` (`src/style.css:1555-1565`), `dd` (`src/style.css:1567-1574`). No keyframes; the swap is a 200ms opacity transition (`src/style.css:1514`).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Resting, 110px card | default | `src/style.css:1494` |
| Fading out | `.ice-notes-body--fading` for 200ms before the innerHTML swap, skipped when `prefers-reduced-motion: reduce` matches | `src/ui/board.ts:144-150` |
| Hidden | `max-height: 599px` | `src/style.css:1575-1577` |
| Enlarged, 128px card | `min-width: 600px` | `src/style.css:1579-1585` |
| Side panel | `min-width: 900px`, see `ice-notes-side-panel` | `src/style.css:2606-2663` |
| Reduced motion | transition removed | `src/style.css:1586-1588` |

**Forcing route:** none found for a specific entry. `ICE_NOTES` and `nextIceNoteIndex` are exported (`src/ui/ice-notes.ts:26`, `src/ui/ice-notes.ts:140`), but `iceNoteIdx` is module-private (`src/ui/board.ts:113`) and `advanceIceNote` is not exported (`src/ui/board.ts:140`). Reloading `#board` rerolls the starting index.

---

### ice-notes-side-panel
**Display name:** `ICE NOTES`
**Source:** same markup as `ice-notes-card` (`src/ui/board.ts:133-138`); the variant is entirely CSS at `src/style.css:2580-2663`
**Reachable in production:** yes, at viewport widths of 900px and above.
**How it is reached:** `@media (min-width: 900px)` (`src/style.css:2580`). `.cc-shell` switches to `display: grid !important` with the named template `"header header" / "cabinet notes" / "companion notes" / "status notes" / "bet notes"` and a `1fr 216px` column track (`src/style.css:2587-2595`), and `.ice-notes-card` takes `grid-area: notes` (`src/style.css:2606-2607`).
**Parent scene:** `board-root`
**DOM root:** `aside#ice-notes-card.ice-notes-card` (`src/ui/board.ts:134`)
**Verbatim copy:** identical to `ice-notes-card`; no strings change at this breakpoint.
**Assets:** same inline star SVG (`src/ui/board.ts:119-121`).
**CSS overrides at 900px and above:**

| Property | Value | Source |
|---|---|---|
| Panel height | `auto` (overrides the 128px fixed height), `align-self: stretch` | `src/style.css:2608-2610` |
| Margin | `8px 0 0` | `src/style.css:2609` |
| Border | `2px solid rgba(159, 232, 197, 0.28)`, top-only accent cleared | `src/style.css:2613-2614` |
| Radius | `16px` | `src/style.css:2611` |
| Eyebrow | 11px, letter-spacing .14em, margin-bottom 10px, opacity .85 | `src/style.css:2621-2626` |
| Name group | clamp removed, `display: block`, `overflow: visible` | `src/style.css:2628-2633` |
| Ingredient name | `display: block`, 20px, margin-bottom 6px | `src/style.css:2635-2639` |
| Fact text | `display: block`, 15px, line-height 1.55 | `src/style.css:2641-2645` |
| Profile grid | single column, `gap: 12px 0`, `margin-top: 16px` | `src/style.css:2647-2651` |
| Profile rows | column flex, left aligned, gap 2px | `src/style.css:2653-2657` |
| `dt` | 10px, letter-spacing .10em, opacity .85 | `src/style.css:2658-2662` |
| `dd` | 14px, line-height 1.35 | `src/style.css:2663` |
| Marquee title | `text-align: left` at this breakpoint | `src/style.css:2618` |

**States and variants:** same content states as `ice-notes-card`; the fade-out swap behaves identically (`src/ui/board.ts:144-150`).
**Forcing route:** resize the viewport to 900px or wider with the board rendered (`#board`).

---

### settings-page
**Display name:** `Settings` (eyebrow `YOUR CHAI CHASE`)
**Source:** `src/ui/board.ts:567`, `openSettingsPage`
**Reachable in production:** yes; opened from the marquee settings button (`src/ui/board.ts:523`).
**How it is reached:** click `#settings-btn` (`src/ui/board.ts:253`, handler `src/ui/board.ts:523`). The page is appended to `.cc-root` (`src/ui/board.ts:616`) and focus moves to the close button (`src/ui/board.ts:740`).
**Parent scene:** `board-root`
**DOM root:** `section.game-page.settings-page` with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="settings-title"` (`src/ui/board.ts:568-572`)
**Verbatim copy (page chrome):**

| Element | Source | Text |
|---|---|---|
| Close button `aria-label` | `src/ui/board.ts:575` | `Close settings` |
| Close button glyph | `src/ui/board.ts:575` | `←` (U+2190) |
| Eyebrow | `src/ui/board.ts:576` | `YOUR CHAI CHASE` |
| Heading | `src/ui/board.ts:576` | `Settings` |

**Assets:** CSS only.
**CSS:** `.game-page` (`src/style.css:1634-1650`), `.game-page-topbar` (`src/style.css:1653-1661`), `.page-close` (`src/style.css:1662`), `.page-eyebrow` (`src/style.css:1665`), `.page-top-spacer` (`src/style.css:1666`), `.game-page-scroll` (`src/style.css:1667-1668`), `.settings-card` (`src/style.css:1670-1681`). Keyframe: `page-arrive` (`src/style.css:1651`, 180ms ease-out both).
**States and variants:** open and closed. Close paths: the close button (`src/ui/board.ts:639`) and the Escape key while the page has focus (`src/ui/board.ts:640`). Closing also tears down any owned music preview (`src/ui/board.ts:638`). Light-theme overrides for the page, topbar, headings, cards, and help text (`src/style.css:1780-1787`).
**Forcing route:** `#board`, then click the settings chrome button. `openSettingsPage` is not exported.

---

### settings-look-and-feel
**Display name:** `Look & feel`
**Source:** `src/ui/board.ts:580-589`
**Reachable in production:** yes, first card on the Settings page.
**How it is reached:** open `settings-page`.
**Parent scene:** `settings-page`
**DOM root:** `section.settings-card` containing `div.theme-choice[role="radiogroup"]` (`src/ui/board.ts:583`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Heading | `src/ui/board.ts:581` | `Look &amp; feel` (renders as `Look & feel`) |
| Help | `src/ui/board.ts:582` | `Choose how the night garden appears on this device.` |
| Radiogroup `aria-label` | `src/ui/board.ts:583` | `Appearance` |
| Option 1 | `src/ui/board.ts:584-586` | `System` |
| Option 2 | `src/ui/board.ts:584-586` | `Dark` |
| Option 3 | `src/ui/board.ts:584-586` | `Light` |

Option labels are produced by capitalizing the `ThemeMode` values `system`, `dark`, `light` (`src/ui/board.ts:584`, `src/ui/board.ts:586`; type at `src/state.ts:59`).
**Assets:** CSS only; each option shows a `span.theme-swatch.theme-swatch--{theme}` (`src/ui/board.ts:586`).
**CSS:** `.theme-choice` (`src/style.css:1683`), `.theme-option` (`src/style.css:1684-1696`), `.theme-option.is-selected` (`src/style.css:1697`), `.theme-swatch` (`src/style.css:1698`), `.theme-swatch--dark` (`src/style.css:1699`), `.theme-swatch--light` (`src/style.css:1700`), `.theme-swatch--system` (`src/style.css:1701`), light-theme option override (`src/style.css:1785`).
**States and variants:** each button carries `role="radio"` with `aria-checked` and toggles `.is-selected` (`src/ui/board.ts:585`, `src/ui/board.ts:647-651`). Selecting a theme immediately rewrites `data-theme` on both `.cc-root` and `documentElement`, then persists (`src/ui/board.ts:643-652`).
**Forcing route:** set `ccv1.theme` to `"system"`, `"dark"`, or `"light"` in localStorage before loading `#board` (`src/state.ts:99`).

---

### settings-sound
**Display name:** `Sound`
**Source:** `src/ui/board.ts:591-597`; volume rows from `volumeControl` (`src/ui/board.ts:743-751`)
**Reachable in production:** yes, second card on the Settings page.
**How it is reached:** open `settings-page`.
**Parent scene:** `settings-page`
**DOM root:** `section.settings-card` with `div.settings-heading-row` and two `div.volume-row` blocks (`src/ui/board.ts:591-596`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Heading | `src/ui/board.ts:592` | `Sound` |
| Help | `src/ui/board.ts:592` | `A warm mix, tuned your way.` |
| Master toggle status | `src/ui/board.ts:593`, updated at `src/ui/board.ts:666` | `On` or `Off` |
| Music row label | `src/ui/board.ts:595` | `Music` |
| Music row help | `src/ui/board.ts:595` | `The Chai Chase score` |
| Music slider `aria-label` | `src/ui/board.ts:748` | `Music volume` |
| Music preview `aria-label` | `src/ui/board.ts:746`, `src/ui/board.ts:749` | `Preview music (3 s)` |
| SFX row label | `src/ui/board.ts:596` | `Sound effects` |
| SFX row help | `src/ui/board.ts:596` | `Cascades, cats, and celebrations` |
| SFX slider `aria-label` | `src/ui/board.ts:748` | `Sound effects volume` |
| SFX preview `aria-label` | `src/ui/board.ts:746`, `src/ui/board.ts:749` | `Preview sound effects` |
| Volume `output` text | `src/ui/board.ts:748` | `(max)` |
| Preview button glyph, idle | `src/ui/board.ts:749`, reset at `src/ui/board.ts:628` | `▶` (U+25B6) |
| Preview button glyph, active | `src/ui/board.ts:696` | `■` (U+25A0) |

The `<output id="{id}-volume-value">` element is emitted with the literal text `(max)` and is never updated by any handler; `wireVolume` only reads the slider and calls `apply` and `persist` (`src/ui/board.ts:753-765`).
**Slider ranges:**

| Control | min | max attribute | Initial value attribute | Source |
|---|---|---|---|---|
| Music | 0 | 700 (`MUSIC_VOLUME_MAX * 100`, `MUSIC_VOLUME_MAX = 7`) | `Math.round(state.musicVolume * 100)`; default state 400 | `src/ui/board.ts:744-748`, `src/audio/music.ts:18`, `src/state.ts:97` |
| Sound effects | 0 | 200 (`SFX_VOLUME_MAX * 100`, `SFX_VOLUME_MAX = 2`) | `Math.round(state.sfxVolume * 100)`; default state 82 | `src/ui/board.ts:744-748`, `src/audio/synth.ts:19`, `src/state.ts:98` |

**Assets:** CSS only.
**CSS:** `.sound-switch` and its faux toggle (`src/style.css:1703-1709`), `.volume-row` (`src/style.css:1711-1712`), `.volume-control` (`src/style.css:1714-1719`), `.volume-preview-btn` with hover, active, focus-visible, and `[aria-pressed="true"]` states (`src/style.css:1721-1743`). Keyframe: `preview-pulse` (`src/style.css:1744`, 1.1s ease-in-out infinite, applied only while `aria-pressed="true"`).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Sound on / off | `#settings-sound-toggle` change; toggles SFX and music enable, starts or stops base music, rewrites the `On`/`Off` label | `src/ui/board.ts:656-668` |
| Music preview, owned | preview pressed while base music is not running; starts music, `aria-pressed="true"`, glyph `■`, auto-stops after 3000ms | `src/ui/board.ts:679-703` |
| Music preview, visual only | preview pressed while base music is already running; no audio-graph change, same 3000ms visual window | `src/ui/board.ts:687-702` |
| Preview blocked | `state.soundOn` is false; the handler returns before any state change | `src/ui/board.ts:681`, `src/ui/board.ts:709` |
| SFX preview | plays a win pluck then a cascade arpeggio 240ms later; no pressed state is set | `src/ui/board.ts:707-712` |

**Forcing route:** set `ccv1.soundOn`, `ccv1.musicVolume`, and `ccv1.sfxVolume` in localStorage before loading `#board` (`src/state.ts:79`, `src/state.ts:97-98`), then open Settings.

---

### settings-reduce-motion
**Display name:** `Reduce motion`
**Source:** `src/ui/board.ts:599-602`
**Reachable in production:** yes, third card on the Settings page.
**How it is reached:** open `settings-page`.
**Parent scene:** `settings-page`
**DOM root:** `section.settings-card.settings-card--compact` (`src/ui/board.ts:599`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Heading | `src/ui/board.ts:600` | `Reduce motion` |
| Help | `src/ui/board.ts:600` | `Use gentle fades instead of movement.` |
| Toggle status | `src/ui/board.ts:601`, updated at `src/ui/board.ts:719` | `On` or `Off` |

**Assets:** CSS only.
**CSS:** `.settings-card--compact` shares the flex row rule with `.settings-heading-row` (`src/style.css:1681`); toggle styling as in `settings-sound` (`src/style.css:1703-1709`).
**States and variants:** on and off. Changing it writes `data-reduced-motion` on `.cc-root` (`src/ui/board.ts:717`), which clamps every animation and transition inside the board (`src/style.css:1769`). The initial default is `matchMedia("(prefers-reduced-motion: reduce)").matches` (`src/state.ts:100-103`).
**Forcing route:** set `ccv1.reducedMotion` in localStorage (`src/state.ts:100`) or emulate the OS reduced-motion preference before first load.

---

### settings-payline-guide
**Display name:** `Payline guide`
**Source:** `src/ui/board.ts:604-607`
**Reachable in production:** yes, fourth card on the Settings page.
**How it is reached:** open `settings-page`.
**Parent scene:** `settings-page`
**DOM root:** `section.settings-card.settings-card--compact` (`src/ui/board.ts:604`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Heading | `src/ui/board.ts:605` | `Payline guide` |
| Help | `src/ui/board.ts:605` | `Show all 40 paylines faintly on the resting board. Winning lines still glow after every win.` |
| Toggle status | `src/ui/board.ts:606`, updated at `src/ui/board.ts:730` | `On` or `Off` |

**Assets:** CSS only.
**CSS:** toggle styling as above; the effect targets `.payline-path.is-guide` (`src/style.css:1151`).
**States and variants:** on and off. Toggling immediately adds or removes `is-guide` on every existing `.payline-path` and persists (`src/ui/board.ts:724-732`). Default is `false` (`src/state.ts:96`).
**Forcing route:** set `ccv1.paylineGuideOn` to `true` in localStorage before loading `#board` (`src/state.ts:96`), or call `renderGridHtml(grid, undefined, true)` (`src/ui/board.ts:384`).

---

### settings-about
**Display name:** `About this gift`
**Source:** `src/ui/board.ts:609-612`
**Reachable in production:** yes, fifth card on the Settings page.
**How it is reached:** open `settings-page`.
**Parent scene:** `settings-page`
**DOM root:** `section.settings-card.about-card` (`src/ui/board.ts:609`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Heading | `src/ui/board.ts:610` | `About this gift` |
| Body | `src/ui/board.ts:611` | `A cozy, original Chai Chase for Glee — fictional Glee-coins only, with no purchases or ads. Basic reach measurement helps Jamie understand how the gift is finding people.` (em dash U+2014) |

**Assets:** CSS only.
**CSS:** `.about-card` (`src/style.css:1748`), body text via `.about-card p` (`src/style.css:1679`), light-theme override (`src/style.css:1784`).
**States and variants:** single static state.
**Forcing route:** `#board`, then open Settings and scroll.

---

### settings-start-fresh
**Display name:** `Start fresh`
**Source:** `src/ui/board.ts:614` (button), `src/ui/board.ts:734-739` (handler)
**Reachable in production:** yes, last control on the Settings page.
**How it is reached:** open `settings-page` and press the button.
**Parent scene:** `settings-page`
**DOM root:** `button#settings-reset.reset-progress-btn` (`src/ui/board.ts:614`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Button | `src/ui/board.ts:614` | `Start fresh` |
| `confirm()` text | `src/ui/board.ts:735` | `Start fresh? This clears your Chai Chase progress and settings on this device.` |

**Assets:** CSS only; the confirmation is the browser-native `confirm()` dialog, which is not styleable.
**CSS:** `.reset-progress-btn` (`src/style.css:1749`).
**States and variants:** confirmed removes every `ccv1.`-prefixed localStorage key and reloads the page (`src/ui/board.ts:736-737`, `resetAll` at `src/state.ts:32-36`); cancelled does nothing.
**Forcing route:** `#board`, open Settings, press `Start fresh`.

---

### paytable-page
**Display name:** `Symbol guide` (eyebrow `HOW THE CHAI CHASE PAYS`)
**Source:** `src/ui/board.ts:767`, `openPaytablePage`
**Reachable in production:** yes; opened from the marquee book button (`src/ui/board.ts:524`).
**How it is reached:** click `#paytable-btn` (`src/ui/board.ts:247`, handler `src/ui/board.ts:524`). Appended to `.cc-root` (`src/ui/board.ts:797`), focus moves to the close button (`src/ui/board.ts:801`).
**Parent scene:** `board-root`
**DOM root:** `section.game-page.paytable-page` with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="paytable-title"` (`src/ui/board.ts:768-772`)
**Verbatim copy (chrome and prose):**

| Element | Source | Text |
|---|---|---|
| Close button `aria-label` | `src/ui/board.ts:775` | `Close symbol guide` |
| Close button glyph | `src/ui/board.ts:775` | `←` (U+2190) |
| Eyebrow | `src/ui/board.ts:776` | `HOW THE CHAI CHASE PAYS` |
| Heading | `src/ui/board.ts:776` | `Symbol guide` |
| Intro strong | `src/ui/board.ts:780` | `40 fixed lines` |
| Intro span | `src/ui/board.ts:780` | `Match 3, 4, or 5 symbols from the left. Values are × your line bet.` (multiplication sign U+00D7) |
| Paying-symbol grid `aria-label` | `src/ui/board.ts:781` | `Paying symbols` |
| Section title | `src/ui/board.ts:782` | `Special symbols` |
| Footnote | `src/ui/board.ts:795` | `Line values are shown with the game’s live tuning applied, so this guide always matches what the board awards.` (right single quotation mark U+2019) |

**Paying-symbol rows.** Order and names from `PAYTABLE_SYMBOLS` (`src/ui/board.ts:169-182`); each card prints `3`, `4`, `5` term labels and the `formatMultiplier` values (`src/ui/board.ts:806`), which are `PAYTABLE[id][n] * PAYOUT_SCALE` with `PAYOUT_SCALE = 0.775`, printed as an integer when integral and otherwise to one decimal, always suffixed `×` (`src/ui/board.ts:813-816`, `src/engine/paylines.ts:53-73`).

| # | Symbol id | Card name | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 1 | `tumbler` | `Mermaid Tumbler` | `43.4×` | `129.4×` | `861.8×` |
| 2 | `butterfly` | `Midnight Butterfly` | `32.6×` | `96.9×` | `537.9×` |
| 3 | `mixtape` | `Glee Mix Tape` | `25.6×` | `74.4×` | `323.2×` |
| 4 | `crystal` | `Crystal Cluster` | `20.9×` | `63.6×` | `258.9×` |
| 5 | `chai` | `Iced Chai To-Go` | `16.3×` | `43.4×` | `172.1×` |
| 6 | `candle` | `Cinnamon Candle` | `16.3×` | `43.4×` | `172.1×` |
| 7 | `cassette` | `Glee Cardigan` | `10.1×` | `25.6×` | `107.7×` |
| 8 | `gnome` | `Moonlit Book Stack` | `10.1×` | `25.6×` | `107.7×` |
| 9 | `mailbox` | `Butterfly Hair Clip` | `6.2×` | `16.3×` | `53.5×` |
| 10 | `vhs` | `VHS Tape` | `6.2×` | `16.3×` | `53.5×` |
| 11 | `teapot` | `Aurora Keepsake` | `6.2×` | `16.3×` | `53.5×` |
| 12 | `yarn` | `Shared-Life Locket` | `6.2×` | `16.3×` | `53.5×` |

**Special-symbol rows.** Emitted by `featureCard` in this order (`src/ui/board.ts:784-793`).

| # | Symbol id | Name | Description |
|---|---|---|---|
| 1 | `wild_joey` | `Joey Saucer Wild` | `Substitutes for every paying symbol. A wild-only line pays as the Mermaid Tumbler.` |
| 2 | `wild_phoebe` | `Phoebe Saucer Wild` | `Substitutes for every paying symbol. A wild-only line pays as the Mermaid Tumbler.` |
| 3 | `wild_handbag` | `Handbag Wild` | `A rare high-value wild. Each one carries a randomized ×3, ×5, or ×10 line multiplier, including bonus boards.` |
| 4 | `treat_chicken` | `Chicken Comets` | `A Phoebe treat. It joins the Treat Jar and can invite a helpful cat pop-in.` |
| 5 | `treat_salmon` | `Salmon Stars` | `A Phoebe treat. It joins the Treat Jar and can invite a helpful cat pop-in.` |
| 6 | `treat_bougie` | `Bougie Bites` | `Joey's favorite. Keep one in the Treat Jar for his stronger assist.` |
| 7 | `doorbell` | `Doorbell` | `A pair on the first two positions of any line begins Doorbell Panic free spins.` |
| 8 | `chai_pump` | `Bold Chai Pump` | `A same-payline pair opens the 30-second barista pump scene. Main spins only.` |
| 9 | `uniglee` | `UniGlee` | `The rare rainbow-butterfly legend begins a special Chai Chase celebration.` |
| 10 | `wild_chai` | `Wild Chai` | `The mermaid iced-chai cup substitutes for every paying symbol and can carry a bonus multiplier.` |

**Assets:** every row renders `symbolSvg(id)` (`src/ui/board.ts:806`, `src/ui/board.ts:810`): standard atlas for rows 1 through 12 and the three treats, special atlas for `uniglee`, `wild_joey`, `wild_phoebe`, `wild_handbag`, `wild_chai`, and standalone SVGs `assets/symbols/doorbell.svg` and `assets/symbols/chai-pump.svg` (`src/ui/asset-manifest.ts:40-68`).
**CSS:** `.game-page` and `.game-page-topbar` shared with Settings (`src/style.css:1634-1668`), `.paytable-intro` (`src/style.css:1751-1753`), `.paytable-grid` two-column (`src/style.css:1754`), `.pay-symbol-card` and its `dl`/`dt`/`dd` (`src/style.css:1755-1761`), `.page-section-title` (`src/style.css:1762`), `.feature-symbol-grid` (`src/style.css:1763`), `.feature-symbol-card` (`src/style.css:1764-1766`), `.paytable-footnote` (`src/style.css:1767`). Keyframe: `page-arrive` (`src/style.css:1651`).
**States and variants:** open and closed. Close paths: the close button and the Escape key (`src/ui/board.ts:798-800`). Light-theme card and heading overrides (`src/style.css:1782-1787`).
**Forcing route:** `#board`, then click the symbol-guide chrome button. `openPaytablePage` is not exported.

---

### cat-popin-phoebe-fed
**Display name:** (no visible title; the sprite has `aria-label` `Phoebe`)
**Source:** `src/ui/board.ts:1467`, `showCatPopIn`
**Reachable in production:** yes.
**How it is reached:** a spin returns `result.catVisit` (`src/ui/board.ts:897-903`). The engine rolls a visit at a base rate of 1/32, doubled after 15 dry spins (`src/engine/features.ts:144`, `src/engine/features.ts:155-156`); Phoebe is selected when `catRoll < 0.6` (`src/engine/features.ts:159`); `fed` is true when any treat is in the jar (`src/engine/features.ts:164-166`).
**Parent scene:** `board-root`
**DOM root:** `div.cat-popin` containing `div.cat-popin-inner` with `div.cat-sprite` and `div.cat-quip` (`src/ui/board.ts:1469-1479`), appended to `.cc-root` (`src/ui/board.ts:1480`)
**Verbatim copy:** the quip is one of the 13 `CAT_QUIP_POOLS.phoebe.fed` strings (`src/engine/features.ts:35-47`), listed in full in Appendix B. Selection is `pool[Math.floor(variationRoll * pool.length)]` with a fallback to `pool[0]` (`src/engine/features.ts:94-97`), where `variationRoll` is `catRoll / 0.6` (`src/engine/features.ts:162`). The sprite carries `role="img"` with `aria-label` `Phoebe` (`src/ui/symbols.ts:114`).
**Assets:** `public/assets/joey-phoebe-wilds.png` with `public/assets/optimized/joey-phoebe-wilds.webp`, positioned at `100% 50%` for Phoebe (`src/ui/symbols.ts:112-114`).
**CSS:** `.cat-popin` (`src/style.css:1968-1976`), `.cat-popin-inner` (`src/style.css:1978-1985`), `.cat-popin .cat-sprite` 132px by 99px (`src/style.css:1987-1991`), `.cat-quip` (`src/style.css:1999-2009`), `.cat-pop-asset` and pose modifiers (`src/style.css:1838-1850`). Keyframes: `cat-hop-in` (`src/style.css:1993`, 620ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards), `quip-fade-in` (`src/style.css:2011`, 260ms ease-out with 300ms delay), `cat-eat-bob` (`src/style.css:1851`, .36s ease-in-out infinite alternate on the `eat` pose).
**States and variants:** pose sequence is `["strut", "eat"]` at 750ms per pose, with the overlay removed at `750 * 2 + 500 = 2000ms` (`src/ui/board.ts:1483-1503`). Pose classes: `cat-pop-asset--strut` (no extra rule) and `cat-pop-asset--eat` (bob animation, `src/style.css:1848`). After the pop-in resolves, a fed visit plays the bonus fanfare (`src/ui/board.ts:903`) and one treat is consumed, rarest first (`src/engine/features.ts:188-191`).
**Forcing route:** none found. `showCatPopIn` is not exported (`src/ui/board.ts:1467`) and there is no hash route; `CAT_QUIP_POOLS` and `rollCatVisit` are exported from the engine (`src/engine/features.ts:32`, `src/engine/features.ts:150`) but neither renders the overlay.

---

### cat-popin-phoebe-unfed
**Display name:** (no visible title; the sprite has `aria-label` `Phoebe`)
**Source:** `src/ui/board.ts:1467`, `showCatPopIn`
**Reachable in production:** yes.
**How it is reached:** as `cat-popin-phoebe-fed`, but with an empty Treat Jar: `jar.chicken`, `jar.salmon`, and `jar.bougie` are all 0, so the engine returns `fed: false` with assist `shuffle_consolation` (`src/engine/features.ts:164-172`).
**Parent scene:** `board-root`
**DOM root:** `div.cat-popin` (`src/ui/board.ts:1470`)
**Verbatim copy:** one of the 10 `CAT_QUIP_POOLS.phoebe.unfed` strings (`src/engine/features.ts:50-59`), Appendix B.
**Assets:** same sprite sheet as the fed variant (`src/ui/symbols.ts:112-114`).
**CSS:** as `cat-popin-phoebe-fed`, plus `.cat-pop-asset--unimpressed` which rotates -3deg, translates -4px, and desaturates to .76 (`src/style.css:1850`).
**States and variants:** pose sequence is `["strut", "unimpressed"]` (`src/ui/board.ts:1483`), same 750ms cadence and 2000ms lifetime. No bonus fanfare and no treat consumption (`src/ui/board.ts:903`, `src/engine/features.ts:183`).
**Forcing route:** none found.

---

### cat-popin-joey-fed
**Display name:** (no visible title; the sprite has `aria-label` `Joey`)
**Source:** `src/ui/board.ts:1467`, `showCatPopIn`
**Reachable in production:** yes.
**How it is reached:** the visit roll succeeds and `catRoll >= 0.6` selects Joey (`src/engine/features.ts:159`), and `jar.bougie > 0` so the assist is `drop_in` (`src/engine/features.ts:176-177`). Canon note in source: Joey only assists when Bougie Bites are stocked (`src/engine/features.ts:175`).
**Parent scene:** `board-root`
**DOM root:** `div.cat-popin` (`src/ui/board.ts:1470`)
**Verbatim copy:** one of the 14 `CAT_QUIP_POOLS.joey.fed` strings (`src/engine/features.ts:64-77`), Appendix B. `variationRoll` is `(catRoll - 0.6) / 0.4` (`src/engine/features.ts:162`).
**Assets:** `public/assets/joey-phoebe-wilds.png` / `.webp` at background-position `0% 50%` (`src/ui/symbols.ts:112-114`).
**CSS:** as the Phoebe variants, plus `.cat-pop-asset--assist`, which adds a mint drop-shadow glow (`src/style.css:1849`).
**States and variants:** this is the only three-pose sequence: `["strut", "assist", "eat"]` (`src/ui/board.ts:1482-1483`), so the overlay lives `750 * 3 + 500 = 2750ms` (`src/ui/board.ts:1499-1503`). One Bougie Bite is consumed (`src/engine/features.ts:185-187`) and the bonus fanfare plays afterward (`src/ui/board.ts:903`).
**Forcing route:** none found.

---

### cat-popin-joey-unfed
**Display name:** (no visible title; the sprite has `aria-label` `Joey`)
**Source:** `src/ui/board.ts:1467`, `showCatPopIn`
**Reachable in production:** yes.
**How it is reached:** Joey is selected and `jar.bougie === 0`, giving `fed: false` with assist `shuffle_consolation` (`src/engine/features.ts:176-178`). Chicken or salmon in the jar does not feed Joey.
**Parent scene:** `board-root`
**DOM root:** `div.cat-popin` (`src/ui/board.ts:1470`)
**Verbatim copy:** one of the 10 `CAT_QUIP_POOLS.joey.unfed` strings (`src/engine/features.ts:80-89`), Appendix B.
**Assets:** same sprite sheet (`src/ui/symbols.ts:112-114`).
**CSS:** as above with `.cat-pop-asset--unimpressed` (`src/style.css:1850`).
**States and variants:** pose sequence `["strut", "unimpressed"]`, 2000ms lifetime (`src/ui/board.ts:1483`, `src/ui/board.ts:1499-1503`). No fanfare, no treat consumed.
**Forcing route:** none found.

---

### win-status-only
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:1433-1439`, `showWinCelebration`
**Reachable in production:** yes.
**How it is reached:** a spin's `result.totalWin > 0` (`src/ui/board.ts:893`) and `amount / Math.max(1, bet) < 5`, so `tier` is `null` and only the status line is written (`src/ui/board.ts:1434-1439`).
**Parent scene:** `board-marquee-status`
**DOM root:** `div#marquee-status.marquee-status` (`src/ui/board.ts:260`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Status message | `src/ui/board.ts:1437` | `+{amount} coins`, amount formatted with `toLocaleString()` |

**Assets:** CSS only.
**CSS:** `.marquee-status` (`src/style.css:1391-1408`).
**States and variants:** single state; the message clears after 4000ms (`src/ui/board.ts:433-435`).
**Forcing route:** none found; `showWinCelebration` is not exported.

---

### win-celebration-nice
**Display name:** `NICE WIN!`
**Source:** `src/ui/board.ts:1433`, `showWinCelebration`
**Reachable in production:** yes.
**How it is reached:** `ratio = amount / Math.max(1, bet)` is at least 5 and below 15 (`src/ui/board.ts:1434-1435`), reached from `src/ui/board.ts:893-894` when no UniGlee, Doorbell, or Bold Chai trigger fired.
**Parent scene:** `board-root`
**DOM root:** `div.win-tier.win-tier-nice` appended to `.cc-root` (`src/ui/board.ts:1443`, `src/ui/board.ts:1449`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Label | `src/ui/board.ts:1440`, `src/ui/board.ts:1446` | `NICE WIN!` |
| Amount | `src/ui/board.ts:1447` | `+{amount} coins`, amount formatted with `toLocaleString()` |

**Assets:** CSS only; 10 `span.burst-dot` elements from `burstDots(10)` (`src/ui/board.ts:1445`, `src/ui/board.ts:1459-1464`), each with `--angle` of `(i / count) * 360deg` and `--delay` of `(i % 6) * 0.03s`.
**CSS:** `.win-tier` (`src/style.css:1895-1906`), `.win-tier-label` (`src/style.css:1909-1920`), `.win-tier-nice .win-tier-label` at 24px (`src/style.css:1921`), `.win-tier-amount` (`src/style.css:1931-1940`), `.win-tier-burst` and `.burst-dot` (`src/style.css:1942-1958`). Keyframes: `win-tier-fade` (`src/style.css:1907`, 260ms ease-out), `win-pop` (`src/style.css:1925`, 480ms cubic-bezier(0.34, 1.56, 0.64, 1)), `burst-out` (`src/style.css:1959`, 900ms ease-out both).
**States and variants:** overlay lifetime 1400ms (`src/ui/board.ts:1451-1455`); `pointer-events: none` throughout (`src/style.css:1903`). The bonus fanfare plays on creation (`src/ui/board.ts:1450`).
**Forcing route:** none found; `showWinCelebration` is not exported.

---

### win-celebration-big
**Display name:** `BIG WIN!`
**Source:** `src/ui/board.ts:1433`, `showWinCelebration`
**Reachable in production:** yes.
**How it is reached:** win-to-bet ratio at least 15 and below 40 (`src/ui/board.ts:1435`).
**Parent scene:** `board-root`
**DOM root:** `div.win-tier.win-tier-big` (`src/ui/board.ts:1443`)
**Verbatim copy:** label `BIG WIN!` (`src/ui/board.ts:1440`); amount line as in the nice tier (`src/ui/board.ts:1447`).
**Assets:** CSS only; 16 burst dots (`src/ui/board.ts:1445`).
**CSS:** as the nice tier plus `.win-tier-big .win-tier-label` at 30px and color `#ffb0cf` (`src/style.css:1922`).
**States and variants:** overlay lifetime 1900ms (`src/ui/board.ts:1451`).
**Forcing route:** none found.

---

### win-celebration-huge
**Display name:** `HUGE WIN!`
**Source:** `src/ui/board.ts:1433`, `showWinCelebration`
**Reachable in production:** yes.
**How it is reached:** win-to-bet ratio at least 40 (`src/ui/board.ts:1435`).
**Parent scene:** `board-root`
**DOM root:** `div.win-tier.win-tier-huge` (`src/ui/board.ts:1443`)
**Verbatim copy:** label `HUGE WIN!` (`src/ui/board.ts:1440`); amount line as above (`src/ui/board.ts:1447`).
**Assets:** CSS only; 24 burst dots, capped at 30 by `burstDots` (`src/ui/board.ts:1445`, `src/ui/board.ts:1460`).
**CSS:** as above plus `.win-tier-huge .win-tier-label` at 36px and color `#ffe27a` (`src/style.css:1923`).
**States and variants:** overlay lifetime 2400ms (`src/ui/board.ts:1451`).
**Forcing route:** none found.

---

### levelup-celebration
**Display name:** `LEVEL {n}!`
**Source:** `src/ui/board.ts:2489`, `showLevelUpCelebration`
**Reachable in production:** yes.
**How it is reached:** two paths. Base spins: `levelForXp` increases across a spin's Spark grant, and one celebration fires per crossed level with a coin reward of `200 * lvl` (`src/ui/board.ts:852-854`, `src/ui/board.ts:867-879`). Bonus sessions: `maybeLevelUpAfterBonus` grants `sparksForSpin(bet) * totalSpins` and loops the same way (`src/ui/board.ts:2455-2483`, `src/engine/economy.ts:64-72`). Level thresholds are `(level - 1) * 500` cumulative Sparks (`src/engine/economy.ts:34-36`); Sparks per spin are `Math.max(1, Math.round(bet / 25))` (`src/engine/economy.ts:24`).
**Parent scene:** appended to the `root` element passed in, not to `.cc-root` (`src/ui/board.ts:2534`), and positioned `fixed` at `z-index: 9200` (`src/style.css:3056-3059`)
**DOM root:** `div.levelup-overlay` with `aria-live="assertive"` (`src/ui/board.ts:2498-2500`)
**Verbatim copy:**

| Element | Source | Text |
|---|---|---|
| Overlay `aria-label` | `src/ui/board.ts:2500` | `Level {n} reached!` |
| Level line | `src/ui/board.ts:2527` | `LEVEL {n}!` |
| Quip option 1 | `src/ui/board.ts:2506` | `{catName} is impressed — Sparks are flying!` (em dash U+2014) |
| Quip option 2 | `src/ui/board.ts:2507` | `{catName} demands extra treats for this!` |
| Quip option 3 | `src/ui/board.ts:2508` | `{catName} zoomed in just to celebrate!` |
| Quip option 4 | `src/ui/board.ts:2509` | `Even {catName} couldn't resist cheering!` |
| Coin line | `src/ui/board.ts:2529` | `+{coinReward} coins`, formatted with `toLocaleString()` |
| Hint | `src/ui/board.ts:2530` | `Tap to continue` |

`catName` is `Joey` or `Phoebe` (`src/ui/board.ts:2504`); the cat is chosen by `Math.random() < 0.5` at the call site (`src/ui/board.ts:872`, `src/ui/board.ts:2473`). The quip is chosen uniformly from the four (`src/ui/board.ts:2511`).
**Assets:** inline saucer SVG, variant 1 for Joey and variant 4 for Phoebe (`src/ui/board.ts:2523`, `src/ui/symbols.ts:151-176`).
**CSS:** `.levelup-overlay` (`src/style.css:3056-3066`), `.levelup-overlay--out` (`src/style.css:3068-3070`), `.levelup-saucer` with its from-left and from-right modifiers (`src/style.css:3082-3099`), `.levelup-burst` (`src/style.css:3120-3128`), `.levelup-spark` (`src/style.css:3130-3138`), `.levelup-msg` (`src/style.css:3147-3168`), `.levelup-msg-level` (`src/style.css:3175-3185`), `.levelup-msg-quip` (`src/style.css:3187-3191`), `.levelup-msg-coins` (`src/style.css:3193-3200`), `.levelup-msg-hint` (`src/style.css:3202-3208`). Keyframes: `levelup-overlay-in` (`src/style.css:3072`, 220ms ease-out both), `levelup-overlay-out` (`src/style.css:3076`, 380ms ease-in forwards), `levelup-saucer-enter` (`src/style.css:3101`, 480ms cubic-bezier(.15,.9,.3,1) both), `levelup-saucer-crash` (`src/style.css:3113`, 260ms ease-in with 480ms delay), `levelup-spark` (`src/style.css:3140`, 700ms cubic-bezier(.2,.8,.4,1) both), `levelup-msg-reveal` (`src/style.css:3170`, 400ms cubic-bezier(.34,1.56,.64,1) with 640ms delay).
**States and variants:**

| State | Trigger | Source |
|---|---|---|
| Saucer from left | `Math.random() < 0.5` | `src/ui/board.ts:2502`, `src/ui/board.ts:2522` |
| Saucer from right | otherwise | `src/ui/board.ts:2522`, `src/style.css:3097-3099` |
| Joey saucer art | cat is Joey; `saucerSvg(1)` | `src/ui/board.ts:2523` |
| Phoebe saucer art | cat is Phoebe; `saucerSvg(4)` | `src/ui/board.ts:2523` |
| Spark burst | 14 sparks, angle `round((i/14)*360)deg`, distance 90 to 160px, size 6 to 14px, colors `#f5d576` (60% chance), else `#6bd6c9` or `#ff9ecb`, delays `0.45 + i*0.012s` | `src/ui/board.ts:2503`, `src/ui/board.ts:2513-2519` |
| Dismissing | `.levelup-overlay--out` added on click or after 3600ms; removed on `animationend` | `src/ui/board.ts:2542-2553` |
| SPARKLE re-enabled | the button is re-enabled so a press routes to `overlay.click()` | `src/ui/board.ts:2536-2539`, `src/ui/board.ts:546-549` |
| Reduced motion | all four animation durations forced to 1ms and delays to 0ms | `src/style.css:3210-3218` |

Fanfare is scheduled 480ms after the overlay is created, at the saucer impact (`src/ui/board.ts:2496`, comment at `src/ui/board.ts:2487`).
**Forcing route:** `maybeLevelUpAfterBonus` is exported (`src/ui/board.ts:2455`) and defaults its `celebrateFn` to `showLevelUpCelebration` (`src/ui/board.ts:2465`), so calling it with a state whose XP is just below a threshold and a large `totalSpins` renders this overlay. `showLevelUpCelebration` itself is not exported.

---

### cascade-resting-board
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:232-237` and `src/ui/board.ts:273-275` inside `renderBoard`
**Reachable in production:** yes; this is the board's idle state.
**How it is reached:** on first render the grid is produced by `spin({ rng: mulberry32(20260717), betPerLine: 1, treatJar: state.treatJar, spinsSincePopIn: 0 }).steps[0].grid` (`src/ui/board.ts:232-237`), so the opening layout is deterministic apart from the treat jar contents. After a non-bonus spin, `renderBoard` is re-invoked with the final step's grid (`src/ui/board.ts:938`).
**Parent scene:** `board-reel-window`
**DOM root:** `div#reel-grid.reel-grid` (`src/ui/board.ts:273`)
**Verbatim copy:** grid `aria-label` `Reel board` (`src/ui/board.ts:273`); per-cell labels only for wild chai and multiplier badges (`src/ui/board.ts:398`, `src/ui/board.ts:408`).
**Assets:** symbol art per `src/ui/asset-manifest.ts:40-68`.
**CSS:** `.reel-grid`, `.reel-col`, `.cell` (`src/style.css:1023-1183`). No animation classes are applied in this state: `symbol-pop`, `beam-drop`, `win-flash`, and `beam-up` are all added only inside `animateSteps` (`src/ui/board.ts:1355-1381`).
**States and variants:** payline guide on or off is the only variable presentation layer at rest (`src/ui/board.ts:274`).
**Forcing route:** `#board`, or `renderBoard(el, state, grid)` with an explicit grid (`src/ui/board.ts:226`), or `renderGridHtml(grid)` (`src/ui/board.ts:384`).

---

### cascade-initial-pop
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:1355-1358` inside `animateSteps` (`src/ui/board.ts:1338`)
**Reachable in production:** yes, on every spin.
**How it is reached:** for step index `i === 0`, every `.cell` gets the class `symbol-pop` and the drop delay is not set (`src/ui/board.ts:1356-1358`).
**Parent scene:** `board-reel-window`
**DOM root:** `div#reel-grid.reel-grid` with `.cell.symbol-pop` children
**Verbatim copy:** none beyond the resting labels.
**Assets:** symbol art as above.
**CSS:** `.symbol-pop` (`src/style.css:1855-1857`), keyframe `symbol-pop` (`src/style.css:1859`, 220ms ease-out, scale 0.4 to 1.12 to 1).
**States and variants:** one state. The step advances after 480ms (`src/ui/board.ts:1388`). If any cell in the step holds a `doorbell` symbol and the ring has not yet played, the doorbell cue fires once per spin (`src/ui/board.ts:1351-1354`).
**Forcing route:** none found; `animateSteps` is not exported. Adding the `symbol-pop` class to cells rendered by `renderGridHtml` reproduces it.

---

### cascade-staggered-drop
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:1360-1361`
**Reachable in production:** yes, on any spin that cascades at least once.
**How it is reached:** for step index `i > 0`, each cell receives `--drop-delay` of `(index % ROWS) * 22 + Math.floor(index / ROWS) * 14` milliseconds and the class `beam-drop` (`src/ui/board.ts:1360-1361`).
**Parent scene:** `board-reel-window`
**DOM root:** `div#reel-grid.reel-grid` with `.cell.beam-drop` children
**Verbatim copy:** none.
**Assets:** symbol art as above.
**CSS:** `.beam-drop` (`src/style.css:2476-2479`), keyframe `beam-drop` (`src/style.css:2481`, 360ms cubic-bezier(.2, .78, .3, 1.08) both, translateY -140% to 6% to 0), delay driven by the `--drop-delay` custom property with a `0ms` fallback.
**States and variants:** one state per cascade step; steps are 480ms apart (`src/ui/board.ts:1388`). Cascades also update the firefly meter to `step.meterAfter` on every step (`src/ui/board.ts:1363`).
**Forcing route:** none found; the same class and custom property can be applied manually to `renderGridHtml` output.

---

### cascade-win-highlight
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:1365-1382`; path rendering in `renderGridHtml` (`src/ui/board.ts:420-425`)
**Reachable in production:** yes, on any winning step.
**How it is reached:** `step.wins.length > 0`. The step's grid is re-rendered with `winningLineIndices = step.wins.map((win) => win.lineIndex)` (`src/ui/board.ts:1350`), which adds `is-winning` to those payline paths (`src/ui/board.ts:423`); each winning position's cell gets `win-flash` and a three-particle burst (`src/ui/board.ts:1369-1378`).
**Parent scene:** `board-reel-window`
**DOM root:** `div#reel-grid.reel-grid`; particles land in `div#particle-layer.particle-layer` appended to `.cc-root` (`src/ui/board.ts:1424-1430`)
**Verbatim copy:** none.
**Assets:** CSS only for the highlight and particles.
**CSS:** `.cell.win-flash` (`src/style.css:1185-1189`, gold gradient plus scale 1.08), `.payline-path.is-winning` (`src/style.css:1152-1158`), `.particle-layer` and `.particle` (`src/style.css:1869-1885`). Keyframes: `payline-win-flash` (`src/style.css:1159`, 700ms ease-out both), `particle-fly` (`src/style.css:1886`, 620ms ease-out forwards, driven by `--dx` and `--dy`).
**States and variants:** with reduced motion, `.payline-path.is-winning` drops the flash animation and stays at `opacity: 1` (`src/style.css:1160`). Particle count is 3 per winning cell (`src/ui/board.ts:1375`), each particle removed after 650ms (`src/ui/board.ts:1420`), angle `(n / count) * 360 + Math.random() * 40` degrees and distance `18 + Math.random() * 14` px (`src/ui/board.ts:1413-1416`). A cascade arpeggio plays keyed to `step.meterAfter` and a win pluck follows (`src/ui/board.ts:1367`, `src/ui/board.ts:1382`); a step with no wins plays the cascade tick instead (`src/ui/board.ts:1384`).
**Forcing route:** `renderGridHtml(grid, undefined, showGuide, [lineIndex, ...])` renders the winning payline paths directly (`src/ui/board.ts:384-388`). The `win-flash` cell class and particle layer are not exported.

---

### cascade-beam-up
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:1379-1381` (cells), `src/ui/board.ts:1396-1403` (`beamToSaucers`)
**Reachable in production:** yes, on any winning step.
**How it is reached:** 220ms after the winning step is painted, every winning cell gets the class `beam-up` (`src/ui/board.ts:1379-1381`). At the same moment the step is painted, `beamToSaucers` adds `.beaming` to every `.saucer-beam` in the night-garden layer and removes it after 700ms (`src/ui/board.ts:1368`, `src/ui/board.ts:1396-1402`).
**Parent scene:** `board-reel-window` and `board-night-garden`
**DOM root:** `.cell.beam-up` inside `#reel-grid`; `.saucer-beam.beaming` inside `#bg-layer`
**Verbatim copy:** none.
**Assets:** CSS only.
**CSS:** `.beam-up` (`src/style.css:2487-2490`), keyframe `beam-up` (`src/style.css:2492`, 260ms cubic-bezier(.55, .02, .9, .45) forwards, ending at translateY(-115%) scale(.48) opacity 0). Saucer beam transition `height 220ms ease-out, opacity 220ms ease-out` with `.beaming` at 340px height and 0.6 opacity (`src/style.css:517-533`).
**States and variants:** one state. Overlaps the next step, which paints 480ms after the current step began (`src/ui/board.ts:1388`).
**Forcing route:** none found; neither `animateSteps` nor `beamToSaucers` is exported.

---

### cascade-payline-guide-on
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:424` (`is-guide` class), toggled at `src/ui/board.ts:723-732`
**Reachable in production:** yes.
**How it is reached:** `state.paylineGuideOn` is `true` when the board renders (`src/ui/board.ts:274`), or the Settings toggle adds `is-guide` to every existing `.payline-path` (`src/ui/board.ts:726-728`).
**Parent scene:** `board-reel-window`
**DOM root:** `svg.payline-overlay` with 40 `path.payline-path.is-guide` children (`src/ui/board.ts:421-426`)
**Verbatim copy:** none; the overlay is `aria-hidden="true"` (`src/ui/board.ts:426`).
**Assets:** CSS only; path geometry is computed from `PAYLINES` as `M{10 + reel*20},{12.5 + row*25} L...` in a `0 0 100 100` viewBox with `preserveAspectRatio="none"` (`src/ui/board.ts:422-426`, lines defined at `src/engine/paylines.ts:9-50`).
**CSS:** `.payline-overlay` (`src/style.css:1134-1141`), `.payline-path` (`src/style.css:1142-1150`), `.payline-path.is-guide` at `stroke: rgba(245, 213, 118, .28); opacity: 1` (`src/style.css:1151`).
**States and variants:** all 40 lines are drawn faintly at once. Mid-cascade repaints from `animateSteps` pass `showGuide = false` (`src/ui/board.ts:1350`), so the guide is absent during the animated steps and returns on the next `renderBoard` (`src/ui/board.ts:938`).
**Forcing route:** set `ccv1.paylineGuideOn` to `true` (`src/state.ts:96`) before loading `#board`, or call `renderGridHtml(grid, undefined, true)` (`src/ui/board.ts:384`).

---

### cascade-payline-guide-off
**Display name:** (no visible title)
**Source:** `src/ui/board.ts:424`
**Reachable in production:** yes; this is the default (`src/state.ts:96`).
**How it is reached:** `state.paylineGuideOn` is `false`, so paths render without `is-guide`.
**Parent scene:** `board-reel-window`
**DOM root:** `svg.payline-overlay` with 40 `path.payline-path` children
**Verbatim copy:** none.
**Assets:** CSS only.
**CSS:** `.payline-path` base rule sets `stroke: transparent; opacity: 0` (`src/style.css:1142-1150`), so the paths occupy the DOM but are invisible until a win adds `is-winning`.
**States and variants:** invisible at rest; winning lines still flash because `is-winning` is applied independently of the guide flag (`src/ui/board.ts:423`, `src/style.css:1152-1158`), which matches the Settings help string at `src/ui/board.ts:605`.
**Forcing route:** default state on a fresh profile; `#board` after `resetAll()` (`src/state.ts:32`).

---

## Appendix A: Ice Notes complete content inventory

Source: `src/ui/ice-notes.ts`. 22 ingredients, each with one profile and three facts, expanded by `noteSet` into 66 `IceNote` entries (`src/ui/ice-notes.ts:23-24`). Every string below is verbatim; all of `src/ui/ice-notes.ts` is pure ASCII.

### A.1 Ingredient profiles

| # | Line | Ingredient | Flavor | Chai role | Source | Harvest (labelled `Gathering` in the UI) |
|---|---|---|---|---|---|---|
| 1 | 27 | Cardamom | Floral, citrusy warmth | Lifts the spice blend | Tropical South Asian farms | Pods picked, then dried |
| 2 | 32 | Black Tea | Malty, brisk, tannic | Builds the tea backbone | Camellia sinensis gardens | Leaves plucked and oxidized |
| 3 | 37 | Ginger | Peppery, bright heat | Adds a fresh spark | Tropical rhizome fields | Rhizomes lifted and washed |
| 4 | 42 | Star Anise | Sweet, licorice-like | Adds a high warm note | Evergreen orchards in East Asia | Fruit picked green, then dried |
| 5 | 47 | Oat Milk | Mild, cereal, creamy | Softens the spice body | Temperate oat fields | Grain cut, threshed, and milled |
| 6 | 52 | Raw Cane Sugar | Golden, lightly molassesy | Rounds sweetness | Tropical cane fields | Stalks cut, crushed, crystallized |
| 7 | 57 | Ice | Clean and cooling | Keeps the chai iced | Clean potable water | Water frozen into cubes |
| 8 | 62 | Water | Neutral | Carries tea and spice | Treated potable water | Collected, treated, then brewed |
| 9 | 67 | Black Pepper | Sharp, tingly heat | Balances sweetness | Tropical pepper vines | Green berries picked and dried |
| 10 | 72 | Cinnamon | Woody, sweet warmth | Sets the cozy base | Evergreen bark groves | Young shoots cut and peeled |
| 11 | 77 | Cloves | Sweet, intense spice | Deepens the blend | Tropical clove trees | Unopened buds picked and dried |
| 12 | 82 | Natural Flavors | Blend-specific aroma | Rounds the finish | Plant, spice, or dairy materials | Extracted and blended |
| 13 | 87 | Cane Sugar | Clean, caramel sweetness | Balances spice heat | Tropical cane fields | Stalks cut, crushed, and boiled |
| 14 | 92 | Honey | Floral, mellow sweetness | Adds a round note | Beehives near flowering plants | Bees gather nectar; comb is collected |
| 15 | 97 | Ginger Juice | Fresh, peppery lift | Boosts ginger presence | Tropical rhizome fields | Rhizomes washed and pressed |
| 16 | 102 | Vanilla Extract | Creamy, floral, soft | Smooths sharp spice | Tropical orchid vines | Pods cured after harvest |
| 17 | 107 | Citric Acid | Bright, clean tartness | Sharpens sweet notes | Citrus fruit or sugar fermentation | Fruit pressed or acid purified |
| 18 | 112 | Spice Extracts | Concentrated aroma | Distributes spice evenly | Harvested spices and botanicals | Spices extracted into liquid |
| 19 | 117 | Nonfat Ultra-Filtered Milk | Clean dairy, gentle creaminess | Adds body without heaviness | Dairy farms | Milk collected, separated, filtered |
| 20 | 122 | Lactase Enzyme | No direct flavor; sweeter finish | Makes the milk lactose-free | Cultured enzyme production | Fermented, then purified |
| 21 | 127 | Vitamin A Palmitate | Neutral | Restores milk fortification | Food-grade vitamin supply | Manufactured and measured |
| 22 | 132 | Vitamin D3 | Neutral | Completes milk fortification | Food-grade vitamin supply | Manufactured and measured |

### A.2 All 66 fact strings

| # | Line | Ingredient | Fact |
|---|---|---|---|
| 1 | 28 | Cardamom | Green cardamom keeps its tiny seeds inside a papery pod, which helps protect its fragrant oils. |
| 2 | 29 | Cardamom | Cardamom pods are picked and dried; gentle drying helps preserve their color and aroma. |
| 3 | 30 | Cardamom | The warm, almost citrusy character comes from aromatic oils in both the seeds and the pod. |
| 4 | 33 | Black Tea | Black, green, and oolong teas all begin as leaves from the Camellia sinensis plant. |
| 5 | 34 | Black Tea | For black tea, the leaves are allowed to oxidize fully, which deepens their color and malty character. |
| 6 | 35 | Black Tea | Rolling or crushing tea leaves exposes their contents to oxygen and starts the oxidation process. |
| 7 | 38 | Ginger | Ginger is a rhizome: a horizontal underground stem, not a root. |
| 8 | 39 | Ginger | A ginger plant stores energy in its branching rhizome, growing joint by joint below the soil. |
| 9 | 40 | Ginger | The lively bite of fresh ginger comes largely from compounds called gingerols. |
| 10 | 43 | Star Anise | Star anise is a dried fruit, not a seed; each point of the star is a small fruit segment. |
| 11 | 44 | Star Anise | The star-shaped fruit is picked before it is fully ripe, then dried until firm and fragrant. |
| 12 | 45 | Star Anise | Its sweet licorice-like aroma comes from anethole, an aromatic oil also found in anise. |
| 13 | 48 | Oat Milk | Oat milk starts with oats blended with water and strained into a smooth, pale liquid. |
| 14 | 49 | Oat Milk | Oats naturally contain soluble fiber called beta-glucan, which contributes to a silky texture. |
| 15 | 50 | Oat Milk | Some oat-milk methods use enzymes to break down part of the oat starch into smaller sugars. |
| 16 | 53 | Raw Cane Sugar | Cane sugar begins as juice pressed from tall sugarcane stalks. |
| 17 | 54 | Raw Cane Sugar | The juice is clarified and concentrated until sucrose forms crystals. |
| 18 | 55 | Raw Cane Sugar | A trace of molasses left with the crystals gives less-refined cane sugar its warm golden color. |
| 19 | 58 | Ice | When water freezes, its molecules arrange into an open crystal structure. |
| 20 | 59 | Ice | That open structure makes ice less dense than liquid water, which is why ice floats. |
| 21 | 60 | Ice | A generously iced drink stays cold because melting ice absorbs heat from the liquid around it. |
| 22 | 63 | Water | Water is the quiet carrier that dissolves and carries tea and spice flavors into the cup. |
| 23 | 64 | Water | Steep time and temperature both change how quickly tea and spices give up their soluble flavor compounds. |
| 24 | 65 | Water | Pouring a finished concentrate over ice cools it quickly while keeping the drink firmly iced. |
| 25 | 68 | Black Pepper | A black peppercorn is the dried berry of a climbing pepper vine. |
| 26 | 69 | Black Pepper | Pepper berries are harvested green, then dried until their skins darken and wrinkle. |
| 27 | 70 | Black Pepper | Piperine is the compound responsible for black pepper's recognizable, tingly heat. |
| 28 | 73 | Cinnamon | Cinnamon is made from the inner bark of selected evergreen tree shoots. |
| 29 | 74 | Cinnamon | As thin strips of bark dry, they curl naturally into the familiar quill shape. |
| 30 | 75 | Cinnamon | Cinnamaldehyde is the aromatic compound most closely associated with cinnamon's warm scent. |
| 31 | 78 | Cloves | Cloves are unopened flower buds harvested before they bloom. |
| 32 | 79 | Cloves | The buds are dried until they become the small, dark, nail-shaped spice used in chai blends. |
| 33 | 80 | Cloves | Eugenol is a major aromatic compound in clove oil and gives cloves their sweet-spicy intensity. |
| 34 | 83 | Natural Flavors | Natural flavors are an ingredient-label category, not one single crop or spice. |
| 35 | 84 | Natural Flavors | The category can include flavoring materials derived from plants, spices, fruits, herbs, or dairy ingredients. |
| 36 | 85 | Natural Flavors | A small amount of a flavor extract can round out a blend without changing its visible texture. |
| 37 | 88 | Cane Sugar | Sugarcane stores sucrose in its fibrous stalk rather than in a fruit. |
| 38 | 89 | Cane Sugar | Mills crush the stalks to release cane juice before the juice is filtered and concentrated. |
| 39 | 90 | Cane Sugar | As concentrated cane juice cools, sucrose molecules organize into crystals. |
| 40 | 93 | Honey | Honey begins as floral nectar gathered by bees. |
| 41 | 94 | Honey | Bees reduce nectar's water content in the hive, concentrating the sugars into honey. |
| 42 | 95 | Honey | The flower sources available to bees influence honey's color, aroma, and flavor. |
| 43 | 98 | Ginger Juice | Ginger juice is made by crushing or pressing fresh ginger rhizome to release its flavorful liquid. |
| 44 | 99 | Ginger Juice | The juice carries ginger's bright, peppery character into a blend without adding pieces of root. |
| 45 | 100 | Ginger Juice | Fresh ginger's pungency comes from the same gingerol-rich rhizome used for dried ginger spice. |
| 46 | 103 | Vanilla Extract | Vanilla comes from the long seed pods of a tropical orchid. |
| 47 | 104 | Vanilla Extract | The pods are cured after harvest; that slow process develops vanilla's familiar deep aroma. |
| 48 | 105 | Vanilla Extract | Vanillin is the best-known aroma compound in vanilla, though a real extract contains many more notes. |
| 49 | 108 | Citric Acid | Citric acid occurs naturally in citrus fruits such as lemons and limes. |
| 50 | 109 | Citric Acid | In a drink, a small amount of citric acid adds a clean tart note that can sharpen sweeter flavors. |
| 51 | 110 | Citric Acid | Commercial food-grade citric acid is commonly produced by fermenting sugars, then purifying the result. |
| 52 | 113 | Spice Extracts | A spice extract concentrates aroma compounds from a spice into a liquid or oil-based ingredient. |
| 53 | 114 | Spice Extracts | Extracts can be made with methods that use water, alcohol, oil, carbon dioxide, or combinations of them. |
| 54 | 115 | Spice Extracts | Because extracts are concentrated, very small amounts can distribute a spice note evenly through a drink. |
| 55 | 118 | Nonfat Ultra-Filtered Milk | Nonfat milk has most of its cream removed while retaining water, protein, minerals, and natural milk sugars. |
| 56 | 119 | Nonfat Ultra-Filtered Milk | Ultra-filtration uses fine membranes to separate some milk components by size. |
| 57 | 120 | Nonfat Ultra-Filtered Milk | Filtering and blending can change the balance of milk proteins and sugars without turning it into a plant-based drink. |
| 58 | 123 | Lactase Enzyme | Lactase is an enzyme that splits lactose, the natural sugar in milk, into glucose and galactose. |
| 59 | 124 | Lactase Enzyme | Adding lactase before packaging is how lactose-free milk is made from dairy milk. |
| 60 | 125 | Lactase Enzyme | Because glucose and galactose taste sweeter than lactose, lactose-free milk can seem sweeter without extra sugar. |
| 61 | 128 | Vitamin A Palmitate | Vitamin A palmitate is a stable form of vitamin A used in food fortification. |
| 62 | 129 | Vitamin A Palmitate | It pairs vitamin A with palmitic acid, a fatty acid, to make a form that stores well. |
| 63 | 130 | Vitamin A Palmitate | Vitamin A is fat-soluble, so it is commonly restored to low-fat and nonfat dairy products. |
| 64 | 133 | Vitamin D3 | Vitamin D3 is also called cholecalciferol. |
| 65 | 134 | Vitamin D3 | In fortified milk, vitamin D is added in a measured amount rather than occurring as a chai spice. |
| 66 | 135 | Vitamin D3 | Vitamin D helps the body absorb calcium from foods and drinks. |

---

## Appendix B: `CAT_QUIP_POOLS` complete

Source: `src/engine/features.ts:32-92`. All four pools, every line verbatim. The only non-ASCII characters are the em dashes (U+2014) on lines 35, 36, and 68; all apostrophes are straight ASCII `'`.

### B.1 `phoebe.fed` (13 lines, `src/engine/features.ts:34-48`)

| # | Line | Quip |
|---|---|---|
| 1 | 35 | Freak'n facts on facts — Phoebe approves. |
| 2 | 36 | OMG stop — this is so Glee-coded. |
| 3 | 37 | Literally the cutest. Phoebe knew it. |
| 4 | 38 | Phoebe, oh, you're so skinny and so slender. |
| 5 | 39 | I love you more... I love you most, Phoebe. |
| 6 | 40 | Do you love this? Wait. No. REALLY love it? |
| 7 | 41 | Phoebe found the sparkle. Nobody panic. |
| 8 | 42 | Phoebe approves the weirdness. |
| 9 | 43 | OMG, that's adorable. Phoebe is obsessed. |
| 10 | 44 | This is giving night-garden magic. |
| 11 | 45 | Phoebe has entered her magical snack era. |
| 12 | 46 | I love you more... I love you most, darling. |
| 13 | 47 | Phoebe has feelings about this, and they are excellent. |

### B.2 `phoebe.unfed` (10 lines, `src/engine/features.ts:49-60`)

| # | Line | Quip |
|---|---|---|
| 1 | 50 | Phoebe has reviewed your offering. Phoebe is unmoved. |
| 2 | 51 | Phoebe is positively bedeviled by this empty jar. |
| 3 | 52 | Phoebe wants a snack. This is a serious situation. |
| 4 | 53 | Let me think about it... okay, back. Phoebe needs treats. |
| 5 | 54 | Phoebe is not mad. Phoebe is just snack-deprived. |
| 6 | 55 | No treat? Phoebe will consult the stars. |
| 7 | 56 | Phoebe has feelings about this empty jar. |
| 8 | 57 | This is a snack emergency, darling. |
| 9 | 58 | Phoebe is waiting for a little more sparkle. |
| 10 | 59 | The jar is giving mystery. Phoebe requires snacks. |

### B.3 `joey.fed` (14 lines, `src/engine/features.ts:63-78`)

| # | Line | Quip |
|---|---|---|
| 1 | 64 | Joey, show me what a big boy you are. |
| 2 | 65 | Oh, you're such a big tough boy. |
| 3 | 66 | Joey requires Bougie Bites. Joey approves of this jar. |
| 4 | 67 | Joey approves. Freak'n facts on facts. |
| 5 | 68 | OMG stop — Joey is so Glee-coded. |
| 6 | 69 | Literally the cutest big tough boy. |
| 7 | 70 | I love you more... I love you most, Joey. |
| 8 | 71 | Joey brought the boogie. Facts on facts. |
| 9 | 72 | The Bougie Bites have spoken. |
| 10 | 73 | Joey is a big boy with a big sparkle. |
| 11 | 74 | Big tough boy, maximum sparkle. |
| 12 | 75 | Joey is handsome, helpful, and very serious about snacks. |
| 13 | 76 | Joey is here to make an entrance and a meal. |
| 14 | 77 | Joey says this board has excellent taste. |

### B.4 `joey.unfed` (10 lines, `src/engine/features.ts:79-90`)

| # | Line | Quip |
|---|---|---|
| 1 | 80 | Joey requires Bougie Bites. Joey is a professional. |
| 2 | 81 | Joey requires Bougie Bites. Joey is positively bedeviled. |
| 3 | 82 | No Bougie Bites? Joey is waiting for the bougie treatment. |
| 4 | 83 | Joey has standards. Joey is a professional. |
| 5 | 84 | Joey sees no Bougie Bites. Joey sees a staffing issue. |
| 6 | 85 | No Bougie, no boost. Joey has standards. |
| 7 | 86 | Joey will return when the premium snacks arrive. |
| 8 | 87 | Joey is not leaving; Joey is negotiating. |
| 9 | 88 | Joey is a professional, but this is a snack emergency. |
| 10 | 89 | The big tough boy has filed a Bougie complaint. |

---

## Appendix C: Design token table

### C.1 Global custom properties (`:root`, `src/style.css:4-12`)

| Token | Value | Line | Referenced via `var()` in `src/style.css` |
|---|---|---|---|
| `--cc-navy` | `#1a1f3c` | 5 | no |
| `--cc-purple` | `#2d1f4c` | 6 | no |
| `--cc-orange` | `#d35b2d` | 7 | yes |
| `--cc-butter` | `#f5d576` | 8 | yes |
| `--cc-mint` | `#9fe8c5` | 9 | yes |
| `--cc-pink` | `#e8a5b8` | 10 | yes |
| `--cc-ink` | `#20163a` | 11 | no (an equivalent literal `INK = "#20163a"` exists at `src/ui/symbols.ts:15`) |

`--cc-navy` also appears as the literal `#1a1f3c` in the `theme-color` meta tag (`index.html:16`) and in the web manifest `background_color` and `theme_color` (`public/manifest.webmanifest`).

### C.2 Other declared custom properties

| Token | Value | Line | Used by |
|---|---|---|---|
| `--saucer-start-x` | `calc(-50vw - 80px)` | 3095 | `.levelup-saucer--from-left` |
| `--saucer-start-x` | `calc(50vw + 80px)` | 3098 | `.levelup-saucer--from-right` |

### C.3 Custom properties consumed but set from TypeScript inline styles

| Token | Set in | Consumed in |
|---|---|---|
| `--drop-delay` | `src/ui/board.ts:1360` | `.beam-drop` (`src/style.css:2478`) |
| `--dx`, `--dy` | `src/ui/board.ts:1415-1416` | `@keyframes particle-fly` (`src/style.css:1888`) |
| `--angle`, `--delay` | `src/ui/board.ts:1462` | `.burst-dot` and `@keyframes burst-out` (`src/style.css:1956-1961`) |
| `--angle`, `--dist` | `src/ui/board.ts:2518` | `@keyframes levelup-spark` (`src/style.css:3141-3143`) |

Tokens `--drop-left`, `--drop-size`, `--drop-duration`, `--wheel-final-deg`, `--sock-drop-distance`, `--target-x`, `--target-y`, and `--treat-delay` are referenced in `src/style.css` for bonus scenes outside this slice.

### C.4 Fonts

| Item | Value | Source |
|---|---|---|
| `@font-face` family | `"Baloo Display"` | `src/style.css:16-21` |
| `@font-face` src | `url("/fonts/baloo2-800.woff2") format("woff2")` | `src/style.css:18` |
| `@font-face` weight | `800` | `src/style.css:19` |
| `@font-face` display | `swap` | `src/style.css:20` |
| Body stack | `-apple-system, "Segoe UI", Roboto, sans-serif` | `src/style.css:25-27` |
| Splash stack | `system-ui, sans-serif` on `.chai-splash`; `font: 600 14px system-ui, sans-serif` on `.chai-splash__secondary` | `src/style.css:75`, `src/style.css:253` |
| Display stack | `"Baloo Display", "Arial Black", sans-serif` | for example `src/style.css:172`, `src/style.css:796`, `src/style.css:1910`, `src/style.css:3176` |
| Numerals | `font-variant-numeric: tabular-nums` on `.cc-root` | `src/style.css:30` |
| Physical font file | `public/fonts/baloo2-800.woff2` | referenced at `src/style.css:18` |

Licensing note recorded in source: "Baloo 2, SIL OFL 1.1" (`src/style.css:15`).

---

## Appendix D: Keyframes inventory

Only keyframes that drive surfaces in this slice are listed. Duration and easing are taken from the `animation` shorthand on the consuming rule.

| Keyframe | Line | Animates | Applied to | Duration and easing |
|---|---|---|---|---|
| `chai-pulse` | 56 | scale 1 to 1.08, opacity .42 to .68 | `.chai-splash__orb` (104) | 7s ease-in-out infinite |
| `chai-rise` | 60 | translateY 10px to 0, opacity 0 to 1 | `.chai-splash__inner` (143) | .7s ease both |
| `aurora-drift` | 465 | translateX 0 to 4%, scaleX 1 to 1.06 | `.aurora-ribbons span` (458) | 14s ease-in-out infinite, per-ribbon delays 0s / -5s / -9s |
| `star-twinkle` | 481 | opacity .25 to 1, scale .8 to 1.2 | `.star-slow` (478), `.star-fast` (479) | 5s and 2.6s ease-in-out infinite |
| `firefly-drift` | 496 | translate(0,0) to (8px,-10px), opacity .4 to 1 | `.firefly` (493) | 5s ease-in-out infinite |
| `light-blink` | 510 | opacity .3 to 1 | `.saucer-light-a` (508), `.saucer-light-b` (509) | 1.6s ease-in-out infinite, variant b delayed 0.8s |
| `saucer-bob` | 512 | translateY 0 to -10px, translateX 0 to 4px | `.saucer-unit` (505) | 6s ease-in-out infinite |
| `bulb-twinkle` | 784 | opacity .35 to 1 | `.bulb` (782) | 1.8s ease-in-out infinite |
| `title-shimmer-sweep` | 830 | translateX -150% to 250% with skewX(-10deg), opacity 0 to 1 to 0 | `.marquee-title--shimmer::after` (828) | 1.05s cubic-bezier(0.4, 0, 0.2, 1) forwards |
| `ornament-twinkle` | 1021 | opacity .55 to 1, scale .9 to 1.05, rotate 0 to 8deg | `.ornament` (1015) | 3.4s ease-in-out infinite, corner delays 0 / .6s / 1.2s / 1.8s |
| `payline-win-flash` | 1159 | opacity 0 to 1 to 0 | `.payline-path.is-winning` (1157) | 700ms ease-out both |
| `keepsake-constellation-shimmer` | 1223 | scale .985 to 1.015, brightness .96 to 1.12 | `.keepsake-constellation-symbol` (1214) | 1.4s ease-in-out infinite alternate |
| `multiplier-badge-pop` | 1625 | scale .45 rotate -12deg to scale 1 | `.multiplier-badge` (1622) | 420ms cubic-bezier(.34, 1.56, .64, 1) both |
| `page-arrive` | 1651 | opacity 0 to 1, translateY 8px to 0 | `.game-page` (1649) | 180ms ease-out both |
| `preview-pulse` | 1744 | box-shadow ring 0 to 5px | `.volume-preview-btn[aria-pressed="true"]` (1742) | 1.1s ease-in-out infinite |
| `sparkle-idle` | 1481 | box-shadow glow ring | `.sparkle-btn` (1475) | 2.4s ease-in-out infinite |
| `sparkle-spin-pulse` | 1485 | brightness 1 to 1.25 | `.sparkle-btn.is-spinning` (1479) | 0.5s ease-in-out infinite |
| `cat-eat-bob` | 1851 | translateY 4px, scale .985 | `.cat-pop-asset--eat` (1848) | .36s ease-in-out infinite alternate |
| `symbol-pop` | 1859 | scale .4 to 1.12 to 1, opacity 0 to 1 | `.symbol-pop` (1856) | 220ms ease-out |
| `particle-fly` | 1886 | translate(var(--dx), var(--dy) - 24px), scale 1 to .2, opacity 1 to 0 | `.particle` (1884) | 620ms ease-out forwards |
| `win-tier-fade` | 1907 | opacity 0 to 1 | `.win-tier` (1905) | 260ms ease-out |
| `win-pop` | 1925 | scale .5 to 1.15 to 1, opacity 0 to 1 | `.win-tier-label` (1919) | 480ms cubic-bezier(0.34, 1.56, 0.64, 1) |
| `burst-out` | 1959 | rotate(var(--angle)) translateX 0 to 150px, scale 1 to .2, opacity 1 to 0 | `.burst-dot` (1955) | 900ms ease-out both, delay `var(--delay)` |
| `cat-hop-in` | 1993 | translateY -120% to 6% to 0, scale .8 to 1.05 to 1 | `.cat-popin .cat-sprite` (1990) | 620ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards |
| `quip-fade-in` | 2011 | opacity 0 to 1, translateY 8px to 0 | `.cat-quip` (2008) | 260ms ease-out with 300ms delay, both |
| `beam-drop` | 2481 | translateY -140% to 6% to 0, opacity .2 to 1 | `.beam-drop` (2477) | 360ms cubic-bezier(.2, .78, .3, 1.08) both, delay `var(--drop-delay, 0ms)` |
| `beam-up` | 2492 | scale 1.08 to .48, translateY 0 to -115%, brightness 1.3 to 2.2, blur 0 to 2px, opacity 1 to 0 | `.beam-up` (2488) | 260ms cubic-bezier(.55, .02, .9, .45) forwards |
| `shatter-out` | 2502 | scale .2, rotate 25deg, opacity 0 | `.shatter-out` (2498) | 260ms ease-in forwards. No TypeScript file applies this class |
| `levelup-overlay-in` | 3072 | opacity 0 to 1 | `.levelup-overlay` (3065) | 220ms ease-out both |
| `levelup-overlay-out` | 3076 | opacity 1 to 0 | `.levelup-overlay--out` (3069) | 380ms ease-in forwards |
| `levelup-saucer-enter` | 3101 | translate from `var(--saucer-start-x)` to center, scale .7 to 1, opacity 0 to 1 | `.levelup-saucer` (3089) | 480ms cubic-bezier(.15, .9, .3, 1) both |
| `levelup-saucer-crash` | 3113 | scale 1 to 1.18 to .1, rotate 0 to -12deg to 200deg, opacity 1 to 0 | `.levelup-saucer` (3090) | 260ms ease-in with 480ms delay, both |
| `levelup-spark` | 3140 | rotate(var(--angle)) translateY 0 to -var(--dist), opacity 1 to 0 | `.levelup-spark` (3137) | 700ms cubic-bezier(.2, .8, .4, 1) both, per-spark delay `0.45 + i*0.012s` from `src/ui/board.ts:2518` |
| `levelup-msg-reveal` | 3170 | opacity 0 to 1, scale .55 to 1 | `.levelup-msg` (3164) | 400ms cubic-bezier(.34, 1.56, .64, 1) with 640ms delay, both |

Non-keyframe motion in this slice: the saucer beam uses a CSS transition (`height 220ms ease-out, opacity 220ms ease-out`, `src/style.css:527`); the Ice Notes swap uses `transition: opacity 200ms ease` (`src/style.css:1514`); the AskJamie bubble uses `transition: opacity 180ms ease, transform 180ms ease` (`src/style.css:1334`); the firefly jar fireflies use an inline SVG `<animate>` element (`src/ui/symbols.ts:222`).

---

## Appendix E: Asset usage map

| File under `public/` | Used by scene | Referenced at |
|---|---|---|
| `assets/chai-chase-splash.png` | `splash-standard`, `splash-birthday` | `src/splash.ts:85` |
| `assets/optimized/chai-chase-splash.webp` | `splash-standard`, `splash-birthday` | `src/splash.ts:83` |
| `assets/askjamie-avatar.jpg` | `board-askjamie-perch` | `src/ui/board.ts:292` via `publicAsset` (`src/ui/board.ts:153`) and `publicPicture` (`src/ui/board.ts:161`) |
| `assets/optimized/askjamie-avatar.webp` | `board-askjamie-perch` | `src/ui/board.ts:292` via `optimizedAsset` (`src/ui/board.ts:157`) |
| `assets/joey-phoebe-wilds.png` | `cat-popin-*` (all four) | `src/ui/symbols.ts:114` |
| `assets/optimized/joey-phoebe-wilds.webp` | `cat-popin-*` (all four) | `src/ui/symbols.ts:114` |
| `assets/atlases/standard-symbol-atlas.webp` | `board-reel-window`, `board-treat-jar`, `paytable-page` | `src/ui/asset-manifest.ts:28`, consumed at `src/ui/symbols.ts:36` |
| `assets/atlases/standard-symbol-atlas.png` | same | `src/ui/asset-manifest.ts:29`, consumed at `src/ui/symbols.ts:37` |
| `assets/atlases/special-symbol-atlas.webp` | `board-reel-window`, `paytable-page` special rows | `src/ui/asset-manifest.ts:33`, consumed at `src/ui/symbols.ts:36` |
| `assets/atlases/special-symbol-atlas.png` | same | `src/ui/asset-manifest.ts:34`, consumed at `src/ui/symbols.ts:37` |
| `assets/symbols/doorbell.svg` | `board-reel-window`, `paytable-page` row 7 | `src/ui/asset-manifest.ts:66`, consumed at `src/ui/symbols.ts:22` |
| `assets/symbols/chai-pump.svg` | `board-reel-window`, `paytable-page` row 8 | `src/ui/asset-manifest.ts:67`, consumed at `src/ui/symbols.ts:22` |
| `fonts/baloo2-800.woff2` | every surface using the display stack | `src/style.css:18` |
| `icons/favicon-32.png` | browser chrome, persistent | `index.html:18` |
| `icons/favicon-16.png` | browser chrome, persistent | `index.html:19` |
| `icons/apple-touch-icon-180.png` | iOS home screen, persistent | `index.html:20` |
| `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png` | installed PWA icon | `public/manifest.webmanifest`, linked at `index.html:17` |
| `assets/social-preview.jpg` | Open Graph and Twitter card preview | `index.html:26`, `index.html:36` |

Assets under `public/` that no scene in this slice references: `assets/joey-phoebe-wheel.png` and its webp, `assets/keepsake-memory-card-back.png` and its webp, `assets/keepsake-memory-mismatch-overlay.png` and its webp, the 19 files in `assets/bold-chai/`, and `assets/optimized/social-preview.webp`. The first three groups belong to bonus scenes owned by another agent; `assets/optimized/social-preview.webp` has no reference anywhere in `src/` or `index.html`.

---

## Appendix F: Unverified items and unreachable code

### F.1 UNVERIFIED

| Item | Why it could not be resolved from source |
|---|---|
| Whether `assets/optimized/social-preview.webp` is served to any client | The file exists in `public/assets/optimized/`, but no reference appears in `src/`, `index.html`, or `public/manifest.webmanifest`. UNVERIFIED whether a build step or external consumer picks it up. |
| The intended reading of the `(max)` volume `output` | `src/ui/board.ts:748` emits the literal text `(max)` and no code path writes to `#music-volume-value` or `#sfx-volume-value`. UNVERIFIED whether the static text is intentional or a stalled feature; the rendered result is that both rows always read `(max)` regardless of slider position. |
| Whether the birthday CSS comment or the birthday code is authoritative | `src/style.css:344` says "July 17 only, one-time" while `src/splash.ts:31-33` implements July 17 through July 31. UNVERIFIED which is the intended design; the shipped behavior follows the code. |
| The firefly jar's fill scale versus its printed label | `fireflyJarSvg` clamps to 0 through 8 (`src/ui/symbols.ts:217`) while the label is hard-coded as `{n} / 6` (`src/ui/board.ts:288`, `src/ui/board.ts:442`). UNVERIFIED whether 6 or 8 is the intended meter cap. |

### F.2 Code present but not reachable through any production path in this slice

| Item | Evidence |
|---|---|
| `.shatter-out` class and its keyframe | Defined at `src/style.css:2498-2504`; no `.ts` file adds the class (repo-wide search of `src/` excluding tests returns no match). |
| `.symbol-sprite--wild` | Defined at `src/style.css:1812-1815`; `symbolSvg` emits `symbol-sprite` and `symbol-sprite--atlas` only, plus `symbol-sprite--chai-wild` for one id (`src/ui/symbols.ts:38-39`). |
| `.symbol-asset--handbag` | Defined at `src/style.css:1834-1836`; never emitted. `wild_handbag` resolves to an atlas sprite, not an `<img>` (`src/ui/asset-manifest.ts:59-64`). |
| `.symbol-sprite--chai-wild` | Emitted at `src/ui/symbols.ts:38` but has no CSS rule anywhere in `src/style.css`, so it applies no styling. |
| `.jar-meter-copy` and `.jar-meter-copy small` | Defined at `src/style.css:956` and `src/style.css:961`; no `.ts` file emits the class. |
| `.symbol-art` | Defined at `src/style.css:1853`; no `.ts` file emits the class. |
| `.settings-row` | Defined at `src/style.css:1590-1595`; no `.ts` file emits the class. |
| `.night-garden.aurora` | Defined at `src/style.css:441-447`; only the UniGlee marathon container applies `aurora` (`src/ui/board.ts:2141`), never `renderBoard`. Out of reach from the base board. |
| `.chai-splash-copy`, `.chai-splash-subtitle`, `.chai-splash-button` | Targeted by the `max-height: 760px` block at `src/style.css:406-411`; `renderSplash` emits `.chai-splash__content`, `.chai-splash__hook`, and `.chai-splash__primary` instead (`src/splash.ts:91-102`), so those three overrides match nothing. `.chai-splash-title` in the same block does match (`src/splash.ts:94`). |
| `askJamieSvg` and `wheelSvg` | Exported from `src/ui/symbols.ts:274` and `src/ui/symbols.ts:119`; `src/ui/board.ts` imports `wheelHeroArt`, `wheelMechanicalSvg`, `saucerSvg`, `gardenForegroundSvg`, `fireflyJarSvg`, `gleeAvatarSvg`, and `catSprite` only (`src/ui/board.ts:63-73`). The AskJamie perch uses the photo asset instead (`src/ui/board.ts:292`). |

### F.3 Dev hash routes recorded exactly

| Hash | Effect | Source |
|---|---|---|
| `#board` | Skips the splash tap-in gate, applies persisted audio settings, and calls `renderBoard(app, state)` | `src/main.ts:32-38` |
| `#lap-quest` | Same as `#board`, then schedules `runLapQuestChapter(app, state, () => 0)` on the next animation frame | `src/main.ts:39-46` |

Both are described in source as dev-only QA aids (`src/main.ts:29-31`) but carry no environment guard, and both strings are present in the built bundle `dist/assets/index-CfZIap50.js`.
