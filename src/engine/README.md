# src/engine — pure game math

Zero DOM imports. Everything deterministic under a seeded RNG. Vitest coverage required before UI consumes a module.

| Module | Responsibility | Status |
|---|---|---|
| `types.ts` | Shared types, free-spin ladder, config | ☑ stub |
| `rng.ts` | Seedable mulberry32, weighted pick | ☑ ready |
| `reels.ts` | Reel strips (symbol weights per reel), spin → Grid, gravity refill | ☐ TODO |
| `paylines.ts` | 40 fixed lines, left-to-right evaluation, wild substitution, paytable | ☐ TODO |
| `cascade.ts` | Cascade loop: evaluate → remove → refill → repeat; meter; specialty-wild queue (one per dead board, extras queue) | ☐ TODO |
| `features.ts` | Cat visits (Phoebe any-treat / Joey bougie-only, pity weighting), UniGlee package, wheel modifiers, Chai Bonus pick math | ☐ TODO |
| `economy.ts` | Balance/bet/win in Sparks, automatic refill trigger, XP/levels, daily bonus gating | ☐ TODO |

Required tests (see docs/DESIGN-SPEC.md §5):
- payline evaluation against hand-computed grids
- cascade ladder awards exact FREE_SPIN_LADDER values incl. double_sparkle
- 1M-spin RTP simulation within ±0.5% of targetRtp
- treat-jar rules: Joey never assists without bougie treat; Phoebe assists with any
- balance can never strand below one max bet (refill invariant)
