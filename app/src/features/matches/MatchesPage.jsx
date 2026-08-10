import { Eye, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { httpClient } from "../../shared/api/httpClient";

const statuses = ["PROGRAMADO", "EN_JUEGO", "FINALIZADO", "SUSPENDIDO", "CANCELADO", "DEFAULT"];
const emptyPagination = {
  page: 1,
  limit: 25,
  total: 0,
  totalPages: 1
};

function getErrorMessage(error) {
  return error.response?.data?.message || "No se pudo completar la operacion";
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getScore(match) {
  return match.status === "PROGRAMADO" ? "vs" : `${match.homeScore} - ${match.awayScore}`;
}

export function MatchesPage() {
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tournamentFilter, setTournamentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function loadTournaments() {
    const response = await httpClient.get("/tournaments", { params: { limit: 100 } });
    setTournaments(response.data.data.tournaments || []);
  }

  async function loadMatches(nextPage = pagination.page) {
    setLoading(true);
    setMessage("");

    try {
      const response = await httpClient.get("/matches", {
        params: {
          ...(tournamentFilter ? { tournamentId: tournamentFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          page: nextPage,
          limit: pagination.limit
        }
      });
      setMatches(response.data.data.matches || []);
      setPagination(response.data.data.pagination || emptyPagination);
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    setLoading(true);

    try {
      await loadTournaments();
      await loadMatches();
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMatches(1);
  }, [tournamentFilter, statusFilter]);

  return (
    <main className="content-page">
      <section className="module-header">
        <div>
          <p className="eyebrow">Operativo</p>
          <h1>Partidos</h1>
          <p>{pagination.total} partido(s)</p>
        </div>
        <button className="secondary-button" type="button" onClick={loadInitialData} disabled={loading}>
          <RefreshCw size={18} />
          Actualizar
        </button>
      </section>

      <section className="crud-workbench compact">
        <div className="crud-filter stacked">
          <label>
            <span>Campeonato</span>
            <select value={tournamentFilter} onChange={(event) => setTournamentFilter(event.target.value)}>
              <option value="">Todos</option>
              {tournaments.map((tournament) => (
                <option value={tournament.id} key={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Todos</option>
              {statuses.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        {message ? <p className={messageType === "error" ? "form-error" : "form-success"}>{message}</p> : null}
      </section>

      <section className="entity-list">
        {matches.map((match) => (
          <article className="entity-row" key={match.id}>
            <div>
              <strong>{match.homeTeam?.name} {getScore(match)} {match.awayTeam?.name}</strong>
              <span>{match.tournament?.name || "Campeonato"} | {match.round?.name || "Sin fecha"} | {match.status}</span>
              <small>{formatDate(match.scheduledAt)} | {match.field?.name || "Sin cancha"}</small>
            </div>
            <div className="entity-meta">
              <span>{match._count?.events || 0} eventos</span>
            </div>
            <div className="entity-actions">
              <Link className="icon-button bordered" to={`/matches/${match.id}`} title="Ver partido">
                <Eye size={17} />
              </Link>
            </div>
          </article>
        ))}
        {!matches.length && !loading ? (
          <div className="empty-state">
            <h2>Sin partidos</h2>
            <p>Genera el fixture desde el detalle del campeonato.</p>
          </div>
        ) : null}
      </section>

      <div className="pagination-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={() => loadMatches(pagination.page - 1)}
          disabled={loading || pagination.page <= 1}
        >
          Anterior
        </button>
        <span>
          Pagina {pagination.page} de {pagination.totalPages}
        </span>
        <button
          className="secondary-button"
          type="button"
          onClick={() => loadMatches(pagination.page + 1)}
          disabled={loading || pagination.page >= pagination.totalPages}
        >
          Siguiente
        </button>
      </div>
    </main>
  );
}
