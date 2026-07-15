# Moonlit Keepsake Trail — memory-match bonus proposal

**Date:** 2026-07-15  
**Status:** revised implementation-ready proposal; ready for Jamie approval  
**Scope:** replace the current 35% keepsake wheel wedge with a dedicated interactive bonus screen. This document does not authorize source changes by itself.

## 1. Decision-shaped summary

The keepsake wedge changes only the reel staging area. When the AskJamie wheel lands on **Moonlit Keepsake Trail**, the game swaps the contents of the existing 5×4 reel window—using the same width, height, safe-area spacing, and surrounding controls—for a dedicated moonlit memory-match board, like the separate Bold Chai bonus scene. The trail is literal: a winding path uses the landing page's night-garden visual language, and the 12 cards sit over it as keepsake waypoints.

The player first sees **12 cards** arranged as six randomly arranged matching pairs. The cards use the existing standard gameplay symbols only. After the preview, all cards turn face-down. The player selects two cards at a time:

- a match stays face-up and play continues;
- a mismatch counts one strike, both cards turn back down, and the player may try again;
- the second mismatch ends the bonus;
- clearing all six pairs awards exactly **40 free spins**.

Failure awards zero free spins. There is no partial award, no wheel re-spin, no multiplier, no wild rain, and no keepsake trail relay. The successful handoff is a standard free-spin session with normal cascade retriggers, not another modifier.

Player-facing name: **Moonlit Keepsake Trail**  
Entry line: **Follow the trail. Match the keepsakes. Chase the chai.**

## 2. Exact player loop

1. Keep the current 35% wheel share for the first math pass so the wedge replacement is isolated. The runtime wedge becomes `keepsake_memory`.
2. On entry, the engine samples six distinct eligible standard symbols from the existing paying-symbol pool, duplicates each once, and applies a seeded Fisher–Yates shuffle to make 12 card slots.
3. The dedicated screen shows all 12 card fronts for exactly **2,500 ms**. A visible “Memorize the keepsakes” prompt and a progress label (`0 / 6 pairs`) are shown; no input is accepted during the preview.
4. The cards flip face-down. The player taps one unmatched card, then one different unmatched card.
5. On a match, both cards remain face-up and locked. `pairsFound` increases by one. If it reaches six, resolve success immediately and award 40 free spins.
6. On a mismatch, reveal both cards for **900 ms**, increment `fails`, then turn both back down. If `fails` becomes two, resolve failure after the reveal; otherwise return to first-card selection.
7. Tapping a matched card, tapping the currently selected first card again, or tapping while cards are resolving is ignored and does not add a strike.
8. The bonus ends only in `success` or `failed`. There is no timeout and no third strike.
9. On success, start exactly 40 standard free spins. Existing cascade retriggers remain active and can extend the session through the normal ladder. The memory screen itself never appears again inside those free spins.
10. On failure, show the warm result message and return to the main board with no free-spin session.

The card game is deterministic after its seed and card arrangement. The UI never decides whether a pair matches; it submits card-index picks to the pure engine state machine.

## 3. Card pool and presentation values

| Value | Contract |
|---|---|
| Player-facing wedge | Moonlit Keepsake Trail |
| Runtime wedge | `keepsake_memory` |
| Initial wheel share | 35% for first simulation pass |
| Cards | Exactly 12 |
| Pairs | Exactly 6 pairs |
| Pair selection | Six distinct symbols, each duplicated once |
| Arrangement | Seeded random permutation of all 12 cards |
| Layout | 3 columns × 4 rows over a winding trail, inside the exact existing reel staging rectangle |
| Preview | 2,500 ms, all fronts visible |
| Mismatch reveal | 900 ms |
| Strike limit | Exactly 2 mismatches |
| Success award | Exactly 40 standard free spins |
| Failure award | 0 free spins |
| New assets | None; reuse existing standard symbol art and original card-back styling |
| Persistence | None; transient bonus state only |

Eligible standard symbol IDs are exactly:

`tumbler`, `butterfly`, `mixtape`, `crystal`, `chai`, `candle`, `cassette`, `gnome`, `mailbox`, `vhs`, `teapot`, `yarn`.

Excluded from the card pool: `wild_joey`, `wild_phoebe`, `uniglee`, `doorbell`, `chai_pump`, `treat_chicken`, `treat_salmon`, and `treat_bougie`. Their player-facing art or special behavior must not appear on a memory card.

The card backs should be original deep-purple cards with restrained gold accents and the butterfly/crystal-ball motif described below. Do not add a repeated twelve motif to the card backs or surrounding decoration; the twelve-card count is the one explicit rule of this bonus.

## 4. Typed engine contract

Add a pure state machine beside the existing engine features. It should not import DOM or timers; the UI owns the 2,500 ms preview and 900 ms mismatch animation delays.

```ts
export type KeepsakeMemoryPhase =
  | "preview"
  | "choosing_first"
  | "choosing_second"
  | "resolving_match"
  | "resolving_mismatch"
  | "complete"
  | "failed";

export interface KeepsakeMemoryCard {
  index: number; // 0..11, stable for this bonus
  symbol: KeepsakeSymbolId;
  revealed: boolean;
  matched: boolean;
}

export interface KeepsakeMemoryState {
  kind: "keepsake_memory";
  phase: KeepsakeMemoryPhase;
  cards: KeepsakeMemoryCard[];
  firstPick?: number;
  pairsFound: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  fails: 0 | 1 | 2;
  maxFails: 2;
  freeSpinsAwarded: 0 | 40;
}

export type KeepsakeMemoryEvent =
  | { kind: "preview_complete" }
  | { kind: "card_revealed"; index: number }
  | { kind: "match"; indices: [number, number]; pairsFound: number }
  | { kind: "mismatch"; indices: [number, number]; fails: 1 | 2 }
  | { kind: "completed"; freeSpinsAwarded: 40 }
  | { kind: "failed"; freeSpinsAwarded: 0 };

export interface KeepsakeMemoryActionResult {
  state: KeepsakeMemoryState;
  accepted: boolean;
  event?: KeepsakeMemoryEvent;
  reason?: "preview" | "invalid_index" | "matched_card" | "same_card" | "resolving" | "ended";
}
```

Required pure functions:

- `createKeepsakeMemory(rng): KeepsakeMemoryState` — selects six distinct standard symbols and shuffles their pairs.
- `beginKeepsakeMemory(state): KeepsakeMemoryState` — changes `preview` to `choosing_first`; no card order changes.
- `pickKeepsakeMemoryCard(state, index): KeepsakeMemoryActionResult` — handles one player pick and emits the typed event.
- `resolveKeepsakeMemoryMismatch(state): KeepsakeMemoryState` — turns the two pending cards down and returns to `choosing_first`, or `failed` when the second strike was used.

Boundary changes:

- Replace `"giant_gnome"` with `"keepsake_memory"` in `WheelWedge` and the 35% weight entry.
- Add a dedicated `KeepsakeMemoryState`/`KeepsakeMemoryActionResult` contract; do not reuse `KeepsakeZone` or the former reel modifier payload.
- Add an explicit `"standard"` free-spin mode for the 40-spin success handoff, or an equivalent named mode that cannot accidentally select Multiplying, Wild Rain, Treat Time, or another wedge.
- Keep the memory result outside ordinary `SpinResult` cascade math. The bonus is an interactive secondary scene; its only handoff to the regular session is `freeSpinsAwarded: 40 | 0`.
- The UI renders state and sends card indices. It does not compare symbols, count pairs, count strikes, or award spins.

## 5. Dedicated screen and audio beats

The screen uses the same mobile shell and accessibility conventions but a distinct staging-area scene:

- preserve the existing status bar, Chai Sparks meter, balance, wager controls, SPARKLE! control, Treat Jar, AskJamie perch, safe-area spacing, and command hierarchy;
- replace only the inner contents of the existing reel staging rectangle with the landing page's midnight-violet PNW night-garden palette and atmospheric depth;
- draw a visible path/trail from the foreground toward the aurora underneath the cards, with soft stepping-stone or moonlit edge details;
- lay the 3×4 card grid over that path. The path is atmospheric only and never changes card order or engine state;
- treat each card as a keepsake waypoint: six selected standard symbols appear twice among the 12 stops;
- use the full 5×4-stage canvas for the 12-card composition: three wider card columns, four rows, generous gutters, and enough open path around each card for match halos;
- use large, high-contrast card faces and touch targets at least 48px without expanding the board beyond the regular reel window;
- a clear strike indicator: `Strikes 0 / 2`, `1 / 2`, or `2 / 2`;
- a clear progress indicator: `Pairs 0 / 6` through `6 / 6`;
- do not duplicate the command UI inside the staging area and do not hide the persistent controls behind a full-screen bonus page.

The path should be implemented as a responsive CSS/inline-SVG layer or a tightly cropped/recomposed use of the existing original landing-page atmosphere. Do not broadly regenerate the protected landing art, import private references, or make a new raster-art dependency just for the trail. Cards remain the visual foreground and must stay readable over the path at iPhone size. Do not draw connective lines between matched cards; the pair relationship is communicated by the cards' shared revealed symbol and glow.

Card treatment:

- These are keepsake memory cards, not a standard playing-card deck and not casino-style cards.
- Card backs use deep purple with restrained gold accents and one original butterfly/crystal-ball motif: a butterfly inside the crystal ball or perched on it. Keep the motif simple enough to read at card size.
- Card fronts use the existing standard symbol art, centered on a warm light field with the same deep-purple/gold frame language.
- The first selected card receives a bright active outline/glow. The second selected card receives the same active treatment until the pair resolves, so the two cards in play read immediately without a connector line.
- A matched pair keeps a calmer gold glow and becomes locked face-up. A mismatch puts the same red circle-with-slash “not a match” overlay over both cards before they turn down.
- The bottom of the staging area shows two mismatch markers. They begin unfilled; the first failed comparison fills the first marker, and the second fills the second marker before the bonus-ending message appears.

Card flip:

- Use a visible page-turn from back to front, not a dissolve or instant symbol swap.
- Anchor the turn on the card's right edge with `transform-origin: right center`; the right edge stays visually planted while the left edge rotates through the turn.
- Author four clear transform checkpoints across the flip: back at 0°, narrow edge-on midpoint, front approaching full face, and front settled at 180°.
- Use the same four-checkpoint turn for the face-down transition, reversed. Use transform/opacity only and preserve the existing reduced-motion crossfade fallback.

Copy:

- Entry heading: **MOONLIT KEEPSAKE TRAIL**
- Entry subheading: **Six keepsakes. Twelve stops. One path to follow.**
- Preview: **The trail is laid out. Memorize the keepsakes…**
- Match: **Pair found. Keep following the trail.**
- First mismatch: **A near-match. The trail is still glowing.**
- Final mismatch: **The keepsakes are taking a little night walk.**
- Success: **All six pairs found! 40 free spins for the chai chase.**
- Failure: **The trail is resting. No free spins this time — the night is still lovely.**

Failure copy must not shame the player or imply a quiet board is punishment.

Animation:

- The trail fades/settles in first; the 12 cards then appear as bright stops along it.
- 12-card preview fades/settles in, then all cards turn face-down while the path remains visible underneath.
- A picked card performs the four-checkpoint right-edge page-turn and receives the active glow.
- The second picked card performs the same turn and receives the active glow until the pair resolves.
- A match gets a bright gold outline that settles to a calmer matched glow and stays face-up; no line or thread is drawn between the cards.
- A mismatch gets the red circle-with-slash overlay over both cards, fills the next bottom mismatch marker, holds for the 900 ms reveal window, then turns both cards back down unless it was the second failure.
- On the second failure, the second marker fills, the staging area displays a clear overlaid “Trail over — no free spins this time” message, then returns to the main board.
- On the sixth match, the staging area displays a clear overlaid “All six pairs found! You win 40 free spins!” message, then transitions to the standard free-spin entry.
- Success uses a keepsake shimmer; failure uses a gentle fade back to the board.
- Reduced motion replaces flips/wobbles with crossfades and preserves all state announcements.

Audio remains original Web Audio synthesis:

- Entry: soft page-turn texture, a subtle footstep/path shimmer, plus a three-note aurora motif.
- Preview: six gentle paired chimes, one per pair, at low intensity.
- Card flip: one short original click/chime.
- Match: warm two-note resolution with a light cat purr accent.
- Mismatch: muted low chord, never a harsh error buzzer.
- Success: expanding keepsake shimmer into the existing bonus fanfare.
- Failure: a soft unresolved chord that resolves warmly on return to the board.
- Sound mute and reduced-intensity behavior remain exact.

## 6. Tests required before implementation is accepted

Pure engine tests:

- `createKeepsakeMemory()` always creates 12 cards, six distinct symbols, exactly two copies of each, and a seeded reproducible permutation.
- The card pool never contains wilds, UniGlee, blockers, treats, or any other non-standard feature symbol.
- `beginKeepsakeMemory()` accepts no picks during `preview` and changes only the phase.
- A valid first pick reveals one card and enters `choosing_second`.
- A second pick of the same card, an invalid index, a matched card, or a pick during resolution is rejected without changing `fails`.
- A matching second pick locks both cards, increments `pairsFound`, and does not increment `fails`.
- Five successful matches leave the state active with `pairsFound: 5` and `freeSpinsAwarded: 0`.
- The sixth successful match emits `completed` and awards exactly 40 free spins.
- The first mismatch emits `mismatch`, increments `fails` to 1, and after resolution returns to `choosing_first` with both cards face-down.
- The second mismatch emits `failed`, increments `fails` to 2, ends the bonus, and awards zero free spins.
- A mismatch never changes `pairsFound`; already matched cards remain face-up and unselectable.
- A completed or failed state rejects all subsequent picks.
- The success handoff starts exactly 40 `standard` free spins, does not invoke the wheel again, and does not apply Multiplying, Wild Rain, Treat Time, or the old keepsake modifier.
- Standard cascade retriggers during the 40 spins remain finite and are counted by the existing session summary.

UI/QA checks:

- The existing command UI remains in the same locations and the staging area has the same bounding box before, during, and after the bonus.
- The 3×4 grid is legible and usable at 390×844; cards have enough width for match backgrounds and path breathing room, and card controls expose symbol/matched/revealed state through accessible labels without spoiling unrevealed cards.
- Preview, mismatch resolution, and success/failure transitions honor reduced motion.
- Keyboard activation and screen-reader announcements do not permit a second pick before the first resolves.
- No reel-only controls or main-board meter are accidentally interactive behind the overlay.

## 7. Math, twelve exception, and open decisions

- The 40-spin success award is a fixed product rule, but the expected value is skill-dependent. The engine owner must add two diagnostic simulation bounds before tuning: always-fail (0% clears) and perfect-clear (100% clears). A documented player-model assumption is required for the release RTP gate; the UI must not expose a success probability or odds claim.
- The 35% wheel share remains a first-pass assumption. Re-run the seeded RTP, free-spin, 8+ cascade, UniGlee, Treat Time, and bonus-frequency diagnostics with the memory bonus included. Do not weaken the existing 96% ±0.5 gate; the current checkpoint is already below target at 93.54%.
- The memory bonus has no payout multiplier and no direct coin award. Its only economic output is 40 ordinary free spins after a perfect clear, which makes the success-rate model the main math variable.
- This request intentionally creates a narrow exception to S21: twelve cards/six pairs is a rule of this one memory bonus because Jamie explicitly wants that count here. It is not permission to add twelve to levels, caps, multipliers, charms, pick shelves, or general copy. Record this as the next settled decision before implementation; do not silently rewrite S21.
- The existing legacy wedge and `KeepsakeZone` behavior must not remain reachable from the active wheel. Historical documentation may retain old identifiers only as migration context.
- No new art, private data, analytics event, persistent save field, brand reference, hot-chai imagery, or copyrighted audio is needed.
