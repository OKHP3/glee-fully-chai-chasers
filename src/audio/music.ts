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

/** The music control has seven times the previous 100% headroom. */
export const MUSIC_VOLUME_MAX = 7;

export function clampMusicVolume(volume: number): number {
  return Math.min(MUSIC_VOLUME_MAX, Math.max(0, volume));
}

const UNIGLEE_BPM = 112;
const UNIGLEE_BEAT_SECONDS = 60 / UNIGLEE_BPM;
const UNIGLEE_BAR_SECONDS = UNIGLEE_BEAT_SECONDS * 4;
/** 48 original synthesized bars: long enough to keep a marathon from feeling like a 15-second loop. */
export const UNIGLEE_SCORE_DURATION_SECONDS = UNIGLEE_BAR_SECONDS * 48;

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
let urgencyBus: GainNode | undefined;
let running = false;
let urgencyRunning = false;
let unigleeRunning = false;
let boldChaiUrgencyEnabled = false;
let musicVolume = 4.0;
let cycleStart = 0;
let loopTimer: number | undefined;
let urgencyCycleStart = 0;
let urgencyLoopTimer: number | undefined;
let unigleeLoopTimer: number | undefined;
let unigleeCycleStart = 0;
let unigleeBus: GainNode | undefined;
const scheduledSources = new Set<ScheduledSource>();
const scheduledUrgencySources = new Set<ScheduledSource>();
const scheduledUniGleeSources = new Set<ScheduledSource>();

function frequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function track(source: ScheduledSource, collection: Set<ScheduledSource> = scheduledSources): void {
  collection.add(source);
  source.addEventListener("ended", () => collection.delete(source), { once: true });
}

function scheduleOscillator(
  audio: AudioContext,
  frequencyHz: number,
  start: number,
  duration: number,
  peak: number,
  type: OscillatorType,
  attack = 0.03,
  destination: GainNode | undefined = musicBus,
  collection: Set<ScheduledSource> = scheduledSources,
): void {
  if (!destination) return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequencyHz, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(destination);
  track(oscillator, collection);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

/** A synthesized, filtered noise brush; no recorded percussion is used. */
function scheduleBrush(
  audio: AudioContext,
  start: number,
  brightness: number,
  destination: GainNode | undefined = musicBus,
  collection: Set<ScheduledSource> = scheduledSources,
  peak = 0.022,
): void {
  if (!destination) return;
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
  gain.gain.linearRampToValueAtTime(peak, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(destination);
  track(source, collection);
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

/** Edgy, faster UniGlee marathon score: bright suspended chords, octave bass,
 * offbeat synthesized brushes, and a non-repeating 48-bar contour. */
function scheduleUniGleeCycle(start: number): void {
  const audio = getAudioContext();
  if (!audio || !unigleeBus) return;
  const pads = [
    [52, 55, 59, 66], [50, 54, 57, 64], [45, 52, 57, 62], [47, 54, 59, 64],
    [52, 55, 60, 67], [48, 52, 57, 64], [50, 55, 59, 65], [45, 50, 55, 62],
  ];
  const basses = [40, 38, 33, 35, 40, 36, 38, 33];
  const lead = [76, 79, 83, 81, 78, 86, 83, 88, 81, 79, 91, 86];
  for (let bar = 0; bar < 48; bar++) {
    const barStart = start + bar * UNIGLEE_BAR_SECONDS;
    const chord = pads[bar % pads.length];
    chord.forEach((midi, voice) => scheduleOscillator(
      audio, frequency(midi + (bar > 31 && voice === 3 ? 12 : 0)),
      barStart + voice * 0.01, UNIGLEE_BAR_SECONDS * 0.82, 0.028, "sawtooth", 0.06,
      unigleeBus, scheduledUniGleeSources,
    ));
    const bass = basses[bar % basses.length];
    for (let beat = 0; beat < 4; beat++) {
      const beatStart = barStart + beat * UNIGLEE_BEAT_SECONDS;
      scheduleOscillator(audio, frequency(bass + (beat === 2 ? 12 : 0)), beatStart, UNIGLEE_BEAT_SECONDS * 0.58, 0.036, "square", 0.012, unigleeBus, scheduledUniGleeSources);
      scheduleBrush(audio, beatStart + UNIGLEE_BEAT_SECONDS * 0.5, beat % 2 ? 3_200 : 2_100, unigleeBus, scheduledUniGleeSources, 0.018);
    }
    if (bar % 2 === 1) {
      scheduleOscillator(audio, frequency(lead[bar % lead.length]), barStart + UNIGLEE_BEAT_SECONDS * 2.5, UNIGLEE_BEAT_SECONDS * 0.72, 0.042, "triangle", 0.018, unigleeBus, scheduledUniGleeSources);
    }
    if (bar % 4 === 3) scheduleBrush(audio, barStart + UNIGLEE_BEAT_SECONDS * 3.75, 4_800, unigleeBus, scheduledUniGleeSources, 0.028);
  }
}

function scheduleFollowingUniGleeCycle(): void {
  const audio = getAudioContext();
  if (!unigleeRunning || !audio) return;
  unigleeCycleStart += UNIGLEE_SCORE_DURATION_SECONDS;
  scheduleUniGleeCycle(unigleeCycleStart);
  unigleeLoopTimer = window.setTimeout(scheduleFollowingUniGleeCycle, Math.max(30, (UNIGLEE_SCORE_DURATION_SECONDS - 0.6) * 1_000));
}

/** Start the distinct long-form UniGlee score after the capture gesture. */
export function startUniGleeMusic(): void {
  const audio = getAudioContext();
  if (!audio || !musicEnabled || unigleeRunning) return;
  unigleeBus = audio.createGain();
  unigleeBus.gain.setValueAtTime(0.0001, audio.currentTime);
  unigleeBus.gain.linearRampToValueAtTime(musicVolume * 0.19, audio.currentTime + 0.3);
  unigleeBus.connect(audio.destination);
  unigleeRunning = true;
  unigleeCycleStart = audio.currentTime + 0.05;
  scheduleUniGleeCycle(unigleeCycleStart);
  unigleeLoopTimer = window.setTimeout(scheduleFollowingUniGleeCycle, Math.max(30, (UNIGLEE_SCORE_DURATION_SECONDS - 0.6) * 1_000));
}

export function stopUniGleeMusic(): void {
  unigleeRunning = false;
  if (unigleeLoopTimer !== undefined) {
    window.clearTimeout(unigleeLoopTimer);
    unigleeLoopTimer = undefined;
  }
  const audio = getAudioContext();
  if (unigleeBus && audio) unigleeBus.gain.setTargetAtTime(0.0001, audio.currentTime, 0.025);
  for (const source of scheduledUniGleeSources) {
    try { source.stop((audio?.currentTime ?? 0) + 0.08); } catch { /* voice already ended */ }
  }
  scheduledUniGleeSources.clear();
  const busToDisconnect = unigleeBus;
  unigleeBus = undefined;
  if (busToDisconnect) window.setTimeout(() => busToDisconnect.disconnect(), 150);
}

const BOLD_CHAI_URGENCY_BPM = 104;
const BOLD_CHAI_URGENCY_BEAT_SECONDS = 60 / BOLD_CHAI_URGENCY_BPM;
const BOLD_CHAI_URGENCY_BAR_SECONDS = BOLD_CHAI_URGENCY_BEAT_SECONDS * 4;
const BOLD_CHAI_URGENCY_CYCLE_SECONDS = BOLD_CHAI_URGENCY_BAR_SECONDS * 2;

/**
 * A compact pressure layer for the 30-second barista scene. It is deliberately
 * a layer rather than a replacement score: warm low pulses suggest a busy
 * counter, offbeat chord taps add forward motion, and synthesized brushes keep
 * the hands-in-motion feeling without introducing a borrowed melody or sample.
 */
function scheduleUrgencyCycle(start: number): void {
  const audio = getAudioContext();
  if (!audio || !urgencyBus) return;

  const bassPattern = [40, 40, 43, 40, 38, 38, 36, 38];
  const chordPattern = [
    [52, 55, 59],
    [50, 54, 57],
  ];

  bassPattern.forEach((midi, beat) => {
    const beatStart = start + beat * BOLD_CHAI_URGENCY_BEAT_SECONDS;
    scheduleOscillator(
      audio,
      frequency(midi),
      beatStart,
      BOLD_CHAI_URGENCY_BEAT_SECONDS * 0.72,
      0.026,
      beat % 2 === 0 ? "triangle" : "sawtooth",
      0.012,
      urgencyBus,
      scheduledUrgencySources,
    );

    // The tiny offbeat chord is the rhythmic "pump" of the layer; it stays
    // quiet enough for the registered pump and cascade effects to lead.
    const offbeatStart = beatStart + BOLD_CHAI_URGENCY_BEAT_SECONDS * 0.5;
    chordPattern[beat % chordPattern.length].forEach((chordTone, voice) => {
      scheduleOscillator(
        audio,
        frequency(chordTone + (voice === 2 && beat % 4 === 3 ? 12 : 0)),
        offbeatStart + voice * 0.008,
        BOLD_CHAI_URGENCY_BEAT_SECONDS * 0.24,
        0.012,
        "triangle",
        0.008,
        urgencyBus,
        scheduledUrgencySources,
      );
    });

    scheduleBrush(
      audio,
      beatStart + BOLD_CHAI_URGENCY_BEAT_SECONDS * 0.25,
      beat % 2 === 0 ? 2_350 : 3_000,
      urgencyBus,
      scheduledUrgencySources,
      0.011,
    );
    scheduleBrush(
      audio,
      beatStart + BOLD_CHAI_URGENCY_BEAT_SECONDS * 0.75,
      3_300,
      urgencyBus,
      scheduledUrgencySources,
      0.008,
    );
  });

  // A short two-note lift at the end of each phrase gives the layer a
  // little barista-counter urgency without becoming a second lead melody.
  scheduleOscillator(
    audio,
    frequency(64),
    start + BOLD_CHAI_URGENCY_CYCLE_SECONDS - BOLD_CHAI_URGENCY_BEAT_SECONDS * 0.35,
    0.18,
    0.012,
    "sine",
    0.01,
    urgencyBus,
    scheduledUrgencySources,
  );
  scheduleOscillator(
    audio,
    frequency(71),
    start + BOLD_CHAI_URGENCY_CYCLE_SECONDS - BOLD_CHAI_URGENCY_BEAT_SECONDS * 0.12,
    0.16,
    0.014,
    "sine",
    0.01,
    urgencyBus,
    scheduledUrgencySources,
  );
}

function scheduleFollowingUrgencyCycle(): void {
  const audio = getAudioContext();
  if (!urgencyRunning || !audio) return;
  urgencyCycleStart += BOLD_CHAI_URGENCY_CYCLE_SECONDS;
  scheduleUrgencyCycle(urgencyCycleStart);
  const wakeAt = Math.max(30, (urgencyCycleStart - audio.currentTime - 0.45) * 1_000);
  urgencyLoopTimer = window.setTimeout(scheduleFollowingUrgencyCycle, wakeAt);
}

function startUrgencyLayer(start: number): void {
  const audio = getAudioContext();
  if (!audio || !musicBus || urgencyRunning) return;

  urgencyBus = audio.createGain();
  urgencyBus.gain.setValueAtTime(0.0001, audio.currentTime);
  urgencyBus.gain.linearRampToValueAtTime(musicVolume * 0.075, audio.currentTime + 0.12);
  urgencyBus.connect(audio.destination);
  urgencyRunning = true;
  urgencyCycleStart = start;
  scheduleUrgencyCycle(start);
  urgencyLoopTimer = window.setTimeout(
    scheduleFollowingUrgencyCycle,
    Math.max(30, (BOLD_CHAI_URGENCY_CYCLE_SECONDS - 0.45) * 1_000),
  );
}

function stopUrgencyLayer(): void {
  urgencyRunning = false;
  if (urgencyLoopTimer !== undefined) {
    window.clearTimeout(urgencyLoopTimer);
    urgencyLoopTimer = undefined;
  }

  const audio = getAudioContext();
  if (urgencyBus && audio) urgencyBus.gain.setTargetAtTime(0.0001, audio.currentTime, 0.025);
  for (const source of scheduledUrgencySources) {
    try {
      source.stop((audio?.currentTime ?? 0) + 0.08);
    } catch {
      // A source can have ended between the loop and stop call.
    }
  }
  scheduledUrgencySources.clear();
  const busToDisconnect = urgencyBus;
  urgencyBus = undefined;
  if (busToDisconnect) window.setTimeout(() => busToDisconnect.disconnect(), 150);
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
  if (boldChaiUrgencyEnabled) startUrgencyLayer(cycleStart);
  loopTimer = window.setTimeout(scheduleFollowingCycle, Math.max(30, (BASE_SCORE_DURATION_SECONDS - 0.5) * 1_000));
}

/**
 * Toggle the original high-velocity chai-production layer. The base score
 * keeps running underneath; disabling it fades only this layer back out.
 */
export function setBoldChaiUrgency(enabled: boolean): void {
  boldChaiUrgencyEnabled = enabled;
  if (enabled) {
    const audio = getAudioContext();
    if (running && audio) startUrgencyLayer(audio.currentTime + 0.06);
  } else {
    stopUrgencyLayer();
  }
}

/** Set the music mix (0–3); changes take effect immediately while playing. */
export function setMusicVolume(volume: number): void {
  musicVolume = clampMusicVolume(volume);
  const audio = getAudioContext();
  if (musicBus && audio) musicBus.gain.setTargetAtTime(musicVolume * 0.14, audio.currentTime, 0.025);
  if (urgencyBus && audio) urgencyBus.gain.setTargetAtTime(musicVolume * 0.075, audio.currentTime, 0.025);
  if (unigleeBus && audio) unigleeBus.gain.setTargetAtTime(musicVolume * 0.19, audio.currentTime, 0.025);
}

/** Stop all scheduled score voices immediately when the shared Sound toggle is off. */
export function stopBaseMusic(): void {
  running = false;
  stopUniGleeMusic();
  stopUrgencyLayer();
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
