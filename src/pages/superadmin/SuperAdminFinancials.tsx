import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Users, Clock, ArrowUpRight, RefreshCw, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

const SuperAdminFinancials = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [totalRevenueCents, setTotalRevenueCents] = useState(0);
  const [mandatesCount, setMandatesCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadTreasuryData(); }, []);

  const loadTreasuryData = async () => {
    setLoading(true);
    try {
      const { data: debits } = await supabase.from('debit_orders').select('amount_cents, status');
      let sumCents = 0, failed = 0;
      if (debits) debits.forEach(d => {
        if (d.status === 'successful') sumCents += d.amount_cents || 0;
        if (d.status === 'failed') failed++;
      });
      setTotalRevenueCents(sumCents);
      setFailedCount(failed);

      const { count } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active');
      setMandatesCount(count || 0);

      const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(12);
      setAuditLogs(logs || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTreasuryData();
    setRefreshing(false);
  };

  const d = {
    card: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(28,35,64,0.06)',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textSub: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    gold: '#c9a033',
    goldSoft: isDark ? 'rgba(201,160,51,0.12)' : 'rgba(201,160,51,0.07)',
    green: '#10b981',
    blue: '#3b82f6',
    red: '#ef4444',
    navy: '#1c2340',
    surface: isDark ? 'rgba(255,255,255,0.02)' : '#f8f8f6',
    shadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(28,35,64,0.04)',
  };

  const kpis = [
    {
      label: 'Total Network Revenue',
      value: `R ${(totalRevenueCents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      sub: 'All successful debit orders',
      icon: <TrendingUp size={18} />, color: d.gold, bg: d.goldSoft,
      badge: { label: '100% Reconciled', color: d.green },
    },
    {
      label: 'Active Debit Mandates',
      value: mandatesCount.toLocaleString(),
      sub: 'Signed bank authorisations',
      icon: <Users size={18} />, color: d.blue, bg: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)',
      badge: { label: 'Active members', color: d.blue },
    },
    {
      label: 'Failed Collections',
      value: failedCount.toString(),
      sub: 'Requiring reconciliation',
      icon: <Wallet size={18} />, color: failedCount > 0 ? d.red : d.green, bg: failedCount > 0 ? (isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)') : (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.07)'),
      badge: { label: failedCount > 0 ? 'Needs attention' : 'All clear', color: failedCount > 0 ? d.red : d.green },
    },
    {
      label: 'Settlement Speed',
      value: 'Same-Day',
      sub: '1-click rapid staff action',
      icon: <Clock size={18} />, color: '#8b5cf6', bg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.07)',
      badge: { label: 'EFT + Manual', color: '#8b5cf6' },
    },
  ];

  return (
    <div style={{ color: d.text, maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>NFS Super Admin Portal</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: d.text, lineHeight: 1.2 }}>Treasury & Financials</h1>
            <p style={{ fontSize: '0.8125rem', color: d.textSub, marginTop: '0.25rem' }}>Network revenue, debit mandates, and global audit trail</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '9px', background: d.card, border: `1px solid ${d.border}`, color: d.textSub, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = d.gold + '40'; e.currentTarget.style.color = d.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = d.border; e.currentTarget.style.color = d.textSub; }}
          >
            <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
              <RefreshCw size={14} />
            </motion.div>
            {refreshing ? 'Refreshing…' : 'Refresh Data'}
          </button>
        </div>
      </motion.div>

      {/* Hero Revenue Strip */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ marginBottom: '1rem' }}>
        <div style={{ background: isDark ? 'linear-gradient(135deg, #1c2340 0%, #0f172a 60%)' : 'linear-gradient(135deg, #1c2340, #263060)', borderRadius: '14px', padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(28,35,64,0.25)' }}>
          <div style={{ position: 'absolute', top: '-30%', right: '5%', width: '180px', height: '180px', background: d.gold, filter: 'blur(70px)', opacity: 0.12, borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Total Network Revenue</p>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit', lineHeight: 1.1, marginTop: '0.25rem' }}>
                {loading ? '—' : `R ${(totalRevenueCents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem' }}>
                <span style={{ fontSize: '0.6875rem', color: '#34d399', fontWeight: 700, background: 'rgba(16,185,129,0.12)', padding: '0.15rem 0.5rem', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ArrowUpRight size={11} /> 100% reconciled
                </span>
                <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Manual EFT + Debit Orders</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Mandates', value: mandatesCount.toLocaleString(), color: '#60a5fa' },
                { label: 'Failed', value: failedCount, color: failedCount > 0 ? '#f87171' : '#34d399' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Outfit', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(201,160,51,0.4), transparent)' }} />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="fin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{ background: d.card, borderRadius: '13px', border: `1px solid ${d.border}`, padding: '1.125rem', boxShadow: d.shadow, position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: kpi.color, opacity: 0.5 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                {kpi.icon}
              </div>
              <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '2px 6px', borderRadius: '5px', background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9', color: kpi.badge.color }}>{kpi.badge.label}</span>
            </div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: d.text, fontFamily: 'Outfit', lineHeight: 1.1 }}>{loading ? '—' : kpi.value}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: d.textSub, marginTop: '0.2rem' }}>{kpi.label}</div>
            <div style={{ fontSize: '0.625rem', color: d.textMuted, marginTop: '0.1rem' }}>{kpi.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Audit Log */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, boxShadow: d.shadow, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${d.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={15} color={d.gold} />
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: d.text, margin: 0, fontFamily: 'Outfit' }}>Global System Audit Log</h2>
        </div>
        {auditLogs.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: d.textMuted, fontSize: '0.875rem' }}>No audit events recorded.</div>
        ) : (
          <div>
            {auditLogs.map((log, i) => (
              <div key={log.id || i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1.25rem',
                borderBottom: i < auditLogs.length - 1 ? `1px solid ${d.border}` : 'none',
                transition: 'background 0.15s', gap: '1rem'
              }}
                onMouseEnter={e => e.currentTarget.style.background = d.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: d.goldSoft, color: d.gold, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                    {log.action_type || 'SYSTEM'}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: d.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.entity_name || log.action_type || 'System Event'}
                  </span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: d.textMuted, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={11} /> {new Date(log.created_at || Date.now()).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <style>{`
        @media (max-width: 860px) { .fin-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .fin-kpi-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default SuperAdminFinancials;
