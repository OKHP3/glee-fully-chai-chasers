# Handbag Wild — 2026-07-14

## Product contract

The Handbag Wild is a rare, non-cat wild inspired by Glee's everyday love of compact crossbody handbags. The shipped art is an original, generic satchel illustration: no person, logo, monogram, brand pattern, or product trade dress is used.

- Engine ID: `wild_handbag`
- Source master: `asset-source/handbag-wild.png`
- Runtime placement: `public/assets/atlases/special-symbol-atlas.{png,webp}`
- Placement: one candidate on reel 5 only; the candidate lands as the special wild 85% of the time, keeping it a rare late-reel surprise.
- Multiplier roll: ×3 (55%), ×5 (35%), or ×10 (10%).
- Payout: the multiplier scales the complete winning line payout, so a ×3 handbag contributes three times the line-bet-scaled value. It never creates a second currency or a cash-like award.
- Availability: the same reel strips and cascade refill path are used by primary and secondary bonus boards, so the symbol can appear in bonuses without a separate bonus-only injection.
- Line behavior: it substitutes for every paying symbol and pays as the matched symbol; a handbag-only line therefore pays as the Mermaid Tumbler.

## Simulation gate

With the existing 40-line paytable and `PAYOUT_SCALE`, the seeded 200,000-spin oracle moved from 93.54% RTP to 95.91%. The approved 95.5%–96.5% release band remains intact, while the existing win, free-spin, mega-cascade, UniGlee, and cat-visit gates remain green.

The tuning is intentionally bounded: the late-reel location, 85% landing gate, and multiplier distribution are the release contract. Any future change must be simulation-backed and must not weaken the RTP oracle.

## Provenance

Generated with the built-in image workflow on 2026-07-14 from an original game-symbol prompt, then processed locally with the project image-generation skill's chroma-key removal helper. The source master has an alpha background and is kept outside `public/`; the generated special atlas is the only handbag art shipped. The supplied reference photos are not copied into the repository or bundle.

---

## Implementation delta as of 2026-08-09

**This note records a divergence. It does not rewrite the 2026-07-14 ruling or S30 above, which stand as ruled.**

The Handbag Wild mechanic itself is unchanged and still matches this contract: one reel-5 candidate, an 85% landing gate, x3 / x5 / x10 multiplier weights of 55 / 35 / 10, full-line multiplication, and shared reel strips across primary and bonus boards.

What is stale is the **simulation gate figure**. The "moved from 93.54% RTP to 95.91%" reading was taken before the 2026-07 RTP retune, which changed Treat Time rates and lengths, Doorbell Panic awards, the Firefly meter ladder, retrigger behavior, and the Treat Jar cap. The 95.91% number no longer describes any measurement of this engine and should not be quoted.

| Item | Documented above | Re-measured 2026-08-09 | Command |
|---|---|---|---|
| Seeded oracle RTP | 95.91% | **61.08%**, and the oracle is now understood as a **base-game-only** measurement | `npx vitest run src/engine/simulation.test.ts --reporter=verbose` |
| Full-game RTP, all bonuses played | not measured at the time | **98.70%** over 2,000,000 paid spins, seeds 1 to 40, 95% CI 97.93% to 99.47%, per-seed span 94.16% to 106.78% | `for s in $(seq 1 40); do npx tsx scripts/sim-agent.ts a$s $s 50000; done` |

The confusion worth naming: the pre-retune 95.91% was read as a whole-game figure, but the oracle in `src/engine/simulation.test.ts` only ever measured the base game. Full-game RTP requires `scripts/sim-agent.ts`, which plays every bonus through the same engine entry points `src/ui/board.ts` uses.

This contract's approved 95.5% to 96.5% band should therefore be read against the fleet figure, not the oracle, and **the fleet figure does not meet it**. At 98.70% with the whole confidence interval above 98%, the full game now sits above both this contract's band and the project's wider 95% to 98% band. That gap is open as **D8** in `docs/DECISION-LOG.md` and is a documentation-accuracy question, not a player-facing defect. Note also that 98.70% assumes a perfect player on the two interactive bonuses, so it is a generous-play ceiling rather than an expected value.

The Handbag Wild is not the cause. It is one of the smaller contributors, and the fleet attributes the largest shares to firefly free spins at 10.64% and UniGlee at 7.47%. Do not retune this symbol in response to D8 without Jamie's ruling and a fresh fleet measurement.

The tuning contract above is otherwise intact. Any future change to the late-reel location, the 85% landing gate, or the multiplier distribution must still be simulation-backed and must not weaken the oracle.
