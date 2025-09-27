import type { TasksCategoryEnum, TasksTimeGateEnum } from "../utils/dtos/enums";

export interface Task {
  id: string;
  title: string;
  category: TasksCategoryEnum;
  impactWeight: number;
  effortMin: number;
  timeGate?: TasksTimeGateEnum;
}

export interface Metrics {
  waterMl: number;
  steps: number;
  sleepHours: number;
  screenTimeMin: number;
  mood1to5?: number | null;
}

export interface SuperGoals {
  hydration: number;
  mood: number;
  sleep: number;
  movement: number;
  screen: number;
}

export const DefaultSuperGoals: SuperGoals = {
  hydration: 2400,
  mood: 0,
  sleep: 8,
  movement: 8000,
  screen: 120,
};

export interface TodayState {
  ignores: number;
  lastCompletion: Date | null;
  completedToday: boolean;
}

export interface ScoredTask {
  id: string;
  score: number;
  rationale?: string;
  base: Task;
}
