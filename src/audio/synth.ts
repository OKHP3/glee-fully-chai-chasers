/**
 * Web Audio synth engine — 100% original oscillator/gain-envelope sounds.
 * No samples, no clips. IP rule: docs/IP-GUARDRAILS.md (style homage only).
 *
 * iOS rule: AudioContext must be created/resumed from a real user gesture.
 * `unlock()` is called once from the splash tap; `resume()` is safe to call
 * repeatedly (e.g. after a visibility change) and no-ops if already running.
 *
 * Vertical-slice note: this ships the minimum sound palette called for in
 * the Replit brief (toolbox chime, cascade tick, rising cascade arpeggio,
 * win pluck). Music loops (base + free-spin) and cat motifs are follow-up
 * work — see docs/REPLIT-HANDOFF.md.
 */
let ctx: AudioContext | null = null;
let musicEnabled = true;
let sfxEnabled = true;

export function setMusicEnabled(enabled: boolean): void {
  musicEnabled = enabled;
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled;
}

export function isUnlocked(): boolean {
  return ctx !== null;
}

/** Must be called from within a user-gesture handler (the splash tap). */
export function unlock(): void {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  void resume();
}

export async function resume(): Promise<void> {
  if (ctx && ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch {
      /* ignore — user gesture required, will retry on next tap */
    }
  }
}

function tone(freq: number, startOffset: number, duration: number, gainPeak: number, type: OscillatorType): void {
  if (!ctx || !sfxEnabled) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainPeak, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** Short friendly "toolbox opens" chime — three ascending notes. */
export function playToolboxChime(): void {
  [523.25, 659.25, 783.99].forEach((freq, i) => tone(freq, i * 0.09, 0.22, 0.18, "triangle"));
}

/** Soft reel-settle / cascade tick. */
export function playCascadeTick(): void {
  tone(220, 0, 0.08, 0.12, "sine");
}

/** Rising arpeggio, one step higher per cascade tier — docs §5. */
export function playCascadeArpeggio(tier: number): void {
  const base = 261.63 * Math.pow(2, Math.min(tier, 8) / 12);
  [0, 4, 7].forEach((semitone, i) => {
    const freq = base * Math.pow(2, semitone / 12);
    tone(freq, i * 0.05, 0.18, 0.15, "sine");
  });
}

/** Small win pluck. */
export function playWinPluck(): void {
  tone(880, 0, 0.12, 0.2, "triangle");
  tone(1108.73, 0.05, 0.15, 0.15, "triangle");
}

/** Warm bonus fanfare (free spins / UniGlee). */
export function playBonusFanfare(): void {
  [392, 523.25, 659.25, 783.99].forEach((freq, i) => tone(freq, i * 0.08, 0.35, 0.22, "sawtooth"));
}

export { musicEnabled };
