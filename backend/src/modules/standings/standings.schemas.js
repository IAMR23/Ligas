import { z } from "zod";

export const tournamentStandingsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

export const listStandingsSchema = z.object({
  params: z.object({}).optional(),
  body: z.object({}).optional(),
  query: z.object({
    tournamentId: z.string().uuid()
  })
});
