import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

interface SimAgentReport {
  paidSpins: number;
  playerModel: {
    lapQuestChoice: string;
    lapQuestPetting: string;
  };
  terminatedByCascadeCap: number;
  lapQuestCappedCascades: number;
  bonuses: {
    uniglee: {
      encountered: number;
    };
    lapQuest: {
      encountered: number;
      played: number;
      freeSpinsPlayed: number;
      win: number;
      cappedSessions: number;
    };
  };
}

describe("full-game simulation agent", () => {
  it("reports canonical Lap Quest as UniGlee act 5 with its player model and cap alarms", () => {
    const stdout = execFileSync(
      "pnpm",
      ["exec", "tsx", "scripts/sim-agent.ts", "test", "1", "5000"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const report = JSON.parse(stdout) as SimAgentReport;

    expect(report.paidSpins).toBe(5000);
    expect(report.bonuses.uniglee.encountered).toBeGreaterThan(0);
    expect(report.bonuses.lapQuest.encountered).toBe(report.bonuses.uniglee.encountered);
    expect(report.bonuses.lapQuest.played).toBe(report.bonuses.uniglee.encountered);
    expect(report.bonuses.lapQuest.freeSpinsPlayed).toBeGreaterThan(0);
    expect(report.bonuses.lapQuest.win).toBeGreaterThan(0);
    expect(report.playerModel.lapQuestChoice).toContain("random uniform");
    expect(report.playerModel.lapQuestChoice).toContain("1-in-3 perfect lap");
    expect(report.playerModel.lapQuestPetting).toContain("prevent inactivity");
    expect(report.playerModel.lapQuestPetting).toContain("Joey arrival");
    expect(report.terminatedByCascadeCap).toBe(0);
    expect(report.lapQuestCappedCascades).toBe(0);
  });
});