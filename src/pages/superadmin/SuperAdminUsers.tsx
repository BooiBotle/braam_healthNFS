import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, ShieldCheck, Search,
  Building, Mail, Phone, X, Check, Crown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getSystemUsers, inviteSuperAdmin, updateUserRole } from '../../lib/api/superadmin';
import { getAllClinics, type Clinic } from '../../lib/api/clinics';

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', color: '#c9a033', bg: 'rgba(201,160,51,0.12)' },
  admin:       { label: 'Clinic Admin', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  staff:       { label: 'Staff',        color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  member:      { label: 'Member',       color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

const SuperAdminUsers = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [users, setUsers] = useState<any[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, c] = await Promise.all([getSystemUsers(), getAllClinics()]);
    setUsers(u); setClinics(c); setLoading(false);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setFeedbackMsg('');
    try {
      const { error } = await inviteSuperAdmin(inviteEmail, inviteFirstName, inviteLastName, invitePhone);
      if (error) throw error;
      setFeedbackMsg('Super Admin invited successfully!');
      loadData();
      setTimeout(() => { setShowInviteModal(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInvitePhone(''); setFeedbackMsg(''); }, 1500);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Failed to invite.');
    } finally { setIsSubmitting(false); }
  };

  const handleRoleChange = async (userId: string, newRole: string, clinicId?: string) => {
    await updateUserRole(userId, newRole, clinicId);
    loadData();
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.portal_role === roleFilter;
    return matchSearch && matchRole;
  });

  const d = {
    card: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(28,35,64,0.06)',
    borderStrong: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(28,35,64,0.1)',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textSub: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    gold: '#c9a033',
    goldSoft: isDark ? 'rgba(201,160,51,0.12)' : 'rgba(201,160,51,0.07)',
    navy: '#1c2340',
    surface: isDark ? 'rgba(255,255,255,0.02)' : '#f8f8f6',
    shadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(28,35,64,0.04)',
  };

  const inputStyle = { padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem', background: isDark ? 'rgba(255,255,255,0.04)' : '#f8f8f6', border: `1px solid ${d.border}`, color: d.text, outline: 'none', width: '100%', boxSizing: 'border-box' as const, fontFamily: 'Inter' };

  return (
    <div style={{ color: d.text, maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>NFS Super Admin Portal</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: d.text, lineHeight: 1.2 }}>User Directory</h1>
            <p style={{ fontSize: '0.8125rem', color: d.textSub, marginTop: '0.25rem' }}>Manage portal access, roles, and clinic assignments across the network</p>
          </div>
          <button onClick={() => setShowInviteModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.125rem', borderRadius: '10px',
            background: `linear-gradient(135deg, ${d.gold} 0%, #b38d2a 100%)`, color: d.navy, fontWeight: 800, fontSize: '0.8125rem',
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(201,160,51,0.3)', transition: 'transform 0.2s', fontFamily: 'Inter'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <UserPlus size={15} /> Invite Super Admin
          </button>
        </div>
      </motion.div>

      {/* Filter bar */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={14} color={d.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search by name or email…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem' }}
            onFocus={e => e.currentTarget.style.borderColor = d.gold + '50'}
            onBlur={e => e.currentTarget.style.borderColor = d.border}
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: '0.5rem 0.875rem', borderRadius: '8px', background: d.card, border: `1px solid ${d.border}`, color: d.text, fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Inter', outline: 'none' }}
        >
          <option value="all">All Roles ({users.length})</option>
          <option value="super_admin">Super Admins</option>
          <option value="admin">Clinic Admins</option>
          <option value="staff">Staff</option>
          <option value="member">Members</option>
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, boxShadow: d.shadow, overflow: 'hidden' }}>
        {/* Table head */}
        <div className="users-thead" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr', padding: '0.6rem 1.25rem', fontSize: '0.5625rem', fontWeight: 800, color: d.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', background: d.surface, borderBottom: `1px solid ${d.border}` }}>
          <span>User</span><span>Contact</span><span>Role</span><span>Clinic</span><span>Change Role</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: d.textMuted, fontSize: '0.875rem' }}>Loading users…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: d.textMuted, fontSize: '0.875rem' }}>No users found</div>
        ) : (
          filtered.map((u, i) => {
            const role = ROLE_META[u.portal_role] || ROLE_META.member;
            return (
              <div key={u.id || i}
                onMouseEnter={() => setHoveredRow(u.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="user-row"
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr',
                  padding: '0.875rem 1.25rem', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${d.border}` : 'none',
                  background: hoveredRow === u.id ? (isDark ? 'rgba(255,255,255,0.02)' : '#fafaf8') : 'transparent',
                  transition: 'background 0.15s'
                }}
              >
                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: u.portal_role === 'super_admin' ? `linear-gradient(135deg, ${d.gold}, #b38d2a)` : (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'), color: u.portal_role === 'super_admin' ? d.navy : d.textSub, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', flexShrink: 0 }}>
                    {u.portal_role === 'super_admin' ? <Crown size={14} /> : (u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: d.text }}>{u.full_name || 'Unnamed'}</div>
                    <div style={{ fontSize: '0.625rem', color: d.textMuted }}>ID …{u.id?.slice(-6)}</div>
                  </div>
                </div>
                {/* Contact */}
                <div style={{ fontSize: '0.75rem', color: d.textSub }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={10} /> {u.email || '—'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}><Phone size={10} /> {u.phone || '—'}</div>
                </div>
                {/* Role badge */}
                <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '3px 7px', borderRadius: '5px', background: role.bg, color: role.color, textTransform: 'uppercase', letterSpacing: '0.04em', justifySelf: 'start' }}>
                  {role.label}
                </span>
                {/* Clinic */}
                <span style={{ fontSize: '0.75rem', color: d.textSub, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Building size={11} /> {u.clinic?.name || 'Network-wide'}
                </span>
                {/* Role select */}
                <select value={u.portal_role || 'member'} onChange={e => handleRoleChange(u.id, e.target.value, u.clinic_id)}
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', background: d.surface, border: `1px solid ${d.border}`, color: d.text, fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'Inter', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Clinic Admin</option>
                  <option value="staff">Staff</option>
                  <option value="member">Member</option>
                </select>
              </div>
            );
          })
        )}
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ background: isDark ? '#0f172a' : '#ffffff', borderRadius: '16px', border: `1px solid ${d.border}`, padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 24px 48px rgba(0,0,0,0.3)', color: d.text }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit' }}>Invite Super Admin</h2>
                  <p style={{ fontSize: '0.75rem', color: d.textMuted, marginTop: '3px' }}>Grant full portal access to a new administrator</p>
                </div>
                <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', color: d.textMuted, cursor: 'pointer', padding: '0.25rem' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: d.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>First Name *</label>
                    <input type="text" value={inviteFirstName} onChange={e => setInviteFirstName(e.target.value)} required placeholder="Themba" style={{ padding: '0.625rem', borderRadius: '8px', border: `1px solid ${d.border}`, background: 'transparent', color: d.text, outline: 'none' }} onFocus={e => e.currentTarget.style.borderColor = d.gold + '60'} onBlur={e => e.currentTarget.style.borderColor = d.border} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: d.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last Name *</label>
                    <input type="text" value={inviteLastName} onChange={e => setInviteLastName(e.target.value)} required placeholder="Dlamini" style={{ padding: '0.625rem', borderRadius: '8px', border: `1px solid ${d.border}`, background: 'transparent', color: d.text, outline: 'none' }} onFocus={e => e.currentTarget.style.borderColor = d.gold + '60'} onBlur={e => e.currentTarget.style.borderColor = d.border} />
                  </div>
                </div>
                {[
                  { label: 'Email Address', type: 'email', value: inviteEmail, setter: setInviteEmail, required: true, placeholder: 'admin@nfsinsure.co.za' },
                  { label: 'Mobile Number', type: 'tel', value: invitePhone, setter: setInvitePhone, required: false, placeholder: '+27 82 000 0000' },
                ].map(field => (
                  <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: d.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{field.label}</label>
                    <input type={field.type} required={field.required} placeholder={field.placeholder} value={field.value} onChange={e => field.setter(e.target.value)}
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = d.gold + '60'}
                      onBlur={e => e.currentTarget.style.borderColor = d.border}
                    />
                  </div>
                ))}
                {feedbackMsg && <div style={{ fontSize: '0.8125rem', color: feedbackMsg.includes('success') ? '#10b981' : '#ef4444', fontWeight: 600, padding: '0.5rem 0.75rem', borderRadius: '8px', background: feedbackMsg.includes('success') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>{feedbackMsg}</div>}
                <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.25rem' }}>
                  <button type="button" onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', background: 'transparent', border: `1px solid ${d.border}`, color: d.textSub, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Inter' }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '0.55rem', borderRadius: '8px', background: `linear-gradient(135deg, ${d.gold}, #b38d2a)`, color: d.navy, fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', opacity: isSubmitting ? 0.7 : 1, fontFamily: 'Inter' }}>
                    <Check size={14} /> {isSubmitting ? 'Inviting…' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 700px) {
          .users-thead { display: none !important; }
          .user-row {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem;
            padding: 0.875rem !important;
          }
          .user-row > *:nth-child(2) { display: none; }
          .user-row > *:nth-child(4) { display: none; }
        }
        @media (max-width: 440px) {
          .user-row { grid-template-columns: 1fr !important; }
          .user-row > *:nth-child(3) { justify-self: start; }
        }
      `}</style>
    </div>
  );
};

export default SuperAdminUsers;
