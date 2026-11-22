import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DashboardRedirect() {
  const { profile } = useAuth()

  if (profile?.role === 'landlord') return <Navigate to="/landlord" replace />
  if (profile?.role === 'tenant') return <Navigate to="/tenant" replace />
  return <Navigate to="/" replace />
}
