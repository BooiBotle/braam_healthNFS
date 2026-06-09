import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { QrCode, CreditCard, Activity, ShieldCheck, Download } from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [memberData, setMemberData] = useState<any>(null);
  const [consultationsThisMonth, setConsultationsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      // Fetch member + plan data
      const { data: member } = await supabase
        .from('members')
        .select(`
          *,
          plans(name, monthly_fee_cents, consultations_pm, includes_medication)
        `)
        .eq('profile_id', user.id)
        .single();
        
      if (member) {
        setMemberData(member);

        // Fetch consultations count for this month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { count } = await supabase
          .from('consultations')
          .select('*', { count: 'exact', head: true })
          .eq('member_id', member.id)
          .gte('consultation_date', startOfMonth);
          
        setConsultationsThisMonth(count || 0);
      }
      
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your portal...
      </div>
    );
  }

  // Fallback if no member record found
  const planName = memberData?.plans?.name || 'No Active Plan';
  const planFee = memberData?.plans?.monthly_fee_cents ? `R ${(memberData.plans.monthly_fee_cents / 100).toFixed(2)}` : 'R 0.00';
  const limit = memberData?.plans?.consultations_pm || 0;
  const isUnlimited = limit === -1;
  const usedPercentage = isUnlimited ? 0 : Math.min((consultationsThisMonth / limit) * 100, 100);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your health and membership details.</p>
        </div>
        <button className="btn btn-outline">
          <Download size={14} /> Download Statement
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        
        {/* Digital Card Widget - PREMIUM DESIGN */}
        <div className="card card-interactive" style={{ 
          background: 'var(--brand-gradient)', 
          color: 'white', padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', 
          position: 'relative', overflow: 'hidden', border: 'none',
          boxShadow: 'var(--shadow-glow-navy)'
        }}>
          {/* Abstract background shapes */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'var(--gold)', filter: 'blur(50px)', opacity: 0.2, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '200px', height: '200px', background: '#ffffff', filter: 'blur(60px)', opacity: 0.1, borderRadius: '50%' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-8)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--sp-1)' }}>
                NFS<span style={{opacity: 0.4}}>|</span>INSURE
              </div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>Braam Health Centre</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: 'var(--sp-1) var(--sp-3)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="var(--gold)" /> {memberData?.status?.toUpperCase() || 'PENDING'}
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
            <div style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 'var(--sp-6)', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              {memberData?.card_number || 'PENDING CARD'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Member Name</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', letterSpacing: '0.02em' }}>{user?.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Active Plan</div>
                <div style={{ fontWeight: 600, color: 'var(--gold)', fontSize: 'var(--text-base)' }}>{planName}</div>
              </div>
            </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: 'var(--sp-6)', right: 'var(--sp-6)', opacity: 0.15, zIndex: 0 }}>
             <QrCode size={120} color="white" />
          </div>
        </div>

        {/* Consultations Widget */}
        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--text-heading)' }}>
              <div style={{ background: 'var(--accent-subtle)', padding: 'var(--sp-2)', borderRadius: 'var(--radius-md)', color: 'var(--navy)' }}>
                <Activity size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Consultations</h3>
            </div>
            <span className="section-badge">This Month</span>
          </div>
          
          <div style={{ textAlign: 'center', margin: 'auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'var(--sp-2)' }}>
              <span style={{ fontSize: 'var(--text-5xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{consultationsThisMonth}</span>
              {!isUnlimited && (
                <span style={{ fontSize: 'var(--text-xl)', color: 'var(--text-muted)', fontWeight: 500 }}>/ {limit}</span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--sp-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
              {isUnlimited ? 'Unlimited Consultations Available' : 'Visits Used'}
            </p>
          </div>

          {!isUnlimited && (
            <div style={{ marginTop: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)', fontWeight: 600 }}>
                <span>Usage</span>
                <span>{usedPercentage.toFixed(0)}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-sunken)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${usedPercentage}%` }} 
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ height: '100%', backgroundColor: usedPercentage >= 100 ? 'var(--status-error)' : 'var(--gold)', borderRadius: 'var(--radius-full)' }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Plan & Billing Summary */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--text-heading)', marginBottom: 'var(--sp-6)' }}>
            <div style={{ background: 'var(--gold-subtle)', padding: 'var(--sp-2)', borderRadius: 'var(--radius-md)', color: 'var(--gold)' }}>
              <CreditCard size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Plan Details</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Current Plan</span>
              <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{planName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Monthly Premium</span>
              <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{planFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Medication Included</span>
              <span style={{ fontWeight: 600, color: memberData?.plans?.includes_medication ? 'var(--status-success)' : 'var(--text-muted)' }}>
                {memberData?.plans?.includes_medication ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
             <button className="btn btn-outline" style={{ width: '100%' }}>Upgrade Plan</button>
             <button className="btn btn-primary" style={{ width: '100%' }}>Book Visit</button>
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-4)', marginTop: 'var(--sp-10)' }}>Recent Activity</h3>
      <div className="card" style={{ padding: 'var(--sp-4)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <th style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>Date</th>
              <th style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>Activity</th>
              <th style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent activity found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </motion.div>
  );
};

export default MemberDashboard;




