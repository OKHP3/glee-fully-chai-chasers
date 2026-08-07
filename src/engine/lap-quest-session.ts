/**
 * Pure timed-session state machine for Phoebe's Lap Quest.
 *
 * The caller owns the clock and supplies the approved point ladder. This
 * module owns only deterministic session state, Joey's one-time deadline,
 * petting watchdogs, and explicit termination reasons.
 */
import type { Rng } from "./rng";

export type LapQuestEndReason =
  | "joey_interrupt"
  | "unpetted"
  | "cap_reached"
  | "marathon_ended";

export type LapQuestPhase = "grace" | "petting" | "ended";

export interface LapQuestSessionConfig {
  minDurationMs: number;
  maxDurationMs: number;
  inactivityTimeoutMs: number;
  pointTickMs: number;
  /** One award per completed point tick; the parent supplies the math. */
  lapCoinsByTick: readonly number[];
}

export interface LapQuestSessionState {
  kind: "lap_quest_state";
  phase: LapQuestPhase;
  startedAtMs: number;
  /** Last caller-observed clock value. */
  clockMs: number;
  lastPetAtMs: number | null;
  nextPointAtMs: number;
  pointTicksCompleted: number;
  lapCoinsAwarded: number;
  petCount: number;
  /** Engine-only; do not reveal the exact Joey deadline to the player. */
  joeyArrivalAtMs: number;
  /** Engine-owned watchdog deadline; UI should show only a friendly indicator. */
  inactivityDeadlineAtMs: number;
  endReason?: LapQuestEndReason;
  endedAtMs?: number;
}

export interface LapQuestSessionAdvanceOptions {
  /** A parent marathon may end this chapter at the supplied clock value. */
  parentEnded?: boolean;
  /** Absolute marathon cap timestamp, if one has been approved. */
  capAtMs?: number;
}

export interface LapQuestSessionAdvanceResult {
  kind: "lap_quest_advance";
  state: LapQuestSessionState;
  pointsAwarded: number;
  ended: boolean;
  endReason?: LapQuestEndReason;
}

export interface LapQuestSessionPetResult {
  kind: "lap_quest_pet";
  state: LapQuestSessionState;
  accepted: boolean;
  /** Present only when the pet was rejected because the session had ended. */
  rejectionReason?: "session_ended";
  pointsAwarded: number;
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite`);
}

function validateConfig(config: LapQuestSessionConfig): void {
  assertFinite(config.minDurationMs, "minDurationMs");
  assertFinite(config.maxDurationMs, "maxDurationMs");
  assertFinite(config.inactivityTimeoutMs, "inactivityTimeoutMs");
  assertFinite(config.pointTickMs, "pointTickMs");
  if (config.minDurationMs < 0 || config.maxDurationMs < config.minDurationMs) {
    throw new RangeError("Lap Quest duration bounds are invalid");
  }
  if (config.inactivityTimeoutMs <= 0 || config.pointTickMs <= 0) {
    throw new RangeError("Lap Quest timers must be greater than zero");
  }
  for (const award of config.lapCoinsByTick) {
    assertFinite(award, "lapCoinsByTick award");
    if (award < 0) throw new RangeError("Lap Quest awards cannot be negative");
  }
}

function sampleArrivalOffset(rng: Rng, config: LapQuestSessionConfig): number {
  const span = config.maxDurationMs - config.minDurationMs;
  const roll = rng();
  const normalized = Number.isFinite(roll) ? Math.min(1, Math.max(0, roll)) : 0;
  // Clamp the upper edge so even a defensive RNG returning 1 stays in range.
  return Math.min(span, Math.floor(normalized * (span + 1))) + config.minDurationMs;
}

function cloneState(state: LapQuestSessionState): LapQuestSessionState {
  return { ...state };
}

function accrueThrough(
  state: LapQuestSessionState,
  throughMs: number,
  config: LapQuestSessionConfig,
): number {
  let pointsAwarded = 0;
  while (state.nextPointAtMs <= throughMs) {
    const award = config.lapCoinsByTick[state.pointTicksCompleted] ?? 0;
    state.lapCoinsAwarded += award;
    pointsAwarded += award;
    state.pointTicksCompleted += 1;
    state.nextPointAtMs += config.pointTickMs;
  }
  return pointsAwarded;
}

function finish(
  state: LapQuestSessionState,
  atMs: number,
  reason: LapQuestEndReason,
  config: LapQuestSessionConfig,
): number {
  const pointsAwarded = accrueThrough(state, atMs, config);
  state.clockMs = atMs;
  state.phase = "ended";
  state.endReason = reason;
  state.endedAtMs = atMs;
  return pointsAwarded;
}

function result(
  state: LapQuestSessionState,
  pointsAwarded: number,
): LapQuestSessionAdvanceResult {
  return {
    kind: "lap_quest_advance",
    state,
    pointsAwarded,
    ended: state.phase === "ended",
    ...(state.endReason ? { endReason: state.endReason } : {}),
  };
}

function validateClock(state: LapQuestSessionState, atMs: number): void {
  assertFinite(atMs, "atMs");
  if (atMs < state.clockMs) {
    throw new RangeError("Lap Quest clock cannot move backwards");
  }
}

export function createLapQuestSession(
  startedAtMs: number,
  rng: Rng,
  config: LapQuestSessionConfig,
): LapQuestSessionState {
  assertFinite(startedAtMs, "startedAtMs");
  validateConfig(config);
  const joeyArrivalAtMs = startedAtMs + sampleArrivalOffset(rng, config);
  const graceEndsAtMs = startedAtMs + config.minDurationMs;

  return {
    kind: "lap_quest_state",
    phase: "grace",
    startedAtMs,
    clockMs: startedAtMs,
    lastPetAtMs: null,
    nextPointAtMs: startedAtMs + config.pointTickMs,
    pointTicksCompleted: 0,
    lapCoinsAwarded: 0,
    petCount: 0,
    joeyArrivalAtMs,
    inactivityDeadlineAtMs: graceEndsAtMs + config.inactivityTimeoutMs,
  };
}

/**
 * Advance the session to an injected wall-clock value. Calling this after the
 * session ends is intentionally idempotent and returns the same state.
 */
export function advanceLapQuestSession(
  input: LapQuestSessionState,
  atMs: number,
  config: LapQuestSessionConfig,
  options: LapQuestSessionAdvanceOptions = {},
): LapQuestSessionAdvanceResult {
  if (input.phase === "ended") return result(cloneState(input), 0);
  validateConfig(config);
  validateClock(input, atMs);
  if (options.capAtMs !== undefined) {
    assertFinite(options.capAtMs, "capAtMs");
    if (options.capAtMs < input.clockMs) throw new RangeError("capAtMs cannot precede the session clock");
  }

  const state = cloneState(input);
  if (options.parentEnded) {
    return result(state, finish(state, atMs, "marathon_ended", config));
  }

  const candidates: Array<{ atMs: number; reason: LapQuestEndReason; priority: number }> = [];
  if (options.capAtMs !== undefined && options.capAtMs <= atMs) {
    candidates.push({ atMs: options.capAtMs, reason: "cap_reached", priority: 3 });
  }
  if (state.joeyArrivalAtMs <= atMs) {
    candidates.push({ atMs: state.joeyArrivalAtMs, reason: "joey_interrupt", priority: 2 });
  }
  if (state.inactivityDeadlineAtMs <= atMs) {
    candidates.push({ atMs: state.inactivityDeadlineAtMs, reason: "unpetted", priority: 1 });
  }

  if (candidates.length > 0) {
    candidates.sort((left, right) => left.atMs - right.atMs || right.priority - left.priority);
    const ending = candidates[0];
    return result(state, finish(state, ending.atMs, ending.reason, config));
  }

  const pointsAwarded = accrueThrough(state, atMs, config);
  state.clockMs = atMs;
  if (atMs >= state.startedAtMs + config.minDurationMs) state.phase = "petting";
  return result(state, pointsAwarded);
}

/**
 * Accept one bounded Phoebe pet. Petting in grace is allowed but does not move
 * the grace boundary; after grace it resets the five-second watchdog.
 */
export function petLapQuestSession(
  input: LapQuestSessionState,
  atMs: number,
  config: LapQuestSessionConfig,
  options: LapQuestSessionAdvanceOptions = {},
): LapQuestSessionPetResult {
  if (input.phase === "ended") {
    return {
      kind: "lap_quest_pet",
      state: cloneState(input),
      accepted: false,
      rejectionReason: "session_ended",
      pointsAwarded: 0,
    };
  }

  const advanced = advanceLapQuestSession(input, atMs, config, options);
  if (advanced.state.phase === "ended") {
    return {
      kind: "lap_quest_pet",
      state: advanced.state,
      accepted: false,
      rejectionReason: "session_ended",
      pointsAwarded: advanced.pointsAwarded,
    };
  }

  const state = cloneState(advanced.state);
  state.lastPetAtMs = atMs;
  state.petCount += 1;
  if (atMs >= state.startedAtMs + config.minDurationMs) {
    state.phase = "petting";
    state.inactivityDeadlineAtMs = atMs + config.inactivityTimeoutMs;
  }

  return {
    kind: "lap_quest_pet",
    state,
    accepted: true,
    pointsAwarded: advanced.pointsAwarded,
  };
}

/** Apply an explicit parent-owned cap or marathon termination. */
export function terminateLapQuestSession(
  input: LapQuestSessionState,
  atMs: number,
  reason: "cap_reached" | "marathon_ended",
  config: LapQuestSessionConfig,
): LapQuestSessionAdvanceResult {
  if (input.phase === "ended") return result(cloneState(input), 0);
  validateConfig(config);
  validateClock(input, atMs);
  const state = cloneState(input);
  return result(state, finish(state, atMs, reason, config));
}
