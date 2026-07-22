import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(3),
    username: z.string().trim().min(3).max(40),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(8),
    roles: z.array(z.string().trim().min(2)).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});
