import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { httpClient } from "../../shared/api/httpClient";
import { Modal } from "../../shared/components/Modal";

const emptyForm = {
  fullName: "",
  documentNumber: "",
  birthDate: "",
  jerseyName: "",
  teamId: "",
  jerseyNumber: ""
};

function getErrorMessage(error) {
  return error.response?.data?.message || "No se pudo completar la operacion";
}

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function buildCreatePayload(form) {
  return {
    fullName: form.fullName.trim(),
    documentNumber: form.documentNumber.trim() || null,
    birthDate: form.birthDate || null,
    jerseyName: form.jerseyName.trim() || null,
    ...(form.teamId ? { teamId: form.teamId } : {}),
    ...(form.jerseyNumber ? { jerseyNumber: Number(form.jerseyNumber) } : {})
  };
}

function buildUpdatePayload(form) {
  return {
    fullName: form.fullName.trim(),
    documentNumber: form.documentNumber.trim() || null,
    birthDate: form.birthDate || null,
    jerseyName: form.jerseyName.trim() || null
  };
}

function getTeamLabel(player) {
  const activeTeams = player.teams || [];

  if (!activeTeams.length) {
    return "Sin equipo";
  }

  return activeTeams.map((assignment) => assignment.team?.name).filter(Boolean).join(", ");
}

function getJerseyNumbers(player) {
  const numbers = (player.teams || []).map((assignment) => assignment.jerseyNumber).filter(Boolean);
  return numbers.length ? numbers.join(", ") : "-";
}

export function PlayersPage() {
  const { roles } = useAuth();
  const canManage = roles.includes("ADMIN") || roles.includes("SUPER_USUARIO");
  const [teams, setTeams] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => `${a.tournament?.name || ""}${a.name}`.localeCompare(`${b.tournament?.name || ""}${b.name}`)),
    [teams]
  );

  async function loadTeams() {
    const response = await httpClient.get("/teams");
    const nextTeams = response.data.data.teams || [];
    setTeams(nextTeams);
  }

  async function loadPlayers() {
    setLoading(true);
    setMessage("");

    try {
      const response = await httpClient.get("/players", {
        params: {
          ...(teamFilter ? { teamId: teamFilter } : {}),
          ...(query.trim() ? { q: query.trim() } : {})
        }
      });
      setItems(response.data.data.players || []);
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
      await loadTeams();
      await loadPlayers();
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
    const timer = window.setTimeout(() => {
      loadPlayers();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [teamFilter, query]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startCreate() {
    setEditingId("");
    setForm(emptyForm);
    setMessage("");
    setIsModalOpen(true);
  }

  function startEdit(player) {
    const assignment = player.teams?.[0];

    setEditingId(player.id);
    setForm({
      fullName: player.fullName || "",
      documentNumber: player.documentNumber || "",
      birthDate: toDateInput(player.birthDate),
      jerseyName: player.jerseyName || "",
      teamId: assignment?.teamId || assignment?.team?.id || "",
      jerseyNumber: assignment?.jerseyNumber || ""
    });
    setMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingId("");
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let successMessage;

      if (editingId) {
        await httpClient.put(`/players/${editingId}`, buildUpdatePayload(form));

        if (form.teamId) {
          await httpClient.post(`/players/${editingId}/teams`, {
            teamId: form.teamId,
            ...(form.jerseyNumber ? { jerseyNumber: Number(form.jerseyNumber) } : {})
          });
        }

        successMessage = "Jugador actualizado correctamente";
      } else {
        await httpClient.post("/players", buildCreatePayload(form));
        successMessage = "Jugador creado correctamente";
      }

      closeModal();
      await loadPlayers();
      setMessage(successMessage);
      setMessageType("success");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(player) {
    if (!window.confirm(`Eliminar jugador ${player.fullName}?`)) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await httpClient.delete(`/players/${player.id}`);
      await loadPlayers();
      setMessage("Jugador eliminado correctamente");
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
      <section className="module-header">
        <div>
          <p className="eyebrow">Administracion</p>
          <h1>Jugadores</h1>
          <p>{items.length} jugador(es)</p>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" onClick={startCreate} disabled={!canManage}>
            <Plus size={18} />
            Nuevo
          </button>
          <button className="secondary-button" type="button" onClick={loadInitialData} disabled={loading}>
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="crud-workbench compact">
        <div className="crud-filter stacked">
          <label>
            <span>Buscar</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre" />
          </label>
          <label>
            <span>Equipo</span>
            <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
              <option value="">Todos</option>
              {sortedTeams.map((team) => (
                <option value={team.id} key={team.id}>
                  {team.tournament?.name || "Torneo"} - {team.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {message ? <p className={messageType === "error" ? "form-error" : "form-success"}>{message}</p> : null}
      </section>

      <section className="entity-list">
        {items.map((player) => (
          <article className="entity-row" key={player.id}>
            <div>
              <strong>{player.fullName}</strong>
              <span>{player.documentNumber || "Sin documento"} | {getTeamLabel(player)}</span>
              <small>Camiseta: {player.jerseyName || "-"} | Numero: {getJerseyNumbers(player)}</small>
            </div>
            <div className="entity-actions">
              <button type="button" className="icon-button bordered" onClick={() => startEdit(player)} title="Editar">
                <Pencil size={17} />
              </button>
              <button type="button" className="icon-button danger" onClick={() => handleDelete(player)} title="Eliminar">
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
        {!items.length && !loading ? (
          <div className="empty-state">
            <h2>Sin jugadores</h2>
            <p>No hay jugadores para el filtro actual.</p>
          </div>
        ) : null}
      </section>

      <Modal open={isModalOpen} title={editingId ? "Editar jugador" : "Nuevo jugador"} onClose={closeModal}>
        <form className="crud-form modal-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre completo</span>
            <input name="fullName" value={form.fullName} onChange={updateField} required minLength={3} />
          </label>
          <label>
            <span>Documento</span>
            <input name="documentNumber" value={form.documentNumber} onChange={updateField} />
          </label>
          <label>
            <span>Nacimiento</span>
            <input type="date" name="birthDate" value={form.birthDate} onChange={updateField} />
          </label>
          <label>
            <span>Nombre camiseta</span>
            <input name="jerseyName" value={form.jerseyName} onChange={updateField} />
          </label>
          <label>
            <span>Equipo</span>
            <select name="teamId" value={form.teamId} onChange={updateField}>
              <option value="">Sin equipo</option>
              {sortedTeams.map((team) => (
                <option value={team.id} key={team.id}>
                  {team.tournament?.name || "Torneo"} - {team.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Numero</span>
            <input type="number" name="jerseyNumber" value={form.jerseyNumber} onChange={updateField} min="1" />
          </label>
          <div className="crud-actions">
            <button className="primary-button" type="submit" disabled={!canManage || saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button className="secondary-button" type="button" onClick={closeModal}>
              Cancelar
            </button>
          </div>
          {messageType === "error" && message ? <p className="form-error">{message}</p> : null}
        </form>
      </Modal>
    </main>
  );
}
