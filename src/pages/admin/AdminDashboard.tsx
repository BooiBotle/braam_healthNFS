import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, CreditCard, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingApps: 0,
    monthlyRevenue: 0,
    activePlans: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      // 1. Total Active Members
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // 2. Pending Applications
      const { count: appsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');

      // 3. Active Plans count
      const { count: plansCount } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // In a real app, revenue would be aggregated via an RPC call or by summing billing_records.
      // Mocking revenue based on members count for display purposes, since we don't have a direct sum aggregate API on client.
      const mockRevenue = (membersCount || 0) * 850; 

      setStats({
        totalMembers: membersCount || 0,
        pendingApps: appsCount || 0,
        monthlyRevenue: mockRevenue,
        activePlans: plansCount || 0
      });

      setLoading(false);
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Admin Portal...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Clinic management and financial overview.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <button className="btn btn-outline"><BarChart3 size={16} /> Generate Report</button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
        <div className="card card-interactive" style={{ padding: 'var(--sp-6)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--gold)', opacity: 0.05, borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
            <div style={{ background: 'var(--accent-subtle)', padding: 'var(--sp-2)', borderRadius: 'var(--radius-md)', color: 'var(--navy)' }}><Users size={20} /></div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--status-success)', display: 'flex', alignItems: 'center' }}><TrendingUp size={12} style={{marginRight:'4px'}} /> +12%</span>
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{stats.totalMembers}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-1)' }}>Total Active Members</div>
        </div>

        <div className="card card-interactive" style={{ padding: 'var(--sp-6)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--navy)', opacity: 0.05, borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
            <div style={{ background: 'var(--gold-subtle)', padding: 'var(--sp-2)', borderRadius: 'var(--radius-md)', color: 'var(--gold)' }}><CreditCard size={20} /></div>
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>R {(stats.monthlyRevenue).toLocaleString()}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-1)' }}>Est. Monthly Revenue</div>
        </div>

        <div className="card card-interactive" style={{ padding: 'var(--sp-6)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
            <div style={{ background: 'rgba(34, 160, 107, 0.1)', padding: 'var(--sp-2)', borderRadius: 'var(--radius-md)', color: 'var(--status-success)' }}><FileText size={20} /></div>
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{stats.pendingApps}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-1)' }}>Pending Applications</div>
        </div>

        <div className="card card-interactive" style={{ padding: 'var(--sp-6)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
            <div style={{ background: 'var(--accent-subtle)', padding: 'var(--sp-2)', borderRadius: 'var(--radius-md)', color: 'var(--text-heading)' }}><Activity size={20} /></div>
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{stats.activePlans}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-1)' }}>Active Plans</div>
        </div>
      </div>

      {/* Admin Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-6)' }}>
        
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-4)', color: 'var(--text-heading)' }}>System Management</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <button className="btn btn-outline" style={{ justifyContent: 'space-between', width: '100%', padding: 'var(--sp-4)' }}>
              Manage Staff Roles <ChevronRight size={16} color="var(--text-muted)" />
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'space-between', width: '100%', padding: 'var(--sp-4)' }}>
              Edit Plan Pricing <ChevronRight size={16} color="var(--text-muted)" />
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'space-between', width: '100%', padding: 'var(--sp-4)' }}>
              Clinic Settings <ChevronRight size={16} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'var(--bg-surface-sunken)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gold-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--sp-4)' }}>
            <BarChart3 size={24} color="var(--gold)" />
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-2)', color: 'var(--text-heading)' }}>Financial Reports</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)', maxWidth: '200px' }}>Generate detailed CSV reports for billing and analytics.</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>Export Data</button>
        </div>

      </div>

    </motion.div>
  );
};

export default AdminDashboard;
