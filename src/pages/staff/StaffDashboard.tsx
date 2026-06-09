import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, Search, ChevronRight, AlertTriangle, X, CheckCircle } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [todayConsultations, setTodayConsultations] = useState<any[]>([]);
  const [activeMembersCount, setActiveMembersCount] = useState<number>(0);
  const [flaggedActivities, setFlaggedActivities] = useState<any[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!user?.clinicId) return; // Staff should have a clinicId in their profile

      // Fetch pending applications for this clinic
      const { data: applications } = await supabase
        .from('applications')
        .select('*, plans(name)')
        .eq('clinic_id', user.clinicId)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false })
        .limit(5);

      if (applications) setPendingApplications(applications);

      // Fetch today's consultations
      const today = new Date().toISOString().split('T')[0];
      const { data: consultations } = await supabase
        .from('consultations')
        .select('*, members(full_name, card_number)')
        .eq('clinic_id', user.clinicId)
        .gte('consultation_date', today)
        .order('consultation_date', { ascending: true })
        .limit(10);

      if (consultations) setTodayConsultations(consultations);

      // Fetch active members count
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', user.clinicId)
        .eq('status', 'active');
        
      if (membersCount !== null) setActiveMembersCount(membersCount);

      // Fetch flagged activities
      const { data: flaggedConsults } = await supabase
        .from('consultations')
        .select('id, visited_at, flagged_reason, members(full_name, card_number)')
        .eq('clinic_id', user.clinicId)
        .eq('is_flagged', true)
        .eq('flag_resolved', false);

      const { data: flaggedMeds } = await supabase
        .from('medication_dispenses')
        .select('id, dispensed_at, flagged_reason, dispense_note, members(full_name, card_number)')
        .eq('clinic_id', user.clinicId)
        .eq('is_flagged', true)
        .eq('flag_resolved', false);

      const flags: any[] = [];
      if (flaggedConsults) {
        flaggedConsults.forEach(c => flags.push({ ...c, type: 'consultation', date: c.visited_at }));
      }
      if (flaggedMeds) {
        flaggedMeds.forEach(m => flags.push({ ...m, type: 'medication', date: m.dispensed_at }));
      }
      flags.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setFlaggedActivities(flags);

      setLoading(false);
    };

    fetchStaffData();
  }, [user]);

  const handleResolveFlag = async () => {
    if (!selectedFlag) return;
    try {
      if (selectedFlag.type === 'consultation') {
        await supabase.from('consultations').update({ flag_resolved: true, flag_resolved_at: new Date().toISOString() }).eq('id', selectedFlag.id);
      } else {
        await supabase.from('medication_dispenses').update({ flag_resolved: true }).eq('id', selectedFlag.id);
      }
      setFlaggedActivities(prev => prev.filter(f => f.id !== selectedFlag.id));
      setSelectedFlag(null);
    } catch (err) {
      console.error('Error resolving flag:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Staff Portal...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      <div className="responsive-header" style={{ marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Staff Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage patient intake, applications, and consultations.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="form-input" placeholder="Search member..." style={{ paddingLeft: 'var(--sp-10)', width: '250px' }} />
          </div>
          <button className="btn btn-primary">New Walk-in</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ background: 'var(--accent-subtle)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', color: 'var(--navy)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.2 }}>{activeMembersCount}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Active Members</div>
          </div>
        </div>
        
        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ background: 'var(--gold-subtle)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', color: 'var(--gold)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.2 }}>{pendingApplications.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Pending Apps</div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ background: 'rgba(34, 160, 107, 0.1)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', color: 'var(--status-success)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.2 }}>{todayConsultations.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Visits Today</div>
          </div>
        </div>
      </div>

      <div className="responsive-grid-sidebar">
        
        {/* Today's Consultations */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)' }}>Today's Consultations</h3>
            <button className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>View All <ChevronRight size={14} /></button>
          </div>
          
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Time</th>
                  <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Card Number</th>
                  <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No consultations scheduled for today yet.
                    </td>
                  </tr>
                ) : (
                  todayConsultations.map((consult, idx) => (
                    <tr key={consult.id} style={{ borderBottom: idx === todayConsultations.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <td style={{ padding: 'var(--sp-4)', fontWeight: 500, color: 'var(--text-heading)' }}>
                        {new Date(consult.consultation_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: 'var(--sp-4)', fontWeight: 600, color: 'var(--navy)' }}>{consult.members?.full_name}</td>
                      <td style={{ padding: 'var(--sp-4)', color: 'var(--text-secondary)' }}>{consult.members?.card_number}</td>
                      <td style={{ padding: 'var(--sp-4)' }}>
                        <span className="section-badge" style={{ fontSize: '10px' }}>{consult.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Applications Sidebar & Flagged Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)' }}>Pending Applications</h3>
            </div>

            <div className="card" style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {pendingApplications.length === 0 ? (
                <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  All caught up! No pending applications.
                </div>
              ) : (
                pendingApplications.map(app => (
                  <div key={app.id} className="card card-interactive" style={{ padding: 'var(--sp-4)', background: 'var(--bg-surface-sunken)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{app.applicant_name || 'Unknown Applicant'}</div>
                      <span className="section-badge section-badge-gold" style={{ fontSize: '10px' }}>NEW</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-3)' }}>
                      Applied for: <strong style={{ color: 'var(--text-body)' }}>{app.plans?.name}</strong>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', padding: 'var(--sp-2)', fontSize: 'var(--text-xs)' }}>Review Application</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Flagged Activity
              </h3>
            </div>

            <div className="card" style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {flaggedActivities.length === 0 ? (
                <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No flagged activities require attention.
                </div>
              ) : (
                flaggedActivities.map(flag => (
                  <div 
                    key={flag.id} 
                    onClick={() => setSelectedFlag(flag)}
                    className="card card-interactive" 
                    style={{ padding: 'var(--sp-4)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)' }}>
                      <div style={{ fontWeight: 600, color: '#b91c1c' }}>{flag.members?.full_name}</div>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#ef4444', color: '#fff', fontWeight: 600 }}>FLAGGED</span>
                    </div>
                    <div style={{ color: '#7f1d1d', fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-1)' }}>
                      <strong>{flag.type === 'consultation' ? 'Consultation' : 'Medication'}</strong>
                    </div>
                    <div style={{ color: '#991b1b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Reason: {flag.flagged_reason}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Flag Details Modal */}
      {selectedFlag && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#fff', width: '100%', maxWidth: '500px',
              borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: '#ef4444', color: '#fff', borderRadius: '8px' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b', margin: 0 }}>Review Flagged Activity</h2>
                </div>
              </div>
              <button onClick={() => setSelectedFlag(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Patient Name</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{selectedFlag.members?.full_name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Card: {selectedFlag.members?.card_number || 'N/A'}</div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Activity Type</label>
                <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{selectedFlag.type === 'consultation' ? 'Consultation Limit Exceeded/Flagged' : 'Medication Dispense Flagged'}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Date: {new Date(selectedFlag.date).toLocaleString()}</div>
              </div>

              {selectedFlag.dispense_note && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Dispense Note</label>
                  <div style={{ fontSize: '0.875rem', color: '#0f172a', marginTop: '4px' }}>{selectedFlag.dispense_note}</div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase' }}>Flag Reason</label>
                <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginTop: '4px', fontWeight: 500 }}>{selectedFlag.flagged_reason}</div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setSelectedFlag(null)}
                  style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResolveFlag}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#10b981', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  <CheckCircle size={18} /> Mark as Resolved
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default StaffDashboard;



