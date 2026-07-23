import { z } from "zod";

export const logsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    userId: z.string().uuid().optional(),
    action: z.string().trim().optional(),
    status: z.string().trim().optional()
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});
