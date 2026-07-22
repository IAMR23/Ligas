import { z } from "zod";
import { TOURNAMENT_STATUSES } from "./tournaments.constants.js";

const optionalDate = z.coerce.date().optional().nullable();

export const listTournamentsSchema = z.object({
  query: z.object({
    status: z.enum(TOURNAMENT_STATUSES).optional()
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

export const createTournamentSchema = z.object({
  body: z.object({
    code: z.string().trim().min(2).max(60),
    name: z.string().trim().min(3),
    description: z.string().trim().optional().nullable(),
    status: z.enum(TOURNAMENT_STATUSES).optional(),
    startDate: optionalDate,
    endDate: optionalDate
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateTournamentSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    code: z.string().trim().min(2).max(60).optional(),
    name: z.string().trim().min(3).optional(),
    description: z.string().trim().optional().nullable(),
    status: z.enum(TOURNAMENT_STATUSES).optional(),
    startDate: optionalDate,
    endDate: optionalDate
  }),
  query: z.object({}).optional()
});

export const tournamentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});
