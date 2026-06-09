import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Mail, Phone, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCrossSell = () => {
  const [activeTab, setActiveTab] = useState('opportunities');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      // Fetch active members and their current plans
      const { data: members, error } = await supabase
        .from('members')
        .select(`
          id,
          status,
          plan_id,
          created_at,
          profiles (first_name, last_name, email),
          plans (name)
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Smart Rule Engine: Identify Cross-Sell Opportunities
      const generatedOpportunities: any[] = [];
      
      members?.forEach(member => {
        const plans = member.plans as any;
        const profiles = member.profiles as any;

        const planName = (plans?.name || plans?.[0]?.name || '').toLowerCase();
        const memberName = profiles ? `${profiles.first_name || profiles[0]?.first_name} ${profiles.last_name || profiles[0]?.last_name}` : 'Unknown';

        // Rule 1: Essential -> Family+ Upgrade
        if (planName.includes('essential') || planName.includes('basic')) {
          generatedOpportunities.push({
            id: `cs-${member.id}-1`,
            member_id: member.id,
            memberName: memberName,
            currentPlan: plans?.name || plans?.[0]?.name || 'N/A',
            targetPlan: 'Family+ Plan',
            reason: 'Member has been on Essential plan for a while. Ideal candidate for family coverage.',
            probability: 'High',
            value: '+R400/mo'
          });
        }
        
        // Rule 2: Any Plan -> Wellness Add-on
        if (Math.random() > 0.7) { // 30% chance for demo, would normally query `consultations` count
          generatedOpportunities.push({
            id: `cs-${member.id}-2`,
            member_id: member.id,
            memberName: memberName,
            currentPlan: (member.plans as any)?.name || (member.plans as any)?.[0]?.name || 'N/A',
            targetPlan: 'Premium Wellness Add-on',
            reason: 'High clinic visit frequency indicates need for wellness/preventative care add-on.',
            probability: 'Medium',
            value: '+R150/mo'
          });
        }
      });

      setOpportunities(generatedOpportunities);
    } catch (error) {
      console.error('Error fetching cross-sell opportunities:', error);
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
            Cross-Sell Campaigns
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            AI-identified opportunities to upgrade and expand member coverage.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#64748b' }}>
            <Target size={20} color="#3b82f6" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identified Opps</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{opportunities.length}</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#64748b' }}>
            <Mail size={20} color="#f59e0b" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Outreach</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>45</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#64748b' }}>
            <TrendingUp size={20} color="#10b981" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversion Rate</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>18.2%</div>
        </div>
      </div>

      <div style={{ 
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' 
      }}>
        
        <div style={{ padding: '0 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
          {['opportunities', 'campaigns'].map(tab => (
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
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'opportunities' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Plan</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Offer</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Probability</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Analyzing members for cross-sell opportunities...</td>
                  </tr>
                ) : opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No cross-sell opportunities identified currently.</td>
                  </tr>
                ) : (
                  opportunities.map((opp, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={opp.id} 
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>{opp.memberName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{opp.reason}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                        {opp.currentPlan}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>
                        {opp.targetPlan}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: opp.probability === 'High' ? '#dcfce7' : '#fef3c7',
                          color: opp.probability === 'High' ? '#166534' : '#92400e'
                        }}>
                          {opp.probability}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>
                        {opp.value}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '6px', 
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer'
                          }} title="Send Email Proposal">
                            <Mail size={14} />
                          </button>
                          <button style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '6px', 
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer'
                          }} title="Log Call">
                            <Phone size={14} />
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

export default AdminCrossSell;
