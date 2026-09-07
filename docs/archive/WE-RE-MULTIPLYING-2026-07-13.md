# We're Multiplying — Approved Bonus Rules

**Date:** 2026-07-13

**Status:** approved by Jamie

**Scope:** replacement contract for the legacy multiplier description in `docs/DESIGN-SPEC.md` §7.

## Per counted free spin

Roll once before the initial reel result. Each counted free spin is independent.

| Outcome | Chance | Marked wild placement |
|---|---:|---|
| No multiplier | 15% | None |
| ×2 | 35% | One wild on reel 2 |
| ×3 | 30% | One wild on reel 3 |
| ×5 | 15% | One wild on reel 4 |
| ×10 | 5% | One wild on reel 5 |

The marked wild has an original `×2`, `×3`, `×5`, or `×10` overlay. Exactly one marked multiplier wild may be visible for a counted free spin. Normal wilds may still land.

## Award and cascade behavior

- A marked wild multiplies only a winning payline that uses that wild. Other winning paylines retain their ordinary value.
- The multiplier is assigned only on the initial reel result. If the marked wild survives gravity, it remains marked; newly dropped cascade symbols never gain a multiplier.
- Cascades do not roll, create, replace, or stack a multiplier wild.
- The next counted free spin makes a fresh independent roll. Retriggered free spins are counted spins and are eligible in the same way.
- There is no per-bonus cap on any multiplier. A bonus may contain zero to all multiplier spins, may repeat a value—including ×10—and may contain any combination of the four values.

This supersedes the retired 4×, 8×, and 12× multiplier behavior. It intentionally does not use twelve as a multiplier motif, in accordance with decision S21.
