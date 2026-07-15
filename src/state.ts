/**
 * Versioned localStorage persistence. Keys are prefixed `ccv1.`
 * so a future save-format change can migrate or reset cleanly.
 * Persisted: Sparks balance, bet level, XP/level, Treat Jar contents,
 * firefly cascade meter, unlocked scenes, best cascade, daily-bonus date,
 * settings (sound, payline guide, reduced motion).
 * A visible "start fresh" reset action is required (vision doc §5).
 */
import type { TreatJar } from "./engine/features";
import { emptyTreatJar, settleTreatJar } from "./engine/features";
import { STARTING_BALANCE } from "./engine/economy";

const PREFIX = "ccv1.";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full/blocked — game continues in memory */
  }
}

export function resetAll(): void {
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(PREFIX)) localStorage.removeItem(k);
  }
}

/** Settings + progress shape for the vertical slice. Extend as features land. */
export interface GameState {
  balance: number;
  bet: number;
  xp: number;
  treatJar: TreatJar;
  /** Treat Jar completions waiting to enter the bonus flow on the next spin. */
  pendingTreatJarSpins: number;
  fireflyMeter: number;
  bestCascade: number;
  spinsSincePopIn: number;
  soundOn: boolean;
  /** Optional payline guide; disabled by default for a clean board. */
  paylineGuideOn: boolean;
  /** Independent, persisted mix controls. `soundOn` remains the master mute. */
  musicVolume: number;
  sfxVolume: number;
  theme: ThemeMode;
  reducedMotion: boolean;
}

export type ThemeMode = "system" | "dark" | "light";

/**
 * Converts the pre-correction save shape without dropping Joey's treats.
 * `boogie` was the misspelled key shipped before Bougie Bites was corrected.
 */
function loadTreatJar(): TreatJar {
  const jar = load<Partial<TreatJar> & { boogie?: number }>("treatJar", emptyTreatJar());
  return {
    chicken: Number.isFinite(jar.chicken) ? Math.max(0, jar.chicken as number) : 0,
    salmon: Number.isFinite(jar.salmon) ? Math.max(0, jar.salmon as number) : 0,
    bougie: Number.isFinite(jar.bougie)
      ? Math.max(0, jar.bougie as number)
      : Number.isFinite(jar.boogie)
        ? Math.max(0, jar.boogie as number)
        : 0,
  };
}

export function loadGameState(): GameState {
  const soundOn = load("soundOn", true);
  const settledTreatJar = settleTreatJar(loadTreatJar());
  const pendingTreatJarSpins = load("pendingTreatJarSpins", 0) + settledTreatJar.freeSpinsAwarded;
  if (settledTreatJar.freeSpinsAwarded > 0) {
    save("treatJar", settledTreatJar.jar);
    save("pendingTreatJarSpins", pendingTreatJarSpins);
  }
  return {
    balance: load("balance", STARTING_BALANCE),
    bet: load("bet", 1),
    xp: load("xp", 0),
    treatJar: settledTreatJar.jar,
    pendingTreatJarSpins,
    fireflyMeter: load("fireflyMeter", 0),
    bestCascade: load("bestCascade", 0),
    spinsSincePopIn: load("spinsSincePopIn", 0),
    soundOn,
    paylineGuideOn: load("paylineGuideOn", false),
    musicVolume: load("musicVolume", soundOn ? 0.72 : 0),
    sfxVolume: load("sfxVolume", soundOn ? 0.82 : 0),
    theme: load<ThemeMode>("theme", "system"),
    reducedMotion: load(
      "reducedMotion",
      typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)").matches : false,
    ),
  };
}

export function saveGameState(state: GameState): void {
  save("balance", state.balance);
  save("bet", state.bet);
  save("xp", state.xp);
  save("treatJar", state.treatJar);
  save("pendingTreatJarSpins", state.pendingTreatJarSpins);
  save("fireflyMeter", state.fireflyMeter);
  save("bestCascade", state.bestCascade);
  save("spinsSincePopIn", state.spinsSincePopIn);
  save("soundOn", state.soundOn);
  save("paylineGuideOn", state.paylineGuideOn);
  save("musicVolume", state.musicVolume);
  save("sfxVolume", state.sfxVolume);
  save("theme", state.theme);
  save("reducedMotion", state.reducedMotion);
}
