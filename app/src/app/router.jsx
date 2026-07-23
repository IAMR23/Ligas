import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardPage } from "../features/dashboard/DashboardPage.jsx";
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage.jsx";
import { LoginPage } from "../features/auth/LoginPage.jsx";
import { LogsPage } from "../features/logs/LogsPage.jsx";
import { OnboardingPage } from "../features/onboarding/OnboardingPage.jsx";
import { PlayersPage } from "../features/players/PlayersPage.jsx";
import { ReportsPage } from "../features/reports/ReportsPage.jsx";
import { RegisterPage } from "../features/auth/RegisterPage.jsx";
import { TeamsPage } from "../features/teams/TeamsPage.jsx";
import { TournamentsPage } from "../features/tournaments/TournamentsPage.jsx";
import { ModulePage } from "../shared/components/ModulePage.jsx";
import { SyncPage } from "../features/sync/SyncPage.jsx";
import { AuthGuard } from "../shared/guards/AuthGuard.jsx";
import { RoleGuard } from "../shared/guards/RoleGuard.jsx";
import { AppLayout } from "../shared/layouts/AppLayout.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/onboarding" replace /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/tournaments", element: <TournamentsPage /> },
          { path: "/teams", element: <TeamsPage /> },
          { path: "/players", element: <PlayersPage /> },
          { path: "/matches", element: <ModulePage title="Partidos" description="Calendario, inicio y cierre de partidos." /> },
          { path: "/matches/:id", element: <ModulePage title="Detalle de partido" description="Resumen operativo del partido." /> },
          { path: "/matches/:id/events", element: <ModulePage title="Eventos del partido" description="Goles, tarjetas y sustituciones." /> },
          { path: "/matches/:id/vocalia", element: <ModulePage title="Vocalia" description="Registro de vocalia del partido." /> },
          { path: "/standings", element: <ModulePage title="Tabla de posiciones" description="Puntos, goles y rendimiento." /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/sync", element: <SyncPage /> },
          {
            element: <RoleGuard allowedRoles={["SUPER_USUARIO"]} />,
            children: [
              { path: "/logs/audit", element: <LogsPage type="audit" /> },
              { path: "/logs/login", element: <LogsPage type="login" /> },
              { path: "/logs/sync", element: <LogsPage type="sync" /> },
              { path: "/logs/errors", element: <LogsPage type="errors" /> }
            ]
          }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> }
]);
