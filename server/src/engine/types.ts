import type {
  TasksCategoryEnum,
  TasksTimeGateEnum,
} from "../utils/dtos/enums";

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
