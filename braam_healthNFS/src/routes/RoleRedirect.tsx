import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRedirect() {
  const { profile, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (profile?.role === 'staff') return <Navigate to="/staff/dashboard" replace />
  return <Navigate to="/member/dashboard" replace />
}