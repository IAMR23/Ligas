import { Eye, LockKeyhole, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";

function getErrorMessage(error) {
  return error.response?.data?.detail || error.response?.data?.message || "No se pudo iniciar sesion";
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <p className="eyebrow">LigaFutbol MVP</p>
        <h1>Ingresar</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Usuario o correo</span>
            <div className="input-shell">
              <Mail size={18} />
              <input name="identifier" value={form.identifier} onChange={updateField} autoComplete="username" required />
            </div>
          </label>
          <label>
            <span>Contrasena</span>
            <div className="input-shell">
              <LockKeyhole size={18} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                autoComplete="current-password"
                required
              />
              <button type="button" className="icon-button" onClick={() => setShowPassword((value) => !value)} title="Ver">
                <Eye size={18} />
              </button>
            </div>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">Recuperar contrasena</Link>
          <Link to="/register">
            <UserPlus size={16} />
            Registrarse
          </Link>
        </div>
      </section>
    </main>
  );
}
