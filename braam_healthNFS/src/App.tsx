import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRedirect from './routes/RoleRedirect'
import LandingPage from './pages/public/LandingPage'
import Register from './pages/auth/Register'
import MemberDashboard from './pages/member/MemberDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import StaffDashboard from './pages/staff/StaffDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing — has sign-in built in */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />

          {/* Auto-redirect by role after login */}
          <Route path="/portal" element={<RoleRedirect />} />

          {/* Protected portals */}
          <Route path="/member/dashboard" element={
            <ProtectedRoute allowedRoles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

          <Route path="/unauthorized" element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#ef4444', fontSize: '20px' }}>
              ⛔ Access Denied
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
