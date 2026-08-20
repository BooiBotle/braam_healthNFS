import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Search, FileText, Download, User, Shield, Check, X, CreditCard, Calendar, Clock, Activity, DollarSign, Users } from 'lucide-react';
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

  const [memberData, setMemberData] = useState<any | null>(null);
  const [loadingMemberData, setLoadingMemberData] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (selectedApp && selectedApp.applicant_id_number) {
      fetchMemberData(selectedApp.applicant_id_number);
    } else {
      setMemberData(null);
    }
  }, [selectedApp]);

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

  const fetchMemberData = async (idNumber: string) => {
    setLoadingMemberData(true);
    try {
      // Find profile
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, first_name, last_name').eq('sa_id_number', idNumber);
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        // Fetch member
        const { data: member } = await supabase.from('members').select('*, plans(name)').eq('profile_id', profile.id).single();
        if (member) {
          // Fetch linked data
          const [appts, cons, pays, deps] = await Promise.all([
            supabase.from('appointments').select('*').eq('member_id', member.id).order('appointment_date', { ascending: false }).limit(5),
            supabase.from('consultations').select('*').eq('member_id', member.id).order('visited_at', { ascending: false }).limit(5),
            supabase.from('payments').select('*').eq('member_id', member.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('dependants').select('*').eq('member_id', member.id)
          ]);
          setMemberData({
            profile,
            member,
            appointments: appts.data || [],
            consultations: cons.data || [],
            payments: pays.data || [],
            dependants: deps.data || []
          });
        } else {
           setMemberData(null);
        }
      } else {
        setMemberData(null);
      }
    } catch (e) {
      console.error(e);
      setMemberData(null);
    } finally {
      setLoadingMemberData(false);
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
      case 'pending': return { bg: '#fef9c3', text: '#854d0e' }; // Yellow
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
        maxWidth="700px"
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

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => handleApplicationStatus(selectedApp.id, 'approved', selectedApp.applicant_name)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: selectedApp.status === 'approved' ? '2px solid #10b981' : '1px solid transparent', background: selectedApp.status === 'approved' ? '#f0fdf4' : '#10b981', color: selectedApp.status === 'approved' ? '#10b981' : '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Check size={18} /> {selectedApp.status === 'approved' ? 'Approved' : 'Approve'}
              </button>
              <button 
                onClick={() => handleApplicationStatus(selectedApp.id, 'pending', selectedApp.applicant_name)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: selectedApp.status === 'pending' || selectedApp.status === 'awaiting_approval' ? '2px solid #eab308' : '1px solid transparent', background: selectedApp.status === 'pending' || selectedApp.status === 'awaiting_approval' ? '#fefce8' : '#eab308', color: selectedApp.status === 'pending' || selectedApp.status === 'awaiting_approval' ? '#eab308' : '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Clock size={18} /> Pending
              </button>
              <button 
                onClick={() => handleApplicationStatus(selectedApp.id, 'rejected', selectedApp.applicant_name)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: selectedApp.status === 'rejected' ? '2px solid #ef4444' : '1px solid transparent', background: selectedApp.status === 'rejected' ? '#fef2f2' : '#ef4444', color: selectedApp.status === 'rejected' ? '#ef4444' : '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <X size={18} /> {selectedApp.status === 'rejected' ? 'Rejected' : 'Reject'}
              </button>
            </div>

            {loadingMemberData ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading linked data...</div>
            ) : memberData ? (
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 1rem 0' }}>Linked Member Profile Data</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      <Calendar size={14} /> Appointments ({memberData.appointments.length})
                    </div>
                    {memberData.appointments.length === 0 ? <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>None found</div> : (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {memberData.appointments.map((a: any) => <li key={a.id}>{new Date(a.appointment_date).toLocaleDateString()} - <span style={{ textTransform: 'capitalize' }}>{a.status}</span></li>)}
                      </ul>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      <Activity size={14} /> Consultations ({memberData.consultations.length})
                    </div>
                    {memberData.consultations.length === 0 ? <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>None found</div> : (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {memberData.consultations.map((c: any) => <li key={c.id}>{new Date(c.visited_at || '').toLocaleDateString()} - {c.consultation_type}</li>)}
                      </ul>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      <DollarSign size={14} /> Payments ({memberData.payments.length})
                    </div>
                    {memberData.payments.length === 0 ? <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>None found</div> : (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {memberData.payments.map((p: any) => <li key={p.id}>R{(p.amount_cents/100).toFixed(2)} - <span style={{ textTransform: 'capitalize' }}>{p.status}</span></li>)}
                      </ul>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      <Users size={14} /> Dependants ({memberData.dependants.length})
                    </div>
                    {memberData.dependants.length === 0 ? <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>None found</div> : (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {memberData.dependants.map((d: any) => <li key={d.id}>{d.first_name} {d.last_name}</li>)}
                      </ul>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                <p style={{ margin: 0 }}>This applicant is not yet linked to an active member profile in the system.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminApplications;
