import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CreditCard, Activity, AlertTriangle, 
  ChevronRight, Calendar, X, Shield, Edit2, CheckCircle,
  TrendingUp, Clock, Zap, Target, FileText, ArrowUpRight, Award, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    collectionSuccess: 0,
    consultationsThisMonth: 0,
    pendingApplications: 0,
    pendingKYC: 0,
    upcomingAppointments: 0,
    crossSellActive: 0,
    failedOrders: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 1. Members
        const { count: totalMembers } = await supabase.from('members').select('*', { count: 'exact', head: true });
        const { count: activeMembers } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active');
        
        // 2. Consultations this month
        const { count: consultations } = await supabase
          .from('consultations')
          .select('*', { count: 'exact', head: true })
          .gte('visited_at', startOfMonth.toISOString());
          
        // 3. Pending items & System Health
        const { count: pendingKYC } = await supabase.from('kyc_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending_review');
        const { count: pendingApps } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: upcomingAppts } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('appointment_date', new Date().toISOString());
        const { count: crossSell } = await supabase.from('cross_sell_pipeline').select('*', { count: 'exact', head: true }).eq('status', 'lead');
        
        // 4. Real Revenue Calculation from Debit Orders
        const { data: debits } = await supabase
          .from('debit_orders')
          .select('amount_cents, status')
          .gte('created_at', startOfMonth.toISOString());
        
        let revenue = 0;
        let successfulDebits = 0;
        let failedOrders = 0;
        
        if (debits && debits.length > 0) {
          debits.forEach(d => {
             if (d.status === 'successful') {
                successfulDebits++;
                revenue += d.amount_cents / 100;
             } else if (d.status === 'failed') {
                failedOrders++;
             }
          });
        }
        
        const totalProcessed = successfulDebits + failedOrders;
        const collectionSuccess = totalProcessed > 0 ? Math.round((successfulDebits / totalProcessed) * 100) : 100;
        
        // 5. Real Plan Distribution
        const { data: plans } = await supabase.from('plans').select('id, name');
        const { data: members } = await supabase.from('members').select('plan_id, status').eq('status', 'active');
        
        const planCounts: Record<string, number> = {};
        if (plans && members) {
          members.forEach(m => {
            const plan = plans.find(p => p.id === m.plan_id);
            if (plan) {
              planCounts[plan.name] = (planCounts[plan.name] || 0) + 1;
            }
          });
        }
        
        const distribution = Object.keys(planCounts).map(name => ({
          name, value: planCounts[name]
        })).sort((a, b) => b.value - a.value);
        
        // 6. Recent Activity (Mix of members joining and consultations)
        const { data: recentMembers } = await supabase
          .from('members')
          .select('id, created_at, profile_id, profiles(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(5);
          
        const { data: recentConsults } = await supabase
          .from('consultations')
          .select('id, visited_at, member_id, members(profile_id, profiles(first_name, last_name))')
          .order('visited_at', { ascending: false })
          .limit(5);
          
        const activities: any[] = [];
        if (recentMembers) {
          recentMembers.forEach((m: any) => activities.push({
            id: `mem-${m.id}`,
            type: 'join',
            name: `${m.profiles?.first_name || m.profiles?.[0]?.first_name} ${m.profiles?.last_name || m.profiles?.[0]?.last_name}`,
            date: new Date(m.created_at)
          }));
        }
        if (recentConsults) {
          recentConsults.forEach((c: any) => {
            const profile = Array.isArray(c.members?.profiles) ? c.members?.profiles[0] : c.members?.profiles;
            activities.push({
              id: `con-${c.id}`,
              type: 'consultation',
              name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Member',
              date: new Date(c.visited_at)
            });
          });
        }
        
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        // Mock Revenue Data for Chart (Historical context)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const revData = [];
        for (let i = 5; i >= 0; i--) {
          const mIdx = (currentMonthIdx - i + 12) % 12;
          revData.push({
            name: months[mIdx],
            revenue: i === 0 ? revenue : Math.floor(Math.random() * 20000) + 30000 // Mock past 5 months, actual current month
          });
        }

        setStats({
          totalMembers: totalMembers || 0,
          activeMembers: activeMembers || 0,
          monthlyRevenue: revenue,
          collectionSuccess: collectionSuccess,
          consultationsThisMonth: consultations || 0,
          pendingApplications: pendingApps || 0,
          pendingKYC: pendingKYC || 0,
          upcomingAppointments: upcomingAppts || 0,
          crossSellActive: crossSell || 0,
          failedOrders: failedOrders
        });
        
        setPlanDistribution(distribution.length > 0 ? distribution : [
          { name: 'No Plans active', value: 1 }
        ]);
        
        setRevenueData(revData);
        setRecentActivity(activities.slice(0, 6));
        
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const COLORS = ['#D4AF37', '#1c2340', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Activity size={32} color="var(--navy)" />
        </motion.div>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Initializing Command Center...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1400px', margin: '0 auto' }}
    >
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Command Center
            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--gold)', color: '#fff', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Real-time analytics and system oversight for Braam Health Centre.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link 
            to="/admin/system-users"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none',
              padding: '0.625rem 1.25rem', borderRadius: '8px',
              background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
            }}
          >
            <Shield size={16} color="var(--navy)" /> Manage System Users
          </Link>
          
          <Link 
            to="/admin/reports"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none',
              padding: '0.625rem 1.25rem', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)', 
              color: '#fff', border: 'none',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(28, 35, 64, 0.2)', transition: 'transform 0.2s'
            }}
          >
            <FileText size={16} /> Generate Reports
          </Link>
        </div>
      </div>

      {/* Hero Metrics (Glassmorphism) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Revenue Card */}
        <motion.div whileHover={{ y: -4 }} style={{ 
          background: 'linear-gradient(135deg, #1c2340 0%, #2a355a 100%)',
          borderRadius: '16px', padding: '1.5rem', color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(28, 35, 64, 0.4)'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'var(--gold)', filter: 'blur(50px)', opacity: 0.2, borderRadius: '50%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Revenue (MTD)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem', verticalAlign: 'top', opacity: 0.8, marginRight: '2px' }}>R</span>
                {stats.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
              <TrendingUp size={24} color="var(--gold)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
              <ArrowUpRight size={14} /> {stats.collectionSuccess}% Collection Rate
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              {stats.failedOrders} failed orders
            </div>
          </div>
        </motion.div>

        {/* Member Growth Card */}
        <motion.div whileHover={{ y: -4 }} style={{ 
          background: '#ffffff',
          borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden',
          border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Membership Base</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: '0.25rem' }}>
                {stats.activeMembers}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px' }}>
              <Users size={24} color="var(--navy)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#3b82f6', fontWeight: 600 }}>
              <Target size={14} /> {stats.totalMembers} Total Lifetime
            </div>
          </div>
          
          <div style={{ marginTop: '1.25rem', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${stats.totalMembers > 0 ? (stats.activeMembers / stats.totalMembers) * 100 : 0}%`, height: '100%', background: 'var(--navy)', borderRadius: '2px' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'right' }}>
            {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}% Retention
          </div>
        </motion.div>

        {/* Clinical Flow Card */}
        <motion.div whileHover={{ y: -4 }} style={{ 
          background: '#ffffff',
          borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden',
          border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Flow</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: '0.25rem' }}>
                {stats.consultationsThisMonth}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
              <Activity size={24} color="#10b981" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
              <Calendar size={14} /> {stats.upcomingAppointments} Upcoming Appts
            </div>
          </div>
        </motion.div>

      </div>

      {/* Action Strip & Pending Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <Link to="/admin/applications" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#3b82f6' }}><FileText size={20} /></div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{stats.pendingApplications}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>Pending Apps</div>
            </div>
          </motion.div>
        </Link>

        <Link to="/admin/cross-sell" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: '#8b5cf6' }}><Zap size={20} /></div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{stats.crossSellActive}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>Cross-sell Leads</div>
            </div>
          </motion.div>
        </Link>

        <Link to="/admin/kyc" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444' }}><AlertTriangle size={20} /></div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{stats.pendingKYC}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>KYC Reviews</div>
            </div>
          </motion.div>
        </Link>
        
      </div>

      {/* Middle Section: Charts & Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Dynamic Revenue Chart */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Revenue Growth (6 Months)</h3>
            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>ZAR</span>
          </div>
          
          <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', padding: '0 1rem' }}>
            {revenueData.map((data, idx) => {
              const maxRev = Math.max(...revenueData.map(d => d.revenue));
              const heightPct = maxRev > 0 ? (data.revenue / maxRev) * 100 : 0;
              const isCurrent = idx === revenueData.length - 1;
              
              return (
                <div key={idx} className="group" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    fontSize: '0.65rem', color: isCurrent ? 'var(--navy)' : '#94a3b8', fontWeight: 600,
                    opacity: isCurrent ? 1 : 0.5, transition: 'opacity 0.2s'
                  }}>
                    R{(data.revenue/1000).toFixed(1)}k
                  </div>
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: `${heightPct}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                    style={{ 
                      width: '100%', background: isCurrent ? 'var(--navy)' : '#e2e8f0', 
                      borderRadius: '6px 6px 0 0', minHeight: '4px', position: 'relative'
                    }} 
                  >
                    {isCurrent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gold)', borderRadius: '6px 6px 0 0' }} />}
                  </motion.div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: isCurrent ? 700 : 500 }}>{data.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Distribution */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: '1.5rem' }}>
            Active Plan Distribution
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
            {planDistribution.map((entry, index) => {
              const total = planDistribution.reduce((acc, curr) => acc + curr.value, 0);
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              
              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[index % COLORS.length] }} />
                      <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>{entry.name}</div>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{pct}% ({entry.value})</div>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                      style={{ height: '100%', background: COLORS[index % COLORS.length], borderRadius: '3px' }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent System Activity */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Live System Activity</h3>
          <Link to="/admin/audit" style={{ fontSize: '0.8125rem', color: 'var(--navy)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View Full Audit Log <ChevronRight size={14} />
          </Link>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentActivity.length === 0 ? (
            <div style={{ padding: '2rem', color: '#64748b', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>No recent activity found.</div>
          ) : (
            recentActivity.map((activity, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                key={`${activity.id}-${idx}`} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                  borderBottom: idx === recentActivity.length - 1 ? 'none' : '1px solid #f1f5f9',
                  transition: 'background 0.2s', borderRadius: '8px'
                }}
                className="hover-bg-slate-50"
              >
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '8px', 
                  background: activity.type === 'join' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {activity.type === 'join' ? <UserPlus size={16} color="#3b82f6" /> : <Activity size={16} color="#10b981" />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                    {activity.type === 'join' 
                      ? <><span style={{ fontWeight: 700 }}>{activity.name}</span> completed onboarding and joined</>
                      : <>Consultation logged for <span style={{ fontWeight: 700 }}>{activity.name}</span></>
                    }
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Clock size={12} />
                    {activity.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {activity.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default AdminDashboard;
