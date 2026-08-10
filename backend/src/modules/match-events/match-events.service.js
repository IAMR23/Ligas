import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { toAuditJson } from "../../shared/utils/audit.js";
import { CARD_EVENT_TYPES, GOAL_EVENT_TYPES } from "./match-events.constants.js";
import {
  countYellowCards,
  createAuditLog,
  createMatchEvent,
  createSanction,
  findEventByClientEventId,
  findMatchById,
  findPlayerTeam,
  incrementPlayerStatistic,
  incrementTeamStatistic,
  listMatchEvents,
  updateMatchScore,
  upsertPlayerStatistic,
  upsertTeamStatistic
} from "./match-events.repository.js";

function cleanEventPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function assertMatchCanReceiveEvent(match, { allowOnlyInPlay = true } = {}) {
  if (!match) {
    throw new AppError("Partido no encontrado", 404);
  }

  if (match.status === "FINALIZADO") {
    throw new AppError("Partido finalizado", 409, "No se puede registrar evento si el partido esta FINALIZADO");
  }

  if (allowOnlyInPlay && match.status !== "EN_JUEGO") {
    throw new AppError("Partido no esta en juego", 409, "No se puede registrar este evento si el partido no esta EN_JUEGO");
  }
}

async function assertClientEventIdIsUnique(tx, clientEventId) {
  const existingEvent = await findEventByClientEventId(tx, clientEventId);

  if (existingEvent) {
    throw new AppError("Evento duplicado", 409, "El clientEventId ya existe");
  }
}

function assertTeamBelongsToMatch(match, teamId) {
  if (!teamId) {
    return;
  }

  if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
    throw new AppError("Equipo invalido", 400, "El equipo no participa en el partido");
  }
}

async function assertPlayerBelongsToTeam(tx, playerId, teamId) {
  if (!playerId || !teamId) {
    return null;
  }

  const playerTeam = await findPlayerTeam(tx, playerId, teamId);

  if (!playerTeam) {
    throw new AppError("Jugador invalido", 400, "El jugador no pertenece al equipo informado");
  }

  return playerTeam;
}

async function ensurePlayerAndTeamStatistics(tx, match, teamId, playerId) {
  await upsertTeamStatistic(tx, match.tournamentId, teamId);

  if (playerId) {
    await upsertPlayerStatistic(tx, match.tournamentId, playerId, teamId);
  }
}

async function writeEventAudit(tx, event, req, oldValues = null) {
  await createAuditLog(tx, {
    tableName: "match_events",
    recordId: event.id,
    action: "CREATE",
    oldValues: toAuditJson(oldValues),
    newValues: toAuditJson(event),
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    traceId: req.traceId
  });
}

function getGoalScorePatch(match, eventType, scoringTeamId) {
  if (eventType === "AUTOGOL") {
    return scoringTeamId === match.homeTeamId
      ? { homeScore: match.homeScore, awayScore: match.awayScore + 1 }
      : { homeScore: match.homeScore + 1, awayScore: match.awayScore };
  }

  return scoringTeamId === match.homeTeamId
    ? { homeScore: match.homeScore + 1, awayScore: match.awayScore }
    : { homeScore: match.homeScore, awayScore: match.awayScore + 1 };
}

async function createSanctionForCard(tx, { match, event, playerId, teamId, type, reason, games, req }) {
  const sanction = await createSanction(tx, {
    tournamentId: match.tournamentId,
    matchId: match.id,
    matchEventId: event.id,
    playerId,
    teamId,
    type,
    reason,
    games,
    status: "ACTIVA",
    createdBy: req.user.id
  });

  await createAuditLog(tx, {
    tableName: "sanctions",
    recordId: sanction.id,
    action: "CREATE",
    newValues: toAuditJson(sanction),
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    traceId: req.traceId
  });

  return sanction;
}

export async function listMatchEventsService(matchId, filters) {
  const match = await findMatchById(prisma, matchId);

  if (!match) {
    throw new AppError("Partido no encontrado", 404);
  }

  return listMatchEvents(prisma, matchId, filters);
}

export async function createGenericMatchEventService(matchId, payload, req) {
  return prisma.$transaction(async (tx) => {
    const match = await findMatchById(tx, matchId);
    const requiresSpecializedFlow =
      GOAL_EVENT_TYPES.includes(payload.type) || CARD_EVENT_TYPES.includes(payload.type) || payload.type === "SUSTITUCION";

    if (requiresSpecializedFlow) {
      throw new AppError("Endpoint incorrecto", 400, "Use /goal, /card o /substitution para este tipo de evento");
    }

    const allowOnlyInPlay = !["OBSERVACION_ARBITRO", "OBSERVACION_VOCAL", "FIRMA_DELEGADO", "FIRMA_ARBITRO", "FIRMA_VOCAL"].includes(
      payload.type
    );

    assertMatchCanReceiveEvent(match, { allowOnlyInPlay });
    await assertClientEventIdIsUnique(tx, payload.clientEventId);
    assertTeamBelongsToMatch(match, payload.teamId);

    if (payload.playerId) {
      await assertPlayerBelongsToTeam(tx, payload.playerId, payload.teamId);
    }

    if (payload.secondaryPlayerId) {
      await assertPlayerBelongsToTeam(tx, payload.secondaryPlayerId, payload.teamId);
    }

    const event = await createMatchEvent(tx, {
      ...cleanEventPayload(payload),
      matchId,
      createdBy: req.user.id
    });

    await writeEventAudit(tx, event, req);

    return event;
  });
}

export async function createGoalEventService(matchId, payload, req) {
  return prisma.$transaction(async (tx) => {
    const match = await findMatchById(tx, matchId);

    assertMatchCanReceiveEvent(match);
    await assertClientEventIdIsUnique(tx, payload.clientEventId);
    assertTeamBelongsToMatch(match, payload.teamId);
    await assertPlayerBelongsToTeam(tx, payload.playerId, payload.teamId);

    if (!GOAL_EVENT_TYPES.includes(payload.type)) {
      throw new AppError("Tipo de gol invalido", 400);
    }

    await ensurePlayerAndTeamStatistics(tx, match, payload.teamId, payload.playerId);

    const event = await createMatchEvent(tx, {
      ...cleanEventPayload(payload),
      matchId,
      createdBy: req.user.id
    });

    const scorePatch = getGoalScorePatch(match, payload.type, payload.teamId);

    await updateMatchScore(tx, matchId, {
      ...scorePatch,
      updatedBy: req.user.id
    });

    await incrementPlayerStatistic(tx, match.tournamentId, payload.playerId, {
      ...(payload.type === "AUTOGOL" ? { ownGoals: { increment: 1 } } : { goals: { increment: 1 } })
    });

    await writeEventAudit(tx, event, req);

    return {
      event,
      score: scorePatch
    };
  });
}

export async function createCardEventService(matchId, payload, req) {
  return prisma.$transaction(async (tx) => {
    const match = await findMatchById(tx, matchId);

    assertMatchCanReceiveEvent(match);
    await assertClientEventIdIsUnique(tx, payload.clientEventId);
    assertTeamBelongsToMatch(match, payload.teamId);
    await assertPlayerBelongsToTeam(tx, payload.playerId, payload.teamId);
    await ensurePlayerAndTeamStatistics(tx, match, payload.teamId, payload.playerId);

    const event = await createMatchEvent(tx, {
      ...cleanEventPayload(payload),
      matchId,
      createdBy: req.user.id
    });

    if (payload.type === "TARJETA_AMARILLA") {
      await incrementPlayerStatistic(tx, match.tournamentId, payload.playerId, {
        yellowCards: { increment: 1 }
      });
      await incrementTeamStatistic(tx, match.tournamentId, payload.teamId, {
        yellowCards: { increment: 1 }
      });

      const yellowCards = await countYellowCards(tx, matchId, payload.playerId);

      if (yellowCards >= 2) {
        await incrementPlayerStatistic(tx, match.tournamentId, payload.playerId, {
          redCards: { increment: 1 }
        });
        await incrementTeamStatistic(tx, match.tournamentId, payload.teamId, {
          redCards: { increment: 1 }
        });
        await createSanctionForCard(tx, {
          match,
          event,
          playerId: payload.playerId,
          teamId: payload.teamId,
          type: "ROJA_INDIRECTA",
          reason: "Doble tarjeta amarilla",
          games: 1,
          req
        });
      }
    }

    if (payload.type === "TARJETA_ROJA") {
      await incrementPlayerStatistic(tx, match.tournamentId, payload.playerId, {
        redCards: { increment: 1 }
      });
      await incrementTeamStatistic(tx, match.tournamentId, payload.teamId, {
        redCards: { increment: 1 }
      });
      await createSanctionForCard(tx, {
        match,
        event,
        playerId: payload.playerId,
        teamId: payload.teamId,
        type: "ROJA_DIRECTA",
        reason: payload.notes || "Tarjeta roja directa",
        games: 1,
        req
      });
    }

    await writeEventAudit(tx, event, req);

    return event;
  });
}

export async function createSubstitutionEventService(matchId, payload, req) {
  return prisma.$transaction(async (tx) => {
    const match = await findMatchById(tx, matchId);

    assertMatchCanReceiveEvent(match);
    await assertClientEventIdIsUnique(tx, payload.clientEventId);
    assertTeamBelongsToMatch(match, payload.teamId);
    await assertPlayerBelongsToTeam(tx, payload.playerId, payload.teamId);
    await assertPlayerBelongsToTeam(tx, payload.secondaryPlayerId, payload.teamId);

    if (payload.playerId === payload.secondaryPlayerId) {
      throw new AppError("Sustitucion invalida", 400, "El jugador saliente y entrante deben ser diferentes");
    }

    const event = await createMatchEvent(tx, {
      ...cleanEventPayload(payload),
      matchId,
      createdBy: req.user.id
    });

    await writeEventAudit(tx, event, req);

    return event;
  });
}
