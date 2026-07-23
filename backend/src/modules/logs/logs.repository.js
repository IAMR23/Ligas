function getPagination({ page = 1, limit = 25 }) {
  return {
    skip: (page - 1) * limit,
    take: limit
  };
}

function getDateWhere(filters) {
  if (!filters.dateFrom && !filters.dateTo) {
    return {};
  }

  return {
    createdAt: {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {})
    }
  };
}

export async function listAuditLogs(client, filters) {
  const where = {
    ...getDateWhere(filters),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.action ? { action: filters.action } : {})
  };

  const [items, total] = await Promise.all([
    client.auditLog.findMany({
      where,
      ...getPagination(filters),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true
          }
        }
      }
    }),
    client.auditLog.count({ where })
  ]);

  return { items, total };
}

export async function listLoginLogs(client, filters) {
  const where = {
    ...getDateWhere(filters),
    ...(filters.userId ? { userId: filters.userId } : {})
  };

  const [items, total] = await Promise.all([
    client.userLoginLog.findMany({
      where,
      ...getPagination(filters),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true
          }
        }
      }
    }),
    client.userLoginLog.count({ where })
  ]);

  return { items, total };
}

export async function listSyncLogs(client, filters) {
  const where = {
    ...getDateWhere(filters),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.status ? { status: filters.status } : {})
  };

  const [items, total] = await Promise.all([
    client.syncLog.findMany({
      where,
      ...getPagination(filters),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true
          }
        },
        conflicts: true
      }
    }),
    client.syncLog.count({ where })
  ]);

  return { items, total };
}

export async function listErrorLogs(client, filters) {
  const auditWhere = {
    ...getDateWhere(filters),
    action: "ERROR",
    ...(filters.userId ? { userId: filters.userId } : {})
  };
  const syncWhere = {
    ...getDateWhere(filters),
    status: "ERROR",
    ...(filters.userId ? { userId: filters.userId } : {})
  };

  const [auditErrors, syncErrors] = await Promise.all([
    client.auditLog.findMany({
      where: auditWhere,
      take: filters.limit,
      orderBy: { createdAt: "desc" }
    }),
    client.syncLog.findMany({
      where: syncWhere,
      take: filters.limit,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const items = [
    ...auditErrors.map((item) => ({ source: "audit_logs", ...item })),
    ...syncErrors.map((item) => ({ source: "sync_logs", ...item }))
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((filters.page - 1) * filters.limit, filters.page * filters.limit);

  return {
    items,
    total: auditErrors.length + syncErrors.length
  };
}
