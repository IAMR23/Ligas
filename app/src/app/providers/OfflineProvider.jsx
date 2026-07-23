import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { registerSyncWorker } from "../../shared/offline/syncWorker";
import { getQueueSummary, processSyncQueue } from "../../shared/offline/syncQueue";

const OfflineContext = createContext(null);

const emptySummary = {
  total: 0,
  PENDIENTE: 0,
  ENVIANDO: 0,
  SINCRONIZADO: 0,
  ERROR: 0,
  CONFLICTO: 0
};

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [summary, setSummary] = useState(emptySummary);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const refreshSummary = useCallback(async () => {
    const nextSummary = await getQueueSummary();
    setSummary(nextSummary);
    return nextSummary;
  }, []);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);

    try {
      const result = await processSyncQueue();
      setLastSyncAt(new Date().toISOString());
      await refreshSummary();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshSummary]);

  useEffect(() => {
    registerSyncWorker();
    refreshSummary();

    function handleOnline() {
      setIsOnline(true);
      syncNow().catch(() => {});
    }

    function handleOffline() {
      setIsOnline(false);
      refreshSummary();
    }

    function handleQueueChanged() {
      refreshSummary();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("sync:online", handleOnline);
    window.addEventListener("sync:offline", handleOffline);
    window.addEventListener("sync:queue-changed", handleQueueChanged);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sync:online", handleOnline);
      window.removeEventListener("sync:offline", handleOffline);
      window.removeEventListener("sync:queue-changed", handleQueueChanged);
    };
  }, [refreshSummary, syncNow]);

  const value = useMemo(
    () => ({
      isOnline,
      isSyncing,
      lastSyncAt,
      summary,
      pendingCount: summary.PENDIENTE + summary.ERROR + summary.CONFLICTO,
      refreshSummary,
      syncNow
    }),
    [isOnline, isSyncing, lastSyncAt, refreshSummary, summary, syncNow]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const context = useContext(OfflineContext);

  if (!context) {
    throw new Error("useOffline debe usarse dentro de OfflineProvider");
  }

  return context;
}
