# Gameplay and Design-System Inventory

**Status:** source-backed catalog of the current checkout
**Captured:** 2026-08-09
**Scope:** existing runtime surfaces, bonus states, copy, art, and nested gameplay paths

This is an inventory, not a new design proposal. Every item below is classified as one of:

- **Shipped visual:** the current UI creates a dedicated visible surface or overlay.
- **Shipped board state:** the engine creates the state and the current UI renders it inside the board/free-spin cabinet.
- **Shipped engine-only:** the engine records or applies the mechanic, but the current UI does not give it a dedicated visual treatment.
- **Planned / absent:** described in a canonical or historical document but not present in the current runtime path.

The implementation source is authoritative for what is presently deployed. Canonical documents are cited for intent and for shipped-versus-planned boundaries; they are not used to promote a planned scene into a shipped scene.

## 1. Existing Replit-oriented artifacts

| Artifact | What it presently contains | Catalog status |
|---|---|---|
| `artifacts/chai-chasers/` | Replit artifact wrapper for the actual Vite game. | **Runtime source**, not a scene gallery. |
| `artifacts/mockup-sandbox/` | Component-preview server with one current mockup: `chai-splash/Polished.tsx`. | **Existing visual artifact:** splash mockup only. |
| `artifacts/chai-chasers-slides/` | Twelve-slide presentation, including gameplay, UniGlee, companions, and Ice Notes slides. | **Presentation reference only.** Some slide copy is stale or conflicts with current runtime; do not use it as mechanics authority. |
| `artifacts/chai-chasers-video/` | Five-scene showcase video export. | **Promotional artifact**, not complete gameplay coverage. |
| `public/assets/` and `public/icons/` | Current production raster, atlas, SVG, and icon assets consumed by `src/`. | **Primary visual asset inventory.** |

The current checkout does **not** contain a complete scene-by-scene canvas covering every rare outcome. This document is the assembly register for that review work. It does not claim that an external Replit canvas has been updated.

## 2. Runtime scene map

### Entry and persistent surfaces

| ID | Surface | Trigger / location | Current contents | Evidence |
|---|---|---|---|---|
| `entry.splash` | Splash and audio-unlock screen | Normal launch | Joey/Phoebe cosmic iced-chai art, title, “Start the Chai Chase”, “How it works”, and three-step “Sparkle / Collect treats / Grow the Cascade” loop. | `src/splash.ts:50-128`, `public/assets/chai-chase-splash.png` |
| `entry.birthday-window` | Birthday-window splash variant | July 17 through July 31, once per device/year | “Happy Birthday, Glee!”, Jamie’s exact `BIRTHDAY_MESSAGE`, and a one-time +10,000 Glee-coin claim. | `src/splash.ts:16-47,75-95` |
| `entry.birthday-reveal-scene` | Birthday Reveal animated scene | Described in the spec | **Not shipped.** The message and coin grant above are shipped; the animated Reveal scene is not. | `docs/IMPLEMENTATION-BASELINE.md:9.4`, `docs/ASSET-CHECKLIST.md` |
| `board.resting` | Main play area | After splash; also after each completed bonus | Night-garden backdrop, five saucers, stars/fireflies, marquee, 5×4 board, Treat Jar, Firefly Cascade meter, AskJamie perch, coin/bet console, SPARKLE!, Ice Notes. | `src/ui/board.ts:223-318,330-372` |
| `board.paytable` | In-game symbol guide | Book button in marquee | 40 fixed lines, 3/4/5 match explanation, twelve paying-symbol cards, special-symbol cards, live payout multipliers. | `src/ui/board.ts:767-816` |
| `board.settings` | Settings dialog/page | Gear button in marquee | Theme, sound on/off, music volume, SFX volume, reduced motion, payline guide, “About this gift”, reset. | `src/ui/board.ts:567-766` |
| `board.askjamie-bubble` | AskJamie daily-coin interaction | AskJamie perch | +500 coins once per calendar day, already-claimed message, and external-link bubble. This is not the unshipped Daily Bonus Wheel. | `src/ui/board.ts:445-496`, `docs/IMPLEMENTATION-BASELINE.md:9.4` |
| `board.ice-notes` | Rotating Ice Notes card | Main board footer; advances after a resolved spin/bonus path | Ingredient, fact sentence, flavor, chai role, source, gathering. The complete source deck is cataloged in §7. | `src/ui/board.ts:115-151`, `src/ui/ice-notes.ts:1-145` |

### Base-play visual states

| ID | State | What is visible | Classification |
|---|---|---|---|
| `base.opening-grid` | Settled 5×4 board | Twenty symbols, optional 40-line guide, multiplier badges, Wild Chai badge, sticky Lap Quest ring, giant Keepsake footprint where supplied. | Shipped board state |
| `base.spin-pop` | First result arrival | Cells use `symbol-pop`; doorbell ring is heard if a doorbell is present. | Shipped visual |
| `base.cascade-win` | Winning cascade | Winning cells flash, particles appear, saucer beams activate, winning symbols beam upward, new symbols drop, meter advances. | Shipped visual |
| `base.cascade-dead` | Dead-board end | Final non-winning grid remains; meter and status settle. | Shipped board state |
| `base.win-tier-nice` | Small celebration | `NICE WIN!` plus coin amount. | Shipped visual |
| `base.win-tier-big` | Medium celebration | `BIG WIN!` plus coin amount. | Shipped visual |
| `base.win-tier-huge` | Large celebration | `HUGE WIN!` plus coin amount. | Shipped visual |
| `base.specialty-sort` | Sparkle Sort engine step | Engine can shatter 5–11 eligible cells and force another cascade. The current UI renders the resulting grid step, but does not render a dedicated “Sparkle Sort” label/effect layer. | Shipped engine + board state; dedicated scene absent |
| `base.specialty-drop-in` | Drop-In Saucer engine step | Engine can replace a reel with a full Joey/Phoebe wild stack. The current UI shows the resulting board, not a dedicated Drop-In scene. | Shipped engine + board state; dedicated scene absent |
| `base.specialty-double-sparkle` | Free-spin award modifier | Engine records the modifier and doubles the cascade-ladder award when applicable. No dedicated current overlay. | Shipped engine-only |
| `base.specialty-facts-on-facts` | Free-spin wild-prize modifier payload | Engine queues/records the specialty step. The current UI has no dedicated Facts-on-Facts visual or coin-prize treatment. | Shipped engine-only / presentation gap |
| `base.handbag-wild` | Rare marked wild | Current board/free-spin grid displays ×3, ×5, or ×10 badge when a winning line uses the Handbag Wild. | Shipped board state |
| `base.treat-land` | Treat symbols collected | Chicken Comets, Salmon Stars, and Bougie Bites appear in the board and update the persistent Treat Jar. | Shipped board state |
| `base.cat-popin` | Cat visit | Joey or Phoebe enters with strut/eat/assist/unimpressed poses and one quip. Fed visits consume a qualifying treat; unfed visits use the consolation shuffle behavior. | Shipped visual |
| `base.level-up` | Chai Sparks level celebration | Saucer flies in, spark burst, `LEVEL n!`, cat quip, coin reward, tap-to-continue. | Shipped visual |

The base-spin orchestration is intentionally not a flat list of mutually exclusive triggers. `runSpin` resolves visual precedence as UniGlee takeover, then Doorbell Panic, then Bold Chai, then ordinary win celebration; cat pop-ins follow; Treat Time and free-spin/Treat Jar handoffs then run in sequence. See §6 for the nested paths.

## 3. AskJamie Sparkle Wheel and free-spin surfaces

### Wheel itself

| ID | Surface | Existing visible elements |
|---|---|---|
| `wheel.entry` | Joey & Phoebe’s Sparkle Wheel overlay | “Free Spins! Joey & Phoebe’s Sparkle Wheel”, fixed Joey/Phoebe wheel art, mechanical three-color face, pointer, glow rings, landing result text. |
| `wheel.wedge.multiplying` | Teal wedge | “We’re Multiplying”; one marked opening wild per qualifying counted free spin; no multiplier 15%, ×2 35%, ×3 30%, ×5 15%, ×10 5%. |
| `wheel.wedge.keepsake-trail` | Pink wedge | “Moonlit Keepsake Trail”; hands off to the 12-card memory scene. Runtime wheel ID is `keepsake_memory`. |
| `wheel.wedge.wild-rain` | Gold wedge | Player-facing “Iced Chai Wild Rain”; runtime ID is `chai_back`; the first opening board receives the one-shot Wild Chai Storm. |
| `wheel.subzones` | Three hidden mechanical zones per parent wedge | The wheel chooses `subzone: 0|1|2`; these alter the landing rotation/presentation only and do not create additional bonus rules. |

The current wheel weights are **40% / 35% / 25%**. `keepsake_collection`, `doorbell_panic`, `treat_time_morning`, and `treat_time_nighttime` are valid free-spin mode IDs but are not entries in the weighted public wheel.

### Shared free-spin cabinet

| ID | Surface | Existing visible elements |
|---|---|---|
| `free-spins.shared` | Aurora-shifted free-spin cabinet | Hidden primary grid, temporary free-spin grid, bonus banner with label/title/spin count/round win, cascade/drop states, round status, warm “Free Spins Complete!” summary. Retriggers are zeroed in the current session runner. |
| `free-spins.summary` | Standard summary | “Free Spins Complete!”, total coins, total spins, retrigger text when present, Continue button. |
| `free-spins.keepsake-constellation` | Giant Keepsake Collection board state | A locked 2×2, 2×3, or 3×4 giant keepsake footprint remains fixed while the rest of the board cascades. |
| `free-spins.multiplier-badge` | We’re Multiplying board state | Marked Joey/Phoebe wild with ×2/×3/×5/×10 badge on the opening result when a multiplier is rolled. |
| `free-spins.panic` | Doorbell free-spin cabinet variant | Panic grid, recurring doorbell sound, injected Joey/Phoebe wilds, “Panic Spins” title. |
| `free-spins.treat-time` | Treat Time cabinet variant | Treat-specific title/status and lower-left hand that casts treat tokens onto the board before the round. |
| `free-spins.wild-chai` | Wild Chai opening variant | One-time storm splash, converted mermaid-cup cells, `WILD CHAI` badges and conversion pulse. |

## 4. Dedicated bonus scenes and nested acts

### Bold Chai Pump

`bonus.bold-chai-pump` is a dedicated scene inside the normal cabinet footprint. It hides the reel grid and shows:

- `BOLD CHAI!` and “Barista mode · 12 pumps per strong chai”;
- 30.0-second timer;
- layered pump body, plunger, spout, iced cup and fill assets;
- `PRESS PUMP` button with `0 / 12` through `12 / 12` state;
- cup-swap state after a completed 12-pump cup;
- “Tap fast — make it strong!”, “Swap the cup — keep moving!”, and timeout copy;
- completion handoff to a Bold Chai free-spin session using the `chai_back` internal mode with Wild Chai Storm disabled;
- optional later Treat Jar free-spin handoff.

Evidence: `src/ui/board.ts:942-1041`, `src/engine/bold-chai-pump.ts`, `public/assets/bold-chai/`.

This is not the unshipped Chai Tea Bonus pick shelf. The pick shelf remains absent.

### Moonlit Keepsake Trail

`bonus.moonlit-keepsake-trail` is a dedicated 12-card memory scene:

1. Moonlit trail backdrop, title, “Six keepsakes. Twelve stops. One path to follow.”
2. 2.5-second preview/memorize state.
3. Twelve cards in a 3×4 grid with original card-back asset.
4. Card reveal/flip state and active-card glow.
5. Match state with `Pairs n / 6`.
6. Mismatch state with two strike indicators, mismatch overlay and 900ms reveal window.
7. Success result: “All six pairs found! You win 40 free spins!”
8. Failure result: “Trail over — no free spins this time. The night is still lovely.”
9. Success hands off to standard free spins; failure returns to the board.

Evidence: `src/ui/board.ts:1083-1265`, `src/engine/keepsake-memory.ts`, `public/assets/keepsake-memory-*`.

### Doorbell Panic

`bonus.doorbell-panic-entry` is a short banner over the triggering board:

- highlighted/ringing doorbell positions;
- doorbell art;
- `DOORBELL PANIC!`;
- “Joey & Phoebe fled into n free spins!”;
- direct handoff to the panic free-spin cabinet, bypassing the wheel.

Each panic round is a shared free-spin round with 3–6 injected cat wilds. The current engine awards 3–6 spins, even though the older Doorbell contract says 5–20; this is an open documentation delta, not a second scene.

Evidence: `src/ui/board.ts:1314-1337,2000-2120`, `src/engine/cascade.ts:234-237`, `docs/DOORBELL-PANIC-2026-07-12.md`.

### Treat Time

There are two runtime modes:

- `bonus.treat-time.morning`: “Phoebe’s morning Chicken Comets are READY!”
- `bonus.treat-time.nighttime`: “Phoebe found the nighttime spread — Joey is awake too!”

Both show `IT'S TREAT TIME!`, a free-spin count, an entry hand illustration, and then run on the main cabinet with a lower-left hand casting 0–4 treat tokens into the opening board. Chicken maps to Phoebe wilds; Salmon maps to Phoebe wilds; Bougie maps to Joey wilds. Morning and nighttime have different trigger rates and spin ranges in `src/engine/treattime.ts`.

Evidence: `src/ui/board.ts:1830-1998,2362-2415`, `src/engine/treattime.ts`.

### Treat Jar free spins

`bonus.treat-jar` is a nested additive session, not a wheel wedge. Completing a 24-count treat bag yields:

| Treat | Existing award | Current label |
|---|---:|---|
| Chicken Comets | 1 free spin | `Treat Jar Bonus` |
| Salmon Stars | 2 free spins | `Treat Jar Bonus` |
| Bougie Bites | 3 free spins | `Treat Jar Bonus` |

The current UI announces the completed bag in status text, runs a `chai_back` free-spin cabinet with Wild Chai Storm disabled and retriggers disabled, then shows the shared summary.

Evidence: `src/engine/features.ts:84-107`, `src/ui/board.ts:1267-1312`.

## 5. UniGlee marathon inventory

### Entry and exit

| ID | Surface | Existing visible elements |
|---|---|---|
| `uniglee.capture` | Rare capture takeover | Full overlay, 14 floating butterflies, Glee avatar, `UNI-GLEE!`, “The mythical capture is yours.”, initial spin award, activating reel. |
| `uniglee.chapter-1` | Joey’s Laundry Helper | Separate full-screen overlay with aurora garden, “UniGlee · Chapter 1”, Joey perch, laundry spin counter, 5×4 board, socks/paw effects, round status, chapter completion. |
| `uniglee.chapter-2-to-4` | Seeded middle chapter order | One each of We’re Multiplying, Keepsake Collection, and Nighttime Treat Time, in a seeded permutation. Each uses the shared free-spin cabinet with its chapter label/title. |
| `uniglee.chapter-5` | Phoebe’s Lap Quest | Choice overlay, reveal overlay, Lap Quest board rounds, Phoebe ledge interaction, Joey interruption/self-exit ending. |
| `uniglee.summary` | Marathon summary | `UNI-GLEE COMPLETE!`, “The mythical marathon is captured.”, total spins played, Glee-coins won, initial spins, local retriggers, “Phoebe’s sweetener included”, Return to the chase. |

The shipped engine awards **40 / 60 / 80** initial spins from active reels 3 / 4 / 5 and divides the first four acts into **10 / 15 / 20**-spin allocations. The canonical 300 / 400 / 500 contract remains open as D7; this catalog records the code path, not a ruling.

### Joey’s Laundry Helper detail

Existing visible states:

- Joey in an assist pose above the cabinet;
- a sock falling across visual reel 2, 3, or 4 and converting that whole column to Joey wilds;
- Joey’s paw striking one cell with ×2, ×3, or ×5;
- same-reel sock plus paw overlap;
- ordinary cascade/win states after the effect;
- completion status with total spins and total coins.

Evidence: `src/ui/board.ts:2132-2320`, `src/engine/laundry.ts`, `docs/JOEYS-LAUNDRY-HELPER-2026-07-15.md`.

### Phoebe’s Lap Quest detail

Existing visible states:

1. Choice dialog: “Phoebe is conducting a comfort survey. Which cozy place should she investigate?” with **Window Perch**, **Blanket Nest**, and **Moonlit Cushion**.
2. Reveal status: either “Perfect lap located. Phoebe has made a decision.” or “A cozy lap will do beautifully. Phoebe is settling in.”
3. Board round with 2 cozy or 4 perfect sticky Phoebe comfort-wilds.
4. Grace ledge: `Grace lap`, 15-second countdown, Phoebe settled on the ledge.
5. Active petting ledge: “Pet Phoebe”, pet target, progress bar, speech bubble, five-second inactivity watchdog.
6. Joey interrupt ending: Joey arrives, “Joey arrived. Phoebe is scampering off the ledge.”
7. Phoebe self-exit ending: “Phoebe lost interest and curled away.”
8. Final status with ending reason and coin total.

Evidence: `src/ui/board.ts:1635-1815`, `src/ui/lap-quest-ledge.ts`, `src/engine/lap-quest.ts`.

## 6. Nested gameplay paths actually used by the current UI

```text
Base spin
├─ cascade / win / dead-board states
├─ one primary takeover, in precedence order:
│  ├─ UniGlee capture → takeover → five-act marathon → summary
│  ├─ Doorbell Panic banner → panic free-spin cabinet → summary
│  ├─ Bold Chai Pump scene → Bold Chai free-spin cabinet → summary
│  └─ ordinary win-tier celebration
├─ optional cat pop-in after the primary takeover/win beat
├─ optional Treat Time entry + main-board Treat Time session
├─ optional Firefly free spins → Sparkle Wheel → one of three wheel wedges
│  ├─ We’re Multiplying → shared free-spin cabinet
│  ├─ Moonlit Keepsake Trail → memory scene → standard free-spin cabinet on success
│  └─ Iced Chai Wild Rain → storm splash → shared free-spin cabinet
├─ optional Bold Chai free spins if the pump scene completed a cup
└─ optional Treat Jar free spins after the above handoffs

UniGlee marathon
├─ Takeover
├─ Joey’s Laundry Helper
├─ seeded order of We’re Multiplying / Keepsake Collection / Nighttime Treat Time
├─ Phoebe’s Lap Quest choice → reveal → ledge/petting interaction
└─ UniGlee summary
```

Important boundary: the engine can carry multiple result fields on one base spin, but the UI intentionally sequences them. This tree describes the current orchestration, not every mathematically possible field combination as a simultaneous screen.

## 7. Ice Notes: complete current dialogue deck

The card always has this structure: `ICE NOTES` → **ingredient** + **fact** → `Flavor` → `Chai role` → `Source` → `Gathering`. There are 22 ingredients and 66 rotating fact sentences. The deck avoids immediate repeats; it is UI-only and does not affect game math.

| Ingredient | Flavor | Chai role | Source | Gathering | Exact rotating fact sentences |
|---|---|---|---|---|---|
| Cardamom | Floral, citrusy warmth | Lifts the spice blend | Tropical South Asian farms | Pods picked, then dried | “Green cardamom keeps its tiny seeds inside a papery pod, which helps protect its fragrant oils.” / “Cardamom pods are picked and dried; gentle drying helps preserve their color and aroma.” / “The warm, almost citrusy character comes from aromatic oils in both the seeds and the pod.” |
| Black Tea | Malty, brisk, tannic | Builds the tea backbone | Camellia sinensis gardens | Leaves plucked and oxidized | “Black, green, and oolong teas all begin as leaves from the Camellia sinensis plant.” / “For black tea, the leaves are allowed to oxidize fully, which deepens their color and malty character.” / “Rolling or crushing tea leaves exposes their contents to oxygen and starts the oxidation process.” |
| Ginger | Peppery, bright heat | Adds a fresh spark | Tropical rhizome fields | Rhizomes lifted and washed | “Ginger is a rhizome: a horizontal underground stem, not a root.” / “A ginger plant stores energy in its branching rhizome, growing joint by joint below the soil.” / “The lively bite of fresh ginger comes largely from compounds called gingerols.” |
| Star Anise | Sweet, licorice-like | Adds a high warm note | Evergreen orchards in East Asia | Fruit picked green, then dried | “Star anise is a dried fruit, not a seed; each point of the star is a small fruit segment.” / “The star-shaped fruit is picked before it is fully ripe, then dried until firm and fragrant.” / “Its sweet licorice-like aroma comes from anethole, an aromatic oil also found in anise.” |
| Oat Milk | Mild, cereal, creamy | Softens the spice body | Temperate oat fields | Grain cut, threshed, and milled | “Oat milk starts with oats blended with water and strained into a smooth, pale liquid.” / “Oats naturally contain soluble fiber called beta-glucan, which contributes to a silky texture.” / “Some oat-milk methods use enzymes to break down part of the oat starch into smaller sugars.” |
| Raw Cane Sugar | Golden, lightly molassesy | Rounds sweetness | Tropical cane fields | Stalks cut, crushed, crystallized | “Cane sugar begins as juice pressed from tall sugarcane stalks.” / “The juice is clarified and concentrated until sucrose forms crystals.” / “A trace of molasses left with the crystals gives less-refined cane sugar its warm golden color.” |
| Ice | Clean and cooling | Keeps the chai iced | Clean potable water | Water frozen into cubes | “When water freezes, its molecules arrange into an open crystal structure.” / “That open structure makes ice less dense than liquid water, which is why ice floats.” / “A generously iced drink stays cold because melting ice absorbs heat from the liquid around it.” |
| Water | Neutral | Carries tea and spice | Treated potable water | Collected, treated, then brewed | “Water is the quiet carrier that dissolves and carries tea and spice flavors into the cup.” / “Steep time and temperature both change how quickly tea and spices give up their soluble flavor compounds.” / “Pouring a finished concentrate over ice cools it quickly while keeping the drink firmly iced.” |
| Black Pepper | Sharp, tingly heat | Balances sweetness | Tropical pepper vines | Green berries picked and dried | “A black peppercorn is the dried berry of a climbing pepper vine.” / “Pepper berries are harvested green, then dried until their skins darken and wrinkle.” / “Piperine is the compound responsible for black pepper's recognizable, tingly heat.” |
| Cinnamon | Woody, sweet warmth | Sets the cozy base | Evergreen bark groves | Young shoots cut and peeled | “Cinnamon is made from the inner bark of selected evergreen tree shoots.” / “As thin strips of bark dry, they curl naturally into the familiar quill shape.” / “Cinnamaldehyde is the aromatic compound most closely associated with cinnamon's warm scent.” |
| Cloves | Sweet, intense spice | Deepens the blend | Tropical clove trees | Unopened buds picked and dried | “Cloves are unopened flower buds harvested before they bloom.” / “The buds are dried until they become the small, dark, nail-shaped spice used in chai blends.” / “Eugenol is a major aromatic compound in clove oil and gives cloves their sweet-spicy intensity.” |
| Natural Flavors | Blend-specific aroma | Rounds the finish | Plant, spice, or dairy materials | Extracted and blended | “Natural flavors are an ingredient-label category, not one single crop or spice.” / “The category can include flavoring materials derived from plants, spices, fruits, herbs, or dairy ingredients.” / “A small amount of a flavor extract can round out a blend without changing its visible texture.” |
| Cane Sugar | Clean, caramel sweetness | Balances spice heat | Tropical cane fields | Stalks cut, crushed, and boiled | “Sugarcane stores sucrose in its fibrous stalk rather than in a fruit.” / “Mills crush the stalks to release cane juice before the juice is filtered and concentrated.” / “As concentrated cane juice cools, sucrose molecules organize into crystals.” |
| Honey | Floral, mellow sweetness | Adds a round note | Beehives near flowering plants | Bees gather nectar; comb is collected | “Honey begins as floral nectar gathered by bees.” / “Bees reduce nectar's water content in the hive, concentrating the sugars into honey.” / “The flower sources available to bees influence honey's color, aroma, and flavor.” |
| Ginger Juice | Fresh, peppery lift | Boosts ginger presence | Tropical rhizome fields | Rhizomes washed and pressed | “Ginger juice is made by crushing or pressing fresh ginger rhizome to release its flavorful liquid.” / “The juice carries ginger's bright, peppery character into a blend without adding pieces of root.” / “Fresh ginger's pungency comes from the same gingerol-rich rhizome used for dried ginger spice.” |
| Vanilla Extract | Creamy, floral, soft | Smooths sharp spice | Tropical orchid vines | Pods cured after harvest | “Vanilla comes from the long seed pods of a tropical orchid.” / “The pods are cured after harvest; that slow process develops vanilla's familiar deep aroma.” / “Vanillin is the best-known aroma compound in vanilla, though a real extract contains many more notes.” |
| Citric Acid | Bright, clean tartness | Sharpens sweet notes | Citrus fruit or sugar fermentation | Fruit pressed or acid purified | “Citric acid occurs naturally in citrus fruits such as lemons and limes.” / “In a drink, a small amount of citric acid adds a clean tart note that can sharpen sweeter flavors.” / “Commercial food-grade citric acid is commonly produced by fermenting sugars, then purifying the result.” |
| Spice Extracts | Concentrated aroma | Distributes spice evenly | Harvested spices and botanicals | Spices extracted into liquid | “A spice extract concentrates aroma compounds from a spice into a liquid or oil-based ingredient.” / “Extracts can be made with methods that use water, alcohol, oil, carbon dioxide, or combinations of them.” / “Because extracts are concentrated, very small amounts can distribute a spice note evenly through a drink.” |
| Nonfat Ultra-Filtered Milk | Clean dairy, gentle creaminess | Adds body without heaviness | Dairy farms | Milk collected, separated, filtered | “Nonfat milk has most of its cream removed while retaining water, protein, minerals, and natural milk sugars.” / “Ultra-filtration uses fine membranes to separate some milk components by size.” / “Filtering and blending can change the balance of milk proteins and sugars without turning it into a plant-based drink.” |
| Lactase Enzyme | No direct flavor; sweeter finish | Makes the milk lactose-free | Cultured enzyme production | Fermented, then purified | “Lactase is an enzyme that splits lactose, the natural sugar in milk, into glucose and galactose.” / “Adding lactase before packaging is how lactose-free milk is made from dairy milk.” / “Because glucose and galactose taste sweeter than lactose, lactose-free milk can seem sweeter without extra sugar.” |
| Vitamin A Palmitate | Neutral | Restores milk fortification | Food-grade vitamin supply | Manufactured and measured | “Vitamin A palmitate is a stable form of vitamin A used in food fortification.” / “It pairs vitamin A with palmitic acid, a fatty acid, to make a form that stores well.” / “Vitamin A is fat-soluble, so it is commonly restored to low-fat and nonfat dairy products.” |
| Vitamin D3 | Neutral | Completes milk fortification | Food-grade vitamin supply | Manufactured and measured | “Vitamin D3 is also called cholecalciferol.” / “In fortified milk, vitamin D is added in a measured amount rather than occurring as a chai spice.” / “Vitamin D helps the body absorb calcium from foods and drinks.” |

Source of truth for this table: `src/ui/ice-notes.ts:26-137`. If this table and the source ever disagree, re-extract from the source rather than editing the runtime deck from this document.

## 8. Design-system inventory

### Current palette and visual grammar

- Midnight navy `#1a1f3c`, violet `#2d1f4c`, burnt orange `#d35b2d`, butter `#f5d576`, mint `#9fe8c5`, dusty pink `#e8a5b8`, ink `#20163a`.
- Retro-bright midnight PNW night garden: aurora ribbons, stars, saucers, fireflies, garden foreground, ornate cabinet, marquee bulbs.
- Board symbols use the standard/special atlases; doorbell and chai pump use dedicated SVGs; supporting characters, wheel, meter, saucers, and overlays use inline SVG or approved public assets.
- Motion vocabulary: symbol pop, beam/drop, win flash, beam-up, saucer beam, particles, card flip, glow/pulse, cat pose sequence, overlay entry/exit. Reduced motion collapses these to fades/direct state changes where implemented.
- Shared audio families: Chai Chase/base, cascade arpeggio, win pluck, bonus fanfare, Joey cue, Phoebe cue, Laundry sock/paw, Lap Quest, Treat Time, Chai Storm, Doorbell, Bold Chai, Keepsake, UniGlee, level-up, wheel tick.

### Current asset groups

| Group | Existing files / source |
|---|---|
| Splash and social | `public/assets/chai-chase-splash.*`, `social-preview.jpg`, optimized WebP variants |
| Character art | `public/assets/joey-phoebe-wheel.*`, `joey-phoebe-wilds.*`, `askjamie-avatar.jpg` |
| Symbol atlases | `public/assets/atlases/standard-symbol-atlas.*`, `special-symbol-atlas.*` |
| Bold Chai | `public/assets/bold-chai/cup-empty.svg`, `cup-swap.svg`, `fill-01.svg` through `fill-12.svg`, pump/plunger/spout assets |
| Supporting symbols | `public/assets/symbols/doorbell.svg`, `chai-pump.svg` |
| Keepsake memory | `keepsake-memory-card-back.*`, `keepsake-memory-mismatch-overlay.*` |
| Icons/PWA | `public/icons/*` |

### Explicitly absent or partial

The following should be marked “not present” on a review canvas rather than represented by invented artwork or copy: Birthday Reveal scene, Chai Tea Bonus pick shelf, Daily Bonus Wheel, milestone scenes/collection shelf, in-flight UniGlee persistence/fast/skip controls, additional chapter-specific bonus presentation, service-worker/offline verification, final music stems/mix, production AskJamie integration beyond the current avatar/perch, and device-regression gallery.

## 9. Canvas assembly rules

1. Use the scene IDs in this document as review labels only; they are not new runtime feature names.
2. Prefer the real production assets and exact runtime copy identified above.
3. For a state with no dedicated current renderer, show the source classification (“engine-only” or “board state”) instead of drawing a new scene and calling it shipped.
4. Keep the normal board, shared free-spin cabinet, wheel, Bold Chai, Keepsake Trail, Laundry, Lap Quest, UniGlee takeover/summary, cat pop-ins, win tiers, settings, paytable, and Ice Notes as separate review targets.
5. Preserve the distinction between `Moonlit Keepsake Trail` (the wheel’s interactive memory scene) and `Keepsake Collection` (the UniGlee giant-keepsake board modifier).
6. Preserve the distinction between the shipped birthday-window message/grant and the absent Birthday Reveal scene.
7. Do not use `artifacts/chai-chasers-slides` copy as runtime truth where it conflicts with this inventory or the source.

## 10. Evidence boundary and next action

**Confirmed in this checkout:** the runtime scene list, nested order, wheel sections, exact Ice Notes deck, production asset groups, and shipped/planned boundaries above.

**Not confirmed here:** whether an external Replit canvas has already been populated, whether a separate private Replit project contains additional approved scene captures, or whether any external canvas artifact is currently deployed. Those require direct access to that Replit workspace or a user-supplied export.

The next safe canvas task is assembly of review-only previews from this register, beginning with `board.resting`, `wheel.entry`, `bonus.bold-chai-pump`, `bonus.moonlit-keepsake-trail`, `uniglee.chapter-1`, `uniglee.chapter-5`, `uniglee.capture`, `uniglee.summary`, and the shared free-spin variants. No new gameplay content is required for that task.
