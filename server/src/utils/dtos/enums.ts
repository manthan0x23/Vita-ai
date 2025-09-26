import z from "zod/v4";

export const tasksCategoryEnumSchema = z.enum([
  "hydration",
  "movement",
  "sleep",
  "screen",
  "mood",
]);
export type TasksCategoryEnum = z.infer<typeof tasksCategoryEnumSchema>;

export const tasksTimeGateEnumSchema = z.enum([
  "morning",
  "evening",
  "afternoon",
]);
export type TasksTimeGateEnum = z.infer<typeof tasksTimeGateEnumSchema>;

export const unitEnumSchema = z.enum([
  "ml",
  "steps",
  "hours",
  "minutes",
  "mood",
]);
export type UnitEnum = z.infer<typeof unitEnumSchema>;

export const taskActionEnumSchema = z.enum(["pending", "dismiss", "complete"]);
export type TaskActionEnum = z.infer<typeof taskActionEnumSchema>;
