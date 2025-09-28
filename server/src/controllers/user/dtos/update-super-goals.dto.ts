import { z } from "zod/v4";

export const updateSuperGoals = z.object({
  hydration: z.number().nullable().optional(),
  movement: z.number().nullable().optional(),
  sleep: z.number().nullable().optional(),
  screen: z.number().nullable().optional(),
  mood: z.number().min(1).max(5).nullable().optional(),
});
