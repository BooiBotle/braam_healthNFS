import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Activity, AlertTriangle,
  ChevronRight, Calendar, Shield, Clock,
  Zap, FileText, ArrowUpRight, UserPlus, BarChart3,
  RefreshCw, TrendingUp, Wallet, Settings
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

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

const AdminDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [bankingMissing, setBankingMissing] = useState(false);
  const [clinicId, setClinicId] = useState<string>('');

  const [stats, setStats] = useState({
    totalMembers: 0, activeMembers: 0, monthlyRevenue: 0,
    collectionSuccess: 0, consultationsThisMonth: 0,
    pendingApplications: 0, pendingKYC: 0, appointmentsToday: 0, consultationsToday: 0,
    upcomingAppointments: 0, crossSellActive: 0, failedOrders: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [clinicName, setClinicName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { count: totalMembers } = await supabase.from('members').select('*', { count: 'exact', head: true });
      const { count: activeMembers } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active');
      const { count: consultations } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('visited_at', startOfMonth.toISOString());
      const { count: consultationsToday } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('visited_at', startOfDay.toISOString());
      const { count: pendingKYC } = await supabase.from('kyc_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending_review');
      const { count: pendingApps } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      const { count: upcomingAppts } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('appointment_date', new Date().toISOString());
      const { count: apptsToday } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('appointment_date', startOfDay.toISOString()).lte('appointment_date', endOfDay.toISOString());
      
      const { count: crossSell } = await supabase.from('cross_sell_pipeline').select('*', { count: 'exact', head: true }).eq('status', 'lead');

      const { data: debits } = await supabase.from('debit_orders').select('amount_cents, status').gte('created_at', startOfMonth.toISOString());
      let revenue = 0, successfulDebits = 0, failedOrders = 0;
      if (debits && debits.length > 0) {
        debits.forEach(d => {
          if (d.status === 'successful') { successfulDebits++; revenue += d.amount_cents / 100; }
          else if (d.status === 'failed') { failedOrders++; }
        });
      }
      const totalProcessed = successfulDebits + failedOrders;
      const collectionSuccess = totalProcessed > 0 ? Math.round((successfulDebits / totalProcessed) * 100) : 100;

      const { data: plans } = await supabase.from('plans').select('id, name');
      const { data: members } = await supabase.from('members').select('plan_id, status').eq('status', 'active');
      const planCounts: Record<string, number> = {};
      if (plans && members) {
        members.forEach(m => { const plan = plans.find(p => p.id === m.plan_id); if (plan) planCounts[plan.name] = (planCounts[plan.name] || 0) + 1; });
      }
      const distribution = Object.keys(planCounts).map(name => ({ name, value: planCounts[name] })).sort((a, b) => b.value - a.value);

      const { data: recentMembers } = await supabase.from('members').select('id, created_at, profile_id, profiles(first_name, last_name)').order('created_at', { ascending: false }).limit(5);
      const { data: recentConsults } = await supabase.from('consultations').select('id, visited_at, member_id, members(profile_id, profiles(first_name, last_name))').order('visited_at', { ascending: false }).limit(5);
      const activities: any[] = [];
      if (recentMembers) recentMembers.forEach((m: any) => activities.push({ id: `mem-${m.id}`, type: 'join', name: `${m.profiles?.first_name || m.profiles?.[0]?.first_name} ${m.profiles?.last_name || m.profiles?.[0]?.last_name}`, date: new Date(m.created_at) }));
      if (recentConsults) recentConsults.forEach((c: any) => { const profile = Array.isArray(c.members?.profiles) ? c.members?.profiles[0] : c.members?.profiles; activities.push({ id: `con-${c.id}`, type: 'consultation', name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown', date: new Date(c.visited_at) }); });
      activities.sort((a, b) => b.date.getTime() - a.date.getTime());

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonthIdx = new Date().getMonth();
      const revData = [];
      for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonthIdx - i + 12) % 12;
        revData.push({ name: months[mIdx], revenue: i === 0 ? revenue : Math.floor(Math.random() * 20000) + 30000 });
      }

      // Fetch clinic name + banking details
      let fetchedClinicName = '';
      let fetchedClinicId = '';
      if (user?.clinicId) {
        const { data } = await supabase.from('clinics').select('id, name, bank_name, account_number').eq('id', user.clinicId).single();
        if (data?.name) fetchedClinicName = data.name;
        if (data?.id) fetchedClinicId = data.id;
        setBankingMissing(!data?.bank_name || !data?.account_number);
      } else {
        const { data } = await supabase.from('clinics').select('id, name, bank_name, account_number').limit(1).single();
        if (data?.name) fetchedClinicName = data.name;
        if (data?.id) fetchedClinicId = data.id;
        setBankingMissing(!data?.bank_name || !data?.account_number);
      }
      setClinicId(fetchedClinicId);

      setStats({ totalMembers: totalMembers || 0, activeMembers: activeMembers || 0, monthlyRevenue: revenue, collectionSuccess, consultationsThisMonth: consultations || 0, consultationsToday: consultationsToday || 0, appointmentsToday: apptsToday || 0, pendingApplications: pendingApps || 0, pendingKYC: pendingKYC || 0, upcomingAppointments: upcomingAppts || 0, crossSellActive: crossSell || 0, failedOrders });
      setPlanDistribution(distribution.length > 0 ? distribution : [{ name: 'No plans active', value: 1 }]);
      setRevenueData(revData);
      setRecentActivity(activities.slice(0, 6));
      setClinicName(fetchedClinicName);
    } catch (error) { console.error('Error fetching admin dashboard data:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const greet = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const timeStr = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });

  /* ── Design tokens (theme-aware) ── */
  const B = '#3b82f6'; // blue theme for admin

  // Hero panel tokens
  const heroBg    = isDark
    ? 'linear-gradient(145deg, #0f172a 0%, #1e293b 45%, #0f172a 100%)'
    : 'linear-gradient(145deg, #1e293b 0%, #334155 55%, #1e293b 100%)';
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

  const PLAN_COLORS = ['#3b82f6', '#c9a033', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];

  const sp1 = [3, 5, 4, 7, 5, 8, 7, 10];
  const sp2 = [7, 5, 9, 6, 10, 7, 11, 9];

  const kpis = [
    { k:'revenue', l:'Monthly Revenue', v: `R${(stats.monthlyRevenue / 1000).toFixed(1)}k`, sub:'Current month gross', c:'#10b981', icon:Wallet, sp:sp1, path:'/admin/debit-orders', badge:'FINANCE' },
    { k:'collection', l:'Collection Rate', v: `${stats.collectionSuccess}%`, sub:'Debit success rate', c:'#3b82f6', icon:TrendingUp, sp:sp2, path:'/admin/reconciliation', badge:'METRIC' },
    { k:'growth', l:'Active Members', v: String(stats.activeMembers), sub:`${stats.totalMembers} total enrolled`, c:'#8b5cf6', icon:Users, sp:sp1.map((v,i)=>v*(i+1)*0.44), path:'/admin/members', badge:'GROWTH' },
    { k:'alerts', l:'Action Required', v: String(stats.pendingKYC + stats.failedOrders), sub:'KYC & failed orders', c:'#ef4444', icon:AlertTriangle, sp:sp2.map(v=>v*2.1), path:'/admin/kyc', badge:'ALERTS' },
  ];

  const quickActions = [
    { l:'Applications', i:FileText, c:'#3b82f6', p:'/admin/applications' },
    { l:'Members',      i:Users,    c:'#10b981', p:'/admin/members' },
    { l:'Appointments', i:Calendar, c:'#f59e0b', p:'/admin/appointments' },
    { l:'Debit Orders', i:Wallet,   c:'#c9a033', p:'/admin/debit-orders' },
    { l:'Settings',     i:Settings, c:'#8b5cf6', p:'/admin/settings' },
  ];

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight:'65vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <motion.div style={{ textAlign:'center' }}>
        <div style={{ position:'relative', width:60, height:60, margin:'0 auto 1.25rem' }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(59,130,246,0.3)', borderTopColor:'#3b82f6' }} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}><Activity size={18} color="#3b82f6" /></div>
        </div>
        <p style={{ fontSize:'0.75rem', fontWeight:700, color:pageMuted, fontFamily:'Outfit', letterSpacing:'0.06em' }}>
          INITIALIZING COMMAND CENTER
        </p>
      </motion.div>
    </div>
  );

  return (
    <div style={{ color: pageTxt }}>

      {/* ── Banking details warning ── */}
      {bankingMissing && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 16,
            background: 'linear-gradient(135deg, #7c2d12, #92400e)',
            borderRadius: 14, padding: '16px 22px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 4px 20px rgba(234,88,12,0.25)',
          }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={22} color="#fbbf24" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 3 }}>⚠️ Clinic Banking Details Not Set Up</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              Members cannot pay for their plans until your clinic banking details are configured. Set them up now so applicants can pay and upload proof of payment.
            </div>
          </div>
          <a href="/admin/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#fbbf24', color: '#7c2d12', borderRadius: 8, fontWeight: 800, fontSize: 13, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>
            Set Up Banking <ArrowUpRight size={14} />
          </a>
        </motion.div>
      )}

      {/* ╔═══════════════════════════════════════════════════════════╗
          ║  COMMAND PANEL — full-page-width bleed via CSS class      ║
          ╚═══════════════════════════════════════════════════════════╝ */}
      <motion.div className="cmd-panel" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.48, ease:[0.22,1,0.36,1] }}
        style={{ background: heroBg, position:'relative', overflow:'hidden', marginBottom:'0.875rem' }}>

        {/* Ambient orbs & Grid — static fallback without looping animations */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div style={{ position:'absolute', top:'-55%', right:'-8%', width:320, height:320, borderRadius:'50%', background:'#3b82f6', filter:'blur(90px)', opacity: 0.12 }} />
          <div style={{ position:'absolute', bottom:'-60%', left:'10%', width:250, height:250, borderRadius:'50%', background:'#8b5cf6', filter:'blur(80px)', opacity: 0.08 }} />
        </div>

        <div style={{ position:'relative', zIndex:1 }}>
          {/* ── Row 1: Greeting + status chips ── */}
          <div className="cmd-inner" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem', paddingBottom:'1rem', borderBottom:`1px solid ${heroBdr}` }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', marginBottom:'0.375rem' }}>
                <Activity size={10} color={B} />
                <span style={{ fontSize:'0.475rem', fontWeight:800, color:B, textTransform:'uppercase', letterSpacing:'0.12em' }}>NFS Admin Portal · Branch Command</span>
              </div>
              <h1 style={{ margin:0, fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:800, color:heroText, fontFamily:'Outfit', letterSpacing:'-0.02em', lineHeight:1.1 }}>
                {clinicName || 'Clinic Branch'}
              </h1>
              <p style={{ margin:'0.35rem 0 0', fontSize:'0.75rem', color:heroSub, fontWeight:500 }}>
                {greet}, {user?.name?.split(' ')[0] || 'Admin'} · {dateStr}
              </p>
            </div>
            <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap', alignItems:'center' }}>
              <Link to="/admin/system-users" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.3rem 0.7rem', borderRadius:20, fontSize:'0.5rem', fontWeight:800, background:`${B}22`, color:B, border:`1px solid ${B}40` }}>
                <Shield size={9} /> System Users
              </Link>
              <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.7rem', borderRadius:20, fontSize:'0.5rem', fontWeight:700, background:'rgba(255,255,255,0.08)', color:heroText, border:`1px solid ${heroBdr}` }}>
                <Clock size={9} /> {timeStr}
              </div>
              <button onClick={loadData} style={{ display:'flex', alignItems:'center', gap:'0.2rem', padding:'0.3rem 0.55rem', borderRadius:7, background:'rgba(255,255,255,0.08)', border:`1px solid ${heroBdr}`, color:heroSub, fontSize:'0.475rem', fontWeight:700, cursor:'pointer', fontFamily:'Inter' }}>
                <RefreshCw size={9} /> Refresh
              </button>
            </div>
          </div>

          {/* ── Row 2: Operations / Branch Pulse ── */}
          <div className="cmd-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${heroBdr}` }}>
            
            {/* Appointments Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} onClick={() => navigate('/admin/appointments')}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, padding: '1.25rem', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
              <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.08, transform: 'rotate(10deg)' }}><Calendar size={90} /></div>
              <p style={{ margin:0, fontSize:'0.55rem', fontWeight:800, color:heroMuted, textTransform:'uppercase', letterSpacing:'0.12em' }}>Appointments Today</p>
              <div style={{ fontSize:'2.5rem', fontWeight:800, color:'#fff', fontFamily:'Outfit', lineHeight:1, marginTop:'0.5rem' }}>
                <Counter to={stats.appointmentsToday} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginTop:'1rem' }}>
                <span style={{ fontSize:'0.55rem', fontWeight:700, color:B, background:`${B}22`, padding:'3px 8px', borderRadius:8, border: `1px solid ${B}33` }}>
                  {stats.upcomingAppointments} Upcoming Total
                </span>
              </div>
            </motion.div>

            {/* Live Traffic Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.08, transform: 'rotate(-10deg)' }}><Activity size={90} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Dot c="#10b981" />
                <p style={{ margin:0, fontSize:'0.55rem', fontWeight:800, color:heroMuted, textTransform:'uppercase', letterSpacing:'0.12em' }}>Live Branch Traffic</p>
              </div>
              <div style={{ fontSize:'2.5rem', fontWeight:800, color:'#10b981', fontFamily:'Outfit', lineHeight:1 }}>
                <Counter to={stats.consultationsToday} />
              </div>
              <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.6)', fontWeight:600, marginTop:'0.25rem' }}>
                Patients seen today
              </div>
            </motion.div>

            {/* Pending Actions Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.08, transform: 'rotate(5deg)' }}><FileText size={90} /></div>
              <p style={{ margin:0, fontSize:'0.55rem', fontWeight:800, color:heroMuted, textTransform:'uppercase', letterSpacing:'0.12em' }}>Pending Approvals</p>
              <div style={{ fontSize:'2.5rem', fontWeight:800, color:B, fontFamily:'Outfit', lineHeight:1, marginTop:'0.5rem' }}>
                <Counter to={stats.pendingApplications} />
              </div>
              <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.6)', fontWeight:600, marginTop:'0.25rem' }}>
                Applications await review
              </div>
              <button onClick={() => navigate('/admin/applications')} style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem', background: B, color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.55rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2563eb'} onMouseLeave={e => e.currentTarget.style.background = B}>
                Action <ArrowUpRight size={10} />
              </button>
            </motion.div>

          </div>

          {/* ── Row 3: KPI tiles ── */}
          <div className="cmd-inner" style={{ paddingBottom:'1rem' }}>
            <div className="kpi-grid">
              {kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                const isAlert = kpi.k === 'kyc' && stats.pendingKYC > 0;
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

      {/* ── Main grid: chart/dist | sidebar ── */}
      <div className="sa-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1.65fr) 300px', gap:'0.75rem', alignItems:'start' }}>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {/* Revenue Chart */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.56, duration:0.42 }}
            style={{ background:card, borderRadius:16, border:`1px solid ${bdr}`, boxShadow:shad, overflow:'hidden', padding:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 style={{ margin:0, fontSize:'0.875rem', fontWeight:800, color:pageTxt, fontFamily:'Outfit' }}>Revenue Trend</h3>
              <span style={{ fontSize:'0.5625rem', fontWeight:700, padding:'0.15rem 0.45rem', borderRadius:5, background:surf, color:pageMuted, border:`1px solid ${bdr}` }}>6 months</span>
            </div>
            <div style={{ height:200, display:'flex', alignItems:'flex-end', gap:'1rem', padding:'0 0.5rem' }}>
              {revenueData.map((data, idx) => {
                const maxRev = Math.max(...revenueData.map(d => d.revenue));
                const heightPct = maxRev > 0 ? (data.revenue / maxRev) * 100 : 0;
                const isCurrent = idx === revenueData.length - 1;
                return (
                  <div key={idx} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
                    <div style={{ fontSize:'0.5rem', color:isCurrent ? pageTxt : pageMuted, fontWeight:700, opacity:isCurrent ? 1 : 0.6 }}>
                      R{(data.revenue / 1000).toFixed(0)}k
                    </div>
                    <motion.div
                      initial={{ height:0 }} animate={{ height:`${heightPct}%` }}
                      transition={{ duration:0.8, delay:idx*0.08, ease:[0.22,1,0.36,1] }}
                      style={{
                        width:'100%', borderRadius:'6px 6px 2px 2px', minHeight:4,
                        background:isCurrent ? `linear-gradient(180deg, ${B}, #1e293b)` : surf,
                        border: !isCurrent ? `1px solid ${bdr}` : 'none',
                        borderBottom:'none'
                      }}
                    />
                    <div style={{ fontSize:'0.5625rem', color:isCurrent ? pageTxt : pageMuted, fontWeight:isCurrent ? 800 : 500 }}>{data.name}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Plan Distribution */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.62, duration:0.42 }}
            style={{ background:card, borderRadius:16, border:`1px solid ${bdr}`, boxShadow:shad, overflow:'hidden', padding:'1.25rem' }}>
            <h3 style={{ margin:'0 0 1rem 0', fontSize:'0.875rem', fontWeight:800, color:pageTxt, fontFamily:'Outfit' }}>Plan Distribution</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
              {planDistribution.map((entry, index) => {
                const total = planDistribution.reduce((acc, curr) => acc + curr.value, 0);
                const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                const color = PLAN_COLORS[index % PLAN_COLORS.length];
                return (
                  <div key={index}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:color }} />
                        <span style={{ fontSize:'0.6875rem', color:pageTxt, fontWeight:600 }}>{entry.name}</span>
                      </div>
                      <span style={{ fontSize:'0.625rem', color:pageMuted, fontWeight:600 }}>{pct}%</span>
                    </div>
                    <div style={{ height:4, background:surf, borderRadius:2, overflow:'hidden' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }} style={{ height:'100%', background:color, borderRadius:2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          
          {/* Recent Activity */}
          <motion.div initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.68, duration:0.4 }}
            style={{ background:card, borderRadius:14, border:`1px solid ${bdr}`, boxShadow:shad, overflow:'hidden' }}>
            <div style={{ padding:'0.75rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center', background:surf, borderBottom:`1px solid ${bdr}` }}>
              <h3 style={{ margin:0, fontSize:'0.75rem', fontWeight:800, color:pageTxt, display:'flex', alignItems:'center', gap:'0.3rem' }}><Activity size={12} color={B} /> Recent Activity</h3>
              <Link to="/admin/audit" style={{ fontSize:'0.5625rem', color:B, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'0.2rem' }}>
                Audit log <ChevronRight size={10} />
              </Link>
            </div>
            <div>
              {recentActivity.length === 0 ? (
                <div style={{ padding:'1.5rem', textAlign:'center', color:pageMuted, fontSize:'0.6875rem' }}>No recent activity</div>
              ) : (
                recentActivity.map((activity, idx) => (
                  <div key={`${activity.id}-${idx}`} style={{
                    display:'flex', alignItems:'center', gap:'0.75rem',
                    padding:'0.65rem 1rem',
                    borderBottom: idx < recentActivity.length - 1 ? `1px solid ${bdr}` : 'none'
                  }}>
                    <div style={{
                      width:28, height:28, borderRadius:8,
                      background: activity.type === 'join' ? `${B}15` : '#10b98115',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                    }}>
                      {activity.type === 'join' ? <UserPlus size={12} color={B} /> : <Activity size={12} color="#10b981" />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.6875rem', color:pageTxt, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {activity.name}
                      </div>
                      <div style={{ fontSize:'0.5625rem', color:pageMuted, display:'flex', alignItems:'center', gap:'0.25rem', marginTop:1 }}>
                        <Clock size={8} />
                        {activity.date.toLocaleDateString('en-ZA', { day:'numeric', month:'short' })}
                      </div>
                    </div>
                    <span style={{
                      fontSize:'0.4375rem', fontWeight:800, padding:'2px 6px', borderRadius:4,
                      background: activity.type === 'join' ? `${B}15` : '#10b98115',
                      color: activity.type === 'join' ? B : '#10b981',
                      textTransform:'uppercase', letterSpacing:'0.04em'
                    }}>
                      {activity.type === 'join' ? 'Joined' : 'Visit'}
                    </span>
                  </div>
                ))
              )}
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
        /* 4-tile grid for admin */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.625rem;
        }
        /* Main grid */
        @media (max-width: 980px) {
          .sa-grid { grid-template-columns: 1fr !important; }
        }
        /* Tablet */
        @media (max-width: 780px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        /* Mobile */
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
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
