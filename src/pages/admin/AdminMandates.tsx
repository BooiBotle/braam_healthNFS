import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { Search, FileSignature, Filter, Download, User, Activity, CreditCard, Clock } from 'lucide-react';
const AdminMandates = () => {
  const [mandates, setMandates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMandate, setSelectedMandate] = useState<any | null>(null);

  useEffect(() => {
    fetchMandates();
  }, [statusFilter]);

  const fetchMandates = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('debit_mandates')
        .select(`
          id,
          status,
          mandate_type,
          bank_name,
          account_number,
          created_at,
          members (
            profiles (first_name, last_name, sa_id_number)
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMandates(data || []);
    } catch (error) {
      console.error('Error fetching mandates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMandates = mandates.filter(mandate => {
    const profile = mandate.members?.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
    const idNum = profile?.sa_id_number || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || idNum.includes(query);
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return { bg: '#fef9c3', text: '#854d0e' };
      case 'signed': return { bg: '#f0fdf4', text: '#15803d' };
      case 'cancelled': return { bg: '#fef2f2', text: '#b91c1c' };
      case 'expired': return { bg: '#f1f5f9', text: '#475569' };
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
            Debit Mandates
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage DebiCheck and NAEDO mandate authorizations.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '8px', 
              background: '#ffffff', color: '#0f172a', 
              border: '1px solid #e2e8f0', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div style={{ 
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' 
      }}>
        
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
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
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="#94a3b8" />
            {['all', 'pending', 'signed', 'cancelled', 'expired'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.4rem 0.75rem', borderRadius: '6px',
                  background: statusFilter === status ? '#1c2340' : 'transparent',
                  color: statusFilter === status ? '#ffffff' : '#64748b',
                  border: statusFilter === status ? '1px solid #1c2340' : '1px solid transparent',
                  fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Info</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading mandates...</td>
                </tr>
              ) : filteredMandates.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <FileSignature size={32} color="#cbd5e1" />
                      <span>No mandates found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMandates.map((mandate) => {
                  const colors = getStatusColor(mandate.status);
                  const profile = mandate.members?.profiles;
                  
                  // mask account number showing only last 4
                  const acctStr = mandate.account_number || '';
                  const maskedAcct = acctStr.length > 4 
                    ? `••••${acctStr.slice(-4)}` 
                    : acctStr;
                  
                  return (
                    <tr key={mandate.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>
                          {profile?.first_name} {profile?.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          ID: {profile?.sa_id_number || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                          {mandate.bank_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Acc: {maskedAcct}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                          background: mandate.mandate_type === 'debicheck' ? '#e0e7ff' : '#f1f5f9',
                          color: mandate.mandate_type === 'debicheck' ? '#4338ca' : '#475569',
                          textTransform: 'uppercase'
                        }}>
                          {mandate.mandate_type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: colors.bg,
                          color: colors.text,
                          textTransform: 'capitalize'
                        }}>
                          {mandate.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {new Date(mandate.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedMandate(mandate)}
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0.375rem 0.75rem', borderRadius: '6px', 
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
                            fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          View
                        </button>
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
        isOpen={!!selectedMandate}
        onClose={() => setSelectedMandate(null)}
        title="Mandate Details"
        maxWidth="600px"
      >
        {selectedMandate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: selectedMandate.status === 'signed' ? '#dcfce7' : selectedMandate.status === 'cancelled' ? '#fee2e2' : '#f1f5f9', 
                color: selectedMandate.status === 'signed' ? '#16a34a' : selectedMandate.status === 'cancelled' ? '#ef4444' : '#64748b', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 600
              }}>
                <FileSignature size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', textTransform: 'capitalize' }}>
                  {selectedMandate.mandate_type} Mandate
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Created on {new Date(selectedMandate.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> Member Name
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedMandate.members?.profiles?.first_name} {selectedMandate.members?.profiles?.last_name}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <CreditCard size={14} /> Bank Account
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedMandate.bank_name}<br />
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {(selectedMandate.account_number || '').length > 4 ? `••••${(selectedMandate.account_number || '').slice(-4)}` : selectedMandate.account_number}
                  </span>
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Activity size={14} /> Status
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500, textTransform: 'capitalize' }}>
                  {selectedMandate.status}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Clock size={14} /> ID Number
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedMandate.members?.profiles?.sa_id_number || 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                Resend Auth Request
              </button>
              {selectedMandate.status !== 'cancelled' && (
                <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel Mandate
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminMandates;
