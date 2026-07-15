/**
 * Bold Chai Pump rapid-tap bonus state.
 * Pure TypeScript: no DOM, timers, audio, or UI imports.
 */
import type {
  BoldChaiPumpActionResult,
  BoldChaiPumpBonusResult,
  BoldChaiPumpEvent,
  BoldChaiPumpState,
} from "./types";

export const BOLD_CHAI_DURATION_MS = 30_000;
export const BOLD_CHAI_PUMPS_PER_CUP = 12;
export const BOLD_CHAI_FREE_SPINS_PER_CUP = 10;
/** Initial presentation target; the RTP/playtest pass may tune this later. */
export const BOLD_CHAI_CUP_RESET_MS = 3_000;

export function createBoldChaiPumpState(): BoldChaiPumpState {
  return {
    phase: "ready",
    totalPumps: 0,
    pumpsInCurrentCup: 0,
    completedChais: 0,
    freeSpinsAwarded: 0,
  };
}

function copyState(state: BoldChaiPumpState, updates: Partial<BoldChaiPumpState>): BoldChaiPumpState {
  return { ...state, ...updates };
}

function elapsedMs(state: BoldChaiPumpState, nowMs: number): number {
  return state.startedAtMs === undefined ? 0 : Math.max(0, nowMs - state.startedAtMs);
}

function expire(state: BoldChaiPumpState, nowMs: number): BoldChaiPumpActionResult {
  const ended = copyState(state, { phase: "ended", resetUntilMs: undefined });
  const event: BoldChaiPumpEvent = { kind: "expired", elapsedMs: elapsedMs(state, nowMs) };
  return { state: ended, accepted: false, reason: "expired", event };
}

/**
 * Applies one discrete player pump. The first accepted pump starts the clock;
 * subsequent pumps are rejected during the cup replacement interval or after
 * the 30-second deadline.
 */
export function pumpBoldChai(state: BoldChaiPumpState, nowMs: number): BoldChaiPumpActionResult {
  if (state.phase === "ended") return { state, accepted: false, reason: "ended" };

  let next = state;
  if (state.phase === "resetting") {
    if ((state.resetUntilMs ?? nowMs) > nowMs) {
      return { state, accepted: false, reason: "resetting" };
    }
    next = copyState(state, { phase: "pumping", pumpsInCurrentCup: 0, resetUntilMs: undefined });
  }

  if (next.startedAtMs !== undefined && nowMs - next.startedAtMs >= BOLD_CHAI_DURATION_MS) {
    return expire(next, nowMs);
  }

  if (next.startedAtMs === undefined) {
    next = copyState(next, { phase: "pumping", startedAtMs: nowMs });
  }

  const pumpsInCurrentCup = next.pumpsInCurrentCup + 1;
  const totalPumps = next.totalPumps + 1;
  const elapsed = elapsedMs(next, nowMs);

  if (pumpsInCurrentCup === BOLD_CHAI_PUMPS_PER_CUP) {
    const completedChais = next.completedChais + 1;
    const freeSpinsAwarded = next.freeSpinsAwarded + BOLD_CHAI_FREE_SPINS_PER_CUP;
    const resetUntilMs = nowMs + BOLD_CHAI_CUP_RESET_MS;
    const completed = copyState(next, {
      phase: "resetting",
      resetUntilMs,
      totalPumps,
      pumpsInCurrentCup,
      completedChais,
      freeSpinsAwarded,
    });
    const event: BoldChaiPumpEvent = {
      kind: "chai_completed",
      elapsedMs: elapsed,
      fillLevel: BOLD_CHAI_PUMPS_PER_CUP,
      freeSpinsAwarded,
      resetUntilMs,
    };
    return { state: completed, accepted: true, event };
  }

  const pumping = copyState(next, { phase: "pumping", totalPumps, pumpsInCurrentCup });
  const event: BoldChaiPumpEvent = {
    kind: "pump",
    elapsedMs: elapsed,
    fillLevel: pumpsInCurrentCup,
    freeSpinsAwarded: pumping.freeSpinsAwarded,
  };
  return { state: pumping, accepted: true, event };
}

/** Ends an active session at the supplied monotonic timestamp. */
export function settleBoldChaiPump(state: BoldChaiPumpState, nowMs: number): BoldChaiPumpState {
  if (state.phase === "ended" || state.startedAtMs === undefined) return state;
  if (nowMs - state.startedAtMs >= BOLD_CHAI_DURATION_MS) {
    return copyState(state, { phase: "ended", resetUntilMs: undefined });
  }
  if (state.phase === "resetting" && (state.resetUntilMs ?? nowMs) <= nowMs) {
    return copyState(state, { phase: "pumping", pumpsInCurrentCup: 0, resetUntilMs: undefined });
  }
  return state;
}

export function completeBoldChaiPump(state: BoldChaiPumpState, nowMs: number): BoldChaiPumpBonusResult {
  const settled = settleBoldChaiPump(state, nowMs);
  return {
    kind: "bold_chai_pump_result",
    totalPumps: settled.totalPumps,
    completedChais: settled.completedChais,
    partialPumps: settled.pumpsInCurrentCup === BOLD_CHAI_PUMPS_PER_CUP ? 0 : settled.pumpsInCurrentCup,
    freeSpinsAwarded: settled.freeSpinsAwarded,
    endedBecause: "timeout",
  };
}
