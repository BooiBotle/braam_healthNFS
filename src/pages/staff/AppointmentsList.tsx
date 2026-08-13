import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { recordConsultationWithToken, getTokenBalance } from '../../lib/api/member';
import { Calendar, Clock, CheckCircle, XCircle, FileText, AlertTriangle, X } from 'lucide-react';

const AppointmentsList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Complete Appointment / Consultation Modal
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isOverride, setIsOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [tokensRem, setTokensRem] = useState<number>(3);
  const [isZeroTokens, setIsZeroTokens] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select('*, members(id, clinic_id, profiles(full_name, phone))')
      .order('appointment_time', { ascending: true })
      .eq('appointment_date', filterDate);

    if (user?.clinicId) {
      query = query.eq('clinic_id', user.clinicId);
    }

    const { data } = await query;
    if (data) setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, user]);

  const updateStatus = async (id: string, status: string) => {
    // Booking/Confirming/Cancelling does NOT deduct tokens
    await supabase.from('appointments').update({ status }).eq('id', id);
    fetchAppointments();
  };

  const handleOpenCompleteModal = async (appt: any) => {
    setSelectedAppt(appt);
    setClinicalNotes('');
    setDiagnosis('');
    setIsOverride(false);
    setOverrideReason('');

    // Fetch patient's token balance
    const bal = await getTokenBalance(appt.member_id);
    const rem = bal?.tokens_remaining ?? 0;
    const isUnl = bal?.monthly_tokens === -1;
    setTokensRem(rem);
    setIsZeroTokens(!isUnl && rem <= 0);
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    if (isZeroTokens && !isOverride) {
      alert("0 Tokens Remaining. Please check Manager Override and provide an override reason to log this visit.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await recordConsultationWithToken({
        clinicId: selectedAppt.clinic_id || user?.clinicId || '00000000-0000-0000-0000-000000000000',
        memberId: selectedAppt.member_id,
        dependantId: selectedAppt.dependant_id || undefined,
        appointmentId: selectedAppt.id,
        consultationType: 'appointment',
        presentingComplaint: selectedAppt.reason,
        clinicalNotes,
        diagnosis,
        seenBy: user?.id,
        doctorName: user?.name || 'Staff',
        isOverride,
        overrideReason: isOverride ? overrideReason : undefined,
        overrideBy: isOverride ? user?.id : undefined
      });

      if (res.success) {
        setSelectedAppt(null);
        fetchAppointments();
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Failed to complete appointment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Appointments & Token Deductions
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage scheduled appointments. Tokens are only deducted when a consultation is completed.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="date" 
              className="form-input" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ paddingLeft: 'var(--sp-10)' }} 
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={48} color="var(--border)" style={{ marginBottom: 'var(--sp-4)', opacity: 0.5 }} />
            <p>No appointments found for this date.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Time</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Reason</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--sp-4)', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' }}>
                    <Clock size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--text-muted)', verticalAlign: 'middle' }} />
                    {appt.appointment_time.substring(0, 5)}
                  </td>
                  <td style={{ padding: 'var(--sp-4)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{appt.members?.profiles?.full_name || 'Patient'}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{appt.members?.profiles?.phone || 'No phone'}</div>
                  </td>
                  <td style={{ padding: 'var(--sp-4)', color: 'var(--text-secondary)', maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {appt.reason}
                  </td>
                  <td style={{ padding: 'var(--sp-4)' }}>
                    <span className={`section-badge ${appt.status === 'confirmed' ? 'section-badge-gold' : appt.status === 'completed' ? '' : ''}`} style={{ fontSize: '10px' }}>
                      {appt.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--sp-4)', textAlign: 'right' }}>
                    {appt.status === 'pending' && (
                      <div style={{ display: 'inline-flex', gap: 'var(--sp-2)' }}>
                         <button className="btn btn-ghost" onClick={() => updateStatus(appt.id, 'cancelled')} style={{ padding: 'var(--sp-2)', color: 'var(--status-error)' }} title="Cancel (0 Tokens Deducted)"><XCircle size={16}/></button>
                         <button className="btn btn-primary" onClick={() => updateStatus(appt.id, 'confirmed')} style={{ padding: 'var(--sp-2)' }} title="Confirm Appointment"><CheckCircle size={16}/></button>
                      </div>
                    )}
                    {appt.status === 'confirmed' && (
                       <button className="btn btn-outline" onClick={() => handleOpenCompleteModal(appt)} style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--text-xs)' }}>
                         <FileText size={12} /> Complete Consultation (Deduct Token)
                       </button>
                    )}
                    {appt.status === 'completed' && (
                      <span style={{ fontSize: '11px', color: 'var(--status-success)', fontWeight: 600 }}>Completed & Token Deducted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Complete Appointment Modal */}
      {selectedAppt && (
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
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy)', color: '#fff' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>Complete Appointment</h2>
                <div style={{ fontSize: '12px', color: '#9FB0CE' }}>Patient: {selectedAppt.members?.profiles?.full_name}</div>
              </div>
              <button onClick={() => setSelectedAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9FB0CE' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCompleteConsultation} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Reason for Visit</label>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{selectedAppt.reason}</div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Primary Diagnosis</label>
                <input type="text" className="form-input" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Diagnosis..." style={{ marginTop: '4px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Clinical Notes</label>
                <textarea className="form-input" rows={3} value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Clinical findings..." style={{ marginTop: '4px' }} />
              </div>

              {isZeroTokens && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991B1B', fontWeight: 700, fontSize: '12.5px', marginBottom: '6px' }}>
                    <AlertTriangle size={16} /> NO TOKENS REMAINING (0 Tokens Left)
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px', color: '#7F1D1D', fontWeight: 600 }}>
                    <input type="checkbox" checked={isOverride} onChange={(e) => setIsOverride(e.target.checked)} />
                    Authorise Manager Override
                  </label>
                  {isOverride && (
                    <input 
                      type="text" 
                      className="form-input" 
                      value={overrideReason} 
                      onChange={(e) => setOverrideReason(e.target.value)} 
                      placeholder="Manager Override Reason" 
                      style={{ marginTop: '8px', background: '#fff' }} 
                      required 
                    />
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedAppt(null)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Deducting Token...' : 'Complete & Deduct 1 Token'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default AppointmentsList;
