import { CircleDot, Flag, Play, RefreshCw, RotateCcw, Square, StickyNote, StopCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { httpClient } from "../../shared/api/httpClient";
import { createClientEventId, saveMatchEventOfflineFirst } from "../../shared/offline/offlineMutations";

const eventTypes = [
  "GOL",
  "AUTOGOL",
  "GOL_PENAL",
  "TARJETA_AMARILLA",
  "TARJETA_ROJA",
  "SUSTITUCION",
  "OBSERVACION_ARBITRO"
];

const emptyEventForm = {
  type: "GOL",
  minute: "",
  teamId: "",
  playerId: "",
  secondaryPlayerId: "",
  notes: ""
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

function eventLabel(type) {
  const labels = {
    GOL: "Gol",
    AUTOGOL: "Autogol",
    GOL_PENAL: "Gol penal",
    TARJETA_AMARILLA: "Amarilla",
    TARJETA_ROJA: "Roja",
    SUSTITUCION: "Sustitucion",
    OBSERVACION_ARBITRO: "Observacion"
  };

  return labels[type] || type;
}

function EventIcon({ type }) {
  if (["GOL", "AUTOGOL", "GOL_PENAL"].includes(type)) {
    return <CircleDot size={18} />;
  }

  if (["TARJETA_AMARILLA", "TARJETA_ROJA"].includes(type)) {
    return <Square size={18} />;
  }

  if (type === "SUSTITUCION") {
    return <RotateCcw size={18} />;
  }

  return <StickyNote size={18} />;
}

function applyLocalGoalScore(match, event) {
  if (!match) {
    return match;
  }

  if (!["GOL", "AUTOGOL", "GOL_PENAL"].includes(event.type)) {
    return match;
  }

  if (event.type === "AUTOGOL") {
    return event.teamId === match.homeTeamId
      ? { ...match, awayScore: match.awayScore + 1 }
      : { ...match, homeScore: match.homeScore + 1 };
  }

  return event.teamId === match.homeTeamId
    ? { ...match, homeScore: match.homeScore + 1 }
    : { ...match, awayScore: match.awayScore + 1 };
}

export function MatchDetailPage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [playersByTeam, setPlayersByTeam] = useState({});
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const teams = useMemo(() => [match?.homeTeam, match?.awayTeam].filter(Boolean), [match]);
  const selectedPlayers = playersByTeam[eventForm.teamId] || [];
  const requiresTeam = eventForm.type !== "OBSERVACION_ARBITRO";
  const requiresPlayer = !["OBSERVACION_ARBITRO"].includes(eventForm.type);
  const requiresSecondaryPlayer = eventForm.type === "SUSTITUCION";

  function teamName(teamId) {
    return teams.find((team) => team.id === teamId)?.name || "Sin equipo";
  }

  function playerName(playerId) {
    const players = Object.values(playersByTeam).flat();
    return players.find((player) => player.id === playerId)?.fullName || "Sin jugador";
  }

  async function loadPlayersForMatch(nextMatch) {
    if (!nextMatch?.homeTeamId || !nextMatch?.awayTeamId) {
      return;
    }

    const [homeResponse, awayResponse] = await Promise.all([
      httpClient.get("/players", { params: { teamId: nextMatch.homeTeamId, limit: 100 } }),
      httpClient.get("/players", { params: { teamId: nextMatch.awayTeamId, limit: 100 } })
    ]);

    setPlayersByTeam({
      [nextMatch.homeTeamId]: homeResponse.data.data.players || [],
      [nextMatch.awayTeamId]: awayResponse.data.data.players || []
    });
  }

  async function loadMatch() {
    const response = await httpClient.get(`/matches/${id}`);
    const nextMatch = response.data.data.match;
    setMatch(nextMatch);
    setEventForm((current) => ({
      ...current,
      teamId: current.teamId || nextMatch.homeTeamId || ""
    }));
    await loadPlayersForMatch(nextMatch);
  }

  async function loadEvents() {
    const response = await httpClient.get(`/matches/${id}/events`);
    setEvents(response.data.data.events || []);
  }

  async function loadAll() {
    setLoading(true);
    setMessage("");

    try {
      await loadMatch();
      await loadEvents();
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

  function updateEventField(event) {
    const { name, value } = event.target;
    setEventForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "teamId" ? { playerId: "", secondaryPlayerId: "" } : {})
    }));
  }

  async function startMatch() {
    setSaving(true);
    setMessage("");

    try {
      await httpClient.post(`/matches/${id}/start`, {
        clientEventId: createClientEventId("PARTIDO_INICIADO")
      });
      await loadAll();
      setMessage("Partido iniciado correctamente");
      setMessageType("success");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function finishMatch() {
    if (!window.confirm("Finalizar partido y consolidar tabla?")) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await httpClient.post(`/matches/${id}/finish`, {
        clientEventId: createClientEventId("PARTIDO_FINALIZADO")
      });
      await loadAll();
      setMessage("Partido finalizado correctamente");
      setMessageType("success");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function submitEvent(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      type: eventForm.type,
      ...(eventForm.minute !== "" ? { minute: Number(eventForm.minute) } : {}),
      ...(eventForm.teamId ? { teamId: eventForm.teamId } : {}),
      ...(eventForm.playerId ? { playerId: eventForm.playerId } : {}),
      ...(eventForm.secondaryPlayerId ? { secondaryPlayerId: eventForm.secondaryPlayerId } : {}),
      ...(eventForm.notes.trim() ? { notes: eventForm.notes.trim() } : {})
    };

    try {
      const result = await saveMatchEventOfflineFirst({ matchId: id, event: payload });

      if (result.queued) {
        setEvents((current) => [...current, result.localEvent]);
        setMatch((current) => applyLocalGoalScore(current, payload));
        setMessage("Evento guardado en cola offline");
      } else {
        await loadAll();
        setMessage("Evento registrado correctamente");
      }

      setMessageType("success");
      setEventForm((current) => ({
        ...emptyEventForm,
        teamId: current.teamId
      }));
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        const minuteDiff = (a.minute ?? 999) - (b.minute ?? 999);
        return minuteDiff || new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }),
    [events]
  );

  return (
    <main className="content-page">
      <section className="match-header">
        <div className="match-team">
          <strong>{match?.homeTeam?.name || "Local"}</strong>
          <span>{match?.homeTeam?.code || "-"}</span>
        </div>
        <div className="score-panel">
          <span>{match?.status || "-"}</span>
          <strong>{match?.homeScore ?? 0} - {match?.awayScore ?? 0}</strong>
          <small>{formatDate(match?.scheduledAt)} | {match?.field?.name || "Sin cancha"}</small>
        </div>
        <div className="match-team right">
          <strong>{match?.awayTeam?.name || "Visitante"}</strong>
          <span>{match?.awayTeam?.code || "-"}</span>
        </div>
      </section>

      <section className="match-actions">
        <Link className="secondary-button" to={match?.tournamentId ? `/tournaments/${match.tournamentId}` : "/matches"}>
          <Flag size={18} />
          Campeonato
        </Link>
        <button className="secondary-button" type="button" onClick={loadAll} disabled={loading}>
          <RefreshCw size={18} />
          Actualizar
        </button>
        {match?.status === "PROGRAMADO" ? (
          <button className="primary-button" type="button" onClick={startMatch} disabled={saving}>
            <Play size={18} />
            Iniciar partido
          </button>
        ) : null}
        {match?.status === "EN_JUEGO" ? (
          <button className="primary-button" type="button" onClick={finishMatch} disabled={saving}>
            <StopCircle size={18} />
            Finalizar partido
          </button>
        ) : null}
      </section>

      {message ? <p className={messageType === "error" ? "form-error detail-message" : "form-success detail-message"}>{message}</p> : null}

      <section className="match-workspace">
        {match?.status === "EN_JUEGO" ? (
          <form className="event-panel" onSubmit={submitEvent}>
            <h2>Registrar evento</h2>
            <label>
              <span>Tipo</span>
              <select name="type" value={eventForm.type} onChange={updateEventField}>
                {eventTypes.map((type) => (
                  <option value={type} key={type}>
                    {eventLabel(type)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Minuto</span>
              <input name="minute" type="number" min="0" max="140" value={eventForm.minute} onChange={updateEventField} />
            </label>
            <label>
              <span>Equipo</span>
              <select name="teamId" value={eventForm.teamId} onChange={updateEventField} required={requiresTeam}>
                <option value="">Sin equipo</option>
                {teams.map((team) => (
                  <option value={team.id} key={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Jugador</span>
              <select name="playerId" value={eventForm.playerId} onChange={updateEventField} required={requiresPlayer}>
                <option value="">Seleccionar</option>
                {selectedPlayers.map((player) => (
                  <option value={player.id} key={player.id}>
                    {player.fullName}
                  </option>
                ))}
              </select>
            </label>
            {requiresSecondaryPlayer ? (
              <label>
                <span>Jugador entrante</span>
                <select name="secondaryPlayerId" value={eventForm.secondaryPlayerId} onChange={updateEventField} required>
                  <option value="">Seleccionar</option>
                  {selectedPlayers.map((player) => (
                    <option value={player.id} key={player.id}>
                      {player.fullName}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="wide-field">
              <span>Notas</span>
              <textarea name="notes" rows={3} value={eventForm.notes} onChange={updateEventField} />
            </label>
            <button className="primary-button" type="submit" disabled={saving}>
              Guardar evento
            </button>
          </form>
        ) : null}

        <section className="timeline-panel">
          <h2>Timeline</h2>
          {sortedEvents.map((event) => (
            <article className={`timeline-item ${event.syncStatus ? "local" : ""}`} key={event.id || event.clientEventId}>
              <EventIcon type={event.type} />
              <div>
                <strong>{event.minute ?? "-"}' {eventLabel(event.type)}</strong>
                <span>
                  {event.type === "SUSTITUCION"
                    ? `${playerName(event.playerId)} por ${playerName(event.secondaryPlayerId)}`
                    : event.player?.fullName || playerName(event.playerId)}
                </span>
                <small>{event.team?.name || teamName(event.teamId)}{event.notes ? ` | ${event.notes}` : ""}</small>
              </div>
              {event.syncStatus ? <span className="queue-status pendiente">{event.syncStatus}</span> : null}
            </article>
          ))}
          {!sortedEvents.length ? (
            <div className="empty-state">
              <h2>Sin eventos</h2>
              <p>Los goles, tarjetas y sustituciones apareceran aqui.</p>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
