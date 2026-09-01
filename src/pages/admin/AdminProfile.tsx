import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Lock, Save, Moon, Sun, CheckCircle,
  Shield, Sliders, Bell, Building2, Key, AlertCircle, Phone, Mail, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

import { useNavigate } from 'react-router-dom';

type Tab = 'identity' | 'contact' | 'security' | 'preferences' | 'account';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<Tab>('identity');
  const [clinicName, setClinicName] = useState('Your Clinic');
  const [profile, setProfile] = useState<any>({
    first_name: '', last_name: '', full_name: '', sa_id_number: '',
    passport_number: '', date_of_birth: '', gender: 'male',
    phone: '', email: user?.email || '',
    address_line1: '', address_line2: '', suburb: '',
    city: 'Johannesburg', province: 'Gauteng', postal_code: '', country: 'ZA',
  });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile({ ...data, first_name: data.first_name || user?.name?.split(' ')[0] || '', last_name: data.last_name || user?.name?.split(' ')[1] || '', full_name: data.full_name || user?.name || '', email: data.email || user?.email || '' });
    });
    if (user?.clinicId) {
      supabase.from('clinics').select('name').eq('id', user.clinicId).single().then(({ data }) => { if (data?.name) setClinicName(data.name); });
    }
  }, [user]);

  const showMsg = (text: string, ok: boolean) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const saveIdentity = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('identity');
    try {
      const fullName = `${profile.first_name} ${profile.last_name}`.trim();
      const { error } = await supabase.from('profiles').update({ first_name: profile.first_name, last_name: profile.last_name, sa_id_number: profile.sa_id_number, passport_number: profile.passport_number, date_of_birth: profile.date_of_birth || null, gender: profile.gender, updated_at: new Date().toISOString() }).eq('id', user!.id);
      if (error) throw error;
      showMsg('Identity saved successfully', true);
    } catch (err: any) { showMsg(err.message, false); } finally { setSaving(null); }
  };

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('contact');
    try {
      const { error } = await supabase.from('profiles').update({ phone: profile.phone, address_line1: profile.address_line1, address_line2: profile.address_line2, suburb: profile.suburb, city: profile.city, province: profile.province, postal_code: profile.postal_code, country: profile.country || 'ZA', updated_at: new Date().toISOString() }).eq('id', user!.id);
      if (error) throw error;
      showMsg('Contact details saved', true);
    } catch (err: any) { showMsg(err.message, false); } finally { setSaving(null); }
  };

  const saveSecurity = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('security');
    if (!newPassword || newPassword.length < 8) { showMsg('Password must be at least 8 characters', false); setSaving(null); return; }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showMsg('Password updated successfully', true); setNewPassword('');
    } catch (err: any) { showMsg(err.message, false); } finally { setSaving(null); }
  };

  const d = {
    card: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(28,35,64,0.07)',
    text: isDark ? '#f1f5f9' : '#0f172a',
    sub: isDark ? '#94a3b8' : '#475569',
    muted: isDark ? '#64748b' : '#94a3b8',
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
    inputBorder: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid #e2e8f0',
    gold: '#c9a033', navy: '#1c2340',
    surf: isDark ? 'rgba(255,255,255,0.025)' : '#f8f9fc',
    shad: isDark ? '0 4px 24px rgba(0,0,0,0.28)' : '0 2px 12px rgba(28,35,64,0.05)',
    goldS: isDark ? 'rgba(201,160,51,0.12)' : 'rgba(201,160,51,0.07)',
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'identity', label: 'Identity', icon: <User size={14} /> },
    { key: 'contact', label: 'Contact & Address', icon: <MapPin size={14} /> },
    { key: 'security', label: 'Security', icon: <Lock size={14} /> },
    { key: 'preferences', label: 'Preferences', icon: <Sliders size={14} /> },
    { key: 'account', label: 'Accounts & Support', icon: <Building2 size={14} /> },
  ];

  const inputStyle = { padding: '0.65rem 0.75rem', borderRadius: 8, background: d.inputBg, border: d.inputBorder, color: d.text, fontSize: '0.8125rem', width: '100%', boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'Inter', transition: 'border-color 0.18s' };
  const labelStyle = { fontSize: '0.6875rem', fontWeight: 700, color: d.muted, marginBottom: '0.3rem', display: 'block' };
  const fieldStyle = { display: 'flex', flexDirection: 'column' as const };
  const saveBtn = (section: string, label: string) => (
    <motion.button type="submit" disabled={saving === section} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      style={{ padding: '0.55rem 1.25rem', borderRadius: 9, background: `linear-gradient(135deg, ${d.navy} 0%, #263060 100%)`, color: d.gold, border: `1px solid rgba(201,160,51,0.3)`, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: saving === section ? 0.7 : 1, fontFamily: 'Inter' }}>
      <Save size={13} /> {saving === section ? 'Saving…' : label}
    </motion.button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ maxWidth: 900, margin: '0 auto', color: d.text }}>

      {/* ── Hero Banner ── */}
      <div style={{ background: `linear-gradient(135deg, ${d.navy} 0%, #1a2d5a 100%)`, borderRadius: 18, padding: 'clamp(1.25rem,3vw,1.75rem) clamp(1.25rem,3vw,2rem)', marginBottom: '1.25rem', boxShadow: '0 14px 44px rgba(28,35,64,0.28)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40%', right: '5%', width: 180, height: 180, background: '#3b82f6', filter: 'blur(80px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${d.gold} 0%, #b38d2a 100%)`, color: d.navy, fontWeight: 800, fontSize: '1.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(201,160,51,0.4)', flexShrink: 0, fontFamily: 'Outfit' }}>
            {(profile.first_name || user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.125rem,3vw,1.625rem)', fontWeight: 800, fontFamily: 'Outfit', color: '#fff', lineHeight: 1.2 }}>
                {profile.first_name || user?.name} {profile.last_name}
              </h1>
              <CheckCircle size={16} color={d.gold} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: d.gold, fontWeight: 700 }}>
                <Building2 size={12} /> Clinic Branch Administrator · {clinicName}
              </span>
              <span style={{ fontSize: '0.5625rem', color: '#4ade80', fontWeight: 700 }}>✓ Branch Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: d.card, borderRadius: 12, padding: '0.3rem', border: `1px solid ${d.border}`, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.55rem 0.75rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: activeTab === tab.key ? 800 : 600, fontSize: 'clamp(0.5625rem,1.5vw,0.75rem)', fontFamily: 'Inter', background: activeTab === tab.key ? d.navy : 'transparent', color: activeTab === tab.key ? d.gold : d.sub, transition: 'all 0.2s', minWidth: '80px' }}>
            {tab.icon} <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: '0.625rem 1rem', borderRadius: 10, background: msg.ok ? (isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5') : (isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2'), border: `1px solid ${msg.ok ? (isDark ? 'rgba(16,185,129,0.25)' : '#bbf7d0') : (isDark ? 'rgba(239,68,68,0.25)' : '#fecaca')}`, color: msg.ok ? '#059669' : '#dc2626', fontWeight: 700, fontSize: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {msg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'identity' && (
          <motion.div key="identity" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}
            style={{ background: d.card, borderRadius: 14, border: `1px solid ${d.border}`, padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: d.shad }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.125rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${d.border}` }}>
              <User size={16} color={d.gold} />
              <div><h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'Outfit', color: d.text }}>Personal Identity</h2><p style={{ margin: 0, fontSize: '0.625rem', color: d.muted }}>Update your name, ID number, and personal details</p></div>
            </div>
            <form onSubmit={saveIdentity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                {[{ label: 'First Name', key: 'first_name', type: 'text', req: true }, { label: 'Last Name', key: 'last_name', type: 'text', req: true }, { label: 'SA ID Number', key: 'sa_id_number', type: 'text', placeholder: '8501015000088' }, { label: 'Passport Number', key: 'passport_number', type: 'text', placeholder: 'A0000000' }, { label: 'Date of Birth', key: 'date_of_birth', type: 'date' }].map(f => (
                  <div key={f.key} style={fieldStyle}><label style={labelStyle}>{f.label}</label><input type={f.type} required={f.req} placeholder={f.placeholder} value={profile[f.key] || ''} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} style={inputStyle} onFocus={e => e.currentTarget.style.borderColor = d.gold + '55'} onBlur={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : '#e2e8f0'} /></div>
                ))}
                <div style={fieldStyle}><label style={labelStyle}>Gender</label><select value={profile.gender || 'male'} onChange={e => setProfile({ ...profile, gender: e.target.value })} style={inputStyle}>{['male', 'female', 'other'].map(g => <option key={g} value={g} style={{ background: isDark ? '#1c2340' : '#fff' }}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}</select></div>
              </div>
              {saveBtn('identity', 'Save Identity')}
            </form>
          </motion.div>
        )}

        {activeTab === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}
            style={{ background: d.card, borderRadius: 14, border: `1px solid ${d.border}`, padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: d.shad }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.125rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${d.border}` }}>
              <MapPin size={16} color={d.gold} />
              <div><h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'Outfit', color: d.text }}>Contact & Address</h2><p style={{ margin: 0, fontSize: '0.625rem', color: d.muted }}>Update your mobile number and clinic branch address</p></div>
            </div>
            <form onSubmit={saveContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                <div style={fieldStyle}><label style={labelStyle}>Mobile Phone</label><input type="tel" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} style={inputStyle} onFocus={e => e.currentTarget.style.borderColor = d.gold + '55'} onBlur={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : '#e2e8f0'} /></div>
                <div style={fieldStyle}><label style={labelStyle}>Email (Read-only)</label><input type="email" disabled value={profile.email} style={{ ...inputStyle, background: isDark ? 'rgba(255,255,255,0.02)' : '#e2e8f0', color: d.muted, cursor: 'not-allowed' }} /></div>
                <div style={{ ...fieldStyle, gridColumn: 'span 2' }}><label style={labelStyle}>Address Line 1</label><input type="text" placeholder="123 Clinic Road" value={profile.address_line1 || ''} onChange={e => setProfile({ ...profile, address_line1: e.target.value })} style={inputStyle} onFocus={e => e.currentTarget.style.borderColor = d.gold + '55'} onBlur={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : '#e2e8f0'} /></div>
                {[{ label: 'Suburb', key: 'suburb', placeholder: 'Braamfontein' }, { label: 'City', key: 'city', placeholder: 'Johannesburg' }, { label: 'Province', key: 'province', placeholder: 'Gauteng' }, { label: 'Postal Code', key: 'postal_code', placeholder: '2017' }].map(f => (
                  <div key={f.key} style={fieldStyle}><label style={labelStyle}>{f.label}</label><input type="text" placeholder={f.placeholder} value={profile[f.key] || ''} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} style={inputStyle} onFocus={e => e.currentTarget.style.borderColor = d.gold + '55'} onBlur={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : '#e2e8f0'} /></div>
                ))}
              </div>
              {saveBtn('contact', 'Save Contact Details')}
            </form>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}
            style={{ background: d.card, borderRadius: 14, border: `1px solid ${d.border}`, padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: d.shad }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.125rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${d.border}` }}>
              <Lock size={16} color={d.gold} />
              <div><h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'Outfit', color: d.text }}>Security & Credentials</h2><p style={{ margin: 0, fontSize: '0.625rem', color: d.muted }}>Manage your authentication password</p></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 10, background: d.goldS, border: `1px solid ${isDark ? 'rgba(201,160,51,0.2)' : 'rgba(201,160,51,0.15)'}`, marginBottom: '1.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: d.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.gold, flexShrink: 0 }}><Building2 size={18} /></div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: d.text }}>Clinic Branch Administrator — {clinicName}</div>
                <div style={{ fontSize: '0.5625rem', color: d.muted }}>Member management · Debit reconciliation · Plan administration · KYC compliance</div>
              </div>
            </div>
            <form onSubmit={saveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: 420 }}>
              <div style={fieldStyle}><label style={labelStyle}><Key size={10} style={{ display: 'inline', marginRight: 4 }} />New Password (min 8 characters)</label><input type="password" placeholder="••••••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} onFocus={e => e.currentTarget.style.borderColor = d.gold + '55'} onBlur={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : '#e2e8f0'} /></div>
              {saveBtn('security', 'Update Password')}
            </form>
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div key="preferences" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ background: d.card, borderRadius: 14, border: `1px solid ${d.border}`, padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: d.shad }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${d.border}` }}><Sliders size={16} color={d.gold} /><h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'Outfit', color: d.text }}>Theme & Appearance</h2></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[{ label: 'Light Mode', val: 'light', icon: <Sun size={24} /> }, { label: 'Dark Mode', val: 'dark', icon: <Moon size={24} /> }].map(t => (
                  <button key={t.val} onClick={() => theme !== t.val && toggleTheme()} style={{ padding: '1.125rem', borderRadius: 11, border: `2px solid ${theme === t.val ? d.gold : d.border}`, background: theme === t.val ? d.goldS : d.surf, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                    <span style={{ color: theme === t.val ? d.gold : d.muted }}>{t.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme === t.val ? d.gold : d.sub }}>{t.label}</span>
                    {theme === t.val && <span style={{ fontSize: '0.5rem', fontWeight: 800, color: d.gold }}>ACTIVE</span>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: d.card, borderRadius: 14, border: `1px solid ${d.border}`, padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: d.shad }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${d.border}` }}><Bell size={16} color={d.gold} /><h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'Outfit', color: d.text }}>Notifications</h2></div>
              {[{ label: 'Email Notifications', sub: 'Daily clinic summaries and member alerts', val: emailAlerts, set: setEmailAlerts }, { label: 'SMS Alerts', sub: 'Urgent clinic and compliance alerts by SMS', val: smsAlerts, set: setSmsAlerts }].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: i === 0 ? `1px solid ${d.border}` : 'none' }}>
                  <div><div style={{ fontWeight: 700, fontSize: '0.8125rem', color: d.text }}>{item.label}</div><div style={{ fontSize: '0.5625rem', color: d.muted, marginTop: 2 }}>{item.sub}</div></div>
                  <div onClick={() => item.set(!item.val)} style={{ width: 42, height: 23, background: item.val ? d.gold : (isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1'), borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0 }}>
                    <motion.div animate={{ left: item.val ? '21px' : '2px' }} transition={{ type: 'spring', stiffness: 350, damping: 28 }} style={{ width: 19, height: 19, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'account' && (
          <motion.div key="account" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: d.card, borderRadius: 16, border: `1px solid ${d.border}`, padding: 'clamp(1.25rem,3vw,1.75rem)', boxShadow: d.shad, position: 'relative', overflow: 'hidden' }}>
              {/* Decorative Background */}
              <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 150, height: 150, background: '#3b82f6', filter: 'blur(70px)', opacity: 0.08, borderRadius: '50%', pointerEvents: 'none' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem', paddingBottom: '0.875rem', borderBottom: `1px solid ${d.border}` }}>
                <Building2 size={20} color={d.gold} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, fontFamily: 'Outfit', color: d.text }}>Accounts & Support</h2>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: d.muted, marginTop: '0.2rem' }}>Manage branch infrastructure, billing, and get help</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {/* Branch Settings Link */}
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/admin/settings')}
                  style={{ textAlign: 'left', padding: '1.25rem', borderRadius: 14, background: isDark ? 'rgba(59,130,246,0.06)' : '#f0f9ff', border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#bae6fd'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                    <Sliders size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: d.text, marginBottom: '0.2rem', fontFamily: 'Outfit' }}>Branch Settings & Docs</div>
                    <div style={{ fontSize: '0.625rem', color: isDark ? '#93c5fd' : '#3b82f6', fontWeight: 600 }}>Manage clinic configurations, documents & billing</div>
                  </div>
                  <ChevronRight size={18} color="#3b82f6" opacity={0.6} />
                </motion.button>

                {/* Support Link */}
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/admin/support')}
                  style={{ textAlign: 'left', padding: '1.25rem', borderRadius: 14, background: isDark ? 'rgba(201,160,51,0.06)' : '#fefce8', border: `1px solid ${isDark ? 'rgba(201,160,51,0.2)' : '#fef08a'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? 'rgba(201,160,51,0.15)' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.gold, flexShrink: 0 }}>
                    <AlertCircle size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: d.text, marginBottom: '0.2rem', fontFamily: 'Outfit' }}>Clinic Support Desk</div>
                    <div style={{ fontSize: '0.625rem', color: d.gold, fontWeight: 600 }}>Get help with system issues or escalate tickets</div>
                  </div>
                  <ChevronRight size={18} color={d.gold} opacity={0.6} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminProfile;
