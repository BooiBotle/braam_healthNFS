import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

const AppointmentsList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

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
  }, [filterDate, user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    fetchAppointments();
  };

  return (
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
                    {appt.status === 'pending' && (
                      <div style={{ display: 'inline-flex', gap: 'var(--sp-2)' }}>
                         <button className="btn btn-ghost" onClick={() => updateStatus(appt.id, 'cancelled')} style={{ padding: 'var(--sp-2)', color: 'var(--status-error)' }} title="Cancel"><XCircle size={16}/></button>
                         <button className="btn btn-primary" onClick={() => updateStatus(appt.id, 'confirmed')} style={{ padding: 'var(--sp-2)' }} title="Confirm"><CheckCircle size={16}/></button>
                      </div>
                    )}
                    {appt.status === 'confirmed' && (
                       <button className="btn btn-outline" onClick={() => updateStatus(appt.id, 'completed')} style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--text-xs)' }}>Mark Arrived</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default AppointmentsList;





