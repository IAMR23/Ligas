import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (nextError) {
      setError(nextError.response?.data?.detail || nextError.response?.data?.message || "No se pudo registrar");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel wide">
        <p className="eyebrow">Cuenta publica</p>
        <h1>Registro</h1>
        <form className="auth-form two-column" onSubmit={handleSubmit}>
          <label>
            <span>Nombre completo</span>
            <input name="fullName" value={form.fullName} onChange={updateField} required />
          </label>
          <label>
            <span>Usuario</span>
            <input name="username" value={form.username} onChange={updateField} required />
          </label>
          <label>
            <span>Correo</span>
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            <span>Contrasena</span>
            <input name="password" type="password" value={form.password} onChange={updateField} required />
          </label>
          <label>
            <span>Confirmar contrasena</span>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required />
          </label>
          {error ? <p className="form-error full-row">{error}</p> : null}
          <button className="primary-button full-row" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Ya tengo cuenta</Link>
        </div>
      </section>
    </main>
  );
}
