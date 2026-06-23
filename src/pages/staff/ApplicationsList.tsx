import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Search, Filter, Eye, FileText, User, Calendar, Activity } from 'lucide-react';
import Modal from '../../components/Modal';

const ApplicationsList = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('submitted');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const fetchApps = async () => {
    setLoading(true);
    let query = supabase.from('applications').select('*, plans(name)').order('created_at', { ascending: false });
    
    if (user?.clinicId) query = query.eq('clinic_id', user.clinicId);
    if (filter !== 'all') query = query.eq('status', filter);
    
    const { data } = await query;
    if (data) setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, [user, filter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await supabase.from('applications').update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq('id', id);
    fetchApps();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review and process new membership applications.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
           <select className="form-input" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
             <option value="submitted">Pending Review</option>
             <option value="approved">Approved</option>
             <option value="rejected">Rejected</option>
             <option value="all">All Applications</option>
           </select>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Date</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Applicant</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Plan</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--sp-4)', color: 'var(--text-secondary)' }}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 'var(--sp-4)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{app.applicant_name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{app.applicant_id_number}</div>
                    </td>
                    <td style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>{app.plans?.name}</td>
                    <td style={{ padding: 'var(--sp-4)' }}>
                      <span className={`section-badge ${app.status === 'approved' ? 'section-badge-gold' : ''}`}>{app.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: 'var(--sp-4)', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--sp-2)' }}>
                        <button 
                          className="btn btn-ghost" 
                          onClick={() => setSelectedApp(app)} 
                          style={{ padding: 'var(--sp-2)' }}
                          title="View Details"
                        >
                          <Eye size={16}/>
                        </button>
                        {app.status === 'submitted' && (
                          <>
                             <button className="btn btn-ghost" onClick={() => handleUpdateStatus(app.id, 'rejected')} style={{ padding: 'var(--sp-2)', color: 'var(--status-error)' }}><X size={16}/></button>
                             <button className="btn btn-primary" onClick={() => handleUpdateStatus(app.id, 'approved')} style={{ padding: 'var(--sp-2)' }}><Check size={16}/></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>

      <Modal 
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        maxWidth="600px"
      >
        {selectedApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: 'var(--bg-surface-sunken)', color: 'var(--navy)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 600
              }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--navy)' }}>
                  {selectedApp.applicant_name}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Applied on {new Date(selectedApp.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> ID Number
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500 }}>
                  {selectedApp.applicant_id_number}
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Calendar size={14} /> Plan Selected
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500 }}>
                  {selectedApp.plans?.name || 'N/A'}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Activity size={14} /> Status
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500, textTransform: 'capitalize' }}>
                  <span className={`section-badge ${selectedApp.status === 'approved' ? 'section-badge-gold' : ''}`}>{selectedApp.status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {selectedApp.status === 'submitted' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { handleUpdateStatus(selectedApp.id, 'approved'); setSelectedApp(null); }} 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Check size={18} /> Approve
                </button>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => { handleUpdateStatus(selectedApp.id, 'rejected'); setSelectedApp(null); }} 
                  style={{ flex: 1, color: 'var(--status-error)', border: '1px solid var(--status-error)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <X size={18} /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ApplicationsList;





