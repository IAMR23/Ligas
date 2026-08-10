import { buildPaginationMeta, normalizePagination } from "../../shared/utils/pagination.js";

const playerInclude = {
  teams: {
    where: {
      isDeleted: false,
      isActive: true
    },
    include: {
      team: {
        include: {
          tournament: true
        }
      }
    }
  }
};

export function listPlayers(client, filters = {}) {
  const pagination = normalizePagination(filters);
  const where = {
    isDeleted: false,
    ...(filters.q
      ? {
          fullName: {
            contains: filters.q,
            mode: "insensitive"
          }
        }
      : {}),
    ...(filters.teamId
      ? {
          teams: {
            some: {
              teamId: filters.teamId,
              isActive: true,
              isDeleted: false
            }
          }
        }
      : {})
  };

  return Promise.all([
    client.player.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
      include: playerInclude
    }),
    client.player.count({ where })
  ]).then(([items, total]) => ({
    items,
    pagination: buildPaginationMeta(total, pagination)
  }));
}

export function findPlayerById(client, id) {
  return client.player.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: playerInclude
  });
}

export function findPlayerByDocumentNumber(client, documentNumber) {
  return client.player.findFirst({
    where: {
      documentNumber,
      isDeleted: false
    }
  });
}

export function findTeamById(client, id) {
  return client.team.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });
}

export function createPlayer(client, data) {
  return client.player.create({
    data,
    include: playerInclude
  });
}

export function updatePlayer(client, id, data) {
  return client.player.update({
    where: { id },
    data,
    include: playerInclude
  });
}

export function upsertPlayerTeam(client, { playerId, teamId, jerseyNumber, userId }) {
  return client.playerTeam.upsert({
    where: {
      playerId_teamId: {
        playerId,
        teamId
      }
    },
    update: {
      jerseyNumber,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      updatedBy: userId
    },
    create: {
      playerId,
      teamId,
      jerseyNumber,
      createdBy: userId
    }
  });
}

export function upsertPlayerStatistic(client, { tournamentId, playerId, teamId }) {
  return client.playerStatistic.upsert({
    where: {
      tournamentId_playerId: {
        tournamentId,
        playerId
      }
    },
    update: {
      teamId
    },
    create: {
      tournamentId,
      playerId,
      teamId
    }
  });
}

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}
