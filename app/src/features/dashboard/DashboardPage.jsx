import { CalendarDays, ClipboardList, RefreshCw, Shield, Trophy, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";

const modules = [
  { to: "/tournaments", title: "Torneos", detail: "Crear y administrar campeonatos.", icon: Trophy },
  { to: "/teams", title: "Equipos", detail: "Planteles, colores y categorias.", icon: UsersRound },
  { to: "/players", title: "Jugadores", detail: "Fichas y asignacion a equipos.", icon: Shield },
  { to: "/matches", title: "Partidos", detail: "Programacion, inicio y cierre.", icon: CalendarDays },
  { to: "/reports", title: "Reportes", detail: "PDF, Excel y auditoria.", icon: ClipboardList },
  { to: "/sync", title: "Sync", detail: "Cola offline y conflictos.", icon: RefreshCw }
];

export function DashboardPage() {
  const { user, roles } = useAuth();
  const isSuperUser = roles.includes("SUPER_USUARIO");
  const visibleModules = isSuperUser
    ? [...modules, { to: "/logs/audit", title: "Logs", detail: "Ingresos y auditoria.", icon: Shield }]
    : modules;

  return (
    <main className="content-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{user?.fullName || "LigaFutbol"}</h1>
          <p>{roles.join(", ") || "PUBLICO"}</p>
        </div>
        <div className="hero-metric">
          <strong>{visibleModules.length}</strong>
          <span>modulos</span>
        </div>
      </section>

      <section className="module-grid">
        {visibleModules.map((module) => (
          <Link className="module-card" to={module.to} key={module.to}>
            <module.icon size={22} />
            <strong>{module.title}</strong>
            <span>{module.detail}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
