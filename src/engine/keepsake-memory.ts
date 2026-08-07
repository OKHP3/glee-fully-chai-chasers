/**
 * Moonlit Keepsake Trail memory-match bonus.
 * Pure TypeScript: no DOM, timers, or presentation concerns.
 */
import type {
  KeepsakeMemoryActionResult,
  KeepsakeMemoryCard,
  KeepsakeMemoryEvent,
  KeepsakeMemoryState,
  KeepsakeSymbolId,
} from "./types";
import type { Rng } from "./rng";

export const KEEPSAKE_MEMORY_CARD_COUNT = 12;
export const KEEPSAKE_MEMORY_PAIR_COUNT = 6;
export const KEEPSAKE_MEMORY_MAX_FAILS = 2;
export const KEEPSAKE_MEMORY_FREE_SPINS = 40;
export const KEEPSAKE_MEMORY_PREVIEW_MS = 2_500;
export const KEEPSAKE_MEMORY_MISMATCH_REVEAL_MS = 900;

/** Exactly the regular paying symbols; no wilds, blockers, treats, or legends. */
export const KEEPSAKE_MEMORY_SYMBOLS: readonly KeepsakeSymbolId[] = [
  "tumbler", "butterfly", "mixtape", "crystal",
  "chai", "candle", "cassette", "gnome",
  "mailbox", "vhs", "teapot", "yarn",
];

function randomIndex(rng: Rng, length: number): number {
  return Math.floor(rng() * length);
}

function sampleDistinctSymbols(rng: Rng): KeepsakeSymbolId[] {
  const remaining = [...KEEPSAKE_MEMORY_SYMBOLS];
  const selected: KeepsakeSymbolId[] = [];

  for (let i = 0; i < KEEPSAKE_MEMORY_PAIR_COUNT; i++) {
    selected.push(remaining.splice(randomIndex(rng, remaining.length), 1)[0]);
  }

  return selected;
}

/** The sole arrangement shuffle: Fisher–Yates over the 12 duplicated cards. */
function shuffleCards(rng: Rng, cards: KeepsakeMemoryCard[]): KeepsakeMemoryCard[] {
  const shuffled = cards.map((card) => ({ ...card }));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomIndex(rng, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.map((card, index) => ({ ...card, index }));
}

function cloneState(state: KeepsakeMemoryState): KeepsakeMemoryState {
  return {
    ...state,
    cards: state.cards.map((card) => ({ ...card })),
  };
}

function result(
  state: KeepsakeMemoryState,
  accepted: boolean,
  event?: KeepsakeMemoryEvent,
  reason?: KeepsakeMemoryActionResult["reason"],
): KeepsakeMemoryActionResult {
  return { state, accepted, ...(event ? { event } : {}), ...(reason ? { reason } : {}) };
}

export function createKeepsakeMemory(rng: Rng): KeepsakeMemoryState {
  const pairSymbols = sampleDistinctSymbols(rng);
  const cards = shuffleCards(rng, pairSymbols.flatMap((symbol) => [
    { index: 0, symbol, revealed: true, matched: false },
    { index: 0, symbol, revealed: true, matched: false },
  ]));

  return {
    kind: "keepsake_memory",
    phase: "preview",
    cards,
    pairsFound: 0,
    fails: 0,
    maxFails: KEEPSAKE_MEMORY_MAX_FAILS,
    freeSpinsAwarded: 0,
  };
}

/** Ends the fixed preview; the UI owns the 2,500ms wait. */
export function beginKeepsakeMemory(state: KeepsakeMemoryState): KeepsakeMemoryState {
  if (state.phase !== "preview") return state;
  return {
    ...cloneState(state),
    phase: "choosing_first",
    cards: state.cards.map((card) => ({ ...card, revealed: false })),
  };
}

function isValidIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < KEEPSAKE_MEMORY_CARD_COUNT;
}

function pendingMismatchIndices(state: KeepsakeMemoryState): [number, number] | undefined {
  if (state.firstPick === undefined) return undefined;
  const second = state.cards.find((card) => card.index !== state.firstPick && card.revealed && !card.matched);
  return second ? [state.firstPick, second.index] : undefined;
}

export function pickKeepsakeMemoryCard(state: KeepsakeMemoryState, index: number): KeepsakeMemoryActionResult {
  if (state.phase === "preview") return result(state, false, undefined, "preview");
  if (state.phase === "complete" || state.phase === "failed") return result(state, false, undefined, "ended");
  if (state.phase === "resolving_match" || state.phase === "resolving_mismatch") {
    return result(state, false, undefined, "resolving");
  }
  if (!isValidIndex(index)) return result(state, false, undefined, "invalid_index");

  const card = state.cards[index];
  if (card.matched) return result(state, false, undefined, "matched_card");
  if (state.phase === "choosing_second" && state.firstPick === index) {
    return result(state, false, undefined, "same_card");
  }
  if (card.revealed) return result(state, false, undefined, "resolving");

  const next = cloneState(state);
  next.cards[index].revealed = true;

  if (state.phase === "choosing_first") {
    next.phase = "choosing_second";
    next.firstPick = index;
    return result(next, true, { kind: "card_revealed", index });
  }

  const firstPick = state.firstPick;
  if (firstPick === undefined) return result(state, false, undefined, "resolving");
  const indices: [number, number] = [firstPick, index];

  if (state.cards[firstPick].symbol === card.symbol) {
    next.cards[firstPick].matched = true;
    next.cards[index].matched = true;
    next.pairsFound = (state.pairsFound + 1) as KeepsakeMemoryState["pairsFound"];
    next.firstPick = undefined;

    if (next.pairsFound === KEEPSAKE_MEMORY_PAIR_COUNT) {
      next.phase = "complete";
      next.freeSpinsAwarded = KEEPSAKE_MEMORY_FREE_SPINS;
      return result(next, true, { kind: "completed", freeSpinsAwarded: KEEPSAKE_MEMORY_FREE_SPINS });
    }

    next.phase = "choosing_first";
    return result(next, true, { kind: "match", indices, pairsFound: next.pairsFound });
  }

  next.fails = (state.fails + 1) as KeepsakeMemoryState["fails"];
  next.phase = "resolving_mismatch";
  return result(next, true, { kind: "mismatch", indices, fails: next.fails as 1 | 2 });
}

/** Ends the UI-owned mismatch reveal, turning down cards unless the bonus failed. */
export function resolveKeepsakeMemoryMismatch(state: KeepsakeMemoryState): KeepsakeMemoryState {
  if (state.phase !== "resolving_mismatch") return state;

  if (state.fails >= KEEPSAKE_MEMORY_MAX_FAILS) {
    return { ...cloneState(state), phase: "failed", firstPick: undefined, freeSpinsAwarded: 0 };
  }

  const next = cloneState(state);
  for (const index of pendingMismatchIndices(state) ?? []) next.cards[index].revealed = false;
  next.phase = "choosing_first";
  next.firstPick = undefined;
  return next;
}

/**
 * Typed completion for the UI callback after the 900ms mismatch reveal.
 * `resolveKeepsakeMemoryMismatch` remains available as the state-only helper
 * described by the contract.
 */
export function resolveKeepsakeMemoryMismatchResult(state: KeepsakeMemoryState): KeepsakeMemoryActionResult {
  const next = resolveKeepsakeMemoryMismatch(state);
  const event = next.phase === "failed" ? { kind: "failed", freeSpinsAwarded: 0 } as const : undefined;
  return result(next, state.phase === "resolving_mismatch", event);
}
