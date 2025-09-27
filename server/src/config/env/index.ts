import { z } from "zod/v4";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("5000"),
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(["production", "development"]).default("development")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.message);
    process.exit(1);
}

export const Env = parsedEnv.data;
