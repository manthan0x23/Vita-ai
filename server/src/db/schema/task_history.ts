import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { tasks } from "./tasks";
import { taskActionEnum } from "./enums";

export const taskHistory = pgTable("task_history", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id", { length: 50 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  taskId: varchar("task_id", { length: 50 })
    .notNull()
    .references(() => tasks.id),

  action: taskActionEnum("action").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
