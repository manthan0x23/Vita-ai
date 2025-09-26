import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { tasks } from "./tasks";
import { taskActionEnum } from "./enums";

export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  taskId: varchar("task_id", { length: 256 })
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),

  ignores: integer("ignores").default(0),
  
  status: taskActionEnum("status").notNull().default("pending"),

  createdAt: timestamp("created_at").defaultNow(),
});
