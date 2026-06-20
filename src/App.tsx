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
import Appointments from './pages/member/Appointments';
import ClinicInfo from './pages/member/ClinicInfo';
import Consultations from './pages/member/Consultations';
import DebitOrders from './pages/member/DebitOrders';
import Dependants from './pages/member/Dependants';
import KYC from './pages/member/KYC';
import MyCard from './pages/member/MyCard';
import Payments from './pages/member/Payments';
import Profile from './pages/member/Profile';
import Statement from './pages/member/Statement';
import UpgradePlan from './pages/member/UpgradePlan';
import StaffDashboard from './pages/staff/StaffDashboard';
import VerifyMember from './pages/staff/VerifyMember';
import ApplicationsList from './pages/staff/ApplicationsList';
import AppointmentsList from './pages/staff/AppointmentsList';
import ConsultationsList from './pages/staff/ConsultationsList';
import MedicationRegister from './pages/staff/MedicationRegister';
import PeakHours from './pages/staff/PeakHours';
import StaffProfile from './pages/staff/StaffProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';
import AdminApplications from './pages/admin/AdminApplications';
import AdminOnboarding from './pages/admin/AdminOnboarding';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminSystemUsers from './pages/admin/AdminSystemUsers';
import AdminDebitOrders from './pages/admin/AdminDebitOrders';
import AdminMandates from './pages/admin/AdminMandates';
import AdminReconciliation from './pages/admin/AdminReconciliation';
import AdminPlanChanges from './pages/admin/AdminPlanChanges';
import AdminKYC from './pages/admin/AdminKYC';
import AdminPOPIA from './pages/admin/AdminPOPIA';
import AdminAgreements from './pages/admin/AdminAgreements';
import AdminAuditLog from './pages/admin/AdminAuditLog';
import AdminCards from './pages/admin/AdminCards';
import AdminCardsGallery from './pages/admin/AdminCardsGallery';
import AdminCrossSell from './pages/admin/AdminCrossSell';
import AdminRetention from './pages/admin/AdminRetention';
import AdminReports from './pages/admin/AdminReports';
import AdminIntegrations from './pages/admin/AdminIntegrations';
import AdminSettings from './pages/admin/AdminSettings';

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
                <Route path="card" element={<MyCard />} />
                <Route path="consultations" element={<Consultations />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="dependants" element={<Dependants />} />
                <Route path="debits" element={<DebitOrders />} />
                <Route path="payments" element={<Payments />} />
                <Route path="upgrade" element={<UpgradePlan />} />
                <Route path="statement" element={<Statement />} />
                <Route path="kyc" element={<KYC />} />
                <Route path="clinic-info" element={<ClinicInfo />} />
                <Route path="profile" element={<Profile />} />
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
                <Route path="members" element={<AdminMembers />} />
                <Route path="applications" element={<AdminApplications />} />
                <Route path="onboarding" element={<AdminOnboarding />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="system-users" element={<AdminSystemUsers />} />
                <Route path="debit-orders" element={<AdminDebitOrders />} />
                <Route path="mandates" element={<AdminMandates />} />
                <Route path="reconciliation" element={<AdminReconciliation />} />
                <Route path="plan-changes" element={<AdminPlanChanges />} />
                <Route path="kyc" element={<AdminKYC />} />
                <Route path="popia" element={<AdminPOPIA />} />
                <Route path="agreements" element={<AdminAgreements />} />
                <Route path="audit" element={<AdminAuditLog />} />
                <Route path="cards" element={<AdminCards />} />
                <Route path="cards-gallery" element={<AdminCardsGallery />} />
                <Route path="cross-sell" element={<AdminCrossSell />} />
                <Route path="retention" element={<AdminRetention />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="integrations" element={<AdminIntegrations />} />
                <Route path="settings" element={<AdminSettings />} />
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

