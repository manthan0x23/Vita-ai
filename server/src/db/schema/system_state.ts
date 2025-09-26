import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const systemState = pgTable("system_state", {
  id: serial("id").primaryKey(),
  lastRefresh: timestamp("last_refresh").notNull(),
});
