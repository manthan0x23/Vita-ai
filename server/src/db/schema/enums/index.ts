import { pgEnum } from "drizzle-orm/pg-core";

export const tasksCategoryEnum = pgEnum("tasks_category_enum", [
  "hydration",
  "movement",
  "sleep",
  "screen",
  "mood",
]);

export const tasksTimeGateEnum = pgEnum("tasks_time_gate_enum", [
  "morning",
  "evening",
  "afternoon",
]);

export const unitEnum = pgEnum("unit_enum", [
  "ml",
  "steps",
  "hours",
  "minutes",
  "mood",
]);

export const taskActionEnum = pgEnum("task_action_enum", [
  "pending",
  "dismiss",
  "complete",
]);
