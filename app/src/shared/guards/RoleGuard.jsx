import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";

export function RoleGuard({ allowedRoles = [] }) {
  const { roles } = useAuth();
  const canAccess = roles.includes("SUPER_USUARIO") || allowedRoles.some((role) => roles.includes(role));

  return canAccess ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
