export function registerSyncWorker() {
  window.addEventListener("online", () => {
    window.dispatchEvent(new CustomEvent("sync:online"));
  });
}
