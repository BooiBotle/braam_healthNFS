import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, Activity, Stethoscope, Clock } from 'lucide-react';

const ConsultationsList = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default ConsultationsList;


