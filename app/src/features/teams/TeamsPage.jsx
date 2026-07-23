import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { httpClient } from "../../shared/api/httpClient";
import { Modal } from "../../shared/components/Modal";

const emptyForm = {
  tournamentId: "",
  code: "",
  name: "",
  colorPrimary: "#dc2626",
  colorAccent: "#111111"
};

function getErrorMessage(error) {
  return error.response?.data?.message || "No se pudo completar la operacion";
}

function buildPayload(form) {
  return {
    tournamentId: form.tournamentId,
    code: form.code.trim(),
    name: form.name.trim(),
    colorPrimary: form.colorPrimary || null,
    colorAccent: form.colorAccent || null
  };
}

export function TeamsPage() {
  const { roles } = useAuth();
  const canManage = roles.includes("ADMIN") || roles.includes("SUPER_USUARIO");
  const [tournaments, setTournaments] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournamentFilter, setTournamentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const activeTournamentOptions = useMemo(
    () => tournaments.filter((tournament) => tournament.status !== "CANCELADO"),
    [tournaments]
  );

  async function loadTournaments() {
    const response = await httpClient.get("/tournaments");
    const nextTournaments = response.data.data.tournaments || [];

    setTournaments(nextTournaments);
    setForm((current) => ({
      ...current,
      tournamentId: current.tournamentId || nextTournaments[0]?.id || ""
    }));
  }

  async function loadTeams() {
    setLoading(true);
    setMessage("");

    try {
      const response = await httpClient.get("/teams", {
        params: tournamentFilter ? { tournamentId: tournamentFilter } : {}
      });
      setItems(response.data.data.teams || []);
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
      await loadTeams();
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
    loadTeams();
  }, [tournamentFilter]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startCreate() {
    setEditingId("");
    setForm({
      ...emptyForm,
      tournamentId: tournaments[0]?.id || ""
    });
    setMessage("");
    setIsModalOpen(true);
  }

  function startEdit(team) {
    setEditingId(team.id);
    setForm({
      tournamentId: team.tournamentId || "",
      code: team.code || "",
      name: team.name || "",
      colorPrimary: team.colorPrimary || "#dc2626",
      colorAccent: team.colorAccent || "#111111"
    });
    setMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingId("");
    setForm({
      ...emptyForm,
      tournamentId: tournaments[0]?.id || ""
    });
    setIsModalOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = buildPayload(form);
      let successMessage;

      if (editingId) {
        await httpClient.put(`/teams/${editingId}`, payload);
        successMessage = "Equipo actualizado correctamente";
      } else {
        await httpClient.post("/teams", payload);
        successMessage = "Equipo creado correctamente";
      }

      closeModal();
      await loadTeams();
      setMessage(successMessage);
      setMessageType("success");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(team) {
    if (!window.confirm(`Eliminar equipo ${team.name}?`)) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await httpClient.delete(`/teams/${team.id}`);
      await loadTeams();
      setMessage("Equipo eliminado correctamente");
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
          <h1>Equipos</h1>
          <p>{items.length} equipo(s)</p>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" onClick={startCreate} disabled={!canManage || !tournaments.length}>
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
        <div className="crud-filter">
          <label>
            <span>Torneo</span>
            <select value={tournamentFilter} onChange={(event) => setTournamentFilter(event.target.value)}>
              <option value="">Todos</option>
              {tournaments.map((tournament) => (
                <option value={tournament.id} key={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {message ? <p className={messageType === "error" ? "form-error" : "form-success"}>{message}</p> : null}
      </section>

      <section className="entity-list">
        {items.map((team) => (
          <article className="entity-row" key={team.id}>
            <div className="team-title">
              <span
                className="team-swatch"
                style={{ background: team.colorPrimary || "#dc2626", borderColor: team.colorAccent || "#111111" }}
              />
              <div>
                <strong>{team.name}</strong>
                <span>{team.code} | {team.tournament?.name || "Sin torneo"}</span>
                <small>{team._count?.players || 0} jugador(es)</small>
              </div>
            </div>
            <div className="entity-actions">
              <button type="button" className="icon-button bordered" onClick={() => startEdit(team)} title="Editar">
                <Pencil size={17} />
              </button>
              <button type="button" className="icon-button danger" onClick={() => handleDelete(team)} title="Eliminar">
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
        {!items.length && !loading ? (
          <div className="empty-state">
            <h2>Sin equipos</h2>
            <p>No hay equipos registrados para el filtro actual.</p>
          </div>
        ) : null}
      </section>

      <Modal open={isModalOpen} title={editingId ? "Editar equipo" : "Nuevo equipo"} onClose={closeModal}>
        <form className="crud-form modal-form" onSubmit={handleSubmit}>
          <label className="wide-field">
            <span>Torneo</span>
            <select name="tournamentId" value={form.tournamentId} onChange={updateField} required>
              <option value="">Seleccionar</option>
              {activeTournamentOptions.map((tournament) => (
                <option value={tournament.id} key={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Codigo</span>
            <input name="code" value={form.code} onChange={updateField} required minLength={2} />
          </label>
          <label>
            <span>Nombre</span>
            <input name="name" value={form.name} onChange={updateField} required minLength={2} />
          </label>
          <label>
            <span>Principal</span>
            <input type="color" name="colorPrimary" value={form.colorPrimary} onChange={updateField} />
          </label>
          <label>
            <span>Acento</span>
            <input type="color" name="colorAccent" value={form.colorAccent} onChange={updateField} />
          </label>
          <div className="crud-actions">
            <button className="primary-button" type="submit" disabled={!canManage || saving || !form.tournamentId}>
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
