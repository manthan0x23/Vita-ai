import { ScoringEngine } from "../src/engine/scoring";
import type {
  Task,
  Metrics,
  SuperGoals,
  TodayState,
} from "../src/engine/types";

describe("ScoringEngine", () => {
  const now = new Date(2025, 8, 28, 10, 0, 0);

  const defaultSuperGoals: SuperGoals = {
    hydration: 2000,
    movement: 10000,
    sleep: 8,
    screen: 120,
    mood: 3,
  };

  describe("inverseEffort", () => {
    it("calculates inverse effort correctly for various values", () => {
      expect(ScoringEngine.inverseEffort(3)).toBeCloseTo(1 / Math.log2(5));
      expect(ScoringEngine.inverseEffort(0)).toBeCloseTo(1 / Math.log2(3));
    });
  });

  describe("urgency", () => {
    it("hydration at 50% progress returns 0.5", () => {
      const task: Task = {
        id: "1",
        title: "Drink water",
        category: "hydration",
        impactWeight: 1,
        effortMin: 10,
      };
      const metrics: Metrics = {
        waterMl: 1000,
        steps: 0,
        sleepHours: 0,
        screenTimeMin: 0,
        mood1to5: 3,
      };
      expect(
        ScoringEngine.urgency(task, metrics, defaultSuperGoals)
      ).toBeCloseTo(0.5);
    });

    it("mood <=2 returns high urgency (1)", () => {
      const task: Task = {
        id: "5",
        title: "Mood check",
        category: "mood",
        impactWeight: 1,
        effortMin: 10,
      };
      const metrics: Metrics = {
        waterMl: 0,
        steps: 0,
        sleepHours: 0,
        screenTimeMin: 0,
        mood1to5: 2,
      };
      expect(ScoringEngine.urgency(task, metrics, defaultSuperGoals)).toBe(1);
    });
  });

  describe("recencyPenalty", () => {
    it("applies penalties based on completion time", () => {
      expect(ScoringEngine.recencyPenalty(null, now)).toBe(0);
      
      const recent = new Date(now.getTime() - 10 * 60000); // 10 min ago
      expect(ScoringEngine.recencyPenalty(recent, now)).toBe(1);
      
      const older = new Date(now.getTime() - 180 * 60000); // 3 hours ago
      expect(ScoringEngine.recencyPenalty(older, now)).toBe(0);
    });
  });

  describe("timeOfDayFactor", () => {
    it("applies time gate penalties correctly", () => {
      expect(ScoringEngine.timeOfDayFactor(now, "morning")).toBe(1);
      expect(ScoringEngine.timeOfDayFactor(now, "evening")).toBe(0.2);
      expect(ScoringEngine.timeOfDayFactor(now, "anytime")).toBe(1);
    });
  });

  describe("computeScore", () => {
    it("computes final score and applies time gate penalties", () => {
      const metrics: Metrics = {
        waterMl: 1000,
        steps: 5000,
        sleepHours: 6,
        screenTimeMin: 150,
        mood1to5: 2,
      };
      const state: TodayState = {
        lastCompletion: new Date(now.getTime() - 15 * 60000),
        ignores: 0,
        completedToday: false,
      };

      const task: Task = {
        id: "1",
        title: "Hydrate",
        category: "hydration",
        impactWeight: 1,
        effortMin: 10,
        timeGate: "evening",
      };

      const score = ScoringEngine.computeScore(
        task,
        state,
        metrics,
        defaultSuperGoals,
        now
      );
      
      const scoreAnytime = ScoringEngine.computeScore(
        { ...task, timeGate: "anytime" },
        state,
        metrics,
        defaultSuperGoals,
        now
      );
      
      expect(typeof score).toBe("number");
      expect(score).toBeLessThan(scoreAnytime);
    });
  });
});