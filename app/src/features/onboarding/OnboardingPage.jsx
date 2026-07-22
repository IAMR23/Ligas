import { BarChart3, FileDown, Goal, ShieldCheck, Trophy, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { label: "Torneos", icon: Trophy },
  { label: "Equipos", icon: ShieldCheck },
  { label: "Partidos", icon: Goal },
  { label: "Estadisticas", icon: BarChart3 },
  { label: "Reportes", icon: FileDown },
  { label: "Offline", icon: ShieldCheck }
];

export function OnboardingPage() {
  return (
    <main className="onboarding">
      <Link className="icon-login-link" to="/login" aria-label="Ir a login" title="Login">
        <UserRound size={22} />
      </Link>
      <section className="onboarding-content">
        <p className="eyebrow">PWA offline-first</p>
        <h1>LigaFutbol MVP</h1>
        <p>Gestion mobile-first para torneos, equipos, partidos, estadisticas, reportes y registro offline.</p>
        <div className="feature-strip" aria-label="Funcionalidades">
          {features.map((feature) => (
            <span key={feature.label}>
              <feature.icon size={17} />
              {feature.label}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
