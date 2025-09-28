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
    it("calculates inverse effort correctly", () => {
      expect(ScoringEngine.inverseEffort(3)).toBeCloseTo(1 / Math.log2(5));
      expect(ScoringEngine.inverseEffort(5)).toBeCloseTo(1 / Math.log2(7));
      expect(ScoringEngine.inverseEffort(10)).toBeCloseTo(1 / Math.log2(12));
      expect(ScoringEngine.inverseEffort(15)).toBeCloseTo(1 / Math.log2(17));
      // min = 0 => m = Math.max(1, 0) = 1 => 1 / Math.log2(1 + 2) = 1 / Math.log2(3)
      expect(ScoringEngine.inverseEffort(0)).toBeCloseTo(1 / Math.log2(3));
    });
  });

  describe("timeOfDayFactor", () => {
    it("returns 1 if no gate specified", () => {
      expect(ScoringEngine.timeOfDayFactor(now)).toBe(1);
    });

    it("returns 1 if in correct gate (morning)", () => {
      expect(ScoringEngine.timeOfDayFactor(now, "morning")).toBe(1);
    });

    it("returns 0.2 if outside gate (evening)", () => {
      expect(ScoringEngine.timeOfDayFactor(now, "evening")).toBe(0.2);
    });

    it("returns 1 for 'anytime'", () => {
      expect(ScoringEngine.timeOfDayFactor(now, "anytime")).toBe(1);
    });
  });

  describe("urgency", () => {
    it("hydration ramps correctly", () => {
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

    it("hydration at goal returns 0", () => {
      const task: Task = {
        id: "1",
        title: "Drink water",
        category: "hydration",
        impactWeight: 1,
        effortMin: 10,
      };
      const metrics: Metrics = {
        waterMl: 2000,
        steps: 0,
        sleepHours: 0,
        screenTimeMin: 0,
        mood1to5: 3,
      };
      expect(ScoringEngine.urgency(task, metrics, defaultSuperGoals)).toBe(0);
    });

    it("steps ramp correctly", () => {
      const task: Task = {
        id: "2",
        title: "Walk",
        category: "movement",
        impactWeight: 1,
        effortMin: 10,
      };
      const metrics: Metrics = {
        waterMl: 0,
        steps: 5000,
        sleepHours: 0,
        screenTimeMin: 0,
        mood1to5: 3,
      };
      expect(
        ScoringEngine.urgency(task, metrics, defaultSuperGoals)
      ).toBeCloseTo(0.5);
    });

    it("sleep below goal returns 1", () => {
      const task: Task = {
        id: "3",
        title: "Sleep",
        category: "sleep",
        impactWeight: 1,
        effortMin: 10,
      };
      const metrics: Metrics = {
        waterMl: 0,
        steps: 0,
        sleepHours: 5,
        screenTimeMin: 0,
        mood1to5: 3,
      };
      expect(ScoringEngine.urgency(task, metrics, defaultSuperGoals)).toBe(1);
    });

    it("screen above limit returns 1", () => {
      const task: Task = {
        id: "4",
        title: "Screen",
        category: "screen",
        impactWeight: 1,
        effortMin: 10,
      };
      const metrics: Metrics = {
        waterMl: 0,
        steps: 0,
        sleepHours: 0,
        screenTimeMin: 150,
        mood1to5: 3,
      };
      expect(ScoringEngine.urgency(task, metrics, defaultSuperGoals)).toBe(1);
    });

    it("mood <=2 returns 1", () => {
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

    it("mood >2 returns 0.2", () => {
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
        mood1to5: 4,
      };
      expect(ScoringEngine.urgency(task, metrics, defaultSuperGoals)).toBe(0.2);
    });
  });

  describe("recencyPenalty", () => {
    it("returns 0 if never completed", () => {
      expect(ScoringEngine.recencyPenalty(null, now)).toBe(0);
    });

    it("returns 1 if <30 min ago", () => {
      const last = new Date(now.getTime() - 10 * 60000);
      expect(ScoringEngine.recencyPenalty(last, now)).toBe(1);
    });

    it("returns 0.6 if <60 min ago", () => {
      const last = new Date(now.getTime() - 45 * 60000);
      expect(ScoringEngine.recencyPenalty(last, now)).toBe(0.6);
    });

    it("returns 0.3 if <120 min ago", () => {
      const last = new Date(now.getTime() - 90 * 60000);
      expect(ScoringEngine.recencyPenalty(last, now)).toBe(0.3);
    });

    it("returns 0 if >120 min ago", () => {
      const last = new Date(now.getTime() - 180 * 60000);
      expect(ScoringEngine.recencyPenalty(last, now)).toBe(0);
    });
  });

  describe("computeScore", () => {
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

    it("computes a numeric score", () => {
      const task: Task = {
        id: "1",
        title: "Hydrate",
        category: "hydration",
        impactWeight: 1,
        effortMin: 10,
      };
      const score = ScoringEngine.computeScore(
        task,
        state,
        metrics,
        defaultSuperGoals,
        now
      );
      expect(typeof score).toBe("number");
    });

    it("timeGate outside reduces score", () => {
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
      expect(score).toBeLessThan(scoreAnytime);
    });
  });
});
