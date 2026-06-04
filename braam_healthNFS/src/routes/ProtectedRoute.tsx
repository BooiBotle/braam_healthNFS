import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  allowedRoles: ('member' | 'admin' | 'staff')[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { session, profile, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  if (!session) return <Navigate to="/login" replace />
  if (profile && !allowedRoles.includes(profile.role)) return <Navigate to="/unauthorized" replace />

  return <>{children}</>
}