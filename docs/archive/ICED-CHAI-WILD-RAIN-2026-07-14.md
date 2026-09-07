# Iced Chai Wild Rain — companion proposal

**Date:** 2026-07-15  
**Status:** confirmed implementation contract; bounded implementation in progress  
**Scope:** replacement contract for the 25% AskJamie Wheel modifier currently
identified internally as `chai_back`

This document makes Iced Chai Wild Rain literal board behavior. Jamie's
confirmed direction is a **one-and-done Wild Chai Storm** at the start of the
bonus session: the storm converts the opening board's ordinary iced-chai
symbols into mermaid-cup wild chai once, then never repeats during cascades or
retriggered spins. The contract does not change the 5×4 board, 40 fixed
paylines, ordinary cascade rules, free-spin ladder, or the wheel's 40% / 35% /
25% weights. It does not add a new bonus currency, persistence field,
analytics event, or secondary game.

## Player promise and trigger

When the AskJamie Wheel lands on **Iced Chai Wild Rain**, the first free-spin
opening board receives one brief **Wild Chai Storm** before its first line
evaluation. Every standard iced-chai symbol visible on that board becomes a
mermaid-cup `wild_chai`. The storm is not re-fired for later cascades,
retriggered spins, or newly dropped iced-chai symbols.

The existing internal wedge ID `chai_back` may remain for the smallest safe
diff and persistence/test compatibility; it must never appear in player-facing
copy. `wheelWedgeLabel("chai_back")` remains **Iced Chai Wild Rain**.

## One-shot board contract

The storm is deterministic for a seeded RNG because it performs no additional
placement roll; it transforms the deterministic opening grid exactly once:

1. Create the ordinary secondary-board opening grid with doorbells and Chai
   Pumps disabled.
2. Scan the 20 cells in reel-major order.
3. Replace every cell whose symbol is `chai` with one plain `wild_chai` cell.
   Return those positions in scan order.
4. Pass the transformed grid to the existing cascade engine before its first
   evaluation.

`wild_chai` is a semantic engine symbol, not a new paytable symbol. It is an
ordinary wild and has no multiplier marker. It is rendered with the existing
mermaid-tumbler art, a Wild Chai badge, and an orange-gold storm glow; no new
raster asset is required.

### Collision and exclusion rules

- A cell is occupied by one symbol. Conversion is in place: only a standard
  `chai` cell becomes `wild_chai`; cat wilds, treats, keepsakes, and other
  symbols are unchanged.
- There are no rain-target collisions or stacked rain tokens because the storm
  converts existing cells rather than selecting new landing positions.
- If the opening board contains no standard iced chai, the storm still plays
  its one-shot presentation but converts zero cells. It does not silently add a
  random fallback wild.
- The modifier is exclusive with the other AskJamie Wheel modifiers, so there
  is no multiplier wild, Keepsake Constellation zone, or other wheel payload to
  merge with a rain cell.
- Secondary free-spin grids already suppress Doorbells and Chai Pumps. Rain
  creates neither blocker and cannot trigger either primary-board feature.
- A rain wild does not directly award coins. Its only value comes through the
  normal line evaluator and any ordinary cascade it enables.

## Line, payout, and cascade behavior

- `wild_chai` substitutes for every paying symbol exactly like Joey and Phoebe
  wilds.
- A line containing only wilds resolves as the top paying symbol, Mermaid
  Tumbler, using the existing 3/4/5-of-a-kind paytable and line bet.
- A line using a rain wild pays once through the existing 40-line evaluator.
  There is no rain-count uplift, hidden percentage, multiplier, or separate
  rain payout.
- If a rain wild participates in a winning line, its cell is removed with the
  other winning cells. If it does not participate, it survives ordinary
  gravity and retains `wild_chai` when it drops to a new row.
- Newly drawn cascade symbols never become `wild_chai`; only the opening
  `chai` cells touched by the storm have that identity. A newly dropped
  ordinary `chai` remains an ordinary paying chai.
- A rain wild counts as a wild for the existing specialty-wild trigger check.
  Any queued specialty resolves through the existing one-per-dead-board rule.
  This keeps the new symbol mechanically ordinary rather than adding a second
  specialty system.
- The rain pass itself never adds free spins. A rain-enabled cascade may reach
  the normal cascade ladder and retrigger normally.

## Session ending and retriggers

The free-spin session starts with the wheel-awarded count. The first counted
round consumes one remaining spin, receives the one storm pass, and runs to a
dead board. If its cascade count awards free spins, those spins are added to
the same remaining count and run normally; they do not receive another storm.
There is no rain-only retrigger, per-session cap, or bonus reroll.

The session ends when remaining spins reach zero and uses the existing warm
summary: total Glee-coins, best cascade, and retrigger count. The modifier does
not change the summary shape.

## Typed result contract

The pure engine contract should add a semantic symbol and per-round payload:

```ts
export type SymbolId = /* existing symbols */ | "wild_chai";

export interface ChaiRainWild {
  position: [reel: number, row: number];
  symbol: "wild_chai";
}

export interface ChaiRainResult {
  wilds: ChaiRainWild[]; // 0–20 converted positions, in scan order
}

export interface FreeSpinRoundResult extends SpinResult {
  chaiRain?: ChaiRainResult;
  // existing multiplier / panic / Treat Time fields remain unchanged
}
```

For the actual wheel session's first `wedge === "chai_back"` round,
`chaiRain` is present, including when `wilds` is empty, and its `wilds` must
match the `wild_chai` cells in `steps[0].grid`. Later rounds omit `chaiRain`.
`steps[0]` is the transformed opening state; the UI must not inject wilds after
the engine returns. `extraWildsAdded` and the
`base.totalWin * (0.08 * extra)` flat-win branch are removed, never used as a
second award path. Bold Chai's legacy session path explicitly disables
`chaiRain`.

The line evaluator should include `wild_chai` in `isWild`; the cascade engine
should include it in the existing `NEVER_SHATTER` wild-preservation list. No
`LineWin` shape change is needed: winning lines report their ordinary matched
symbol, positions, and ordinary payout.

## Presentation contract

The existing wheel transition remains the entry beat. On landing:

- Show a full-screen **WILD CHAI STORM** splash once: “Chai storm! Chai
  storm!” with an orange pumpkin-fall glow, gold/orange glitter sparkles, and
  chai-drop shapes falling from above. Do not show pumpkins or fall leaves.
- The storm splash uses an original warm/cool Web Audio synth cue. It is one
  entry beat, not a loop; muting suppresses it with the existing SFX bus.
- After the splash, the converted cells receive the existing mermaid-tumbler
  art, a `WILD CHAI` badge, and a brief orange-gold conversion pulse.
- The ordinary winning-line highlight remains the payout authority. After the
  opening evaluation, no storm animation repeats; surviving wild chai simply
  moves with ordinary drop choreography.
- Reduced motion places tokens directly into their cells with a fade/scale
  settle. Muting suppresses every rain cue exactly as it suppresses existing
  SFX. No hot-drink, steam, kettle, mug, brand, or copyrighted audio imagery
  is introduced.

## Verification gates

Add focused Vitest coverage before integration:

1. Wheel boundary tests still resolve 40% / 35% / 25%; `chai_back` labels as
   Iced Chai Wild Rain.
2. A controlled opening grid converts every `chai` cell, in scan order, and
   leaves every other symbol unchanged.
3. A seeded first session round returns 0–20 in-bounds converted coordinates;
   every returned coordinate is `wild_chai` in `steps[0].grid`.
4. The storm payload exists only on the first round of a session; retriggers
   and later cascades do not create another payload.
5. `wild_chai` substitutes on mixed lines, pays as Tumbler on a wild-only line,
   and never carries a multiplier.
6. A surviving rain cell retains its symbol through gravity; a newly drawn
   cascade cell never gains it.
7. Secondary rounds contain no Doorbells or Chai Pumps, and the result has no
   flat `extraWildsAdded` payout.
8. A seeded modifier simulation reports finite, non-negative wins and measures
   the RTP contribution of the one-shot conversion. The full release
   simulation must recheck overall
   RTP and event frequencies; its thresholds must not be weakened.
10. Production build, reduced-motion rendering, accessibility announcement,
    and mute behavior remain green in the existing UI validation pass.

## Math and open decisions

Settled by Jamie: the wheel weight remains 25%; the modifier is a one-shot
session-entry storm; every opening-board `chai` converts to a mermaid-cup
`wild_chai`; payouts are ordinary; cascades and retriggers remain ordinary;
and the legacy internal ID may be preserved for a bounded implementation.

The following must remain explicit rather than being silently tuned during
implementation:

- **Zero-conversion outcome:** the current literal rule allows zero converted
  cells when no ordinary `chai` appears on the opening board. Adding a fallback
  wild would be a separate Jamie ruling.
- **RTP contribution:** replacing the old flat uplift will change variance and
  likely change RTP. The current repository already documents a failing
  93.54% seeded RTP oracle; this feature must not weaken that gate or claim
  success until the engine owner retunes with a documented simulation.
- **Semantic symbol versus art alias:** `wild_chai` is the recommended typed
  contract. Reusing the existing iced-chai sprite is the smallest asset path;
  collapsing it into a cat wild is acceptable only if the engine/UI owner
  records the loss of symbol identity before implementation.
- **Storm identity:** the `chai_back` ID stays internal for compatibility, while
  the public name and presentation are Iced Chai Wild Rain / Wild Chai Storm.

## Smallest shippable slice

Ship only the pure engine change, typed payload, focused tests, and a bounded
existing-board presentation hook:

- keep the current wheel and free-spin session flow;
- replace the `chai_back` flat coin bump with one opening-board `chai`-
  conversion pass;
- reuse the current mermaid-tumbler art, wild-cell frame, cascade animation,
  status area, and Web Audio plumbing;
- show one bounded Wild Chai Storm splash and expose the converted positions;
- keep the existing end summary and persistence untouched.

Do not add a new scene, new asset sheet, new persistence version, new
analytics, a second board, a custom payout table, or a new retrigger type in
the initial release.
