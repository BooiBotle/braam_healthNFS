import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getTokenAudits, type TokenAudit } from '../../lib/api/member';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, Search, ChevronRight, AlertTriangle, X, CheckCircle, ShieldAlert, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [todayConsultations, setTodayConsultations] = useState<any[]>([]);
  const [activeMembersCount, setActiveMembersCount] = useState<number>(0);
  const [overLimitMembersCount, setOverLimitMembersCount] = useState<number>(0);
  const [overrideCountThisMonth, setOverrideCountThisMonth] = useState<number>(0);
  const [flaggedActivities, setFlaggedActivities] = useState<any[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Token Audit History Modal
  const [auditMemberId, setAuditMemberId] = useState<string | null>(null);
  const [auditMemberName, setAuditMemberName] = useState<string>('');
  const [tokenAudits, setTokenAudits] = useState<TokenAudit[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(false);

  useEffect(() => {
    const fetchStaffData = async () => {
      const clinicId = user?.clinicId || '00000000-0000-0000-0000-000000000000';

      // Fetch pending applications for this clinic
      const { data: applications } = await supabase
        .from('applications')
        .select('*, plans(name)')
        .eq('clinic_id', clinicId)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false })
        .limit(5);

      if (applications) setPendingApplications(applications);

      // Fetch today's consultations
      const today = new Date().toISOString().split('T')[0];
      const { data: consultations } = await supabase
        .from('consultations')
        .select('*, members(profiles(full_name), card_number)')
        .eq('clinic_id', clinicId)
        .gte('created_at', today)
        .order('created_at', { ascending: true })
        .limit(10);

      if (consultations) setTodayConsultations(consultations);

      // Fetch active members count
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'active');
        
      if (membersCount !== null) setActiveMembersCount(membersCount);

      // Fetch manager overrides count this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: overrideCount } = await supabase
        .from('consultation_token_audits')
        .select('*', { count: 'exact', head: true })
        .eq('is_override', true)
        .gte('created_at', startOfMonth);

      setOverrideCountThisMonth(overrideCount || 0);

      // Fetch over limit count
      const { count: consultsOverLimit } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('is_flagged', true)
        .gte('created_at', startOfMonth);

      setOverLimitMembersCount(consultsOverLimit || 0);

      // Fetch flagged activities
      const { data: flaggedConsults } = await supabase
        .from('consultations')
        .select('id, created_at, visited_at, flagged_reason, member_id, members(profiles(full_name), card_number)')
        .eq('clinic_id', clinicId)
        .eq('is_flagged', true)
        .eq('flag_resolved', false);

      const { data: flaggedMeds } = await supabase
        .from('medication_dispenses')
        .select('id, dispensed_at, flagged_reason, dispense_note, member_id, members(profiles(full_name), card_number)')
        .eq('clinic_id', clinicId)
        .eq('is_flagged', true)
        .eq('flag_resolved', false);

      const flags: any[] = [];
      if (flaggedConsults) {
        flaggedConsults.forEach(c => flags.push({ ...c, type: 'consultation', date: c.visited_at || c.created_at }));
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

  const handleOpenAuditHistory = async (memberId: string, name: string) => {
    setAuditMemberId(memberId);
    setAuditMemberName(name);
    setLoadingAudits(true);
    const audits = await getTokenAudits(memberId);
    setTokenAudits(audits);
    setLoadingAudits(false);
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
          <p style={{ color: 'var(--text-secondary)' }}>Manage patient intake, token verification, and consultations.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <button className="btn btn-primary" onClick={() => navigate('/staff/verify')}>
            <Search size={16} /> Verify Member / QR
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
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
          <div style={{ background: 'rgba(34, 160, 107, 0.1)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', color: 'var(--status-success)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.2 }}>{todayConsultations.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Visits Today</div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', color: '#D14343' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#D14343', lineHeight: 1.2 }}>{overLimitMembersCount}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>0 Tokens / Flagged</div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ background: 'var(--gold-subtle)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-lg)', color: 'var(--gold)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.2 }}>{overrideCountThisMonth}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Manager Overrides</div>
          </div>
        </div>
      </div>

      <div className="responsive-grid-sidebar">
        
        {/* Today's Consultations */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)' }}>Today's Consultations</h3>
            <button className="btn btn-ghost" onClick={() => navigate('/staff/consultations')} style={{ fontSize: 'var(--text-sm)' }}>
              View Log <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Time</th>
                  <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Card Number</th>
                  <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No consultations recorded today yet.
                    </td>
                  </tr>
                ) : (
                  todayConsultations.map((consult, idx) => (
                    <tr key={consult.id} style={{ borderBottom: idx === todayConsultations.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <td style={{ padding: 'var(--sp-4)', fontWeight: 500, color: 'var(--text-heading)' }}>
                        {new Date(consult.created_at || consult.visited_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: 'var(--sp-4)', fontWeight: 600, color: 'var(--navy)' }}>{consult.members?.profiles?.full_name || 'Patient'}</td>
                      <td style={{ padding: 'var(--sp-4)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{consult.card_number || consult.members?.card_number}</td>
                      <td style={{ padding: 'var(--sp-4)' }}>
                        <button 
                          className="btn btn-ghost" 
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => handleOpenAuditHistory(consult.member_id, consult.members?.profiles?.full_name || 'Member')}
                        >
                          <History size={13} /> Token History
                        </button>
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
                    <button className="btn btn-primary" onClick={() => navigate('/staff/applications')} style={{ width: '100%', padding: 'var(--sp-2)', fontSize: 'var(--text-xs)' }}>Review Application</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Flagged Activity & Overrides
              </h3>
            </div>

            <div className="card" style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {flaggedActivities.length === 0 ? (
                <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No flagged activities or zero-token overrides require review.
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
                      <div style={{ fontWeight: 600, color: '#b91c1c' }}>{flag.members?.profiles?.full_name || 'Member'}</div>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#ef4444', color: '#fff', fontWeight: 600 }}>FLAGGED</span>
                    </div>
                    <div style={{ color: '#7f1d1d', fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-1)' }}>
                      <strong>{flag.type === 'consultation' ? 'Zero-Token Override Visit' : 'Medication Dispense'}</strong>
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
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{selectedFlag.members?.profiles?.full_name || 'Member'}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Card: {selectedFlag.members?.card_number || selectedFlag.card_number || 'N/A'}</div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Activity Type</label>
                <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{selectedFlag.type === 'consultation' ? 'Consultation Limit Exceeded / Manager Override' : 'Medication Dispense Flagged'}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Date: {new Date(selectedFlag.date).toLocaleString()}</div>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase' }}>Flag Reason & Override Info</label>
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

      {/* Token Audit History Drawer / Modal */}
      {auditMemberId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#fff', width: '100%', maxWidth: '640px',
              borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '85vh'
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy)', color: '#fff' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>Token Usage Audit Trail</h2>
                <div style={{ fontSize: '12px', color: '#9FB0CE' }}>Member: {auditMemberName}</div>
              </div>
              <button onClick={() => setAuditMemberId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9FB0CE' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {loadingAudits ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading token audit trail...</div>
              ) : tokenAudits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No token audit entries found for this member.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tokenAudits.map((audit) => (
                    <div key={audit.id} style={{
                      padding: '12px 16px', borderRadius: '10px',
                      background: audit.is_override ? '#FEF2F2' : '#F8FAFC',
                      border: `1px solid ${audit.is_override ? '#FECACA' : '#E2E8F0'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '13.5px', color: audit.is_override ? '#991B1B' : '#0F172A' }}>
                            {audit.is_override ? '⚠️ Manager Override Token Deduction' : 'Standard Consultation Token Deducted'}
                          </span>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {new Date(audit.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: audit.is_override ? '#EF4444' : '#10B981', color: '#fff' }}>
                            {audit.previous_balance} → {audit.new_balance} Tokens
                          </span>
                        </div>
                      </div>
                      {audit.is_override && (
                        <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '6px', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                          <strong>Reason:</strong> {audit.override_reason || 'No reason documented'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default StaffDashboard;
