import { CalendarDays, ClipboardList, RefreshCw, Shield, Trophy, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useOffline } from "../../app/providers/OfflineProvider";
import { httpClient } from "../../shared/api/httpClient";

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
  const { isOnline, pendingCount } = useOffline();
  const [stats, setStats] = useState({
    activeTournaments: [],
    inPlayMatches: [],
    upcomingMatches: [],
    teams: []
  });
  const isSuperUser = roles.includes("SUPER_USUARIO");
  const visibleModules = isSuperUser
    ? [...modules, { to: "/logs/audit", title: "Logs", detail: "Ingresos y auditoria.", icon: Shield }]
    : modules;
  const todayMatches = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return stats.upcomingMatches.filter((match) => match.scheduledAt && new Date(match.scheduledAt).toISOString().slice(0, 10) === today);
  }, [stats.upcomingMatches]);

  useEffect(() => {
    async function loadDashboard() {
      const [tournamentsResponse, inPlayResponse, upcomingResponse, teamsResponse] = await Promise.all([
        httpClient.get("/tournaments", { params: { status: "ACTIVO", limit: 100 } }),
        httpClient.get("/matches", { params: { status: "EN_JUEGO", limit: 100 } }),
        httpClient.get("/matches", { params: { status: "PROGRAMADO", limit: 100 } }),
        httpClient.get("/teams", { params: { limit: 100 } })
      ]);

      setStats({
        activeTournaments: tournamentsResponse.data.data.tournaments || [],
        inPlayMatches: inPlayResponse.data.data.matches || [],
        upcomingMatches: upcomingResponse.data.data.matches || [],
        teams: teamsResponse.data.data.teams || []
      });
    }

    loadDashboard().catch(() => {});
  }, []);

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

      <section className="metric-strip">
        <div>
          <strong>{stats.activeTournaments.length}</strong>
          <span>Campeonatos activos</span>
        </div>
        <div>
          <strong>{todayMatches.length}</strong>
          <span>Partidos de hoy</span>
        </div>
        <div>
          <strong>{stats.inPlayMatches.length}</strong>
          <span>En juego</span>
        </div>
        <div>
          <strong>{stats.teams.length}</strong>
          <span>Equipos registrados</span>
        </div>
      </section>

      <section className="detail-grid">
        <article className="detail-panel">
          <CalendarDays size={22} />
          <strong>Proximos partidos</strong>
          {stats.upcomingMatches.slice(0, 5).map((match) => (
            <Link to={`/matches/${match.id}`} key={match.id}>
              {match.homeTeam?.name} vs {match.awayTeam?.name}
            </Link>
          ))}
          {!stats.upcomingMatches.length ? <span>Sin partidos programados</span> : null}
        </article>
        <article className="detail-panel">
          <RefreshCw size={22} />
          <strong>{isOnline ? "Sincronizacion activa" : "Modo offline"}</strong>
          <span>{pendingCount ? `${pendingCount} item(s) pendientes` : "Cola local sin pendientes"}</span>
        </article>
      </section>

      <section className="module-grid">
        <Link className="module-card sync-card" to="/sync">
          <RefreshCw size={22} />
          <strong>{isOnline ? "Sincronizacion activa" : "Modo offline"}</strong>
          <span>{pendingCount ? `${pendingCount} item(s) pendientes` : "Cola local sin pendientes"}</span>
        </Link>
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
