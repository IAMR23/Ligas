import { prisma } from "../../database/prisma.js";
import { listAuditLogs, listErrorLogs, listLoginLogs, listSyncLogs } from "./logs.repository.js";

function buildPage(result, filters) {
  return {
    items: result.items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      pages: Math.ceil(result.total / filters.limit)
    }
  };
}

export async function listAuditLogsService(filters) {
  return buildPage(await listAuditLogs(prisma, filters), filters);
}

export async function listLoginLogsService(filters) {
  return buildPage(await listLoginLogs(prisma, filters), filters);
}

export async function listSyncLogsService(filters) {
  return buildPage(await listSyncLogs(prisma, filters), filters);
}

export async function listErrorLogsService(filters) {
  return buildPage(await listErrorLogs(prisma, filters), filters);
}
