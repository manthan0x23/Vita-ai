import type { TasksTimeGateEnum } from "../utils/dtos/enums";
import { Metrics, SuperGoals, Task, TodayState } from "./types";

export class ScoringEngine {
  private static W = {
    urgency: 0.5,
    impact: 0.3,
    effort: 0.15,
    tod: 0.15,
    penalty: 0.2,
    recency: 0.25,
  };

  private static inverseEffort(min: number): number {
    const m = Math.max(1, min);
    return 1 / Math.log2(m + 2);
  }

  private static timeOfDayFactor(now: Date, gate?: TasksTimeGateEnum): number {
    if (!gate) return 1;
    const h = now.getHours();
    const isMorning = h >= 5 && h <= 11;
    const isAfternoon = h >= 12 && h <= 17;
    const isEvening = h >= 18 && h <= 23;
    const inWindow =
      gate == "anytime" ||
      (gate === "morning" && isMorning) ||
      (gate === "afternoon" && isAfternoon) ||
      (gate === "evening" && isEvening);
    return inWindow ? 1 : 0.2;
  }

  private static urgency(task: Task, m: Metrics, s: SuperGoals): number {
    switch (task.category) {
      case "hydration": {
        const goal = s.hydration;
        return m.waterMl < goal ? (goal - m.waterMl) / goal : 0;
      }
      case "movement": {
        const goal = s.movement;
        return m.steps < goal ? (goal - m.steps) / goal : 0;
      }
      case "sleep": {
        const goal = s.sleep;
        return m.sleepHours < goal ? 1 : 0;
      }
      case "screen": {
        const limit = s.screen;
        return m.screenTimeMin > limit ? 1 : 0;
      }
      case "mood": {
        const v = m.mood1to5 ?? 3;
        return v <= 2 ? 1 : 0.2;
      }
      default:
        return 0;
    }
  }

  private static recencyPenalty(
    lastCompletion: Date | null,
    now: Date
  ): number {
    if (!lastCompletion) return 0;
    const diffMinutes = (now.getTime() - lastCompletion.getTime()) / 60000;
    if (diffMinutes < 30) return 1;
    if (diffMinutes < 60) return 0.6;
    if (diffMinutes < 120) return 0.3;
    return 0;
  }

  public static computeScore(
    task: Task,
    state: TodayState,
    m: Metrics,
    superGoals: SuperGoals,
    now: Date
  ) {
    const U = this.urgency(task, m, superGoals);
    const invEff = this.inverseEffort(task.effortMin);
    const tod = this.timeOfDayFactor(now, task.timeGate);
    const rec = this.recencyPenalty(state.lastCompletion, now);
    const s =
      this.W.urgency * U +
      this.W.impact * task.impactWeight +
      this.W.effort * invEff +
      this.W.tod * tod -
      this.W.penalty * state.ignores -
      this.W.recency * rec;
    return Math.round(s * 1e4) / 1e4;
  }
}
