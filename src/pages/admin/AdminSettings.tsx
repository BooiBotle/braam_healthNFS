import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Settings, Save, Globe, Building, MessageSquare, CreditCard } from 'lucide-react';

const AdminSettings = () => {
  const [clinicConfig, setClinicConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('slug', 'braam-health-centre')
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
        })
        .eq('id', clinicConfig.id);

      if (error) throw error;
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          System Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Configure clinic details and system preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Clinic Profile */}
        <div style={{ 
          background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '1.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Building size={20} color="#0f172a" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Clinic Profile</h2>
          </div>

          {loading ? (
            <div style={{ color: '#64748b' }}>Loading config...</div>
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
                  {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Integrations (Static for display) */}
        <div style={{ 
          background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '1.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Globe size={20} color="#0f172a" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Integrations</h2>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#0ea5e9" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>Netcash (NAEDO / DebiCheck)</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Connected to primary settlement account</div>
                </div>
              </div>
              <span style={{ padding: '0.25rem 0.625rem', background: '#f0fdf4', color: '#15803d', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={20} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>WhatsApp Business API</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Automated patient reminders</div>
                </div>
              </div>
              <span style={{ padding: '0.25rem 0.625rem', background: '#f0fdf4', color: '#15803d', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AdminSettings;
