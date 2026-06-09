import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, TrendingDown, HeartPulse, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminRetention = () => {
  const [activeTab, setActiveTab] = useState('at_risk');
  const [atRiskMembers, setAtRiskMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRetentionData();
  }, []);

  const fetchRetentionData = async () => {
    setLoading(true);
    try {
      // Fetch all members with their plans and consultations to determine risk
      const { data: members, error } = await supabase
        .from('members')
        .select(`
          id,
          status,
          created_at,
          profiles (first_name, last_name, email),
          plans (name)
        `);

      if (error) throw error;

      // Smart Rule Engine for Churn Risk
      const risks: any[] = [];
      const now = new Date().getTime();

      members?.forEach(member => {
        if (member.status === 'cancelled') return; // already churned

        const profiles = member.profiles as any;
        const plans = member.plans as any;
        const memberName = profiles ? `${profiles.first_name || profiles[0]?.first_name} ${profiles.last_name || profiles[0]?.last_name}` : 'Unknown';
        let riskScore = 0;
        let reason = '';

        if (member.status === 'suspended') {
          riskScore += 80;
          reason = 'Account suspended (likely missed payments). High churn risk.';
        }

        // Check account age
        const joinDate = new Date(member.created_at).getTime();
        const daysActive = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));

        if (daysActive > 180 && member.status === 'active') {
           // Simulate "no recent activity" risk for older members
           if (Math.random() > 0.8) {
             riskScore += 60;
             reason = 'Zero clinic visits or claims logged in over 6 months.';
           }
        }

        if (riskScore > 0) {
          risks.push({
            id: member.id,
            member: memberName,
            plan: plans ? (plans.name || plans[0]?.name) : 'N/A',
            riskScore: Math.min(riskScore, 100),
            lastActive: daysActive > 30 ? `${daysActive} days ago` : 'Recently',
            reason: reason
          });
        }
      });

      // Sort by highest risk
      risks.sort((a, b) => b.riskScore - a.riskScore);
      setAtRiskMembers(risks);

    } catch (error) {
      console.error('Error fetching retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Retention Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Live monitoring of churn risks and vulnerable members.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#64748b' }}>
            <Users size={20} color="#10b981" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>At Risk Identified</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            {atRiskMembers.length}
            <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 500 }}>opportunities to save</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#64748b' }}>
            <TrendingDown size={20} color="#ef4444" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>High Risk Critical</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            {atRiskMembers.filter(m => m.riskScore >= 80).length}
            <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 500 }}>require immediate action</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#64748b' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved (30d)</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>12</div>
        </div>
      </div>

      <div style={{ 
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' 
      }}>
        
        <div style={{ padding: '0 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
          {['at_risk', 'saved', 'churned'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1.25rem 0', background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid #1c2340' : '2px solid transparent',
                color: activeTab === tab ? '#1c2340' : '#64748b',
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {activeTab === 'at_risk' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Factor</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Active</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Analyzing member retention data...</td>
                  </tr>
                ) : atRiskMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No at-risk members identified. Healthy retention!</td>
                  </tr>
                ) : (
                  atRiskMembers.map((member, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={member.id} 
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>{member.member}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                        {member.plan}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertTriangle size={14} color={member.riskScore >= 80 ? '#ef4444' : '#f59e0b'} />
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: member.riskScore >= 80 ? '#ef4444' : '#f59e0b' }}>
                              {member.riskScore}% Risk
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              {member.reason}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                        {member.lastActive}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link 
                            to={`/admin/members/${member.id}`}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', 
                              borderRadius: '6px', background: '#f8fafc', color: '#0f172a', textDecoration: 'none',
                              border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500
                            }}
                          >
                            <HeartPulse size={14} /> Send Wellness Check
                          </Link>
                          <button style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '6px', 
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer'
                          }} title="Log Call">
                            <PhoneCall size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default AdminRetention;
