---
name: Slot-game QA via temporary export hooks
description: How to visually verify rare/timed overlay states (wheel, cat pop-in, bonus screens) when only a static screenshot tool is available, no click interaction.
---

The screenshot tool can load a URL/path but cannot click buttons or wait for
timed async UI to progress within one session. To verify low-probability or
multi-step overlay flows (e.g. a wheel bonus, an animated pop-in) without
real interaction:

1. Temporarily export the internal function that renders the overlay
   (e.g. `export { showCatPopIn as __qaShowCatPopIn }`).
2. Add a throwaway `location.hash` branch in the entry point that calls it
   directly with synthetic data, bypassing the normal trigger odds/gesture
   gating.
3. Screenshot the hash route(s) to confirm the overlay renders correctly.
4. Remove both the export alias and the hash branch before finishing —
   they are not a real feature and must not ship.

**Why:** These flows are often rare (sub-1% per spin) or require multiple
real user actions to reach, so waiting for them naturally isn't practical
within a single QA pass, but skipping visual verification of new overlay
code risks shipping a silent rendering bug.

**How to apply:** Use this pattern any time new full-screen/overlay UI is
added that's gated behind game-state RNG or multi-step async sequencing and
the environment's screenshot tool can't drive real interaction.
