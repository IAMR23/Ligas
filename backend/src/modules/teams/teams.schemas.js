import { z } from "zod";

export const listTeamsSchema = z.object({
  query: z.object({
    tournamentId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional()
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

export const createTeamSchema = z.object({
  body: z.object({
    tournamentId: z.string().uuid(),
    categoryId: z.string().uuid().optional().nullable(),
    code: z.string().trim().min(2).max(60),
    name: z.string().trim().min(2),
    colorPrimary: z.string().trim().optional().nullable(),
    colorAccent: z.string().trim().optional().nullable()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateTeamSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    tournamentId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional().nullable(),
    code: z.string().trim().min(2).max(60).optional(),
    name: z.string().trim().min(2).optional(),
    colorPrimary: z.string().trim().optional().nullable(),
    colorAccent: z.string().trim().optional().nullable()
  }),
  query: z.object({}).optional()
});

export const teamIdSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});
