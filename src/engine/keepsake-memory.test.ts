import { describe, expect, it } from "vitest";
import {
  beginKeepsakeMemory,
  createKeepsakeMemory,
  KEEPSAKE_MEMORY_CARD_COUNT,
  KEEPSAKE_MEMORY_FREE_SPINS,
  pickKeepsakeMemoryCard,
  resolveKeepsakeMemoryMismatch,
  resolveKeepsakeMemoryMismatchResult,
} from "./keepsake-memory";
import { mulberry32 } from "./rng";

function readyState(seed = 1) {
  return beginKeepsakeMemory(createKeepsakeMemory(mulberry32(seed)));
}

function pairIndices(state: ReturnType<typeof readyState>): Array<[number, number]> {
  const bySymbol = new Map<string, number[]>();
  for (const card of state.cards) {
    const indices = bySymbol.get(card.symbol) ?? [];
    indices.push(card.index);
    bySymbol.set(card.symbol, indices);
  }
  return [...bySymbol.values()].map((indices) => [indices[0], indices[1]]);
}

function playPair(state: ReturnType<typeof readyState>, pair: [number, number]) {
  const first = pickKeepsakeMemoryCard(state, pair[0]);
  expect(first.accepted).toBe(true);
  const second = pickKeepsakeMemoryCard(first.state, pair[1]);
  expect(second.accepted).toBe(true);
  return second;
}

describe("Moonlit Keepsake Trail memory setup", () => {
  it("creates six distinct standard-symbol pairs in a reproducible 12-card permutation", () => {
    const first = createKeepsakeMemory(mulberry32(20260715));
    const second = createKeepsakeMemory(mulberry32(20260715));
    expect(second).toEqual(first);
    expect(first.cards).toHaveLength(KEEPSAKE_MEMORY_CARD_COUNT);
    expect(first.cards.map((card) => card.index)).toEqual([...Array(12).keys()]);

    const counts = new Map<string, number>();
    for (const card of first.cards) counts.set(card.symbol, (counts.get(card.symbol) ?? 0) + 1);
    expect(counts.size).toBe(6);
    expect([...counts.values()]).toEqual([2, 2, 2, 2, 2, 2]);
    expect(first.cards.every((card) => card.revealed && !card.matched)).toBe(true);
    expect(first.phase).toBe("preview");
  });

  it("ends the preview by turning cards down without changing their order", () => {
    const preview = createKeepsakeMemory(mulberry32(12));
    const order = preview.cards.map((card) => card.symbol);
    const ready = beginKeepsakeMemory(preview);
    expect(ready.phase).toBe("choosing_first");
    expect(ready.cards.map((card) => card.symbol)).toEqual(order);
    expect(ready.cards.every((card) => !card.revealed && !card.matched)).toBe(true);

    const ignored = pickKeepsakeMemoryCard(preview, 0);
    expect(ignored).toMatchObject({ accepted: false, reason: "preview" });
  });
});

describe("Moonlit Keepsake Trail state machine", () => {
  it("reveals one first card and rejects duplicate, matched, invalid, and resolving picks", () => {
    const state = readyState(2);
    const first = pickKeepsakeMemoryCard(state, 0);
    expect(first).toMatchObject({ accepted: true, event: { kind: "card_revealed", index: 0 } });
    expect(first.state.phase).toBe("choosing_second");
    expect(first.state.cards[0].revealed).toBe(true);

    expect(pickKeepsakeMemoryCard(first.state, 0)).toMatchObject({ accepted: false, reason: "same_card" });
    expect(pickKeepsakeMemoryCard(first.state, -1)).toMatchObject({ accepted: false, reason: "invalid_index" });
    expect(pickKeepsakeMemoryCard(first.state, 12)).toMatchObject({ accepted: false, reason: "invalid_index" });

    const mismatchIndex = first.state.cards.findIndex((card) => card.index !== 0 && card.symbol !== first.state.cards[0].symbol);
    const mismatch = pickKeepsakeMemoryCard(first.state, mismatchIndex);
    expect(mismatch.state.phase).toBe("resolving_mismatch");
    expect(pickKeepsakeMemoryCard(mismatch.state, 1)).toMatchObject({ accepted: false, reason: "resolving" });
  });

  it("keeps a matched pair face-up and locked without using a strike", () => {
    const state = readyState(3);
    const pair = pairIndices(state)[0];
    const result = playPair(state, pair);
    expect(result.event).toMatchObject({ kind: "match", indices: pair, pairsFound: 1 });
    expect(result.state.phase).toBe("choosing_first");
    expect(result.state.fails).toBe(0);
    expect(result.state.cards[pair[0]]).toMatchObject({ revealed: true, matched: true });
    expect(result.state.cards[pair[1]]).toMatchObject({ revealed: true, matched: true });
    expect(pickKeepsakeMemoryCard(result.state, pair[0])).toMatchObject({ accepted: false, reason: "matched_card" });
  });

  it("turns down mismatches after resolution and ends only on the third", () => {
    const state = readyState(4);
    const pairs = pairIndices(state);
    const firstPair  = pairs[0];
    const secondPair = pairs[1];
    const thirdPair  = pairs[2];

    // ── Mismatch 1 ─────────────────────────────────────────────────────────
    const pick1a = pickKeepsakeMemoryCard(state, firstPair[0]);
    const mismatch1 = pickKeepsakeMemoryCard(pick1a.state, secondPair[0]);
    expect(mismatch1.event).toMatchObject({ kind: "mismatch", indices: [firstPair[0], secondPair[0]], fails: 1 });
    expect(mismatch1.state.fails).toBe(1);
    const after1 = { state: resolveKeepsakeMemoryMismatch(mismatch1.state) };
    expect(after1.state.phase).toBe("choosing_first");
    expect(after1.state.cards[firstPair[0]].revealed).toBe(false);
    expect(after1.state.cards[secondPair[0]].revealed).toBe(false);

    // ── Mismatch 2 — bonus should NOT end yet ───────────────────────────────
    const pick2a = pickKeepsakeMemoryCard(after1.state, firstPair[1]);
    const mismatch2 = pickKeepsakeMemoryCard(pick2a.state, secondPair[1]);
    expect(mismatch2.event).toMatchObject({ kind: "mismatch", fails: 2 });
    const after2 = { state: resolveKeepsakeMemoryMismatch(mismatch2.state) };
    expect(after2.state.phase).toBe("choosing_first");
    expect(after2.state.cards[firstPair[1]].revealed).toBe(false);
    expect(after2.state.cards[secondPair[1]].revealed).toBe(false);

    // ── Mismatch 3 — now the bonus ends ────────────────────────────────────
    const pick3a = pickKeepsakeMemoryCard(after2.state, firstPair[0]);
    const mismatch3 = pickKeepsakeMemoryCard(pick3a.state, thirdPair[0]);
    expect(mismatch3.event).toMatchObject({ kind: "mismatch", fails: 3 });
    const failed = resolveKeepsakeMemoryMismatchResult(mismatch3.state);
    expect(failed).toMatchObject({ accepted: true, event: { kind: "failed", freeSpinsAwarded: 0 } });
    expect(failed.state).toMatchObject({ phase: "failed", fails: 3, pairsFound: 0, freeSpinsAwarded: 0 });
    expect(pickKeepsakeMemoryCard(failed.state, firstPair[0])).toMatchObject({ accepted: false, reason: "ended" });
  });

  it("awards exactly 40 standard free spins only after all six pairs match", () => {
    let state = readyState(5);
    const pairs = pairIndices(state);
    for (const pair of pairs.slice(0, 5)) {
      const result = playPair(state, pair);
      state = result.state;
      expect(state.pairsFound).toBeLessThanOrEqual(5);
      expect(state.freeSpinsAwarded).toBe(0);
    }

    const completed = playPair(state, pairs[5]);
    expect(completed.event).toEqual({ kind: "completed", freeSpinsAwarded: KEEPSAKE_MEMORY_FREE_SPINS });
    expect(completed.state).toMatchObject({ phase: "complete", pairsFound: 6, fails: 0, freeSpinsAwarded: 40 });
    expect(pickKeepsakeMemoryCard(completed.state, 0)).toMatchObject({ accepted: false, reason: "ended" });
  });
});
