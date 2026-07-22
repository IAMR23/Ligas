const matchEventInclude = {
  team: true,
  player: true,
  secondaryPlayer: true,
  sanction: true
};

export function listMatchEvents(client, matchId, filters = {}) {
  return client.matchEvent.findMany({
    where: {
      matchId,
      isDeleted: false,
      ...(filters.type ? { type: filters.type } : {})
    },
    orderBy: [{ minute: "asc" }, { createdAt: "asc" }],
    include: matchEventInclude
  });
}

export function findMatchById(client, id) {
  return client.match.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
      homeTeam: true,
      awayTeam: true
    }
  });
}

export function findEventByClientEventId(client, clientEventId) {
  return client.matchEvent.findUnique({
    where: { clientEventId }
  });
}

export function findPlayerTeam(client, playerId, teamId) {
  return client.playerTeam.findFirst({
    where: {
      playerId,
      teamId,
      isActive: true,
      isDeleted: false
    },
    include: {
      player: true,
      team: true
    }
  });
}

export function createMatchEvent(client, data) {
  return client.matchEvent.create({
    data,
    include: matchEventInclude
  });
}

export function updateMatchScore(client, id, data) {
  return client.match.update({
    where: { id },
    data
  });
}

export function upsertPlayerStatistic(client, tournamentId, playerId, teamId) {
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

export function incrementPlayerStatistic(client, tournamentId, playerId, data) {
  return client.playerStatistic.update({
    where: {
      tournamentId_playerId: {
        tournamentId,
        playerId
      }
    },
    data
  });
}

export function upsertTeamStatistic(client, tournamentId, teamId) {
  return client.teamStatistic.upsert({
    where: {
      tournamentId_teamId: {
        tournamentId,
        teamId
      }
    },
    update: {},
    create: {
      tournamentId,
      teamId
    }
  });
}

export function incrementTeamStatistic(client, tournamentId, teamId, data) {
  return client.teamStatistic.update({
    where: {
      tournamentId_teamId: {
        tournamentId,
        teamId
      }
    },
    data
  });
}

export function countYellowCards(client, matchId, playerId) {
  return client.matchEvent.count({
    where: {
      matchId,
      playerId,
      type: "TARJETA_AMARILLA",
      isVoided: false,
      isDeleted: false
    }
  });
}

export function createSanction(client, data) {
  return client.sanction.create({ data });
}

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}
