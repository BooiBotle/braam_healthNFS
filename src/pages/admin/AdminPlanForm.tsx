import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Activity, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getClinicPlans, saveClinicPlan } from '../../lib/api/clinics';

const AdminPlanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    monthly_fee_cents: 25000,
    consultations_pm: 4,
    includes_chronic: true,
    prescribed_meds_covered: true,
    open_24h_access: true,
    is_active: true
  });

  useEffect(() => {
    if (isEdit && id && user?.clinicId) {
      getClinicPlans(user.clinicId).then((plans: any[]) => {
        const found = plans.find((p: any) => p.id === id);
        if (found) setFormData(found);
      });
    }
  }, [id, isEdit, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (user?.clinicId) {
        await saveClinicPlan({
          ...formData,
          clinic_id: user.clinicId
        });
      }
      navigate('/admin/plans');
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const cardBg = isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff';
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0';
  const textColor = isDark ? '#ffffff' : '#0f172a';
  const mutedText = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1';

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto', color: textColor }}>
      
      <button 
        onClick={() => navigate('/admin/plans')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'none', border: 'none', color: '#c9a033',
          fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Clinic Plans
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'Outfit', color: textColor, margin: 0 }}>
            {isEdit ? 'Edit Membership Plan' : 'Step-by-Step Clinic Plan Creator'}
          </h1>
          <p style={{ color: mutedText, fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Set pricing, monthly consultation allowances, and chronic care coverage.
          </p>
        </div>

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
      </div>

      {/* Stepper Header */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[
          { num: 1, label: 'Plan Name & Pricing' },
          { num: 2, label: 'Consultation & Medication' },
          { num: 3, label: 'Review & Publish' }
        ].map(s => (
          <div 
            key={s.num}
            onClick={() => setStep(s.num)}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '12px', cursor: 'pointer',
              background: step === s.num ? (isDark ? 'rgba(201,160,51,0.2)' : '#fef9c3') : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
              border: step === s.num ? '1px solid #c9a033' : cardBorder,
              color: step === s.num ? '#c9a033' : mutedText,
              textAlign: 'center', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>STEP {s.num}</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: step === s.num ? textColor : mutedText, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: cardBg, backdropFilter: 'blur(20px)', borderRadius: '20px', border: cardBorder, padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: textColor, margin: 0 }}>Step 1: Plan Title & Monthly Premium</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Plan Name</label>
              <input 
                type="text" required placeholder="e.g. Executive Primary Care Plan"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Monthly Fee (ZAR)</label>
              <input 
                type="number" required placeholder="250"
                value={formData.monthly_fee_cents / 100} 
                onChange={e => setFormData({ ...formData, monthly_fee_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Plan Description</label>
              <textarea 
                rows={3} placeholder="Brief summary of plan benefits..."
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="button" onClick={() => setStep(2)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#c9a033', color: '#1c2340', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Next: Benefits & Limits <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: textColor, margin: 0 }}>Step 2: Consultation & Coverage Allowances</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Monthly Doctor Consultations Limit</label>
              <input 
                type="number" required min={1} max={30}
                value={formData.consultations_pm} onChange={e => setFormData({ ...formData, consultations_pm: parseInt(e.target.value || '1') })}
                style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: textColor, fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.includes_chronic} onChange={e => setFormData({ ...formData, includes_chronic: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#c9a033' }} />
                Includes Chronic Care & Management
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: textColor, fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.prescribed_meds_covered} onChange={e => setFormData({ ...formData, prescribed_meds_covered: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#c9a033' }} />
                Includes Prescribed Medication Formulary
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: textColor, fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.open_24h_access} onChange={e => setFormData({ ...formData, open_24h_access: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#c9a033' }} />
                Includes 24/7 Facility Access
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep(1)} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'transparent', border: inputBorder, color: textColor, fontWeight: 600, cursor: 'pointer' }}>Previous</button>
              <button type="button" onClick={() => setStep(3)} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#c9a033', color: '#1c2340', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Review <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: textColor, margin: 0 }}>Step 3: Review & Publish Plan</h2>

            <div style={{ padding: '1.25rem', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: inputBorder, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>Plan Name:</span>
                <strong style={{ color: textColor }}>{formData.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>Monthly Premium:</span>
                <strong style={{ color: '#c9a033' }}>R {(formData.monthly_fee_cents / 100).toFixed(2)} / month</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>Monthly Consultations:</span>
                <strong style={{ color: textColor }}>{formData.consultations_pm} visits / month</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep(2)} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'transparent', border: inputBorder, color: textColor, fontWeight: 600, cursor: 'pointer' }}>Back to Edit</button>
              <button type="submit" disabled={saving} style={{ padding: '0.75rem 2rem', borderRadius: '10px', background: '#1c2340', color: '#ffffff', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {saving ? 'Publishing...' : <><Save size={16} /> Publish Plan to Clinic</>}
              </button>
            </div>
          </form>
        )}

      </div>

    </motion.div>
  );
};

export default AdminPlanForm;
