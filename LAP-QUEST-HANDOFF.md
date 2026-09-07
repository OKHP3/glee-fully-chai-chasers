# Phoebe's Lap Quest — Measurement Handoff

**Measured:** 2026-09-07
**Scope:** Workstream B, add canonical Lap Quest act 5 to the full-game RTP harness.

## Harness behavior

`scripts/sim-agent.ts` now runs Lap Quest after UniGlee acts 1–4. It mirrors the live chapter's seeded 15–90 second Joey-arrival window, 900 ms inter-round pause, and cascade-dependent round presentation time. A round already in progress when Joey arrives completes before the chapter ends.

The player models printed in every report are:

- Bold Chai Pump: steady 6 pumps/second for the full 30-second window.
- Moonlit Keepsake Trail: perfect memory; always completes and receives the 40-spin handoff.
- Phoebe's Lap Quest: random uniform among the three offered spots; 1-in-3 perfect lap; pets often enough to prevent inactivity, so the chapter ends at Joey's seeded arrival.

Lap Quest uses a separate seeded player-choice RNG so the simulated human tap does not consume or perturb the chapter engine RNG.

## Exact fleet

```bash
seq 1 40 | xargs -P4 -I{} sh -c \
  'pnpm exec tsx scripts/sim-agent.ts a{} {} 50000 > seed-{}.json'
```

- Seeds: 1 through 40 inclusive
- Paid spins per seed: 50,000
- Total paid spins: 2,000,000
- Total bet: 80,000,000 fictional Glee-coins

## Results — reproducible 40-seed run (2026-09-07)

| Measure | Result |
|---|---:|
| Pooled full-game RTP | 105.7904% |
| 95% CI on per-seed mean | 104.8220% to 106.7588% |
| Per-seed standard deviation | 3.12 points |
| Per-seed span | 100.53% to 114.00% |
| Base contribution | 61.0510% |
| Bonus contribution | 44.7394% |
| Lap Quest contribution | 7.0924% |
| UniGlee captures / Lap Quests played | 1,628 / 1,628 |
| Lap Quest rounds played | 36,052 |
| Bonus sessions terminated by session cap | **0** |
| Engine `terminatedByCascadeCap` activations | **0** |
| Dedicated Lap Quest soak cap activations | **0** |

The previous published 98.70% was not full-game RTP: the harness stopped after UniGlee act 4. Adding act 5 moved this measured reading upward without changing any payout, reel, trigger, or tuning constant.

## Reproducibility boundary

The previously recorded `~98.1%` estimate is not included as a measured result here because its
exact commands, seed range, player model, and pooled totals were not preserved. The result above
is the reproducible value for this implementation and run definition; it should not be blended with
that historical estimate when evaluating D8.

## Dedicated Lap Quest soak

Exact soak configuration: 5,000 rounds, 20 seeds (`0` through `19`), 250 rounds per seed,
cycling the three offered spots, with each round using a seeded challenge and seeded round RNG.
Every round was required to return with a final no-win step.

| Measure | Result |
|---|---:|
| Rounds | 5,000 |
| Seeds / rounds per seed | 20 / 250 |
| Cascade-cap terminations | **0** |
| Minimum / maximum step count | 1 / 39 |
| Known sticky-wild reproduction (`(0,3) (1,2) (2,2) (3,2)`) | 7 steps, cap **false** |

The known reproduction was also exercised directly with `mulberry32(99)`, an all-tumbler
starting grid, and the four documented `wild_phoebe` sticky positions. It returned a terminal
no-win step and a finite payout.

## Validation

- `pnpm vitest run src/engine/sim-agent-harness.test.ts`
- `pnpm vitest run src/engine/simulation.test.ts --reporter=verbose`
- `pnpm test`
- `pnpm run build`

The spec oracle remains a base-game oracle. Its six thresholds were not changed or weakened.