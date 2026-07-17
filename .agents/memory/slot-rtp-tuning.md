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
Target: total RTP (base + the common bonuses) 95-98%. Landed ~96.5% as base
~61% + common-bonus layer ~35% with PAYOUT_SCALE as the final linear solve
knob.
**Why:** every win (base and bonus) flows through the same paytable ×
PAYOUT_SCALE, so total RTP is exactly linear in it — do structural cuts first
(award spins, trigger rates, ladder values), then solve scale =
old_scale × target/measured in one step.
**How to apply:** one 5×5k fleet is too noisy for a 95-98% band (UniGlee
variance swings ±8pp); pool ≥150k spins (ideally several million — UniGlee
occurs only ~1-in-1,300, so its own contribution needs a large sample before
trusting the mean) before trusting the mean. Player-facing copy (board meter
text) and DESIGN-SPEC/IMPLEMENTATION-BASELINE tables hardcode old numbers —
grep them after every retune.

## UniGlee is exempt from the 95-98% band (S33, 2026-07-17)
**Rule:** UniGlee's award reverted from 40/60/80 back to the original
300/400/500 (S30) at its existing ~1-in-1,300 rate, with NO compensating
frequency or PAYOUT_SCALE change. Fleet-verified at 6M pooled paid spins:
baseRTP unaffected (~60.7%), UniGlee alone now contributes ~48pp, total
full-game RTP ~139%.
**Why:** there's no real-money stake in this game, so a rare, generous jackpot
pushing measured RTP over 100% is an intentional feature ("the coins never run
out"), not a defect. The 2026-07-16 engine-wide retrigger block already solved
the actual runaway-session risk (unbounded spin counts); it never solved
RTP magnitude, which is a separate, purely linear function of award size.
**How to apply:** PAYOUT_SCALE and the 95-98% band target base + the common
bonuses only (Treat Jar, Doorbell Panic, Bold Chai, Treat Time, Sparkle Wheel).
Never fold UniGlee's contribution into that band, and never lower
PAYOUT_SCALE or re-cut UniGlee's rate to force total RTP back under 100% — see
`src/engine/paylines.ts` and DECISION-LOG S33 before touching either.

## UniGlee tease sighting + rarer real capture (S34, 2026-07-17)
**Rule:** two independent additions on top of S33. (1) A non-paying,
purely decorative UniGlee sighting can land on reels 3/4/5 at ~1-in-850
(`UNIGLEE_TEASE_RATE` in `reels.ts`) — separate roll, separate RNG draw, never
sets `unigleeTriggered`, zero RTP cost. (2) The real capture rate
(`UNIGLEE_REEL_RATES` in `uniglee.ts`) moved from 1/2500,1/4000,1/7500
(~1-in-1,300 combined) to 1/8000,1/16000,1/20000 (~1-in-4,200 combined) —
same reel-3<4<5 shape, scaled 4x rarer. Award sizes (300/400/500) unchanged.
Fleet-verified at 6M pooled paid spins post-S34: base RTP ~60.4% (down about
a point from the S33 baseline), UniGlee's own RTP share dropped from ~48pp to
~14.5pp, full-game RTP now ~103% (down from S33's ~139%).
**Why:** modeled on Invaders from the Planet Moolah's UniCow, which appears
far more often than it pays — seeing the symbol without winning builds "is
she near?" anticipation without making the real event routine. The base-RTP
drop is expected and was absorbed by retuning `simulation.test.ts`'s oracle
band (60.9%->59.7%, UniGlee-rate band shifted to bracket ~1-in-4,200), not by
touching PAYOUT_SCALE — the drop comes from losing guaranteed-prefix
base-stream wins on the now-rarer real capture, plus the new rare tease
blocker occasionally eating a cell, both tiny, both already-precedented
mechanisms (see the "Slot RTP tuning coupling" rule at the top of this file).
**How to apply:** the tease and the real capture are two separate rates by
design — never conflate them, and never grep-replace one when asked to retune
the other. If UniGlee's feel needs another pass, retune the *real* capture
rate (economic/rarity lever) or the *tease* rate (pure feel/anticipation
lever) independently, and re-run both the oracle and a multi-million-spin
fleet sim (`scripts/sim-agent.ts`) before calling it done — UniGlee's rarity
means a 200k-spin single sample is noisy for its own rate specifically, even
though it's fine for base RTP.
