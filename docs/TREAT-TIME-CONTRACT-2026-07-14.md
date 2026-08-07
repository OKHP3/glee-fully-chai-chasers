# Treat Time — Player-Facing Bonus Contract

**Date:** 2026-07-14

**Status:** Release contract for the current `main` implementation

**Scope:** Bounded Treat Time close-out; no new bonus chapter or art pass

## Player promise

Treat Time is a rare direct bonus on the primary Chai Chase board. After the
entry reveal, Joey and Phoebe keep the chase sparkling through a short run of
free spins. Every counted spin receives a visible treat toss before cascade
evaluation.

Treat Time never uses hot-drink imagery, purchase language, casino language,
brand references, or photos of Glee.

## Trigger and award

Treat Time is rolled once after a completed base-board spin, using its separate
RNG stream so the established cascade stream remains stable. It is not an
AskJamie Wheel wedge and cannot trigger from a secondary bonus board.

| Mode | Base trigger rate | Initial award | Treat behavior |
|---|---:|---:|---|
| Morning | 1 in 100 | 7–14 free spins | Chicken Comets only; every token becomes a Phoebe wild |
| Nighttime | 1 in 300 | 14–50 free spins | 45% Chicken Comets, 35% Salmon Stars, 20% Bougie Bites |

The default combined rate is 1 in 75. When the default probability slices
overlap, Nighttime takes precedence because it is the rarer mode.

## Mode presentation

Morning uses a bright butter-and-mint treatment and Phoebe's warm discovery
cue. Nighttime uses deeper violet/aurora color and the fuller Joey/Phoebe cue.

Nighttime mapping is canonical: Chicken Comets and Salmon Stars create Phoebe
wilds; Bougie Bites create Joey wilds. This preserves the standing rule that
Phoebe accepts any treat while Joey accepts only Bougie Bites.

The entry card says **IT'S TREAT TIME!**, names the mode-specific discovery,
and shows the initial spin count. Treat tokens visibly travel from the lower
edge of the cabinet to their destinations. Reduced motion places them directly.

## Spin and session rules

- Each round casts 2–10 unique board positions.
- A cast token is represented in engine state as its character wild before the
  round's first cascade evaluation.
- Treat Time does not recursively trigger Treat Time.
- Existing cascade-meter retriggers remain active and extend the same session.
- Treat Time is presented before any other free-spin session earned by the
  same base spin; the other session is then shown rather than discarded.
- The session ends when its remaining-spin count reaches zero and reports total
  Glee-coins, best cascade, and retriggers.

## Typed payload

The engine remains pure TypeScript. The base result carries:

```ts
treatTimeBonus?: {
  mode: "morning" | "nighttime";
  freeSpinsAwarded: number;
};
```

Each Treat Time free-spin round carries `treatTimeMode` and a deterministic
`treatTimeWilds` list. Each wild includes its `[reel, row]`, treat kind
(`chicken`, `salmon`, or `bougie`), and resulting cat (`joey` or `phoebe`).
The UI owns timing, copy, and animation only; it does not perform bonus math.

## Verification gates

- Morning and Nighttime award boundaries remain inclusive and seeded.
- Default trigger rates remain approximately 1/100, 1/300, and 1/75 combined.
- Secondary/free-spin boards do not create a new Treat Time trigger.
- Mode-to-treat-to-cat mapping is preserved.
- Every cast uses 2–10 unique positions and preloads the first round.
- Sessions terminate and account for ordinary cascade retriggers.
- The existing Treat Time unit suite and production build must pass before
  release.

This contract records the behavior already present on `main`; it does not
expand the initial release into UniGlee's marathon or a new secondary game.
