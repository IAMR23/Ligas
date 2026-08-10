import { buildPaginationMeta, normalizePagination } from "../../shared/utils/pagination.js";

export function listTournaments(client, filters = {}) {
  const pagination = normalizePagination(filters);
  const where = {
    isDeleted: false,
    ...(filters.status ? { status: filters.status } : {})
  };

  return Promise.all([
    client.tournament.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            teams: true,
            matches: true
          }
        }
      }
    }),
    client.tournament.count({ where })
  ]).then(([items, total]) => ({
    items,
    pagination: buildPaginationMeta(total, pagination)
  }));
}

export function findTournamentById(client, id) {
  return client.tournament.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
      categories: {
        where: {
          isDeleted: false
        },
        orderBy: { name: "asc" }
      },
      _count: {
        select: {
          teams: true,
          matches: true
        }
      }
    }
  });
}

export function findTournamentByCode(client, code) {
  return client.tournament.findFirst({
    where: {
      code,
      isDeleted: false
    }
  });
}

export function createTournament(client, data) {
  return client.tournament.create({ data });
}

export function updateTournament(client, id, data) {
  return client.tournament.update({
    where: { id },
    data
  });
}

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}

export function countTournamentMatches(client, tournamentId) {
  return client.match.count({
    where: {
      tournamentId,
      isDeleted: false
    }
  });
}

export function countTournamentMatchesByStatus(client, tournamentId, status) {
  return client.match.count({
    where: {
      tournamentId,
      status,
      isDeleted: false
    }
  });
}

export function listTournamentTeams(client, tournamentId) {
  return client.team.findMany({
    where: {
      tournamentId,
      isDeleted: false
    },
    orderBy: [{ name: "asc" }],
    include: {
      _count: {
        select: {
          players: true,
          homeMatches: true,
          awayMatches: true
        }
      }
    }
  });
}

export function listNextMatches(client, tournamentId, limit = 5) {
  return client.match.findMany({
    where: {
      tournamentId,
      isDeleted: false,
      status: {
        in: ["PROGRAMADO", "EN_JUEGO"]
      }
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
    take: limit,
    include: {
      round: true,
      field: true,
      homeTeam: true,
      awayTeam: true
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

export function upsertRound(client, data) {
  return client.round.upsert({
    where: {
      tournamentId_number: {
        tournamentId: data.tournamentId,
        number: data.number
      }
    },
    update: {
      name: data.name,
      updatedBy: data.updatedBy
    },
    create: data
  });
}

export function createMatch(client, data) {
  return client.match.create({ data });
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

export function listFixtureRounds(client, tournamentId, filters = {}) {
  return client.round.findMany({
    where: {
      tournamentId,
      isDeleted: false,
      ...(filters.roundNumber ? { number: filters.roundNumber } : {}),
      matches: filters.status
        ? {
            some: {
              status: filters.status,
              isDeleted: false
            }
          }
        : undefined
    },
    orderBy: { number: "asc" },
    include: {
      matches: {
        where: {
          isDeleted: false,
          ...(filters.status ? { status: filters.status } : {})
        },
        orderBy: [{ scheduledAt: "asc" }, { code: "asc" }],
        include: {
          field: true,
          homeTeam: true,
          awayTeam: true,
          _count: {
            select: {
              events: true
            }
          }
        }
      }
    }
  });
}

export function listStandings(client, tournamentId) {
  return client.standing.findMany({
    where: {
      tournamentId
    },
    include: {
      team: true
    }
  });
}

export function listScorers(client, tournamentId) {
  return client.playerStatistic.findMany({
    where: {
      tournamentId,
      goals: {
        gt: 0
      }
    },
    orderBy: [{ goals: "desc" }, { assists: "desc" }],
    include: {
      player: true,
      team: true
    }
  });
}

export function listDiscipline(client, tournamentId) {
  return client.playerStatistic.findMany({
    where: {
      tournamentId,
      OR: [{ yellowCards: { gt: 0 } }, { redCards: { gt: 0 } }]
    },
    orderBy: [{ redCards: "desc" }, { yellowCards: "desc" }],
    include: {
      player: true,
      team: true
    }
  });
}

export function listSanctions(client, tournamentId, filters = {}) {
  return client.sanction.findMany({
    where: {
      tournamentId,
      isDeleted: false,
      ...(filters.status ? { status: filters.status } : {})
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      player: true,
      team: true,
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
          round: true
        }
      },
      matchEvent: true
    }
  });
}

export function listRecentResults(client, tournamentId, limit = 5) {
  return client.match.findMany({
    where: {
      tournamentId,
      status: "FINALIZADO",
      isDeleted: false
    },
    orderBy: [{ finishedAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: {
      round: true,
      field: true,
      homeTeam: true,
      awayTeam: true
    }
  });
}
