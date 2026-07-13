/**
 * Chai Chase base score — an original 20-bar, 80 BPM Web Audio composition.
 *
 * The form is exactly 60 seconds (20 bars × 4 beats at 80 BPM), then loops
 * from its opening pad. It is deliberately written from broad tonal and
 * texture direction only: no samples, artist references, or borrowed melodic
 * material. Music uses a separate, quiet bus so the game-state SFX remain
 * legible above it.
 */
import { getAudioContext, musicEnabled } from "./synth";

const BPM = 80;
const BEAT_SECONDS = 60 / BPM;
const BAR_SECONDS = BEAT_SECONDS * 4;
export const BASE_SCORE_DURATION_SECONDS = BAR_SECONDS * 20;

type ScoreBar = Readonly<{
  pad: readonly number[];
  bass: number;
}>;

// A five-phrase night-drive form: soft electric-piano harmony, a low pulse,
// and a sparse, upward-looking lead. MIDI pitches keep the score readable
// without embedding any external score or audio material.
const SCORE: readonly ScoreBar[] = [
  { pad: [52, 55, 59, 66], bass: 40 },
  { pad: [48, 52, 55, 62], bass: 36 },
  { pad: [50, 55, 59, 64], bass: 38 },
  { pad: [50, 57, 62, 64], bass: 38 },
  { pad: [52, 55, 59, 66], bass: 40 },
  { pad: [45, 48, 52, 59], bass: 33 },
  { pad: [48, 52, 55, 62], bass: 36 },
  { pad: [47, 54, 59, 64], bass: 35 },
  { pad: [50, 55, 59, 64], bass: 38 },
  { pad: [50, 57, 62, 64], bass: 38 },
  { pad: [52, 55, 59, 62], bass: 40 },
  { pad: [48, 52, 55, 62], bass: 36 },
  { pad: [45, 48, 52, 57], bass: 33 },
  { pad: [47, 50, 54, 57], bass: 35 },
  { pad: [48, 52, 55, 59], bass: 36 },
  { pad: [47, 54, 59, 63], bass: 35 },
  { pad: [52, 55, 59, 66], bass: 40 },
  { pad: [50, 57, 62, 64], bass: 38 },
  { pad: [48, 52, 55, 62], bass: 36 },
  { pad: [52, 55, 59, 66], bass: 40 },
];

type LeadNote = Readonly<{ bar: number; beat: number; midi: number; length: number }>;

const LEAD: readonly LeadNote[] = [
  { bar: 0, beat: 0, midi: 76, length: 0.7 },
  { bar: 0, beat: 1.5, midi: 79, length: 0.45 },
  { bar: 0, beat: 2.25, midi: 71, length: 0.4 },
  { bar: 0, beat: 3, midi: 78, length: 0.75 },
  { bar: 2, beat: 0.5, midi: 74, length: 0.55 },
  { bar: 2, beat: 1.5, midi: 71, length: 0.4 },
  { bar: 3, beat: 2.5, midi: 76, length: 0.8 },
  { bar: 5, beat: 0.25, midi: 72, length: 0.55 },
  { bar: 5, beat: 1.25, midi: 76, length: 0.42 },
  { bar: 6, beat: 2, midi: 79, length: 0.58 },
  { bar: 7, beat: 3, midi: 78, length: 0.7 },
  { bar: 8, beat: 0, midi: 74, length: 0.55 },
  { bar: 9, beat: 1.5, midi: 78, length: 0.45 },
  { bar: 10, beat: 2.25, midi: 83, length: 0.75 },
  { bar: 12, beat: 0.5, midi: 76, length: 0.5 },
  { bar: 13, beat: 2, midi: 74, length: 0.4 },
  { bar: 14, beat: 3, midi: 79, length: 0.8 },
  { bar: 16, beat: 0, midi: 76, length: 0.52 },
  { bar: 17, beat: 1.5, midi: 74, length: 0.42 },
  { bar: 18, beat: 2, midi: 71, length: 0.48 },
  { bar: 19, beat: 3, midi: 76, length: 0.9 },
];

type ScheduledSource = OscillatorNode | AudioBufferSourceNode;

let musicBus: GainNode | undefined;
let running = false;
let musicVolume = 0.72;
let cycleStart = 0;
let loopTimer: number | undefined;
const scheduledSources = new Set<ScheduledSource>();

function frequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function track(source: ScheduledSource): void {
  scheduledSources.add(source);
  source.addEventListener("ended", () => scheduledSources.delete(source), { once: true });
}

function scheduleOscillator(
  audio: AudioContext,
  frequencyHz: number,
  start: number,
  duration: number,
  peak: number,
  type: OscillatorType,
  attack = 0.03,
): void {
  if (!musicBus) return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequencyHz, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(musicBus);
  track(oscillator);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

/** A synthesized, filtered noise brush; no recorded percussion is used. */
function scheduleBrush(audio: AudioContext, start: number, brightness: number): void {
  if (!musicBus) return;
  const duration = 0.09;
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.setValueAtTime(brightness, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(0.022, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(musicBus);
  track(source);
  source.start(start);
  source.stop(start + duration + 0.02);
}

function scheduleCycle(start: number): void {
  const audio = getAudioContext();
  if (!audio || !musicBus) return;

  SCORE.forEach((bar, index) => {
    const barStart = start + index * BAR_SECONDS;

    // Soft, slightly uneven electric-piano-like chord layer.
    bar.pad.forEach((midi, voice) => {
      scheduleOscillator(audio, frequency(midi), barStart + voice * 0.012, BAR_SECONDS * 0.9, 0.022, "triangle", 0.12);
    });

    // Low fifth pulse: warm enough for the garden, with a small grunge edge.
    scheduleOscillator(audio, frequency(bar.bass), barStart, BEAT_SECONDS * 1.45, 0.034, "sawtooth", 0.025);
    scheduleOscillator(audio, frequency(bar.bass + 7), barStart + BEAT_SECONDS * 2, BEAT_SECONDS * 1.15, 0.024, "triangle", 0.025);

    // A restrained brushed backbeat that leaves clear space for cascade cues.
    scheduleBrush(audio, barStart + BEAT_SECONDS, 1_850);
    scheduleBrush(audio, barStart + BEAT_SECONDS * 3, 2_150);

    // Aurora sparkle at each barline, varied enough to avoid a mechanical tick.
    if (index % 2 === 0) {
      scheduleOscillator(audio, frequency(88 + (index % 3) * 2), barStart + BEAT_SECONDS * 3.5, 0.42, 0.012, "sine", 0.01);
    }
  });

  LEAD.forEach((note) => {
    scheduleOscillator(
      audio,
      frequency(note.midi),
      start + note.bar * BAR_SECONDS + note.beat * BEAT_SECONDS,
      note.length * BEAT_SECONDS,
      0.04,
      "triangle",
      0.018,
    );
  });
}

function scheduleFollowingCycle(): void {
  const audio = getAudioContext();
  if (!running || !audio) return;
  cycleStart += BASE_SCORE_DURATION_SECONDS;
  scheduleCycle(cycleStart);
  const wakeAt = Math.max(30, (cycleStart - audio.currentTime - 0.5) * 1_000);
  loopTimer = window.setTimeout(scheduleFollowingCycle, wakeAt);
}

/** Start the 60-second base score beneath game effects after a user gesture. */
export function startBaseMusic(): void {
  const audio = getAudioContext();
  if (!audio || !musicEnabled || running) return;

  musicBus = audio.createGain();
  musicBus.gain.setValueAtTime(0.0001, audio.currentTime);
  musicBus.gain.linearRampToValueAtTime(musicVolume * 0.14, audio.currentTime + 0.45);
  musicBus.connect(audio.destination);
  running = true;
  cycleStart = audio.currentTime + 0.06;
  scheduleCycle(cycleStart);
  loopTimer = window.setTimeout(scheduleFollowingCycle, Math.max(30, (BASE_SCORE_DURATION_SECONDS - 0.5) * 1_000));
}

/** Set the music mix (0–1); changes take effect immediately while playing. */
export function setMusicVolume(volume: number): void {
  musicVolume = Math.min(1, Math.max(0, volume));
  const audio = getAudioContext();
  if (musicBus && audio) musicBus.gain.setTargetAtTime(musicVolume * 0.14, audio.currentTime, 0.025);
}

/** Stop all scheduled score voices immediately when the shared Sound toggle is off. */
export function stopBaseMusic(): void {
  running = false;
  if (loopTimer !== undefined) {
    window.clearTimeout(loopTimer);
    loopTimer = undefined;
  }
  const audio = getAudioContext();
  if (musicBus && audio) musicBus.gain.setTargetAtTime(0.0001, audio.currentTime, 0.02);
  for (const source of scheduledSources) {
    try {
      source.stop((audio?.currentTime ?? 0) + 0.08);
    } catch {
      // A source can have ended between the loop and stop call.
    }
  }
  scheduledSources.clear();
  const busToDisconnect = musicBus;
  musicBus = undefined;
  if (busToDisconnect) window.setTimeout(() => busToDisconnect.disconnect(), 120);
}
