import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Pill, Search, User, Clock, AlertTriangle, Plus, X } from 'lucide-react';
import Modal from '../../components/Modal';

const MedicationRegister = () => {
  const { user } = useAuth();
  const [dispenses, setDispenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dispense Form State
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [dispenseForm, setDispenseForm] = useState({
    member_id: '',
    medication_name: '',
    dosage: '',
    quantity: '',
    quantity_unit: 'tablets',
    dispense_note: '',
    is_flagged: false,
    flagged_reason: ''
  });
  const [members, setMembers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    if (user?.clinicId) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('members')
      .select('id, card_number, profiles(full_name, sa_id_number)')
      .eq('clinic_id', user!.clinicId)
      .eq('status', 'active');
    if (data) setMembers(data);
  };

  const handleRecordDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clinicId) return;
    
    setSaving(true);
    setError('');
    
    try {
      const { error: insertErr } = await supabase
        .from('medication_dispenses')
        .insert([{
          member_id: dispenseForm.member_id,
          clinic_id: user.clinicId,
          dispensed_by: user.id,
          medication_name: dispenseForm.medication_name,
          dosage: dispenseForm.dosage,
          quantity: parseInt(dispenseForm.quantity),
          quantity_unit: dispenseForm.quantity_unit,
          dispense_note: dispenseForm.dispense_note,
          is_flagged: dispenseForm.is_flagged,
          flagged_reason: dispenseForm.is_flagged ? dispenseForm.flagged_reason : null,
          dispensed_at: new Date().toISOString(),
          flag_resolved: false
        }]);
        
      if (insertErr) throw insertErr;
      
      // Reset form and close modal
      setIsDispenseModalOpen(false);
      setDispenseForm({
        member_id: '', medication_name: '', dosage: '', 
        quantity: '', quantity_unit: 'tablets', dispense_note: '', 
        is_flagged: false, flagged_reason: ''
      });
      fetchDispenses(); // Refresh list
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to record dispense');
    } finally {
      setSaving(false);
    }
  };

  const filteredDispenses = dispenses.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = d.members?.profiles?.full_name?.toLowerCase() || '';
    const medName = d.medication_name?.toLowerCase() || '';
    const note = d.dispense_note?.toLowerCase() || '';
    return patientName.includes(searchLower) || medName.includes(searchLower) || note.includes(searchLower);
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
            Medication Register
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track clinic dispensary records.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
          <button className="btn btn-primary" onClick={() => setIsDispenseModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Record Dispense
          </button>
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

      <Modal 
        isOpen={isDispenseModalOpen} 
        onClose={() => setIsDispenseModalOpen(false)}
        title="Record New Medication Dispense"
        maxWidth="600px"
      >
        <form onSubmit={handleRecordDispense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select 
              className="form-input" 
              required
              value={dispenseForm.member_id}
              onChange={(e) => setDispenseForm({...dispenseForm, member_id: e.target.value})}
            >
              <option value="">Select a member...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.profiles?.full_name} ({m.card_number}) - ID: {m.profiles?.sa_id_number}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Medication Name</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="e.g. Paracetamol"
                value={dispenseForm.medication_name}
                onChange={(e) => setDispenseForm({...dispenseForm, medication_name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Dosage</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 500mg"
                value={dispenseForm.dosage}
                onChange={(e) => setDispenseForm({...dispenseForm, dosage: e.target.value})}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input 
                type="number" 
                className="form-input" 
                required 
                min="1"
                value={dispenseForm.quantity}
                onChange={(e) => setDispenseForm({...dispenseForm, quantity: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select 
                className="form-input"
                value={dispenseForm.quantity_unit}
                onChange={(e) => setDispenseForm({...dispenseForm, quantity_unit: e.target.value})}
              >
                <option value="tablets">Tablets</option>
                <option value="capsules">Capsules</option>
                <option value="ml">ml (Liquid)</option>
                <option value="units">Units</option>
                <option value="inhalers">Inhalers</option>
                <option value="creams">Creams / Ointments</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dispense Notes</label>
            <textarea 
              className="form-input" 
              rows={3} 
              placeholder="Any specific instructions or observations..."
              value={dispenseForm.dispense_note}
              onChange={(e) => setDispenseForm({...dispenseForm, dispense_note: e.target.value})}
            />
          </div>

          <div style={{ background: dispenseForm.is_flagged ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-surface-sunken)', padding: '1rem', borderRadius: '8px', border: `1px solid ${dispenseForm.is_flagged ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}` }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: dispenseForm.is_flagged ? '1rem' : 0 }}>
              <input 
                type="checkbox" 
                checked={dispenseForm.is_flagged}
                onChange={(e) => setDispenseForm({...dispenseForm, is_flagged: e.target.checked})}
                style={{ width: '18px', height: '18px', accentColor: 'var(--status-error)' }}
              />
              <span style={{ fontWeight: 600, color: dispenseForm.is_flagged ? 'var(--status-error)' : 'var(--text-heading)' }}>Flag this dispense for review</span>
            </label>
            
            {dispenseForm.is_flagged && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'var(--status-error)' }}>Reason for Flagging</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required={dispenseForm.is_flagged}
                  placeholder="e.g. Suspected overuse, unusual combination..."
                  value={dispenseForm.flagged_reason}
                  onChange={(e) => setDispenseForm({...dispenseForm, flagged_reason: e.target.value})}
                  style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsDispenseModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Recording...' : 'Record Dispense'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MedicationRegister;


