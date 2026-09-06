import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({
  children,
  requiredRole = null
}) {
  const {
    user,
    profile,
    loading
  } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile?.activo) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && profile?.rol !== requiredRole) {
    return <Navigate to="/oli" replace />
  }

  return children
}

export default ProtectedRoute
