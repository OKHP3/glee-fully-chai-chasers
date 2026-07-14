# Keepsake Constellation — approved engine contract

**Date:** 2026-07-13
**Status:** approved implementation amendment for the legacy `giant_gnome` wheel ID.

Keepsake Constellation is the 35% free-spin-wheel wedge formerly represented by a flat legacy giant-symbol uplift. It now has real board math.

## Per free spin

Exactly one zone roll occurs before the opening grid. The distribution is unconditional per free spin:

| Result | Covered positions | Chance |
|---|---:|---:|
| No giant | 0 | 27% |
| 2×2 | 4 | 19% |
| 2×3 | 6 | 15% |
| 2×4 | 8 | 11% |
| 3×2 | 6 | 15% |
| 3×3 | 9 | 8% |
| 3×4 | 12 | 5% |

A zone uses a contiguous rectangle on reels 2–4 only (zero-based engine reels 1–3). A two-reel zone begins on reel 2 or 3; a three-reel zone begins on reel 2. Height is placed wherever the full rectangle fits in the four rows. No zone can touch reel 1 or reel 5.

## Icon and payout rules

Every covered cell carries one shared paying icon, so it participates in ordinary left-to-right payline evaluation at every position it covers. Treat Bags, the Doorbell, UniGlee, and all future non-paying/special-trigger icons are excluded. Standard paying keepsakes are eligible; Joey and Phoebe wild icons are eligible at 1% each (2% combined) of giant-icon selections.

## Cascade rules

The rectangle's size, location, and orientation are locked for the entire spin. If a winning payline uses any covered cell, ordinary winning symbols resolve and the giant zone receives a newly rolled, different eligible icon before the next cascade evaluation. The rectangle itself does not shrink, move, or disappear. Symbols above and below it fall within their own open spaces; it is a physical fixed obstacle. Once the cascade chain reaches a dead board, the next free spin rolls a new zone independently.
