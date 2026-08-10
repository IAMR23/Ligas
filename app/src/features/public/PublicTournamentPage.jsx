import { CalendarDays, RefreshCw, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { httpClient } from "../../shared/api/httpClient";

const tabs = ["Tabla", "Proximos", "Resultados", "Goleadores"];

function getErrorMessage(error) {
  return error.response?.data?.message || "No se pudo cargar la informacion publica";
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

export function PublicTournamentPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Tabla");
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadPublicTournament() {
    setLoading(true);
    setMessage("");

    try {
      const response = await httpClient.get(`/public/tournaments/${id}`);
      setPayload(response.data.data);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPublicTournament();
  }, [id]);

  const tournament = payload?.tournament;

  return (
    <main className="public-page">
      <section className="public-hero">
        <div>
          <p className="eyebrow">Liga publica</p>
          <h1>{tournament?.name || "Campeonato"}</h1>
          <p>{tournament?.status || "-"} | {tournament?.code || "-"}</p>
        </div>
        <div className="public-actions">
          <button className="secondary-button" type="button" onClick={loadPublicTournament} disabled={loading}>
            <RefreshCw size={18} />
            Actualizar
          </button>
          <Link className="secondary-button" to="/login">
            <Trophy size={18} />
            Ingresar
          </Link>
        </div>
      </section>

      <nav className="tab-bar public-tabs" aria-label="Informacion publica">
        {tabs.map((tab) => (
          <button className={activeTab === tab ? "active" : ""} key={tab} type="button" onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      {message ? <p className="form-error detail-message">{message}</p> : null}

      {activeTab === "Tabla" ? (
        <section className="data-table standings-table">
          <div className="data-table-row standings header">
            <span>POS</span>
            <span>Equipo</span>
            <span>PJ</span>
            <span>PG</span>
            <span>PE</span>
            <span>PP</span>
            <span>GF</span>
            <span>GC</span>
            <span>DG</span>
            <span>PTS</span>
          </div>
          {(payload?.standings || []).map((row) => (
            <div className="data-table-row standings" key={row.id}>
              <span>{row.position}</span>
              <span>{row.team?.name || "-"}</span>
              <span>{row.played}</span>
              <span>{row.won}</span>
              <span>{row.drawn}</span>
              <span>{row.lost}</span>
              <span>{row.goalsFor}</span>
              <span>{row.goalsAgainst}</span>
              <span>{row.goalDiff}</span>
              <span>{row.points}</span>
            </div>
          ))}
        </section>
      ) : null}

      {activeTab === "Proximos" ? (
        <section className="public-list">
          {(payload?.nextMatches || []).map((match) => (
            <article className="match-row" key={match.id}>
              <CalendarDays size={18} />
              <div>
                <strong>{match.homeTeam?.name} vs {match.awayTeam?.name}</strong>
                <span>{formatDate(match.scheduledAt)} | {match.field?.name || "Sin cancha"}</span>
              </div>
            </article>
          ))}
          {!payload?.nextMatches?.length ? (
            <div className="empty-state">
              <h2>Sin proximos partidos</h2>
              <p>El fixture publico aparecera cuando existan partidos programados.</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "Resultados" ? (
        <section className="public-list">
          {(payload?.recentResults || []).map((match) => (
            <article className="match-row" key={match.id}>
              <CalendarDays size={18} />
              <div>
                <strong>{match.homeTeam?.name} {match.homeScore} - {match.awayScore} {match.awayTeam?.name}</strong>
                <span>{match.round?.name || "Fecha"} | {formatDate(match.finishedAt)}</span>
              </div>
            </article>
          ))}
          {!payload?.recentResults?.length ? (
            <div className="empty-state">
              <h2>Sin resultados</h2>
              <p>Los resultados apareceran al finalizar partidos.</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "Goleadores" ? (
        <section className="data-table scorers-table">
          <div className="data-table-row scorers header">
            <span>POS</span>
            <span>Jugador</span>
            <span>Equipo</span>
            <span>Goles</span>
            <span>Asist.</span>
            <span>PJ</span>
          </div>
          {(payload?.scorers || []).map((row) => (
            <div className="data-table-row scorers" key={row.id}>
              <span>{row.position}</span>
              <span>{row.player?.fullName || "-"}</span>
              <span>{row.team?.name || "-"}</span>
              <span>{row.goals}</span>
              <span>{row.assists}</span>
              <span>{row.matchesPlayed}</span>
            </div>
          ))}
        </section>
      ) : null}
    </main>
  );
}
