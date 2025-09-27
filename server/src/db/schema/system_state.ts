import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const systemState = pgTable("system_state", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  lastRefresh: timestamp("last_refresh").notNull(),
});
