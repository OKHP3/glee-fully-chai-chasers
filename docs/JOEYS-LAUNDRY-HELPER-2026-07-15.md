# Joey’s Laundry Helper — Chapter Contract

**Date:** 2026-07-15
**Status:** bounded chapter adapter implemented; parent marathon handoff remains required
**Scope:** one sub-bonus inside the UniGlee marathon; never a standalone trigger or independent free-spin session

This amendment supersedes the earlier drawer-row proposal. Joey is perched over the upper half of the reel cabinet for the duration of his UniGlee sub-bonus. He chases falling socks across the middle reels and occasionally reaches down with a multiplier paw.

The implementation slice is now present in `src/engine/laundry.ts`, `src/engine/freespins.ts`, and the scoped Laundry presentation/audio additions in `src/ui/board.ts`, `src/style.css`, and `src/audio/synth.ts`. The exported `runJoeyLaundryChapter` UI entry point accepts the typed child session from the parent marathon; it does not invent the parent’s award builder, chapter order, or open Laundry rates.

## Player loop

1. The UniGlee session always starts with Joey’s Laundry Helper. It assigns Joey a base allocation of **25%** of the initial UniGlee award: 75 spins from a 300-spin award, 100 from 400, or 125 from 500.
2. Joey appears above and overlaps the upper half of the reels, remaining visible while the chapter is active.
3. On a Laundry Helper counted round, at most one sock drop and at most one paw strike are rolled independently. They may happen together because Joey can chase a sock and strike the board in the same beat.
4. A sock falls over visual reel 2, 3, or 4—never reel 1 or reel 5—and turns every symbol in that reel into an ordinary Joey wild before the round evaluates.
5. Occasionally Joey’s paw strikes visual reel 2, 3, or 4—never reel 1 or reel 5. It converts one cell into a marked Joey multiplier wild using only **×2, ×3, or ×5**.
6. If the sock and paw target the same reel, the paw occupies one cell within the sock-filled column. That cell remains a multiplier wild; the other cells remain ordinary Joey wilds.
7. The round runs through the ordinary 5×4 cascade engine. Neither effect awards a separate bonus, launches another bonus, or creates another UniGlee trigger.

8. Ordinary retriggers earned during Laundry Helper are added to Laundry Helper’s own remaining-spin queue and are played before the next UniGlee sub-bonus begins. They never carry into the next chapter.
9. Laundry Helper occurs once, as the first sub-bonus. The effect is a round-level modifier inside the parent session, not a separate minigame session.

## Board contract

- Eligible visual reels are **2, 3, and 4**, represented by zero-based engine reels **1, 2, and 3**.
- A sock drop targets one eligible reel and wilds all four cells in that column before initial line evaluation.
- A paw strike targets one eligible reel and one row, producing one `{ symbol: "wild_joey", multiplier: 2 | 3 | 5 }` cell.
- Sock and paw targets are independently rolled and may coexist. Their effects are composed before payline evaluation.
- A sock-created wild is an ordinary Joey wild. It may win, be removed, and participate in ordinary cascade behavior.
- A paw multiplier follows the approved opening-result multiplier rules: it applies only to winning paylines that use that marked cell; cascades do not create or stack new multiplier markers.
- Fresh cascade drops do not receive a sock or paw marker.
- Laundry Helper does not combine with Keepsake Constellation, Treat Time wild casting, Doorbell Panic wild injection, or another chapter modifier in the same counted round. If a future composition path permits one, the engine must resolve conflicts explicitly rather than letting the UI decide.
- UniGlee remains a legend/trigger payload and never becomes a line symbol because of the chapter.

Proposed structural constants:

```ts
export const LAUNDRY_REELS = [1, 2, 3] as const;
export const LAUNDRY_MULTIPLIERS = [2, 3, 5] as const;
export const LAUNDRY_ALLOCATION_FRACTION = 0.25;
```

The sock-drop rate, paw-strike rate, and 2×/3×/5× distribution are deliberately not fixed here. They require UniGlee-wide simulation. The existing We're Multiplying distribution includes ×10; Laundry Helper must not inherit ×10.

## Pure TypeScript result contract

The engine should expose the effect as typed data. It must not import DOM APIs or encode copy, timing, or audio decisions.

```ts
export type LaundryReel = 1 | 2 | 3;
export type LaundryRow = 0 | 1 | 2 | 3;
export type LaundryMultiplier = 2 | 3 | 5;

export interface LaundrySockDrop {
  reel: LaundryReel;
  wildPositions: Array<[reel: LaundryReel, row: LaundryRow]>;
}

export interface LaundryPawStrike {
  position: [reel: LaundryReel, row: LaundryRow];
  multiplier: LaundryMultiplier;
}

export interface JoeyLaundryEffect {
  chapter: "joey_laundry_helper";
  blockIndex: number;
  roundOrdinal: number;
  sockDrop?: LaundrySockDrop;
  pawStrike?: LaundryPawStrike;
}

export interface UniGleeSubBonusBudget {
  initialAllocation: number;
  retriggerSpins: number;
  remainingSpins: number;
}
```

The parent UniGlee session owns `UniGleeSubBonusBudget`. The existing `SpinResult` remains the source of truth for `steps`, line wins, cascades, total win, and ordinary retriggers. The UI renders the sock column and paw strike from the typed payload; it does not calculate wild positions, multipliers, spin allocation, or payouts.

## Presentation and audio beats

Normal motion:

- Joey settles into a perch overlapping the upper half of the reel cabinet and remains there for the chapter.
- A sock drops over one middle reel with a soft fabric flutter and a clear full-column wild conversion.
- Joey’s paw reaches down and strikes one cell with a compact comic impact, multiplier badge, and short boogie accent.
- When both effects occur, the paw chase overlaps the sock drop rather than waiting for a second round.

Reduced motion:

- Keep Joey’s perch and reel overlap static.
- Replace the drop and paw impact with fades/direct state changes.
- Preserve the affected-reel highlight, marked multiplier label, and accessible announcement.

Suggested original copy: **“Joey is on laundry duty.”** / **“Joey caught it. Joey enhanced it.”** Avoid brand references, quoted media lines, or hot-drink imagery.

## Interaction with existing bonuses

- **Compatible primitive:** the existing Joey wild symbol, opening-result multiplier marker, and ordinary cascade evaluation.
- **Presentation reuse:** Joey’s boogie cue, saucer entrance, wild landing treatment, and multiplier badge.
- **Not nested:** Doorbell Panic, Treat Time, Bold Chai, the AskJamie Wheel, and another UniGlee trigger.
- **Not inherited automatically:** `Double Sparkle`, `Facts-on-Facts`, and `Drop-In Saucer`. Any super-bonus composition must have a separate typed rule and RTP evidence.
- **Retriggers:** the ordinary cascade ladder remains eligible. Added spins are credited to Laundry Helper’s own sub-bonus queue and must be exhausted before the next UniGlee sub-bonus begins. Laundry Helper itself does not award a separate bonus session.

## Tests and acceptance gates

Pure engine tests must prove:

- seeded output is deterministic;
- every sock target is exactly reel 2, 3, or 4 visually, never reel 1 or 5;
- a sock drop produces exactly four ordinary Joey wild cells in the selected column;
- every paw target is exactly reel 2, 3, or 4 visually, never reel 1 or 5;
- every paw multiplier is exactly 2, 3, or 5—never 10—and marks exactly one cell;
- sock and paw effects can be absent, can occur separately, and can occur together;
- same-reel overlap leaves one multiplier wild inside the four-cell sock column;
- multiplier markers apply only to lines using their marked cell and do not reproduce on cascade drops;
- the effect adds no free spins and does not recurse into another chapter or trigger;
- the resulting grid remains 5×4 and ordinary payline evaluation/cascade behavior still runs;
- one effect is emitted per counted round at most, not per cascade step.

Integrated validation must measure the effect’s contribution inside the 300/400/500-spin UniGlee sessions. The UniGlee-wide RTP gate remains the canonical **96% ±0.5** target; this chapter contract does not claim a standalone RTP result.

## Open decisions before final math

1. Sock-drop probability per Laundry Helper round.
2. Paw-strike probability per Laundry Helper round.
3. Relative 2×/3×/5× weights. The existing We're Multiplying rules may be used as a reference, but ×10 is excluded.
4. Whether a sock column may be selected again on the immediately following round.
5. Final Joey perch art, sock art, impact animation, audio cue, and player-facing copy.
