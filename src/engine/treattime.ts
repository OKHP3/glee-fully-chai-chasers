/**
 * Treat Time bonus math. Pure TypeScript, zero DOM.
 *
 * Morning is Phoebe's Chicken Comet warm-up. Nighttime is the rarer,
 * more valuable spread: Chicken Comets, Salmon Stars, and Joey's Bougie Bites.
 */
import type { Grid, SymbolId, TreatKind, TreatTimeMode, TreatTimeTrigger, TreatTimeWild } from "./types";
import { REELS, ROWS } from "./reels";
import type { Rng } from "./rng";

export const TREAT_TIME_TRIGGER_RATES: Record<TreatTimeMode, number> = {
  morning: 1 / 250,
  nighttime: 1 / 500,
};

export const TREAT_TIME_SPIN_RANGES: Record<TreatTimeMode, readonly [number, number]> = {
  morning: [5, 8],
  nighttime: [8, 14],
};

export const TREAT_TIME_WILD_RANGE = { min: 0, max: 4 } as const;

/**
 * Rolls a Treat Time trigger. With the default "either" mode, the two
 * frequencies remain independently readable: 1/100 morning and 1/300
 * nighttime, with the rarer mode taking precedence if its slice lands.
 */
export function rollTreatTimeTrigger(
  rng: Rng,
  mode: TreatTimeMode | "either" = "either",
): TreatTimeTrigger | undefined {
  const roll = rng();
  let selected: TreatTimeMode | undefined;

  if (mode === "morning") {
    if (roll < TREAT_TIME_TRIGGER_RATES.morning) selected = "morning";
  } else if (mode === "nighttime") {
    if (roll < TREAT_TIME_TRIGGER_RATES.nighttime) selected = "nighttime";
  } else if (roll < TREAT_TIME_TRIGGER_RATES.nighttime) {
    selected = "nighttime";
  } else if (roll < TREAT_TIME_TRIGGER_RATES.nighttime + TREAT_TIME_TRIGGER_RATES.morning) {
    selected = "morning";
  }

  if (!selected) return undefined;
  const [min, max] = TREAT_TIME_SPIN_RANGES[selected];
  return {
    mode: selected,
    freeSpinsAwarded: min + Math.floor(rng() * (max - min + 1)),
  };
}

function treatForMode(rng: Rng, mode: TreatTimeMode): TreatKind {
  if (mode === "morning") return "chicken";
  const roll = rng();
  if (roll < 0.45) return "chicken";
  if (roll < 0.8) return "salmon";
  return "bougie";
}

function wildForTreat(treat: TreatKind): Extract<SymbolId, "wild_joey" | "wild_phoebe"> {
  return treat === "bougie" ? "wild_joey" : "wild_phoebe";
}

/**
 * Casts 0–4 unique treats from the lower-left sweep onto a 5×4 board.
 * Treats are immediately represented in engine state as their character wild,
 * while the UI uses the returned metadata to animate the visible cast.
 */
export function castTreatTimeWilds(
  rng: Rng,
  grid: Grid,
  mode: TreatTimeMode,
): { grid: Grid; wilds: TreatTimeWild[] } {
  const candidates: Array<[number, number]> = [];
  for (let reel = 0; reel < REELS; reel++) {
    for (let row = 0; row < ROWS; row++) candidates.push([reel, row]);
  }

  const count = TREAT_TIME_WILD_RANGE.min + Math.floor(rng() * (TREAT_TIME_WILD_RANGE.max - TREAT_TIME_WILD_RANGE.min + 1));
  const nextGrid = grid.map((column) => column.map((cell) => ({ ...cell })));
  const wilds: TreatTimeWild[] = [];

  for (let i = 0; i < count; i++) {
    const candidateIndex = Math.floor(rng() * candidates.length);
    const position = candidates.splice(candidateIndex, 1)[0];
    const treat = treatForMode(rng, mode);
    const wild = wildForTreat(treat);
    nextGrid[position[0]][position[1]] = { symbol: wild };
    wilds.push({ position, treat, wild: wild === "wild_joey" ? "joey" : "phoebe" });
  }

  return { grid: nextGrid, wilds };
}
