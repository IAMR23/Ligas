import { z } from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60),
    description: z.string().trim().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
