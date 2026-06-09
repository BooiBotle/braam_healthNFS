import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ContactPage from './pages/public/ContactPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import PlansPage from './pages/public/PlansPage';
import PopiaPage from './pages/public/PopiaPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ApplyPage from './pages/auth/ApplyPage';

// Layout & Protected Route
import PortalLayout from './layouts/PortalLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Dashboards
import MemberDashboard from './pages/member/MemberDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/popia" element={<PopiaPage />} />
            <Route path="/plans" element={<PlansPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/apply" element={<ApplyPage />} />

            {/* Member Portal */}
            <Route path="/member" element={<ProtectedRoute allowedRoles={['member']} />}>
              <Route element={<PortalLayout />}>
                <Route index element={<MemberDashboard />} />
                {/* Other member routes would go here */}
                <Route path="*" element={<Navigate to="/member" replace />} />
              </Route>
            </Route>

            {/* Staff Portal */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route element={<PortalLayout />}>
                <Route index element={<StaffDashboard />} />
                {/* Other staff routes would go here */}
                <Route path="*" element={<Navigate to="/staff" replace />} />
              </Route>
            </Route>

            {/* Admin Portal */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<PortalLayout />}>
                <Route index element={<AdminDashboard />} />
                {/* Other admin routes would go here */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
