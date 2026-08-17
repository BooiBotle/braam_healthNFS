import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Search, Eye, User, FileText, Activity, Phone } from 'lucide-react';
import Modal from '../../components/Modal';

const AppointmentsList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);

  // New Appointment State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [newAppt, setNewAppt] = useState({
    member_id: '',
    appointment_date: filterDate,
    appointment_time: '09:00',
    reason: ''
  });

  const fetchMembers = async () => {
    let query = supabase.from('members').select('id, profiles(first_name, last_name, sa_id_number)').eq('status', 'active');
    if (user?.clinicId) query = query.eq('clinic_id', user.clinicId);
    const { data } = await query;
    if (data) setMembers(data);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select('*, members(profiles(full_name, phone))')
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
    if (user?.clinicId) fetchMembers();
  }, [filterDate, user]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.member_id || !newAppt.reason) return;
    try {
      const { error } = await supabase.from('appointments').insert([{
        clinic_id: user?.clinicId,
        member_id: newAppt.member_id,
        appointment_date: newAppt.appointment_date,
        appointment_time: newAppt.appointment_time,
        reason: newAppt.reason,
        status: 'confirmed',
        booked_by: user?.id
      }]);
      if (error) throw error;
      setIsNewModalOpen(false);
      setNewAppt({ member_id: '', appointment_date: filterDate, appointment_time: '09:00', reason: '' });
      setMemberSearchQuery('');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert('Failed to create appointment');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    fetchAppointments();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Appointments
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage scheduled member appointments.</p>
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
          <button onClick={() => setIsNewModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '8px', background: '#0B1B3F', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            + Book Appointment
          </button>
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
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{appt.members?.profiles?.full_name || 'Unknown Patient'}</div>
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
                    <div style={{ display: 'inline-flex', gap: 'var(--sp-2)' }}>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => setSelectedAppt(appt)} 
                        style={{ padding: 'var(--sp-2)' }}
                        title="View Details"
                      >
                        <Eye size={16}/>
                      </button>
                      {appt.status === 'pending' && (
                        <>
                           <button className="btn btn-ghost" onClick={() => updateStatus(appt.id, 'cancelled')} style={{ padding: 'var(--sp-2)', color: 'var(--status-error)' }} title="Cancel"><XCircle size={16}/></button>
                           <button className="btn btn-primary" onClick={() => updateStatus(appt.id, 'confirmed')} style={{ padding: 'var(--sp-2)' }} title="Confirm"><CheckCircle size={16}/></button>
                        </>
                      )}
                      {appt.status === 'confirmed' && (
                         <button className="btn btn-outline" onClick={() => updateStatus(appt.id, 'completed')} style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--text-xs)' }}>Mark Arrived</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>

      <Modal 
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Appointment Details"
        maxWidth="600px"
      >
        {selectedAppt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: 'var(--bg-surface-sunken)', color: 'var(--navy)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 600
              }}>
                <Calendar size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--navy)' }}>
                  {selectedAppt.members?.profiles?.full_name || 'Unknown Patient'}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {new Date(selectedAppt.appointment_date).toLocaleDateString()} at {selectedAppt.appointment_time.substring(0, 5)}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> Patient Name
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500 }}>
                  {selectedAppt.members?.profiles?.full_name || 'Unknown Patient'}
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Phone size={14} /> Contact
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500 }}>
                  {selectedAppt.members?.profiles?.phone || 'No phone provided'}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <FileText size={14} /> Reason
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500 }}>
                  {selectedAppt.reason || 'General Consultation'}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface-sunken)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Activity size={14} /> Status
                </div>
                <div style={{ color: 'var(--navy)', fontWeight: 500, textTransform: 'capitalize' }}>
                  <span className={`section-badge ${selectedAppt.status === 'confirmed' ? 'section-badge-gold' : ''}`}>{selectedAppt.status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {selectedAppt.status === 'pending' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { updateStatus(selectedAppt.id, 'confirmed'); setSelectedAppt(null); }} 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle size={18} /> Confirm
                </button>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => { updateStatus(selectedAppt.id, 'cancelled'); setSelectedAppt(null); }} 
                  style={{ flex: 1, color: 'var(--status-error)', border: '1px solid var(--status-error)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <XCircle size={18} /> Cancel
                </button>
              </div>
            )}
            {selectedAppt.status === 'confirmed' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { updateStatus(selectedAppt.id, 'completed'); setSelectedAppt(null); }} 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle size={18} /> Mark Arrived
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New Appointment Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Book New Appointment" maxWidth="500px">
        {!newAppt.member_id ? (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Select Member</label>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="Search member by name or ID..." 
                value={memberSearchQuery} onChange={e => setMemberSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              {members.filter(m => {
                const s = memberSearchQuery.toLowerCase();
                return m.profiles?.first_name?.toLowerCase().includes(s) || 
                       m.profiles?.last_name?.toLowerCase().includes(s) || 
                       m.profiles?.sa_id_number?.includes(s);
              }).map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setNewAppt({...newAppt, member_id: m.id})}
                  style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <User size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.profiles?.first_name} {m.profiles?.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {m.profiles?.sa_id_number || 'N/A'}</div>
                  </div>
                </div>
              ))}
              {members.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No active members found.</div>}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0B1B3F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {members.find(m => m.id === newAppt.member_id)?.profiles?.first_name?.[0]}
                  {members.find(m => m.id === newAppt.member_id)?.profiles?.last_name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {members.find(m => m.id === newAppt.member_id)?.profiles?.first_name} {members.find(m => m.id === newAppt.member_id)?.profiles?.last_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Selected Member</div>
                </div>
              </div>
              <button type="button" onClick={() => setNewAppt({...newAppt, member_id: ''})} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Change
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Date</label>
                <input 
                  type="date" required value={newAppt.appointment_date} 
                  onChange={e => setNewAppt({...newAppt, appointment_date: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Time</label>
                <input 
                  type="time" required value={newAppt.appointment_time} 
                  onChange={e => setNewAppt({...newAppt, appointment_time: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Reason for Visit</label>
              <input 
                type="text" required placeholder="e.g. Flu symptoms" value={newAppt.reason} 
                onChange={e => setNewAppt({...newAppt, reason: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setIsNewModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#0B1B3F', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Book Appointment</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default AppointmentsList;
