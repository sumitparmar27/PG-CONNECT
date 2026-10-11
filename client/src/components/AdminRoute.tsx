import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasAnyAdminAccess } from '../constants/permissions'

export function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!hasAnyAdminAccess(user.permissions)) return <Navigate to="/" replace />

  return <Outlet />
}
