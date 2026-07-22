export function listTournaments(client, filters = {}) {
  return client.tournament.findMany({
    where: {
      isDeleted: false,
      ...(filters.status ? { status: filters.status } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          teams: true,
          matches: true
        }
      }
    }
  });
}

export function findTournamentById(client, id) {
  return client.tournament.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
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
