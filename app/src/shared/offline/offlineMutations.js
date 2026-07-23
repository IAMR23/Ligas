import { httpClient } from "../api/httpClient";
import { db, nowIso } from "./indexedDb";
import { enqueueSyncItem, SYNC_STATUS } from "./syncQueue";

export function createClientEventId(prefix = "event") {
  if (crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function dispatchQueueChanged() {
  window.dispatchEvent(new CustomEvent("sync:queue-changed"));
}

function isNetworkError(error) {
  return !error.response;
}

async function enqueueOfflineRequest({ endpoint, method = "POST", payload, entityType, entityId, clientEventId }) {
  const queueId = await enqueueSyncItem({
    endpoint,
    method,
    payload,
    entityType,
    entityId,
    clientEventId
  });

  dispatchQueueChanged();
  return queueId;
}

export async function requestOfflineFirst({ endpoint, method = "POST", payload, entityType, entityId, clientEventId }) {
  if (!navigator.onLine) {
    const queueId = await enqueueOfflineRequest({ endpoint, method, payload, entityType, entityId, clientEventId });
    return { queued: true, queueId };
  }

  try {
    const response = await httpClient.request({ url: endpoint, method, data: payload });
    return { queued: false, data: response.data };
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    const queueId = await enqueueOfflineRequest({ endpoint, method, payload, entityType, entityId, clientEventId });
    return { queued: true, queueId };
  }
}

function getEventEndpoint(matchId, type) {
  if (["GOL", "AUTOGOL", "GOL_PENAL"].includes(type)) {
    return `/matches/${matchId}/events/goal`;
  }

  if (["TARJETA_AMARILLA", "TARJETA_ROJA"].includes(type)) {
    return `/matches/${matchId}/events/card`;
  }

  if (type === "SUSTITUCION") {
    return `/matches/${matchId}/events/substitution`;
  }

  return `/matches/${matchId}/events`;
}

export async function saveMatchEventOfflineFirst({ matchId, event }) {
  const createdAt = nowIso();
  const clientEventId = event.clientEventId || createClientEventId(event.type || "MATCH_EVENT");
  const localEvent = {
    ...event,
    id: clientEventId,
    matchId,
    clientEventId,
    syncStatus: navigator.onLine ? SYNC_STATUS.ENVIANDO : SYNC_STATUS.PENDIENTE,
    createdAt,
    updatedAt: createdAt
  };
  const payload = {
    ...event,
    clientEventId
  };

  await db.local_match_events.put(localEvent);

  try {
    const result = await requestOfflineFirst({
      endpoint: getEventEndpoint(matchId, payload.type),
      method: "POST",
      payload,
      entityType: "MATCH_EVENT",
      entityId: localEvent.id,
      clientEventId
    });

    await db.local_match_events.update(localEvent.id, {
      syncStatus: result.queued ? SYNC_STATUS.PENDIENTE : SYNC_STATUS.SINCRONIZADO,
      updatedAt: nowIso()
    });

    dispatchQueueChanged();
    return { ...result, localEvent };
  } catch (error) {
    await db.local_match_events.update(localEvent.id, {
      syncStatus: SYNC_STATUS.ERROR,
      error: error.response?.data?.message || "No se pudo guardar el evento",
      updatedAt: nowIso()
    });
    dispatchQueueChanged();
    throw error;
  }
}

export async function saveVocaliaOfflineFirst({ matchId, vocalia }) {
  const updatedAt = nowIso();
  const localId = vocalia.id || `vocalia-${matchId}`;
  const localVocalia = {
    ...vocalia,
    id: localId,
    matchId,
    syncStatus: navigator.onLine ? SYNC_STATUS.ENVIANDO : SYNC_STATUS.PENDIENTE,
    updatedAt
  };

  await db.local_vocalia.put(localVocalia);

  try {
    const result = await requestOfflineFirst({
      endpoint: `/matches/${matchId}/vocalia`,
      method: "POST",
      payload: vocalia,
      entityType: "VOCALIA",
      entityId: localId
    });

    await db.local_vocalia.update(localId, {
      syncStatus: result.queued ? SYNC_STATUS.PENDIENTE : SYNC_STATUS.SINCRONIZADO,
      updatedAt: nowIso()
    });

    dispatchQueueChanged();
    return { ...result, localVocalia };
  } catch (error) {
    await db.local_vocalia.update(localId, {
      syncStatus: SYNC_STATUS.ERROR,
      error: error.response?.data?.message || "No se pudo guardar la vocalia",
      updatedAt: nowIso()
    });
    dispatchQueueChanged();
    throw error;
  }
}
