import { db } from "./indexedDb";

export async function enqueueSyncItem({ endpoint, method, payload }) {
  return db.sync_queue.add({
    endpoint,
    method,
    payload,
    status: "PENDIENTE",
    attempts: 0,
    error: null,
    createdAt: new Date().toISOString(),
    lastAttemptAt: null
  });
}
