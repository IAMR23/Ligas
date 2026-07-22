import { z } from "zod";
import { CARD_EVENT_TYPES, GOAL_EVENT_TYPES, MATCH_EVENT_TYPES } from "./match-events.constants.js";

const matchParams = z.object({
  id: z.string().uuid()
});

const baseEventBody = {
  clientEventId: z.string().trim().min(8),
  teamId: z.string().uuid().optional(),
  playerId: z.string().uuid().optional(),
  secondaryPlayerId: z.string().uuid().optional(),
  minute: z.coerce.number().int().min(0).max(140).optional(),
  notes: z.string().trim().optional().nullable(),
  payload: z.record(z.string(), z.unknown()).optional()
};

export const listMatchEventsSchema = z.object({
  params: matchParams,
  query: z.object({
    type: z.enum(MATCH_EVENT_TYPES).optional()
  }),
  body: z.object({}).optional()
});

export const createMatchEventSchema = z.object({
  params: matchParams,
  body: z.object({
    ...baseEventBody,
    type: z.enum(MATCH_EVENT_TYPES)
  }),
  query: z.object({}).optional()
});

export const createGoalEventSchema = z.object({
  params: matchParams,
  body: z.object({
    ...baseEventBody,
    type: z.enum(GOAL_EVENT_TYPES).default("GOL"),
    teamId: z.string().uuid(),
    playerId: z.string().uuid()
  }),
  query: z.object({}).optional()
});

export const createCardEventSchema = z.object({
  params: matchParams,
  body: z.object({
    ...baseEventBody,
    type: z.enum(CARD_EVENT_TYPES),
    teamId: z.string().uuid(),
    playerId: z.string().uuid()
  }),
  query: z.object({}).optional()
});

export const createSubstitutionEventSchema = z.object({
  params: matchParams,
  body: z.object({
    ...baseEventBody,
    type: z.literal("SUSTITUCION").default("SUSTITUCION"),
    teamId: z.string().uuid(),
    playerId: z.string().uuid(),
    secondaryPlayerId: z.string().uuid()
  }),
  query: z.object({}).optional()
});
