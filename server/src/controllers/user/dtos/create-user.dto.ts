import { z } from "zod/v4";

export const loginUserInput = z.object({
  name: z.string().nullable().optional(),
  email: z.email().min(1),
});

export type loginUserInput = z.infer<typeof loginUserInput>;
