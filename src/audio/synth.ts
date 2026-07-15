/**
 * Web Audio synth engine — 100% original oscillator/gain-envelope sounds.
 * No samples, no clips. IP rule: docs/IP-GUARDRAILS.md (style homage only).
 *
 * iOS rule: AudioContext must be created/resumed from a real user gesture.
 * `unlock()` is called once from the splash tap; `resume()` is safe to call
 * repeatedly (e.g. after a visibility change) and no-ops if already running.
 *
 * Vertical-slice note: this ships the first original motif palette for the
 * Chai Chase, cascades, Joey, Phoebe, UniGlee, and bonus transitions. Music
 * loops remain follow-up work — see docs/GAME-REALIGNMENT-2026-07-12.md.
 */
let ctx: AudioContext | null = null;
let musicEnabled = true;
let sfxEnabled = true;
let sfxVolume = 0.82;
let sfxBus: GainNode | null = null;

export function setMusicEnabled(enabled: boolean): void {
  musicEnabled = enabled;
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled;
  updateSfxGain();
}

/** Set the effects mix (0–1) without changing the master sound preference. */
export function setSfxVolume(volume: number): void {
  sfxVolume = Math.min(1, Math.max(0, volume));
  updateSfxGain();
}

export function isUnlocked(): boolean {
  return ctx !== null;
}

/** Shared context for the original music sequencer. Never create a second
 * context: iOS is much more reliable when music and effects share the
 * gesture-unlocked audio graph. */
export function getAudioContext(): AudioContext | null {
  return ctx;
}

/** Must be called from within a user-gesture handler (the splash tap). */
export function unlock(): void {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      sfxBus = ctx.createGain();
      sfxBus.connect(ctx.destination);
      updateSfxGain();
    }
    void resume();
  } catch {
    /* Web Audio unavailable/blocked in this embedding context (e.g. a
       restrictive iframe sandbox) — game must still be playable without
       sound rather than dying on the splash tap. */
    ctx = null;
  }
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

function updateSfxGain(): void {
  if (!ctx || !sfxBus) return;
  sfxBus.gain.setTargetAtTime(sfxEnabled ? sfxVolume : 0.0001, ctx.currentTime, 0.025);
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
  osc.connect(gain).connect(sfxBus ?? ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** Chai Chase launch — warm invitation followed by a bright destination note. */
export function playChaiChaseStart(): void {
  [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
    tone(freq, i * 0.08, 0.28, i === 3 ? 0.2 : 0.15, i < 2 ? "sine" : "triangle");
  });
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

/** Joey's syncopated boogie signature — alert, selective, and a little smug. */
export function playJoeyCue(): void {
  tone(196, 0, 0.17, 0.15, "triangle");
  tone(246.94, 0.11, 0.12, 0.13, "square");
  tone(293.66, 0.19, 0.22, 0.17, "triangle");
}

/** Phoebe's purr-and-discovery signature — warm low pulse plus delighted trill. */
export function playPhoebeCue(): void {
  tone(110, 0, 0.34, 0.1, "sine");
  tone(116.54, 0.08, 0.32, 0.08, "sine");
  tone(659.25, 0.18, 0.16, 0.14, "triangle");
  tone(783.99, 0.25, 0.2, 0.12, "triangle");
}

/** Treat Time entrance: bright Phoebe morning, fuller Joey/Phoebe nighttime. */
export function playTreatTimeCue(mode: "morning" | "nighttime"): void {
  const notes = mode === "morning"
    ? [392, 523.25, 659.25, 783.99]
    : [293.66, 392, 523.25, 659.25, 783.99];
  notes.forEach((freq, i) => tone(freq, i * 0.075, 0.28, mode === "nighttime" ? 0.18 : 0.16, i % 2 ? "triangle" : "sine"));
}

/** A short, per-cast landing flourish; count stays capped to avoid fatigue. */
export function playTreatLand(count: number): void {
  const landings = Math.min(Math.max(count, 2), 10);
  [523.25, 659.25, 783.99].forEach((freq, i) => tone(freq, i * 0.045, 0.16, 0.08 + landings * 0.006, "triangle"));
}

/** One-shot Wild Chai Storm: warm amber lift, cool tumbler drops, bright settle. */
export function playChaiStorm(convertedCount: number): void {
  const intensity = Math.min(Math.max(convertedCount, 0), 20);
  [261.63, 329.63, 415.3, 523.25].forEach((freq, index) => {
    tone(freq, index * 0.075, 0.3, 0.12 + intensity * 0.002, index % 2 ? "triangle" : "sine");
  });
  [659.25, 783.99, 987.77].forEach((freq, index) => {
    tone(freq, 0.34 + index * 0.055, 0.2, 0.08, "triangle");
  });
}

/** Original house-doorbell ding-dong, played whenever a doorbell lands. */
export function playDoorbellRing(): void {
  tone(880, 0, 0.18, 0.18, "sine");
  tone(659.25, 0.2, 0.28, 0.16, "sine");
  tone(1318.51, 0.02, 0.08, 0.06, "triangle");
}

/** Original iced-chai pump press cue; intentionally one-shot, never looping. */
export function playBoldChaiPumpPress(completedCup = false): void {
  tone(completedCup ? 196 : 146.83, 0, 0.08, 0.11, "square");
  tone(completedCup ? 392 : 220, 0.045, completedCup ? 0.24 : 0.12, completedCup ? 0.18 : 0.1, "triangle");
  if (completedCup) tone(659.25, 0.12, 0.28, 0.14, "sine");
}

/** Original iced-cube rattle for the intentional cup swap time cost. */
export function playBoldChaiCupSwap(): void {
  [523.25, 659.25, 783.99, 587.33, 698.46].forEach((freq, index) => {
    tone(freq, index * 0.035, 0.07, 0.075, index % 2 ? "triangle" : "sine");
  });
  tone(246.94, 0.08, 0.18, 0.08, "triangle");
}

/** Original low shot-clock buzzer for the end of the 30-second Bold Chai run. */
export function playBoldChaiTimerBuzzer(): void {
  tone(110, 0, 0.42, 0.2, "square");
  tone(123.47, 0.015, 0.42, 0.12, "sawtooth");
  tone(82.41, 0.08, 0.34, 0.14, "square");
}

/** Doorbell Panic: a bright, original two-note chime followed by a cat-flight burst. */
export function playStrangerDangerPanic(): void {
  tone(988, 0, 0.18, 0.2, "square");
  tone(1318.51, 0.12, 0.2, 0.18, "square");
  [220, 277.18, 329.63, 415.3].forEach((freq, i) => tone(freq, 0.32 + i * 0.07, 0.16, 0.13, "triangle"));
}

/** UniGlee's mythic arrival — glassy lift, breath, then a wide butterfly shimmer. */
export function playUniGleeSting(): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(freq, i * 0.11, 0.42, 0.16, "sine");
  });
  tone(261.63, 0.58, 0.72, 0.12, "sawtooth");
  tone(392, 0.62, 0.68, 0.1, "triangle");
}

/** AskJamie Wheel spin-up — a ratchety descending tick loop. */
export function playWheelTick(): void {
  for (let i = 0; i < 14; i++) {
    tone(440 - i * 6, i * 0.16, 0.05, 0.1, "square");
  }
}

export { musicEnabled };
