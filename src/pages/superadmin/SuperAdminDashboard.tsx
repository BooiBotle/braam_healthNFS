import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, DollarSign, Shield, Send, Radio,
  ChevronRight, ArrowUpRight, Crown, Stethoscope,
  BarChart3, MapPin, RefreshCw, Clock, CheckCircle,
  AlertTriangle, Activity, Wallet
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getSuperAdminMetrics, type SystemMetrics, sendNetworkBroadcast } from '../../lib/api/superadmin';
import { getAllClinics, type Clinic } from '../../lib/api/clinics';

/* ─── Mini sparkline ── */
const Spark = ({ pts, color, w = 60, h = 22 }: { pts: number[]; color: string; w?: number; h?: number }) => {
  if (pts.length < 2) return null;
  const max = Math.max(...pts, 1);
  const coords = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - (v / max) * h * 0.85}`).join(' ');
  const id = `sp${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${coords} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Animated counter ── */
const Counter = ({ to, prefix = '' }: { to: number; prefix?: string }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let cur = 0; const step = to / 72;
    const t = setInterval(() => { cur += step; if (cur >= to) { setN(to); clearInterval(t); } else setN(Math.round(cur)); }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <>{prefix}{n.toLocaleString('en-ZA')}</>;
};

/* ─── Static dot ── */
const Dot = ({ c = '#10b981' }: { c?: string }) => (
  <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, flexShrink: 0 }}>
    <span style={{ position: 'relative', width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />
  </span>
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [hRow, setHRow] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const [m, c] = await Promise.all([getSuperAdminMetrics(), getAllClinics()]); setMetrics(m); setClinics(c); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true);
    try { await sendNetworkBroadcast(subject, body, 'all_clinics'); setFeedback('✓ Broadcast delivered'); setSubject(''); setBody(''); }
    catch { setFeedback('✗ Failed — try again'); }
    finally { setSending(false); setTimeout(() => setFeedback(''), 4000); }
  };

  const greet = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const timeStr = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });

  /* ── Design tokens (theme-aware) ── */
  const G = '#c9a033'; // gold
  const N = '#1c2340'; // navy

  // Hero panel tokens
  const heroBg    = isDark
    ? 'linear-gradient(145deg, #0a1020 0%, #1c2340 45%, #0e1b35 100%)'
    : 'linear-gradient(145deg, #1c2340 0%, #263060 55%, #1a2d5a 100%)';
  const heroText  = '#ffffff';
  const heroSub   = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)';
  const heroMuted = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.35)';
  const heroBdr   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.1)';

  // KPI tile tokens (inside hero)
  const tileHeroBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)';
  const tileHeroBdr = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.18)';

  // Content area tokens
  const pageTxt   = isDark ? '#f1f5f9' : '#0f172a';
  const pageSub   = isDark ? '#94a3b8' : '#475569';
  const pageMuted = isDark ? '#64748b' : '#94a3b8';
  const card      = isDark ? 'rgba(255,255,255,0.035)' : '#ffffff';
  const bdr       = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(28,35,64,0.07)';
  const surf      = isDark ? 'rgba(255,255,255,0.025)' : '#f8f9fc';
  const shad      = isDark ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 12px rgba(28,35,64,0.06)';

  const sp1 = [3, 5, 4, 7, 5, 8, 7, 10];
  const sp2 = [7, 5, 9, 6, 10, 7, 11, 9];

  const kpis = [
    { k:'clinics',  l:'Active Clinics',  v: metrics ? `${metrics.activeClinics}/${metrics.totalClinics}` : '—', sub:'facilities', c:'#c9a033', icon:Building2, sp:sp1, path:'/super-admin/clinics',       badge:'LIVE' },
    { k:'members',  l:'Active Members',  v: metrics ? metrics.activeMembers.toLocaleString() : '—',              sub:'enrolled',   c:'#60a5fa', icon:Users,      sp:sp2, path:'/super-admin/users',         badge:'+12%' },
    { k:'revenue',  l:'Gross Revenue',   v: metrics ? `R\u00A0${Math.round(metrics.monthlyRevenueCents/100).toLocaleString('en-ZA')}` : '—', sub:'MTD EFT', c:'#34d399', icon:DollarSign, sp:sp1.map((v,i)=>v*(i+1)*0.44), path:'/super-admin/financials', badge:'MTD' },
    { k:'consults', l:'Consultations',   v: metrics ? metrics.totalConsultationsThisMonth.toString() : '—',       sub:'this month', c:'#a78bfa', icon:Stethoscope, sp:sp2.map(v=>v*2.1), path:'/super-admin/analytics', badge:'MTD' },
    { k:'flags',    l:'Safety Flags',    v: metrics ? String(metrics.flaggedIncidentsCount) : '0',                sub:'unresolved', c:'#f87171', icon:Shield, sp:([1,2,1,3,1,2,2,metrics?.flaggedIncidentsCount||0] as number[]), path:'/super-admin/clinical-risk', badge:'ALERT' },
  ];

  const quickActions = [
    { l:'Analytics', i:BarChart3, c:'#c9a033', p:'/super-admin/analytics' },
    { l:'Clinics',   i:Building2, c:'#60a5fa', p:'/super-admin/clinics' },
    { l:'Broadcast', i:Radio,     c:'#a78bfa', p:'/super-admin/communications' },
    { l:'Risk',      i:Shield,    c:'#f87171', p:'/super-admin/clinical-risk' },
    { l:'Treasury',  i:Wallet,    c:'#34d399', p:'/super-admin/financials' },
    { l:'Users',     i:Users,     c:'#fb923c', p:'/super-admin/users' },
  ];

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight:'65vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <motion.div style={{ textAlign:'center' }}>
        <div style={{ position:'relative', width:60, height:60, margin:'0 auto 1.25rem' }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(201,160,51,0.3)', borderTopColor:'#c9a033' }} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}><Crown size={18} color="#c9a033" /></div>
        </div>
        <p style={{ fontSize:'0.75rem', fontWeight:700, color:pageMuted, fontFamily:'Outfit', letterSpacing:'0.06em' }}>
          LOADING COMMAND CENTER
        </p>
      </motion.div>
    </div>
  );

  const rev = metrics ? Math.round(metrics.monthlyRevenueCents / 100) : 0;

  return (
    <div style={{ color: pageTxt }}>

      {/* ╔═══════════════════════════════════════════════════════════╗
          ║  COMMAND PANEL — full-page-width bleed via CSS class      ║
          ╚═══════════════════════════════════════════════════════════╝ */}
      <motion.div className="cmd-panel" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.48, ease:[0.22,1,0.36,1] }}
        style={{ background: heroBg, position:'relative', overflow:'hidden', marginBottom:'0.875rem' }}>

        {/* Ambient orbs — static fallback without looping animations */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-55%', right:'-8%', width:320, height:320, borderRadius:'50%', background:G, filter:'blur(90px)', opacity: 0.15 }} />
          <div style={{ position:'absolute', bottom:'-60%', left:'10%', width:250, height:250, borderRadius:'50%', background:'#3b82f6', filter:'blur(80px)', opacity: 0.08 }} />
        </div>

        <div style={{ position:'relative', zIndex:1 }}>
          {/* ── Row 1: Greeting + status chips ── */}
          <div className="cmd-inner" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem', paddingBottom:'1rem', borderBottom:`1px solid ${heroBdr}` }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', marginBottom:'0.25rem' }}>
                <Crown size={10} color={G} />
                <span style={{ fontSize:'0.475rem', fontWeight:800, color:G, textTransform:'uppercase', letterSpacing:'0.12em' }}>NFS Super Admin Portal · Network Command</span>
              </div>
              <h1 style={{ margin:0, fontSize:'clamp(1.25rem,2.8vw,1.625rem)', fontWeight:800, color:heroText, fontFamily:'Outfit', letterSpacing:'-0.02em', lineHeight:1.2 }}>
                {greet}, {user?.name?.split(' ')[0] || 'Administrator'}
              </h1>
              <p style={{ margin:'0.2rem 0 0', fontSize:'0.6875rem', color:heroSub }}>{dateStr}</p>
            </div>
            <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.3rem 0.7rem', borderRadius:20, fontSize:'0.5rem', fontWeight:800, background:'rgba(52,211,153,0.18)', color:'#34d399', border:'1px solid rgba(52,211,153,0.25)', whiteSpace:'nowrap' }}>
                <Dot c="#10b981" /> All Systems Go
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.7rem', borderRadius:20, fontSize:'0.5rem', fontWeight:700, background:'rgba(201,160,51,0.15)', color:G, border:`1px solid rgba(201,160,51,0.25)`, whiteSpace:'nowrap' }}>
                <Clock size={9} /> {timeStr}
              </div>
              <button onClick={load} style={{ display:'flex', alignItems:'center', gap:'0.2rem', padding:'0.3rem 0.55rem', borderRadius:7, background:'rgba(255,255,255,0.08)', border:`1px solid ${heroBdr}`, color:heroSub, fontSize:'0.475rem', fontWeight:700, cursor:'pointer', fontFamily:'Inter' }}>
                <RefreshCw size={9} /> Refresh
              </button>
            </div>
          </div>

          {/* ── Row 2: Revenue + 3 hero stats ── */}
          <div className="cmd-inner" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1.25rem', paddingBottom:'1rem', borderBottom:`1px solid ${heroBdr}` }}>
            <div style={{ cursor:'pointer' }} onClick={() => navigate('/super-admin/financials')}>
              <p style={{ margin:0, fontSize:'0.475rem', fontWeight:700, color:heroMuted, textTransform:'uppercase', letterSpacing:'0.09em' }}>
                Gross Network Revenue · Current Period
              </p>
              <div style={{ fontSize:'clamp(2rem,5vw,2.875rem)', fontWeight:800, color:heroText, fontFamily:'Outfit', lineHeight:1, marginTop:'0.3rem' }}>
                {metrics ? <Counter to={rev} prefix="R " /> : <span style={{ opacity:0.3 }}>R —</span>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.45rem', flexWrap:'wrap' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', fontSize:'0.475rem', fontWeight:800, color:'#34d399', background:'rgba(52,211,153,0.18)', padding:'2px 8px', borderRadius:6 }}>
                  <ArrowUpRight size={9} /> {metrics?.manualReconciliationRate || 100}% Reconciled
                </span>
                <span style={{ fontSize:'0.4375rem', color:heroMuted }}>Manual EFT · Live</span>
              </div>
            </div>

            <div style={{ display:'flex', gap:'clamp(1.25rem,3vw,2.5rem)', flexWrap:'wrap', alignItems:'flex-end' }}>
              {[
                { l:'Clinics Active', v: metrics?.activeClinics||0, t:`of ${metrics?.totalClinics||0}`, c:G },
                { l:'Active Members', v: metrics?.activeMembers||0, t:'enrolled', c:'#60a5fa' },
                { l:'Consultations',  v: metrics?.totalConsultationsThisMonth||0, t:'this month', c:'#34d399' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25+i*0.09 }}
                  style={{ textAlign:'right', minWidth:56 }}>
                  <div style={{ fontSize:'clamp(1.5rem,3.2vw,2rem)', fontWeight:800, color:s.c, fontFamily:'Outfit', lineHeight:1 }}>
                    {metrics ? <Counter to={s.v} /> : '—'}
                  </div>
                  <div style={{ fontSize:'0.45rem', color:'rgba(255,255,255,0.5)', fontWeight:700, marginTop:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>{s.l}</div>
                  <div style={{ fontSize:'0.4rem', color:heroMuted }}>{s.t}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Row 3: 5 KPI tiles ── */}
          <div className="cmd-inner" style={{ paddingBottom:'1rem' }}>
            <div className="kpi-grid">
              {kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                const isAlert = kpi.k === 'flags' && (metrics?.flaggedIncidentsCount||0) > 0;
                return (
                  <motion.button key={kpi.k}
                    initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+idx*0.06, duration:0.38, ease:[0.22,1,0.36,1] }}
                    whileHover={{ scale:1.028, y:-2 }} whileTap={{ scale:0.97 }}
                    onClick={() => navigate(kpi.path)}
                    style={{ background:tileHeroBg, backdropFilter:'blur(8px)', border:`1px solid ${isAlert ? kpi.c+'50' : tileHeroBdr}`, borderRadius:13, padding:'0.875rem', cursor:'pointer', textAlign:'left', position:'relative', overflow:'hidden', transition:'box-shadow 0.18s, border-color 0.18s' }}>
                    {/* Top accent bar */}
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2.5, background:`linear-gradient(90deg,${kpi.c},${kpi.c}55)`, borderRadius:'13px 13px 0 0' }} />
                    {/* Alert static overlay */}
                    {isAlert && <div style={{ position:'absolute', inset:0, borderRadius:13, border:`1px solid ${kpi.c}55`, pointerEvents:'none', opacity: 0.5 }} />}

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.625rem' }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:`${kpi.c}22`, border:`1px solid ${kpi.c}30`, display:'flex', alignItems:'center', justifyContent:'center', color:kpi.c }}>
                        <Icon size={14} />
                      </div>
                      <span style={{ fontSize:'0.375rem', fontWeight:800, padding:'2px 6px', borderRadius:4, background:`${kpi.c}20`, color:kpi.c, border:`1px solid ${kpi.c}22`, letterSpacing:'0.04em' }}>{kpi.badge}</span>
                    </div>

                    <div style={{ fontSize:'clamp(1.125rem,2.2vw,1.375rem)', fontWeight:800, color:'#ffffff', fontFamily:'Outfit', lineHeight:1.1, marginBottom:'0.15rem' }}>{kpi.v}</div>
                    <div style={{ fontSize:'0.5625rem', fontWeight:700, color:'rgba(255,255,255,0.7)', marginBottom:'0.05rem' }}>{kpi.l}</div>
                    <div style={{ fontSize:'0.4375rem', color:'rgba(255,255,255,0.38)', marginBottom:'0.5rem' }}>{kpi.sub}</div>
                    <Spark pts={kpi.sp} color={kpi.c} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Launch bar ── */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.52, duration:0.36 }}
        style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', padding:'0.5rem 0.875rem', borderRadius:12, background:card, border:`1px solid ${bdr}`, marginBottom:'0.875rem', boxShadow:shad }}>
        <span style={{ fontSize:'0.4375rem', fontWeight:800, color:pageMuted, textTransform:'uppercase', letterSpacing:'0.1em', flexShrink:0 }}>Launch</span>
        <div style={{ width:1, height:14, background:bdr, flexShrink:0 }} />
        {quickActions.map((a, i) => {
          const Icon = a.i;
          return (
            <motion.button key={i} whileHover={{ scale:1.06, y:-1 }} whileTap={{ scale:0.95 }} onClick={() => navigate(a.p)}
              style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.325rem 0.7rem', borderRadius:8, background:`${a.c}12`, border:`1px solid ${a.c}28`, color:a.c, fontSize:'0.5625rem', fontWeight:800, cursor:'pointer', fontFamily:'Inter', whiteSpace:'nowrap' }}>
              <Icon size={10} strokeWidth={2.5} />{a.l}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Main grid: table | sidebar ── */}
      <div className="sa-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1.65fr) 268px', gap:'0.75rem', alignItems:'start' }}>

        {/* Clinic Network */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.56, duration:0.42 }}
          style={{ background:card, borderRadius:16, border:`1px solid ${bdr}`, boxShadow:shad, overflow:'hidden' }}>
          <div style={{ padding:'0.875rem 1.125rem', display:'flex', justifyContent:'space-between', alignItems:'center', background:surf, borderBottom:`1px solid ${bdr}` }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:G, display:'inline-block', flexShrink:0 }} />
                <h2 style={{ margin:0, fontSize:'0.875rem', fontWeight:800, fontFamily:'Outfit', color:pageTxt }}>Branch Clinic Network</h2>
              </div>
              <p style={{ margin:'2px 0 0', fontSize:'0.4875rem', color:pageMuted }}>{clinics.length} registered facilities</p>
            </div>
            <motion.button whileHover={{ x:2 }} onClick={() => navigate('/super-admin/clinics')}
              style={{ background:'none', border:'none', color:G, fontSize:'0.5625rem', fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:'0.2rem', fontFamily:'Inter' }}>
              View All <ChevronRight size={11} />
            </motion.button>
          </div>

          {clinics.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center' }}>
              <Building2 size={28} color={pageMuted} style={{ margin:'0 auto 0.75rem', display:'block' }} />
              <p style={{ fontSize:'0.8125rem', color:pageMuted, fontWeight:600, margin:'0 0 0.75rem' }}>No clinics yet</p>
              <button onClick={() => navigate('/super-admin/clinics/new')} style={{ padding:'0.4rem 1rem', borderRadius:8, background:G, color:N, border:'none', fontWeight:800, fontSize:'0.6875rem', cursor:'pointer' }}>+ Add First Clinic</button>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 70px 52px 58px', padding:'0.35rem 1.125rem', fontSize:'0.4375rem', fontWeight:800, color:pageMuted, textTransform:'uppercase', letterSpacing:'0.06em', background:surf, borderBottom:`1px solid ${bdr}` }}>
                <span>Facility</span><span>City</span><span>Hours</span><span>Status</span>
              </div>
              {clinics.slice(0,10).map((c, idx) => (
                <motion.div key={c.id}
                  onClick={() => navigate(`/super-admin/clinics/edit/${c.id}`)}
                  onHoverStart={() => setHRow(c.id)} onHoverEnd={() => setHRow(null)}
                  animate={{ backgroundColor: hRow === c.id ? (isDark?'rgba(201,160,51,0.04)':'rgba(201,160,51,0.03)') : 'rgba(0,0,0,0)' }}
                  style={{ display:'grid', gridTemplateColumns:'1fr 70px 52px 58px', padding:'0.575rem 1.125rem', alignItems:'center', cursor:'pointer', borderBottom: idx < Math.min(clinics.length,10)-1 ? `1px solid ${bdr}` : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', minWidth:0 }}>
                    <div style={{ width:27, height:27, borderRadius:8, background:'rgba(201,160,51,0.12)', border:'1px solid rgba(201,160,51,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:G, fontWeight:800, fontSize:'0.625rem', fontFamily:'Outfit', flexShrink:0 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:'0.6875rem', fontWeight:700, color:pageTxt, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize:'0.4375rem', color:pageMuted }}>{c.doctor_name ? `Dr. ${c.doctor_name}` : 'Branch Clinic'}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.2rem', fontSize:'0.5rem', color:pageSub }}>
                    <MapPin size={8} strokeWidth={2} />{c.city||'ZA'}
                  </div>
                  <span style={{ fontSize:'0.4375rem', fontWeight:700, color: c.open_24h ? G : pageMuted }}>{c.open_24h ? '24H' : 'Std'}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'0.2rem', fontSize:'0.4375rem', fontWeight:800, padding:'2px 7px', borderRadius:5,
                    background: c.is_active ? (isDark?'rgba(52,211,153,0.12)':'#ecfdf5') : (isDark?'rgba(248,113,113,0.12)':'#fef2f2'),
                    color: c.is_active ? '#10b981' : '#ef4444' }}>
                    <span style={{ width:4, height:4, borderRadius:'50%', background:'currentColor', display:'inline-block', flexShrink:0 }} />
                    {c.is_active ? 'Active' : 'Off'}
                  </span>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>

          {/* Safety */}
          <motion.div initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.6, duration:0.4 }}
            style={{ background:card, borderRadius:14, border:`1px solid ${bdr}`, boxShadow:shad, overflow:'hidden' }}>
            <div style={{ padding:'0.65rem 0.875rem', display:'flex', justifyContent:'space-between', alignItems:'center', background:surf, borderBottom:`1px solid ${bdr}` }}>
              <h3 style={{ margin:0, fontSize:'0.75rem', fontWeight:800, color:pageTxt, display:'flex', alignItems:'center', gap:'0.3rem' }}><Shield size={12} color="#f87171" /> Clinical Safety</h3>
              <button onClick={() => navigate('/super-admin/clinical-risk')} style={{ background:'none', border:'none', color:'#f87171', fontSize:'0.5rem', fontWeight:800, cursor:'pointer' }}>Review →</button>
            </div>
            <div style={{ padding:'0.75rem 0.875rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.625rem 0.75rem', borderRadius:9,
                background: isDark?'rgba(248,113,113,0.06)':'#fef2f2', border:`1px solid ${isDark?'rgba(248,113,113,0.12)':'#fecaca'}` }}>
                <div>
                  <div style={{ fontSize:'clamp(1.375rem,3vw,1.75rem)', fontWeight:800, color:pageTxt, fontFamily:'Outfit', lineHeight:1 }}>{metrics?.flaggedIncidentsCount||0}</div>
                  <div style={{ fontSize:'0.4375rem', color:pageMuted, marginTop:2 }}>flagged incidents</div>
                </div>
                <div style={{ width:32, height:32, borderRadius:9, background:isDark?'rgba(248,113,113,0.1)':'rgba(248,113,113,0.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {(metrics?.flaggedIncidentsCount||0) > 0 ? <AlertTriangle size={15} color="#f87171" /> : <CheckCircle size={15} color="#10b981" />}
                </div>
              </div>
              <div style={{ marginTop:'0.45rem', fontSize:'0.4375rem', fontWeight:700, color:(metrics?.flaggedIncidentsCount||0)>0?'#f87171':'#10b981', textAlign:'center' }}>
                {(metrics?.flaggedIncidentsCount||0)>0 ? '⚠ Requires Review' : '✓ All Clear'}
              </div>
            </div>
          </motion.div>

          {/* Network Pulse */}
          <motion.div initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.66, duration:0.4 }}
            style={{ background:card, borderRadius:14, border:`1px solid ${bdr}`, boxShadow:shad, overflow:'hidden' }}>
            <div style={{ padding:'0.65rem 0.875rem', background:surf, borderBottom:`1px solid ${bdr}` }}>
              <h3 style={{ margin:0, fontSize:'0.75rem', fontWeight:800, color:pageTxt, display:'flex', alignItems:'center', gap:'0.3rem' }}><Activity size={12} color={G} /> Network Pulse</h3>
            </div>
            <div style={{ padding:'0.625rem 0.875rem', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
              {[
                { l:'Consultations MTD',      v:String(metrics?.totalConsultationsThisMonth||0), c:'#a78bfa' },
                { l:'Reconciliation Rate',    v:`${metrics?.manualReconciliationRate||100}%`,    c:'#60a5fa' },
                { l:'Network Uptime',         v:'99.9%',                                         c:G },
                { l:'Active / Total Clinics', v:`${metrics?.activeClinics||0}/${metrics?.totalClinics||0}`, c:'#34d399' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.35rem 0.55rem', borderRadius:7, background:surf, border:`1px solid ${bdr}` }}>
                  <span style={{ fontSize:'0.5rem', color:pageSub, fontWeight:600 }}>{item.l}</span>
                  <span style={{ fontSize:'0.875rem', fontWeight:800, color:item.c, fontFamily:'Outfit' }}>{item.v}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Broadcast */}
          <motion.div initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.72, duration:0.4 }}
            style={{ background:card, borderRadius:14, border:`1px solid ${bdr}`, boxShadow:shad, overflow:'hidden' }}>
            <div style={{ padding:'0.65rem 0.875rem', background:surf, borderBottom:`1px solid ${bdr}` }}>
              <h3 style={{ margin:0, fontSize:'0.75rem', fontWeight:800, color:pageTxt, display:'flex', alignItems:'center', gap:'0.3rem' }}><Radio size={12} color={G} /> Quick Broadcast</h3>
            </div>
            <div style={{ padding:'0.75rem 0.875rem' }}>
              <form onSubmit={handleBroadcast} style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                <input type="text" required placeholder="Subject…" value={subject} onChange={e => setSubject(e.target.value)}
                  style={{ padding:'0.4rem 0.575rem', borderRadius:7, fontSize:'0.6875rem', background:isDark?'rgba(255,255,255,0.04)':surf, border:`1px solid ${bdr}`, color:pageTxt, outline:'none', fontFamily:'Inter', width:'100%', boxSizing:'border-box' }}
                  onFocus={e => e.currentTarget.style.borderColor='rgba(201,160,51,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor=bdr} />
                <textarea rows={3} required placeholder="Message to all clinics…" value={body} onChange={e => setBody(e.target.value)}
                  style={{ padding:'0.4rem 0.575rem', borderRadius:7, fontSize:'0.6875rem', background:isDark?'rgba(255,255,255,0.04)':surf, border:`1px solid ${bdr}`, color:pageTxt, resize:'none', outline:'none', fontFamily:'Inter', width:'100%', boxSizing:'border-box' }}
                  onFocus={e => e.currentTarget.style.borderColor='rgba(201,160,51,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor=bdr} />
                <AnimatePresence>
                  {feedback && (
                    <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      style={{ margin:0, fontSize:'0.5rem', fontWeight:700, color:feedback.startsWith('✓')?'#10b981':'#ef4444' }}>
                      {feedback}
                    </motion.p>
                  )}
                </AnimatePresence>
                <motion.button type="submit" disabled={sending} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  style={{ padding:'0.45rem', borderRadius:8, fontSize:'0.6875rem', fontWeight:800, background:`linear-gradient(135deg,${G},#b38d2a)`, color:N, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem', opacity:sending?0.75:1, fontFamily:'Inter' }}>
                  <Send size={11} /> {sending ? 'Sending…' : 'Broadcast to All Clinics'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Responsive CSS ── */}
      <style>{`
        /* Full-width bleed — escape the layout's padding */
        .cmd-panel {
          margin-top: -1.75rem;
          margin-left: -2.25rem;
          margin-right: -2.25rem;
          border-radius: 0 0 24px 24px;
        }
        .cmd-inner {
          padding-top: 1rem;
          padding-left: 2.25rem;
          padding-right: 2.25rem;
        }
        /* 5-tile grid — desktop */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.625rem;
        }
        /* Main grid */
        @media (max-width: 980px) {
          .sa-grid { grid-template-columns: 1fr !important; }
        }
        /* Tablet: 3+2 KPI layout */
        @media (max-width: 780px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .kpi-grid > *:nth-child(4) { grid-column: 1 / 2; }
          .kpi-grid > *:nth-child(5) { grid-column: 2 / 4; }
        }
        /* Mobile: 2 columns, last tile full-width */
        @media (max-width: 540px) {
          .cmd-panel {
            margin-top: -1rem;
            margin-left: -0.875rem;
            margin-right: -0.875rem;
            border-radius: 0 0 18px 18px;
          }
          .cmd-inner {
            padding-left: 0.875rem;
            padding-right: 0.875rem;
          }
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .kpi-grid > *:nth-child(4) { grid-column: auto; }
          .kpi-grid > *:last-child { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;
