# Game Realignment — The Chai Chase

**Date:** 2026-07-12
**Decision owner:** Jamie
**Status:** approved product-direction amendment; Claude owns the engine-math integration, Codex owns the first-screen/art alignment, and Replit receives one bounded follow-up at a time.

This amendment removes concepts that drifted in from the Glee-fully GPT organization system and restores the game fantasy itself.

## 1. The game in one sentence

**Joey and Phoebe help Glee chase the boldest, most satisfying iced chai through a midnight PNW world made from the music, books, keepsakes, places, jokes, and shared memories she loves.**

The game is not about opening a Toolbox. It is not an interface for Tools, Tool-ettes, leaves, branches, or GPT orchestration. Those terms belong to the separate Glee-fully tools ecosystem.

## 2. Jamie's rulings

### The GPT organization metaphor leaves the game

Remove from current game-facing art and copy:

- “Tap to open the Toolbox” and “the Toolbox opens”;
- Toolbox-as-world, tools, Tool-ettes, branches, and leaves;
- the Toolbox reel symbol and Giant Toolbox bonus presentation;
- any implication that the game is a sub-tool inside the GPT organization system.

Historical documents may retain those terms as provenance, but must be marked superseded. Current game-facing copy, art, audio names, prompts, and handoffs may not use them.

### Twelve is chai history, not a universal mythology

Glee liked an intensely flavored iced chai; twelve pumps was the remembered expression of that preference. The game may keep **one chai-specific wink** to twelve pumps, but twelve is not sacred and must not be stamped across unrelated multipliers, charms, pick counts, player levels, decoration, or copy.

The emotional idea is **full-flavor chai**, not numerology.

### The keepsake trail

The chase may collect or reveal original, unbranded objects that evoke:

- moonlit rock-and-roll and 90s grunge energy;
- mixtapes, records, and music-night memorabilia without artist names or copied marks;
- cozy mystery-movie-night energy without a film title or recognizable prop;
- Alaska, the Pacific Northwest, aurora, mountains, rain, lakes, and evergreens;
- beloved books and bookish comfort;
- the dusty-pink cardigan and butterfly clip;
- warm artifacts of Jamie and Glee's life together, expressed without private photos or literal personal documents.

Immediate symbol replacements retain their legacy engine IDs until Claude approves a math-safe migration:

| Legacy engine ID | Current game-facing meaning |
|---|---|
| `gnome` | **Moonlit Book Stack** — beloved books, crescent bookmark, butterfly clip |
| `yarn` | **Keepsake Locket** — paired moon/butterfly motif for a shared life |
| `cassette` | Glee Cardigan |
| `mailbox` | Butterfly Clip |
| `teapot` | Aurora Keepsake |

## 3. Modern themed-game research

This research studies feature architecture only. We do not copy names, characters, art, audio, reel layouts, branded terminology, or trade dress.

### Pattern A — visible progress can activate several features together

IGT's official Mystery of the Lamp material describes visible containers that build during base play, one to three active features entering the bonus, and inactive features upgrading during the bonus. The useful pattern is **readable anticipation plus combinable modifiers**, not the genie theme.
Sources: [IGT Mystery of the Lamp overview](https://www.igt.com/promotions/mysteryofthelamp), [IGT launch description](https://www.igt.com/Explore%20IGT/News/News%20Room%20Details?Index=20230626efef)

**Glee translation:** Joey, Phoebe, and UniGlee each have a visible but honest readiness signal. A mythic event may combine their chapters rather than merely applying one numerical multiplier.

### Pattern B — characters should own mechanically different bonuses

AGS's official Moo Cluck Oink description assigns a distinct modifier to each character, allows all three character features to combine, and calls out the soundtrack as part of the theme. The useful pattern is **character equals recognizable behavior and recognizable sound**.
Source: [AGS Moo Cluck Oink](https://www.playags.com/directory/games/moo-cluck-oink)

**Glee translation:** a Joey appearance should never feel like a recolored Phoebe appearance. Their objectives, motion, audio, and reward behavior differ.

### Pattern C — several bonus structures can coexist without confusing the base game

AGS's Lucky Panda describes three structurally different bonus types in one themed family: hold-and-spin, a compact secondary board, and free spins with paired reels. Hey! Presto uses three color-coded progress objects and lets features combine, while its free-spin feature can add spins one event at a time. The useful pattern is **clear visual grammar for different bonus modes**, with one base loop underneath.
Sources: [AGS Lucky Panda](https://www.playags.com/directory/games/lucky-panda), [AGS Hey! Presto](https://www.playags.com/directory/games/hey-presto)

**Glee translation:** bonus chapters should have distinct silhouettes and soundscapes, but reuse the validated engine/result boundary instead of becoming unrelated minigames.

### Pattern D — a familiar character can carry an evolving adventure

AGS's official Rakin' Bacon Deluxe description uses a continuing character adventure and lets collected bonus symbols grow the reels. The useful pattern is **a character whose activity changes the board visibly**, not a mascot pasted beside normal spins.
Source: [AGS Rakin' Bacon Deluxe](https://www.playags.com/directory/games/rakin-bacon-deluxe-pirate-plunder)

**Glee translation:** Joey and Phoebe physically pursue objectives—treats, a lap, socks, drawers—and their actions alter the chapter state.

## 4. Revised bonus architecture

### Base game: The Chai Chase

The existing 5×4 cascade board remains the mechanical home. Each spin advances the feeling of a night journey toward the intensely flavored iced chai. Keepsakes are the landscape, not an inventory-management system.

The main launch copy becomes:

- **Title:** Glee-fully Chai Chasers
- **Supporting line:** Joey and Phoebe are ready. The chai chase is on.
- **Primary action:** START THE CHAI CHASE

### Character chapter pool

These are bounded bonus-scene specifications, not permission to implement all of them in one pass.

| Chapter | Story action | Mechanical shape | Audio identity |
|---|---|---|---|
| **Phoebe's Treat Trail** | Phoebe follows Chicken Comets and Salmon Stars through the night garden | collect a visible treat path; each collection upgrades the next cascade | warm purr pulse, soft woodblock steps, delighted trill |
| **Phoebe's Lap Quest** | Phoebe tests cozy places until she finds the perfect lap | short choice/reveal sequence feeding sticky comfort-wilds into the board | slow warm pad, heartbeat-like purr, soft landing chord |
| **Joey's Laundry Helper** | Joey attacks socks, then tries to put laundry into drawers without hands | falling-sock catches and drawer-row wild placements between cascade blocks | muted guitar/pluck boogie, brushed snare, comic soft thumps |
| **Mixtape Moon Run** | The cats cross a moonlit music trail | multiplier notes collect into the next cascade chapter | original grunge-adjacent bass pulse and chiming chorus |
| **Aurora Book Nook** | Keepsakes and books light under the aurora | expanding/sticky book-frame positions with calm reveal pacing | Rhodes-like pad, page-turn shimmer synthesized without samples |

### UniGlee: the mythic bonus marathon

UniGlee is a super-special rainbow butterfly event, not a regular reel symbol and not a short violet overlay.

- **Frequency band:** never more frequent than 1 in 300 base spins and never rarer than 1 in 1,000; use 1 in 500 as the initial simulation target until Jamie rules on tested results.
- **Award range:** minimum 100 and maximum 500 free spins.
- **Entry:** the rainbow butterfly crosses the sky and opens a short sequence of award-building cascade spins. Those spins add chapter blocks to the guaranteed 100-spin base, capped at 500.
- **Variety:** the awarded session rotates through the character chapters above rather than replaying one wheel state hundreds of times.
- **Cadence:** chapter transitions occur in bounded blocks, initially proposed at 20–25 spins, with a persistent remaining-spin count and a clear chapter title.
- **Accessibility:** pause/resume persistence, reduced-motion equivalents, a fast mode, and a skip-to-summary option are required because a 100–500-spin celebration can otherwise become exhausting.
- **Ending:** a single warm recap shows chapters visited, best cascade, keepsakes found, and total Glee-coins.

### Math warning and ownership

A 100–500-spin award at this frequency would materially change the existing 96% oracle if those rounds pay like ordinary free spins. Claude must design the award distribution and tune the base/bonus contribution in `src/engine/` before this ships.

The same engine pass must remove the unrelated legacy uses of twelve now found in the level-six unlock (`src/engine/economy.ts`), Treat Jar cap (`src/engine/features.ts`), and 12× free-spin event (`src/engine/freespins.ts`). Their public labels are already neutralized; their tested math must be migrated deliberately rather than hidden behind new copy.

The simulation test must gain explicit gates for:

- UniGlee frequency within the 1/300–1/1,000 band;
- minimum/maximum awarded spins;
- average UniGlee spins and duration;
- termination under retriggers;
- overall RTP after the marathon is included.

The current `UNIGLEE_RATE = 1/400` already sits inside Jamie's permitted frequency band; it must not be changed merely for novelty. The reward structure is the principal missing work.

## 5. Soundtrack and SFX direction

All sound remains original Web Audio synthesis or explicitly approved original recordings. No recognizable melody, lyric, clip, artist sample, television audio, or branded machine sound may ship.

### Music layers

- **Base Chai Chase:** 76–82 BPM, warm electric-piano-like chords, soft brushed rhythm, distant aurora shimmer.
- **Cascade tension:** the existing rising arpeggio remains, but gains controlled layers at honest meter thresholds.
- **Free-spin chapters:** a shared harmonic foundation keeps the game coherent while each chapter swaps rhythm and timbre.
- **UniGlee:** glassy harmonics, widening call-and-response layers, then a clear transition into each chapter motif.

### Character cues

- **Joey enters:** syncopated three-note boogie figure; laundry chapter adds soft sock thumps and drawer-close punctuation.
- **Phoebe enters:** purr-like low modulation plus a bright food-discovery trill; lap chapter resolves to a slow, settled chord.
- **Treat collection:** three related cues with different timbres, not merely pitch-shifted copies.
- **Butterfly/UniGlee:** upward shimmer followed by a distinctive silence beat before the marathon begins.

Audio cues must communicate state even when the player is not looking directly at the meter. Muting must remain perfect, and every cue needs a reduced-intensity mix so long sessions do not become fatiguing.

## 6. Implementation order and ownership

1. **Codex — first-screen alignment:** remove Toolbox copy, install the approved Chai Chase splash, preserve Replit's pointer-event launch fix, and replace the two obsolete atlas objects without changing engine IDs.
2. **Claude — engine design:** write and test the UniGlee award-builder/session math and update the simulation oracle. No UI rewrite.
3. **Replit — one chapter at a time:** after pulling the canonical GitHub baseline, implement one approved chapter presentation against Claude's typed result contract.
4. **Audio owner — shared motif system:** expand `src/audio/` as its own bounded deliverable and verify long-session fatigue, mute behavior, and iOS unlock.
5. **Jamie — iPhone ruling:** approve each chapter's actual mobile preview before the next chapter begins.

## 7. Acceptance criteria for this amendment

- The splash contains no Toolbox/GPT organization vocabulary or imagery.
- Twelve appears only when directly explaining chai intensity, never as a general sacred-number motif.
- Joey and Phoebe are the active emotional protagonists of the launch screen.
- The CTA works on iPhone and still performs the required Web Audio unlock.
- Current protected board art and engine math are not broadly replaced.
- UniGlee remains within Jamie's frequency band and cannot award fewer than 100 or more than 500 spins once the new engine work ships.
- Every bonus chapter has a unique story action, mechanical silhouette, and audio identity.
- All research influences are translated into original Glee-fully expression.
