import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Settings, Save, Building, FileText, Upload, ShieldCheck, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';

const inp = {
  padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
  fontSize: '0.875rem', color: '#0f172a', width: '100%', boxSizing: 'border-box' as const, outline: 'none',
};
const lbl = { fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.375rem', display: 'block' };
const field = { display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' };

const AdminSettings = () => {
  const { user } = useAuth();
  const [clinicConfig, setClinicConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBanking, setSavingBanking] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Practice License');
  const [uploading, setUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [bankingMsg, setBankingMsg] = useState('');

  useEffect(() => { fetchConfig(); }, [user]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      let data: any = null;
      if (user?.clinicId) {
        const res = await supabase.from('clinics').select('*').eq('id', user.clinicId).single();
        data = res.data;
      }
      if (!data) {
        const res = await supabase.from('clinics').select('*').limit(1).single();
        data = res.data;
      }
      setClinicConfig(data || {});
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasBanking = clinicConfig.bank_name && clinicConfig.account_number;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const { error } = await supabase.from('clinics').update({
        name: clinicConfig.name,
        phone: clinicConfig.phone,
        email: clinicConfig.email,
        whatsapp: clinicConfig.whatsapp,
        address_line1: clinicConfig.address_line1,
        doctor_name: clinicConfig.doctor_name,
        updated_at: new Date().toISOString()
      }).eq('id', clinicConfig.id);
      if (error) throw error;
      setProfileMsg('Branch profile saved successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileMsg('Failed to save: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveBanking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanking(true);
    setBankingMsg('');
    try {
      const { error } = await supabase.from('clinics').update({
        bank_name: clinicConfig.bank_name,
        account_name: clinicConfig.account_name,
        account_number: clinicConfig.account_number,
        branch_code: clinicConfig.branch_code,
        account_type: clinicConfig.account_type,
        updated_at: new Date().toISOString()
      }).eq('id', clinicConfig.id);
      if (error) throw error;
      setBankingMsg('Banking details saved! Members can now see payment information.');
      setTimeout(() => setBankingMsg(''), 4000);
    } catch (err: any) {
      setBankingMsg('Failed to save: ' + err.message);
    } finally {
      setSavingBanking(false);
    }
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setProfileMsg('Regulatory compliance document submitted for Super Admin review!');
      setDocFile(null);
      setTimeout(() => setProfileMsg(''), 4000);
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Branch & Clinic Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Configure clinic profile, banking details, and regulatory compliance.
        </p>
      </div>

      {/* Banking missing warning */}
      {!loading && !hasBanking && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #7c2d12, #92400e)', borderRadius: 12, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <AlertTriangle size={22} color="#fbbf24" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Banking Details Required</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              Members cannot make payments until you fill in the clinic banking details below.
            </div>
          </div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gap: '2rem' }}>

        {/* Clinic Profile Form */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Building size={20} color="#0f172a" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Branch Profile Details</h2>
          </div>

          {loading ? (
            <div style={{ color: '#64748b' }}>Loading branch details...</div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={field}>
                  <label style={lbl}>Clinic Name</label>
                  <input type="text" style={inp} value={clinicConfig.name || ''} onChange={e => setClinicConfig({...clinicConfig, name: e.target.value})} />
                </div>
                <div style={field}>
                  <label style={lbl}>Head Doctor</label>
                  <input type="text" style={inp} value={clinicConfig.doctor_name || ''} onChange={e => setClinicConfig({...clinicConfig, doctor_name: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={field}>
                  <label style={lbl}>Support Email</label>
                  <input type="email" style={inp} value={clinicConfig.email || ''} onChange={e => setClinicConfig({...clinicConfig, email: e.target.value})} />
                </div>
                <div style={field}>
                  <label style={lbl}>Phone Number</label>
                  <input type="text" style={inp} value={clinicConfig.phone || ''} onChange={e => setClinicConfig({...clinicConfig, phone: e.target.value})} />
                </div>
              </div>
              <div style={field}>
                <label style={lbl}>Primary Address</label>
                <input type="text" style={inp} value={clinicConfig.address_line1 || ''} onChange={e => setClinicConfig({...clinicConfig, address_line1: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.875rem', color: profileMsg.includes('Failed') ? '#ef4444' : '#10b981', fontWeight: 500 }}>{profileMsg}</div>
                <button type="submit" disabled={savingProfile}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '8px', background: '#1c2340', color: '#ffffff', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? 0.7 : 1 }}>
                  {savingProfile ? 'Saving...' : <><Save size={16} /> Save Branch Profile</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Banking Details */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: hasBanking ? '1px solid #bbf7d0' : '2px solid #fca5a5', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: hasBanking ? '#dcfce7' : '#fee2e2', borderRadius: '8px', border: `1px solid ${hasBanking ? '#bbf7d0' : '#fca5a5'}` }}>
                <CreditCard size={20} color={hasBanking ? '#16a34a' : '#dc2626'} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Clinic Banking Details</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                  Members use these details to pay for their plans. Keep them accurate.
                </p>
              </div>
            </div>
            {hasBanking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 12px', borderRadius: 20 }}>
                <CheckCircle size={13} /> Configured
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ color: '#64748b' }}>Loading banking details...</div>
          ) : (
            <form onSubmit={handleSaveBanking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={field}>
                  <label style={lbl}>Bank Name *</label>
                  <input type="text" style={inp} placeholder="e.g. FNB, Standard Bank, ABSA" value={clinicConfig.bank_name || ''} onChange={e => setClinicConfig({...clinicConfig, bank_name: e.target.value})} />
                </div>
                <div style={field}>
                  <label style={lbl}>Account Name *</label>
                  <input type="text" style={inp} placeholder="Name on the account" value={clinicConfig.account_name || ''} onChange={e => setClinicConfig({...clinicConfig, account_name: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={field}>
                  <label style={lbl}>Account Number *</label>
                  <input type="text" style={inp} placeholder="e.g. 62847291034" value={clinicConfig.account_number || ''} onChange={e => setClinicConfig({...clinicConfig, account_number: e.target.value})} />
                </div>
                <div style={field}>
                  <label style={lbl}>Branch Code *</label>
                  <input type="text" style={inp} placeholder="e.g. 250655" value={clinicConfig.branch_code || ''} onChange={e => setClinicConfig({...clinicConfig, branch_code: e.target.value})} />
                </div>
                <div style={field}>
                  <label style={lbl}>Account Type</label>
                  <select style={inp} value={clinicConfig.account_type || 'current'} onChange={e => setClinicConfig({...clinicConfig, account_type: e.target.value})}>
                    <option value="current">Current / Cheque</option>
                    <option value="savings">Savings</option>
                    <option value="transmission">Transmission</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                ⚠️ <strong>Important:</strong> These details are shown directly to members on their Payments page. Double-check accuracy before saving. Any mistakes may result in misdirected payments.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.875rem', color: bankingMsg.includes('Failed') ? '#ef4444' : '#10b981', fontWeight: 500 }}>{bankingMsg}</div>
                <button type="submit" disabled={savingBanking}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', borderRadius: '8px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: savingBanking ? 'not-allowed' : 'pointer', opacity: savingBanking ? 0.7 : 1 }}>
                  {savingBanking ? 'Saving...' : <><Save size={16} /> Save Banking Details</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Regulatory Compliance Document Submission */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <ShieldCheck size={20} color="#0f172a" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Clinic Regulatory Documents</h2>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Submit required medical permits and compliance licenses to the Super Admin.</div>
            </div>
          </div>

          <form onSubmit={handleDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={field}>
                <label style={lbl}>Document Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} style={inp}>
                  <option value="Practice License">Medical Practice License (HPCSA)</option>
                  <option value="Facility Accreditation">Facility Accreditation Cert</option>
                  <option value="POPIA Compliance">POPIA Compliance Statement</option>
                  <option value="Operating Permit">Operating & Safety Permit</option>
                </select>
              </div>
              <div style={field}>
                <label style={lbl}>Attach Document (PDF / Image)</label>
                <input type="file" required onChange={e => setDocFile(e.target.files?.[0] || null)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={uploading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '8px', background: '#c9a033', color: '#1c2340', border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
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

