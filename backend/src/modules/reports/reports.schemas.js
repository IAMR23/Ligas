import { z } from "zod";

const reportFilters = z.object({
  tournamentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  playerId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
});

export const listReportsSchema = z.object({
  query: z.object({
    active: z.coerce.boolean().optional()
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

export const exportReportSchema = z.object({
  params: z.object({
    code: z.string().trim().min(2)
  }),
  query: reportFilters,
  body: z.object({}).optional()
});
