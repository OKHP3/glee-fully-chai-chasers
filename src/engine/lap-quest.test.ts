import { describe, expect, it } from "vitest";
import {
  createLapQuestChallenge,
  LAP_QUEST_SPOTS,
  LAP_QUEST_WILD_COUNTS,
  resolveLapQuestChoice,
  spinLapQuestRound,
} from "./lap-quest";
import { mulberry32 } from "./rng";
import { emptyTreatJar } from "./features";
import { spin } from "./cascade";

describe("Phoebe's Lap Quest", () => {
  it("offers three unique cozy spots and keeps the perfect spot inside the choices", () => {
    const challenge = createLapQuestChallenge(mulberry32(17));

    expect(challenge.choices).toHaveLength(3);
    expect(new Set(challenge.choices).size).toBe(3);
    expect([...challenge.choices]).toEqual(expect.arrayContaining([...LAP_QUEST_SPOTS]));
    expect(challenge.choices).toContain(challenge.perfectSpot);
  });

  it("gives every choice comfort, with a stronger perfect-lap result", () => {
    const challenge = createLapQuestChallenge(mulberry32(29));
    const perfect = resolveLapQuestChoice(challenge, challenge.perfectSpot, mulberry32(31));
    const cozySpot = challenge.choices.find((spot) => spot !== challenge.perfectSpot)!;
    const cozy = resolveLapQuestChoice(challenge, cozySpot, mulberry32(31));

    expect(perfect.perfectLap).toBe(true);
    expect(perfect.comfortWilds).toHaveLength(LAP_QUEST_WILD_COUNTS.perfect);
    expect(cozy.perfectLap).toBe(false);
    expect(cozy.comfortWilds).toHaveLength(LAP_QUEST_WILD_COUNTS.cozy);
    expect(new Set(cozy.comfortWilds.map((wild) => wild.position.join(":"))).size).toBe(2);
  });

  it("keeps Phoebe's comfort-wilds fixed through the cascade chain", () => {
    const challenge = createLapQuestChallenge(mulberry32(41));
    const round = spinLapQuestRound(mulberry32(43), challenge, challenge.perfectSpot, 1);

    expect(round.kind).toBe("lap_quest_round");
    expect(round.unigleeTriggered).toBe(false);
    expect(round.doorbellPanic).toBeUndefined();
    expect(round.boldChaiPump).toBeUndefined();
    expect(round.treatTimeBonus).toBeUndefined();
    expect(round.comfortWilds).toHaveLength(LAP_QUEST_WILD_COUNTS.perfect);

    for (const step of round.steps) {
      for (const wild of round.comfortWilds) {
        const [reel, row] = wild.position;
        expect(step.grid[reel][row]).toMatchObject({ symbol: "wild_phoebe", sticky: "lap_quest" });
      }
      expect(step.stickyWilds).toEqual(round.comfortWilds);
    }
  });

  it("keeps fixed wilds in place even when their payline wins resolve", () => {
    const stickyWilds = [
      { position: [0, 0] as [number, number], symbol: "wild_phoebe" as const, sticky: "lap_quest" as const },
      { position: [4, 3] as [number, number], symbol: "wild_phoebe" as const, sticky: "lap_quest" as const },
    ];
    const startingGrid = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => ({ symbol: "tumbler" as const })),
    );
    const result = spin({
      rng: mulberry32(67),
      betPerLine: 1,
      treatJar: emptyTreatJar(),
      spinsSincePopIn: 999,
      startingGrid,
      stickyWilds,
      spinArea: "secondary",
      allowDoorbells: false,
      includeBoldChaiPump: false,
      allowTreatTimeBonus: false,
      allowUniGlee: false,
    });

    expect(result.steps[0].wins.length).toBeGreaterThan(0);
    for (const step of result.steps) {
      expect(step.grid[0][0]).toMatchObject({ symbol: "wild_phoebe", sticky: "lap_quest" });
      expect(step.grid[4][3]).toMatchObject({ symbol: "wild_phoebe", sticky: "lap_quest" });
    }
  });

  it("rejects a choice that was not offered", () => {
    const challenge = createLapQuestChallenge(mulberry32(53));

    expect(() => resolveLapQuestChoice(challenge, "not_a_spot" as never, mulberry32(59))).toThrow("not available");
  });
});
