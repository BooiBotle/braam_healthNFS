import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Activity, Plus, Edit, Check, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getClinicPlans, type Plan } from '../../lib/api/clinics';

const SuperAdminClinicPlans = () => {
  const navigate = useNavigate();
  const { id: clinicId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinicId) {
      loadPlans();
    }
  }, [clinicId]);

  const loadPlans = async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const data = await getClinicPlans(clinicId);
      setPlans(data);
    } catch (err) {
      console.error('Error loading clinic plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const textColor = isDark ? '#ffffff' : '#0f172a';
  const mutedText = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff';
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0';

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ color: textColor, maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/super-admin/clinics" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#c9a033', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Clinics
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'Outfit', color: textColor, margin: 0 }}>
            Manage Clinic <span style={{ color: '#c9a033' }}>Plans</span>
          </h1>
          <p style={{ color: mutedText, fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Configure membership packages and fees for this branch clinic.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
              color: textColor, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer'
            }}
          >
            {isDark ? <Sun size={16} color="#c9a033" /> : <Moon size={16} color="#1c2340" />}
            {isDark ? 'Light' : 'Dark'}
          </button>

          <button 
            onClick={() => navigate(`/super-admin/clinics/${clinicId}/plans/new`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem', borderRadius: '10px',
              background: '#1c2340', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem',
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Plus size={16} /> New Plan
          </button>
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem', color: mutedText }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Activity size={22} color="#c9a033" /></motion.div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Loading clinic plans...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {plans.length === 0 ? (
            <div style={{ padding: '2rem', background: cardBg, borderRadius: '12px', border: cardBorder, color: mutedText, gridColumn: '1/-1', textAlign: 'center' }}>
              No membership plans found for this clinic. Click "New Plan" above to create one.
            </div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} style={{ background: cardBg, borderRadius: '16px', border: cardBorder, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: textColor, margin: 0 }}>{plan.name}</h3>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c9a033', marginTop: '4px' }}>
                        R {(plan.monthly_fee_cents / 100).toFixed(2)} <span style={{ fontSize: '0.75rem', color: mutedText }}>/ month</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: plan.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: plan.is_active ? '#4ade80' : '#f87171' }}>
                      {plan.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: mutedText, marginBottom: '1rem', lineHeight: 1.5 }}>
                    {plan.description || 'Standard clinic care package.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: textColor }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="#10b981" /> {plan.consultations_pm} Doctor Consultations / month
                    </div>
                    {plan.includes_chronic && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={14} color="#10b981" /> Chronic Medication & Monitoring
                      </div>
                    )}
                    {plan.includes_medication && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={14} color="#10b981" /> Prescribed Medication Formulary
                      </div>
                    )}
                    {plan.includes_24h_access && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={14} color="#10b981" /> 24/7 Facility Access
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ paddingTop: '1rem', marginTop: '1.25rem', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => navigate(`/super-admin/clinics/${clinicId}/plans/edit/${plan.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: textColor, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Edit size={12} /> Edit Plan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SuperAdminClinicPlans;
