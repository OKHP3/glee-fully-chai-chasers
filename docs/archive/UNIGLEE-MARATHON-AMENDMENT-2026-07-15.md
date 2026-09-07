# UniGlee Marathon Bonus — Amended Release Contract

**Date:** 2026-07-15  
**Status:** implemented release contract; chapter payout math remains simulation-gated
**Scope:** replaces the earlier random award-builder and 20–25-spin chapter-block proposal

## Entry award

UniGlee activates only when its symbol appears on reel 3, 4, or 5 and terminates a valid same-symbol/wild prefix on one of the 40 paylines. The symbol remains non-paying. The initial award is determined by the activating reel:

| Activating reel | Initial award |
|---:|---:|
| 3 | 300 free spins |
| 4 | 400 free spins |
| 5 | 500 free spins |

The initial award is direct. There is no random 100-spin base, award-building sequence, or 20–25-spin award block. The capture animation may still show a short magical entry sequence before play begins.

## Five-act order

1. **Joey’s Laundry Helper** — always first.
2. **We’re Multiplying**, **Keepsake Collection**, and **Nighttime Treat Time** — one each, in a seeded random order.
3. **Phoebe’s Lap Quest** — always last as an additive sweetener.

The first four acts each receive exactly one quarter of the initial award:

| Initial award | Each of acts 1–4 |
|---:|---:|
| 300 | 75 |
| 400 | 100 |
| 500 | 125 |

Ordinary retriggers earned during acts 1–4 are credited to that act’s local queue and must be exhausted before the next act begins. They do not change the next act’s base allocation.

Phoebe’s Lap Quest has no quarter allocation. Any Lap Quest spins or direct Glee-coin awards are additive and must be included in the final marathon totals. Its exact award ladder, duration, and safety cap remain math decisions.

## Accounting boundary

The parent session must report, without UI recomputation:

- initial UniGlee award;
- base spins for each of the first four acts;
- retrigger spins earned and played by each act;
- Lap Quest extra spins and direct Glee-coins;
- total spins actually played;
- total Glee-coins won across all board wins and Lap Quest awards.

The previous “total session cannot exceed 500” rule is superseded. The 300/400/500 ceiling applies to the initial award; local retriggers and Lap Quest extras may increase actual spins played. A separate simulation-backed marathon safety cap is still required before the full runner ships.

## Presentation boundary

The existing UniGlee capture takeover remains the entry shell, but the release presentation must show the exact initial award before act 1. Chapter transitions show the current act, its local spins remaining, and the next act. The conclusion returns the butterfly in a full signature entrance and reports the complete accounting above.

UniGlee music is a separate original Web Audio score from the base Chai Chase loop. It should be upbeat, faster, edgy, and built as a long-form variation set of at least one minute, with lower-intensity fast-mode and reduced-motion equivalents. No recognizable melody, sample, brand, or artist imitation may ship.

## Engine contract

`src/engine/uniglee.ts` owns the seeded five-act plan and quarter allocations only. It does not launch nested bonus sessions or decide payout math. Existing chapter modules remain responsible for their own typed round effects. The eventual parent runner must compose those results and keep all retriggers local to the active act.

The release implementation is split across `src/engine/uniglee.ts`, `src/engine/uniglee-marathon.ts`, `src/engine/cascade.ts`, and the existing chapter engines. The live main-spin path now emits a typed active-line trigger; acts 1–4 resolve through chapter-local queues; the existing interactive Lap Quest runs last; and the UI reports one marathon total. Keepsake Collection uses the existing locked-zone math, while Nighttime Treat Time and We're Multiplying reuse their settled round modifiers.

Release defaults are explicit: Laundry uses a 25% sock-drop rate, 18% paw-strike rate, and 60/30/10 weights for ×2/×3/×5. Each base act has a deterministic 500-spin safety ceiling; reaching it terminates that act and reports the cap in its typed session result. The ceiling is a termination guard, not a payout retune.

Browser reload persistence for an in-flight marathon and a user-facing fast-mode/skip control remain outside this initial playable handoff; the bonus is resolved deterministically before presentation and the browser-local game save is settled after each chapter.

## Required gates before player-facing enablement

- active reel/payline trigger frequency is simulated, not inferred from the old `1/400` gate;
- 300/400/500 initial awards are deterministic from the activating reel;
- the middle order is seeded and contains each candidate exactly once;
- local retriggers cannot leak across act boundaries;
- Lap Quest extras reconcile into total spins and total Glee-coins;
- pause/resume, fast mode, skip-to-summary, and reload persistence are deterministic for a later marathon-controls pass;
- the full 96% ±0.5 RTP oracle and all repository tests remain green.
