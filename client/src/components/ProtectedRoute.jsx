import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role }) {
  const { user, profile } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
