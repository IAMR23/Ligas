import { FileDown, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { httpClient } from "../../shared/api/httpClient";

function getErrorMessage(error) {
  return error.response?.data?.message || "No se pudo completar la operacion";
}

function getDownloadName(headers, fallback) {
  const disposition = headers["content-disposition"];
  const match = disposition?.match(/filename="?([^"]+)"?/i);

  return match?.[1] || fallback;
}

function buildParams(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
}

export function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [downloading, setDownloading] = useState("");

  const selectedReport = useMemo(
    () => reports.find((report) => report.code === selectedCode),
    [reports, selectedCode]
  );

  async function loadReports() {
    setStatus("loading");
    setMessage("");
    setMessageType("success");

    try {
      const response = await httpClient.get("/reports", { params: { active: true } });
      const nextReports = response.data.data.reports || [];

      setReports(nextReports);
      setSelectedCode((current) => current || nextReports[0]?.code || "");
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
      setMessageType("error");
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function downloadReport(format) {
    if (!selectedCode) {
      return;
    }

    const extension = format === "pdf" ? "pdf" : "xlsx";
    const requestKey = `${selectedCode}-${format}`;

    setDownloading(requestKey);
    setMessage("");
    setMessageType("success");

    try {
      const response = await httpClient.get(`/reports/${selectedCode}/${format}`, {
        params: buildParams(filters),
        responseType: "blob"
      });
      const fileName = getDownloadName(response.headers, `${selectedCode.toLowerCase()}.${extension}`);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage(`Reporte generado: ${fileName}`);
      setMessageType("success");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setDownloading("");
    }
  }

  return (
    <main className="content-page">
      <section className="module-header">
        <div>
          <p className="eyebrow">Reportes</p>
          <h1>PDF y Excel</h1>
          <p>Exportaciones operativas de torneos, estadisticas, vocalias y auditoria.</p>
        </div>
        <button className="secondary-button" type="button" onClick={loadReports} disabled={status === "loading"}>
          <RefreshCw size={18} />
          Actualizar
        </button>
      </section>

      <section className="report-workbench">
        <div className="report-picker">
          <label>
            <span>Reporte</span>
            <select value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}>
              {reports.map((report) => (
                <option value={report.code} key={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </label>
          <div className="report-description">
            <strong>{selectedReport?.code || "Sin reporte"}</strong>
            <span>{selectedReport?.description || "Selecciona un reporte disponible."}</span>
          </div>
        </div>

        <div className="report-filters">
          <label>
            <span>Desde</span>
            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={updateFilter} />
          </label>
          <label>
            <span>Hasta</span>
            <input type="date" name="dateTo" value={filters.dateTo} onChange={updateFilter} />
          </label>
        </div>

        <div className="report-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => downloadReport("pdf")}
            disabled={!selectedCode || downloading !== ""}
          >
            <FileDown size={18} />
            {downloading === `${selectedCode}-pdf` ? "Generando..." : "PDF"}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => downloadReport("excel")}
            disabled={!selectedCode || downloading !== ""}
          >
            <FileSpreadsheet size={18} />
            {downloading === `${selectedCode}-excel` ? "Generando..." : "Excel"}
          </button>
        </div>

        {message ? <p className={messageType === "error" ? "form-error" : "form-success"}>{message}</p> : null}
      </section>

      <section className="report-list">
        {reports.map((report) => (
          <article className="report-row" key={report.id}>
            <div>
              <strong>{report.name}</strong>
              <span>{report.code}</span>
            </div>
            <small>{report.isActive ? "Activo" : "Inactivo"}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
