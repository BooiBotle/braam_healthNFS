import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Settings, Save, Building, FileText, Upload, ShieldCheck } from 'lucide-react';

const AdminSettings = () => {
  const { user } = useAuth();
  const [clinicConfig, setClinicConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Practice License');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, [user]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      if (user?.clinicId) {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', user.clinicId)
          .single();

        if (!error && data) {
          setClinicConfig(data);
          setLoading(false);
          return;
        }
      }

      // Fallback
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setClinicConfig(data || {});
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          name: clinicConfig.name,
          phone: clinicConfig.phone,
          email: clinicConfig.email,
          whatsapp: clinicConfig.whatsapp,
          address_line1: clinicConfig.address_line1,
          doctor_name: clinicConfig.doctor_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicConfig.id);

      if (error) throw error;
      setMessage('Clinic branch profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save clinic settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setMessage('Regulatory compliance document submitted for Super Admin review!');
      setDocFile(null);
      setTimeout(() => setMessage(''), 4000);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '850px' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Branch & Clinic Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Configure clinic operational details and submit regulatory compliance documentation.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Clinic Profile Form */}
        <div style={{ 
          background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '1.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Building size={20} color="#0f172a" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Branch Profile Details</h2>
          </div>

          {loading ? (
            <div style={{ color: '#64748b' }}>Loading branch details...</div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Clinic Name</label>
                  <input 
                    type="text" 
                    value={clinicConfig.name || ''} 
                    onChange={e => setClinicConfig({...clinicConfig, name: e.target.value})}
                    style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Head Doctor</label>
                  <input 
                    type="text" 
                    value={clinicConfig.doctor_name || ''} 
                    onChange={e => setClinicConfig({...clinicConfig, doctor_name: e.target.value})}
                    style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Support Email</label>
                  <input 
                    type="email" 
                    value={clinicConfig.email || ''} 
                    onChange={e => setClinicConfig({...clinicConfig, email: e.target.value})}
                    style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Phone Number</label>
                  <input 
                    type="text" 
                    value={clinicConfig.phone || ''} 
                    onChange={e => setClinicConfig({...clinicConfig, phone: e.target.value})}
                    style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Primary Address</label>
                <input 
                  type="text" 
                  value={clinicConfig.address_line1 || ''} 
                  onChange={e => setClinicConfig({...clinicConfig, address_line1: e.target.value})}
                  style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.875rem', color: message.includes('Failed') ? '#ef4444' : '#10b981', fontWeight: 500 }}>
                  {message}
                </div>
                <button 
                  type="submit"
                  disabled={saving}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.625rem 1.25rem', borderRadius: '8px', 
                    background: '#1c2340', color: '#ffffff', 
                    border: 'none', fontSize: '0.875rem', fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s'
                  }}
                >
                  {saving ? 'Saving...' : <><Save size={16} /> Save Branch Profile</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Regulatory Compliance Document Submission */}
        <div style={{ 
          background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '1.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <ShieldCheck size={20} color="#0f172a" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Clinic Regulatory Document Submission</h2>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Submit required medical permits and compliance licenses to the Super Admin for branch verification.</div>
            </div>
          </div>

          <form onSubmit={handleDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            <div className="grid-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Document Type</label>
                <select 
                  value={docType} onChange={e => setDocType(e.target.value)}
                  style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a' }}
                >
                  <option value="Practice License">Medical Practice License (HPCSA)</option>
                  <option value="Facility Accreditation">Facility Accreditation Cert</option>
                  <option value="POPIA Compliance">POPIA Compliance Statement</option>
                  <option value="Operating Permit">Operating & Safety Permit</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Attach Document (PDF / Image)</label>
                <input 
                  type="file" required onChange={e => setDocFile(e.target.files?.[0] || null)}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                type="submit" disabled={uploading}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  padding: '0.625rem 1.25rem', borderRadius: '8px', 
                  background: '#c9a033', color: '#1c2340', 
                  border: 'none', fontSize: '0.875rem', fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {uploading ? 'Submitting...' : <><Upload size={16} /> Submit to Super Admin</>}
              </button>
            </div>
          </form>
        </div>

      </div>
    </motion.div>
  );
};

export default AdminSettings;
