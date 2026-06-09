import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Pill, Search, User, Clock, AlertTriangle } from 'lucide-react';

const MedicationRegister = () => {
  const { user } = useAuth();
  const [dispenses, setDispenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDispenses = async () => {
    setLoading(true);
    let query = supabase
      .from('medication_dispenses')
      .select('*, members(profiles(full_name, sa_id_number)), profiles!dispensed_by(full_name)')
      .order('dispensed_at', { ascending: false })
      .limit(50);

    if (user?.clinicId) {
      query = query.eq('clinic_id', user.clinicId);
    }

    const { data } = await query;
    if (data) setDispenses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDispenses();
  }, [user]);

  const filteredDispenses = dispenses.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = d.members?.profiles?.full_name?.toLowerCase() || '';
    const medName = d.medication_name?.toLowerCase() || '';
    const note = d.dispense_note?.toLowerCase() || '';
    return patientName.includes(searchLower) || medName.includes(searchLower) || note.includes(searchLower);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Medication Register
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track clinic dispensary records.</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search patient, or medication..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 'var(--sp-10)' }} 
          />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading dispensary records...</div>
        ) : filteredDispenses.length === 0 ? (
          <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Pill size={48} color="var(--border)" style={{ marginBottom: 'var(--sp-4)', opacity: 0.5 }} />
            <p>No medication records found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Date Dispensed</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Medication Details</th>
                <th style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>Dispensed By</th>
              </tr>
            </thead>
            <tbody>
              {filteredDispenses.map((disp) => (
                <tr key={disp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--sp-4)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {new Date(disp.dispensed_at).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Clock size={12} /> {new Date(disp.dispensed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--sp-4)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{disp.members?.profiles?.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>ID: {disp.members?.profiles?.sa_id_number || 'N/A'}</div>
                  </td>
                  <td style={{ padding: 'var(--sp-4)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {disp.medication_name || 'Unspecified Medication'} {disp.dosage ? `- ${disp.dosage}` : ''}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      Qty: {disp.quantity} {disp.quantity_unit}
                    </div>
                    {disp.dispense_note && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        Note: {disp.dispense_note}
                      </div>
                    )}
                    {disp.is_flagged && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>
                         <AlertTriangle size={10} /> FLAGGED
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 'var(--sp-4)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="var(--navy)" />
                      {disp.profiles?.full_name || 'Staff'}
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

export default MedicationRegister;


