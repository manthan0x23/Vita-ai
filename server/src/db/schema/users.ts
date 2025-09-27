import { varchar, pgTable, timestamp } from "drizzle-orm/pg-core";
import { NanoId } from "../../utils/func/nano-id";

export const users = pgTable("users", {
  id: varchar("id").unique().primaryKey().notNull().$defaultFn(NanoId),

  name: varchar("name", { length: 256 }),
  email: varchar("email", { length: 256 }).unique().notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
