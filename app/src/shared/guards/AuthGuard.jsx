import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";

export function AuthGuard() {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return <main className="screen-center">Cargando...</main>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
