import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { tasksCategoryEnum, unitEnum } from "./enums";

export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  goalType: tasksCategoryEnum("goal_type").notNull(),
  targetValue: integer("target_value").notNull(),
  unit: unitEnum("unit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
