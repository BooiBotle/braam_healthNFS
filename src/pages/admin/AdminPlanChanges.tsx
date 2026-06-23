import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { Search, ArrowRightLeft, ArrowRight, CheckCircle, XCircle, User, Calendar, Shield, Activity } from 'lucide-react';
const AdminPlanChanges = () => {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChange, setSelectedChange] = useState<any | null>(null);

  useEffect(() => {
    fetchPlanChanges();
  }, []);

  const fetchPlanChanges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plan_changes')
        .select(`
          id,
          status,
          effective_date,
          created_at,
          members (
            profiles (first_name, last_name, sa_id_number)
          ),
          from_plan:plans!from_plan_id (name, monthly_fee_cents),
          to_plan:plans!to_plan_id (name, monthly_fee_cents)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChanges(data || []);
    } catch (error) {
      console.error('Error fetching plan changes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChanges = changes.filter(change => {
    const profile = change.members?.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
    const idNum = profile?.sa_id_number || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || idNum.includes(query);
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return { bg: '#fef9c3', text: '#854d0e' };
      case 'approved': return { bg: '#f0fdf4', text: '#15803d' };
      case 'rejected': return { bg: '#fef2f2', text: '#b91c1c' };
      case 'cancelled': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <>
      <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Plan Changes
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Review and approve member plan upgrade or downgrade requests.
          </p>
        </div>
      </div>

      <div style={{ 
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' 
      }}>
        
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by member name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '0.875rem', color: '#0f172a', outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change Request</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Effective Date</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading plan changes...</td>
                </tr>
              ) : filteredChanges.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <ArrowRightLeft size={32} color="#cbd5e1" />
                      <span>No plan changes found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredChanges.map((change) => {
                  const colors = getStatusColor(change.status);
                  const profile = change.members?.profiles;
                  const fromPlan = change.from_plan;
                  const toPlan = change.to_plan;
                  const isUpgrade = toPlan?.monthly_fee_cents > fromPlan?.monthly_fee_cents;
                  
                  return (
                    <tr key={change.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>
                          {profile?.first_name} {profile?.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          ID: {profile?.sa_id_number || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <span style={{ color: '#64748b' }}>{fromPlan?.name}</span>
                          <ArrowRight size={14} color={isUpgrade ? '#10b981' : '#f59e0b'} />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{toPlan?.name}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                          Diff: R {Math.abs((toPlan?.monthly_fee_cents - fromPlan?.monthly_fee_cents) / 100).toLocaleString()} {isUpgrade ? 'more' : 'less'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {change.effective_date ? new Date(change.effective_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Next billing cycle'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: colors.bg,
                          color: colors.text,
                          textTransform: 'capitalize'
                        }}>
                          {change.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        {change.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button style={{ 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '28px', height: '28px', borderRadius: '6px', 
                              background: '#fef2f2', color: '#b91c1c', border: 'none', cursor: 'pointer'
                            }}>
                              <XCircle size={16} />
                            </button>
                            <button style={{ 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '28px', height: '28px', borderRadius: '6px', 
                              background: '#f0fdf4', color: '#15803d', border: 'none', cursor: 'pointer'
                            }}>
                              <CheckCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setSelectedChange(change)}
                            style={{ 
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              padding: '0.375rem 0.75rem', borderRadius: '6px', 
                              background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
                              fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </motion.div>

      <Modal 
        isOpen={!!selectedChange}
        onClose={() => setSelectedChange(null)}
        title="Plan Change Request"
        maxWidth="600px"
      >
        {selectedChange && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: selectedChange.status === 'approved' ? '#dcfce7' : selectedChange.status === 'rejected' ? '#fee2e2' : '#fef9c3', 
                color: selectedChange.status === 'approved' ? '#16a34a' : selectedChange.status === 'rejected' ? '#ef4444' : '#ca8a04', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 600
              }}>
                <ArrowRightLeft size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  {selectedChange.members?.profiles?.first_name} {selectedChange.members?.profiles?.last_name}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Requested on {new Date(selectedChange.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> ID Number
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedChange.members?.profiles?.sa_id_number || 'N/A'}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Calendar size={14} /> Effective Date
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedChange.effective_date ? new Date(selectedChange.effective_date).toLocaleDateString() : 'Next billing cycle'}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Shield size={14} /> Plan Change Details
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#0f172a', fontWeight: 500 }}>
                  <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>{selectedChange.from_plan?.name}</div>
                  <ArrowRight size={20} color="#64748b" />
                  <div style={{ padding: '0.5rem', background: '#dbeafe', color: '#1e40af', borderRadius: '6px' }}>{selectedChange.to_plan?.name}</div>
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Activity size={14} /> Status
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500, textTransform: 'capitalize' }}>
                  {selectedChange.status}
                </div>
              </div>
            </div>

            {selectedChange.status === 'pending' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} /> Approve
                </button>
                <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={18} /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminPlanChanges;
