import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres, { Sql } from "postgres";
import dotenv from "dotenv";
import { Env } from "../../config/env";

dotenv.config();

const migrationClient: Sql<any> = postgres(Env.DATABASE_URL, { max: 1 });

export const db = drizzle(postgres(Env.DATABASE_URL));

export async function migrate_test_db() {
  try {
    console.log("DB URL ::::: ", Env.DATABASE_URL);

    await migrate(drizzle(migrationClient), {
      migrationsFolder: "./src/db/migrations",
    });
    await migrationClient.end();
  } catch (error) {
    throw new Error(`Migration failed: ${error}`);
  }
}

export async function close_test_db() {
  const sqlClient = db.$client as Sql<any>;
  await sqlClient.end();
}
