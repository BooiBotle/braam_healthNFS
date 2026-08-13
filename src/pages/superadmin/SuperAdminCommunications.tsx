import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Radio, Users, Building2, MessageSquare, CheckCircle, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { sendNetworkBroadcast } from '../../lib/api/superadmin';

const GROUPS = [
  { value: 'all_clinics', label: 'All Clinic Admins & Staff', icon: <Building2 size={14} />, desc: 'Everyone with portal access' },
  { value: 'admins_only', label: 'Clinic Administrators Only', icon: <Users size={14} />, desc: 'Admin-level accounts' },
  { value: 'staff_only', label: 'Clinic Medical Staff Only', icon: <MessageSquare size={14} />, desc: 'Doctors and front-desk staff' },
];

const TEMPLATES = [
  { label: 'System Maintenance', subject: 'Scheduled Maintenance: Portal Downtime Notice', body: 'The NFS portal will be undergoing scheduled maintenance. Please ensure all pending submissions are completed beforehand.' },
  { label: 'Policy Update', subject: 'Mandatory Policy Update — Immediate Action Required', body: 'Please review the updated NFS operational policy document. All clinic administrators must acknowledge receipt by end of business.' },
  { label: 'Billing Reminder', subject: 'Monthly Debit Order Processing Reminder', body: 'Please ensure all outstanding member debit orders have been processed and reconciled before the month-end cutoff.' },
];

const SuperAdminCommunications = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('all_clinics');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sentHistory, setSentHistory] = useState<Array<{ subject: string; group: string; time: Date }>>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setFeedback('');
    try {
      await sendNetworkBroadcast(title, message, targetGroup);
      setFeedback('Broadcast transmitted successfully!');
      setSentHistory(prev => [{ subject: title, group: targetGroup, time: new Date() }, ...prev].slice(0, 5));
      setTitle(''); setMessage('');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to send broadcast.');
    } finally { setSending(false); }
  };

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => { setTitle(tpl.subject); setMessage(tpl.body); };

  const d = {
    card: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(28,35,64,0.06)',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textSub: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    gold: '#c9a033',
    goldSoft: isDark ? 'rgba(201,160,51,0.12)' : 'rgba(201,160,51,0.07)',
    green: '#10b981',
    navy: '#1c2340',
    surface: isDark ? 'rgba(255,255,255,0.02)' : '#f8f8f6',
    shadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(28,35,64,0.04)',
  };

  const inputStyle: React.CSSProperties = { padding: '0.6rem 0.875rem', borderRadius: '9px', fontSize: '0.8125rem', background: d.surface, border: `1px solid ${d.border}`, color: d.text, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter', transition: 'border-color 0.2s' };

  return (
    <div style={{ color: d.text, maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>NFS Super Admin Portal</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: d.text, lineHeight: 1.2 }}>Broadcast Studio</h1>
        <p style={{ fontSize: '0.8125rem', color: d.textSub, marginTop: '0.25rem' }}>Transmit directives, policy updates, and network notices to all clinic staff</p>
      </motion.div>

      <div className="comms-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', alignItems: 'start' }}>

        {/* Main Composer */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, boxShadow: d.shadow, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${d.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: d.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={14} color={d.gold} />
            </div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: d.text, margin: 0, fontFamily: 'Outfit' }}>Compose Broadcast</h2>
          </div>

          <form onSubmit={handleSend} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Target Group */}
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>Target Group</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {GROUPS.map(g => (
                  <div key={g.value} onClick={() => setTargetGroup(g.value)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '9px',
                    border: `1px solid ${targetGroup === g.value ? d.gold + '40' : d.border}`,
                    background: targetGroup === g.value ? d.goldSoft : 'transparent',
                    cursor: 'pointer', transition: 'all 0.18s'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `2px solid ${targetGroup === g.value ? d.gold : d.textMuted}`, background: targetGroup === g.value ? d.gold : 'transparent', flexShrink: 0, transition: 'all 0.18s' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: targetGroup === g.value ? d.gold : d.text }}>{g.label}</div>
                      <div style={{ fontSize: '0.625rem', color: d.textMuted }}>{g.desc}</div>
                    </div>
                    <span style={{ color: d.textMuted }}>{g.icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>Subject / Directive Title</label>
              <input type="text" required placeholder="e.g. Mandatory Policy Update — July 2026" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = d.gold + '50'}
                onBlur={e => e.currentTarget.style.borderColor = d.border}
              />
            </div>

            {/* Message */}
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>Message Body</label>
              <textarea rows={5} required placeholder="Enter your operational directive, guidelines or announcement…" value={message} onChange={e => setMessage(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.currentTarget.style.borderColor = d.gold + '50'}
                onBlur={e => e.currentTarget.style.borderColor = d.border}
              />
            </div>

            {feedback && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: '9px', background: feedback.includes('success') ? (isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5') : (isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2'), border: `1px solid ${feedback.includes('success') ? (isDark ? 'rgba(16,185,129,0.2)' : '#bbf7d0') : (isDark ? 'rgba(239,68,68,0.2)' : '#fecaca')}`, fontSize: '0.8125rem', color: feedback.includes('success') ? '#059669' : '#dc2626', fontWeight: 600 }}>
                {feedback.includes('success') ? <CheckCircle size={14} /> : <Info size={14} />}
                {feedback}
              </div>
            )}

            <button type="submit" disabled={sending} style={{
              padding: '0.65rem 1.5rem', borderRadius: '9px', background: `linear-gradient(135deg, ${d.gold} 0%, #b38d2a 100%)`,
              color: d.navy, fontWeight: 800, fontSize: '0.875rem', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
              opacity: sending ? 0.75 : 1, boxShadow: sending ? 'none' : '0 4px 12px rgba(201,160,51,0.3)',
              transition: 'all 0.2s', fontFamily: 'Inter'
            }}>
              <Send size={15} /> {sending ? 'Transmitting…' : 'Transmit Broadcast'}
            </button>
          </form>
        </motion.div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

          {/* Templates */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, padding: '1.125rem', boxShadow: d.shadow }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: d.text, margin: '0 0 0.75rem 0', fontFamily: 'Outfit' }}>Quick Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {TEMPLATES.map((tpl, i) => (
                <button key={i} onClick={() => applyTemplate(tpl)} style={{ textAlign: 'left', padding: '0.625rem 0.875rem', borderRadius: '9px', background: 'transparent', border: `1px solid ${d.border}`, color: d.text, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.18s', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onMouseEnter={e => { e.currentTarget.style.background = d.goldSoft; e.currentTarget.style.borderColor = d.gold + '35'; e.currentTarget.style.color = d.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = d.border; e.currentTarget.style.color = d.text; }}
                >
                  <Radio size={12} /> {tpl.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sent History */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, boxShadow: d.shadow, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.125rem', borderBottom: `1px solid ${d.border}` }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: d.text, margin: 0, fontFamily: 'Outfit' }}>Recent Broadcasts</h3>
            </div>
            {sentHistory.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: d.textMuted, fontSize: '0.75rem' }}>No broadcasts sent this session</div>
            ) : (
              sentHistory.map((item, i) => (
                <div key={i} style={{ padding: '0.75rem 1.125rem', borderBottom: i < sentHistory.length - 1 ? `1px solid ${d.border}` : 'none' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: d.text, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.subject}</div>
                  <div style={{ fontSize: '0.625rem', color: d.textMuted, display: 'flex', gap: '0.5rem' }}>
                    <span>{item.group}</span> · <span>{item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span style={{ background: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5', color: '#059669', padding: '0 5px', borderRadius: '4px', fontWeight: 700 }}>Sent</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) { .comms-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default SuperAdminCommunications;
