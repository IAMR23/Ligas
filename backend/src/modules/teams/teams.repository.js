const teamInclude = {
  tournament: true,
  category: true,
  _count: {
    select: {
      players: true,
      homeMatches: true,
      awayMatches: true
    }
  }
};

export function listTeams(client, filters = {}) {
  return client.team.findMany({
    where: {
      isDeleted: false,
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {})
    },
    orderBy: { createdAt: "desc" },
    include: teamInclude
  });
}

export function findTeamById(client, id) {
  return client.team.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: teamInclude
  });
}

export function findTeamByCode(client, code) {
  return client.team.findFirst({
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

export function findCategoryById(client, id) {
  return client.category.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });
}

export function createTeam(client, data) {
  return client.team.create({
    data,
    include: teamInclude
  });
}

export function updateTeam(client, id, data) {
  return client.team.update({
    where: { id },
    data,
    include: teamInclude
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

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}
