import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { Search, FileSignature, Download, Filter, User, Calendar, Activity } from 'lucide-react';
const AdminAgreements = () => {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgreement, setSelectedAgreement] = useState<any | null>(null);

  useEffect(() => {
    fetchAgreements();
  }, [statusFilter]);

  const fetchAgreements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('signed_agreements')
        .select(`
          id,
          status,
          signed_at,
          members (
            profiles (first_name, last_name, sa_id_number)
          ),
          agreement_templates (title, version)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAgreements(data || []);
    } catch (error) {
      console.error('Error fetching agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgreements = agreements.filter(agreement => {
    const profile = agreement.members?.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
    const idNum = profile?.sa_id_number || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || idNum.includes(query);
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return { bg: '#fef9c3', text: '#854d0e' };
      case 'signed': return { bg: '#f0fdf4', text: '#15803d' };
      case 'revoked': return { bg: '#fef2f2', text: '#b91c1c' };
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
            Agreements
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Track member terms, conditions, and membership contracts.
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
            <Download size={16} /> Export Register
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
            {['all', 'pending', 'signed', 'expired', 'revoked'].map(status => (
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
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agreement Type</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Signed</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading agreements...</td>
                </tr>
              ) : filteredAgreements.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <FileSignature size={32} color="#cbd5e1" />
                      <span>No agreements found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAgreements.map((agreement) => {
                  const colors = getStatusColor(agreement.status);
                  const profile = agreement.members?.profiles;
                  const template = agreement.agreement_templates;
                  
                  return (
                    <tr key={agreement.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>
                          {profile?.first_name} {profile?.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          ID: {profile?.sa_id_number || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>
                          {template?.title || 'Unknown Agreement'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          v{template?.version}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: colors.bg,
                          color: colors.text,
                          textTransform: 'capitalize'
                        }}>
                          {agreement.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {agreement.signed_at ? new Date(agreement.signed_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedAgreement(agreement)}
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0.375rem 0.75rem', borderRadius: '6px', 
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
                            fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          View Document
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
        isOpen={!!selectedAgreement}
        onClose={() => setSelectedAgreement(null)}
        title="Agreement Details"
        maxWidth="600px"
      >
        {selectedAgreement && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 600
              }}>
                <FileSignature size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  {selectedAgreement.agreement_templates?.title || 'Unknown Agreement'}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Version {selectedAgreement.agreement_templates?.version}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> Member Name
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedAgreement.members?.profiles?.first_name} {selectedAgreement.members?.profiles?.last_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  ID: {selectedAgreement.members?.profiles?.sa_id_number}
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Calendar size={14} /> Signed Date
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedAgreement.signed_at ? new Date(selectedAgreement.signed_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Activity size={14} /> Agreement Status
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500, textTransform: 'capitalize' }}>
                  {selectedAgreement.status}
                </div>
              </div>
            </div>

            <div style={{ height: '200px', background: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '0.5rem' }}>
              <FileSignature size={32} color="#94a3b8" />
              <span>Document preview not available in this environment.</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#1c2340', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} /> Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminAgreements;
