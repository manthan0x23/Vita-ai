import { z } from "zod/v4";

export const userMetricsInput = z.object({
  page: z
    .string()
    .transform((v) => Number(v) || 1)
    .default(1),
  perPage: z
    .string()
    .transform((v) => Number(v) || 4)
    .default(5),
});
