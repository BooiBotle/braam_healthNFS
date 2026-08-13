import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Activity, RefreshCw, Clock, Stethoscope, Pill } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getFlaggedIncidents, type FlaggedIncident } from '../../lib/api/superadmin';
import { supabase } from '../../lib/supabase';

const SuperAdminClinicalRisk = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [incidents, setIncidents] = useState<FlaggedIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'consultation' | 'dispense'>('all');

  useEffect(() => { loadIncidents(); }, []);

  const loadIncidents = async () => {
    setLoading(true);
    const data = await getFlaggedIncidents();
    setIncidents(data);
    setLoading(false);
  };

  const handleResolve = async (incident: FlaggedIncident) => {
    setResolving(incident.id);
    try {
      if (incident.type === 'consultation') {
        await supabase.from('consultations').update({ flag_resolved: true, flag_resolved_at: new Date().toISOString() }).eq('id', incident.id);
      } else {
        await supabase.from('medication_dispenses').update({ flag_resolved: true }).eq('id', incident.id);
      }
      setResolvedIds(prev => new Set([...prev, incident.id]));
    } catch (err) { console.error(err); }
    finally { setResolving(null); }
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
    red: '#ef4444',
    navy: '#1c2340',
    surface: isDark ? 'rgba(255,255,255,0.02)' : '#f8f8f6',
    shadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(28,35,64,0.04)',
  };

  const pending = incidents.filter(i => !resolvedIds.has(i.id));
  const resolved = incidents.filter(i => resolvedIds.has(i.id));
  const displayed = (filter === 'all' ? pending : pending.filter(i => i.type === (filter === 'consultation' ? 'consultation' : 'dispense')));

  return (
    <div style={{ color: d.text, maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>NFS Super Admin Portal</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: d.text, lineHeight: 1.2 }}>Clinical Risk Radar</h1>
            <p style={{ fontSize: '0.8125rem', color: d.textSub, marginTop: '0.25rem' }}>Medical oversight monitor for flagged consultations and prescribing anomalies</p>
          </div>
          <button onClick={loadIncidents} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '9px', background: d.card, border: `1px solid ${d.border}`, color: d.textSub, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = d.gold + '40'; e.currentTarget.style.color = d.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = d.border; e.currentTarget.style.color = d.textSub; }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Pending Review', value: pending.length, color: d.red, bg: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', icon: <AlertTriangle size={16} /> },
          { label: 'Consultations', value: pending.filter(i => i.type === 'consultation').length, color: '#8b5cf6', bg: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)', icon: <Stethoscope size={16} /> },
          { label: 'Dispense Flags', value: pending.filter(i => i.type === 'dispense').length, color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.06)', icon: <Pill size={16} /> },
          { label: 'Resolved Today', value: resolved.length, color: d.green, bg: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', icon: <CheckCircle2 size={16} /> },
        ].map((s, i) => (
          <div key={i} style={{ background: d.card, borderRadius: '12px', border: `1px solid ${d.border}`, padding: '1rem', boxShadow: d.shadow, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.color, opacity: 0.5 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: d.text, fontFamily: 'Outfit', lineHeight: 1 }}>{loading ? '—' : s.value}</div>
                <div style={{ fontSize: '0.6875rem', color: d.textMuted, fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
              </div>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['all', 'consultation', 'dispense'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.35rem 0.875rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter', border: `1px solid ${filter === f ? d.red + '40' : d.border}`,
            background: filter === f ? (isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2') : 'transparent',
            color: filter === f ? d.red : d.textSub, transition: 'all 0.18s'
          }}>
            {f === 'all' ? `All (${pending.length})` : f === 'consultation' ? `Consultations (${pending.filter(i => i.type === 'consultation').length})` : `Dispenses (${pending.filter(i => i.type === 'dispense').length})`}
          </button>
        ))}
      </motion.div>

      {/* Incidents */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} style={{ background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, boxShadow: d.shadow, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${d.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={14} color={d.red} />
          </div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: d.text, margin: 0, fontFamily: 'Outfit' }}>
            Pending Medical Safety Reviews
          </h2>
          {pending.length > 0 && (
            <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2', color: d.red, marginLeft: 'auto' }}>
              {pending.length} unresolved
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', gap: '0.75rem', color: d.textMuted }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Activity size={20} color={d.gold} /></motion.div>
            <span style={{ fontSize: '0.875rem' }}>Loading incidents…</span>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <CheckCircle2 size={40} color={d.green} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: d.text, marginBottom: '0.25rem' }}>All clear!</div>
            <div style={{ fontSize: '0.8125rem', color: d.textMuted }}>Zero flagged incidents across all network clinics</div>
          </div>
        ) : (
          displayed.map((inc, i) => (
            <div key={inc.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem',
              borderBottom: i < displayed.length - 1 ? `1px solid ${d.border}` : 'none',
              transition: 'background 0.15s', flexWrap: 'wrap'
            }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.03)' : '#fef9f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                {/* Type icon */}
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: inc.type === 'consultation' ? (isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)') : (isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: inc.type === 'consultation' ? '#8b5cf6' : '#f59e0b', flexShrink: 0 }}>
                  {inc.type === 'consultation' ? <Stethoscope size={16} /> : <Pill size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2', color: d.red, textTransform: 'uppercase', letterSpacing: '0.03em' }}>FLAGGED</span>
                    <span style={{ fontSize: '0.5625rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: inc.type === 'consultation' ? (isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)') : (isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)'), color: inc.type === 'consultation' ? '#8b5cf6' : '#f59e0b', textTransform: 'uppercase' }}>
                      {inc.type}
                    </span>
                    <strong style={{ fontSize: '0.875rem', color: d.text }}>{inc.card_number || inc.member_name || 'Patient'}</strong>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: d.textSub, marginBottom: '0.25rem' }}>{inc.reason}</div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.6875rem', color: d.textMuted }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={10} /> {inc.clinic_name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={10} /> {new Date(inc.flagged_at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleResolve(inc)}
                disabled={resolving === inc.id}
                style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : '#bbf7d0'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.18s', opacity: resolving === inc.id ? 0.6 : 1, flexShrink: 0, fontFamily: 'Inter' }}
                onMouseEnter={e => { if (resolving !== inc.id) e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5'; e.currentTarget.style.color = '#059669'; }}
              >
                <CheckCircle2 size={13} /> {resolving === inc.id ? 'Resolving…' : 'Resolve'}
              </button>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default SuperAdminClinicalRisk;
