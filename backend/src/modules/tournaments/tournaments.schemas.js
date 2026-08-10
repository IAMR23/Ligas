import { z } from "zod";
import { TIEBREAKERS, TOURNAMENT_FORMATS, TOURNAMENT_STATUSES } from "./tournaments.constants.js";

const optionalDate = z.coerce.date().optional().nullable();
const paginationQuery = {
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
};
const tournamentRules = {
  format: z.enum(TOURNAMENT_FORMATS).optional(),
  roundTrip: z.boolean().optional(),
  pointsWin: z.coerce.number().int().min(0).max(20).optional(),
  pointsDraw: z.coerce.number().int().min(0).max(20).optional(),
  pointsLoss: z.coerce.number().int().min(0).max(20).optional(),
  tiebreakers: z.array(z.enum(TIEBREAKERS)).min(1).optional()
};

export const listTournamentsSchema = z.object({
  query: z.object({
    status: z.enum(TOURNAMENT_STATUSES).optional(),
    ...paginationQuery
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
    endDate: optionalDate,
    ...tournamentRules
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
    endDate: optionalDate,
    ...tournamentRules
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

export const tournamentFixtureSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    format: z.enum(TOURNAMENT_FORMATS).default("LEAGUE"),
    roundTrip: z.boolean().optional(),
    fieldId: z.string().uuid().optional().nullable()
  }),
  query: z.object({}).optional()
});

export const tournamentFixtureListSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional(),
  query: z.object({
    roundNumber: z.coerce.number().int().positive().optional(),
    status: z.enum(["PROGRAMADO", "EN_JUEGO", "FINALIZADO", "SUSPENDIDO", "CANCELADO", "DEFAULT"]).optional()
  })
});

export const tournamentSanctionsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional(),
  query: z.object({
    status: z.enum(["ACTIVA", "CUMPLIDA", "ANULADA"]).optional()
  })
});
