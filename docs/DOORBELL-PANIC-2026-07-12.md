# Doorbell Panic Bonus — 2026-07-12

Approved bounded bonus amendment from Jamie. This document complements the canonical game specification; it does not replace the reel, payline, or free-spin rules elsewhere.

## Player-facing behavior

- An original illustrated house doorbell may land on reels 1 or 2 only.
- One doorbell alone is a blocker: it pays nothing, cannot be part of a winning line, and remains in place through cascades.
- Two doorbells on the first two positions of any fixed payline trigger **Stranger Danger Panic**.
- The trigger awards a random 5–20 free spins and bypasses the normal free-spin wheel.
- The trigger banner remains visible while Joey and Phoebe begin fleeing; the triggering doorbells are highlighted as the board's dead space.
- Each panic spin preloads 3–6 Joey/Phoebe wilds onto randomly selected payline coordinates before ordinary cascade evaluation. They remain ordinary wilds for payout purposes, but receive the panic landing animation.

## Implementation boundary

The trigger, blocker behavior, award roll, and panic wild placement are pure TypeScript under `src/engine/`. The board owns only the banner, animation, audio cue, and presentation of the typed result. The doorbell is original inline SVG art; it uses no real-product logo, name, or trade dress.

## Acceptance checks

- Doorbells appear only in the first two reels.
- A single doorbell never pays or removes a line symbol.
- A same-payline first/second-reel pair awards an integer from 5 through 20.
- Panic rounds contain 3–6 injected Joey/Phoebe wilds and remain finite/non-negative.
- Existing cascade/free-spin tests and the production build remain green.
