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

export const TREAT_JAR_FREE_SPINS: Record<TreatKind, number> = {
  chicken: 5,
  salmon: 7,
  bougie: 10,
};

/**
 * Cat-specific saucer/pop-in copy drawn from the Glee-fully vernacular.
 * Keep the pools separate: Phoebe gets affectionate sparkle, while Joey gets
 * big-boy bravado, Bougie standards, and professional judgment.
 */
export const CAT_QUIP_POOLS = {
  phoebe: {
    fed: [
      "Freak'n facts on facts — Phoebe approves.",
      "OMG stop — this is so Glee-coded.",
      "Literally the cutest. Phoebe knew it.",
      "Phoebe, oh, you're so skinny and so slender.",
      "I love you more... I love you most, Phoebe.",
      "Do you love this? Wait. No. REALLY love it?",
      "Phoebe found the sparkle. Nobody panic.",
      "Phoebe approves the weirdness.",
      "OMG, that's adorable. Phoebe is obsessed.",
      "This is giving night-garden magic.",
      "Phoebe has entered her magical snack era.",
      "I love you more... I love you most, darling.",
      "Phoebe has feelings about this, and they are excellent.",
    ],
    unfed: [
      "Phoebe has reviewed your offering. Phoebe is unmoved.",
      "Phoebe is positively bedeviled by this empty jar.",
      "Phoebe wants a snack. This is a serious situation.",
      "Let me think about it... okay, back. Phoebe needs treats.",
      "Phoebe is not mad. Phoebe is just snack-deprived.",
      "No treat? Phoebe will consult the stars.",
      "Phoebe has feelings about this empty jar.",
      "This is a snack emergency, darling.",
      "Phoebe is waiting for a little more sparkle.",
      "The jar is giving mystery. Phoebe requires snacks.",
    ],
  },
  joey: {
    fed: [
      "Joey, show me what a big boy you are.",
      "Oh, you're such a big tough boy.",
      "Joey requires Bougie Bites. Joey approves of this jar.",
      "Joey approves. Freak'n facts on facts.",
      "OMG stop — Joey is so Glee-coded.",
      "Literally the cutest big tough boy.",
      "I love you more... I love you most, Joey.",
      "Joey brought the boogie. Facts on facts.",
      "The Bougie Bites have spoken.",
      "Joey is a big boy with a big sparkle.",
      "Big tough boy, maximum sparkle.",
      "Joey is handsome, helpful, and very serious about snacks.",
      "Joey is here to make an entrance and a meal.",
      "Joey says this board has excellent taste.",
    ],
    unfed: [
      "Joey requires Bougie Bites. Joey is a professional.",
      "Joey requires Bougie Bites. Joey is positively bedeviled.",
      "No Bougie Bites? Joey is waiting for the bougie treatment.",
      "Joey has standards. Joey is a professional.",
      "Joey sees no Bougie Bites. Joey sees a staffing issue.",
      "No Bougie, no boost. Joey has standards.",
      "Joey will return when the premium snacks arrive.",
      "Joey is not leaving; Joey is negotiating.",
      "Joey is a professional, but this is a snack emergency.",
      "The big tough boy has filed a Bougie complaint.",
    ],
  },
} as const;

function pickCatQuip(cat: "joey" | "phoebe", fed: boolean, variationRoll: number): string {
  const pool = CAT_QUIP_POOLS[cat][fed ? "fed" : "unfed"];
  return pool[Math.floor(variationRoll * pool.length)] ?? pool[0];
}

export interface TreatCollectionResult {
  jar: TreatJar;
  freeSpinsAwarded: number;
}

export interface TreatJarSettlement {
  jar: TreatJar;
  freeSpinsAwarded: number;
  completed: TreatKind[];
}

export function emptyTreatJar(): TreatJar {
  return { chicken: 0, salmon: 0, bougie: 0 };
}

/** Resolves any completed bags already present in a persisted jar. */
export function settleTreatJar(jar: TreatJar): TreatJarSettlement {
  const next = { ...jar };
  const completed: TreatKind[] = [];
  let freeSpinsAwarded = 0;
  for (const treat of ["chicken", "salmon", "bougie"] as const) {
    const completions = Math.floor(next[treat] / TREAT_JAR_CAP);
    if (completions < 1) continue;
    next[treat] %= TREAT_JAR_CAP;
    freeSpinsAwarded += completions * TREAT_JAR_FREE_SPINS[treat];
    for (let i = 0; i < completions; i++) completed.push(treat);
  }
  return { jar: next, freeSpinsAwarded, completed };
}

/** Adds one treat and pays/resets only the bag that reaches twelve. */
export function collectTreat(jar: TreatJar, treat: TreatKind): TreatCollectionResult {
  const next = { ...jar };
  next[treat] += 1;
  if (next[treat] < TREAT_JAR_CAP) return { jar: next, freeSpinsAwarded: 0 };

  next[treat] = 0;
  return { jar: next, freeSpinsAwarded: TREAT_JAR_FREE_SPINS[treat] };
}

/** Backward-compatible jar-only helper for callers that do not need rewards. */
export function addTreat(jar: TreatJar, treat: TreatKind): TreatJar {
  return collectTreat(jar, treat).jar;
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

  const catRoll = rng();
  const isPhoebe = catRoll < 0.6; // 60/40 split — docs §6
  // Reuse the cat-selection roll for copy variation so presentation copy does
  // not consume an extra gameplay RNG value and perturb seeded simulations.
  const variationRoll = isPhoebe ? catRoll / 0.6 : (catRoll - 0.6) / 0.4;
  if (isPhoebe) {
    const hasAnyTreat = jar.chicken > 0 || jar.salmon > 0 || jar.bougie > 0;
    return hasAnyTreat
      ? { cat: "phoebe", fed: true, assist: "sparkle_sort", quip: pickCatQuip("phoebe", true, variationRoll) }
      : {
          cat: "phoebe",
          fed: false,
          assist: "shuffle_consolation",
          quip: pickCatQuip("phoebe", false, variationRoll),
        };
  }

  // Joey — CANON S7: only assists when Bougie Bites are stocked.
  return jar.bougie > 0
    ? { cat: "joey", fed: true, assist: "drop_in", quip: pickCatQuip("joey", true, variationRoll) }
    : { cat: "joey", fed: false, assist: "shuffle_consolation", quip: pickCatQuip("joey", false, variationRoll) };
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
