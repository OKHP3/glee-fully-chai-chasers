import { describe, expect, it } from "vitest";
import {
  BOLD_CHAI_CUP_RESET_MS,
  BOLD_CHAI_DURATION_MS,
  BOLD_CHAI_FREE_SPINS_PER_CUP,
  BOLD_CHAI_PUMPS_PER_CUP,
  completeBoldChaiPump,
  createBoldChaiPumpState,
  pumpBoldChai,
  settleBoldChaiPump,
} from "./bold-chai-pump";

describe("Bold Chai Pump state", () => {
  it("fills one cup over twelve accepted pumps and awards ten free spins", () => {
    let state = createBoldChaiPumpState();
    for (let pump = 1; pump <= BOLD_CHAI_PUMPS_PER_CUP; pump++) {
      const action = pumpBoldChai(state, pump * 100);
      expect(action.accepted).toBe(true);
      expect(action.event?.kind).toBe(pump === BOLD_CHAI_PUMPS_PER_CUP ? "chai_completed" : "pump");
      state = action.state;
    }

    expect(state.phase).toBe("resetting");
    expect(state.pumpsInCurrentCup).toBe(12);
    expect(state.completedChais).toBe(1);
    expect(state.freeSpinsAwarded).toBe(BOLD_CHAI_FREE_SPINS_PER_CUP);
  });

  it("rejects pumps while the cup replacement is in progress", () => {
    let state = createBoldChaiPumpState();
    for (let pump = 1; pump <= BOLD_CHAI_PUMPS_PER_CUP; pump++) {
      state = pumpBoldChai(state, pump * 100).state;
    }

    const blocked = pumpBoldChai(state, state.resetUntilMs! - 1);
    expect(blocked.accepted).toBe(false);
    expect(blocked.reason).toBe("resetting");
    expect(blocked.state).toEqual(state);

    const resumed = pumpBoldChai(state, state.resetUntilMs!);
    expect(resumed.accepted).toBe(true);
    expect(resumed.state.pumpsInCurrentCup).toBe(1);
  });

  it("counts reset time against the same thirty-second clock", () => {
    let state = createBoldChaiPumpState();
    for (let pump = 1; pump <= BOLD_CHAI_PUMPS_PER_CUP; pump++) {
      state = pumpBoldChai(state, (pump - 1) * 10).state;
    }

    expect(state.resetUntilMs).toBe((BOLD_CHAI_PUMPS_PER_CUP - 1) * 10 + BOLD_CHAI_CUP_RESET_MS);
    const settled = settleBoldChaiPump(state, 30_000);
    expect(settled.phase).toBe("ended");
    expect(completeBoldChaiPump(state, 30_000)).toMatchObject({
      completedChais: 1,
      partialPumps: 0,
      freeSpinsAwarded: 10,
    });
  });

  it("does not award an incomplete cup at timeout", () => {
    let state = createBoldChaiPumpState();
    for (let pump = 1; pump < BOLD_CHAI_PUMPS_PER_CUP; pump++) {
      state = pumpBoldChai(state, pump * 100).state;
    }

    const result = completeBoldChaiPump(state, BOLD_CHAI_DURATION_MS);
    expect(result.completedChais).toBe(0);
    expect(result.partialPumps).toBe(11);
    expect(result.freeSpinsAwarded).toBe(0);
  });

  it("rejects input after the session has ended", () => {
    let state = createBoldChaiPumpState();
    state = pumpBoldChai(state, 0).state;
    state = settleBoldChaiPump(state, BOLD_CHAI_DURATION_MS);
    const action = pumpBoldChai(state, BOLD_CHAI_DURATION_MS + 1);
    expect(action.accepted).toBe(false);
    expect(action.reason).toBe("ended");
  });
});
