import { describe, expect, it, beforeEach } from "vitest";
import { emptyTreatJar } from "./engine/features";
import { loadGameState, saveGameState, type GameState } from "./state";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const storage = new MemoryStorage();

beforeEach(() => {
  storage.clear();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
});

describe("game state persistence", () => {
  it("keeps the firefly meter across a save/load boundary", () => {
    const state: GameState = {
      balance: 500_000,
      bet: 25,
      xp: 12,
      treatJar: emptyTreatJar(),
      fireflyMeter: 3,
      bestCascade: 3,
      spinsSincePopIn: 2,
      soundOn: true,
      paylineGuideOn: true,
      musicVolume: 0.72,
      sfxVolume: 0.82,
      theme: "dark",
      reducedMotion: false,
    };

    saveGameState(state);

    expect(loadGameState().fireflyMeter).toBe(3);
    expect(loadGameState().theme).toBe("dark");
    expect(loadGameState().musicVolume).toBe(0.72);
    expect(loadGameState().paylineGuideOn).toBe(true);
  });

  it("migrates the old Boogie Bites save key without losing treats", () => {
    storage.setItem("ccv1.treatJar", JSON.stringify({ chicken: 2, salmon: 1, boogie: 4 }));

    expect(loadGameState().treatJar).toEqual({ chicken: 2, salmon: 1, bougie: 4 });
  });
});
