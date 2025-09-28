import dotenv from "dotenv";
import { z } from "zod";

// Load .env.test if in test mode
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: envFile });

const envSchema = z.object({
  NODE_ENV: z.string(),
  DATABASE_URL: z.string(),
  PORT: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.message);
  if (process.env.NODE_ENV !== "test") {
    process.exit(1); // only exit in non-test env
  }
}

export const Env = parsedEnv.data!;
