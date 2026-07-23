import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { httpClient } from "../../shared/api/httpClient";
import { Modal } from "../../shared/components/Modal";

const emptyForm = {
  code: "",
  name: "",
  description: "",
  status: "BORRADOR",
  startDate: "",
  endDate: ""
};

const statuses = ["BORRADOR", "ACTIVO", "FINALIZADO", "CANCELADO"];

function getErrorMessage(error) {
  return error.response?.data?.message || "No se pudo completar la operacion";
}

function formatDate(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "-";
}

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function buildPayload(form) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    status: form.status,
    startDate: form.startDate || null,
    endDate: form.endDate || null
  };
}

export function TournamentsPage() {
  const { roles } = useAuth();
  const canManage = roles.includes("ADMIN") || roles.includes("SUPER_USUARIO");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function loadTournaments() {
    setLoading(true);
    setMessage("");

    try {
      const response = await httpClient.get("/tournaments", {
        params: statusFilter ? { status: statusFilter } : {}
      });
      setItems(response.data.data.tournaments || []);
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTournaments();
  }, [statusFilter]);

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

  function startEdit(tournament) {
    setEditingId(tournament.id);
    setForm({
      code: tournament.code || "",
      name: tournament.name || "",
      description: tournament.description || "",
      status: tournament.status || "BORRADOR",
      startDate: toDateInput(tournament.startDate),
      endDate: toDateInput(tournament.endDate)
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
      const payload = buildPayload(form);
      let successMessage;

      if (editingId) {
        await httpClient.put(`/tournaments/${editingId}`, payload);
        successMessage = "Torneo actualizado correctamente";
      } else {
        await httpClient.post("/tournaments", payload);
        successMessage = "Torneo creado correctamente";
      }

      closeModal();
      await loadTournaments();
      setMessage(successMessage);
      setMessageType("success");
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tournament) {
    if (!window.confirm(`Eliminar torneo ${tournament.name}?`)) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await httpClient.delete(`/tournaments/${tournament.id}`);
      await loadTournaments();
      setMessage("Torneo eliminado correctamente");
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
          <h1>Torneos</h1>
          <p>{items.length} torneo(s)</p>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" onClick={startCreate} disabled={!canManage}>
            <Plus size={18} />
            Nuevo
          </button>
          <button className="secondary-button" type="button" onClick={loadTournaments} disabled={loading}>
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="crud-workbench compact">
        <div className="crud-filter">
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
        {items.map((tournament) => (
          <article className="entity-row" key={tournament.id}>
            <div>
              <strong>{tournament.name}</strong>
              <span>{tournament.code} | {tournament.status}</span>
              <small>
                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
              </small>
            </div>
            <div className="entity-meta">
              <span>{tournament._count?.teams || 0} equipos</span>
              <span>{tournament._count?.matches || 0} partidos</span>
            </div>
            <div className="entity-actions">
              <button type="button" className="icon-button bordered" onClick={() => startEdit(tournament)} title="Editar">
                <Pencil size={17} />
              </button>
              <button type="button" className="icon-button danger" onClick={() => handleDelete(tournament)} title="Eliminar">
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
        {!items.length && !loading ? (
          <div className="empty-state">
            <h2>Sin torneos</h2>
            <p>No hay torneos registrados.</p>
          </div>
        ) : null}
      </section>

      <Modal open={isModalOpen} title={editingId ? "Editar torneo" : "Nuevo torneo"} onClose={closeModal}>
        <form className="crud-form modal-form" onSubmit={handleSubmit}>
          <label>
            <span>Codigo</span>
            <input name="code" value={form.code} onChange={updateField} required minLength={2} />
          </label>
          <label>
            <span>Nombre</span>
            <input name="name" value={form.name} onChange={updateField} required minLength={3} />
          </label>
          <label>
            <span>Estado</span>
            <select name="status" value={form.status} onChange={updateField}>
              {statuses.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Inicio</span>
            <input type="date" name="startDate" value={form.startDate} onChange={updateField} />
          </label>
          <label>
            <span>Fin</span>
            <input type="date" name="endDate" value={form.endDate} onChange={updateField} />
          </label>
          <label className="wide-field">
            <span>Descripcion</span>
            <textarea name="description" value={form.description} onChange={updateField} rows={3} />
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
