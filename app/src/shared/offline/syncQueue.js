import { httpClient } from "../api/httpClient";
import { db, nowIso } from "./indexedDb";

export const SYNC_STATUS = {
  PENDIENTE: "PENDIENTE",
  ENVIANDO: "ENVIANDO",
  SINCRONIZADO: "SINCRONIZADO",
  ERROR: "ERROR",
  CONFLICTO: "CONFLICTO"
};

export async function enqueueSyncItem({ endpoint, method = "POST", payload, entityType, entityId, clientEventId }) {
  const createdAt = nowIso();

  return db.sync_queue.add({
    endpoint,
    method,
    payload,
    entityType,
    entityId,
    clientEventId,
    status: SYNC_STATUS.PENDIENTE,
    attempts: 0,
    error: null,
    response: null,
    createdAt,
    lastAttemptAt: null
  });
}

export function listSyncQueue() {
  return db.sync_queue.orderBy("createdAt").reverse().toArray();
}

export async function getQueueSummary() {
  const items = await db.sync_queue.toArray();

  return items.reduce(
    (summary, item) => ({
      ...summary,
      total: summary.total + 1,
      [item.status]: (summary[item.status] || 0) + 1
    }),
    {
      total: 0,
      PENDIENTE: 0,
      ENVIANDO: 0,
      SINCRONIZADO: 0,
      ERROR: 0,
      CONFLICTO: 0
    }
  );
}

export function clearSyncedItems() {
  return db.sync_queue.where("status").equals(SYNC_STATUS.SINCRONIZADO).delete();
}

async function markLocalEntitySynced(item, status) {
  if (item.entityType === "MATCH_EVENT" && item.entityId) {
    await db.local_match_events.update(item.entityId, {
      syncStatus: status,
      updatedAt: nowIso()
    });
  }

  if (item.entityType === "VOCALIA" && item.entityId) {
    await db.local_vocalia.update(item.entityId, {
      syncStatus: status,
      updatedAt: nowIso()
    });
  }
}

async function sendQueueItem(item) {
  await db.sync_queue.update(item.id, {
    status: SYNC_STATUS.ENVIANDO,
    attempts: item.attempts + 1,
    lastAttemptAt: nowIso(),
    error: null
  });

  try {
    const response = await httpClient.request({
      url: item.endpoint,
      method: item.method,
      data: item.payload
    });

    await db.sync_queue.update(item.id, {
      status: SYNC_STATUS.SINCRONIZADO,
      response: response.data,
      error: null,
      lastAttemptAt: nowIso()
    });
    await markLocalEntitySynced(item, SYNC_STATUS.SINCRONIZADO);

    return { itemId: item.id, status: SYNC_STATUS.SINCRONIZADO };
  } catch (error) {
    const statusCode = error.response?.status;
    const isConflict = statusCode === 409;
    const requiresLogin = statusCode === 401;
    const nextStatus = isConflict ? SYNC_STATUS.CONFLICTO : requiresLogin ? SYNC_STATUS.PENDIENTE : SYNC_STATUS.ERROR;
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      (requiresLogin ? "Requiere iniciar sesion para sincronizar" : "No se pudo sincronizar");

    await db.sync_queue.update(item.id, {
      status: nextStatus,
      error: errorMessage,
      lastAttemptAt: nowIso()
    });
    await markLocalEntitySynced(item, nextStatus);

    if (requiresLogin) {
      throw error;
    }

    return { itemId: item.id, status: nextStatus, error: errorMessage };
  }
}

export async function processSyncQueue({ maxAttempts = 5 } = {}) {
  if (!navigator.onLine) {
    return { processed: 0, results: [], offline: true };
  }

  const pendingItems = await db.sync_queue
    .where("status")
    .anyOf([SYNC_STATUS.PENDIENTE, SYNC_STATUS.ERROR])
    .filter((item) => item.attempts < maxAttempts)
    .sortBy("createdAt");

  const results = [];

  for (const item of pendingItems) {
    const result = await sendQueueItem(item);
    results.push(result);

    if (result.status === SYNC_STATUS.PENDIENTE) {
      break;
    }
  }

  return { processed: results.length, results, offline: false };
}
