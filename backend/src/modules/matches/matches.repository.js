const matchInclude = {
  tournament: true,
  round: true,
  field: true,
  homeTeam: true,
  awayTeam: true,
  referees: {
    include: {
      referee: true
    }
  },
  vocals: {
    include: {
      vocal: true
    }
  },
  _count: {
    select: {
      events: true
    }
  }
};

export function listMatches(client, filters = {}) {
  return client.match.findMany({
    where: {
      isDeleted: false,
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.teamId
        ? {
            OR: [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }]
          }
        : {})
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    include: matchInclude
  });
}

export function findMatchById(client, id) {
  return client.match.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: matchInclude
  });
}

export function findMatchByCode(client, code) {
  return client.match.findFirst({
    where: {
      code,
      isDeleted: false
    }
  });
}

export function findTournamentById(client, id) {
  return client.tournament.findFirst({
    where: {
      id,
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

export function findRoundById(client, id) {
  return client.round.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });
}

export function findFieldById(client, id) {
  return client.field.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });
}

export function createMatch(client, data) {
  return client.match.create({
    data,
    include: matchInclude
  });
}

export function updateMatch(client, id, data) {
  return client.match.update({
    where: { id },
    data,
    include: matchInclude
  });
}

export function createMatchEvent(client, data) {
  return client.matchEvent.create({ data });
}

export function findMatchEventByClientId(client, clientEventId) {
  return client.matchEvent.findUnique({
    where: { clientEventId }
  });
}

export function upsertStanding(client, tournamentId, teamId) {
  return client.standing.upsert({
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

export function incrementStanding(client, tournamentId, teamId, data) {
  return client.standing.update({
    where: {
      tournamentId_teamId: {
        tournamentId,
        teamId
      }
    },
    data: {
      played: { increment: 1 },
      won: { increment: data.won },
      drawn: { increment: data.drawn },
      lost: { increment: data.lost },
      goalsFor: { increment: data.goalsFor },
      goalsAgainst: { increment: data.goalsAgainst },
      goalDiff: { increment: data.goalsFor - data.goalsAgainst },
      points: { increment: data.points }
    }
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
    data: {
      matchesPlayed: { increment: 1 },
      goalsFor: { increment: data.goalsFor },
      goalsAgainst: { increment: data.goalsAgainst },
      cleanSheets: { increment: data.goalsAgainst === 0 ? 1 : 0 }
    }
  });
}

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}
