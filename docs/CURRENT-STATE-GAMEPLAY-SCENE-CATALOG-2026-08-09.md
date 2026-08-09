# Current-State Gameplay Scene Catalog

**Purpose:** a source-backed inventory of the visual gameplay states that are present in this checkout. It is a catalog for review and canvas assembly, not a new design brief, feature proposal, or statement that a planned feature exists.

**Checked:** 2026-08-09 on local `main` at `1655be9`. The local Vite preview was also opened at 390 × 844. The standard splash, live board, and the existing `#lap-quest` QA route were directly observed. All other entries below are **CONFIRMED** by the current DOM-rendering source and its referenced local assets.

## Reading this catalog

- **Screen** means a distinct full-screen page, modal, or cabinet-replacing scene.
- **State** means a presentation that shares the main board rather than a new screen.
- **Asset** means a reusable image or SVG already in the repository. It is not a claim that a separate screenshot of that state exists.
- A source location is included for every entry so a canvas card can be traced to the actual implementation.

## 1. Main journey and nested bonus map

```text
Splash
  └─ Main board
       ├─ Cascades / win tiers / cat pop-ins / level-up / Treat Jar
       ├─ Doorbell Panic banner → Panic free-spin cabinet → summary
       ├─ Bold Chai pump scene → Bold Chai free-spin cabinet → summary
       ├─ Treat Time entry → Morning or Nighttime Treat Time on main board
       ├─ Firefly award → Sparkle Wheel
       │    ├─ We're Multiplying free-spin cabinet → summary
       │    ├─ Moonlit Keepsake Trail → standard free-spin cabinet → summary
       │    └─ Iced Chai Wild Rain → free-spin cabinet → summary
       └─ UniGlee takeover → five-act marathon → UniGlee summary
            ├─ Joey's Laundry Helper
            ├─ shuffled: We're Multiplying / Keepsake Collection / Nighttime Treat Time
            └─ Phoebe's Lap Quest: choice → reveal → interactive ledge
```

The three middle UniGlee chapters are shuffled; Joey's Laundry Helper is always first and Phoebe's Lap Quest is always last. `src/engine/uniglee.ts`, `src/engine/uniglee-marathon.ts`.

## 2. Launch and permanent-board surfaces

| ID | Type | What is visibly present | Existing implementation / review source |
| --- | --- | --- | --- |
| L-01 | Screen | **Standard splash.** Cosmic illustrated night art with Joey, Phoebe, an iced chai, butterfly, books, cassette, cardigan, and aurora keepsake; title, supporting sentence, primary `Start the Chai Chase` action, and the three-step `Sparkle → Collect treats → Grow the Cascade` explainer. | `src/splash.ts:55-135`; `public/assets/chai-chase-splash.png` (WebP alternative in `public/assets/optimized/`). |
| L-02 | Variant | **Birthday-window splash block.** Adds `Happy Birthday, Glee!`, Jamie's fixed message, a `+10,000 Glee-coins` notice, and birthday treatment on the primary action. This is a splash variation, **not** the unshipped Birthday Reveal scene. | `src/splash.ts:16-39, 60-102`. |
| B-01 | Screen | **Main board / Chai Chase cabinet.** Marquee, book and settings buttons, five-reel × four-row grid, four corner stars, night garden, status line, Treat Jar, Firefly Cascade meter, AskJamie perch, bet controls, SPARKLE!, and Ice Notes. | `src/ui/board.ts:223-318`; observed in the local 390 × 844 preview. |
| B-02 | State | **Night-garden backdrop.** Aurora ribbons, 26 stars, five hovering saucers with beams, six fireflies, and a silhouetted foreground behind the cabinet. | `src/ui/board.ts:330-373`; inline artwork in `src/ui/symbols.ts`. |
| B-03 | State | **Payline and reel presentation.** 20 cells; an optional faint 40-line guide; winning paths glow; cells can carry multiplier, Wild Chai, or Lap Quest markers. | `src/ui/board.ts:384-426`. |
| B-04 | Page modal | **Symbol guide.** 40-fixed-line explainer; 12 paying-symbol cards with 3/4/5 values; 10 special-symbol cards. | `src/ui/board.ts:767-816`; atlas mapping in `src/ui/asset-manifest.ts`. |
| B-05 | Page modal | **Settings.** System/dark/light appearance, master sound switch, music and effects sliders with preview buttons, reduced motion, payline guide, `About this gift`, and `Start fresh`. | `src/ui/board.ts:567-765`. |
| B-06 | State | **AskJamie daily coin bubble.** Tapping the illustrated perch grants +500 coins once per local calendar day and opens a text bubble with an external `Visit us` link. It is not a wheel. | `src/ui/board.ts:445-495`; `public/assets/askjamie-avatar.jpg`. |
| B-07 | Persistent panel | **Ice Notes.** A read-only ingredient card containing an ingredient name/fact and four fields: Flavor, Chai role, Source, Gathering. It rotates after every completed base spin without immediately repeating. The current deck contains 66 entries (22 ingredient profiles × 3 facts). | `src/ui/board.ts:115-151`; `src/ui/ice-notes.ts:26-140`. |

## 3. Core play, celebrations, and companion states

| ID | Type | What is visibly present | Existing implementation / review source |
| --- | --- | --- | --- |
| C-01 | State | **Spin settlement and cascade.** Reels receive a pop/drop treatment; winning cells flash, emit particles, beam upward, and activate the background saucer beams; the next cells then drop in. | `src/ui/board.ts:1338-1429`. |
| C-02 | State | **Firefly Cascade meter.** A jar icon and `n / 6` count in the companion row; it updates with each cascade step. | `src/ui/board.ts:278-290, 438-443`; jar SVG in `src/ui/symbols.ts`. |
| C-03 | Overlay | **Nice / Big / Huge win.** Timed full-overlay burst dots, label, and coin amount. The overlay appears only at the implementation's wager-relative thresholds. | `src/ui/board.ts:1433-1465`. |
| C-04 | Overlay | **Level-up celebration.** A left- or right-entering saucer, spark burst, `LEVEL n!`, one selected Joey/Phoebe quip, coin award, and tap-to-continue hint. | `src/ui/board.ts:2489-2553`. |
| C-05 | Overlay state | **Phoebe pop-in, fed.** Phoebe struts then eats; a randomly selected fed-Phoebe quip is shown. | `src/ui/board.ts:1467-1506`; quip pool in `src/engine/features.ts:32-76`. |
| C-06 | Overlay state | **Phoebe pop-in, unfed.** Phoebe struts then uses the unimpressed pose; an unfed-Phoebe quip is shown. | Same renderer and source pool as C-05. |
| C-07 | Overlay state | **Joey pop-in, fed.** Joey struts, performs the assist pose, then eats; a fed-Joey quip is shown. | Same renderer and source pool as C-05. |
| C-08 | Overlay state | **Joey pop-in, unfed.** Joey struts then uses the unimpressed pose; an unfed-Joey quip is shown. | Same renderer and source pool as C-05. |
| C-09 | State → cabinet | **Treat Jar completion.** The three counters remain on the main board. A completed treat resets its counter and awards additive free spins, which use the existing free-spin cabinet labelled `Treat Jar Bonus`; there is no bespoke Treat Jar entry screen or separate art scene. | `src/engine/features.ts:19-144`; `src/ui/board.ts:1281-1305, 2006-2125`. |
| C-10 | State | **Keepsake Collection giant symbol.** A 2 × 2 keepsake zone is drawn over the reel grid during the applicable free-spin chapter. It is an in-grid state, not an independent pick or collection screen. | `src/ui/board.ts:413-420`; session creation in `src/engine/freespins.ts:171-231`. |

## 4. Direct bonus scenes and free-spin paths

| ID | Type | Entry and visible contents | Existing implementation / review source |
| --- | --- | --- | --- |
| D-01 | Entry overlay | **Doorbell Panic.** Trigger cells receive a ringing treatment; a bell, `DOORBELL PANIC!`, and `Joey & Phoebe fled into n free spins!` appear before the session. | `src/ui/board.ts:1314-1337`. |
| D-02 | Cabinet state | **Doorbell Panic free spins.** Aurora free-spin cabinet with Panic Spins heading, current spin/round win, recurring bell sound, and each round's flying Joey/Phoebe wild-cat count. | `src/ui/board.ts:1941-1956, 2006-2125`; starting wild placement in `src/engine/freespins.ts:137-169`. |
| D-03 | Cabinet-replacing scene | **Bold Chai.** The reel grid is hidden. The cabinet shows a `BOLD CHAI!` headline, 30-second timer, layered pump/plunger/spout/iced-cup artwork, 12-step fill state, press-pump button, progress count, and status text; completed cups briefly swap out. | `src/ui/board.ts:943-1081`; files under `public/assets/bold-chai/`. |
| D-04 | Cabinet state | **Bold Chai free spins.** The pump's awarded spins use the normal free-spin cabinet with `BOLD CHAI!` heading, then the shared Free Spins Complete summary. It is not a second pump scene. | `src/ui/board.ts:1268-1279, 2006-2125, 2417-2442`. |
| D-05 | Entry overlay | **Treat Time — Morning.** A cabinet-local `IT'S TREAT TIME!` entry card naming Phoebe's morning Chicken Comets and the awarded spins. | `src/ui/board.ts:1825-1845`. |
| D-06 | Entry overlay | **Treat Time — Nighttime.** The same entry composition with nighttime copy: Phoebe found the spread and Joey is awake too. | `src/ui/board.ts:1825-1845`. |
| D-07 | Main-board state | **Morning Treat Time play.** The normal grid stays on screen. A stylized hand throws Chicken Comet tokens from the lower left; each lands as a Phoebe wild. | `src/ui/board.ts:1848-1900, 2362-2408`; rules in `src/engine/treattime.ts`. |
| D-08 | Main-board state | **Nighttime Treat Time play.** The normal grid stays on screen; the same hand-toss presentation can use Chicken Comets, Salmon Stars, or Bougie Bites, landing as Phoebe or Joey wilds. | Same renderer as D-07. |
| D-09 | Entry overlay | **Sparkle Wheel.** A cabinet-local scrim with a heading, the Joey/Phoebe wheel illustration, a rotating three-wedge mechanical face and energy ring, fixed pointer, and a result label. | `src/ui/board.ts:1958-2004`; `public/assets/joey-phoebe-wheel.png`; mechanical SVG in `src/ui/symbols.ts:53-103`. |
| D-10 | Wheel section / resulting cabinet | **We're Multiplying.** One of the wheel's three visible sections. Its free-spin cabinet can display a single marked ×2/×3/×5/×10 wild and the reel number. | Wheel labels: `src/ui/board.ts:1983-1988`; session state: `src/ui/board.ts:2006-2125`; multiplier placement: `src/engine/freespins.ts:76-135`. |
| D-11 | Wheel section / cabinet-replacing scene | **Moonlit Keepsake Trail.** One of the wheel's three visible sections. After the wheel, the reel grid is hidden and the cabinet presents a purple/gold trail, a 3 × 4 card grid, 2,500-ms reveal preview, pairs count, two mismatch strikes, and success/failure result panel. Success hands off to standard free spins. | `src/ui/board.ts:1083-1265, 1903-1939`; `public/assets/keepsake-memory-card-back.png`; `public/assets/keepsake-memory-mismatch-overlay.png`. |
| D-12 | Wheel section / free-spin cabinet | **Iced Chai Wild Rain.** One of the wheel's three visible sections. The cabinet first shows `WILD CHAI STORM`, falling orange-gold drops, sparkles, AskJamie copy, and the number of converted mermaid cups; the first free-spin grid then animates those cells into Wild Chai. | `src/ui/board.ts:2318-2360, 2006-2125`; mechanics in `src/engine/freespins.ts:94-113`. |
| D-13 | Shared modal | **Free Spins Complete.** The reusable post-session summary shows total coins, total free spins, optional retrigger count, and Continue. It follows the relevant cabinet path; it is not a bonus-specific recap. | `src/ui/board.ts:2417-2442`. |

### Sparkle Wheel: what the visible sections actually are

The visible wheel has three equal colored wedges, each decorated with a different icon. The text legend identifies the sections as:

1. **We're Multiplying** — “Extra sparkle”
2. **Moonlit Keepsake Trail** — “memory match”
3. **Iced Chai** — “wild rain”

Nine gold pins divide the three wedges into three internal 40-degree landing zones each. Those sub-zones alter the rotation landing only; they do **not** represent nine different prizes. `src/ui/symbols.ts:53-103`; `src/engine/freespins.ts:35-73`.

## 5. UniGlee: all constituent visual acts

| ID | Type | What is visibly present | Existing implementation / review source |
| --- | --- | --- | --- |
| U-01 | Takeover | **UniGlee entry.** Fourteen animated butterflies, an illustrated Glee avatar, `UNI-GLEE!`, `The mythical capture is yours.`, and the awarded spin-marathon/reel line. | `src/ui/board.ts:1508-1533`; avatar SVG in `src/ui/symbols.ts`. |
| U-02 | Full overlay | **Joey's Laundry Helper (act 1).** A standalone aurora night-garden shell with UniGlee Chapter 1 chip, title, laundry spin/round-win meter, Joey perched beside the cabinet, a unique grid, and status line. | `src/ui/board.ts:2132-2217`. |
| U-03 | Effect state inside U-02 | **Sock drop.** A yellow/pink-striped sock falls down a selected column and leaves a full wild column treatment. | `src/ui/board.ts:2233-2309`. |
| U-04 | Effect state inside U-02 | **Paw strike.** A mint illustrated paw strikes a selected cell; the status reports its multiplier wild. Sock drop and paw strike can appear in the same round. | `src/ui/board.ts:2233-2309`. |
| U-05 | Cabinet state | **We're Multiplying (one shuffled middle act).** The shared free-spin cabinet with `UniGlee · Chapter n` label and `We're Multiplying` title; its visual novelty is the marked multiplier wild described at D-10. | `src/ui/board.ts:1544-1593, 2006-2125`; plan in `src/engine/uniglee.ts`. |
| U-06 | Cabinet state | **Keepsake Collection (one shuffled middle act).** The shared free-spin cabinet with `Keepsake Collection` title; its distinct artifact is the giant 2 × 2 keepsake zone described at C-10. | Same sources as U-05. |
| U-07 | Cabinet state | **Nighttime Treat Time (one shuffled middle act).** The shared free-spin cabinet with `Nighttime Treat Time` title; it uses the free-spin version of the treat-toss wild animation. It does not use the direct-main-board Treat Time entry card. | `src/ui/board.ts:1544-1593, 2006-2125, 2362-2408`. |
| U-08 | Choice modal | **Phoebe's Lap Quest (act 5) choice.** Dark scrim, Phoebe art, title and comfort-survey copy, plus the three selectable cards: Window Perch, Blanket Nest, Moonlit Cushion. | `src/ui/board.ts:1708-1743`; directly observed through `#lap-quest`. |
| U-09 | Reveal overlay | **Lap Quest result.** Phoebe's eat pose with either `Perfect lap located. / Phoebe has made a decision.` or `A cozy lap will do beautifully. / Phoebe is settling in.` | `src/ui/board.ts:1745-1762`. |
| U-10 | Interactive board overlay | **Lap Quest ledge.** A pink stitched lap ledge over the live cabinet; illustrated resting Phoebe, speech bubble, an initially disabled pet target, quest copy, grace/active timer, progress bar, and active status line. | `src/ui/lap-quest-ledge.ts:52-230`. |
| U-11 | Lap Quest outcome variants | **Ledge ending.** Joey interruption: Joey arrives and Phoebe scurries off. Inactivity: Phoebe curls away. Quiet engine/cancel endings use a quiet departure. The underlying board receives sticky Phoebe comfort wilds while the ledge is active. | `src/ui/lap-quest-ledge.ts:130-180`; board treatment in `src/ui/board.ts:1764-1800`. |
| U-12 | Summary modal | **UniGlee Complete.** Butterfly, completion title, “The mythical marathon is captured,” spins played, Glee-coins won, initial-spins/retrigger note, and `Return to the chase`. | `src/ui/board.ts:1595-1632`. |

## 6. Existing art inventory for a review canvas

| Artifact group | Existing files / source | What it can cover in a canvas |
| --- | --- | --- |
| Launch artwork | `public/assets/chai-chase-splash.png` and optimized WebP | L-01 and L-02 visual backdrop. |
| Standard symbol atlas | `public/assets/atlases/standard-symbol-atlas.png` / `.webp` | Mermaid Tumbler, Midnight Butterfly, Glee Mix Tape, Crystal Cluster, Iced Chai To-Go, Cinnamon Candle, Glee Cardigan, Moonlit Book Stack, Butterfly Hair Clip, VHS Tape, Aurora Keepsake, Shared-Life Locket, and all three treat pouches. Mapping: `src/ui/asset-manifest.ts:40-68`. |
| Special symbol atlas | `public/assets/atlases/special-symbol-atlas.png` / `.webp` | UniGlee butterfly, Joey/Phoebe saucer wilds, Handbag Wild, and Wild Chai. Mapping: `src/ui/asset-manifest.ts:40-68`. |
| Wheel composition | `public/assets/joey-phoebe-wheel.png` / optimized WebP plus `wheelMechanicalSvg()` | D-09, including the cats/rim image and actual three-wedge face. |
| Cat composition | `public/assets/joey-phoebe-wilds.png` / optimized WebP plus CSS sprite positions | Cat pop-ins, Laundry Helper perch, wheel-adjacent cat states, and saucer-wild reference. `src/ui/symbols.ts:111-116`. |
| Memory assets | `public/assets/keepsake-memory-card-back.png`, `public/assets/keepsake-memory-mismatch-overlay.png` and optimized WebP variants | D-11 card back and mismatch state. |
| Bold Chai parts | `public/assets/bold-chai/pump-body.svg`, `spout.svg`, `plunger-up.svg`, `plunger-mid.svg`, `plunger-down.svg`, `cup-empty.svg`, `cup-swap.svg`, `fill-01.svg` through `fill-12.svg` | D-03's complete layered pump scene. |
| Individual symbols | `public/assets/symbols/doorbell.svg`, `public/assets/symbols/chai-pump.svg` | D-01 and D-03 trigger-symbol cards. |
| Code-owned vectors | `src/ui/symbols.ts`, `src/ui/lap-quest-ledge.ts`, `src/ui/board.ts` | Saucers, Firefly Jar, night foreground, UniGlee avatar, wheel mechanics, laundry sock/paw, Treat Time hand, Keepsake Trail backdrop, and Lap Quest ledge/Phoebe. These have no separate raster files. |

## 7. Canvas assembly boundary: what currently can and cannot be surfaced without new game content

### Existing direct review sources

- The deployed game itself renders every composite scene listed above from `src/ui/board.ts`.
- The repository has a board-only QA hash: `#board`.
- The repository has a Lap Quest QA hash: `#lap-quest`.
- The listed asset files can be placed directly as existing visual references.

### Existing limitation

There is **no** built-in QA route, image file, or screenshot fixture for the rare paths: Doorbell Panic, Bold Chai, Treat Time, wheel outcomes, Moonlit Keepsake Trail, Wild Chai Storm, Joey's Laundry Helper, or the UniGlee takeover/summary. They are composed at runtime by `src/ui/board.ts`; the only permanent visual files are the shared art listed in §6.

`artifacts/chai-chasers-slides/` and `artifacts/mockup-sandbox/` are present as Replit workspace artifacts, but the game does not import them. They must not be treated as deployed gameplay or as a source of truth for this catalog. The repository guide identifies `artifacts/` as scaffolding outside the game implementation.

Therefore, a complete Replit canvas that displays the *actual rendered* rare scenes requires a later, explicitly scoped capture/fixture task. This catalog intentionally does not invent screenshots, recreate the scenes, or claim that those fixtures already exist.

## 8. Explicit non-inventory: named material that is not currently a gameplay scene

The following must not be added to the current-state canvas as though they exist:

- Birthday Reveal animated scene (the birthday splash message/grant is present; this scene is not).
- Daily Bonus Wheel (AskJamie is a daily coin bubble, not a wheel).
- Chai Tea Bonus pick shelf.
- Milestone scenes or collection shelf: Iced Chai Break, Butterfly Burst, Cat Constellation, Glee Mode.
- A Giant Toolbox Mode wheel section (the current wheel has only the three sections in §4).
- Any distinct Phoebe Treat Trail, Mixtape Moon Run, or Aurora Book Nook scene.
- UniGlee pause/resume persistence, fast mode, or skip-to-summary controls.

These exclusions are confirmed against the running-state authority in `docs/IMPLEMENTATION-BASELINE.md:216-241` and the actual screen factory list in `src/ui/board.ts`.
