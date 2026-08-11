# Glee-fully Chai Chasers: Complete Game Mechanics and Engine Specification

**Version:** 1.0
**Date:** 2026-08-09
**Repo state:** `1ee084d` (engine last touched at `234ea74`)
**Scope:** everything under `src/engine/`, plus `scripts/sim-agent.ts` and the engine/UI boundary in `src/ui/board.ts`.
**Brand:** OverKill Hill P³.

## What this document is

This is the full engineering of the game engine: board geometry, RNG, reel strips, paytable, cascade loop, every wild, every bonus, the economy, and the RTP model with its measured numbers and its unresolved problems. A competent engineer with this document and no access to the repo should be able to build a mathematically equivalent game.

Every number below was read from source or measured by running the engine on 2026-08-09. Where an existing document in this repo disagrees with the code, the code wins and the disagreement is recorded in section 12. Load-bearing values carry a `file.ts:line` citation so you can check them.

Nothing here is a legal or regulatory claim. The game pays fictional Glee-coins. There is no purchase, wager, or cash-out.

---

## 1. Overview and architecture

### 1.1 Board geometry

| Property | Value | Source |
|---|---|---|
| Reels | 5 | `src/engine/reels.ts:16` |
| Rows | 4 | `src/engine/reels.ts:17` |
| Cells per board | 20 | derived |
| Grid indexing | `grid[reel][row]`, row 0 = top | `src/engine/types.ts:121` |
| Paylines | 40, fixed, always all active | `src/engine/paylines.ts:9-50` |
| Bet unit | total bet is split across 40 lines | `src/engine/economy.ts:9,18` |
| Win resolution | cascading (tumbling) reels to a dead board | `src/engine/cascade.ts:288-361` |

A `Cell` is a symbol plus three optional decorations: `multiplier` (the We're Multiplying marked wild), `sticky` (a Lap Quest comfort wild), and `handbagMultiplier` (`src/engine/types.ts:111-119`). Everything else about a cell is derived from its symbol ID.

### 1.2 The engine/UI boundary

The contract is one-directional and strict.

| Rule | Enforcement |
|---|---|
| The engine imports nothing from the UI | 21 files under `src/engine/`, zero DOM references. Verified: `grep -rn "document\.\|window\.\|Math.random\|Date.now" src/engine/*.ts` returns only comment text |
| The UI imports the engine as a library | `src/ui/board.ts:25-60` |
| No RNG is created inside the engine | Every entry point takes `rng: Rng` as a parameter. There is no module-level RNG state anywhere |
| No clock is read inside the engine | Bold Chai takes `nowMs` from the caller (`pumpBoldChai(state, nowMs)`); Lap Quest's ledge timer lives entirely in `src/ui/lap-quest-ledge.ts`, not in the engine |
| A spin is fully resolved before any pixel moves | `spin()` returns `SpinResult.steps`, the complete cascade history. The UI replays it with `animateSteps()`. It cannot change the outcome |
| Money settles once | `totalWin: Math.round(totalWin)` at `src/engine/cascade.ts:381`. Internal payouts are fractional; the player-facing award is a whole Glee-coin integer |

Interactive bonuses are split rather than compromised. The decision logic lives in the engine as a pure state machine (`keepsake-memory.ts`, `bold-chai-pump.ts`), and the UI owns the wall clock, the animation, and the input events. Each state machine accepts an action plus a timestamp and returns `{ state, accepted, event?, reason? }`. Rejections are typed, not thrown. Phoebe's Lap Quest is the exception: its timing loop lives in `src/ui/lap-quest-ledge.ts` (a DOM interval), not in the engine.

If you rebuild this, keep that boundary. It is the reason the whole game is testable without a browser and the reason the simulation harness in `scripts/sim-agent.ts` can play every bonus through the exact same entry points the UI uses.

### 1.3 The RNG

**Algorithm: mulberry32.** Thirty-one lines total, `src/engine/rng.ts`.

```
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

It is a 32-bit state, 32-bit output counter-based generator returning a float in `[0, 1)`. Period is 2^32. It is not cryptographically secure and does not need to be: this is a gift, not a regulated cabinet. What it is, is fast, dependency-free, and exactly reproducible from an integer seed across Node and every browser.

**Production seeding.** `productionSeed()` at `src/engine/rng.ts:17-21` pulls one `Uint32` from `crypto.getRandomValues`. `src/ui/board.ts:831` calls it once per paid spin, then builds two independent streams from it:

```
const seed = productionSeed();
spin({ rng: mulberry32(seed), treatTimeRng: mulberry32(seed ^ 0x9e3779b9), ... })
```

Every bonus session gets its own fresh `mulberry32(productionSeed())` (nine call sites in `board.ts`), except the UniGlee marathon and Lap Quest, which derive deterministically from the triggering spin's seed via `seed ^ 0x51f15e5d` and `seed ^ 0x6a09e667`. That derivation matters: it means a captured UniGlee is reproducible from the spin that captured it.

**Test and simulation seeding.** The oracle uses one fixed seed, `20260717` (`src/engine/simulation.test.ts:16`), and threads a single stream through 200,000 spins. `scripts/sim-agent.ts` takes a seed on the command line, builds a root stream, and derives a per-spin seed from it (`nextSeed()` at line 83), which is exactly the structure production uses. Unit tests use small hand-picked seeds so that a failure names a specific reproducible board.

**Why determinism matters.** The oracle in `src/engine/simulation.test.ts` asserts six frequency bands against 200,000 spins. If the RNG were not reproducible, that test would flake, and a flaky test that gates game feel gets deleted within a week. Because the seed is fixed, the oracle is a *regression* test, not a statistical one: a change in its output means the engine changed, full stop. That is worth more than any amount of statistical sophistication in the test itself.

There is one consequence you must respect if you extend the engine. **Adding an RNG draw anywhere in the spin path shifts every subsequent draw in the stream and changes every seeded result.** The codebase already carries two deliberate mitigations for this:

- Treat Time is rolled from a completely separate stream (`treatTimeRng`) and is drawn at the very end of `spin()` (`src/engine/cascade.ts:367-369`) precisely so that adding it did not perturb the established cascade/RTP stream.
- Cat pop-in copy variation reuses the cat-selection roll rather than drawing a fresh value (`src/engine/features.ts:158-162`), for the same reason.

Copy that discipline. When you add a feature, either put its rolls on a separate stream or put them after everything that is already tuned.

### 1.4 Module map

| Module | Owns | Lines |
|---|---|---|
| `rng.ts` | mulberry32, production seeding, weighted pick | 31 |
| `types.ts` | shared types, `FREE_SPIN_LADDER` | 255 |
| `reels.ts` | strips, window sampling, blockers, gravity refill | 229 |
| `paylines.ts` | 40 lines, `PAYTABLE`, `PAYOUT_SCALE`, line evaluation, blocker-pair detection | 136 |
| `cascade.ts` | the spin lifecycle, specialty wilds, UniGlee gating, result assembly | 396 |
| `features.ts` | treat jar, cat pop-ins, quip pools | 194 |
| `freespins.ts` | Sparkle Wheel, wedge modifiers, free-spin sessions, retrigger block | 444 |
| `uniglee.ts` | per-reel capture rates, trigger placement, five-act marathon plan | 176 |
| `uniglee-marathon.ts` | acts 1 to 4 runner | 82 |
| `laundry.ts` | Joey's Laundry Helper effects, quarter allocation | 120 |
| `lap-quest.ts` | Phoebe's Lap Quest choice and sticky-wild round | 139 |
| `treattime.ts` | Treat Time trigger rates and wild casting | 98 |
| `keepsake-constellation.ts` | giant-symbol zone roll and painting | 102 |
| `keepsake-memory.ts` | memory-match state machine | 180 |
| `bold-chai-pump.ts` | rapid-tap state machine | 124 |
| `economy.ts` | balance, bet ladder, XP, bust-proof refill | 72 |

`pickWeighted` in `rng.ts` is exported and tested but has no production caller. `EngineConfig` in `types.ts:248-255` is declared and never used. Both are inert.

---

## 2. Symbol set and paytable

### 2.1 The symbol set

Twenty-one symbol IDs, in five functional groups (`src/engine/types.ts:7-19`).

| ID | Display name | Group | Pays on lines? | Appears on |
|---|---|---|---|---|
| `tumbler` | Mermaid Tumbler | High | Yes | all 5 reels |
| `butterfly` | Butterfly | High | Yes | all 5 reels |
| `mixtape` | Mixtape | High | Yes | all 5 reels |
| `crystal` | Crystal | High | Yes | all 5 reels |
| `chai` | Iced Chai | Mid | Yes | all 5 reels |
| `candle` | Candle | Mid | Yes | all 5 reels |
| `cassette` | Cassette | Mid | Yes | all 5 reels |
| `gnome` | Gnome | Mid | Yes | all 5 reels |
| `mailbox` | Mailbox | Low | Yes | all 5 reels |
| `vhs` | VHS | Low | Yes | all 5 reels |
| `teapot` | Teapot | Low | Yes | all 5 reels |
| `yarn` | Yarn | Low | Yes | all 5 reels |
| `treat_chicken` | Chicken Comets | Treat | No | reels 1, 3, 5 |
| `treat_salmon` | Salmon Stars | Treat | No | reels 1, 3, 5 |
| `treat_bougie` | Bougie Bites | Treat | No | reels 1, 3, 5 |
| `doorbell` | Doorbell | Blocker | No | reels 1, 2 (injected) |
| `chai_pump` | Chai Pump | Blocker | No | reels 1, 2 (injected) |
| `wild_joey` | Joey (saucer-cat wild) | Wild | Substitutes | reels 2 to 5 |
| `wild_phoebe` | Phoebe (saucer-cat wild) | Wild | Substitutes | reels 2 to 5 |
| `wild_handbag` | Handbag Wild | Wild | Substitutes | reel 5 only |
| `wild_chai` | Iced Chai Wild | Wild | Substitutes | bonus conversion only |
| `uniglee` | UniGlee | Legend | No | injected, reels 3 to 5 |

The non-paying set is explicit at `src/engine/paylines.ts:77`: `treat_chicken`, `treat_salmon`, `treat_bougie`, `uniglee`, `doorbell`, `chai_pump`.

### 2.2 The paytable

`PAYTABLE` at `src/engine/paylines.ts:53-66` holds raw multipliers of the **per-line bet**. The delivered payout is `PAYTABLE[symbol][tier] * betPerLine * PAYOUT_SCALE` (`src/engine/paylines.ts:130`). `PAYOUT_SCALE = 0.775` (`src/engine/paylines.ts:73`).

Both columns are given below: the raw table you would type in, and the effective value after the global scale.

| Rank | Symbol | Tier | Raw ×3 | Raw ×4 | Raw ×5 | Scaled ×3 | Scaled ×4 | Scaled ×5 |
|---:|---|---|---:|---:|---:|---:|---:|---:|
| 1 | `tumbler` | High | 56 | 167 | 1112 | 43.40 | 129.43 | 861.80 |
| 2 | `butterfly` | High | 42 | 125 | 694 | 32.55 | 96.88 | 537.85 |
| 3 | `mixtape` | High | 33 | 96 | 417 | 25.58 | 74.40 | 323.18 |
| 4 | `crystal` | High | 27 | 82 | 334 | 20.93 | 63.55 | 258.85 |
| 5= | `chai` | Mid | 21 | 56 | 222 | 16.28 | 43.40 | 172.05 |
| 5= | `candle` | Mid | 21 | 56 | 222 | 16.28 | 43.40 | 172.05 |
| 7= | `cassette` | Mid | 13 | 33 | 139 | 10.08 | 25.58 | 107.73 |
| 7= | `gnome` | Mid | 13 | 33 | 139 | 10.08 | 25.58 | 107.73 |
| 9= | `mailbox` | Low | 8 | 21 | 69 | 6.20 | 16.28 | 53.48 |
| 9= | `vhs` | Low | 8 | 21 | 69 | 6.20 | 16.28 | 53.48 |
| 9= | `teapot` | Low | 8 | 21 | 69 | 6.20 | 16.28 | 53.48 |
| 9= | `yarn` | Low | 8 | 21 | 69 | 6.20 | 16.28 | 53.48 |

Four distinct high values, two mid pairs, one flat low block of four. The top prize is a five-of-a-kind Mermaid Tumbler at 861.80 times the per-line bet, which at the default 40-coin total bet is 861.80 coins from a single line, before any multiplier.

Runs longer than 5 are impossible on a 5-reel board, and `src/engine/paylines.ts:129` clamps the tier to 5 anyway.

### 2.3 PAYOUT_SCALE: the single global tuning knob

```
export const PAYOUT_SCALE = 0.775;   // src/engine/paylines.ts:73
```

**What it is.** A scalar applied to every line payout in the game, at the one place payouts are computed. Every bonus, every free spin, every cascade step, every multiplier, all of it runs through `evaluateLines`. There is no second payout path.

**Why it exists.** The raw paytable is the readable, human-designed artifact: round-ish numbers with a clean tier structure that a player could learn. Retuning RTP by editing twelve rows of a paytable is destructive to that structure and hard to reverse. Retuning by editing one float is neither. Separating "what the paytable says" from "how generous the game is" means you can move RTP without touching game feel and without touching the reel strips.

The in-source comment gives the other half of the reason: doorbell and pump blockers deliberately add dead space to reels 1 and 2, which suppresses line starts and therefore suppresses RTP. `PAYOUT_SCALE` is where that suppression is compensated for.

**How it was solved.** Payouts are exactly linear in `PAYOUT_SCALE`. Nothing in the cascade loop branches on payout magnitude: win detection is symbol-based, removal is position-based, the specialty queue is probability-based. So doubling the scale doubles every win and doubles RTP, exactly. Verified empirically by running the identical seeded 200,000-spin stream at three bet sizes, which exercises the same linearity:

| `betPerLine` | Base RTP | Implied RTP at `PAYOUT_SCALE = 1.0` |
|---:|---:|---:|
| 1 | 61.0821% | 78.816% |
| 10 | 61.1189% | 78.863% |
| 1000 | 61.1092% | 78.851% |

The residual spread of 0.04 points is the per-spin `Math.round(totalWin)` at `cascade.ts:381`, which matters at a bet of 1 and vanishes at a bet of 1000.

That linearity is what makes the knob solvable in one step. Measure the game at any scale, then:

```
scale_target = scale_current × (RTP_target / RTP_measured)
```

Worked, from today's measured fleet:

| Target | Arithmetic | Required `PAYOUT_SCALE` |
|---|---|---:|
| Full game 96.5% (the documented centre) | 0.775 × 96.5 / 105.79 | 0.7070 |
| Full game 98.0% (top of the documented band) | 0.775 × 98.0 / 105.79 | 0.7180 |
| Base game 61.0% (current, unchanged) | 0.775 × 61.0 / 61.05 | 0.7744 |

**State this plainly: `PAYOUT_SCALE` is the single global RTP knob.** Every other lever in the game (strip counts, ladder thresholds, bonus frequencies, award sizes) changes RTP *and* changes how the game feels. This one changes only RTP. If you need the game two points tighter and you do not want to renegotiate any design decision, this is the number you move, and it is the only number you move.

It is also the number that will silently invalidate every RTP figure in every document if you move it without re-running the fleet. See section 11.

---

## 3. Reel strips and symbol distribution

### 3.1 Model

These are real reel strips, not per-cell random draws. Each reel has a fixed circular tape. A spin picks one uniform stop index per reel and reads 4 consecutive symbols with wraparound (`src/engine/reels.ts:151-159, 188-204`). That single decision is what makes wild stacking a natural consequence of window position rather than a special case: a contiguous run of 6 wilds on the tape lands fully in view whenever the stop falls in the right 3-index band.

Strips are built programmatically at module load (`src/engine/reels.ts:103-115`) and frozen for the life of the process. `buildStrip(reelIndex)` is deterministic and takes no RNG.

Construction has three stages:

1. **Interleave** the paying symbols and (on reels 1, 3, 5) the treats, round-robin, so identical symbols do not clump end to end (`interleave`, `src/engine/reels.ts:42-49`).
2. **Append** the wild stacks as literal contiguous blocks, not interleaved (`src/engine/reels.ts:108-110`). This is the whole trick.
3. **Append** the single handbag candidate, reel 5 only.

### 3.2 Composition, per reel

Counts computed by executing `buildStrip(i)` for i in 0..4.

| Symbol | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---:|---:|---:|---:|---:|
| `tumbler` | 2 | 2 | 3 | 3 | 3 |
| `butterfly` | 3 | 3 | 4 | 4 | 4 |
| `mixtape` | 4 | 4 | 4 | 4 | 4 |
| `crystal` | 5 | 5 | 5 | 5 | 5 |
| `chai` | 6 | 6 | 6 | 6 | 6 |
| `candle` | 6 | 6 | 6 | 6 | 6 |
| `cassette` | 9 | 9 | 9 | 9 | 9 |
| `gnome` | 9 | 9 | 9 | 9 | 9 |
| `mailbox` | 16 | 16 | 16 | 16 | 16 |
| `vhs` | 16 | 16 | 16 | 16 | 16 |
| `teapot` | 16 | 16 | 16 | 16 | 16 |
| `yarn` | 16 | 16 | 16 | 16 | 16 |
| `treat_chicken` | 5 | 0 | 5 | 0 | 5 |
| `treat_salmon` | 4 | 0 | 4 | 0 | 4 |
| `treat_bougie` | 2 | 0 | 2 | 0 | 2 |
| `wild_joey` | 0 | 5 | 5 | 5 | 6 |
| `wild_phoebe` | 0 | 6 | 6 | 6 | 6 |
| `wild_handbag` | 0 | 0 | 0 | 0 | 1 |
| **Strip length** | **119** | **119** | **132** | **121** | **134** |

The same table as a share of each strip:

| Symbol | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---:|---:|---:|---:|---:|
| `tumbler` | 1.68% | 1.68% | 2.27% | 2.48% | 2.24% |
| `butterfly` | 2.52% | 2.52% | 3.03% | 3.31% | 2.99% |
| `mixtape` | 3.36% | 3.36% | 3.03% | 3.31% | 2.99% |
| `crystal` | 4.20% | 4.20% | 3.79% | 4.13% | 3.73% |
| `chai` | 5.04% | 5.04% | 4.55% | 4.96% | 4.48% |
| `candle` | 5.04% | 5.04% | 4.55% | 4.96% | 4.48% |
| `cassette` | 7.56% | 7.56% | 6.82% | 7.44% | 6.72% |
| `gnome` | 7.56% | 7.56% | 6.82% | 7.44% | 6.72% |
| `mailbox` | 13.45% | 13.45% | 12.12% | 13.22% | 11.94% |
| `vhs` | 13.45% | 13.45% | 12.12% | 13.22% | 11.94% |
| `teapot` | 13.45% | 13.45% | 12.12% | 13.22% | 11.94% |
| `yarn` | 13.45% | 13.45% | 12.12% | 13.22% | 11.94% |
| treats (all 3) | 9.24% | 0% | 8.33% | 0% | 8.21% |
| wilds (all) | 0% | 9.24% | 8.33% | 9.09% | 9.70% |

### 3.3 Reel restrictions

| Symbol class | Restriction | Source |
|---|---|---|
| Treats | reels 1, 3, 5 only (indices 0, 2, 4) | `src/engine/reels.ts:105` |
| Saucer-cat wilds (`wild_joey`, `wild_phoebe`) | reels 2 to 5 only (index >= 1) | `src/engine/reels.ts:85` |
| Handbag wild | reel 5 only (index 4) | `src/engine/reels.ts:97-100` |
| Doorbell, Chai Pump | reels 1 and 2 only, injected after the window is read | `src/engine/reels.ts:196-202` |
| UniGlee | not a strip symbol at all; injected on reels 3, 4, or 5 | `src/engine/uniglee.ts:75-97` |
| `wild_chai` | not a strip symbol; created only by the Iced Chai Wild Rain conversion | `src/engine/freespins.ts:94-107` |

The reel-1 restrictions are the load-bearing ones. No wild on reel 1 means **no line can start with a wild substitution on the leftmost reel from the strip alone**, which suppresses the frequency of five-of-a-kind runs materially. No treats on reels 2 and 4 keeps treat collection at roughly one per spin rather than two.

The base symbol counts also shift with reel index (`baseSegments`, `src/engine/reels.ts:52-70`): reels 1 and 2 are "tight" and carry 2 tumblers and 3 butterflies, while reels 3 to 5 carry 3 and 4. This is the classic "hero lands late" shape, kept deliberately subtle.

### 3.4 Wild stack sizing

`wildStackSegments` (`src/engine/reels.ts:84-94`):

| Reel index | Reel | Joey run | Phoebe run |
|---:|---:|---:|---:|
| 0 | 1 | none | none |
| 1 | 2 | 5 | 6 |
| 2 | 3 | 5 | 6 |
| 3 | 4 | 5 | 6 |
| 4 | 5 | 6 | 6 |

Each is **one** contiguous run, appended at the tail of the strip, Joey first then Phoebe. Because the strip is circular and the window reads 4 consecutive cells, a run of length L on a strip of length N yields:

- P(window is entirely inside the run) = max(0, L − 3) / N
- P(window touches the run at all) = (L + 3) / N

For reel 2 (N = 119): a pure Phoebe column lands with probability 3/119 = 2.52%, and any Phoebe touches with probability 9/119 = 7.56%. The two runs are adjacent on the tape, so a window straddling the boundary shows a mixed Joey/Phoebe column, which still functions as an all-wild column. Counting the pair as one 11-cell block, an all-wild column on reel 2 lands at 8/119 = 6.72%. Section 6.2 tabulates all four reels.

Measured: an opening board carries **1.442 wild cells on average** across 500,000 spins.

### 3.5 Blocker injection

Doorbells and Chai Pumps are not on any strip. They are stamped onto the already-drawn board (`spinGrid`, `src/engine/reels.ts:188-204`).

| Constant | Value | Source |
|---|---|---|
| `DOORBELL_REEL_ONE_RATE` | 1/17 | `src/engine/reels.ts:20` |
| `DOORBELL_REEL_TWO_RATE` | 1/30 | `src/engine/reels.ts:21` |
| `BOLD_CHAI_REEL_ONE_RATE` | 1/17 | `src/engine/reels.ts:24` |
| `BOLD_CHAI_REEL_TWO_RATE` | 1/30 | `src/engine/reels.ts:25` |

All four rolls happen every spin (`selectBlockerFamily`, `src/engine/reels.ts:163-180`), but the two families are mutually exclusive per board: if either doorbell roll hits, the board is a doorbell board and the pump rolls are discarded. Only after both doorbell rolls miss can a pump land. Placement row is uniform over the 4 rows (`placeBlocker`, `src/engine/reels.ts:182-185`), and it overwrites whatever was drawn there.

Both families are suppressed entirely inside bonus rounds via `SpinGridOptions` (`src/engine/reels.ts:30-35`). Note the defaulting idiom is `options.includeDoorbells !== false`, so **omitting the option enables the blocker**. Callers that want them off must pass `false` explicitly.

Measured on 500,000 opening boards: 8.99% carry at least one doorbell, 8.16% carry at least one pump.

### 3.6 Refills: opening spin versus cascade

This is a real asymmetry and you need to get it right.

| | Opening spin | Cascade refill |
|---|---|---|
| Mechanism | one uniform stop per reel, read 4 consecutive tape cells | one independent uniform tape draw per vacated cell |
| Function | `windowFrom` via `spinGrid` (`reels.ts:151, 188`) | `cascadeColumn` (`reels.ts:211-224`) |
| Adjacency preserved? | yes: the tape's local order is visible | no: each cell is an independent sample |
| Full wild stacks possible? | yes, that is the point | only by coincidence |
| Blockers possible? | yes, injected after | no, blockers are not on the strip |

Refills fall in from the top: survivors keep their relative order and slide down, fresh cells are prepended (`return [...fresh, ...survivors]`, `reels.ts:223`). The column is rebuilt, never mutated.

The consequence: **cascade chains get progressively less wild-dense than the opening board**, because the stacked-run structure only exists in the tape order and the refill path throws that order away. Long chains therefore have to be driven by something else, which is exactly what the specialty-wild queue in section 5 is for.

Two refill paths bypass `cascadeColumn` entirely, `cascadeColumnAroundKeepsake` (`cascade.ts:110-141`) and `cascadeColumnAroundStickyWilds` (`cascade.ts:143-173`). Both call `drawSingle` rather than `cellFrom`, which means **a handbag drawn as a refill on those two paths lands as a plain wild with no multiplier attached**. That is a real behavioural difference, not a rounding detail.

---

## 4. Paylines

### 4.1 The 40 lines

Each line is 5 row indices, one per reel, left to right (`src/engine/paylines.ts:9-50`). Row 0 is the top row.

| # | R1 | R2 | R3 | R4 | R5 | | # | R1 | R2 | R3 | R4 | R5 |
|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 | 0 | 0 | | 20 | 1 | 3 | 1 | 3 | 1 |
| 1 | 1 | 1 | 1 | 1 | 1 | | 21 | 2 | 0 | 2 | 0 | 2 |
| 2 | 2 | 2 | 2 | 2 | 2 | | 22 | 0 | 3 | 0 | 3 | 0 |
| 3 | 3 | 3 | 3 | 3 | 3 | | 23 | 3 | 0 | 3 | 0 | 3 |
| 4 | 0 | 1 | 2 | 1 | 0 | | 24 | 1 | 2 | 0 | 2 | 1 |
| 5 | 3 | 2 | 1 | 2 | 3 | | 25 | 0 | 1 | 2 | 3 | 3 |
| 6 | 1 | 0 | 1 | 0 | 1 | | 26 | 3 | 2 | 1 | 0 | 0 |
| 7 | 2 | 3 | 2 | 3 | 2 | | 27 | 0 | 1 | 2 | 2 | 1 |
| 8 | 0 | 0 | 1 | 0 | 0 | | 28 | 3 | 2 | 1 | 1 | 2 |
| 9 | 3 | 3 | 2 | 3 | 3 | | 29 | 0 | 0 | 1 | 2 | 3 |
| 10 | 1 | 2 | 3 | 2 | 1 | | 30 | 3 | 3 | 2 | 1 | 0 |
| 11 | 2 | 1 | 0 | 1 | 2 | | 31 | 1 | 0 | 0 | 1 | 2 |
| 12 | 0 | 1 | 1 | 1 | 0 | | 32 | 2 | 3 | 3 | 2 | 1 |
| 13 | 3 | 2 | 2 | 2 | 3 | | 33 | 1 | 2 | 2 | 1 | 0 |
| 14 | 1 | 1 | 0 | 1 | 1 | | 34 | 2 | 1 | 1 | 2 | 3 |
| 15 | 2 | 2 | 3 | 2 | 2 | | 35 | 0 | 2 | 1 | 2 | 3 |
| 16 | 0 | 2 | 0 | 2 | 0 | | 36 | 3 | 1 | 2 | 1 | 0 |
| 17 | 3 | 1 | 3 | 1 | 3 | | 37 | 1 | 3 | 2 | 1 | 1 |
| 18 | 0 | 1 | 3 | 1 | 0 | | 38 | 2 | 0 | 1 | 2 | 2 |
| 19 | 3 | 2 | 0 | 2 | 3 | | 39 | 0 | 1 | 3 | 2 | 1 |

Structure: lines 0 to 3 are the four straights, 4 to 24 are symmetric V, zigzag and alternating shapes, 25 to 39 are asymmetric diagonals and mixed paths. Reel-1 row usage is 12/9/8/11 across rows 0 to 3, so the top row starts the most lines.

**All 16 (reel-1 row, reel-2 row) pairs are covered by at least one payline.** That is a computed property of this exact line set, not an accident, and section 7 depends on it: any doorbell pair on reels 1 and 2 always finds a line.

### 4.2 Evaluation

`evaluateLines(grid, betPerLine)` (`src/engine/paylines.ts:106-136`) is pure and takes no RNG.

For each of the 40 lines, in index order:

1. Read the reel-1 symbol at that line's row. **If it is in `NON_PAYING`, abandon the line entirely** and move on. A treat, doorbell, pump, or UniGlee on reel 1 kills that line outright, even if reels 2 to 5 are a perfect run.
2. Set `matchSymbol`. If the reel-1 symbol is a wild, `matchSymbol` is `tumbler`; otherwise it is the symbol itself (`paylines.ts:113`).
3. Walk reels 1 to 5 in order. A reel matches if its symbol equals `matchSymbol` **or** is any wild. Stop at the first non-match.
4. Minimum run length is 3 (`paylines.ts:126`). Shorter runs pay nothing.
5. Payout is `PAYTABLE[matchSymbol][tier] * betPerLine * PAYOUT_SCALE`, tier clamped to 5.

### 4.3 Ties, overlaps, and how wilds substitute

| Question | Answer |
|---|---|
| Do overlapping lines both pay? | Yes. Every line is evaluated independently. A single high-value cell can contribute to many simultaneous line wins and pays in all of them |
| Is there any "highest win only" rule? | No. There is no per-line best-of and no board-level best-of. All 40 line wins are summed |
| How are ties resolved? | There is nothing to resolve. Lines do not compete |
| Are cells removed once or once per win? | Once. Removal is by position set (`removedByReel`, `cascade.ts:346-351`), so a cell winning on three lines is still just one vacated cell |
| Right-to-left wins? | No. Left to right only, always anchored at reel 1 |
| Scatter pays? | None. Treats and UniGlee pay zero on lines and are collected or trigger by other means |
| Wild substitution | A wild matches any `matchSymbol`. Substitution is total: there is no symbol a wild cannot stand in for among the 12 paying symbols |
| A line made only of wilds | Pays as `tumbler`, the top symbol (`paylines.ts:113`). Five wilds on a line is the maximum single-line award in the game |
| Wild-led lines and low symbols | Because a wild on reel 1 forces `matchSymbol = tumbler`, a wild on reel 1 followed by four mailboxes pays nothing. It cannot happen from the strips (no wilds on reel 1) but it can happen from Lap Quest sticky wilds and Doorbell Panic preloads, both of which can place wilds on reel 1 |

That last row is a genuine design edge. If you add any mechanic that puts a wild on reel 1, understand that you have converted that line into a tumbler-only line.

### 4.4 Blocker pair detection

`findBlockerTrigger` (`src/engine/paylines.ts:83-92`) scans the 40 lines in index order and returns the **first** line whose reel-1 and reel-2 cells are both the target blocker symbol. `findDoorbellTrigger` and `findBoldChaiTrigger` wrap it. Because all 16 row pairs are covered, this always finds a line if both blockers are present, so the returned `lineIndex` is cosmetic (it drives which cells get the ringing animation) and never affects whether the bonus fires.

---

## 5. Cascade mechanics

Everything in this section is `src/engine/cascade.ts`, function `spin()` at lines 240 to 394.

### 5.1 The spin lifecycle

**Setup, before the loop.**

1. Build the opening grid. Either the caller supplied a `startingGrid` (every bonus wedge does this, and it is deep-copied), or `spinGrid` draws a fresh one with blockers enabled or suppressed per the options (`cascade.ts:256-258`).
2. Stamp any Lap Quest sticky wilds onto the board (`applyStickyWilds`, `cascade.ts:179-187`).
3. If a Keepsake Constellation zone is active, paint it (`applyKeepsakeZone`, `cascade.ts:263`).
4. **Collect treats from the opening grid only** (`collectTreats`, `cascade.ts:264`). Symbols that arrive later as cascade refills are never collected. This is the single most important thing to get right about the treat jar.
5. Roll the UniGlee capture, but only when `allowUniGlee` is true **and** `spinArea === "main"` (`cascade.ts:266`). See section 7.
6. If UniGlee captured, seed the specialty queue with `drop_in, facts_on_facts, sparkle_sort, sparkle_sort, sparkle_sort`, set `doubleSparkleActive = true`, and apply the drop-in immediately (`cascade.ts:281-285`).

**The loop** (`while (true)`, `cascade.ts:288`). Each iteration:

1. If no doorbell trigger has been captured yet, look for one on the current board. If found, roll its award now (3 to 6 spins).
2. If no pump trigger has been captured yet, look for one.
3. Evaluate all 40 lines. Apply multipliers (see 5.4).
4. **If there are wins:** increment `cascades`, add the payouts, roll specialty wilds, remove every winning position, apply gravity and refill, push a step, continue.
5. **If there are no wins but the specialty queue is non-empty:** shift one specialty off the queue and apply it. Continue.
6. **If there are no wins and the queue is empty:** push the final dead-board step and break.

**Settlement, after the loop.**

1. Roll the cat pop-in (`rollCatVisit`, `cascade.ts:363`).
2. Compute the ladder award from `cascades`.
3. Roll Treat Time from the separate `treatTimeRng` stream, main board only (`cascade.ts:367-369`).
4. Resolve `freeSpinsAwarded` with doorbell precedence (see 5.5).
5. Round `totalWin` to an integer and return.

The loop always terminates on a normal board because refills are independent draws. It is not formally bounded, and section 12 documents the one configuration where it does not terminate.

### 5.2 What clears and what persists

```
NEVER_SHATTER      = uniglee, wild_joey, wild_phoebe, wild_handbag, wild_chai, doorbell, chai_pump
PERSISTENT_BLOCKERS = doorbell, chai_pump
```
(`src/engine/cascade.ts:68-69`)

These two lists do different jobs and it is worth being precise about which.

| List | Where it is used | Effect |
|---|---|---|
| `NEVER_SHATTER` | `applySparkleSort` candidate filter (`cascade.ts:76`) | A Sparkle Sort blast can never destroy a wild, the UniGlee symbol, or a blocker. Only ordinary paying symbols and treats are blastable |
| `PERSISTENT_BLOCKERS` | `applyDropIn` (`cascade.ts:97`) | A Drop-In Saucer overwrites a whole reel with wilds, but skips cells holding a doorbell or pump, and skips the UniGlee symbol and any sticky wild |

Note the asymmetry: **`NEVER_SHATTER` does not protect symbols from ordinary line wins.** A wild that participates in a winning line is removed by gravity like anything else. The list only governs the Sparkle Sort blast. The things that genuinely survive an ordinary cascade are:

- **Doorbells and pumps**, because they are non-paying, so they are never in a winning position set. They *do* slide down under gravity as other cells above them clear.
- **Lap Quest sticky wilds**, because `cascadeColumnAroundStickyWilds` re-fixes their rows every step (`cascade.ts:143-173`).
- **A Keepsake Constellation zone footprint**, because `applyKeepsakeZone` repaints it after every cascade (`cascade.ts:360`). Its icon can change, its rectangle cannot.

The blocker sliding behaviour is measurable. Analytically, the probability of a doorbell pair on the opening board is (1/17)(1/30) = 1 in 510. Measured across 1,000,000 full `spin()` calls, the doorbell trigger fires **1 in 499**, because a doorbell that missed the pair on the opening board can slide into a pairing row during a later cascade step. The pump equivalent is 1 in 561 analytically (it needs both doorbell rolls to miss first) and measures 1 in 549.5.

### 5.3 Columns and gravity

Removal is collected per reel as a `Set<number>` of rows, then each column is rebuilt independently (`cascadeGrid`, `cascade.ts:189-206`). Three column strategies exist and exactly one is used per column per step:

| Condition | Strategy | Behaviour |
|---|---|---|
| A Keepsake zone is active | `cascadeColumnAroundKeepsake` | The locked rectangle rows are pinned. The free rows above and below it are treated as independent gravity segments and filled separately |
| Sticky wilds exist on this reel | `cascadeColumnAroundStickyWilds` | Sticky rows are pinned. The remaining rows form independent gravity segments |
| Neither | `cascadeColumn` (in `reels.ts`) | Plain gravity: survivors slide down, fresh draws fill from the top |

Keepsake takes precedence over sticky wilds when both are somehow present (`cascade.ts:196-198`). In practice they never co-occur: Keepsake Constellation is a UniGlee chapter and Lap Quest is a separate UniGlee chapter.

The segmented fill is the interesting part. With a locked block in rows 1 to 2, rows 0 and 3 are two separate one-row wells; a cleared row 3 does not receive the symbol from row 0. Symbols cannot fall *through* a locked footprint.

### 5.4 Multipliers at evaluation time

At `cascade.ts:297-307`, each raw `LineWin` from `evaluateLines` is post-processed:

```
multiplier        = first defined cell.multiplier among the win's positions
handbagMultiplier = max cell.handbagMultiplier among the win's positions, default 1
payout            = base × multiplier × handbagMultiplier
```

Two distinct multiplier channels, and they **stack multiplicatively**. `multiplier` uses `.find()`, so with two marked wilds on one line the first in position order wins; in practice `multiplyingStartingGrid` places exactly one per spin. `handbagMultiplier` uses `Math.max`, so the strongest handbag on the line applies. The returned `LineWin` records `multiplier` but not `handbagMultiplier` (`types.ts:137-145`), so a UI that wants to display the handbag factor must read it off the grid.

### 5.5 Cascade depth, and what counts

`cascades` is a single counter, incremented in exactly two places:

| Event | Increments `cascades`? | Source |
|---|---|---|
| A step that produced one or more line wins | Yes | `cascade.ts:333` |
| A Sparkle Sort blast | Yes | `cascade.ts:314` |
| A Drop-In Saucer | No | `cascade.ts:319-323` |
| A Double Sparkle or Facts-on-Facts queue entry | No | `cascade.ts:326` |
| The final dead-board step | No | `cascade.ts:329` |

So the meter the player watches counts *board-clearing events*, not just paid wins. A Sparkle Sort that shatters 5 to 11 cells and produces no follow-up win still advanced the meter by one. This is deliberate: it is what makes the specialty queue capable of pushing a spin up the ladder.

Measured cascade-depth distribution over 1,000,000 base-game spins (seed 4242424):

| Depth | Count | Rate |
|---:|---:|---|
| 0 | 684,733 | 1 in 1.46 |
| 1 | 141,935 | 1 in 7.0 |
| 2 | 99,123 | 1 in 10.1 |
| 3 | 46,181 | 1 in 21.7 |
| 4 | 16,917 | 1 in 59.1 |
| 5 | 6,243 | 1 in 160 |
| 6 | 2,609 | 1 in 383 |
| 7 | 1,128 | 1 in 887 |
| 8 | 576 | 1 in 1,736 |
| 9 | 275 | 1 in 3,636 |
| 10 | 151 | 1 in 6,623 |
| 11 | 72 | 1 in 13,889 |
| 12 to 17 | 57 | 1 in 17,544 |

Mean cascades per spin: 0.6113. Any-win rate (depth >= 1): 31.53%, or 1 in 3.17.

The shelf at depth 1 to 2 is the ordinary cascade tail. The much flatter decay from depth 6 upward is the specialty queue doing its job.

### 5.6 The specialty-wild queue

Any winning line that contains at least one wild rolls once for a specialty (`cascade.ts:337-344`):

| Constant | Value | Source |
|---|---|---|
| `SPECIALTY_TRIGGER_CHANCE` | 0.05 | `cascade.ts:30` |
| `sparkle_sort` weight | 50 | `cascade.ts:32` |
| `drop_in` weight | 30 | `cascade.ts:33` |
| `double_sparkle` weight | 12 | `cascade.ts:34` |
| `facts_on_facts` weight | 8 | `cascade.ts:35` |

The roll is **per winning line**, not per spin, so a step with four wild-bearing wins rolls four times. Queued specialties fire one at a time, and only when the board has gone dead, which is what keeps a spin from spiralling.

| Specialty | Effect | Cascade counted? |
|---|---|---|
| `sparkle_sort` | Shatter 5 to 11 uniformly-chosen non-wild, non-blocker, non-zone cells, then cascade (`applySparkleSort`, `cascade.ts:72-90`) | Yes |
| `drop_in` | Pick a reel from 2 to 5 uniformly, pick Joey or Phoebe at 50/50, overwrite the whole column with that wild, skipping blockers, UniGlee, and sticky cells (`applyDropIn`, `cascade.ts:93-104`) | No |
| `double_sparkle` | **No mechanical effect.** The step is recorded and the loop continues | No |
| `facts_on_facts` | **No mechanical effect.** Same | No |

That last pair needs stating plainly, because the code comment at `cascade.ts:325` calls them "ladder/coin modifiers". They are not, in this build. `doubleSparkleActive` is initialised `false` at `cascade.ts:276` and set `true` in exactly one place, the UniGlee branch at `cascade.ts:283`. Dequeuing a `double_sparkle` specialty never sets it. So 20% of specialty rolls (12 + 8 out of 100) produce a recorded step with a name and no mechanics. They are, today, cosmetic.

### 5.7 Free-spin resolution and doorbell precedence

```
doubleSparkleApplied = doubleSparkleActive && ladderAward > 0
freeSpinsAwarded     = doorbellPanic ? doorbellPanic.freeSpinsAwarded
                     : doubleSparkleApplied ? ladderAward * 2
                     : ladderAward
```
(`src/engine/cascade.ts:370-375`)

Read that carefully. **A doorbell pair overrides the cascade ladder entirely.** If a spin lands a doorbell pair and also cascades to depth 9, the player gets the doorbell's 3 to 6 spins, not the ladder's 25. It is rare (roughly 1 in 500 × 1 in 205, and doorbells actively suppress cascades by occupying reel-1 and reel-2 cells) but it is a real, silent downgrade. If you rebuild this, decide deliberately whether you want that precedence.

The doubling is the more consequential branch. Because UniGlee unconditionally sets `doubleSparkleActive` and unconditionally seeds a five-item specialty queue, a UniGlee spin reaches the ladder very often and then **doubles the award**. Measured over 2,000,000 base spins:

| Measure | Value |
|---|---|
| UniGlee spins | 1,549 (1 in 1,291) |
| Mean cascade depth on a UniGlee spin | 6.97 |
| Share of UniGlee spins where the doubling actually applied | 73.3% |
| Ladder awards from non-UniGlee spins | 1 in 230, mean award 10.45 spins |
| Ladder awards from UniGlee spins | 1 in 1,764, mean award **36.83 spins** |
| Combined Firefly entry | 1 in 204, mean award 13.50 spins |

So 11.6% of all Firefly free-spin sessions are UniGlee-born and carry roughly 3.5 times the normal award. That coupling is invisible in the per-feature RTP table and it matters. Section 10 quantifies it.

---

## 6. Wilds

Four wild IDs, all recognised by `isWild()` (`src/engine/paylines.ts:75, 79-81`), all substituting for all 12 paying symbols, all paying as `tumbler` when they lead a line.

### 6.1 Comparison

| | Joey | Phoebe | Handbag | Iced Chai |
|---|---|---|---|---|
| ID | `wild_joey` | `wild_phoebe` | `wild_handbag` | `wild_chai` |
| On the reel strips? | yes | yes | yes, one candidate | **no** |
| Reels | 2 to 5 | 2 to 5 | 5 only | wherever an `chai` was |
| Strip count | 5, 5, 5, 6 (reels 2 to 5) | 6, 6, 6, 6 | 1 | n/a |
| Placement | one contiguous run per reel | one contiguous run per reel | single cell at the strip tail | conversion of the opening board |
| Carries a multiplier? | only when marked by a bonus | only when marked by a bonus | yes, always, when it lands | no |
| Base game? | yes | yes | yes | no, bonus only |
| Extra sources | Drop-In Saucer, Doorbell Panic preload, Joey's Laundry sock drop and paw strike, Treat Time cast, Keepsake giant icon | same list plus Lap Quest sticky wilds | none | Iced Chai Wild Rain wedge only |

### 6.2 Joey and Phoebe: the saucer-cat wilds

The two cat wilds are mechanically identical. They differ only in which bonus injects them and in presentation. Both:

- appear on reels 2 to 5 only, as one contiguous tape run each (section 3.4);
- substitute for everything;
- can carry a `multiplier` when a bonus marks them (We're Multiplying, Joey's Laundry paw strike);
- can carry `sticky: "lap_quest"` when Phoebe's Lap Quest fixes them.

Landing probability, per reel, from the strips (window of 4 on a circular tape):

| Reel | Strip length | P(any Joey in view) | P(any Phoebe in view) | P(any wild in view) | P(full wild column) |
|---:|---:|---:|---:|---:|---:|
| 2 | 119 | 8/119 = 6.72% | 9/119 = 7.56% | 14/119 = 11.76% | 8/119 = 6.72% |
| 3 | 132 | 8/132 = 6.06% | 9/132 = 6.82% | 14/132 = 10.61% | 8/132 = 6.06% |
| 4 | 121 | 8/121 = 6.61% | 9/121 = 7.44% | 14/121 = 11.57% | 8/121 = 6.61% |
| 5 | 134 | 9/134 = 6.72% | 9/134 = 6.72% | 16/134 = 11.94% | 10/134 = 7.46% |

Exact, enumerated over every stop index rather than estimated. The full-wild-column figure is high relative to the individual runs because the Joey and Phoebe runs sit **adjacent** on the tape: on reels 2 to 4 they form one contiguous 11-cell wild block, so 8 of the possible stops give an all-wild column. Reel 5's block is 13 cells (6 Joey, 6 Phoebe, then the handbag candidate, which is itself a wild), giving 10. One of those 10 windows contains the handbag, which survives its landing gate only 85% of the time, so the effective reel-5 figure is about 7.35%.

**A full wild column happens on roughly 1 opening board in 15, per reel.** That is the mechanism the whole cascade ladder rests on.

Measured: 1.442 wild cells per opening board across 500,000 spins.

### 6.3 The Handbag Wild

`wild_handbag`, `src/engine/reels.ts:97-100, 132-149`.

**The late-reel candidate rule.** There is exactly one handbag on exactly one strip: the final symbol of reel 5's 134-cell tape. That is the entire placement rule, and it is what "late-reel" means. Because reel 5 is the last reel, a handbag can only ever participate in a **five-of-a-kind** line. It can never shorten a run, and it can never create a 3 or 4 win on its own.

**The landing gate.** When a draw produces `wild_handbag`, `cellFrom` (`reels.ts:145-149`) rolls again:

```
HANDBAG_WILD_LAND_RATE = 0.85      // reels.ts:28
if (rng() >= 0.85) -> replace with a re-drawn non-handbag symbol
else               -> keep it, and roll its multiplier
```

So a handbag candidate becomes a real handbag 85% of the time and is quietly swapped for an ordinary symbol 15% of the time. The replacement path recurses through `drawNonHandbagSymbol` so it can never loop back into a handbag.

**The multiplier.** `rollHandbagMultiplier` (`reels.ts:132-137`):

| Roll range | Multiplier | Probability |
|---|---:|---:|
| < 0.55 | ×3 | 55% |
| 0.55 to 0.90 | ×5 | 35% |
| >= 0.90 | ×10 | 10% |

Measured over 500,000 opening boards: 55.1% / 34.7% / 10.1%.

**Effective landing rate.** The window shows 4 of 134 tape cells, so P(candidate in view) = 4/134 = 2.985%, times the 0.85 gate = **2.537% of opening boards**, or 1 in 39. Measured: 2.553%, 1 in 39.

**Payout behaviour.** `handbagMultiplier` multiplies the entire line payout (`cascade.ts:301-305`), and it stacks with a We're Multiplying marked wild. A five-tumbler line with a ×10 handbag pays 1112 × 0.775 × 10 = 8,618 times the per-line bet.

**The gap to know about.** Cascade refills through `cascadeColumn` route through `cellFrom` and can therefore produce a fresh multiplied handbag mid-cascade at 1/134 × 0.85 per vacated reel-5 cell. Refills through the Keepsake and sticky-wild paths call `drawSingle` instead, so a handbag arriving there is a bare wild with no multiplier. Same symbol, different power, depending on which bonus you are in.

### 6.4 The Iced Chai Wild

`wild_chai` is not on any strip and has no landing probability. It exists only as the output of `convertChaiToWilds` (`src/engine/freespins.ts:94-107`), which sweeps one opening board and turns every `chai` cell into a `wild_chai`. That conversion fires once per Iced Chai Wild Rain session, on the first round only (`freespins.ts:189-191, 402`), and it is the only mechanic in the game that creates this symbol.

It is a plain wild: no multiplier, no stickiness, `NEVER_SHATTER` protects it from Sparkle Sort, and it clears normally when it wins. Expected yield per conversion is the `chai` density on the opening board, roughly 4 out of 20 cells at about 4.5 to 5.0% per cell, so typically 0 to 2 wilds, occasionally more.

### 6.5 Marked multiplier wilds

Distinct from all four wild IDs: the `multiplier` decoration on a `Cell`, worth `2 | 3 | 5 | 10` (`types.ts:86`). Only two mechanics ever set it.

**We're Multiplying** (`rollWildMultiplier`, `freespins.ts:76-83`), rolled once per counted free spin, never on a cascade step:

| Roll | Result | Probability | Placed on reel |
|---|---|---:|---:|
| < 0.15 | no marked wild this spin | 15% | n/a |
| 0.15 to 0.50 | ×2 | 35% | 2 |
| 0.50 to 0.80 | ×3 | 30% | 3 |
| 0.80 to 0.95 | ×5 | 15% | 4 |
| >= 0.95 | ×10 | 5% | 5 |

The multiplier value determines the reel (`MULTIPLIER_REEL`, `freespins.ts:86`). This is the sharpest piece of design in the whole bonus set: **the ×10 always lands on reel 5, where it can only ever join a five-of-a-kind.** The ×2 always lands on reel 2, where it joins almost anything. Value and reachability are inversely coupled by construction.

The marked cell is set to Joey or Phoebe at 50/50 and placed at a uniform row (`multiplyingStartingGrid`, `freespins.ts:114-123`). The marker survives gravity if the cell survives, but **fresh cascade drops never receive a marker**.

**Joey's Laundry paw strike** (`laundry.ts:93-98`) sets the same field to 2, 3, or 5 at weights 60/30/10.

---

## 7. The bonuses

Twelve mechanics, one template each. "Trigger probability" gives the exact constant where one exists and the measured rate from the 2,000,000-spin fleet described in section 10. "Measured RTP contribution" is that feature's share of total wagered, over the same fleet.

Reproduce every measured figure with:

```
for s in $(seq 1 40); do npx tsx scripts/sim-agent.ts a$s $s 50000; done
```

### 7.1 Firefly Cascade free spins

**Trigger condition.** A base-game spin reaches a cascade depth of 6 or more. `freeSpinsForCascades(cascades)` (`cascade.ts:60-66`) returns the highest `FREE_SPIN_LADDER` tier at or below the depth reached. Doorbell precedence overrides it (section 5.7).

**Trigger probability.** No constant: it is emergent from the reel strips, the specialty queue, and the ladder threshold. Measured **1 in 207** in the fleet; 1 in 204 over an independent 2,000,000-spin base-game run; the oracle's `freeSpinRate` gate reads 1 in 151 because that gate counts doorbell awards too.

**What it awards.** The ladder (section 8), 6 to 60 spins, doubled to 12 to 120 when the spin was a UniGlee capture. Every award routes through the Sparkle Wheel, which then decides which modifier the session plays under. Measured mean award 13.50 spins; mean session length 22.82 spins because the Moonlit Keepsake Trail branch substitutes a flat 40.

**Player agency.** None on entry. One click to spin the wheel, and the wheel is pre-resolved before the animation starts (`spinWheelLanding` at `board.ts:1961`).

**Design intent.** This is the game's spine: the reason a player watches a cascade chain with their breath held. Everything else is a garnish on this loop.

**Measured RTP contribution: 10.64%**, the largest single contributor. Mean win 879.8 times the total bet per session, 0.964 times the total bet per free spin played.

### 7.2 The Sparkle Wheel

**Trigger condition.** Every Firefly award that is not a Doorbell Panic award (`board.ts:918-921`).

**Trigger probability.** 1 in 207, identical to 7.1.

**What it awards.** One of three wedges, by weight (`WHEEL_WEIGHTS`, `freespins.ts:35-39`):

| Wedge | ID | Weight | Probability | Fleet-measured share |
|---|---|---:|---:|---:|
| We're Multiplying | `multiplying` | 40 | 40.0% | 39.96% |
| Moonlit Keepsake Trail | `keepsake_memory` | 35 | 35.0% | 34.72% |
| Iced Chai Wild Rain | `chai_back` | 25 | 25.0% | 25.32% |

`spinWheelLanding` (`freespins.ts:66-70`) additionally picks a sub-zone of 0, 1, or 2 uniformly. **The sub-zone is presentation only.** The physical wheel face shows three 120-degree wedges each split into three 40-degree landing zones so the pointer does not always stop in the same place; the sub-zone never changes the parent wedge's probability or its mechanics. The UI computes the stop angle from it at `board.ts:1966-1968`.

Four further `WheelWedge` values exist in the type (`doorbell_panic`, `treat_time_morning`, `treat_time_nighttime`, `keepsake_collection`) but are not on the wheel. They are reused as session modifiers by bonuses that enter directly.

**Player agency.** None. One click, pre-resolved outcome.

**Design intent.** Give the free-spin award a second beat, and give three genuinely different free-spin experiences without three separate trigger conditions.

**Measured RTP contribution.** The wheel is a router, not a payer. Its three wedges together are the 10.64% in 7.1.

### 7.3 Wedge 1: We're Multiplying

**Trigger condition.** Wheel lands on `multiplying`, or the UniGlee marathon plays its `were_multiplying` chapter.

**Trigger probability.** 40% of Firefly awards. Measured **1 in 517** paid spins.

**What it awards.** The Firefly ladder award, played as free spins with a marked multiplier wild rolled once per counted spin. Never on a cascade step, only on the opening result (`freespins.ts:76-83, 114-123`):

| Outcome | Probability | Reel it lands on |
|---|---:|---:|
| no marked wild | 15% | n/a |
| ×2 | 35% | 2 |
| ×3 | 30% | 3 |
| ×5 | 15% | 4 |
| ×10 | 5% | 5 |

The marked cell is Joey or Phoebe at 50/50, at a uniform row. It multiplies only lines that actually use it (`cascade.ts:298-306`), and it stacks with a handbag multiplier.

**Player agency.** None.

**Design intent.** The high-variance wedge. Reel placement inversely coupled to value means the ×10 is a genuine event rather than a routine payout, while the ×2 fires constantly and keeps the session feeling alive.

**Measured RTP contribution: 5.21%.** Mean win 1,077.5 times the total bet per session, and **1.973 times the total bet per free spin**, by far the highest per-spin value of any bonus in the game.

### 7.4 Wedge 2: Moonlit Keepsake Trail

**Trigger condition.** Wheel lands on `keepsake_memory`.

**Trigger probability.** 35% of Firefly awards. Measured **1 in 595** paid spins.

**What it awards.** A 12-card memory-match game, then a flat free-spin handoff. Constants at `keepsake-memory.ts:14-19`:

| Constant | Value |
|---|---:|
| `KEEPSAKE_MEMORY_CARD_COUNT` | 12 |
| `KEEPSAKE_MEMORY_PAIR_COUNT` | 6 |
| `KEEPSAKE_MEMORY_MAX_FAILS` | 2 |
| `KEEPSAKE_MEMORY_FREE_SPINS` | 40 |
| `KEEPSAKE_MEMORY_PREVIEW_MS` | 2,500 |
| `KEEPSAKE_MEMORY_MISMATCH_REVEAL_MS` | 900 |

Six distinct symbols are sampled without replacement from the 12 paying symbols, duplicated, and Fisher-Yates shuffled (`keepsake-memory.ts:32-51`). All 12 cards are face up during a 2,500ms preview, then turn down. The player picks two at a time. A match locks both face up and costs nothing. A mismatch costs one strike and reveals for 900ms. **Two strikes ends the bonus with zero.** Six pairs found awards exactly 40 free spins, played in `standard` mode with no wedge modifier at all (`board.ts:1908-1918`).

The state machine rejects invalid input with typed reasons rather than throwing: `preview`, `invalid_index`, `matched_card`, `same_card`, `resolving`, `ended` (`types.ts:66`).

**Player agency: this is the only bonus in the game with real skill in it, and the skill is memorisation.** The optimal strategy is exactly the optimal strategy for concentration with a 2-strike budget:

1. Memorise all 12 positions during the 2,500ms preview. A player who does this completes with zero strikes, guaranteed, every time.
2. Failing that, memorise every card revealed by a mismatch, because a mismatch reveals two cards for 900ms and is the game's only other information source.
3. Never pick a card you have already seen paired with an unknown, when a known pair is available.

With no memory at all, the first pick pair is a match with probability 1/11, and the odds of finding six pairs before two strikes are very poor. With perfect preview recall, success is certain. **That gap, zero spins versus 40 spins, is the largest skill-driven RTP swing in the game.**

**Design intent.** A change of pace: stop the reels, make the player do something with their attention, and reward it with the game's most generous flat award.

**Measured RTP contribution: 4.27%**, but read that against the player model. `scripts/sim-agent.ts` models a perfect-memory player who always completes. Real play sits below this, possibly far below. Mean session 40.00 spins, 0.637 times the total bet per free spin, the low per-spin value being the point: this wedge pays in volume, not in multipliers.

### 7.5 Wedge 3: Iced Chai Wild Rain

**Trigger condition.** Wheel lands on `chai_back`.

**Trigger probability.** 25% of Firefly awards. Measured **1 in 817** paid spins.

**What it awards.** The Firefly ladder award, played as free spins, with one opening-board storm. `convertChaiToWilds` (`freespins.ts:94-107`) converts **every** `chai` cell on the first round's opening board into `wild_chai`. Yield is whatever the board gave: roughly 4.5 to 5.0% per cell across 20 cells, so typically 0 to 2 wilds.

The storm fires **once, on round one only**, never on a later round (`freespins.ts:402`: `activateChaiStorm: rounds.length === 0`). The `chai_back` wedge ID is reused as a plain session carrier by Bold Chai Pump and Treat Jar free spins, both of which pass `allowChaiStorm: false` to suppress the conversion (`board.ts:1269, 1295`).

**Player agency.** None.

**Design intent.** The thematic wedge, and the deliberately quiet one. It gives the wheel a low-volatility outcome so the wheel itself has a spread.

**Measured RTP contribution: 1.15%**, the smallest of the three wedges by a wide margin. Mean win 376.4 times the total bet per session, 0.686 per free spin. A one-shot conversion of a 5% symbol on one board out of a 14-spin session is a small effect, and the measurement says so.

### 7.6 Keepsake Constellation

**Trigger condition.** Not on the wheel. It is one of the three middle chapters of the UniGlee marathon, always played exactly once per marathon (`uniglee.ts:19-23`, `uniglee-marathon.ts:56-66`).

**Trigger probability.** 1 per UniGlee capture, so **1 in 1,229** paid spins.

**What it awards.** One quarter of the marathon's initial award (10, 15, or 20 spins), played with a locked giant symbol rolled fresh **each round** (`rollKeepsakeZone`, `keepsake-constellation.ts:57-71`).

Zone weights, total 100 (`keepsake-constellation.ts:11-23`):

| Footprint | Weight | Probability | Cells covered |
|---|---:|---:|---:|
| no zone this round | 27 | 27% | 0 |
| 2 wide × 2 high | 19 | 19% | 4 |
| 2 wide × 3 high | 15 | 15% | 6 |
| 2 wide × 4 high | 11 | 11% | 8 |
| 3 wide × 2 high | 15 | 15% | 6 |
| 3 wide × 3 high | 8 | 8% | 9 |
| 3 wide × 4 high | 5 | 5% | 12 |

Placement: a 3-wide zone must start at reel index 1; a 2-wide zone starts at index 1 or 2, uniformly. Top row is uniform over the rows that fit. **Zones live only on reels 2 to 4.** Reel 1 and reel 5 are never covered, which keeps the line-start and line-completion reels honest.

Icon weights (`keepsake-constellation.ts:32-36`): the 12 paying symbols share 98 points equally, 8.167 each, and `wild_joey` and `wild_phoebe` take 1 point each. **A wild giant is 2% of icon selections.** Treats, blockers, and UniGlee are excluded by construction.

The rectangle is fixed for the whole round. The icon is not: if the giant participates in a winning line, it re-rolls to a **different** icon after that step (`cascade.ts:357-359`, `rollKeepsakeSymbol` excludes the previous value). Symbols cannot fall through the footprint; the rows above and below it are independent gravity wells (`cascadeColumnAroundKeepsake`, `cascade.ts:110-141`).

**Player agency.** None.

**Design intent.** Give the marathon a chapter with a completely different board silhouette, and give the wild giant (2%) a jackpot-shaped moment inside a bonus that is otherwise about volume.

**Measured RTP contribution: 1.79%**, being 24.0% of the UniGlee marathon's 7.47%. Measured over 4,000 marathons: mean 13.22 spins, mean win 21.34 times the total bet per chapter.

### 7.7 Treat Jar free spins

**Trigger condition.** A treat bag fills. Treats are collected from the **opening board only** of a base-game spin (`collectTreats`, `cascade.ts:48-57, 264`); treats arriving as cascade refills are not collected. Each of the three bags fills independently at `TREAT_JAR_CAP = 24` (`features.ts:19`).

**Trigger probability.** No constant, emergent from the strips. Expected treats per opening board, from the strip counts in section 3.2:

| Treat | Expected per spin | Bag cap | Completions per spin | Award |
|---|---:|---:|---:|---:|
| Chicken Comets | 0.4688 | 24 | 0.01954 | 1 spin |
| Salmon Stars | 0.3751 | 24 | 0.01563 | 2 spins |
| Bougie Bites | 0.1875 | 24 | 0.00781 | 3 spins |
| **Total** | **1.0314** | | **0.04298**, or 1 in 23.3 | |

Measured on the board: 1.020 treat symbols per opening board (blockers overwrite a few). Measured completion rate: **1 in 25.3**, lower than the 1 in 23.3 ceiling because cat pop-ins eat treats out of the jar before they can complete a bag (see 7.13).

**What it awards.** `TREAT_JAR_FREE_SPINS` (`features.ts:21-25`): chicken 1, salmon 2, bougie 3. Multiple bags can complete on one spin and the awards sum. Sessions run as `chai_back` with the storm suppressed (`board.ts:1290-1297`), which means the wedge modifier does nothing and these are plain free spins. Measured mean 1.72 spins per event, exactly matching the analytic 1.727.

`settleTreatJar` (`features.ts:115-127`) exists to resolve bags that were already over cap in a restored save, which matters because the cap was changed during the 2026-07 retune and persisted jars may hold pre-retune counts.

**Player agency.** None. But note the interaction: a fed cat pop-in consumes a treat, so pop-ins actively slow bag completion. There is no player control over either.

**Design intent.** A slow, always-visible progress bar underneath the spin loop, so that a session with no big win still visibly accumulates something.

**Measured RTP contribution: 4.32%.** By far the highest hit rate in the game at 1 in 25, and a modest 43.7 times the total bet per event. This is the drip feed.

### 7.8 Morning Treat Time

**Trigger condition.** A per-spin roll on a **separate RNG stream**, main board only, at the very end of the spin (`rollTreatTimeTrigger`, `treattime.ts:32-55`; called at `cascade.ts:367-369`). Suppressed inside every bonus by `allowTreatTimeBonus: false` and `spinArea: "secondary"`.

**Trigger probability.** `TREAT_TIME_TRIGGER_RATES.morning = 1/250` (`treattime.ts:12`). In the default `"either"` mode the single roll is partitioned: below 1/500 is nighttime, between 1/500 and 3/500 is morning, so morning holds a 1/250 slice. Measured **1 in 247**.

**What it awards.** `TREAT_TIME_SPIN_RANGES.morning = [5, 8]` (`treattime.ts:17`), so 5 to 8 free spins, uniform. Each round casts 0 to 4 treat-wilds onto unique cells of that round's opening board (`TREAT_TIME_WILD_RANGE`, `treattime.ts:21`; `castTreatTimeWilds`, `treattime.ts:74-97`). **In morning mode every treat is a Chicken Comet, so every cast wild is Phoebe** (`treatForMode`, `wildForTreat`, `treattime.ts:57-67`).

**Player agency.** None.

**Design intent.** Phoebe's warm-up. A short, frequent, low-ceremony bonus that is mostly there to make ordinary spinning feel less flat.

**Measured RTP contribution: 4.44%.** Mean 6.47 spins per session (analytic mean 6.5), 438.9 times the total bet per session, 1.697 per free spin. Note that despite being framed as the small one, it out-earns its nighttime sibling on total contribution purely on frequency.

### 7.9 Nighttime Treat Time

**Trigger condition.** Same roll as 7.8; nighttime takes the lower slice, so it wins any tie.

**Trigger probability.** `TREAT_TIME_TRIGGER_RATES.nighttime = 1/500` (`treattime.ts:13`). Measured **1 in 496**.

**What it awards.** 8 to 14 free spins, uniform (`treattime.ts:18`). Each round casts 0 to 4 treat-wilds, but the treat mix is the full spread (`treatForMode`, `treattime.ts:57-63`):

| Treat | Probability | Wild cast |
|---|---:|---|
| Chicken Comets | 45% | Phoebe |
| Salmon Stars | 35% | Phoebe |
| Bougie Bites | 20% | **Joey** |

So nighttime is the only Treat Time mode that puts Joey on the board.

**Player agency.** None.

**Design intent.** The rarer, longer, more valuable half of the pair, and the one that brings Joey into a bonus that is otherwise Phoebe's.

**Measured RTP contribution: 3.87%.** Mean 11.03 spins per session (analytic 11.0), 767.4 times the total bet per session, 1.740 per free spin.

Nighttime Treat Time is also one of the three UniGlee middle chapters, where it is entered by wedge ID rather than by roll. That in-marathon appearance is accounted inside the UniGlee 7.47%, not here.

### 7.10 Doorbell Panic

**Trigger condition.** A `doorbell` symbol on reel 1 and a `doorbell` symbol on reel 2 that both sit on a common payline (`findDoorbellTrigger`, `paylines.ts:95-98`). Because all 16 reel-1/reel-2 row pairs are covered by the line set (section 4.1), **any** doorbell pair triggers. Checked at the top of every cascade iteration, so a doorbell that slides into position during a cascade also triggers (`cascade.ts:289-292`).

**Trigger probability.** Analytic, opening board: `DOORBELL_REEL_ONE_RATE × DOORBELL_REEL_TWO_RATE` = (1/17)(1/30) = **1 in 510**. Including gravity re-pairing across cascade steps: measured 1 in 499 over 1,000,000 engine spins, **1 in 504** in the fleet.

**What it awards.** `rollDoorbellFreeSpins` (`cascade.ts:234-237`) returns `3 + floor(rng() × 4)`, so 3 to 6 spins uniformly, mean 4.5. Measured mean 4.49.

The session runs under the `doorbell_panic` wedge, whose modifier is the most aggressive board preload in the game (`panicStartingGrid`, `freespins.ts:146-168`): 3 to 6 cat wilds, each placed at a random payline's row on a random reel, alternating Joey and Phoebe, with up to 10 retries to avoid stacking them on the same cell. **This is the one mechanic that can put a wild on reel 1**, and when it does, that line's `matchSymbol` becomes `tumbler` (see 4.3).

Doorbell awards take precedence over the cascade ladder (section 5.7).

**Player agency.** None.

**Design intent.** Stranger danger. The cats bolt, and the panic is the payout. Mechanically it is the game's short-and-loud bonus: the fewest spins of any session, and the highest value per spin.

**Measured RTP contribution: 4.98%.** Mean 4.49 spins per session, 1,003.7 times the total bet per session, and **5.589 times the total bet per free spin**, roughly three times the next-highest per-spin figure. Four and a half spins with 3 to 6 preloaded wilds is a very dense board.

### 7.11 Bold Chai Pump

**Trigger condition.** A `chai_pump` pair on reels 1 and 2 on a common payline (`findBoldChaiTrigger`, `paylines.ts:101-103`), same detection as the doorbell. Blocker families are mutually exclusive per board: pump rolls only matter when both doorbell rolls missed (`selectBlockerFamily`, `reels.ts:163-180`).

**Trigger probability.** Analytic: (16/17)(29/30)(1/17)(1/30) = **1 in 561**. Measured 1 in 549.5 raw over 1,000,000 engine spins (gravity re-pairing again), and **1 in 577** in the fleet, because the harness and the UI both give UniGlee precedence and skip the pump on a capture spin (`sim-agent.ts:135-150`, `board.ts:886-893`).

**What it awards.** A 30-second rapid-tap minigame (`bold-chai-pump.ts`):

| Constant | Value |
|---|---:|
| `BOLD_CHAI_DURATION_MS` | 30,000 |
| `BOLD_CHAI_PUMPS_PER_CUP` | 12 |
| `BOLD_CHAI_FREE_SPINS_PER_CUP` | 3 |
| `BOLD_CHAI_CUP_RESET_MS` | 3,000 |

The clock starts on the **first accepted pump**, not on entry, so hesitation is free. Every 12 pumps completes a chai, awards 3 free spins, and enters a 3-second `resetting` phase during which pumps are rejected. **The reset counts against the same 30-second clock** (`bold-chai-pump.ts:58-60`, and the test at `bold-chai-pump.test.ts:45`). A partially filled cup at expiry awards nothing (`completeBoldChaiPump`, `bold-chai-pump.ts:114-123`).

Spins are played as a `chai_back` session with the storm suppressed, and only when the cascade ladder did not also award spins this spin (`board.ts:925-929`).

**Player agency: this is the game's only pure dexterity bonus, and it has a hard optimum.** The cycle cost is 12 pumps plus a 3,000ms lockout. At a tap rate of r pumps per second, one cup costs `12/r + 3` seconds and yields 3 free spins, so:

```
spins(r) = 3 × floor( 30 / (12/r + 3) )
```

| Tap rate | Seconds per cup | Cups in 30s | Free spins |
|---:|---:|---:|---:|
| 2 /s | 9.0 | 3 | 9 |
| 3 /s | 7.0 | 4 | 12 |
| 4 /s | 6.0 | 5 | 15 |
| 6 /s | 5.0 | 6 | 18 |
| 8 /s | 4.5 | 6 | 18 |
| 12 /s | 4.0 | 7 | 21 |
| infinite | 3.0 | 10 | 30 |

The optimal strategy is trivially "tap as fast as you can", but note the shape: the 3-second lockout is a hard floor that caps the bonus at 30 spins no matter how fast a player is, and returns are strongly diminishing past about 6 taps per second. The 3-second reset is doing the real balancing work here, not the pump count.

**Design intent.** Barista mode. A physical, silly, entirely non-reel interlude, deliberately capped so that a fast player and a normal player end up in the same neighbourhood.

**Measured RTP contribution: 1.93%**, under the harness's 6-taps-per-second model, which yields exactly 18 spins every time (`sim-agent.ts:71-80`, measured mean 17.97). A slower real player earns less. Mean 446.6 times the total bet per session, 0.621 per free spin.

### 7.12 Joey's Laundry Helper

**Trigger condition.** Not triggerable directly. It is **always act 1** of the UniGlee marathon (`uniglee.ts:133-138`, `buildUniGleeMarathonPlan`).

**Trigger probability.** 1 per UniGlee capture, so **1 in 1,229** paid spins.

**What it awards.** One quarter of the marathon's initial award, `baseLaundryAllocation` = `awardedSpins × 0.25` (`laundry.ts:18, 23-25`), so 10, 15, or 20 spins. Each round rolls two independent opening-grid effects (`rollJoeyLaundryEffect`, `laundry.ts:84-107`) under `DEFAULT_UNIGLEE_LAUNDRY_CONFIG` (`uniglee-marathon.ts:12-16`):

| Effect | Rate | What it does |
|---|---:|---|
| Sock drop | 0.25 | Fills **all four rows** of one reel chosen uniformly from reels 2, 3, 4 with `wild_joey` (`sockDropFor`, `laundry.ts:76-81`) |
| Paw strike | 0.18 | Places one `wild_joey` with a marked multiplier at a uniform cell on reels 2 to 4 |

Paw strike multiplier weights: ×2 at 60, ×3 at 30, ×5 at 10 (`uniglee-marathon.ts:15`).

Both roll every round, independently, so 4.5% of rounds get both. The effects are applied to the opening grid only; cascades proceed normally, and `laundry.ts` deliberately does not own any rate constant itself. They are injected by the marathon so the chapter cannot silently tune RTP on its own (`laundry.ts:5-7`).

Retriggers are explicitly zeroed inside the chapter loop (`freespins.ts:330-332`).

**Player agency.** None.

**Design intent.** Give Joey a chapter that looks like Joey: a whole column of him, dropped in like a sock out of a laundry basket. Mechanically it is the marathon's opener and the most predictable of the four chapters.

**Measured RTP contribution: 1.67%**, being 22.4% of the UniGlee marathon's 7.47%. Measured over 4,000 marathons: mean 13.22 spins, mean win 19.99 times the total bet, the lowest of the four chapters.

### 7.13 Phoebe's Lap Quest

**Trigger condition.** Not triggerable directly. It is **always act 5**, the additive sweetener, of the UniGlee marathon (`uniglee.ts:145-156`). It has no quarter allocation: `baseSpins: 0`, `isSweetener: true`.

**Trigger probability.** 1 per UniGlee capture, so **1 in 1,229** paid spins.

**What it awards.** A choose-one-of-three, then an open-ended run of sticky-wild rounds.

`createLapQuestChallenge` (`lap-quest.ts:61-65`) shuffles the three spots (`window_perch`, `blanket_nest`, `moonlit_cushion`) and picks one uniformly as the perfect spot. The player picks one. `LAP_QUEST_WILD_COUNTS` (`lap-quest.ts:27-30`):

| Outcome | Probability | Sticky Phoebe wilds |
|---|---:|---:|
| Perfect lap | 1/3 | 4 |
| Cozy lap | 2/3 | 2 |

Measured perfect-lap share over 400,000 draws: 33.37%.

Positions are chosen uniformly without replacement from all 20 cells (`chooseComfortWilds`, `lap-quest.ts:75-83`), which means **Lap Quest can place wilds on reel 1**, with the `matchSymbol = tumbler` consequence from 4.3. The wilds are `sticky: "lap_quest"` and are re-fixed after every cascade step, so they are the only symbols in the game that genuinely never leave the board.

In production the chapter is an **open-ended loop**, not a fixed spin count (`runLapQuestChapter` in `board.ts`): it plays one round, then keeps playing another round after each 900ms wait until the ledge timer ends the chapter. Joey arrives at a uniform time between 15 and 90 seconds. The player chooses one spot once for the whole chapter; each round re-rolls the comfort-wild positions while preserving that selection.

The timing model (`src/ui/lap-quest-ledge.ts`) owns a DOM interval that runs the grace period, the 5-second inactivity watchdog, and the Joey arrival clock. The engine owns only the round engine (`lap-quest.ts`): it rolls the choice, places sticky wilds, and runs the cascade. No coin-ladder is supplied; Lap Quest pays only what its cascade rounds pay.

**Player agency.** The choice is presented as a decision and is not one: the perfect spot is drawn uniformly and no information is exposed before the pick, so all three options are identical at 1/3. The genuine agency is petting: it resets the 5-second inactivity watchdog and therefore keeps the chapter running, which is worth real money because every extra second is another round. **Optimal strategy: pet continuously, every 4 seconds or faster, from the moment grace ends.** Doing nothing ends the chapter at 20 seconds; petting keeps it alive until Joey arrives, which averages 52.5 seconds.

**Design intent.** End the marathon on affection rather than on arithmetic. It is the only bonus whose length is set by the player continuing to touch the screen.

**Measured RTP contribution: 7.09%.** The five-act fleet played 1,628 Lap Quests and 36,052 Lap Quest rounds, averaging 22.14 rounds and 87.13 times the paid-spin total bet per chapter. The simulated player picks randomly and uniformly among the three offered spots, giving a 1-in-3 perfect lap. No cascade-cap or session-cap alarm fired.

### 7.14 The UniGlee marathon

**Trigger condition.** Three independent per-reel rolls, once per spin, on the main board only (`rollUniGleeCapture`, `uniglee.ts:46-52`; called at `cascade.ts:266` under `allowUniGlee && spinArea === "main"`). If more than one reel hits on the same spin, **the highest reel wins**, deterministically, so the tie goes to the rarer and larger award.

**Trigger probability.** `UNIGLEE_REEL_RATES` (`uniglee.ts:32-36`):

| Reel (1-based) | Reel index | Rate | Initial award |
|---:|---:|---:|---:|
| 3 | 2 | 1/2,500 | 40 spins |
| 4 | 3 | 1/4,000 | 60 spins |
| 5 | 4 | 1/7,500 | 80 spins |

`UNIGLEE_ACTIVE_RATE` is their sum, 0.000783333, which is **1 in 1,276.6** (`uniglee.ts:38`). Measured: **1 in 1,229** in the fleet, 1 in 1,221 and 1 in 1,291 on independent engine runs, 1 in 1,370 in the seeded oracle. Award is `reel × 20` (`uniglee.ts:94`), and the reel-rate weighting gives a mean initial award of 53.19 spins; measured 52.90.

On capture, `placeUniGleeTrigger` (`uniglee.ts:75-97`) picks a random payline, overwrites reels 1 through *reel-1* on that line with one randomly chosen paying symbol, and puts the UniGlee symbol on the capturing reel. The prefix is made line-valid deliberately, so the capture reads as a genuine near-line and not as a decorative scatter. The UniGlee symbol itself never pays.

**What it awards.** A five-act marathon (`buildUniGleeMarathonPlan`, `uniglee.ts:122-159`):

1. **Joey's Laundry Helper**, always first.
2 to 4. **We're Multiplying**, **Keepsake Collection**, **Nighttime Treat Time**, one each, in a seeded Fisher-Yates order.
5. **Phoebe's Lap Quest**, always last, additive sweetener, no allocation.

Acts 1 to 4 each receive exactly one quarter of the initial award:

| Initial award | Capturing reel | Each of acts 1 to 4 | Total acts 1 to 4 |
|---:|---:|---:|---:|
| 40 | 3 | 10 | 40 |
| 60 | 4 | 15 | 60 |
| 80 | 5 | 20 | 80 |

`UNIGLEE_CHAPTER_SPIN_CAP = 500` per act (`uniglee-marathon.ts:18`) is a deterministic guard that normal play never approaches. Zero capped sessions in 2,000,000 spins.

**Player agency.** Only inside act 5, and only the petting (see 7.13).

**Design intent.** The legend. One event that is rare enough to be a story and long enough to be an experience, structured as five distinct chapters so that a 53-spin marathon does not feel like 53 identical spins.

**Measured RTP contribution: 7.47%** for acts 1 to 4, the second-largest single contributor. Mean 53.61 spins played, 3,670.6 times the total bet per capture. Chapter split, measured over 4,000 marathons:

| Chapter | Mean spins | Mean win (× total bet) | Share of marathon | Implied RTP |
|---|---:|---:|---:|---:|
| We're Multiplying | 13.22 | 24.93 | 28.0% | 2.09% |
| Nighttime Treat Time | 13.22 | 22.78 | 25.6% | 1.91% |
| Keepsake Collection | 13.22 | 21.34 | 24.0% | 1.79% |
| Joey's Laundry Helper | 13.22 | 19.99 | 22.4% | 1.67% |

**But 7.47% understates it badly, and this is the single most important accounting point in the document.** A UniGlee capture also seeds a five-item specialty queue and sets `doubleSparkleActive`, so the capturing spin itself cascades to a mean depth of 6.97 and awards a **doubled** Firefly ladder award 73.3% of the time. Those doubled sessions land in the Firefly bucket, not the UniGlee bucket.

Measured directly over 1,000,000 paid spins by re-running the harness with the Firefly bucket split by origin:

| Component | RTP |
|---|---:|
| UniGlee marathon, acts 1 to 4 | 7.486% |
| Firefly sessions born on a UniGlee spin | 2.738% |
| **Total attributable to a UniGlee capture** | **10.224%** |
| Firefly sessions from ordinary spins | 7.990% |

So a UniGlee capture is worth **10.2 points of RTP at 1 in about 1,229**, not 7.5, and it is not the second-largest contributor: it is the largest by a clear margin. Phoebe's Lap Quest, unmeasured, sits on top of that.

### 7.15 Cat pop-ins (not a bonus, but in the table)

**Trigger condition.** A per-spin roll after the cascade loop (`rollCatVisit`, `features.ts:150-179`).

**Trigger probability.** `BASE_POP_IN_RATE = 1/32` (`features.ts:144`), **doubled to 1/16 after 15 consecutive spins with no visit** (`features.ts:155`). This pity timer is the reason the measured rate is higher than the base constant: oracle 1 in 32.3 at a fixed `spinsSincePopIn` of 10, fleet **1 in 22.1** with the pity timer running live.

**What it awards.** Nothing, in coins. The cat split is 60% Phoebe, 40% Joey (`features.ts:159`). Canon rule S7 is enforced in code: **Phoebe is fed by any treat in the jar, Joey only by Bougie Bites** (`features.ts:163-178`). A fed visit sets an `assist` (`sparkle_sort` for Phoebe, `drop_in` for Joey) and consumes one treat; Phoebe eats the rarest available first, bougie then salmon then chicken (`consumeForVisit`, `features.ts:182-194`). An unfed visit gets `shuffle_consolation` and a quip from a separate unfed pool.

The `assist` field is metadata. **No engine code reads it.** The assists are UI-layer follow-up work per the module header at `features.ts:5-8`.

**Player agency.** None directly. Indirectly, holding treats in the jar converts pop-ins from unfed to fed, which currently changes only presentation and costs a treat that would otherwise have advanced a bag toward free spins. **On today's build, feeding a cat is strictly negative EV.** That is a bug in intent, not in code.

**Design intent.** The heart of the thing. Two cats show up, say something, and leave. The whole game is named after them.

**Measured RTP contribution: 0.00%**, no direct payout. But 90,528 visits over 2,000,000 spins consumed treats and measurably suppressed the Treat Jar hit rate from an analytic 1 in 23.3 to a measured 1 in 25.3, which is roughly 0.4 points of RTP moved out of the Treat Jar bucket and into nothing.

---

## 8. The free-spin ladder and the retrigger policy

### 8.1 The ladder

```
export const FREE_SPIN_LADDER: Record<number, number> = {
  6: 6, 7: 9, 8: 15, 9: 25, 10: 40, 11: 60,
};
```
(`src/engine/types.ts:221-223`)

Lookup is "highest tier at or below the depth reached" (`freeSpinsForCascades`, `cascade.ts:60-66`), so depth 11 and depth 17 both award 60. There is no tier above 11.

| Cascade depth | Award | Measured rate (1,000,000 base spins) | Award if the spin was a UniGlee capture |
|---:|---:|---|---:|
| 0 to 5 | 0 | n/a | 0 |
| 6 | 6 | 1 in 383 | 12 |
| 7 | 9 | 1 in 887 | 18 |
| 8 | 15 | 1 in 1,736 | 30 |
| 9 | 25 | 1 in 3,636 | 50 |
| 10 | 40 | 1 in 6,623 | 80 |
| 11 or more | 60 | 1 in 7,752 | 120 |

Combined entry rate, all tiers: 1 in 205 from ordinary spins, 1 in 204 including UniGlee-born awards. Mean award 13.50 spins.

The ladder is superlinear on purpose: the step from 10 to 11 cascades is worth 20 more spins, while the step from 6 to 7 is worth 3. It is what makes a deep chain feel like it accelerated rather than merely continued.

### 8.2 The 2026-07 retune: entry moved from 4 cascades to 6

The ladder's own source comment records it (`types.ts:217-220`), and the oracle records the effect (`simulation.test.ts:81-82`): **the Firefly free-spin trigger moved from roughly 1 in 35 to roughly 1 in 150.**

The arithmetic is visible in the measured depth distribution in section 5.5. Entry at 4 would have caught depths 4 and 5 as well:

| Entry threshold | Qualifying spins per 1,000,000 | Trigger rate |
|---:|---:|---|
| 4 cascades | 28,028 | 1 in 35.7 |
| 5 cascades | 11,111 | 1 in 90.0 |
| **6 cascades (shipped)** | **4,868** | **1 in 205** |
| 7 cascades | 2,259 | 1 in 443 |

Moving the threshold by two steps cut the trigger frequency by a factor of 5.75. The Firefly layer carries 10.64 points of RTP at a measured 1 in 207. Even allowing that entry at 4 would have pulled the mean award down (the extra entries all sit at the bottom of the ladder), a 5.75-fold frequency increase puts the Firefly layer alone somewhere between 30 and 60 points of RTP, before any other bonus in the game. **That is the whole reason for the retune, and it is the clearest illustration in this codebase of why cascading games are structurally dangerous to tune: the trigger is a tail statistic, so a one-step change in the threshold is a multiplicative change in the frequency.**

Also note what the retune did *not* do: it did not change the award values. 6, 9, 15, 25, 40, 60 are the same numbers under a rarer door. That was the right call, because the awards are what the ladder graphic promises the player, and the threshold is invisible.

### 8.3 The engine-wide retrigger block

**Retriggers are blocked in every bonus session in the game.** A cascade inside a free spin still computes a ladder award; that award is then discarded.

Enforcement points, all of them:

| Location | Mechanism |
|---|---|
| `freespins.ts:406-408` | `runFreeSpinSession` pushes `{ ...round, freeSpinsAwarded: 0 }`. Applies to every wheel wedge, Doorbell Panic, both Treat Times, Treat Jar spins, Bold Chai spins, and the `standard` Keepsake handoff |
| `freespins.ts:330-332` | `runJoeyLaundrySession` does the same for act 1 of the marathon |
| `freespins.ts:397, 399` | `maxTotalSpins` guard: the loop is `while (remaining > 0 && rounds.length < maxTotalSpins)`. `retriggerSpins` and `retriggers` are initialised to 0 and never incremented |
| `freespins.ts:353-357` | `FreeSpinSessionOptions.allowRetriggers` is retained, marked `@deprecated`, and documented as having no effect. Legacy callers still compile |
| `uniglee-marathon.ts:18, 55, 65` | `UNIGLEE_CHAPTER_SPIN_CAP = 500` as a second, structural belt |

There is a matching structural block on *nested* bonuses, which is a different thing and equally important. Every bonus round calls `spin()` with `allowDoorbells: false`, `includeBoldChaiPump: false`, `spinArea: "secondary"`, `allowTreatTimeBonus: false` (`freespins.ts:192-203`). UniGlee is blocked by the `spinArea === "main"` condition at `cascade.ts:266`, and the Laundry and Lap Quest rounds pass `allowUniGlee: false` explicitly as well. **No bonus can trigger any other bonus.** The only cross-bonus flow in the game is UniGlee's marathon plan, which is a scripted sequence, not a trigger.

The tests treat this as an invariant, not a behaviour: `freespins.test.ts:194` is titled "blocks retriggers across every wedge (engine-wide invariant)", and `sim-agent.ts:48-54` keeps a 5,000-round session cap purely so that a nonzero `cappedSessions` count would prove the block regressed. Fleet result: **zero capped sessions across 2,000,000 paid spins**.

### 8.4 Why unbounded retriggers are dangerous in a cascading game

In a conventional slot, a retrigger is a bounded rarity: you need three scatters in a window, the probability is fixed and independent per spin, and the expected session length is a convergent geometric series. If a retrigger fires with probability p per free spin and awards n more spins, the session length multiplier is `1/(1 - n·p)`, which is finite and stable as long as `n·p < 1`.

A cascading game breaks two of those assumptions at once.

**First, the trigger is not independent of the modifier.** Every bonus in this game exists to make the board denser: preloaded wilds, converted wilds, giant symbols, marked multipliers, sock drops. Those same modifications raise the cascade depth distribution, which is exactly what the ladder measures. So `p` inside a bonus is strictly higher than `p` in the base game, and by an amount that is different for every wedge. The very thing that makes a bonus feel good makes it more likely to extend itself.

**Second, the trigger is a tail statistic, so `p` is extremely sensitive.** Section 8.2 measured it: a one-step threshold change moved the base-game rate by a factor of 2.3, and a two-step change by 5.75. Any modifier that shifts the depth distribution by even one step shifts the retrigger rate by roughly that factor. You cannot reason about `n·p < 1` when `p` moves multiplicatively in response to design decisions you make for feel.

Put those together and you get a positive feedback loop with a poorly characterised gain. The failure mode is not "sessions run a bit long". It is a session that does not terminate, or terminates after tens of thousands of spins, in a browser tab, with a `steps` array holding a full grid clone per step.

This engine's response is the blunt one, and it is the right one for a game that has to be safe by construction rather than safe by calibration: **the ladder award is computed, recorded, and thrown away inside every bonus.** No probability analysis required, no per-wedge tuning, no residual risk. The cost is that a bonus can never surprise you by extending itself, and the design compensates by making bonuses generous up front instead.

If you rebuild this and you want retriggers, cap them absolutely: a hard maximum session length enforced in the session loop, not a probabilistic argument. `maxTotalSpins` and `UNIGLEE_CHAPTER_SPIN_CAP` are already there for exactly that.

---

## 9. Economy and progression

All of `src/engine/economy.ts`, 72 lines, plus two UI-side rules noted where they occur.

### 9.1 Constants

| Constant | Value | Source |
|---|---:|---|
| `STARTING_BALANCE` | 500 coins | `economy.ts:10` |
| `BUST_PROOF_REFILL` | 500 coins | `economy.ts:11` |
| `LINES` | 40 | `economy.ts:9` |
| `BET_LEVELS` | 1, 2, 5, 10, 25, 50 | `economy.ts:5` |
| `LEVEL_6_UNLOCK_PLAYER_LEVEL` | 12 | `economy.ts:8` |

Currency is Glee-coins. XP is Chai Sparks. They are separate and never convert.

### 9.2 The wager ladder

`betPerLine(bet) = bet / LINES` (`economy.ts:18-20`). Total bet is the ladder value; the per-line bet is that divided by 40.

| Bet level | Total bet | Per-line bet | Available from |
|---:|---:|---:|---|
| 1 | 1 | 0.025 | start |
| 2 | 2 | 0.050 | start |
| 3 | 5 | 0.125 | start |
| 4 | 10 | 0.250 | start |
| 5 | 25 | 0.625 | start |
| 6 | 50 | 1.250 | **player level 12** |

`availableBetLevels(playerLevel)` (`economy.ts:14-16`) returns the first five entries until level 12, then all six. That is the entire unlock mechanic: one gate, one condition, no other progression-locked content in the game.

Note that all measurements in this document use `betPerLine = 1`, which corresponds to a total bet of 40. RTP is scale-invariant (section 2.3), so the figures transfer to any bet level.

### 9.3 Chai Sparks and the XP curve

```
sparksForSpin(bet) = max(1, round(bet / 25))       // economy.ts:23-25
levelThreshold(level) = (level - 1) * 500          // economy.ts:34-36
levelForXp(xp): highest level whose threshold xp meets   // economy.ts:29-32
```

The curve is linear, not exponential: every level costs exactly 500 Sparks.

| Bet | Sparks per spin | Spins per level |
|---:|---:|---:|
| 1 | 1 | 500 |
| 2 | 1 | 500 |
| 5 | 1 | 500 |
| 10 | 1 | 500 |
| 25 | 1 | 500 |
| 50 | 2 | 250 |

So the bet ladder buys almost nothing in progression speed: only the top bet level doubles the rate, and it is the one that is locked behind level 12. Reaching level 12 takes 5,500 cumulative Sparks, which at one per spin is 5,500 paid spins.

`applyBonusSpinXp(state, totalSpins)` (`economy.ts:64-72`) grants Sparks for **every spin played inside a bonus session**, at the same per-spin rate, and returns `{ levelBefore, levelAfter }` so the caller can fire a celebration. It mutates `state.xp` in place, which is the one impure function in the engine and is documented as such. Bonus spins are therefore a meaningful accelerator: the fleet played 620,639 free spins against 2,000,000 paid spins, so bonus play adds about 31% to progression speed.

**A UI-side rule that belongs in the economy.** On each level crossed, `board.ts:869-878` awards `200 × newLevel` coins, looping so that a two-level jump pays twice, independently. That is a real coin faucet outside `economy.ts` and outside every RTP measurement in this document. At level 12 a single level-up pays 2,400 coins, roughly 60 times the default total bet.

### 9.4 The bust-proof refill invariant

```
export function applyBustProofRefill(balance, currentBet) {
  if (balance >= currentBet) return { balance, refilled: false };
  return { balance: balance + BUST_PROOF_REFILL, refilled: true };
}
```
(`economy.ts:50-53`)

Called at the top of every spin, before the bet is deducted (`board.ts:823-825`), so the check is "can this player afford the spin they are about to make". If not, 500 coins arrive and the UI says AskJamie found coins under the couch.

**The invariant: the balance can never strand below one bet.** The test at `economy.test.ts:17` asserts it directly. There is no cooldown, no daily cap, no counter, and no limit on how many times it can fire. That is deliberate. This is a birthday gift, not a monetised product, and a game-over screen would be a design failure rather than a design feature.

Two consequences to be aware of if you rebuild:

- **The refill is not accounted in RTP.** `scripts/sim-agent.ts` tracks `totalBet` and `totalWin` and never models a balance at all, which is correct for an RTP measurement and means the refill is invisible to it. A player's *effective* return, counting refills, is unbounded.
- **The refill is bet-relative.** A player at bet level 6 who busts gets 500 coins, which is 10 spins. A player at bet level 1 gets 500 spins. The gift is 50 times more generous at the bottom of the ladder, which is probably the right direction but is worth choosing deliberately rather than inheriting.

---

## 10. The RTP model, told honestly

### 10.1 The layered model

RTP is not one number produced by one system. It is two layers with very different shapes.

| Layer | What it is | Measured | Share of total |
|---|---|---:|---:|
| Base game | line wins on paid spins, cascades included, no bonus sessions | **61.05%** | 61.9% |
| Bonus layer | every free spin, marathon chapter, and minigame award | **44.74%** | 42.3% |
| **Total** | | **105.79%** | |

The base layer is high-frequency and low-variance: it pays on 31.5% of spins and its distribution is bounded by the paytable. The bonus layer is the opposite: seven distinct sources, hit rates from 1 in 25 down to 1 in 1,229, and a per-seed standard deviation that dominates the total.

This split is deliberate. The oracle gates the base layer at roughly 61% precisely so that the base game is boring in a measurable way, and every point of excitement is bought with a bonus that can be individually measured and individually retuned. It also means the two layers can be tested by two completely different tools, which is section 10.2 and 10.3.

### 10.2 The oracle: `src/engine/simulation.test.ts`

**What it is.** 102 lines. One function, `simulate()`, that runs 200,000 spins on seed `20260717` through `spin()` directly, and six `it()` blocks asserting frequency bands on the result. It runs inside the ordinary vitest suite (`npx vitest run src`).

**What it gates.** Six event frequencies from the design spec's §4 table. Not RTP alone: RTP is one of six.

| Gate | Band | Actual (verified 2026-08-09) | Source |
|---|---|---:|---|
| Base RTP | 0.599 to 0.619 | **61.08%** | `simulation.test.ts:71-74` |
| Any-win rate | 1 in 2.5 to 1 in 3.4 | **1 in 3.15** | `:76-79` |
| Free-spin trigger | 1 in 120 to 1 in 188 | **1 in 151** | `:83-86` |
| 8-plus cascade | 1 in 450 to 1 in 1,800 | **1 in 980** | `:88-91` |
| UniGlee capture | 1 in 850 to 1 in 2,000 | **1 in 1,370** | `:93-96` |
| Cat pop-in | 1 in 23 to 1 in 40 | **1 in 32.3** | `:98-101` |

All six green. Reproduce with:

```
npx vitest run src/engine/simulation.test.ts --reporter=verbose
```

The test titles interpolate the actual measured value, so a failure message tells you the number, not just that a number was wrong.

**What it deliberately does not do.** It calls `spin()` with a permanently stocked treat jar (`{ chicken: 6, salmon: 6, bougie: 6 }`) and a fixed `spinsSincePopIn: 10`, so pop-in pity never engages and treat depletion never happens. It never runs a free spin, never spins the wheel, never plays a marathon. **The oracle measures the base game only.** Every historical confusion about this project's RTP traces to reading an oracle number as a whole-game number.

**The design decision worth copying: this test was written to fail.** Its header says so:

> These tests are EXPECTED TO FAIL until reel strips, wild stacking, UniGlee gating, and paytable weights are simulation-tuned. That is the point: do not delete, skip, weaken, or widen these gates to get to green.

The bands were written first, from the design intent, before the strips existed. The engine was then built until the bands went green. That inverts the usual order, where a test is written after the code and therefore encodes whatever the code happened to do. It also creates an explicit, in-source prohibition on the standard failure mode of numeric tests, which is quietly widening the band until the build is green.

There is one escape hatch, `SKIP_ORACLE=1` (`simulation.test.ts:58-60`), used only by the Pages deploy job so that a docs commit does not block a deploy on a 200,000-spin run. A separate non-blocking CI job runs the oracle on every push so the red/green status stays visible. Local runs and validation loops always run it.

### 10.3 The full-game harness: `scripts/sim-agent.ts`

**What it does differently.** 258 lines. It plays paid spins the way `src/ui/board.ts` `runSpin()` plays them, through the same engine entry points, and then actually **runs every bonus session** the spin unlocks. It mirrors the UI's precedence order, its treat-jar settlement, its cat-visit consumption, and its rule that Bold Chai spins only run when the ladder did not also award spins.

```
npx tsx scripts/sim-agent.ts <agentId> <seed> <paidSpins>
```

It prints one JSON report to stdout: totals, base and total RTP, and a per-feature tally of `{ encountered, played, freeSpinsPlayed, win, cappedSessions }`.

Structural differences from the oracle:

| | Oracle | Harness |
|---|---|---|
| Bonus sessions | never played | all played |
| Treat jar | permanently stocked, never depletes | starts empty, fills and depletes live |
| Pity timer | frozen at 10 dry spins | live |
| Treat Time | not enabled (no `treatTimeRng`) | enabled |
| RNG structure | one stream through 200,000 spins | root stream derives a per-spin seed, matching production |
| Session cap | n/a | 5,000 rounds, counted not silenced |

That last row is a nice piece of defensive engineering: the cap exists only so that a nonzero `cappedSessions` would prove the retrigger block regressed. It has never fired.

**Player-model assumptions.** Three bonuses need a player. The harness prints all three assumptions in every report.

| Bonus | Model | Source | Effect |
|---|---|---|---|
| Bold Chai Pump | steady 6 pumps per second for the full 30-second window, yielding exactly 18 free spins every time | `sim-agent.ts:71-80` | A real player at 3 taps per second gets 12 spins, a third less |
| Moonlit Keepsake Trail | perfect memory: always completes all six pairs, always collects the flat 40-spin handoff | `sim-agent.ts:182-186` | A real player who fails on two strikes gets **zero**. This wedge is 35% of all Firefly awards |
| Phoebe's Lap Quest | random-uniform choice among three offered spots; pets often enough to avoid inactivity until Joey arrives | `simulateLapQuest` | 1-in-3 perfect lap; engaged-petting duration |

**So 105.79% belongs to this stated mixed player model, not to every possible player.** No realistic-play variant exists for Bold Chai or Keepsake Trail. That gap is open as decision D8.

One further omission pushes a player's effective return **up**: level-up coin rewards are not modelled. `200 × level` per level crossed is a UI-side faucet outside every RTP figure here (section 9.3).

### 10.4 Measured results

**Fleet:** 40 seeds × 50,000 paid spins = **2,000,000 paid spins**, `betPerLine = 1`, total bet 80,000,000 coins. Verified 2026-08-11.

```
seq 1 40 | xargs -P4 -I{} sh -c \
  'pnpm exec tsx scripts/sim-agent.ts a{} {} 50000 > seed-{}.json'
```

| Measure | Value |
|---|---:|
| Total RTP | **105.79%** |
| 95% confidence interval | 104.82% to 106.76% |
| Per-seed standard deviation | 3.12 points |
| Per-seed span | 100.53% to 114.00% |
| Seeds inside the documented 95% to 98% band | **0 of 40** |
| Base layer | 61.05% |
| Bonus layer | 44.74% |
| Capped sessions | **0** |
| Cascade-cap activations | **0** |
| Bonus rounds played | 656,511 |

Per-feature, same fleet:

| Feature | Sessions | Hit rate | Mean win (× total bet) | Mean spins | Win per bonus spin | RTP contribution |
|---|---:|---|---:|---:|---:|---:|
| Firefly free spins (all wedges) | 9,673 | 1 in 207 | 879.2 | 22.81 | 0.964 | **10.63%** |
| UniGlee marathon (acts 1 to 4) | 1,628 | 1 in 1,229 | 3,670.6 | 53.61 | 1.712 | **7.47%** |
| Phoebe's Lap Quest | 1,628 | 1 in 1,229 | 3,485.2 | 22.14 | 3.935 | **7.09%** |
| We're Multiplying wedge | 3,867 | 1 in 517 | 1,076.1 | 13.64 | 1.972 | 5.20% |
| Doorbell Panic | 3,971 | 1 in 504 | 1,004.0 | 4.49 | 5.590 | 4.98% |
| Morning Treat Time | 8,093 | 1 in 247 | 439.1 | 6.47 | 1.697 | 4.44% |
| Treat Jar free spins | 79,014 | 1 in 25 | 43.7 | 1.72 | 0.636 | 4.32% |
| Moonlit Keepsake Trail wedge | 3,355 | 1 in 596 | 1,019.3 | 40.00 | 0.637 | 4.27% |
| Nighttime Treat Time | 4,032 | 1 in 496 | 767.6 | 11.02 | 1.741 | 3.87% |
| Bold Chai Pump | 3,464 | 1 in 577 | 446.6 | 17.97 | 0.621 | 1.93% |
| Iced Chai Wild Rain wedge | 2,451 | 1 in 816 | 376.6 | 13.73 | 0.685 | 1.15% |
| Cat pop-ins | 90,528 | 1 in 22 | 0 | 0 | n/a | 0.00% |

The three wedge rows are components of the Firefly row, not additions to it.

**The correct attribution for UniGlee is 10.22 points, not 7.47** (section 7.14). A capture also doubles the Firefly award on the capturing spin, and those doubled sessions are counted in the Firefly row. Measured by splitting the Firefly bucket by origin over 1,000,000 paid spins: 7.486% marathon + 2.738% doubled Firefly = 10.224% attributable to a UniGlee capture, versus 7.990% for all ordinary Firefly sessions combined.

### 10.5 The convergence problem

This is the most transferable engineering lesson in the document, so it gets stated plainly and then worked out.

**The observations.** Three measurements of the same engine:

| Sample | Seeds | Paid spins | Reported RTP |
|---|---:|---:|---:|
| First reading | 7 | 350,000 | 95.66% |
| Second reading | 7 (different) | 350,000 | 97.56% |
| Prior four-act reading | 40 | 2,000,000 | **98.70%** |
| Corrected five-act reading | 40 | 2,000,000 | **105.79%** |

The first two look like confirmations of a 95% to 98% band. They are not confirmations of anything. The 98.70% reading had adequate sample size but an incomplete harness: Lap Quest was absent. The 105.79% reading uses the same seeds and paid-spin count with all five acts.

**The arithmetic.** Per-seed standard deviation across the 40-seed fleet is **2.49 points**. The standard error of the mean at n seeds is `2.49 / sqrt(n)`, and the 95% confidence interval is `± 1.96 × se`:

| Seeds | Paid spins | Standard error | 95% CI half-width | CI width |
|---:|---:|---:|---:|---:|
| 5 | 250,000 | 1.115 | 2.19 pts | 4.37 pts |
| **7** | **350,000** | **0.943** | **1.85 pts** | **3.70 pts** |
| 10 | 500,000 | 0.789 | 1.55 pts | 3.09 pts |
| 20 | 1,000,000 | 0.558 | 1.09 pts | 2.19 pts |
| **40** | **2,000,000** | **0.394** | **0.77 pts** | **1.55 pts** |
| 95 | 4,750,000 | 0.256 | 0.50 pts | 1.00 pts |
| 160 | 8,000,000 | 0.197 | 0.39 pts | 0.77 pts |

**The documented band is 3 points wide. A seven-seed sample produces a confidence interval 3.70 points wide.** The measurement is wider than the thing it is supposed to test. It cannot come back "in band" or "out of band" in any meaningful sense, because it cannot distinguish 95% from 98%. Both seven-seed readings were consistent with a true value anywhere from about 94% to about 99.5%.

You need roughly **11 seeds (550,000 spins) to resolve a 3-point band at all**, and roughly **95 seeds (4,750,000 spins) to pin the figure to ±0.5 points**. The 40-seed fleet lands at ±0.77, which is enough to say the answer is above 98% and not enough to say whether it is 98.7% or 99.3%.

Here is the same instability shown directly, using contiguous seven-seed windows from the prior four-act 40-seed fleet. These rows are retained as historical sample-size evidence, not as the current full-game result:

| Window | RTP |
|---|---:|
| seeds 1 to 7 | 98.45% |
| seeds 8 to 14 | 99.76% |
| seeds 15 to 21 | 98.00% |
| seeds 34 to 40 | 99.48% |
| seeds 1 to 10 | 99.09% |
| seeds 1 to 20 | 98.96% |
| **seeds 1 to 40** | **98.70%** |

A 1.76-point spread between adjacent seven-seed windows of the same engine. Nothing changed but the seed.

**Why: the distribution is dominated by one rare fat-tailed event.**

UniGlee arrives at 1 in 1,229 and carries 10.22 points of RTP (7.47 marathon plus 2.74 doubled Firefly). Work it through for one 50,000-spin seed:

```
expected arrivals   = 50,000 / 1,229          = 40.7
Poisson sd          = sqrt(40.7)              = 6.38 arrivals
relative sd         = 6.38 / 40.7             = 15.7%
RTP sd from arrival count alone
                    = 10.22 pts × 15.7%       = 1.60 points
share of total variance
                    = (1.60 / 2.49)²          = 41%
```

**Forty-one percent of the per-seed RTP variance comes from nothing but how many UniGlees happened to show up.** Not from how they paid, not from the base game, not from any other bonus: purely from the arrival count of a single event that occurs about forty times in fifty thousand spins.

The measured decomposition agrees. Across the fleet, UniGlee's own per-seed RTP contribution has mean 7.47 and sd 1.46, and the correlation between a seed's UniGlee count and its total RTP is **+0.501**. Everything-except-UniGlee has a per-seed sd of 2.05, so UniGlee is not the whole story, but it is the single largest identifiable term and it is the one that makes small samples useless.

Payout variance within an event compounds it. The marathon's award depends on which reel captured (40, 60, or 80 spins at very different rates), and each chapter's win is itself a heavy-tailed cascade sum. That is why the measured UniGlee sd of 1.46 exceeds the 1.17 points you would get from marathon arrivals alone.

**The general lesson.** In any game whose RTP is materially carried by an event rarer than about 1 in 1,000, the sample size required to measure RTP is set by the arrival count of that event, not by the spin count. The rule of thumb:

```
required arrivals of the rare event ≈ ( z × contribution / tolerance )²
```

For UniGlee at 10.22 points, to pin its contribution to ±0.5 points at 95% confidence:

```
n = (1.96 × 10.22 / 0.5)² = 1,605 arrivals ≈ 1,605 × 1,229 ≈ 1,970,000 paid spins
```

Which is, to within noise, exactly the 2,000,000-spin fleet. That is not a coincidence. **The fleet size is set by UniGlee and nothing else.** If you added a bonus at 1 in 10,000 carrying 5 points, the required fleet would jump to roughly 3.8 million spins overnight, and every RTP number you had previously published would silently become under-powered.

Three practical rules follow, and they are the ones to carry to any other project:

1. **Report the confidence interval, always, and the per-seed standard deviation with it.** A bare RTP number cannot be checked by anyone. Three successive figures went unchallenged in this project precisely because none of them carried an interval.
2. **Size the fleet from the rarest material contributor, not from a round number of spins.** Compute the required arrival count first, then divide by the hit rate.
3. **Re-run the whole fleet after any change to a rare bonus.** A change to a 1-in-1,229 event cannot be validated by a 350,000-spin run, no matter how confident the run looks.

---

## 11. How to rebuild this

### 11.1 Implementation order

Build in this order. Each step is testable before the next one exists, and each one's output is the previous one's input.

| # | Step | Done when |
|---:|---|---|
| 1 | `rng.ts`. mulberry32 plus a seeded-determinism test | Two generators on the same seed produce identical sequences |
| 2 | `types.ts`. `Cell`, `Grid`, `LineWin`, `CascadeStep`, `SpinResult`, `FREE_SPIN_LADDER` | It compiles and nothing imports the DOM |
| 3 | `paylines.ts`. The 40 lines, `PAYTABLE`, `PAYOUT_SCALE = 1.0` for now, `evaluateLines` | Hand-computed grids produce exactly the expected `LineWin[]` |
| 4 | `reels.ts`. Strip construction, window sampling, `cascadeColumn` | Strip composition matches your intended table; gravity moves survivors down and fills from the top |
| 5 | `cascade.ts` core. Evaluate, remove, refill, repeat, count depth, stop on a dead board | Every spin terminates; the last step always has zero wins |
| 6 | **Write the oracle now, before tuning anything.** Six bands from your design intent, and let it fail | It fails, loudly, and you have not touched the bands |
| 7 | Tune strip counts and `PAYOUT_SCALE` until the base RTP band and the any-win band go green | Both green on a fixed seed |
| 8 | The ladder and specialty queue. Add the free-spin trigger and the specialty wilds | The free-spin and 8-plus-cascade bands go green |
| 9 | `economy.ts`. Bet ladder, XP, bust-proof refill | The refill invariant test passes |
| 10 | `features.ts`. Treat jar, cat pop-ins, pity timer | The cat-visit band goes green; canon rules on who eats what are tested |
| 11 | `freespins.ts`. Sessions with the retrigger block from day one | A session plays exactly its initial award, on every wedge |
| 12 | One wedge at a time. Measure the fleet after each | Each wedge's RTP contribution is known before the next one lands |
| 13 | The rare marathon last, and size your fleet from its hit rate | The fleet has enough marathon arrivals to resolve its contribution |
| 14 | Interactive bonuses as pure state machines. The UI supplies the clock | Every state transition is testable without a browser |
| 15 | The UI. It renders `SpinResult.steps` and never computes an outcome | The harness and the UI produce identical results from identical seeds |

Step 6 is the one people skip and the one that matters most. Writing the oracle after the engine means you encode whatever the engine does. Writing it first means you encode what you meant.

Step 13 is the one this project got right by accident and should have got right on purpose. See 11.4.

### 11.2 Load-bearing versus cosmetic

**Load-bearing. Changing any of these changes RTP and requires a full fleet re-run.**

| Constant | File | Why |
|---|---|---|
| `PAYOUT_SCALE` | `paylines.ts:73` | Linearly scales every payout in the game |
| `PAYTABLE` values | `paylines.ts:53-66` | Same, per symbol |
| Every strip count in `baseSegments`, `treatSegments`, `wildStackSegments`, `handbagWildSegments` | `reels.ts:52-100` | Sets symbol density, wild-stack frequency, and treat accrual |
| `FREE_SPIN_LADDER` keys and values | `types.ts:221-223` | The keys are a tail statistic (section 8.2). The values are linear |
| `UNIGLEE_REEL_RATES` | `uniglee.ts:32-36` | Sets both the largest RTP contributor and the fleet size you need |
| `SPECIALTY_TRIGGER_CHANCE` and `SPECIALTY_WEIGHTS` | `cascade.ts:30-36` | Drives the deep tail of the cascade distribution, which is the ladder trigger |
| `DOORBELL_REEL_*_RATE`, `BOLD_CHAI_REEL_*_RATE` | `reels.ts:20-25` | Two bonus trigger rates and the reel-1/reel-2 dead space |
| `HANDBAG_WILD_LAND_RATE` and the multiplier weights | `reels.ts:28, 132-137` | Direct multiplier on five-of-a-kind lines |
| `rollWildMultiplier` boundaries and `MULTIPLIER_REEL` | `freespins.ts:76-86` | The highest per-spin value in the game |
| `WHEEL_WEIGHTS` | `freespins.ts:35-39` | Routes 10.64 points between wedges of very different value |
| `TREAT_TIME_TRIGGER_RATES`, `TREAT_TIME_SPIN_RANGES`, `TREAT_TIME_WILD_RANGE` | `treattime.ts:11-21` | 8.31 combined points across two modes |
| `TREAT_JAR_CAP`, `TREAT_JAR_FREE_SPINS` | `features.ts:19-25` | The highest-frequency award in the game |
| `rollDoorbellFreeSpins` range | `cascade.ts:234-237` | Multiplies the highest per-spin-value session |
| `BOLD_CHAI_*` constants | `bold-chai-pump.ts:12-16` | `BOLD_CHAI_CUP_RESET_MS` is the real balancer, not the pump count |
| `KEEPSAKE_ZONE_WEIGHTS`, `KEEPSAKE_ICON_WEIGHTS` | `keepsake-constellation.ts:11-36` | Board shape and the 2% wild giant |
| `KEEPSAKE_MEMORY_FREE_SPINS`, `KEEPSAKE_MEMORY_MAX_FAILS` | `keepsake-memory.ts:16-17` | A flat 40-spin award, 35% of Firefly outcomes |
| `LAP_QUEST_WILD_COUNTS` | `lap-quest.ts:27-30` | And see the trap in 11.5 |
| `DEFAULT_UNIGLEE_LAUNDRY_CONFIG` | `uniglee-marathon.ts:12-16` | Marathon act 1 |
| `BASE_POP_IN_RATE` and the pity threshold | `features.ts:144, 155` | Indirect: pop-ins eat treats and suppress Treat Jar RTP |

**Cosmetic. Change freely, no re-run needed.**

| Item | File | Why it is safe |
|---|---|---|
| `CAT_QUIP_POOLS`, all 47 strings | `features.ts:32-92` | Presentation. The selection roll is reused from the cat-choice roll specifically so adding or removing lines does not shift the RNG stream |
| `CatVisit.assist` values | `features.ts:166-178` | Set but never read by any engine code |
| `LAP_QUEST_SPOT_LABELS`, `LAP_QUEST_SPOTS` names | `lap-quest.ts:15-25` | The three spots are mechanically identical |
| `wheelWedgeLabel` strings | `freespins.ts:425-442` | Display only |
| `WheelLanding.subzone` | `freespins.ts:66-70` | Pointer position only; does not touch wedge probability |
| `double_sparkle` and `facts_on_facts` behaviour | `cascade.ts:325-326` | Mechanically inert today (section 5.6). Their **weights** are not cosmetic, because they displace `sparkle_sort` and `drop_in` in the queue |
| `KeepsakeZone` symbol identity | `keepsake-constellation.ts` | Only the wild-versus-not distinction matters |
| `BOLD_CHAI_CUP_RESET_MS` presentation framing | `bold-chai-pump.ts:15` | The comment calls it a presentation target. It is not: see the load-bearing table |
| `LineWin.lineIndex` for blocker triggers | `paylines.ts:83-92` | All 16 row pairs are covered, so the index never changes whether the bonus fires |

### 11.3 Genuinely coupled decisions

These four are not independent. Changing one without re-deciding the others produces a game that is either broken or silently out of band.

**1. `PAYOUT_SCALE` and everything else.** It is the only truly global lever, which means it is also the only lever that can silently mask a mistake elsewhere. If a bonus change adds 4 points and you compensate by dropping the scale, you have not fixed the bonus, you have made the base game 4 points meaner to pay for it. Always measure the per-feature table before touching the scale, and check that the base layer stayed where you wanted it.

**2. Ladder entry threshold and the specialty queue.** Both control the same tail. The specialty queue exists to push spins past depth 6; the threshold decides where "past" is. Raise the threshold and the queue's `SPECIALTY_TRIGGER_CHANCE` becomes a much bigger lever than it was. Lower it and the queue barely matters. They must be tuned together, against the measured depth distribution, not separately.

**3. The retrigger policy and every bonus modifier.** The block is what makes the modifiers safe to make generous. Every wedge raises board density and therefore raises the in-bonus cascade depth, which is precisely the retrigger trigger. If you ever unblock retriggers, every wedge's modifier strength becomes a session-length lever as well as a payout lever, and the two interact multiplicatively. Section 8.4 is the long version.

**4. UniGlee rarity, its award, its doubling, and your fleet size.** Four things move together:
   - The reel rates set the hit rate.
   - `reel × 20` sets the award, and `baseLaundryAllocation` divides it by four.
   - The unconditional `doubleSparkleActive` on a capture adds 2.74 points that are booked to the Firefly layer, not to UniGlee.
   - The hit rate sets the number of spins you must simulate to measure anything (section 10.5).

   Raising the award from 40/60/80 to 300/400/500, which is what decision D7 asks about, is a 7.5-fold increase on UniGlee acts 1–4. A rough linear estimate moves the full game from 105.79% to `105.79 + 7.47 × 6.5 = 154.35%`, before any coupled effects. It cannot be done without compensating elsewhere, and the compensation is itself a design decision, which is exactly why D7 and D8 have to be ruled together.

### 11.4 What breaks if you change one number and skip the fleet

Concrete failure modes, each of which this codebase has either hit or narrowly avoided:

| Change | What looks fine | What actually broke |
|---|---|---|
| Nudge `PAYOUT_SCALE` by 0.02 | Oracle still green: the base RTP band is 2 points wide and 0.02 is worth about 1.6 points | Full game moves 2.5 points. Nothing tests it. Every published RTP figure is now wrong |
| Add a symbol to a strip | Oracle green, game feels the same | Strip length changed, so **every other symbol's density changed too**, on that reel. Handbag rate, wild-stack probability, and treat accrual all shifted |
| Move ladder entry from 6 to 5 | Free-spin band goes red, so you notice | Good. This is the one the oracle catches |
| Raise the UniGlee award | Fleet on 7 seeds still reads "about 96%" | A 350,000-spin sample cannot see a change to a 1-in-1,229 event. You will not detect it until someone runs 40 seeds |
| Add an RNG draw anywhere in `spin()` before the existing ones | Nothing looks wrong | Every seeded test result changes. The oracle goes red for a reason that has nothing to do with the change. You will be tempted to widen the bands. Do not: add the draw at the end, or on a separate stream |
| Change `BOLD_CHAI_CUP_RESET_MS` from 3,000 to 1,000 | Feels more responsive | Cups per 30 seconds goes from 6 to 10 at 6 taps per second, so the bonus goes from 18 spins to 30. Its RTP contribution rises by two thirds |
| Add a new bonus at 1 in 10,000 | It hits twice in a 200,000-spin oracle run | Your entire fleet is now under-powered. Recompute the required size from the new arrival rate before you publish any figure |

The one-line rule: **the oracle catches base-game regressions, and nothing else. Any change that touches a bonus requires the full 40-seed fleet.**

### 11.5 Traps

Specific things that will bite you, in rough order of how much time they will cost.

1. **Sticky wilds can make the cascade loop non-terminating.** `while (true)` at `cascade.ts:288` has no iteration cap. If a set of permanently-fixed wilds covers reels 1, 2 and 3 of any payline, that line pays every step forever. This is live today: see section 12.4. **If you implement sticky wilds, either cap the loop or forbid the configuration.**
2. **Blockers slide.** Doorbells and pumps are never removed by a win, but gravity moves them. A pair that missed on the opening board can pair up three cascades later. This is why the measured trigger rate (1 in 499) is higher than the analytic opening-board rate (1 in 510). If you check for the trigger only once, you will build a different game.
3. **A non-paying symbol on reel 1 kills the whole line.** Not "breaks the run at reel 1": `evaluateLines` returns early (`paylines.ts:111`). It is the same outcome for a 3-run, but it means treats and blockers on reel 1 are pure dead space, which is what `PAYOUT_SCALE` compensates for.
4. **A wild on reel 1 forces `matchSymbol = tumbler`.** Any mechanic that places a wild on reel 1 (Doorbell Panic preloads, Lap Quest sticky wilds) converts that line into a tumbler-only line. That is a large downgrade on a low-symbol board, and it is invisible unless you look for it.
5. **Treats are collected from the opening board only.** `collectTreats` runs once, before the cascade loop (`cascade.ts:264`). If you collect from every step, treat accrual roughly doubles and the Treat Jar hit rate moves from 1 in 25 to something near 1 in 12.
6. **Two refill paths skip the handbag multiplier.** `cascadeColumnAroundKeepsake` and `cascadeColumnAroundStickyWilds` call `drawSingle`, not `cellFrom`, so a handbag refilled inside those two bonuses is a bare wild. Same symbol, different power, depending on the bonus.
7. **`options.includeBoldChaiPump !== false` means undefined enables it.** The defaulting idiom in `spinGrid` treats a missing option as "on". Every bonus caller passes `false` explicitly. Forget one and you have doorbells inside a free spin.
8. **A doorbell pair silently overrides the cascade ladder.** `cascade.ts:371`. Rare, but a player who cascaded to depth 9 gets 4 spins instead of 25 and is never told why.
9. **`double_sparkle` and `facts_on_facts` do nothing.** They are 20% of specialty rolls. If you assume they work because they are named and weighted, your RTP model will be wrong in the safe direction, which is worse, because it hides.
10. **The oracle measures the base game only.** It is 61%, not 96%. Every historical RTP confusion in this project came from reading it as a whole-game figure.
11. **The harness plays a perfect player.** Perfect memory on the Keepsake Trail, 6 taps per second on Bold Chai. Both numbers are ceilings.
12. **Phoebe's Lap Quest is outside every measurement.** The marathon runner excludes act 5 by design, and the harness only sums the runner's chapters.
13. **`applyBonusSpinXp` mutates its argument.** The one impure function in the engine. It is documented, but it will surprise you.
14. **RNG stream position is content-dependent.** `cellFrom` consumes extra draws when it hits a handbag candidate, so two boards with the same stop indices can leave the stream in different places. Any test that assumes a fixed number of draws per spin is wrong.

---

## 12. Known divergences

Everything in this document was read from source. Where an existing document, a code comment, or a test title disagrees with the code, **the code wins**, and the disagreement is recorded here so a reader is not misled.

### 12.1 Open decisions: D6, D7, D8

Three decisions are open in `docs/DECISION-LOG.md` under "Open decisions", raised 2026-08-09, owner Jamie, all three written so a one-word answer settles them. Summarised accurately below; the log holds the authoritative wording.

**D6. Was the UniGlee tease and rarity redesign ever ruled?**

The live overkillhill.com project page was patched on 2026-07-17 describing a UniGlee redesign in two parts: a decorative sighting the player sees often at roughly 1 in 850, and a real capture that is much rarer at roughly 1 in 4,212. The patch PRD attributes that copy to decisions S33 and S34, and neither exists in the log, which ends at S32.

**The code implements neither half.** There is no tease or sighting mechanic anywhere: `grep -rn "tease\|sighting" src/` returns zero hits. The capture rate is three independent per-reel rolls at 1/2,500, 1/4,000 and 1/7,500 combining to 1 in 1,277 (`uniglee.ts:32-38`), not 1 in 4,212. And `placeUniGleeTrigger` (`uniglee.ts:70-97`) deliberately makes the capture land line-valid so that it *cannot* read as a decorative non-paying scatter, which is the opposite of the tease concept.

The two rulings on offer are (i) "Ruled", meaning log it as S33 and S34 and open an engine task to build it, or (ii) "Withdrawn", meaning correct the public page to the shipped 1-in-1,277 behaviour.

**D7. UniGlee award size: 300/400/500 or 40/60/80?**

| Source | Award | Per act 1 to 4 |
|---|---:|---:|
| Settled decision S30, 2026-07-15 | 300 / 400 / 500 | 75 / 100 / 125 |
| S30 contract, 2026-07-15 (absorbed into this document §9) | 300 / 400 / 500 | 75 / 100 / 125 |
| **Shipped engine** (`uniglee.ts:94`, `reel * 20`) | **40 / 60 / 80** | **10 / 15 / 20** |
| Shipped type (`laundry.ts:21`, union of 40, 60, 80) | 40 / 60 / 80 | 10 / 15 / 20 |
| `laundry.ts:20` comment: "2026-07 RTP retune: marathon award reduced from 300/400/500 to 40/60/80" | 40 / 60 / 80 | 10 / 15 / 20 |
| README and both public pages | 40 / 60 / 80 | |

Every artifact except S30 and its own contract says 40/60/80, and the engine enforces it at the type level. **This document uses 40/60/80 throughout, because that is what the code does.** The rulings on offer are (i) "Code", a documentation change only, or (ii) "S30", which is simulation-gated engine work. See the arithmetic in section 11.3: option (ii) would take the full game to roughly 147% without compensating changes.

**D8. The documented RTP band does not match the measured game, and it never stated a player model.**

`docs/DESIGN-SPEC.md` §4 records "~96.5% (95-98% band). Base game alone ~61%; bonus layer ~35%."

| Measure | Documented | Measured (2,000,000 paid spins, seeds 1 to 40) |
|---|---:|---:|
| Full-game RTP | ~96.5%, band 95% to 98% | **105.79%**, 95% CI 104.82% to 106.76% |
| Base layer | ~61% | 61.05% |
| Bonus layer | ~35% | **44.74%** |
| Seeds in band | n/a | **0 of 40** |

The base-layer figure is accurate. The bonus-layer figure and the total are not. The entire confidence interval sits above 100%. The harness states its three interactive assumptions, but the documented band never states which player model it targets.

The rulings on offer are (i) "Restate", (ii) "Model" (add a realistic-play harness variant), or (iii) "Retune". The log records this as a documentation-accuracy question rather than a player-facing defect: the game uses fictional Glee-coins with no purchase, wager, or cash-out, so nobody is harmed by the game paying better than a document predicted. What the log says is not acceptable is continuing to publish 95% to 98% as a verified figure.

**This document's position, for the avoidance of doubt:** the measured, reproducible five-act figure is 105.79% under the stated mixed player model, excluding level-up coin rewards. It is not in the documented band.

### 12.2 Other document-versus-code divergences

| # | Document claim | Code reality | Evidence |
|---:|---|---|---|
| 1 | `docs/DESIGN-SPEC.md` §4: bonus layer ~35% | 44.74% measured | five-act 40-seed fleet |
| 2 | `docs/DESIGN-SPEC.md` §4 event table: "Chai Tea Bonus (3+ scatters) ~1 in 110 spins" | **No scatter mechanic exists.** There is no scatter symbol, no 3-plus-scatter count, and no bonus of that name. The two chai bonuses are Bold Chai Pump (a blocker pair) and Iced Chai Wild Rain (a wheel wedge) | `grep -rn "scatter" src/engine/` returns only a comment in `cascade.ts:71` |
| 3 | `docs/DESIGN-SPEC.md` §5: saucer-cat wilds "arrive in stacks up to 6-7 high" | Runs are 5 and 6 on reels 2 to 4, and 6 and 6 on reel 5. Never 7 | `reels.ts:86-92` |
| 4 | S30 contract (2026-07-15) per-act table: 75 / 100 / 125 | 10 / 15 / 20 | `laundry.ts:23-25` |
| 5 | `docs/archive/HANDBAG-WILD-2026-07-14.md`: oracle moved to 95.91% RTP, approved band 95.5% to 96.5% | The oracle reads 61.08% and measures the base game only. The doc's own 2026-08-09 delta already records this, and the mechanic itself still matches its contract exactly | `simulation.test.ts:71-74`; the doc's delta section |
| 6 | `src/engine/README.md` module table: `reels.ts`, `paylines.ts`, `cascade.ts`, `features.ts`, `economy.ts` marked "☐ TODO", `types.ts` marked "☑ stub" | All six are shipped, complete, and covered by 170 passing tests | `npx vitest run src` |
| 7 | `src/engine/README.md`: required test is a "1M-spin RTP simulation within ±0.5% of targetRtp" | The oracle runs 200,000 spins and gates base RTP in a 2-point band. There is no `targetRtp` anywhere in executable code | `simulation.test.ts:15, 71-74` |

### 12.3 Code-comment and test-title divergences

These are inside `src/engine/` and matter because a reader who trusts a comment over the constant next to it will build the wrong game.

| # | Comment or title | Reality | Location |
|---:|---|---|---|
| 1 | Strips are "~70-90 symbols long" | 119, 119, 132, 121, 134 | `reels.ts:7` |
| 2 | Wilds are placed as "contiguous runs of 6-7" | 5 and 6, or 6 and 6 on reel 5 | `reels.ts:8` vs `reels.ts:86-92` |
| 3 | "Two stacks per wild per reel" | **One** contiguous run per wild per reel | `reels.ts:80` vs `reels.ts:84-94` |
| 4 | UniGlee "gated separately in cascade.ts as a per-spin event at ~1/400" | 1 in 1,276.6, three independent per-reel rolls | `reels.ts:11` vs `uniglee.ts:32-38` |
| 5 | `EngineConfig.unigleeRate` documented "~1/400"; `EngineConfig.targetRtp` documented "~0.96, verified by 1M-spin simulation test" | Both stale. `EngineConfig` is also **never used anywhere** | `types.ts:248-255` |
| 6 | "Per-act ceiling; initial allocations are 75/100/125" | Allocations are 10/15/20. The 500 cap itself is correct | `uniglee-marathon.ts:17` |
| 7 | `collectTreat`: "pays/resets only the bag that reaches twelve" | `TREAT_JAR_CAP = 24` | `features.ts:129` vs `features.ts:19` |
| 8 | `levelForXp`: "level N needs N * 500 cumulative Sparks" | `levelThreshold(level) = (level - 1) * 500`, so level N needs (N−1)×500 | `economy.ts:27` vs `economy.ts:34-36` |
| 9 | "double_sparkle / facts_on_facts are ladder/coin modifiers" | Both are mechanically inert. `doubleSparkleActive` is set only by the UniGlee branch, never by dequeuing a `double_sparkle` | `cascade.ts:325` vs `cascade.ts:276, 283` |
| 10 | Test title: "fills one cup over twelve accepted pumps and awards ten free spins" | 3 free spins per cup. The assertion itself uses the constant and is correct; only the title is wrong | `bold-chai-pump.test.ts:14` vs `bold-chai-pump.ts:14` |
| 11 | `wheelWedgeLabel` returns "Keepsake Collection" for `keepsake_collection` | The mechanic is documented everywhere else as Keepsake Constellation | `freespins.ts:432-433` |

`treattime.ts:28-31` deserves a note in the other direction: it carries an explicit dated correction recording that its own comment used to state pre-retune rates of 1/100 and 1/300, and that the constants (1/250 and 1/500) are authoritative and were not changed. That is the pattern the other eleven rows above should follow.

### 12.4 An engine defect found while writing this document

**Phoebe's Lap Quest can produce a non-terminating cascade loop.**

This is not a document divergence. It is a live defect, found by measurement, and it is recorded here because it is the single most important thing in this file for anyone rebuilding sticky wilds.

**Mechanism.** `spin()`'s cascade loop is `while (true)` with no iteration cap (`cascade.ts:288`). Lap Quest sticky wilds are re-fixed onto their rows after every cascade step (`cascadeColumnAroundStickyWilds`, `cascade.ts:143-173`), so they are never consumed by a win. If the sticky set covers reel indices 0, 1 and 2 of any one payline, that line produces a 3-plus wild run **every step, forever**: the win removes the cells, the refill immediately restores them, and the loop re-evaluates identically. `steps` grows without bound until the process runs out of memory.

**Reproduction**, verified 2026-08-09:

```
seed 99, the 29th Lap Quest round (index 28)
comfort wilds: (0,3) (1,2) (2,2) (3,2), a perfect lap
payline 13 = [3,2,2,2,3]
  reel 0 row 3 -> sticky wild
  reel 1 row 2 -> sticky wild
  reel 2 row 2 -> sticky wild
  reel 3 row 2 -> sticky wild
=> a permanent 4-of-a-kind tumbler line. spinLapQuestRound never returns.
```

**Frequency**, measured over 400,000 `resolveLapQuestChoice` draws:

| Class | Condition | Rate | Behaviour |
|---|---|---:|---|
| Hard | sticky wilds cover reel indices 0, 1 and 2 on one payline | 3.43%, **1 in 29.1** | Strictly non-terminating |
| Soft | sticky wilds cover indices 1 and 2 on one payline, but not 0 | 13.99%, 1 in 7.1 | Continues while reel 1 keeps refilling a paying symbol, which it does about 90.8% of the time per fresh cell. Run lengths are unbounded in practice |
| Either | | 17.43%, 1 in 5.7 | |

Only a perfect lap (4 wilds) can reach the hard class; 2 wilds cannot cover 3 reels. Perfect laps are 1/3 of rounds, so the hard rate given a perfect lap is roughly 1 in 9.7.

**Exposure.** `runLapQuestChapter` is called on every UniGlee capture (`board.ts:1584`), so roughly 1 in 1,229 paid spins starts a Lap Quest. The chapter is an open-ended loop that plays a fresh round roughly every 900ms until the ledge timer expires, and **each round re-rolls the wilds**. Over a typical 15 to 30 rounds, the probability that at least one round hits the hard class is on the order of 40% to 65%. In a browser that is a locked tab.

**Empirical confirmation.** A measurement loop of 2,000 Lap Quest rounds completes normally. The same loop at 20,000 rounds is killed by the OOM killer, even with the hard class filtered out, because of the soft class.

**Why it has not been noticed.** `scripts/sim-agent.ts` does not run Lap Quest at all, so no simulation has ever exercised it at volume. The engine tests exercise it only with hand-picked seeds and, in the one test that places sticky wilds explicitly, with 2 wilds at (0,0) and (4,3), which cannot form the hazard (`lap-quest.test.ts:56-84`).

**Fixes, in order of preference:**

1. **Cap the cascade loop.** A hard maximum iteration count in `spin()`, breaking to a dead board when it is hit. This is the correct fix because it makes every future sticky or locked mechanic safe by construction, not by argument. It is the same reasoning as section 8.4.
2. **Reject the configuration at draw time.** Re-roll `chooseComfortWilds` until the set does not cover a payline prefix through reel index 2. Cheap, local, but only fixes this one mechanic and leaves the soft class.
3. **Make sticky wilds consumable once per chain.** Changes the feature's design, so it is a decision, not a fix.

This should be opened as a decision or a bug in `docs/DECISION-LOG.md`. It is deliberately not fixed here, because this is a documentation task and the change is engine behaviour.

### 12.5 Built but not wired

Two things exist in the engine with full test coverage and no production caller. Neither is a defect; both are traps for a reader who assumes coverage means live.

| Module or export | Status | Note |
|---|---|---|
| `EngineConfig` (`types.ts:248-255`) | Declared, never imported | Its comments are stale (12.3 row 5) |
| `pickWeighted` (`rng.ts:23-30`) | Exported and tested, no production caller | Every weighted pick in the engine is hand-rolled locally instead |

Also worth stating: `CatVisit.assist` is populated by `rollCatVisit` and read by nothing. The module header at `features.ts:5-8` says so explicitly: the assist animations are UI-layer follow-up work.

---

## Appendix A: reproduction commands

| What | Command |
|---|---|
| Full engine test suite, 28 files, 360 tests | `pnpm test` |
| The oracle with its six actual values printed | `npx vitest run src/engine/simulation.test.ts --reporter=verbose` |
| One simulation seed | `npx tsx scripts/sim-agent.ts a1 1 50000` |
| The full 40-seed fleet, 2,000,000 paid spins | `for s in $(seq 1 40); do npx tsx scripts/sim-agent.ts a$s $s 50000; done` |
| Skip the oracle in CI | `SKIP_ORACLE=1 npx vitest run src` |

Do not pass `--reporter=basic` to vitest in this repo; it fails to resolve.

## Appendix B: every tuning constant, in one place

| Constant | Value | File:line |
|---|---:|---|
| `PAYOUT_SCALE` | 0.775 | `paylines.ts:73` |
| `REELS`, `ROWS` | 5, 4 | `reels.ts:16-17` |
| `DOORBELL_REEL_ONE_RATE` | 1/17 | `reels.ts:20` |
| `DOORBELL_REEL_TWO_RATE` | 1/30 | `reels.ts:21` |
| `BOLD_CHAI_REEL_ONE_RATE` | 1/17 | `reels.ts:24` |
| `BOLD_CHAI_REEL_TWO_RATE` | 1/30 | `reels.ts:25` |
| `HANDBAG_WILD_LAND_RATE` | 0.85 | `reels.ts:28` |
| Handbag multiplier weights | ×3 55%, ×5 35%, ×10 10% | `reels.ts:132-137` |
| `SPECIALTY_TRIGGER_CHANCE` | 0.05 | `cascade.ts:30` |
| `SPECIALTY_WEIGHTS` | sort 50, drop-in 30, double 12, facts 8 | `cascade.ts:31-36` |
| Sparkle Sort blast size | 5 to 11 cells | `cascade.ts:79` |
| Doorbell free spins | 3 to 6 | `cascade.ts:236` |
| `FREE_SPIN_LADDER` | 6:6, 7:9, 8:15, 9:25, 10:40, 11:60 | `types.ts:221-223` |
| `WHEEL_WEIGHTS` | multiplying 40, memory 35, chai 25 | `freespins.ts:35-39` |
| `rollWildMultiplier` | none 15%, ×2 35%, ×3 30%, ×5 15%, ×10 5% | `freespins.ts:76-83` |
| `MULTIPLIER_REEL` | ×2→reel 2, ×3→3, ×5→4, ×10→5 | `freespins.ts:86` |
| Doorbell Panic preload | 3 to 6 cat wilds | `freespins.ts:149` |
| `UNIGLEE_REEL_RATES` | 1/2500, 1/4000, 1/7500 | `uniglee.ts:32-36` |
| `UNIGLEE_ACTIVE_RATE` | 1 in 1,276.6 | `uniglee.ts:38` |
| UniGlee award | `reel × 20` = 40 / 60 / 80 | `uniglee.ts:94` |
| `LAUNDRY_ALLOCATION_FRACTION` | 0.25 | `laundry.ts:18` |
| `UniGleeAwardSpins` | 40 \| 60 \| 80 | `laundry.ts:21` |
| `DEFAULT_UNIGLEE_LAUNDRY_CONFIG` | sock 0.25, paw 0.18, ×2/×3/×5 at 60/30/10 | `uniglee-marathon.ts:12-16` |
| `UNIGLEE_CHAPTER_SPIN_CAP` | 500 | `uniglee-marathon.ts:18` |
| `LAP_QUEST_WILD_COUNTS` | cozy 2, perfect 4 | `lap-quest.ts:27-30` |
| Lap Quest ledge defaults | grace 15s, inactivity 5s, max 90s | `lap-quest-ledge.ts:43-45` |
| `TREAT_TIME_TRIGGER_RATES` | morning 1/250, nighttime 1/500 | `treattime.ts:11-14` |
| `TREAT_TIME_SPIN_RANGES` | morning 5 to 8, nighttime 8 to 14 | `treattime.ts:16-19` |
| `TREAT_TIME_WILD_RANGE` | 0 to 4 per round | `treattime.ts:21` |
| Nighttime treat mix | chicken 45%, salmon 35%, bougie 20% | `treattime.ts:59-62` |
| `KEEPSAKE_ZONE_WEIGHTS` | 27 / 19 / 15 / 11 / 15 / 8 / 5 | `keepsake-constellation.ts:11-23` |
| Keepsake wild-giant share | 2% (1% each cat) | `keepsake-constellation.ts:32-36` |
| `KEEPSAKE_MEMORY_*` | 12 cards, 6 pairs, 2 fails, 40 spins, 2500ms, 900ms | `keepsake-memory.ts:14-19` |
| `BOLD_CHAI_DURATION_MS` | 30,000 | `bold-chai-pump.ts:12` |
| `BOLD_CHAI_PUMPS_PER_CUP` | 12 | `bold-chai-pump.ts:13` |
| `BOLD_CHAI_FREE_SPINS_PER_CUP` | 3 | `bold-chai-pump.ts:14` |
| `BOLD_CHAI_CUP_RESET_MS` | 3,000 | `bold-chai-pump.ts:16` |
| `TREAT_JAR_CAP` | 24 | `features.ts:19` |
| `TREAT_JAR_FREE_SPINS` | chicken 1, salmon 2, bougie 3 | `features.ts:21-25` |
| `BASE_POP_IN_RATE` | 1/32, doubled after 15 dry spins | `features.ts:144, 155` |
| Cat split | Phoebe 60%, Joey 40% | `features.ts:159` |
| `BET_LEVELS` | 1, 2, 5, 10, 25, 50 | `economy.ts:5` |
| `LEVEL_6_UNLOCK_PLAYER_LEVEL` | 12 | `economy.ts:8` |
| `LINES` | 40 | `economy.ts:9` |
| `STARTING_BALANCE` | 500 | `economy.ts:10` |
| `BUST_PROOF_REFILL` | 500 | `economy.ts:11` |
| XP per level | 500 Sparks, linear | `economy.ts:34-36` |
| Level-up coin reward (UI) | 200 × new level, per level crossed | `board.ts:873-875` |
| Oracle seed | 20260717 | `simulation.test.ts:16` |
| Oracle spin count | 200,000 | `simulation.test.ts:15` |
