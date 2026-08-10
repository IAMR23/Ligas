import { z } from "zod";

const photoUrl = z
  .string()
  .trim()
  .max(2_500_000)
  .refine((value) => value === "" || value.startsWith("data:image/") || /^https?:\/\//.test(value), {
    message: "La foto debe ser una imagen data URL o una URL http(s)"
  })
  .optional()
  .nullable();

const paginationQuery = {
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
};

export const listPlayersSchema = z.object({
  query: z.object({
    teamId: z.string().uuid().optional(),
    q: z.string().trim().optional(),
    ...paginationQuery
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

export const createPlayerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(3),
    documentNumber: z.string().trim().optional().nullable(),
    birthDate: z.coerce.date().optional().nullable(),
    jerseyName: z.string().trim().optional().nullable(),
    photoUrl,
    teamId: z.string().uuid().optional(),
    jerseyNumber: z.coerce.number().int().positive().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updatePlayerSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    fullName: z.string().trim().min(3).optional(),
    documentNumber: z.string().trim().optional().nullable(),
    birthDate: z.coerce.date().optional().nullable(),
    jerseyName: z.string().trim().optional().nullable(),
    photoUrl,
    isActive: z.boolean().optional()
  }),
  query: z.object({}).optional()
});

export const playerIdSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

export const assignPlayerTeamSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    teamId: z.string().uuid(),
    jerseyNumber: z.coerce.number().int().positive().optional()
  }),
  query: z.object({}).optional()
});
