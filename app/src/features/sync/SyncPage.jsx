import { CheckCircle2, RefreshCw, Trash2, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useOffline } from "../../app/providers/OfflineProvider";
import { clearSyncedItems, listSyncQueue } from "../../shared/offline/syncQueue";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function SyncPage() {
  const { isOnline, isSyncing, lastSyncAt, pendingCount, refreshSummary, summary, syncNow } = useOffline();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  async function refreshItems() {
    const nextItems = await listSyncQueue();
    setItems(nextItems);
    await refreshSummary();
  }

  useEffect(() => {
    refreshItems();

    function handleQueueChanged() {
      refreshItems();
    }

    window.addEventListener("sync:queue-changed", handleQueueChanged);
    return () => window.removeEventListener("sync:queue-changed", handleQueueChanged);
  }, []);

  async function handleSync() {
    setMessage("");

    try {
      const result = await syncNow();
      await refreshItems();
      setMessage(result.offline ? "Sin conexion. La cola se mantiene local." : `Procesados: ${result.processed}`);
    } catch {
      await refreshItems();
      setMessage("No se pudo completar la sincronizacion. La cola local se mantiene intacta.");
    }
  }

  async function handleClearSynced() {
    await clearSyncedItems();
    await refreshItems();
    setMessage("Sincronizados eliminados de la cola local.");
  }

  return (
    <main className="content-page">
      <section className="module-header">
        <div>
          <p className="eyebrow">Offline-first</p>
          <h1>Sincronizacion</h1>
          <p>{isOnline ? "Conexion disponible" : "Trabajando sin conexion"}</p>
        </div>
        <span className={isOnline ? "status-chip" : "status-chip offline"}>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? "Online" : "Offline"}
        </span>
      </section>

      <section className="sync-summary">
        <div>
          <strong>{pendingCount}</strong>
          <span>Pendientes</span>
        </div>
        <div>
          <strong>{summary.SINCRONIZADO}</strong>
          <span>Sincronizados</span>
        </div>
        <div>
          <strong>{summary.CONFLICTO}</strong>
          <span>Conflictos</span>
        </div>
        <div>
          <strong>{lastSyncAt ? formatDate(lastSyncAt) : "-"}</strong>
          <span>Ultimo intento</span>
        </div>
      </section>

      <section className="sync-actions">
        <button className="primary-button" type="button" onClick={handleSync} disabled={isSyncing}>
          <RefreshCw size={18} />
          {isSyncing ? "Sincronizando..." : "Sincronizar ahora"}
        </button>
        <button className="secondary-button" type="button" onClick={handleClearSynced}>
          <Trash2 size={18} />
          Limpiar sincronizados
        </button>
        {message ? <p className="form-success">{message}</p> : null}
      </section>

      <section className="queue-list">
        {items.length === 0 ? (
          <div className="empty-state">
            <h2>Cola vacia</h2>
            <p>Los registros offline apareceran aqui cuando no haya conexion o falle un envio.</p>
          </div>
        ) : (
          items.map((item) => (
            <article className="queue-item" key={item.id}>
              <div>
                <strong>{item.entityType || "REQUEST"}</strong>
                <span>{item.method} {item.endpoint}</span>
              </div>
              <span className={`queue-status ${item.status.toLowerCase()}`}>
                {item.status === "SINCRONIZADO" ? <CheckCircle2 size={15} /> : null}
                {item.status}
              </span>
              <small>{item.error || `Intentos: ${item.attempts} | ${formatDate(item.createdAt)}`}</small>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
