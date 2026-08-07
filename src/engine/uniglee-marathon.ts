/** UniGlee acts 1–4 runner. Pure TypeScript; Phoebe's interaction is a typed UI handoff. */
import type { Rng } from "./rng";
import type { LaundryRollConfig, UniGleeAwardSpins } from "./laundry";
import {
  runJoeyLaundrySession,
  runFreeSpinSession,
  type FreeSpinSessionResult,
  type JoeyLaundrySessionResult,
} from "./freespins";
import { buildUniGleeMarathonPlan, type UniGleeMarathonPlan, type UniGleeSubBonusId } from "./uniglee";

export const DEFAULT_UNIGLEE_LAUNDRY_CONFIG: LaundryRollConfig = {
  sockDropRate: 0.25,
  pawStrikeRate: 0.18,
  multiplierWeights: { 2: 60, 3: 30, 5: 10 },
};
/** Per-act ceiling; initial allocations are 75/100/125, so normal play never approaches it. */
export const UNIGLEE_CHAPTER_SPIN_CAP = 500;

export type UniGleeBaseChapterSession = FreeSpinSessionResult | JoeyLaundrySessionResult;

export interface UniGleeBaseChapterResult {
  id: Exclude<UniGleeSubBonusId, "phoebe_lap_quest">;
  baseSpins: number;
  session: UniGleeBaseChapterSession;
  totalWin: number;
  totalSpins: number;
  retriggers: number;
}

export interface UniGleeBaseMarathonResult {
  kind: "uniglee_base_marathon_result";
  plan: UniGleeMarathonPlan;
  chapters: readonly UniGleeBaseChapterResult[];
  totalWin: number;
  totalSpins: number;
  totalRetriggers: number;
}

export function runUniGleeBaseMarathon(
  rng: Rng,
  betPerLine: number,
  initialAwardSpins: UniGleeAwardSpins,
  laundryConfig: LaundryRollConfig = DEFAULT_UNIGLEE_LAUNDRY_CONFIG,
): UniGleeBaseMarathonResult {
  const plan = buildUniGleeMarathonPlan(rng, initialAwardSpins);
  const chapters: UniGleeBaseChapterResult[] = [];
  let totalWin = 0;
  let totalSpins = 0;
  let totalRetriggers = 0;

  for (const chapter of plan.baseSubBonuses) {
    const id = chapter.id as Exclude<UniGleeSubBonusId, "phoebe_lap_quest">;
    const session = id === "joey_laundry_helper"
      ? runJoeyLaundrySession(rng, betPerLine, initialAwardSpins, laundryConfig, 0, UNIGLEE_CHAPTER_SPIN_CAP)
      : runFreeSpinSession(
        rng,
        id === "were_multiplying"
          ? "multiplying"
          : id === "keepsake_collection"
            ? "keepsake_collection"
            : "treat_time_nighttime",
        betPerLine,
        chapter.baseSpins,
        { maxTotalSpins: UNIGLEE_CHAPTER_SPIN_CAP },
      );
    const chapterResult: UniGleeBaseChapterResult = {
      id,
      baseSpins: chapter.baseSpins,
      session,
      totalWin: session.totalWin,
      totalSpins: session.totalSpins,
      retriggers: session.retriggers,
    };
    chapters.push(chapterResult);
    totalWin += chapterResult.totalWin;
    totalSpins += chapterResult.totalSpins;
    totalRetriggers += chapterResult.retriggers;
  }

  return { kind: "uniglee_base_marathon_result", plan, chapters, totalWin, totalSpins, totalRetriggers };
}
