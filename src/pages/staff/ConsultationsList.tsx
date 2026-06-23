import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, Activity, Stethoscope, Clock, Eye, FileText, User, Calendar, Pill, AlertTriangle } from 'lucide-react';
import Modal from '../../components/Modal';

const ConsultationsList = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  
  // Flagging State
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const fetchConsultations = async () => {
    setLoading(true);
    let query = supabase
      .from('consultations')
      .select('*, members(profiles(full_name, sa_id_number)), profiles!seen_by(full_name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (user?.clinicId) {
      query = query.eq('clinic_id', user.clinicId);
    }

    const { data } = await query;
    if (data) setConsultations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchConsultations();
  }, [user]);

  const filteredConsultations = consultations.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = c.members?.profiles?.full_name?.toLowerCase() || '';
    const idNum = c.members?.profiles?.sa_id_number?.toLowerCase() || '';
    const diagnosis = c.diagnosis?.toLowerCase() || '';
    return patientName.includes(searchLower) || idNum.includes(searchLower) || diagnosis.includes(searchLower);
  });

  const handleFlagSubmit = async () => {
    if (!flagReason.trim() || !selectedConsultation) return;
    
    setIsSubmittingFlag(true);
    try {
      const { error } = await supabase
        .from('consultations')
        .update({
          is_flagged: true,
          flagged_reason: flagReason,
          flag_resolved: false
        })
        .eq('id', selectedConsultation.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedConsultations = consultations.map(c => 
        c.id === selectedConsultation.id 
          ? { ...c, is_flagged: true, flagged_reason: flagReason }
          : c
      );
      setConsultations(updatedConsultations);
      setSelectedConsultation({ ...selectedConsultation, is_flagged: true, flagged_reason: flagReason });
      setIsFlagging(false);
      setFlagReason('');
    } catch (err) {
      console.error("Error flagging consultation:", err);
      alert("Failed to flag consultation.");
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Consultations Log
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>View historical clinic consultations and diagnoses.</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search patient, ID, or diagnosis..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 'var(--sp-10)' }} 
          />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading consultations...</div>
        ) : filteredConsultations.length === 0 ? (
          <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Activity size={48} color="var(--border)" style={{ marginBottom: 'var(--sp-4)', opacity: 0.5 }} />
            <p>No consultations found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Date & Time</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Type</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Primary Diagnosis</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Seen By</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConsultations.map((cons) => (
                <tr key={cons.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--sp-4)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {new Date(cons.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Clock size={12} /> {new Date(cons.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--sp-4)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{cons.members?.profiles?.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>ID: {cons.members?.profiles?.sa_id_number || 'N/A'}</div>
                  </td>
                  <td style={{ padding: 'var(--sp-4)' }}>
                    <span style={{ 
                      fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: cons.consultation_type === 'walk_in' ? 'var(--bg-surface-sunken)' : 'var(--accent-subtle)',
                      color: cons.consultation_type === 'walk_in' ? 'var(--text-secondary)' : 'var(--navy)',
                      padding: '4px 8px', borderRadius: '4px'
                    }}>
                      {cons.consultation_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--sp-4)' }}>
                    {cons.diagnosis ? (
                      <div style={{ fontWeight: 500, color: 'var(--text-heading)' }}>{cons.diagnosis}</div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ padding: 'var(--sp-4)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Stethoscope size={14} color="var(--navy)" />
                      {cons.profiles?.full_name || cons.doctor_name || 'Staff'}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--sp-4)', textAlign: 'right' }}>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => setSelectedConsultation(cons)} 
                      style={{ padding: 'var(--sp-2)' }}
                      title="View Details"
                    >
                      <Eye size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>

      <Modal 
        isOpen={!!selectedConsultation}
        onClose={() => {
          setSelectedConsultation(null);
          setIsFlagging(false);
          setFlagReason('');
        }}
        title="Consultation Details"
        maxWidth="600px"
      >
        {selectedConsultation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: 'var(--bg-surface-sunken)', color: 'var(--navy)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 600
              }}>
                <Activity size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--navy)' }}>
                  {selectedConsultation.members?.profiles?.full_name || 'Unknown Patient'}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {new Date(selectedConsultation.created_at).toLocaleDateString()} at {new Date(selectedConsultation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> ID Number
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500 }}>
                  {selectedConsultation.members?.profiles?.sa_id_number || 'N/A'}
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Activity size={14} /> Consultation Type
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500, textTransform: 'capitalize' }}>
                  {selectedConsultation.consultation_type.replace('_', ' ')}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <FileText size={14} /> Diagnosis
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500 }}>
                  {selectedConsultation.diagnosis || 'Pending / None provided'}
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Stethoscope size={14} /> Notes
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {selectedConsultation.notes || 'No notes available.'}
                </div>
              </div>

              {selectedConsultation.prescriptions && selectedConsultation.prescriptions.length > 0 && (
                <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Pill size={14} /> Prescriptions
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {selectedConsultation.prescriptions.map((px: any, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--navy)' }}>{px.medication_name}</span> - {px.dosage} ({px.duration})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Stethoscope size={14} /> Seen By
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500 }}>
                  {selectedConsultation.profiles?.full_name || selectedConsultation.doctor_name || 'Staff'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setSelectedConsultation(null);
                  setIsFlagging(false);
                  setFlagReason('');
                }} 
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                Close
              </button>
              
              {!selectedConsultation.is_flagged && !isFlagging && (
                <button 
                  className="btn" 
                  onClick={() => setIsFlagging(true)} 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', border: 'none' }}
                >
                  <AlertTriangle size={16} /> Flag Activity
                </button>
              )}
            </div>
            
            {selectedConsultation.is_flagged && !isFlagging && (
               <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertTriangle size={18} style={{ marginTop: '2px' }}/>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem' }}>This activity has been flagged</strong>
                    <span style={{ fontSize: '0.75rem' }}>Reason: {selectedConsultation.flagged_reason}</span>
                  </div>
               </div>
            )}
            
            {isFlagging && (
              <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <label style={{ display: 'block', color: 'var(--status-error)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Reason for Flagging
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Suspected abuse, system bypass..." 
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button 
                     className="btn btn-outline" 
                     onClick={() => { setIsFlagging(false); setFlagReason(''); }}
                     style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
                   >
                     Cancel
                   </button>
                   <button 
                     className="btn" 
                     onClick={handleFlagSubmit}
                     disabled={isSubmittingFlag || !flagReason.trim()}
                     style={{ flex: 1, background: 'var(--status-error)', color: 'white', border: 'none', padding: '0.5rem', fontSize: '0.875rem' }}
                   >
                     {isSubmittingFlag ? 'Submitting...' : 'Submit Flag'}
                   </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ConsultationsList;


