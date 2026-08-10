import { CalendarClock, Eye, ListFilter, RefreshCw, Save, Shield, Trophy, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { httpClient } from "../../shared/api/httpClient";
import { Modal } from "../../shared/components/Modal";

const tabs = ["Resumen", "Equipos", "Fixture", "Tabla", "Goleadores", "Sanciones"];
const statuses = ["PROGRAMADO", "EN_JUEGO", "FINALIZADO", "SUSPENDIDO", "CANCELADO", "DEFAULT"];

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

function toDateTimeInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function getScore(match) {
  return match.status === "FINALIZADO" || match.status === "EN_JUEGO" ? `${match.homeScore} - ${match.awayScore}` : "vs";
}

export function TournamentDetailPage() {
  const { id } = useParams();
  const { roles } = useAuth();
  const canManage = roles.includes("ADMIN") || roles.includes("SUPER_USUARIO");
  const [activeTab, setActiveTab] = useState("Resumen");
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [fixture, setFixture] = useState([]);
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [discipline, setDiscipline] = useState([]);
  const [sanctions, setSanctions] = useState([]);
  const [fields, setFields] = useState([]);
  const [roundFilter, setRoundFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fixtureRoundTrip, setFixtureRoundTrip] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editMatchForm, setEditMatchForm] = useState({ scheduledAt: "", fieldId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const summary = tournament?.summary || {};
  const totalMatches = summary.totalMatches || tournament?._count?.matches || 0;
  const playedMatches = summary.playedMatches || 0;
  const pendingMatches = summary.pendingMatches ?? Math.max(totalMatches - playedMatches, 0);

  const allMatches = useMemo(() => fixture.flatMap((round) => round.matches || []), [fixture]);
  const roundOptions = useMemo(() => fixture.map((round) => round.number), [fixture]);

  async function loadTournament() {
    const response = await httpClient.get(`/tournaments/${id}`);
    const nextTournament = response.data.data.tournament;
    setTournament(nextTournament);
    setFixtureRoundTrip(Boolean(nextTournament?.roundTrip));
  }

  async function loadTeams() {
    const response = await httpClient.get("/teams", { params: { tournamentId: id, limit: 100 } });
    setTeams(response.data.data.teams || []);
  }

  async function loadFixture() {
    const response = await httpClient.get(`/tournaments/${id}/fixture`, {
      params: {
        ...(roundFilter ? { roundNumber: roundFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {})
      }
    });
    setFixture(response.data.data.rounds || []);
  }

  async function loadStandings() {
    const response = await httpClient.get(`/tournaments/${id}/standings`);
    setStandings(response.data.data.standings || []);
  }

  async function loadScorers() {
    const response = await httpClient.get(`/tournaments/${id}/scorers`);
    setScorers(response.data.data.scorers || []);
  }

  async function loadDiscipline() {
    const response = await httpClient.get(`/tournaments/${id}/discipline`);
    setDiscipline(response.data.data.discipline || []);
  }

  async function loadSanctions() {
    const response = await httpClient.get(`/tournaments/${id}/sanctions`);
    setSanctions(response.data.data.sanctions || []);
  }

  async function loadFields() {
    const response = await httpClient.get("/fields", { params: { active: "true" } });
    setFields(response.data.data.fields || []);
  }

  async function loadAll() {
    setLoading(true);
    setMessage("");

    try {
      await Promise.all([
        loadTournament(),
        loadTeams(),
        loadFixture(),
        loadStandings(),
        loadScorers(),
        loadDiscipline(),
        loadSanctions(),
        loadFields()
      ]);
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    loadFixture().catch((error) => {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    });
  }, [roundFilter, statusFilter]);

  async function handleGenerateFixture() {
    if (totalMatches > 0) {
      window.confirm("Este campeonato ya tiene partidos. No se generara un fixture duplicado.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await httpClient.post(`/tournaments/${id}/fixture/generate`, {
        format: "LEAGUE",
        roundTrip: fixtureRoundTrip
      });
      await loadAll();
      setActiveTab("Fixture");
      setMessage("Fixture generado correctamente");
      setMessageType("success");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  function openMatchEditor(match) {
    setEditingMatch(match);
    setEditMatchForm({
      scheduledAt: toDateTimeInput(match.scheduledAt),
      fieldId: match.fieldId || ""
    });
  }

  async function handleMatchUpdate(event) {
    event.preventDefault();

    if (!editingMatch) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await httpClient.put(`/matches/${editingMatch.id}`, {
        scheduledAt: editMatchForm.scheduledAt || null,
        fieldId: editMatchForm.fieldId || null
      });
      setEditingMatch(null);
      await loadFixture();
      setMessage("Partido actualizado correctamente");
      setMessageType("success");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="content-page">
      <section className="module-header tournament-hero">
        <div>
          <p className="eyebrow">Campeonato</p>
          <h1>{tournament?.name || "Campeonato"}</h1>
          <p>{tournament?.code || "-"} | {tournament?.status || "-"}</p>
        </div>
        <div className="header-actions">
          <span className="status-chip">{tournament?.format || "LEAGUE"}</span>
          <button className="secondary-button" type="button" onClick={loadAll} disabled={loading}>
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="metric-strip">
        <div>
          <strong>{teams.length || tournament?._count?.teams || 0}</strong>
          <span>Equipos</span>
        </div>
        <div>
          <strong>{totalMatches}</strong>
          <span>Partidos</span>
        </div>
        <div>
          <strong>{playedMatches}</strong>
          <span>Jugados</span>
        </div>
        <div>
          <strong>{pendingMatches}</strong>
          <span>Pendientes</span>
        </div>
      </section>

      <nav className="tab-bar" aria-label="Secciones del campeonato">
        {tabs.map((tab) => (
          <button className={activeTab === tab ? "active" : ""} key={tab} type="button" onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      {message ? <p className={messageType === "error" ? "form-error detail-message" : "form-success detail-message"}>{message}</p> : null}

      {activeTab === "Resumen" ? (
        <section className="detail-grid">
          <article className="detail-panel">
            <Trophy size={22} />
            <strong>{tournament?.name || "-"}</strong>
            <span>{formatDate(tournament?.startDate)} - {formatDate(tournament?.endDate)}</span>
            <span>Victoria {tournament?.pointsWin ?? 3} pts | Empate {tournament?.pointsDraw ?? 1} pts</span>
          </article>
          <article className="detail-panel">
            <CalendarClock size={22} />
            <strong>Proximos partidos</strong>
            {(summary.nextMatches || []).length ? (
              (summary.nextMatches || []).map((match) => (
                <Link to={`/matches/${match.id}`} key={match.id}>
                  {match.homeTeam?.name} vs {match.awayTeam?.name} | {formatDate(match.scheduledAt)}
                </Link>
              ))
            ) : (
              <span>Sin proximos partidos</span>
            )}
          </article>
        </section>
      ) : null}

      {activeTab === "Equipos" ? (
        <section className="entity-list">
          {teams.map((team) => (
            <article className="entity-row" key={team.id}>
              <div className="team-title">
                <span
                  className="team-swatch"
                  style={{ background: team.colorPrimary || "#dc2626", borderColor: team.colorAccent || "#111111" }}
                />
                <div>
                  <strong>{team.name}</strong>
                  <span>{team.code}</span>
                  <small>{team._count?.players || 0} jugador(es)</small>
                </div>
              </div>
              <div className="entity-meta">
                <span>{(team._count?.homeMatches || 0) + (team._count?.awayMatches || 0)} partidos</span>
              </div>
            </article>
          ))}
          {!teams.length ? (
            <div className="empty-state">
              <h2>Sin equipos</h2>
              <p>Registra equipos para generar el fixture.</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "Fixture" ? (
        <>
          <section className="crud-workbench compact">
            <div className="crud-filter stacked">
              <label>
                <span>Fecha</span>
                <select value={roundFilter} onChange={(event) => setRoundFilter(event.target.value)}>
                  <option value="">Todas</option>
                  {roundOptions.map((roundNumber) => (
                    <option value={roundNumber} key={roundNumber}>
                      Fecha {roundNumber}
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
            <div className="fixture-actions">
              <div className="toggle-row">
                <ListFilter size={18} />
                <label>
                  <input
                    type="checkbox"
                    checked={fixtureRoundTrip}
                    disabled={totalMatches > 0}
                    onChange={(event) => setFixtureRoundTrip(event.target.checked)}
                  />
                  Ida y vuelta
                </label>
              </div>
              <button className="primary-button" type="button" onClick={handleGenerateFixture} disabled={!canManage || saving || teams.length < 2}>
                <CalendarClock size={18} />
                Generar fixture
              </button>
            </div>
          </section>

          <section className="fixture-list">
            {fixture.map((round) => (
              <article className="round-block" key={round.id}>
                <header>
                  <strong>{round.name}</strong>
                  <span>{round.matches?.length || 0} partido(s)</span>
                </header>
                <div className="match-list">
                  {(round.matches || []).map((match) => (
                    <div className="match-row" key={match.id}>
                      <div>
                        <strong>{match.homeTeam?.name} {getScore(match)} {match.awayTeam?.name}</strong>
                        <span>{formatDate(match.scheduledAt)} | {match.field?.name || "Sin cancha"} | {match.status}</span>
                      </div>
                      <div className="entity-actions">
                        <Link className="icon-button bordered" to={`/matches/${match.id}`} title="Ver partido">
                          <Eye size={17} />
                        </Link>
                        <button className="icon-button bordered" type="button" onClick={() => openMatchEditor(match)} title="Editar horario">
                          <Save size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {!fixture.length || !allMatches.length ? (
              <div className="empty-state">
                <h2>Sin fixture</h2>
                <p>Genera el fixture cuando los equipos esten registrados.</p>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

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
          {standings.map((row) => (
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
          {scorers.map((row) => (
            <div className="data-table-row scorers" key={row.id}>
              <span>{row.position}</span>
              <span>{row.player?.fullName || "-"}</span>
              <span>{row.team?.name || "-"}</span>
              <span>{row.goals}</span>
              <span>{row.assists}</span>
              <span>{row.matchesPlayed}</span>
            </div>
          ))}
          {!scorers.length ? (
            <div className="empty-state">
              <h2>Sin goleadores</h2>
              <p>Los goles apareceran cuando se registren eventos de partido.</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "Sanciones" ? (
        <section className="sanctions-grid">
          <div className="data-table">
            <div className="data-table-row discipline header">
              <span>Jugador</span>
              <span>Equipo</span>
              <span>Amarillas</span>
              <span>Rojas</span>
              <span>Activas</span>
            </div>
            {discipline.map((row) => (
              <div className="data-table-row discipline" key={row.id}>
                <span>{row.player?.fullName || "-"}</span>
                <span>{row.team?.name || "-"}</span>
                <span>{row.yellowCards}</span>
                <span>{row.redCards}</span>
                <span>{row.activeSanctions}</span>
              </div>
            ))}
          </div>
          <div className="entity-list sanctions-list">
            {sanctions.map((sanction) => (
              <article className="entity-row" key={sanction.id}>
                <div>
                  <strong>{sanction.player?.fullName || "Jugador"}</strong>
                  <span>{sanction.team?.name || "-"} | {sanction.type} | {sanction.status}</span>
                  <small>{sanction.reason || "Sin motivo"} | {sanction.games} partido(s)</small>
                </div>
              </article>
            ))}
            {!sanctions.length ? (
              <div className="empty-state">
                <h2>Sin sanciones</h2>
                <p>Las rojas y dobles amarillas generaran sanciones activas.</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <Modal open={Boolean(editingMatch)} title="Actualizar partido" onClose={() => setEditingMatch(null)}>
        <form className="crud-form modal-form" onSubmit={handleMatchUpdate}>
          <label>
            <span>Fecha y hora</span>
            <input
              type="datetime-local"
              value={editMatchForm.scheduledAt}
              onChange={(event) => setEditMatchForm((current) => ({ ...current, scheduledAt: event.target.value }))}
            />
          </label>
          <label>
            <span>Cancha</span>
            <select
              value={editMatchForm.fieldId}
              onChange={(event) => setEditMatchForm((current) => ({ ...current, fieldId: event.target.value }))}
            >
              <option value="">Sin cancha</option>
              {fields.map((field) => (
                <option value={field.id} key={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </label>
          <div className="crud-actions">
            <button className="primary-button" type="submit" disabled={saving || !canManage}>
              Guardar
            </button>
            <button className="secondary-button" type="button" onClick={() => setEditingMatch(null)}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
