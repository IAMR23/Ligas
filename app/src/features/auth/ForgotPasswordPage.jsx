import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await requestPasswordReset({ email });
      setMessage(response.message);
    } catch (nextError) {
      setError(nextError.response?.data?.message || "No se pudo enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <p className="eyebrow">Acceso</p>
        <h1>Recuperar</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Correo</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Volver a login</Link>
        </div>
      </section>
    </main>
  );
}
