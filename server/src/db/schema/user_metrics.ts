import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { unitEnum } from "./enums";

export const userMetrics = pgTable("user_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  goalType: varchar("goal_type", { length: 50 }).notNull(),
  value: integer("value").notNull(),
  unit: unitEnum("unit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
