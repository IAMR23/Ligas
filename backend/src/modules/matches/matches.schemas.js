import { z } from "zod";
import { MATCH_STATUSES } from "./matches.constants.js";

export const listMatchesSchema = z.object({
  query: z.object({
    tournamentId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    status: z.enum(MATCH_STATUSES).optional()
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

export const createMatchSchema = z.object({
  body: z.object({
    code: z.string().trim().min(2).max(80),
    tournamentId: z.string().uuid(),
    roundId: z.string().uuid().optional().nullable(),
    fieldId: z.string().uuid().optional().nullable(),
    homeTeamId: z.string().uuid(),
    awayTeamId: z.string().uuid(),
    scheduledAt: z.coerce.date().optional().nullable(),
    notes: z.string().trim().optional().nullable()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateMatchSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    code: z.string().trim().min(2).max(80).optional(),
    tournamentId: z.string().uuid().optional(),
    roundId: z.string().uuid().optional().nullable(),
    fieldId: z.string().uuid().optional().nullable(),
    homeTeamId: z.string().uuid().optional(),
    awayTeamId: z.string().uuid().optional(),
    scheduledAt: z.coerce.date().optional().nullable(),
    status: z.enum(MATCH_STATUSES).optional(),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
    notes: z.string().trim().optional().nullable()
  }),
  query: z.object({}).optional()
});

export const matchIdSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

export const startMatchSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    clientEventId: z.string().trim().min(8).optional()
  }),
  query: z.object({}).optional()
});

export const finishMatchSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    clientEventId: z.string().trim().min(8).optional(),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional()
  }),
  query: z.object({}).optional()
});
