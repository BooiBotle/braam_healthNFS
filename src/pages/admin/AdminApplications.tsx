import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Search, FileText, Download, User, Shield, Check, X, CreditCard, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { logAudit } from '../../lib/api/audit';

const AdminApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          application_type,
          status,
          applicant_name,
          applicant_id_number,
          submitted_at,
          plans (name)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatus = async (appId: string, status: string, applicantName: string) => {
    try {
      const { error } = await supabase.from('applications').update({ status, reviewed_at: new Date().toISOString() }).eq('id', appId);
      if (error) throw error;
      
      // Leave a footprint
      await logAudit({
        performed_by: user?.id || 'system',
        performer_name: user?.name || 'Admin',
        action: `application_${status}`,
        entity_type: 'application',
        entity_id: appId,
        details: `Application for ${applicantName} was ${status} by ${user?.name || 'Admin'}`,
      });

      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update application status');
    }
  };

  const filteredApps = applications.filter(app => {
    const name = (app.applicant_name || '').toLowerCase();
    const idNum = (app.applicant_id_number || '');
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || idNum.includes(query);
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'submitted': return { bg: '#fff7ed', text: '#c2410c' }; // Orange
      case 'awaiting_approval': return { bg: '#fef9c3', text: '#854d0e' }; // Yellow
      case 'approved': return { bg: '#f0fdf4', text: '#15803d' }; // Green
      case 'rejected': return { bg: '#fef2f2', text: '#b91c1c' }; // Red
      case 'cancelled': return { bg: '#f1f5f9', text: '#475569' }; // Gray
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
            Applications
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Review and manage new membership applications.
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
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ 
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' 
      }}>
        
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ 
            position: 'relative', maxWidth: '400px' 
          }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by applicant name or ID..." 
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
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading applications...</td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <FileText size={32} color="#cbd5e1" />
                      <span>No applications found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const colors = getStatusColor(app.status);
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>
                          {app.applicant_name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          ID: {app.applicant_id_number || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {app.plans?.name || 'Unknown Plan'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a', textTransform: 'capitalize' }}>
                        {app.application_type}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: colors.bg,
                          color: colors.text,
                          textTransform: 'capitalize'
                        }}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedApp(app)}
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0.375rem 0.75rem', borderRadius: '6px', 
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
                            fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          Review
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
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Review"
        maxWidth="600px"
      >
        {selectedApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: '#f1f5f9', color: '#475569', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 600
              }}>
                {selectedApp.applicant_name?.[0] || 'U'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#0f172a' }}>
                  {selectedApp.applicant_name || 'Unknown Applicant'}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Submitted on {new Date(selectedApp.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> ID Number
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedApp.applicant_id_number || 'N/A'}</div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Shield size={14} /> Requested Plan
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedApp.plans?.name || 'Unknown'}</div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Calendar size={14} /> Application Type
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500, textTransform: 'capitalize' }}>{selectedApp.application_type}</div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <CreditCard size={14} /> Status
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500, textTransform: 'capitalize' }}>{selectedApp.status.replace('_', ' ')}</div>
              </div>
            </div>

            {selectedApp.status === 'submitted' || selectedApp.status === 'awaiting_approval' ? (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => handleApplicationStatus(selectedApp.id, 'approved', selectedApp.applicant_name)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Check size={18} /> Approve
                </button>
                <button 
                  onClick={() => handleApplicationStatus(selectedApp.id, 'rejected', selectedApp.applicant_name)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
                >
                  <X size={18} /> Reject
                </button>
              </div>
            ) : (
              <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '8px', textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>
                This application has already been processed.
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminApplications;
