import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";
import { Env } from "../config/env";

dotenv.config();

const dbClient = postgres(Env.DATABASE_URL as string, {
  max: 100,
  idle_timeout: 60,
  max_lifetime: 60 * 15,
});

const db = drizzle(dbClient, { schema });

export { db };
