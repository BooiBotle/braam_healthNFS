import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy, MessageSquare, PhoneCall, HelpCircle,
  Clock, CheckCircle2, AlertCircle, FileText, Send, ChevronDown, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const TICKETS = [
  { id: 'TCK-8091', clinic: 'Sandton Healthcare NFS', by: 'Dr A. Molefe (Admin)', subject: 'Secondary doctor credential verification', priority: 'high', status: 'open', date: '10 mins ago', details: 'We have added Dr P. Khumalo as associate doctor at Sandton branch and require super admin approval for credentialing.' },
  { id: 'TCK-8088', clinic: 'Durban Central NFS Clinic', by: 'S. Naidoo (Staff)', subject: 'Manual debit order batch discrepancy', priority: 'medium', status: 'in_progress', date: '2 hours ago', details: 'Discrepancy found in 3 manual EFT reconciliations for July settlement period. Bank statement does not match portal records.' },
  { id: 'TCK-8075', clinic: 'Braam Health Centre', by: 'Admin Office', subject: 'POPIA Compliance Certificate Upload', priority: 'low', status: 'resolved', date: '1 day ago', details: 'Annual POPIA compliance renewal certificate has been submitted for record keeping and annual audit trail.' },
];

const FAQS = [
  { q: 'How are manual EFT debit orders reconciled?', a: 'Clinic Admins use the 1-Click Debit Order Reconciliation screen to batch-match incoming bank payments against pending member invoices. Any discrepancies are flagged for super admin review.' },
  { q: 'How does the Clinical Risk Radar flag consultations?', a: 'Automated medical oversight scans consultation records for prescription anomalies, consultation frequency thresholds, and repeat visits within 48 hours.' },
  { q: 'How do I invite a new Super Admin?', a: 'Navigate to User Directory and click "Invite Super Admin". Enter the email, full name, and phone number. They will receive portal access credentials.' },
  { q: 'What happens when a clinic is deactivated?', a: 'Deactivating a clinic prevents new member sign-ups and hides it from public-facing pages. All existing member data is preserved.' },
];

const HOTLINES = [
  { name: 'Network Technical Desk', number: '+27 10 011 0099', hours: '24/7 Priority Emergency Support', color: '#3b82f6' },
  { name: 'Treasury & Compliance', number: '+27 10 011 0088', hours: 'Mon–Fri 08:00–17:00 SAST', color: '#10b981' },
  { name: 'Medical Risk Escalation', number: '+27 10 011 0077', hours: '24/7 Clinical Emergency Line', color: '#ef4444' },
  { name: 'Data & Privacy Office', number: '+27 10 011 0066', hours: 'Mon–Fri 09:00–16:00 SAST', color: '#c9a033' },
];

const PRIORITY_META = {
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'HIGH' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'MED' },
  low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'LOW' },
};

const STATUS_META: Record<string, { color: string; label: string }> = {
  open: { color: '#ef4444', label: 'Open' },
  in_progress: { color: '#f59e0b', label: 'In Progress' },
  resolved: { color: '#10b981', label: 'Resolved' },
};

const SuperAdminSupport = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'hotline'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<typeof TICKETS[0] | null>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const d = {
    card: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(28,35,64,0.06)',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textSub: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    gold: '#c9a033',
    goldSoft: isDark ? 'rgba(201,160,51,0.12)' : 'rgba(201,160,51,0.07)',
    navy: '#1c2340',
    surface: isDark ? 'rgba(255,255,255,0.02)' : '#f8f8f6',
    shadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(28,35,64,0.04)',
  };

  const TABS = [
    { key: 'tickets', label: 'Support Tickets', icon: <MessageSquare size={14} />, count: TICKETS.filter(t => t.status !== 'resolved').length },
    { key: 'faq', label: 'Knowledge Base', icon: <HelpCircle size={14} /> },
    { key: 'hotline', label: 'Emergency Hotlines', icon: <PhoneCall size={14} /> },
  ] as const;

  return (
    <div style={{ color: d.text, maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>NFS Super Admin Portal</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: d.text, lineHeight: 1.2 }}>Support & Help Desk</h1>
            <p style={{ fontSize: '0.8125rem', color: d.textSub, marginTop: '0.25rem' }}>Manage branch requests, knowledge base, and emergency escalation lines</p>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.6875rem', fontWeight: 700, background: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff', color: '#2563eb', border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}` }}>
            <Clock size={12} /> SLA: &lt;15 min response
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '9px',
            background: activeTab === tab.key ? d.navy : d.card,
            color: activeTab === tab.key ? d.gold : d.textSub,
            border: `1px solid ${activeTab === tab.key ? d.navy : d.border}`,
            fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'Inter'
          }}>
            {tab.icon} {tab.label}
            {'count' in tab && tab.count > 0 && (
              <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: '#ef4444', color: '#fff', marginLeft: '2px' }}>{tab.count}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'tickets' && (
          <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}
          >
            {/* Ticket List */}
            <div style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, boxShadow: d.shadow, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${d.border}` }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: d.text, margin: 0, fontFamily: 'Outfit' }}>Active Queue</h2>
                <p style={{ fontSize: '0.625rem', color: d.textMuted, margin: '2px 0 0 0' }}>{TICKETS.length} total tickets</p>
              </div>
              <div>
                {TICKETS.map((ticket, i) => {
                  const pri = PRIORITY_META[ticket.priority as keyof typeof PRIORITY_META];
                  const sta = STATUS_META[ticket.status];
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} style={{
                      padding: '1rem 1.25rem', cursor: 'pointer', transition: 'background 0.15s',
                      borderBottom: i < TICKETS.length - 1 ? `1px solid ${d.border}` : 'none',
                      background: isSelected ? (isDark ? 'rgba(201,160,51,0.06)' : '#fffdf5') : 'transparent',
                      borderLeft: isSelected ? `3px solid ${d.gold}` : '3px solid transparent'
                    }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = d.surface; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <span style={{ fontWeight: 800, color: d.gold, fontSize: '0.6875rem', fontFamily: 'monospace' }}>{ticket.id}</span>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.5rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: pri.bg, color: pri.color }}>{pri.label}</span>
                          <span style={{ fontSize: '0.5rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9', color: sta.color }}>{sta.label}</span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: d.text, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</div>
                      <div style={{ fontSize: '0.625rem', color: d.textMuted }}>{ticket.clinic} · {ticket.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ticket Detail */}
            <div style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, boxShadow: d.shadow, overflow: 'hidden' }}>
              {selectedTicket ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${d.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: d.gold, fontSize: '0.6875rem', fontFamily: 'monospace' }}>{selectedTicket.id}</span>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: d.text, margin: '0.25rem 0 0 0', fontFamily: 'Outfit', lineHeight: 1.3 }}>{selectedTicket.subject}</h3>
                        <p style={{ fontSize: '0.75rem', color: d.textMuted, margin: '0.25rem 0 0 0' }}>{selectedTicket.clinic} · {selectedTicket.by}</p>
                      </div>
                      <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '3px 7px', borderRadius: '5px', background: PRIORITY_META[selectedTicket.priority as keyof typeof PRIORITY_META].bg, color: PRIORITY_META[selectedTicket.priority as keyof typeof PRIORITY_META].color, textTransform: 'uppercase', flexShrink: 0 }}>
                        {PRIORITY_META[selectedTicket.priority as keyof typeof PRIORITY_META].label} Priority
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1 }}>
                    <div style={{ padding: '0.875rem', borderRadius: '10px', background: d.surface, border: `1px solid ${d.border}`, fontSize: '0.8125rem', color: d.textSub, lineHeight: 1.7, marginBottom: '1rem' }}>
                      {selectedTicket.details}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Respond to Clinic</label>
                      <textarea rows={4} placeholder="Type official response…" value={responseMsg} onChange={e => setResponseMsg(e.target.value)}
                        style={{ padding: '0.625rem 0.875rem', borderRadius: '9px', fontSize: '0.8125rem', background: d.surface, border: `1px solid ${d.border}`, color: d.text, resize: 'none', outline: 'none', fontFamily: 'Inter', transition: 'border-color 0.2s' }}
                        onFocus={e => e.currentTarget.style.borderColor = d.gold + '50'}
                        onBlur={e => e.currentTarget.style.borderColor = d.border}
                      />
                      <button onClick={() => { setResponseMsg(''); alert('Response dispatched!'); }}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '9px', background: `linear-gradient(135deg, ${d.gold}, #b38d2a)`, color: d.navy, fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontSize: '0.8125rem', boxShadow: '0 4px 12px rgba(201,160,51,0.25)', fontFamily: 'Inter' }}
                      >
                        <Send size={14} /> Dispatch Response
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', padding: '2rem', textAlign: 'center' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: d.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <MessageSquare size={22} color={d.textMuted} />
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: d.text, marginBottom: '0.375rem' }}>Select a ticket</div>
                  <div style={{ fontSize: '0.75rem', color: d.textMuted }}>Click a support ticket from the queue to view details and respond</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'faq' && (
          <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, boxShadow: d.shadow, overflow: 'hidden' }}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${d.border}` }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: d.text, margin: 0, fontFamily: 'Outfit' }}>Super Admin Knowledge Base</h2>
              <p style={{ fontSize: '0.625rem', color: d.textMuted, margin: '2px 0 0 0' }}>{FAQS.length} articles</p>
            </div>
            <div>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? `1px solid ${d.border}` : 'none' }}>
                  <div onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'background 0.15s', gap: '1rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = d.surface}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: d.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <HelpCircle size={12} color={d.gold} />
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: d.text }}>{faq.q}</span>
                    </div>
                    {expandedFaq === i ? <ChevronDown size={16} color={d.gold} style={{ flexShrink: 0 }} /> : <ChevronRight size={16} color={d.textMuted} style={{ flexShrink: 0 }} />}
                  </div>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 1.25rem 1rem 3rem', fontSize: '0.8125rem', color: d.textSub, lineHeight: 1.7 }}>{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'hotline' && (
          <motion.div key="hotline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}
          >
            {HOTLINES.map((line, i) => (
              <div key={i} style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, padding: '1.25rem', boxShadow: d.shadow, position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: line.color, opacity: 0.6 }} />
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${line.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <PhoneCall size={18} color={line.color} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: d.text, marginBottom: '0.375rem' }}>{line.name}</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: line.color, fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{line.number}</div>
                <div style={{ fontSize: '0.6875rem', color: d.textMuted, fontWeight: 600 }}>{line.hours}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media (max-width: 860px) { div[style*="1fr 1.2fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
};

export default SuperAdminSupport;
