/**
 * Phoebe's Lap Quest chapter. Pure TypeScript, zero DOM.
 *
 * The chapter is a UniGlee adapter: it resolves one player choice, injects
 * fixed Phoebe comfort-wilds into one secondary-board round, and then reuses
 * the ordinary cascade/payline engine.
 */
import type { FreeSpinRoundResult } from "./freespins";
import { spin } from "./cascade";
import { emptyTreatJar } from "./features";
import { spinGrid } from "./reels";
import type { Rng } from "./rng";
import type { LapQuestSpot, StickyWild } from "./types";

export const LAP_QUEST_SPOTS: readonly LapQuestSpot[] = [
  "window_perch",
  "blanket_nest",
  "moonlit_cushion",
];

export const LAP_QUEST_SPOT_LABELS: Readonly<Record<LapQuestSpot, string>> = {
  window_perch: "Window Perch",
  blanket_nest: "Blanket Nest",
  moonlit_cushion: "Moonlit Cushion",
};

export const LAP_QUEST_WILD_COUNTS = {
  cozy: 2,
  perfect: 4,
} as const;

export interface LapQuestChallenge {
  choices: readonly LapQuestSpot[];
  /** Engine-only state; do not reveal before the player selects a card. */
  perfectSpot: LapQuestSpot;
}

export interface LapQuestChoiceResult {
  kind: "lap_quest_choice";
  selectedSpot: LapQuestSpot;
  perfectLap: boolean;
  comfortWilds: StickyWild[];
}

export interface LapQuestRoundResult extends FreeSpinRoundResult {
  kind: "lap_quest_round";
  selectedSpot: LapQuestSpot;
  perfectLap: boolean;
  comfortWilds: StickyWild[];
}

function shuffle<T>(rng: Rng, values: readonly T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createLapQuestChallenge(rng: Rng): LapQuestChallenge {
  const choices = shuffle(rng, LAP_QUEST_SPOTS);
  const perfectSpot = choices[Math.floor(rng() * choices.length)];
  return { choices, perfectSpot };
}

function allBoardPositions(): Array<[reel: number, row: number]> {
  const positions: Array<[number, number]> = [];
  for (let reel = 0; reel < 5; reel++) {
    for (let row = 0; row < 4; row++) positions.push([reel, row]);
  }
  return positions;
}

function chooseComfortWilds(rng: Rng, count: number): StickyWild[] {
  return shuffle(rng, allBoardPositions())
    .slice(0, count)
    .map(([reel, row]) => ({
      position: [reel, row] as [number, number],
      symbol: "wild_phoebe" as const,
      sticky: "lap_quest" as const,
    }));
}

export function resolveLapQuestChoice(
  challenge: LapQuestChallenge,
  selectedSpot: LapQuestSpot,
  rng: Rng,
): LapQuestChoiceResult {
  if (!challenge.choices.includes(selectedSpot)) {
    throw new RangeError(`Lap Quest choice is not available: ${selectedSpot}`);
  }

  const perfectLap = selectedSpot === challenge.perfectSpot;
  const comfortWilds = chooseComfortWilds(
    rng,
    perfectLap ? LAP_QUEST_WILD_COUNTS.perfect : LAP_QUEST_WILD_COUNTS.cozy,
  );

  return {
    kind: "lap_quest_choice",
    selectedSpot,
    perfectLap,
    comfortWilds,
  };
}

export function spinLapQuestRound(
  rng: Rng,
  challenge: LapQuestChallenge,
  selectedSpot: LapQuestSpot,
  betPerLine: number,
): LapQuestRoundResult {
  const choice = resolveLapQuestChoice(challenge, selectedSpot, rng);
  const startingGrid = spinGrid(rng, { includeDoorbells: false, includeBoldChaiPump: false });
  const base = spin({
    rng,
    betPerLine,
    treatJar: emptyTreatJar(),
    spinsSincePopIn: 999,
    startingGrid,
    spinArea: "secondary",
    allowDoorbells: false,
    includeBoldChaiPump: false,
    allowTreatTimeBonus: false,
    allowUniGlee: false,
    stickyWilds: choice.comfortWilds,
  });

  return {
    ...base,
    kind: "lap_quest_round",
    selectedSpot: choice.selectedSpot,
    perfectLap: choice.perfectLap,
    comfortWilds: choice.comfortWilds,
    extraWildsAdded: 0,
    panicWildsAdded: 0,
  };
}
