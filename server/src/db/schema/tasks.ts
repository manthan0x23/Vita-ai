import { boolean, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { NanoId } from "../../utils/func/nano-id";
import { tasksCategoryEnum, tasksTimeGateEnum } from "./enums";
import { integer } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 256 }).primaryKey().unique().notNull(),
  title: varchar("title").notNull(),

  category: tasksCategoryEnum("category").notNull(),

  impactWeight: integer("impact_weight").notNull(),
  effortMin: integer("effort_min").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  timegate: tasksTimeGateEnum("timegate").notNull().default("anytime"),

  reward: integer("reward"),

  isMain: boolean("is_main").default(true),

  alternativeTask: varchar("alternative_task"),
  microTask: varchar("micro_task"),
});
