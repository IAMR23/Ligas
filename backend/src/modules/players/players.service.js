import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { toAuditJson } from "../../shared/utils/audit.js";
import {
  createAuditLog,
  createPlayer,
  findPlayerByDocumentNumber,
  findPlayerById,
  findTeamById,
  listPlayers,
  updatePlayer,
  upsertPlayerStatistic,
  upsertPlayerTeam
} from "./players.repository.js";

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

async function assertUniqueDocument(tx, documentNumber, currentPlayerId = null) {
  if (!documentNumber) {
    return;
  }

  const owner = await findPlayerByDocumentNumber(tx, documentNumber);

  if (owner && owner.id !== currentPlayerId) {
    throw new AppError("Documento ya registrado", 409);
  }
}

export async function listPlayersService(filters) {
  return listPlayers(prisma, filters);
}

export async function getPlayerService(id) {
  const player = await findPlayerById(prisma, id);

  if (!player) {
    throw new AppError("Jugador no encontrado", 404);
  }

  return player;
}

export async function createPlayerService(payload, req) {
  return prisma.$transaction(async (tx) => {
    await assertUniqueDocument(tx, payload.documentNumber);

    const { teamId, jerseyNumber, ...playerData } = payload;
    const player = await createPlayer(tx, {
      ...playerData,
      createdBy: req.user.id
    });

    if (teamId) {
      await assignPlayerToTeam(tx, player.id, { teamId, jerseyNumber }, req);
    }

    const created = await findPlayerById(tx, player.id);

    await createAuditLog(tx, {
      tableName: "players",
      recordId: player.id,
      action: "CREATE",
      newValues: toAuditJson(created),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return created;
  });
}

export async function updatePlayerService(id, payload, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findPlayerById(tx, id);

    if (!current) {
      throw new AppError("Jugador no encontrado", 404);
    }

    await assertUniqueDocument(tx, payload.documentNumber, id);

    const player = await updatePlayer(tx, id, {
      ...cleanPayload(payload),
      updatedBy: req.user.id
    });

    await createAuditLog(tx, {
      tableName: "players",
      recordId: player.id,
      action: "UPDATE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(player),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return player;
  });
}

export async function deletePlayerService(id, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findPlayerById(tx, id);

    if (!current) {
      throw new AppError("Jugador no encontrado", 404);
    }

    const player = await updatePlayer(tx, id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id
    });

    await createAuditLog(tx, {
      tableName: "players",
      recordId: player.id,
      action: "DELETE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(player),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return player;
  });
}

async function assignPlayerToTeam(tx, playerId, payload, req) {
  const team = await findTeamById(tx, payload.teamId);

  if (!team) {
    throw new AppError("Equipo no encontrado", 404);
  }

  await upsertPlayerTeam(tx, {
    playerId,
    teamId: team.id,
    jerseyNumber: payload.jerseyNumber,
    userId: req.user.id
  });

  await upsertPlayerStatistic(tx, {
    tournamentId: team.tournamentId,
    playerId,
    teamId: team.id
  });

  return team;
}

export async function assignPlayerTeamService(playerId, payload, req) {
  return prisma.$transaction(async (tx) => {
    const player = await findPlayerById(tx, playerId);

    if (!player) {
      throw new AppError("Jugador no encontrado", 404);
    }

    const team = await assignPlayerToTeam(tx, playerId, payload, req);
    const updated = await findPlayerById(tx, playerId);

    await createAuditLog(tx, {
      tableName: "player_teams",
      recordId: playerId,
      action: "CREATE",
      newValues: { playerId, teamId: team.id, jerseyNumber: payload.jerseyNumber },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return updated;
  });
}
