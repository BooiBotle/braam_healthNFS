import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2, ArrowLeft, ArrowRight, Check, MapPin, 
  Phone, Mail, Clock, Save, ShieldCheck, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getClinicById, createClinic, updateClinic } from '../../lib/api/clinics';

const SuperAdminClinicForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    suburb: '',
    city: 'Johannesburg',
    province: 'Gauteng',
    postal_code: '',
    phone: '',
    email: '',
    doctor_name: '',
    open_24h: false,
    is_active: true
  });

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      getClinicById(id).then(c => {
        if (c) {
          setFormData({
            name: c.name || '',
            address_line1: c.address_line1 || '',
            address_line2: c.address_line2 || '',
            suburb: c.suburb || '',
            city: c.city || 'Johannesburg',
            province: c.province || 'Gauteng',
            postal_code: c.postal_code || '',
            phone: c.phone || '',
            email: c.email || '',
            doctor_name: c.doctor_name || '',
            open_24h: c.open_24h || false,
            is_active: c.is_active ?? true
          });
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateClinic(id, formData);
      } else {
        await createClinic(formData);
      }
      navigate('/super-admin/clinics');
    } catch (err) {
      console.error('Error saving clinic:', err);
      alert('Failed to save clinic details.');
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

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: textColor }}>Loading clinic details...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto', color: textColor }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/super-admin/clinics')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'none', border: 'none', color: '#c9a033',
          fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Clinics Catalog
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: textColor, margin: 0 }}>
            {isEdit ? 'Edit Clinic Facility' : 'Step-by-Step Clinic Setup'}
          </h1>
          <p style={{ color: mutedText, fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Complete the 4-step wizard to register or update clinic branch parameters.
          </p>
        </div>
      </div>

      {/* Step Stepper Indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[
          { num: 1, label: 'Facility Name & Doctor' },
          { num: 2, label: 'Contact Parameters' },
          { num: 3, label: 'Location & Operating Hours' },
          { num: 4, label: 'Review & Confirm' }
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

      {/* Form Container */}
      <div style={{ background: cardBg, backdropFilter: 'blur(20px)', borderRadius: '20px', border: cardBorder, padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        {/* Step 1: Basic Identity */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: textColor, margin: 0 }}>Step 1: Facility Identity & Medical Lead</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Clinic Branch Name</label>
              <input 
                type="text" required placeholder="e.g. Braam Health Centre NFS"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Head Medical Doctor / Practitioner</label>
              <input 
                type="text" required placeholder="e.g. Dr M J Diago"
                value={formData.doctor_name} onChange={e => setFormData({ ...formData, doctor_name: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="button" onClick={() => setStep(2)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#c9a033', color: '#1c2340', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Next Step: Contact Parameters <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: textColor, margin: 0 }}>Step 2: Clinic Contact Parameters</h2>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Clinic Reception Phone</label>
                <input 
                  type="tel" placeholder="011 000 0000"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Official Email Address</label>
                <input 
                  type="email" placeholder="info@clinic.co.za"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button 
                type="button" onClick={() => setStep(1)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'transparent', border: inputBorder, color: textColor, fontWeight: 600, cursor: 'pointer' }}
              >
                Previous Step
              </button>
              <button 
                type="button" onClick={() => setStep(3)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#c9a033', color: '#1c2340', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Next Step: Location & Hours <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location & Hours */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: textColor, margin: 0 }}>Step 3: Location & Operating Hours</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Physical Address Line 1</label>
              <input 
                type="text" placeholder="Street number & name"
                value={formData.address_line1} onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>Suburb / Area</label>
                <input 
                  type="text" placeholder="e.g. Braamfontein"
                  value={formData.suburb} onChange={e => setFormData({ ...formData, suburb: e.target.value })}
                  style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', color: mutedText, fontWeight: 600 }}>City</label>
                <input 
                  type="text" placeholder="e.g. Johannesburg"
                  value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                  style={{ padding: '0.75rem', borderRadius: '8px', background: inputBg, border: inputBorder, color: textColor, fontSize: '0.9375rem' }}
                />
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: inputBorder, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: textColor }}>24/7 Facility Operation</div>
                <div style={{ fontSize: '0.75rem', color: mutedText }}>Is this clinic open 24 hours a day?</div>
              </div>
              <input 
                type="checkbox" checked={formData.open_24h} onChange={e => setFormData({ ...formData, open_24h: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#c9a033' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button 
                type="button" onClick={() => setStep(2)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'transparent', border: inputBorder, color: textColor, fontWeight: 600, cursor: 'pointer' }}
              >
                Previous Step
              </button>
              <button 
                type="button" onClick={() => setStep(4)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#c9a033', color: '#1c2340', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Review Summary <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: textColor, margin: 0 }}>Step 4: Review & Save Clinic Branch</h2>

            <div style={{ padding: '1.25rem', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: inputBorder, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>Clinic Name:</span>
                <strong style={{ color: textColor }}>{formData.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>Doctor / Lead:</span>
                <strong style={{ color: textColor }}>Dr. {formData.doctor_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>Contact Phone:</span>
                <strong style={{ color: textColor }}>{formData.phone || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>Email:</span>
                <strong style={{ color: textColor }}>{formData.email || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>Location:</span>
                <strong style={{ color: textColor }}>{formData.address_line1}, {formData.suburb}, {formData.city}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: mutedText }}>24/7 Service:</span>
                <strong style={{ color: '#c9a033' }}>{formData.open_24h ? 'YES (24/7)' : 'NO'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button 
                type="button" onClick={() => setStep(3)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'transparent', border: inputBorder, color: textColor, fontWeight: 600, cursor: 'pointer' }}
              >
                Back to Edit
              </button>
              <button 
                type="submit" disabled={saving}
                style={{ padding: '0.75rem 2rem', borderRadius: '10px', background: 'linear-gradient(135deg, #c9a033 0%, #b38d2a 100%)', color: '#1c2340', fontWeight: 800, fontSize: '0.9375rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {saving ? 'Saving Clinic...' : <><Save size={18} /> Confirm & Publish Clinic</>}
              </button>
            </div>
          </form>
        )}

      </div>

    </motion.div>
  );
};

export default SuperAdminClinicForm;
