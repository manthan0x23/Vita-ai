import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { NanoId } from "../../utils/func/nano-id";
import { DefaultSuperGoals } from "../../engine/types";

export const userSuperGoals = pgTable("user_super_goals", {
  id: varchar("id").primaryKey().notNull().$defaultFn(NanoId),

  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  hydration: integer("hydration")
    .default(DefaultSuperGoals.hydration)
    .notNull(),
  movement: integer("movement").default(DefaultSuperGoals.movement).notNull(),
  sleep: integer("sleep").default(DefaultSuperGoals.sleep).notNull(),
  screen: integer("screen").default(DefaultSuperGoals.screen).notNull(),
  mood: integer("mood").default(DefaultSuperGoals.mood).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
