export function listReports(client, filters = {}) {
  return client.report.findMany({
    where: {
      isDeleted: false,
      ...(filters.active === undefined ? {} : { isActive: filters.active })
    },
    orderBy: { name: "asc" },
    include: {
      tournament: true
    }
  });
}

export function findReportByCode(client, code) {
  return client.report.findFirst({
    where: {
      code,
      isDeleted: false,
      isActive: true
    }
  });
}

export function createReportExecution(client, data) {
  return client.reportExecution.create({ data });
}

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}

export function getMatchesReport(client, filters) {
  return client.match.findMany({
    where: {
      isDeleted: false,
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
      ...(filters.teamId ? { OR: [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }] } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            scheduledAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
          }
        : {})
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    include: {
      tournament: true,
      homeTeam: true,
      awayTeam: true,
      field: true
    }
  });
}

export function getPlayerStatisticsReport(client, filters) {
  return client.playerStatistic.findMany({
    where: {
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
      ...(filters.teamId ? { teamId: filters.teamId } : {}),
      ...(filters.playerId ? { playerId: filters.playerId } : {})
    },
    orderBy: [{ goals: "desc" }, { yellowCards: "desc" }],
    include: {
      tournament: true,
      team: true,
      player: true
    }
  });
}

export function getTeamStatisticsReport(client, filters) {
  return client.teamStatistic.findMany({
    where: {
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
      ...(filters.teamId ? { teamId: filters.teamId } : {})
    },
    orderBy: [{ goalsFor: "desc" }, { goalsAgainst: "asc" }],
    include: {
      tournament: true,
      team: true
    }
  });
}

export function getSanctionsReport(client, filters) {
  return client.sanction.findMany({
    where: {
      isDeleted: false,
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
      ...(filters.teamId ? { teamId: filters.teamId } : {}),
      ...(filters.playerId ? { playerId: filters.playerId } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      tournament: true,
      match: true,
      player: true,
      team: true
    }
  });
}

export function getStandingsReport(client, filters) {
  return client.standing.findMany({
    where: {
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
      ...(filters.teamId ? { teamId: filters.teamId } : {})
    },
    orderBy: [{ points: "desc" }, { goalDiff: "desc" }, { goalsFor: "desc" }],
    include: {
      tournament: true,
      team: true
    }
  });
}

export function getVocaliasReport(client, filters) {
  return client.vocalia.findMany({
    where: {
      isDeleted: false,
      match: {
        ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
        ...(filters.teamId ? { OR: [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }] } : {})
      },
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      match: {
        include: {
          tournament: true,
          homeTeam: true,
          awayTeam: true
        }
      }
    }
  });
}

export function getRefereeingReport(client, filters) {
  return client.matchReferee.findMany({
    where: {
      match: {
        isDeleted: false,
        ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
        ...(filters.teamId ? { OR: [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }] } : {})
      },
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      referee: true,
      match: {
        include: {
          tournament: true,
          homeTeam: true,
          awayTeam: true
        }
      }
    }
  });
}

export function getLoginLogsReport(client, filters) {
  return client.userLoginLog.findMany({
    where: {
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    take: 500
  });
}

export function getAuditLogsReport(client, filters) {
  return client.auditLog.findMany({
    where: {
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    take: 500
  });
}
