import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}) {
  const { session, role, carregando } = useAuth()
  const location = useLocation()

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    const returnTo = encodeURIComponent(
      location.pathname + location.search
    )

    return (
      <Navigate
        to={`${redirectTo}?returnTo=${returnTo}`}
        replace
      />
    )
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    if (role === 'parceiro') {
      return <Navigate to="/parceiro/painel" replace />
    }

    return <Navigate to="/" replace />
  }

  return children
}