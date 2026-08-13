import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Plus, X, ShieldCheck, Activity, User, Phone, Mail, CreditCard, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTokenBalance, type TokenBalance } from '../../lib/api/member';

// ─── MEMBER TOKEN DETAIL PANEL ────────────────────────────────────────────────
interface TokenPanelProps {
  member: any;
  onClose: () => void;
}

const MemberTokenPanel = ({ member, onClose }: TokenPanelProps) => {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (member?.id) {
      setLoading(true);
      getTokenBalance(member.id)
        .then(bal => { setTokenBalance(bal); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [member?.id]);

  const isUnlimited = tokenBalance?.monthly_tokens === -1;
  const rem = tokenBalance?.tokens_remaining ?? 0;
  const tot = tokenBalance?.monthly_tokens ?? 0;
  const used = tokenBalance?.tokens_used ?? 0;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, tot)) * 100));
  const isZero = !isUnlimited && rem <= 0;

  const tokenStatusColor = !tokenBalance ? '#64748b' : isUnlimited || rem > 1 ? '#10b981' : rem === 1 ? '#d97706' : '#ef4444';
  const tokenStatusBg = !tokenBalance ? '#f1f5f9' : isUnlimited || rem > 1 ? 'rgba(16,185,129,0.1)' : rem === 1 ? 'rgba(217,119,6,0.1)' : 'rgba(239,68,68,0.1)';
  const tokenStatusLabel = !tokenBalance ? 'Loading…' : isUnlimited ? 'UNLIMITED' : isZero ? 'NO TOKENS REMAINING' : rem === 1 ? '1 TOKEN LEFT' : `${rem} TOKENS LEFT`;

  const fullName = member.profiles?.first_name + ' ' + member.profiles?.last_name;
  const initials = `${(member.profiles?.first_name || '').charAt(0)}${(member.profiles?.last_name || '').charAt(0)}`.toUpperCase();
  const idNum = member.profiles?.sa_id_number || member.profiles?.passport_number || 'N/A';

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 900,
      width: '100%', maxWidth: '440px',
      background: '#fff',
      boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #0B1B3F 0%, #142a52 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '1.25rem'
          }}>
            {initials}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{fullName}</div>
            <div style={{ color: '#9FB0CE', fontSize: '0.8rem', marginTop: 2 }}>{member.card_number || 'No card'}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9FB0CE', padding: 4 }}>
          <X size={22} />
        </button>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Token Status Badge */}
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '12px',
          background: isZero ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)',
          border: isZero ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color={tokenStatusColor} />
            <span style={{ fontWeight: 700, color: '#0B1B3F', fontSize: '0.9rem' }}>Monthly Token Status</span>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '11px',
            fontWeight: 700, background: tokenStatusBg, color: tokenStatusColor, letterSpacing: '0.4px'
          }}>{tokenStatusLabel}</span>
        </div>

        {/* Token Breakdown */}
        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '1rem' }}>
            Consultation Token Breakdown
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem', fontSize: '0.875rem' }}>Loading token data…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', marginBottom: '1rem' }}>
                {[
                  { label: 'INCLUDED', value: isUnlimited ? '∞' : String(tot), color: '#0B1B3F' },
                  { label: 'USED', value: String(used), color: '#0B1B3F' },
                  { label: 'REMAINING', value: isUnlimited ? '∞' : String(rem), color: isZero ? '#ef4444' : rem === 1 ? '#d97706' : '#10b981' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '10px 4px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
                  </div>
                ))}
              </div>
              {!isUnlimited && (
                <div>
                  <div style={{ background: '#e2e8f0', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 99,
                      background: isZero ? '#ef4444' : rem === 1 ? '#d97706' : '#10b981',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 6, textAlign: 'right' }}>
                    {pct}% of monthly quota used
                  </div>
                </div>
              )}
              {isZero && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10,
                  padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)'
                }}>
                  <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>
                    Member has reached their monthly limit. Manager Override required for any additional visits this month.
                  </div>
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                Resets on the 1st of each calendar month
              </div>
            </>
          )}
        </div>

        {/* Member Details */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '1rem' }}>
            Member Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: <User size={14} color="#64748b" />, label: 'Full Name', value: fullName },
              { icon: <CreditCard size={14} color="#64748b" />, label: 'SA ID / Passport', value: idNum },
              { icon: <CreditCard size={14} color="#64748b" />, label: 'Card Number', value: member.card_number || 'N/A' },
              { icon: <Activity size={14} color="#64748b" />, label: 'Current Plan', value: member.plans?.name || tokenBalance?.plan_name || 'N/A' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {icon}
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>{label}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1B3F' }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>Status</span>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: '11px', fontWeight: 700,
                background: member.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: member.status === 'active' ? '#10b981' : '#ef4444',
                textTransform: 'uppercase'
              }}>
                {member.status}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            to="/admin/onboarding"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px', borderRadius: 10,
              background: 'linear-gradient(135deg, #0B1B3F 0%, #142a52 100%)',
              color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '14px'
            }}
          >
            View / Edit Full Profile
          </Link>
        </div>

      </div>
    </div>
  );
};

// ─── ADMIN MEMBERS LIST ────────────────────────────────────────────────────────
const AdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    fetchMembersAndData();
  }, []);

  const fetchMembersAndData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          status,
          card_number,
          created_at,
          profiles (first_name, last_name, sa_id_number, passport_number, phone, email),
          plans (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        setFetchError(error.message || 'Failed to fetch members');
        throw error;
      }
      setMembers(data || []);
      setFetchError(null);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      setFetchError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const activeCount = members.filter(m => m.status === 'active').length;
  const suspendedCount = members.filter(m => m.status === 'suspended').length;

  const filteredMembers = members.filter(member => {
    const fullName = `${member.profiles?.first_name} ${member.profiles?.last_name}`.toLowerCase();
    const idNumber = member.profiles?.sa_id_number || member.profiles?.passport_number || '';
    const cardNumber = member.card_number || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || idNumber.includes(query) || cardNumber.toLowerCase().includes(query);
  });

  const getInitials = (first: string, last: string) =>
    `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'suspended': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'cancelled': return { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', border: 'rgba(100, 116, 139, 0.3)' };
      default: return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'ID Number', 'Card Number', 'Plan', 'Status', 'Joined Date'];
    const rows = filteredMembers.map(m => [
      `${m.profiles?.first_name} ${m.profiles?.last_name}`,
      m.profiles?.sa_id_number || m.profiles?.passport_number || 'N/A',
      m.card_number || 'No card',
      m.plans?.name || 'N/A',
      m.status,
      new Date(m.created_at).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Overlay when panel is open */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 800 }}
            />
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 900, width: '100%', maxWidth: 440 }}
            >
              <MemberTokenPanel member={selectedMember} onClose={() => setSelectedMember(null)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '1200px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Members</h1>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>Manage platform members — click any row to view token balance and details.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.25rem', borderRadius: '8px',
                background: '#ffffff', color: '#0f172a',
                border: '1px solid #e2e8f0', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <Download size={16} /> Export CSV
            </button>
            <Link
              to="/admin/onboarding"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.25rem', borderRadius: '8px',
                background: 'linear-gradient(135deg, #1c2340 0%, #2a345c 100%)', color: '#ffffff', textDecoration: 'none',
                border: 'none', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(28, 35, 64, 0.2)'
              }}
            >
              <Plus size={16} /> Add New Member
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <motion.div whileHover={{ y: -2 }} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Members</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{members.length}</div>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Members</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{activeCount}</div>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suspended Accounts</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{suspendedCount}</div>
          </motion.div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by name, ID, or card number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
                  borderRadius: '8px', border: '1px solid #e2e8f0',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Number</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading members...</td></tr>
                ) : fetchError ? (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>Error fetching members: {fetchError}</td></tr>
                ) : filteredMembers.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No members found.</td></tr>
                ) : filteredMembers.map((member, index) => {
                  const statusStyling = getStatusColor(member.status);
                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      key={member.id}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      whileHover={{ backgroundColor: '#f8fafc' }}
                      onClick={() => setSelectedMember(member)}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1c2340 0%, #3b487c 100%)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(28, 35, 64, 0.2)'
                          }}>
                            {getInitials(member.profiles?.first_name, member.profiles?.last_name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              {member.profiles?.first_name} {member.profiles?.last_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                              {member.card_number || 'No card'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                        {member.profiles?.sa_id_number || member.profiles?.passport_number || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>
                        {member.plans?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                          background: statusStyling.bg, color: statusStyling.color,
                          border: `1px solid ${statusStyling.border}`,
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                        {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '0.5rem 1rem', borderRadius: '8px',
                            background: '#f8fafc', color: '#1c2340', border: '1px solid #e2e8f0',
                            fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Activity size={13} /> View Tokens
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AdminMembers;
