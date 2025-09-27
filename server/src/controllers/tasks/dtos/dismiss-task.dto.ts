import { z } from "zod/v4";

export const updateTaskInput = z.object({
  taskId: z.string().min(1),
  action: z.enum(["completed", "dismiss", "ignore"]),
});
