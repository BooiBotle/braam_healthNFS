import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, Activity, Search, ChevronRight,
  AlertTriangle, CheckCircle, Clock, Stethoscope,
  UserPlus, ClipboardList, Shield, Zap, Building2,
  TrendingUp, Calendar, ArrowRight, X
} from 'lucide-react';
import Modal from '../../components/Modal';

/* ── Pulse dot ─────────────────────────────── */
const Dot = ({ c }: { c: string }) => (
  <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, flexShrink: 0 }}>
    <motion.span animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: c }} />
    <span style={{ position: 'relative', width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />
  </span>
);

const StaffDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [clinicName, setClinicName] = useState('Your Clinic');
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [todayConsultations, setTodayConsultations] = useState<any[]>([]);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [flaggedActivities, setFlaggedActivities] = useState<any[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      let cid = user?.clinicId;
      if (!cid) {
        const { data: fc } = await supabase.from('clinics').select('id,name').limit(1).single();
        cid = fc?.id;
        if (fc?.name) setClinicName(fc.name);
      } else {
        const { data: cl } = await supabase.from('clinics').select('name').eq('id', cid).single();
        if (cl?.name) setClinicName(cl.name);
      }
      if (!cid) { setLoading(false); return; }

      const [apps, consults, cnt, fConsults, fMeds] = await Promise.all([
        supabase.from('applications').select('*, plans(name)').eq('clinic_id', cid).eq('status', 'submitted').order('created_at', { ascending: false }).limit(6),
        supabase.from('consultations').select('*, members(full_name, card_number)').eq('clinic_id', cid).gte('visited_at', new Date().toISOString().split('T')[0]).order('visited_at', { ascending: true }).limit(12),
        supabase.from('members').select('*', { count: 'exact', head: true }).eq('clinic_id', cid).eq('status', 'active'),
        supabase.from('consultations').select('id, visited_at, flagged_reason, members(full_name, card_number)').eq('clinic_id', cid).eq('is_flagged', true).eq('flag_resolved', false),
        supabase.from('medication_dispenses').select('id, dispensed_at, flagged_reason, dispense_note, members(full_name, card_number)').eq('clinic_id', cid).eq('is_flagged', true).eq('flag_resolved', false),
      ]);

      if (apps.data) setPendingApplications(apps.data);
      if (consults.data) setTodayConsultations(consults.data);
      if (cnt.count !== null) setActiveMembersCount(cnt.count);

      const flags: any[] = [];
      fConsults.data?.forEach(c => flags.push({ ...c, type: 'consultation', date: c.visited_at }));
      fMeds.data?.forEach(m => flags.push({ ...m, type: 'medication', date: m.dispensed_at }));
      flags.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setFlaggedActivities(flags);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleResolveFlag = async () => {
    if (!selectedFlag) return;
    const tbl = selectedFlag.type === 'consultation' ? 'consultations' : 'medication_dispenses';
    const upd = selectedFlag.type === 'consultation' ? { flag_resolved: true, flag_resolved_at: new Date().toISOString() } : { flag_resolved: true };
    await supabase.from(tbl).update(upd).eq('id', selectedFlag.id);
    setFlaggedActivities(p => p.filter(f => f.id !== selectedFlag.id));
    setSelectedFlag(null);
  };

  const d = {
    bg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(28,35,64,0.07)',
    text: isDark ? '#f1f5f9' : '#0f172a',
    sub: isDark ? '#94a3b8' : '#475569',
    muted: isDark ? '#64748b' : '#94a3b8',
    surf: isDark ? 'rgba(255,255,255,0.025)' : '#f8f9fc',
    shad: isDark ? '0 4px 24px rgba(0,0,0,0.28)' : '0 2px 12px rgba(28,35,64,0.05)',
    gold: '#c9a033', blue: '#60a5fa', green: '#34d399', red: '#f87171', purple: '#a78bfa',
  };

  const now = new Date();
  const greet = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const filteredConsults = todayConsultations.filter(c =>
    !searchQuery || (c.members?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.members?.card_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto 1.25rem' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${d.green}`, borderTopColor: 'transparent' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={20} color={d.green} />
          </div>
        </div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: d.sub, fontFamily: 'Outfit' }}>Loading Clinic Portal…</p>
      </motion.div>
    </div>
  );

  return (
    <div style={{ color: d.text, maxWidth: 1320, margin: '0 auto' }}>

      {/* ══════════════════════
          SHIFT HERO BANNER
      ══════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: '0.875rem' }}>
        <div style={{ background: `linear-gradient(135deg, #0d1528 0%, #1c2340 50%, #162038 100%)`, borderRadius: 18, padding: 'clamp(1rem,3vw,1.5rem) clamp(1.125rem,3vw,1.75rem)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(52,211,153,0.18)', boxShadow: isDark ? '0 14px 44px rgba(0,0,0,0.45)' : '0 14px 44px rgba(28,35,64,0.3)' }}>
          {/* Orbs */}
          <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.18, 0.1] }} transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '-50%', right: '-5%', width: 220, height: 220, borderRadius: '50%', background: d.green, filter: 'blur(75px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <Dot c={d.green} />
                <span style={{ fontSize: '0.5rem', fontWeight: 800, color: d.green, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Staff Portal · Clinic Active</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.125rem,3vw,1.5rem)', fontWeight: 800, color: '#fff', fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>
                {greet}, {user?.name?.split(' ')[0] || 'Staff'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                <Building2 size={11} color="rgba(255,255,255,0.45)" />
                <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{clinicName}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)' }}>{dateStr}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {[
                { l: "Today's Visits", v: todayConsultations.length, c: d.green },
                { l: 'Pending Apps', v: pendingApplications.length, c: d.gold },
                { l: 'Flags', v: flaggedActivities.length, c: d.red },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                  style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'clamp(1.125rem,3vw,1.5rem)', fontWeight: 800, color: s.c, fontFamily: 'Outfit', lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: '0.4375rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{s.l}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick action tray */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.4375rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center' }}>Quick Actions</span>
            {([
              { l: 'Log Consultation', i: Stethoscope, c: d.green },
              { l: 'Verify Member', i: Shield, c: d.blue },
              { l: 'New Application', i: UserPlus, c: d.gold },
              { l: 'View Schedule', i: Calendar, c: d.purple },
            ] as const).map((a, i) => {
              const Icon = a.i;
              return (
                <motion.button key={i} whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.325rem 0.7rem', borderRadius: 8, background: `${a.c}18`, border: `1px solid ${a.c}30`, color: a.c, fontSize: '0.5625rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter' }}>
                  <Icon size={10} strokeWidth={2.5} />{a.l}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════
          STAT TILES
      ══════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.45 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,185px),1fr))', gap: '0.625rem', marginBottom: '0.875rem' }}>
        {([
          { k: 'members', l: 'Active Members', v: activeMembersCount, icon: Users, c: d.blue, sub: clinicName },
          { k: 'apps', l: 'Pending Applications', v: pendingApplications.length, icon: FileText, c: d.gold, sub: 'Need processing' },
          { k: 'visits', l: "Today's Visits", v: todayConsultations.length, icon: Stethoscope, c: d.green, sub: 'Patients seen today' },
          { k: 'flags', l: 'Flagged Items', v: flaggedActivities.length, icon: AlertTriangle, c: d.red, sub: 'Require review' },
        ] as const).map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.k}
              initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.18 + idx * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, scale: 1.01 }}
              style={{ background: isDark ? 'linear-gradient(145deg, rgba(20,30,55,0.9) 0%, rgba(12,18,38,0.95) 100%)' : '#ffffff', borderRadius: 14, padding: '1.125rem', position: 'relative', overflow: 'hidden', border: `1px solid ${isDark ? `${card.c}20` : `${card.c}15`}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 2px 12px rgba(28,35,64,0.06)', cursor: 'default' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${card.c}, ${card.c}55)`, borderRadius: '14px 14px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.c}1a`, border: `1px solid ${card.c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.c }}>
                  <Icon size={16} />
                </div>
                {card.k === 'flags' && flaggedActivities.length > 0 && (
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.6 }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: d.red }} />
                )}
              </div>
              <div style={{ fontSize: 'clamp(1.25rem,3vw,1.625rem)', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', fontFamily: 'Outfit', lineHeight: 1.1 }}>{card.v}</div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#475569', marginTop: '0.15rem' }}>{card.l}</div>
              <div style={{ fontSize: '0.5rem', color: isDark ? '#64748b' : '#94a3b8', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ══════════════════════
          MAIN CONTENT GRID
      ══════════════════════ */}
      <div className="staff-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) 300px', gap: '0.75rem' }}>

        {/* ── Today's Consultations ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.45 }}
          style={{ background: d.bg, borderRadius: 16, border: `1px solid ${d.border}`, boxShadow: d.shad, overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${d.border}`, background: d.surf }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.green }} />
                <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, fontFamily: 'Outfit', color: d.text }}>Today's Consultations</h2>
              </div>
              <p style={{ margin: '1px 0 0', fontSize: '0.5rem', color: d.muted }}>{todayConsultations.length} patients seen · {clinicName}</p>
            </div>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: d.muted }} />
              <input type="text" placeholder="Search patient…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '1.625rem', paddingRight: '0.625rem', paddingTop: '0.325rem', paddingBottom: '0.325rem', borderRadius: 7, fontSize: '0.6875rem', background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9', border: `1px solid ${d.border}`, color: d.text, width: '155px', outline: 'none', fontFamily: 'Inter' }}
                onFocus={e => e.currentTarget.style.borderColor = `${d.green}55`}
                onBlur={e => e.currentTarget.style.borderColor = d.border} />
            </div>
          </div>

          {filteredConsults.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: d.surf, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <ClipboardList size={20} color={d.muted} />
              </div>
              <p style={{ fontSize: '0.8125rem', color: d.muted, fontWeight: 600, margin: 0 }}>
                {searchQuery ? 'No patients match your search' : 'No consultations recorded today'}
              </p>
              <p style={{ fontSize: '0.6875rem', color: d.muted, marginTop: '0.25rem' }}>Walk-in patients will appear here</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 110px 72px', padding: '0.375rem 1.125rem', fontSize: '0.4375rem', fontWeight: 800, color: d.muted, textTransform: 'uppercase', letterSpacing: '0.06em', background: isDark ? 'rgba(255,255,255,0.015)' : '#f8f9fc', borderBottom: `1px solid ${d.border}` }}>
                <span>Time</span><span>Patient</span><span>Card No.</span><span>Status</span>
              </div>
              {filteredConsults.map((c, idx) => (
                <motion.div key={c.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + idx * 0.04, duration: 0.3 }}
                  style={{ display: 'grid', gridTemplateColumns: '72px 1fr 110px 72px', padding: '0.625rem 1.125rem', alignItems: 'center', borderBottom: idx < filteredConsults.length - 1 ? `1px solid ${d.border}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(28,35,64,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: d.text }}>
                    {new Date(c.visited_at || c.consultation_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.green, fontWeight: 800, fontSize: '0.5625rem', flexShrink: 0 }}>
                      {(c.members?.full_name || 'P').charAt(0)}
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: d.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.members?.full_name || 'Unknown'}</span>
                  </div>
                  <span style={{ fontSize: '0.5625rem', color: d.muted, fontFamily: 'monospace' }}>{c.members?.card_number || '—'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.4375rem', fontWeight: 800, padding: '2px 6px', borderRadius: 5, background: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5', color: '#059669', textTransform: 'uppercase', justifySelf: 'start' }}>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    {c.status || 'Seen'}
                  </span>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* ── Right Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Pending Applications */}
          <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.58, duration: 0.42 }}
            style={{ background: d.bg, borderRadius: 15, border: `1px solid ${d.border}`, boxShadow: d.shad, overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${d.border}`, background: d.surf }}>
              <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: d.text, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserPlus size={13} color={d.gold} /> Applications
              </h3>
              {pendingApplications.length > 0 && (
                <span style={{ fontSize: '0.5rem', fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: isDark ? 'rgba(201,160,51,0.12)' : 'rgba(201,160,51,0.08)', color: d.gold }}>
                  {pendingApplications.length} pending
                </span>
              )}
            </div>
            {pendingApplications.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <CheckCircle size={18} color={d.green} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                <p style={{ fontSize: '0.6875rem', color: d.muted, fontWeight: 600, margin: 0 }}>All caught up!</p>
              </div>
            ) : (
              pendingApplications.map((app, idx) => (
                <div key={app.id} style={{ padding: '0.625rem 1rem', borderBottom: idx < pendingApplications.length - 1 ? `1px solid ${d.border}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(28,35,64,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: d.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{app.applicant_name || 'Applicant'}</span>
                    <span style={{ fontSize: '0.4375rem', fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: isDark ? 'rgba(96,165,250,0.12)' : '#eff6ff', color: d.blue, marginLeft: '0.5rem', flexShrink: 0 }}>NEW</span>
                  </div>
                  <div style={{ fontSize: '0.5625rem', color: d.muted }}>Plan: <span style={{ color: d.sub, fontWeight: 600 }}>{app.plans?.name || '—'}</span></div>
                </div>
              ))
            )}
          </motion.div>

          {/* Flagged Activities */}
          <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.64, duration: 0.42 }}
            style={{ background: d.bg, borderRadius: 15, border: `1px solid ${isDark ? 'rgba(248,113,113,0.12)' : 'rgba(248,113,113,0.1)'}`, boxShadow: d.shad, overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? 'rgba(248,113,113,0.1)' : 'rgba(248,113,113,0.08)'}`, background: isDark ? 'rgba(248,113,113,0.04)' : 'rgba(248,113,113,0.02)' }}>
              <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: d.text, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={13} color={d.red} /> Flagged Activity
              </h3>
              {flaggedActivities.length > 0 && (
                <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ fontSize: '0.5rem', fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: isDark ? 'rgba(248,113,113,0.14)' : 'rgba(248,113,113,0.1)', color: d.red }}>
                  {flaggedActivities.length} alert{flaggedActivities.length !== 1 ? 's' : ''}
                </motion.span>
              )}
            </div>
            {flaggedActivities.length === 0 ? (
              <div style={{ padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(52,211,153,0.1)' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.625rem' }}>
                  <CheckCircle size={18} color={d.green} />
                </div>
                <p style={{ fontSize: '0.6875rem', color: d.muted, fontWeight: 700, margin: 0 }}>No flagged items</p>
                <p style={{ fontSize: '0.5rem', color: d.muted, marginTop: '0.15rem' }}>All clear for this clinic</p>
              </div>
            ) : (
              flaggedActivities.slice(0, 5).map((flag, idx) => (
                <div key={flag.id} onClick={() => setSelectedFlag(flag)}
                  style={{ padding: '0.625rem 1rem', borderBottom: idx < Math.min(flaggedActivities.length, 5) - 1 ? `1px solid ${isDark ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.06)'}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(248,113,113,0.05)' : 'rgba(248,113,113,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: d.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flag.members?.full_name || 'Patient'}</div>
                      <div style={{ fontSize: '0.5rem', color: d.red, fontWeight: 600, marginTop: '0.1rem' }}>{flag.type === 'consultation' ? 'Consultation' : 'Medication'}</div>
                      <div style={{ fontSize: '0.5rem', color: d.muted, marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flag.flagged_reason}</div>
                    </div>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: d.red, flexShrink: 0, marginTop: 4 }} />
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Flag Review Modal ── */}
      <Modal isOpen={!!selectedFlag} onClose={() => setSelectedFlag(null)} title="Review Flagged Activity" maxWidth="480px">
        {selectedFlag && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.875rem', borderRadius: 10, background: isDark ? 'rgba(248,113,113,0.08)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(248,113,113,0.18)' : '#fecaca'}`, display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ padding: '0.35rem', background: d.red, color: '#fff', borderRadius: 8, flexShrink: 0 }}><AlertTriangle size={15} /></div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#fca5a5' : '#991b1b', marginBottom: '0.1rem' }}>{selectedFlag.flagged_reason}</div>
                <div style={{ fontSize: '0.6875rem', color: isDark ? '#fca5a5' : '#b91c1c' }}>{selectedFlag.type === 'consultation' ? 'Consultation Limit Exceeded' : 'Medication Dispense Flagged'}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={{ fontSize: '0.5rem', fontWeight: 700, color: d.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Patient</label><div style={{ fontSize: '0.875rem', fontWeight: 700, color: d.text, marginTop: 2 }}>{selectedFlag.members?.full_name}</div></div>
              <div><label style={{ fontSize: '0.5rem', fontWeight: 700, color: d.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Card No.</label><div style={{ fontSize: '0.875rem', fontWeight: 600, color: d.sub, marginTop: 2, fontFamily: 'monospace' }}>{selectedFlag.members?.card_number || 'N/A'}</div></div>
            </div>
            <div><label style={{ fontSize: '0.5rem', fontWeight: 700, color: d.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</label><div style={{ fontSize: '0.8125rem', color: d.text, marginTop: 2 }}>{new Date(selectedFlag.date).toLocaleString()}</div></div>
            {selectedFlag.dispense_note && (
              <div style={{ padding: '0.625rem 0.75rem', background: d.surf, borderRadius: 8, border: `1px solid ${d.border}` }}>
                <label style={{ fontSize: '0.5rem', fontWeight: 700, color: d.muted, textTransform: 'uppercase' }}>Dispense Note</label>
                <div style={{ fontSize: '0.8125rem', color: d.text, marginTop: 2 }}>{selectedFlag.dispense_note}</div>
              </div>
            )}
            <button onClick={handleResolveFlag} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', padding: '0.625rem', borderRadius: 8, background: d.green, border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Inter' }}>
              <CheckCircle size={15} /> Mark as Resolved
            </button>
          </div>
        )}
      </Modal>

      <style>{`
        @media (max-width: 860px) { .staff-main-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 580px) {
          div[style*="repeat(auto-fill, minmax(min(100%,185px)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;
