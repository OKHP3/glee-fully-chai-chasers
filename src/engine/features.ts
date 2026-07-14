/**
 * Feature systems: Treat Jar collection and Cat Pop-Ins.
 * Pure TS, zero DOM. Spec: docs/DESIGN-SPEC.md §6. Canon: docs/CANON.md, S7.
 *
 * Vertical-slice note: this covers the pop-in decision + treat-consumption
 * rule (the part that's canon-load-bearing and testable). The richer
 * assist animations (Sparkle Sort blast, Drop-In Saucer, Bougie Boost) are
 * UI-layer follow-up work — see docs/REPLIT-HANDOFF.md.
 */
import type { CatVisit, TreatKind } from "./types";
import type { Rng } from "./rng";

export interface TreatJar {
  chicken: number;
  salmon: number;
  bougie: number;
}

export const TREAT_JAR_CAP = 12;

export function emptyTreatJar(): TreatJar {
  return { chicken: 0, salmon: 0, bougie: 0 };
}

export function addTreat(jar: TreatJar, treat: TreatKind): TreatJar {
  const next = { ...jar };
  next[treat] = Math.min(TREAT_JAR_CAP, next[treat] + 1);
  return next;
}

const BASE_POP_IN_RATE = 1 / 32; // docs §6 target ~1/30, pity-weighted below

/**
 * Rolls whether a cat pops in this spin. `spinsSincePopIn` powers the pity
 * timer (rate doubles after 15 dry spins — docs §6).
 */
export function rollCatVisit(
  rng: Rng,
  jar: TreatJar,
  spinsSincePopIn: number,
): CatVisit | undefined {
  const rate = spinsSincePopIn >= 15 ? BASE_POP_IN_RATE * 2 : BASE_POP_IN_RATE;
  if (rng() >= rate) return undefined;

  const isPhoebe = rng() < 0.6; // 60/40 split — docs §6
  if (isPhoebe) {
    const hasAnyTreat = jar.chicken > 0 || jar.salmon > 0 || jar.bougie > 0;
    return hasAnyTreat
      ? { cat: "phoebe", fed: true, assist: "sparkle_sort", quip: "Freak'n facts on facts — Phoebe approves." }
      : {
          cat: "phoebe",
          fed: false,
          assist: "shuffle_consolation",
          quip: "Phoebe has reviewed your offering. Phoebe is unmoved.",
        };
  }

  // Joey — CANON S7: only assists when Bougie Bites are stocked.
  return jar.bougie > 0
    ? { cat: "joey", fed: true, assist: "drop_in", quip: "Joey requires Bougie Bites. Joey approves of this jar." }
    : { cat: "joey", fed: false, assist: "shuffle_consolation", quip: "Joey requires Bougie Bites. Joey is a professional." };
}

/** Consumes the treat a fed cat's visit used up (jar rules per canon S7). */
export function consumeForVisit(jar: TreatJar, visit: CatVisit): TreatJar {
  if (!visit.fed) return jar;
  const next = { ...jar };
  if (visit.cat === "joey") {
    next.bougie = Math.max(0, next.bougie - 1);
  } else {
    // Phoebe eats whichever treat is available, preferring the rarest first.
    if (next.bougie > 0) next.bougie -= 1;
    else if (next.salmon > 0) next.salmon -= 1;
    else if (next.chicken > 0) next.chicken -= 1;
  }
  return next;
}
