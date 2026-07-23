import { AlertTriangle, DatabaseZap, LogIn, RefreshCw, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { httpClient } from "../../shared/api/httpClient";

const logViews = {
  audit: {
    title: "Auditoria",
    endpoint: "/logs/audit",
    icon: Shield,
    columns: ["fecha", "accion", "tabla", "usuario", "ip"]
  },
  login: {
    title: "Ingresos",
    endpoint: "/logs/login",
    icon: LogIn,
    columns: ["fecha", "usuario", "resultado", "ip", "motivo"]
  },
  sync: {
    title: "Sync",
    endpoint: "/logs/sync",
    icon: DatabaseZap,
    columns: ["fecha", "estado", "entidad", "usuario", "intentos"]
  },
  errors: {
    title: "Errores",
    endpoint: "/logs/errors",
    icon: AlertTriangle,
    columns: ["fecha", "origen", "estado", "usuario", "detalle"]
  }
};

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function getUserName(item) {
  return item.user?.fullName || item.user?.username || item.username || item.email || item.userId || "-";
}

function getCellValue(item, column) {
  const values = {
    fecha: formatDate(item.createdAt),
    accion: item.action || "-",
    tabla: item.tableName || item.source || "-",
    usuario: getUserName(item),
    ip: item.ipAddress || "-",
    resultado: item.success === undefined ? "-" : item.success ? "OK" : "Fallido",
    motivo: item.failureReason || "-",
    estado: item.status || item.action || "-",
    entidad: item.entityType || item.tableName || "-",
    intentos: item.attempts ?? "-",
    origen: item.source || "-",
    detalle: item.error || item.failureReason || item.traceId || "-"
  };

  return values[column] ?? "-";
}

function getErrorMessage(error) {
  return error.response?.data?.message || "No se pudieron cargar los logs";
}

export function LogsPage({ type = "audit" }) {
  const view = logViews[type] || logViews.audit;
  const Icon = view.icon;
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const totalLabel = useMemo(() => `${pagination.total} registro(s)`, [pagination.total]);

  async function loadLogs(page = 1) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await httpClient.get(view.endpoint, { params: { page, limit: pagination.limit } });
      const data = response.data.data;

      setItems(data.items || []);
      setPagination(data.pagination || { page, limit: pagination.limit, total: 0, pages: 1 });
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
    }
  }

  useEffect(() => {
    loadLogs(1);
  }, [type]);

  return (
    <main className="content-page">
      <section className="module-header">
        <div>
          <p className="eyebrow">Logs</p>
          <h1>{view.title}</h1>
          <p>{totalLabel}</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => loadLogs(pagination.page)} disabled={status === "loading"}>
          <RefreshCw size={18} />
          Actualizar
        </button>
      </section>

      {message ? <p className="form-error log-message">{message}</p> : null}

      <section className="log-table-wrap">
        <div className="log-table-title">
          <Icon size={18} />
          <strong>{view.title}</strong>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <h2>Sin registros</h2>
            <p>No hay entradas para esta vista.</p>
          </div>
        ) : (
          <div className="data-table" role="table">
            <div className="data-table-row header" role="row">
              {view.columns.map((column) => (
                <span role="columnheader" key={column}>
                  {column}
                </span>
              ))}
            </div>
            {items.map((item) => (
              <div className="data-table-row" role="row" key={item.id || `${item.source}-${item.createdAt}`}>
                {view.columns.map((column) => (
                  <span role="cell" key={column}>
                    {getCellValue(item, column)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pagination-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={() => loadLogs(Math.max(1, pagination.page - 1))}
          disabled={pagination.page <= 1 || status === "loading"}
        >
          Anterior
        </button>
        <span>
          Pagina {pagination.page} de {pagination.pages || 1}
        </span>
        <button
          className="secondary-button"
          type="button"
          onClick={() => loadLogs(Math.min(pagination.pages || 1, pagination.page + 1))}
          disabled={pagination.page >= (pagination.pages || 1) || status === "loading"}
        >
          Siguiente
        </button>
      </section>
    </main>
  );
}
