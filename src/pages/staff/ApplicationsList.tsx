import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Search, Filter } from 'lucide-react';

const ApplicationsList = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('submitted');

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
                      {app.status === 'submitted' && (
                        <div style={{ display: 'inline-flex', gap: 'var(--sp-2)' }}>
                           <button className="btn btn-ghost" onClick={() => handleUpdateStatus(app.id, 'rejected')} style={{ padding: 'var(--sp-2)', color: 'var(--status-error)' }}><X size={16}/></button>
                           <button className="btn btn-primary" onClick={() => handleUpdateStatus(app.id, 'approved')} style={{ padding: 'var(--sp-2)' }}><Check size={16}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default ApplicationsList;





