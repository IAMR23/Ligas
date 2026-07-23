import { AlertTriangle, CalendarDays, ClipboardList, DatabaseZap, Home, LogIn, LogOut, Shield, Trophy, UsersRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useOffline } from "../../app/providers/OfflineProvider";

const navItems = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/tournaments", label: "Torneos", icon: Trophy },
  { to: "/teams", label: "Equipos", icon: UsersRound },
  { to: "/players", label: "Jugadores", icon: Shield },
  { to: "/matches", label: "Partidos", icon: CalendarDays },
  { to: "/reports", label: "Reportes", icon: ClipboardList }
];

export function AppLayout() {
  const { user, roles, logout } = useAuth();
  const { isOnline, pendingCount } = useOffline();
  const navigate = useNavigate();
  const isSuperUser = roles.includes("SUPER_USUARIO");

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">LF</span>
          <div>
            <strong>LigaFutbol</strong>
            <small>{roles[0] || "PUBLICO"}</small>
          </div>
        </div>

        <nav className="side-nav" aria-label="Principal">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          {isSuperUser ? (
            <>
              <NavLink to="/logs/audit">
                <Shield size={18} />
                <span>Auditoria</span>
              </NavLink>
              <NavLink to="/logs/login">
                <LogIn size={18} />
                <span>Ingresos</span>
              </NavLink>
              <NavLink to="/logs/sync">
                <DatabaseZap size={18} />
                <span>Sync logs</span>
              </NavLink>
              <NavLink to="/logs/errors">
                <AlertTriangle size={18} />
                <span>Errores</span>
              </NavLink>
            </>
          ) : null}
        </nav>

        <button className="logout-button" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="topbar-label">Sesion activa</span>
            <strong>{user?.fullName || user?.username || "Usuario"}</strong>
          </div>
          <div className="topbar-actions">
            <NavLink className={isOnline ? "sync-pill" : "sync-pill offline"} to="/sync">
              {isOnline ? "Online" : "Offline"}
              {pendingCount ? ` | ${pendingCount}` : ""}
            </NavLink>
            <button className="topbar-logout" type="button" onClick={handleLogout} title="Salir">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
