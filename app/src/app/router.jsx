import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardPage } from "../features/dashboard/DashboardPage.jsx";
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage.jsx";
import { LoginPage } from "../features/auth/LoginPage.jsx";
import { OnboardingPage } from "../features/onboarding/OnboardingPage.jsx";
import { RegisterPage } from "../features/auth/RegisterPage.jsx";
import { ModulePage } from "../shared/components/ModulePage.jsx";
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
          { path: "/tournaments", element: <ModulePage title="Torneos" description="Gestion de torneos y temporadas." /> },
          { path: "/teams", element: <ModulePage title="Equipos" description="Administracion de equipos por torneo." /> },
          { path: "/players", element: <ModulePage title="Jugadores" description="Fichas, documentos y equipos." /> },
          { path: "/matches", element: <ModulePage title="Partidos" description="Calendario, inicio y cierre de partidos." /> },
          { path: "/matches/:id", element: <ModulePage title="Detalle de partido" description="Resumen operativo del partido." /> },
          { path: "/matches/:id/events", element: <ModulePage title="Eventos del partido" description="Goles, tarjetas y sustituciones." /> },
          { path: "/matches/:id/vocalia", element: <ModulePage title="Vocalia" description="Registro de vocalia del partido." /> },
          { path: "/standings", element: <ModulePage title="Tabla de posiciones" description="Puntos, goles y rendimiento." /> },
          { path: "/reports", element: <ModulePage title="Libreria de Reportes" description="Exportaciones PDF y Excel." /> },
          { path: "/sync", element: <ModulePage title="Sincronizacion" description="Cola offline y conflictos pendientes." /> },
          {
            element: <RoleGuard allowedRoles={["SUPER_USUARIO"]} />,
            children: [
              { path: "/logs/audit", element: <ModulePage title="Auditoria" description="Cambios registrados en el sistema." /> },
              { path: "/logs/login", element: <ModulePage title="Logs de ingreso" description="Inicios exitosos y fallidos." /> }
            ]
          }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> }
]);
