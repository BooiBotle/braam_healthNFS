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
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage';

// Layout & Protected Route
import PortalLayout from './layouts/PortalLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Dashboards
import MemberDashboard from './pages/member/MemberDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import VerifyMember from './pages/staff/VerifyMember';
import ApplicationsList from './pages/staff/ApplicationsList';
import AppointmentsList from './pages/staff/AppointmentsList';
import ConsultationsList from './pages/staff/ConsultationsList';
import MedicationRegister from './pages/staff/MedicationRegister';
import PeakHours from './pages/staff/PeakHours';
import StaffProfile from './pages/staff/StaffProfile';
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />

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
                <Route path="verify" element={<VerifyMember />} />
                <Route path="applications" element={<ApplicationsList />} />
                <Route path="appointments" element={<AppointmentsList />} />
                <Route path="consultations" element={<ConsultationsList />} />
                <Route path="medication" element={<MedicationRegister />} />
                <Route path="peak-hours" element={<PeakHours />} />
                <Route path="profile" element={<StaffProfile />} />
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

