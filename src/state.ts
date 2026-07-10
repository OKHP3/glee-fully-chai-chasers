/**
 * Versioned localStorage persistence. Keys are prefixed `ccv1.`
 * so a future save-format change can migrate or reset cleanly.
 * Persisted: Sparks balance, bet level, XP/level, Treat Jar contents,
 * unlocked scenes, best cascade, daily-bonus date, settings (sound, reduced motion).
 * A visible "start fresh" reset action is required (vision doc §5).
 */
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
