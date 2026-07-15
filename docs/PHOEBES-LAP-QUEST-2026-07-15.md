# Phoebe’s Lap Quest — Chapter Contract

**Date:** 2026-07-15
**Status:** bounded UniGlee chapter proposal and implementation contract
**Scope:** pure engine chapter result plus a reusable mobile presentation hook

This amendment extends the existing one-round vertical slice into an implementation-ready, timed Lap Stay overlay contract. The current reusable hook still demonstrates one round; the parent UniGlee session must supply the live timer/input loop after the open math decisions below are approved.

Phoebe’s Lap Quest is a chapter inside the UniGlee marathon. It is not a new base-game trigger, does not enter the AskJamie Wheel, and does not launch another free-spin session.

## Player loop

1. At a UniGlee chapter boundary, Phoebe tests three cozy places: **Window Perch**, **Blanket Nest**, and **Moonlit Cushion**.
2. The player taps one card. Every choice is positive; one hidden place is the perfect lap and gives the strongest comfort-wild set.
3. The reveal places Phoebe across a small illustrated ledge at the top of the game board. The standard symbols continue falling and cascading underneath her.
4. For the first **15 seconds**, Phoebe is in a grace period: no petting is required, and Joey cannot interrupt. The player may tap/click Phoebe during this time, but taps do not shorten or extend the hidden Joey deadline.
5. After the grace period, the player must pet Phoebe at least once every **5 seconds**. A valid tap on Phoebe resets the inactivity watchdog. Tapping the reels, controls, or empty overlay does not count.
6. While Phoebe remains settled, Lap Stay points accrue over elapsed time. The visible “points” are `lapCoinsAwarded` and settle as fictional Glee-coins; this is not a new currency. Petting sustains the session but does not award extra points merely through tap volume.
7. At session start, the engine samples one hidden Joey arrival time between **15 and 90 seconds**. If the player is still sustaining Phoebe when that time arrives, Joey jumps on screen, Phoebe runs off the ledge, and the session ends immediately.
8. If the player stops petting after the grace period, Phoebe leaves on her own after about **5 seconds**, before Joey needs to arrive. Already banked Glee-coins remain awarded.
9. A hard marathon-owned cap must end the session cleanly even if every Joey and inactivity condition is avoided.

The engine owns the hidden perfect-place roll, choice result, sampled Joey deadline, inactivity outcome, point accrual, wild positions, and board effect. The UI owns the ledge/cat hit target, clock scheduling, cards, reveal timing, copy, animation, and audio only.

## Values and boundaries

| Item | Contract |
|---|---|
| Choices | Exactly 3 unique spots per chapter entry |
| Non-perfect choice | 2 fixed `wild_phoebe` comfort-wilds |
| Perfect-lap choice | 4 fixed `wild_phoebe` comfort-wilds |
| Placement | Unique positions across the 5×4 board; seeded RNG |
| Overlay | Phoebe lies across an original illustrated ledge layered above the five-reel board; reels remain active underneath |
| Grace period | 15 seconds with no player involvement required |
| Pet input | Click/tap on Phoebe’s bounded hit target; each accepted pet resets the 5-second inactivity watchdog |
| Joey arrival | One hidden seeded deadline in the 15–90 second window; petting does not reroll it |
| Self-exit | If no accepted pet occurs for about 5 seconds after grace, Phoebe leaves and the session ends |
| Lifetime | Wall-clock session until Joey, inactivity, or the marathon-owned safety cap |
| Lap award | Points accrue from active elapsed time using the configured `lapCoinsAwarded` ladder; exact values remain RTP-gated |
| Disturbance | Joey interruption is an engine-owned seeded stop event; abrupt presentation, no loss of already banked Glee-coins |
| Payout | Ordinary payline evaluation plus the explicitly reported Lap Stay award; no new currency |
| Retrigger | Existing cascade ladder may add marathon spins; Lap Quest adds no nested bonus |
| Recursion | Doorbell Panic, Bold Chai, Treat Time, and UniGlee are suppressed in every Lap Stay round |

The 2/4 values are intentionally explicit tunables. They are structural defaults for this vertical slice, not an RTP claim; the UniGlee simulation must measure their contribution before final marathon tuning.

The Lap Stay is intentionally a session-shaped contract, not a final math table. The parent UniGlee marathon supplies the award ladder, Joey arrival distribution, and hard cap until simulation-backed values are approved.

## Board contract

Comfort-wilds are `wild_phoebe` cells marked with `sticky: "lap_quest"`. A winning line may include them, but cascade removal must never remove their fixed positions. Non-sticky winning cells in the same line resolve normally. Fresh cascade drops never gain the sticky marker.

The marker is a board-state property, not a new paying symbol. The normal 40-line evaluator remains authoritative, and the UI must not calculate a payout from the marker.

## Typed result contract

```ts
export type LapQuestSpot =
  | "window_perch"
  | "blanket_nest"
  | "moonlit_cushion";

export interface LapQuestChallenge {
  choices: readonly LapQuestSpot[];
  perfectSpot: LapQuestSpot; // engine state; never shown before selection
}

export interface StickyWild {
  position: [reel: number, row: number];
  symbol: "wild_phoebe";
  sticky: "lap_quest";
}

export interface LapQuestChoiceResult {
  kind: "lap_quest_choice";
  selectedSpot: LapQuestSpot;
  perfectLap: boolean;
  comfortWilds: StickyWild[];
}

export type LapQuestEndReason = "joey_interrupt" | "unpetted" | "cap_reached" | "marathon_ended";

export type LapQuestPhase = "grace" | "petting" | "ended";

export interface LapQuestSessionConfig {
  minDurationMs: 15_000;
  maxDurationMs: 90_000;
  inactivityTimeoutMs: 5_000;
  pointTickMs: number; // parent marathon supplies the math-approved interval
  lapCoinsByTick: readonly number[]; // parent marathon supplies the RTP-approved ladder
}

export interface LapQuestSessionState {
  kind: "lap_quest_state";
  phase: LapQuestPhase;
  startedAtMs: number;
  lastPetAtMs: number | null;
  nextPointAtMs: number;
  lapCoinsAwarded: number;
  petCount: number;
  /** Engine-only; never reveal the exact Joey deadline to the player. */
  joeyArrivalAtMs: number;
}

export interface LapQuestPetResult {
  kind: "lap_quest_pet";
  accepted: true;
  petCount: number;
  lapCoinsAwarded: number;
}

export interface LapQuestRoundResult extends FreeSpinRoundResult {
  kind: "lap_quest_round";
  beatIndex: number;
  selectedSpot: LapQuestSpot;
  perfectLap: boolean;
  comfortWilds: StickyWild[];
}

export interface LapQuestBeatResult {
  kind: "lap_quest_beat";
  beatIndex: number;
  round: LapQuestRoundResult;
  lapCoinsAwarded: number;
  lapCoinsTotal: number;
  disturbanceTriggered: boolean;
}

export interface LapQuestSessionResult {
  kind: "lap_quest_session";
  selectedSpot: LapQuestSpot;
  perfectLap: boolean;
  beats: LapQuestBeatResult[];
  lapCoinsAwarded: number;
  paylineCoinsAwarded: number;
  endReason: LapQuestEndReason;
}
```

`LapQuestRoundResult` extends the existing `FreeSpinRoundResult`, so it remains compatible with the current `SpinResult`/`CascadeStep` rendering boundary.
`lapCoinsAwarded` is the settlement field the marathon parent adds to the player’s Glee-coin balance; UI copy may call it “points,” but no second balance is introduced.

## Presentation and audio

- Entry: warm aurora dim, Phoebe sprite settles near three illustrated card silhouettes, then the player chooses.
- Reveal: the chosen card glows; non-perfect choices still receive an affectionate “cozy lap” result, while the perfect choice gets the larger purr swell.
- Lap Stay: each safe beat adds a small visible point pulse and keeps Phoebe settled. Later pulses can be brighter or more numerous, but their exact ladder is a math/open-decision item.
- Ledge: Phoebe rests across the board’s top edge while the reels continue below. The pet hit target is bounded to her illustrated silhouette and must not block reel controls.
- Grace: the first 15 seconds show a calm “Phoebe is settling in” state with no demand for input.
- Petting: after grace, a small speech bubble appears to come from Phoebe’s mouth with an explicit request such as “Pet me, please!”; taps produce a purr/paw response, refresh the bubble with affectionate insistence, and reset a subtle five-second care indicator. Do not expose the exact Joey deadline.
- Disturbance: Joey enters from off-screen at the sampled deadline, Phoebe’s ears perk, the lap glow snaps off, and she runs off the ledge before the session summary. Do not depict or imply harm.
- Self-exit: if the care indicator expires, Phoebe quietly stands and leaves on her own; this is a warm timeout, not a punishment state.
- Board: comfort-wilds land with a soft cushion-pop and a low purr pulse. Sticky cells use a subtle pink/mint ring that remains legible on iPhone.
- Copy: Glee-Rich and warm; examples include “Phoebe is conducting a comfort survey…” and “Perfect lap located. Phoebe has made a decision.”
- Audio: reuse Phoebe’s original purr/trill family, with a distinct low settling chord for the perfect lap. Muting and reduced motion remain exact.

## Tests and acceptance

- The challenge always contains exactly three unique valid spots, and the seeded perfect spot is one of them.
- Every valid choice yields a result; non-perfect produces 2 wilds and perfect produces 4.
- Positions are unique, in-bounds, and marked `wild_phoebe`/`sticky: "lap_quest"`.
- Sticky positions survive every cascade step, including when a winning line uses them.
- Fresh drops are not sticky; Lap Quest does not create Doorbells, Chai Pumps, Treat Time, or nested UniGlee triggers.
- A completed point tick banks its configured award; a disturbance ends the session abruptly without erasing prior banked awards.
- No Joey deadline is sampled before 15 seconds or after 90 seconds; the deadline is not rerolled by petting.
- No accepted pet is required during grace; after grace, five seconds without a pet produces `unpetted`.
- The result reports `joey_interrupt`, `unpetted`, `cap_reached`, or `marathon_ended` explicitly; no caller infers termination from an empty array.
- The result remains finite, non-negative, 5×4, and 40-payline compatible.
- A seeded run produces the same challenge, choice result, positions, and round result.
- The production build and existing test suite remain unchanged except for the known RTP oracle failure documented in `AGENTS.md`.

## Deliberate non-goals

- No new currency, standalone bonus frequency, or base-board symbol.
- No hot chai, steam, mug, private photo, brand reference, or external-media cue.
- No attempt to solve the full UniGlee award distribution or overall RTP in this chapter slice.

## Math and open decisions

- Parent marathon owner must set the award ladder (`lapCoinsAwarded` per point tick), Joey arrival distribution, and hard session cap.
- Parent marathon owner must define how wall-clock point ticks align with board rounds/cascades and how an interrupted in-flight round settles.
- Decide the Joey arrival distribution inside the fixed 15–90 second bounds; the deadline should be sampled once, not continuously rerolled.
- Decide whether the five-second inactivity timer starts exactly at 15 seconds or after the first post-grace pet. This proposal uses **exactly at 15 seconds**.
- Decide whether the perfect-lap result changes only comfort-wild count (current structural default) or also the disturbance curve/cap. Do not silently couple the two.
- Simulate ordinary payline wins plus Lap Stay awards together before release; do not claim a standalone Lap Quest RTP.
- The private reference photos are inspiration only. No photo, likeness, pose trace, or private-room detail becomes a shipped asset.
