import { varchar } from "drizzle-orm/pg-core";
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

  timeGate: tasksTimeGateEnum("time_gate").notNull(),

  createdAt: timestamp("created_at").defaultNow(),

  //   self reference - null
  parentId: varchar("parent_id", { length: 256 }),
});
