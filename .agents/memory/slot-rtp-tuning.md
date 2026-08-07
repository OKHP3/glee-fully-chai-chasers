---
name: Slot RTP tuning coupling
description: Non-obvious couplings between trigger frequencies, base RTP, and the spec oracle in the slot engine.
---

# Slot RTP tuning coupling

- **Rule:** Any change to UniGlee trigger frequency shifts base-game RTP, not just bonus RTP.
  - **Why:** Trigger placement writes a guaranteed line-valid win prefix onto the board plus a specialty-wild queue and double-sparkle, so triggered spins pay richly in the base stream. Cutting the rate from 1/400 to ~1/1,277 dropped base RTP ~1.9pp (96.1% → 94.2% over the 200k-spin oracle).
  - **How to apply:** After touching UniGlee rates, re-measure base RTP and either rebalance payouts or update the oracle band with sign-off — never assume base RTP is untouched.

- **Rule:** The spec oracle (`simulation.test.ts`) only measures base-game RTP; bonus sessions are never played out there.
  - **Why:** Runaway bonus economies (supercritical Treat Time retriggers) were invisible to a green oracle while full-game RTP was ~16,900%.
  - **How to apply:** Use `scripts/sim-agent.ts` (5 agents × 5,000 paid spins, foreground parallel bash with explicit `wait`) to measure full-game RTP after any bonus tuning. Detached/nohup processes die between tool calls.

- **Lesson:** Additive per-reel trigger odds combine as the sum — three "rare" rates are dominated by the most frequent one; rarity must be set on the combined rate.

## Retrigger blocking (2026-07)
Retriggers are blocked engine-wide: `runFreeSpinSession` and
`runJoeyLaundrySession` zero each round's `freeSpinsAwarded` and never extend
the session, so every bonus plays exactly its initial award.
**Why:** retrigger chains were the dominant RTP inflator (UniGlee sessions ran
~691 spins on a 375-spin average award; full-game RTP halved from ~685% to
~371% once blocked).
**How to apply:** any new bonus must route through these runners (or zero its
own in-bonus awards); the `allowRetriggers` option is a deprecated no-op, and
an engine-wide invariant test in freespins.test.ts guards the block.

## Full-game RTP shape (2026-07 rebalance)
Target: total RTP (base + bonuses) 95-98%. Landed ~96.1% (210k-spin pooled
fleets) as base ~61% + bonus layer ~35% with PAYOUT_SCALE as the final linear
solve knob.
**Why:** every win (base and bonus) flows through the same paytable ×
PAYOUT_SCALE, so total RTP is exactly linear in it — do structural cuts first
(award spins, trigger rates, ladder values), then solve scale =
old_scale × target/measured in one step.
**How to apply:** one 5×5k fleet is too noisy for a 95-98% band (UniGlee
variance swings ±8pp); pool ≥150k spins before trusting the mean. Player-facing
copy (board meter text) and DESIGN-SPEC/IMPLEMENTATION-BASELINE tables hardcode
old numbers — grep them after every retune.
