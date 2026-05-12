import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}) {
  const { session, role, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rotaAtual = location.pathname + location.search;
  const returnTo = encodeURIComponent(rotaAtual);

  if (!session) {
    return <Navigate to={`${redirectTo}?returnTo=${returnTo}`} replace />;
  }

  const roleNormalizada = String(role || "").toLowerCase();

  if (!roleNormalizada) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(roleNormalizada)) {
    if (roleNormalizada === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (roleNormalizada === "parceiro") {
      return <Navigate to="/parceiro/painel" replace />;
    }

    if (roleNormalizada === "cliente") {
      return <Navigate to="/" replace />;
    }

    return <Navigate to={redirectTo} replace />;
  }

  return children;
}