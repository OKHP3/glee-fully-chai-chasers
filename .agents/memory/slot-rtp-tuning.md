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

- **Rule:** Full-game simulation must keep player-input RNG separate from engine RNG and reproduce any presentation timing that controls bonus length.
  - **Why:** A human Lap Quest choice does not consume the seeded chapter stream, while the ledge's Joey-arrival clock and per-round animation time determine how many paying rounds finish. Sharing RNG or treating it as one round changes both outcomes and RTP.
  - **How to apply:** Give modeled player actions their own seeded stream, state every interaction assumption in report output, and translate live waits/animation durations into deterministic headless elapsed time.

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
Target: total RTP (base + bonuses) 95-98%. Best current estimate: **~98.1%**
(external multi-agent validation, several million paid spins, 2026-08-11).
Base ~61% + bonus layer ~37%. PAYOUT_SCALE is the final linear solve knob.
**Why:** every win (base and bonus) flows through the same paytable ×
PAYOUT_SCALE, so total RTP is exactly linear in it — do structural cuts first
(award spins, trigger rates, ladder values), then solve scale =
old_scale × target/measured in one step.
**How to apply:** one 5×5k fleet is too noisy for a 95-98% band (UniGlee
variance swings ±8pp); pool ≥150k spins before trusting the mean. Player-facing
copy (board meter text) and DESIGN-SPEC/IMPLEMENTATION-BASELINE tables hardcode
old numbers — grep them after every retune.

## Sample-size warning for full-game RTP with rare events
The internal 40-seed 2,000,000-spin fleet measured 105.79% — a statistical
overestimate. With 1-in-1,229 UniGlee events, per-seed variance is ~3 points sd;
2M paid spins is not enough to converge. The external multi-agent fleets (several
million spins, two independent deployments) converged on ~98.1%.
**Why:** rare bonus triggers create high per-seed variance. The standard error
of the mean at 40 seeds with sd=3.12 is ±0.77pp (95% CI), which means a run
that oversamples rare seeds will sit well above true RTP.
**How to apply:** treat any internal fleet below ~5,000,000 paid spins as an
estimate with meaningful uncertainty when UniGlee-class events (1-in-1,000+)
contribute significantly to total RTP. Cross-validate with independent runs.
