import { processSyncQueue } from "./syncQueue";

let isRegistered = false;

export function registerSyncWorker() {
  if (isRegistered) {
    return;
  }

  isRegistered = true;

  window.addEventListener("online", () => {
    window.dispatchEvent(new CustomEvent("sync:online"));
    processSyncQueue().catch(() => {});
  });

  window.addEventListener("offline", () => {
    window.dispatchEvent(new CustomEvent("sync:offline"));
  });
}
