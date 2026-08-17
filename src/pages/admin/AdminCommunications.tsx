import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Upload, FileText, Search, User, ShieldCheck, CreditCard, ChevronDown } from 'lucide-react';
import Modal from '../../components/Modal';

const AdminCommunications = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [comms, setComms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Comm state
  const [isNewCommModalOpen, setIsNewCommModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [commType, setCommType] = useState('kyc_request');
  const [commTitle, setCommTitle] = useState('');
  const [commMessage, setCommMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch active members for selection
      const { data: memData } = await supabase
        .from('members')
        .select(`
          id, status, plan_id,
          profiles (first_name, last_name, email, sa_id_number),
          plans (name)
        `)
        .eq('status', 'active');
      setMembers(memData || []);

      // 2. Fetch past communications
      const { data: commData } = await supabase
        .from('communications')
        .select(`
          id, type, title, status, created_at,
          members (profiles (first_name, last_name))
        `)
        .order('created_at', { ascending: false });
      
      setComms(commData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `communications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setActionMsg("Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  const handleSendComm = async () => {
    if (!selectedMember || !commTitle || !commMessage) return;

    try {
      const { error } = await supabase
        .from('communications')
        .insert([{
          member_id: selectedMember.id,
          type: commType,
          title: commTitle,
          message: commMessage,
          document_url: fileUrl || null,
          status: 'pending'
        }]);

      if (error) throw error;

      setActionMsg(`Communication sent to ${selectedMember.profiles?.first_name}!`);
      setIsNewCommModalOpen(false);
      resetForm();
      fetchData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setActionMsg('Failed to send communication.');
    }
  };

  const resetForm = () => {
    setSelectedMember(null);
    setCommType('kyc_request');
    setCommTitle('');
    setCommMessage('');
    setFileUrl('');
  };

  const filteredMembers = members.filter(m => {
    const p = m.profiles;
    const search = searchQuery.toLowerCase();
    return `${p?.first_name} ${p?.last_name}`.toLowerCase().includes(search) || 
           p?.sa_id_number?.includes(search) || 
           p?.email?.toLowerCase().includes(search);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Member Communications & Requests
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Request KYC documents, send Mandates for signing, and broadcast general notices to members.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {actionMsg && <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.875rem' }}>{actionMsg}</span>}
          <button 
            onClick={() => setIsNewCommModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '8px', background: '#0B1B3F', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <Send size={16} /> New Request
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Left Col: Communication History */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, color: '#0f172a' }}>
            Communication History
          </div>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>
          ) : comms.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No communications sent yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                {comms.map(comm => (
                  <tr key={comm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: comm.type === 'kyc_request' ? '#f0fdfa' : comm.type === 'mandate_request' ? '#eff6ff' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: comm.type === 'kyc_request' ? '#0d9488' : comm.type === 'mandate_request' ? '#3b82f6' : '#64748b' }}>
                          {comm.type === 'kyc_request' ? <ShieldCheck size={20} /> : comm.type === 'mandate_request' ? <CreditCard size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{comm.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            To: {comm.members?.profiles?.first_name} {comm.members?.profiles?.last_name} · {new Date(comm.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: comm.status === 'completed' ? '#dcfce7' : '#fef9c3', color: comm.status === 'completed' ? '#15803d' : '#854d0e' }}>
                        {comm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Col: Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', color: '#0f172a' }}>Pending KYC</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d9488' }}>
              {comms.filter(c => c.type === 'kyc_request' && c.status === 'pending').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Members need to upload ID/Proof of Address</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', color: '#0f172a' }}>Pending Mandates</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>
              {comms.filter(c => c.type === 'mandate_request' && c.status === 'pending').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Members need to sign their debit order mandates</div>
          </div>
        </div>

      </div>

      {/* New Comm Modal */}
      <Modal isOpen={isNewCommModalOpen} onClose={() => setIsNewCommModalOpen(false)} title="Send Request or Notice" maxWidth="700px">
        
        {/* Step 1: Select Member */}
        {!selectedMember ? (
          <div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="Search member by name or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              {filteredMembers.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => setSelectedMember(member)}
                  style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <User size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{member.profiles?.first_name} {member.profiles?.last_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{member.profiles?.sa_id_number || member.profiles?.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c9a033', background: '#fef9c3', padding: '2px 8px', borderRadius: '12px' }}>
                    {member.plans?.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Compose Message */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0B1B3F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {selectedMember.profiles?.first_name?.[0]}{selectedMember.profiles?.last_name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedMember.profiles?.first_name} {selectedMember.profiles?.last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Plan: {selectedMember.plans?.name}</div>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Change Member
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Request Type</label>
              <select 
                value={commType} onChange={e => setCommType(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
              >
                <option value="kyc_request">KYC Document Request (ID, Proof of Address)</option>
                <option value="mandate_request">Debit Order Mandate Request</option>
                <option value="general_notice">General Notice / Information</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Title</label>
              <input 
                type="text" value={commTitle} onChange={e => setCommTitle(e.target.value)} placeholder="e.g., Please sign your debit order mandate"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Message / Instructions</label>
              <textarea 
                rows={4} value={commMessage} onChange={e => setCommMessage(e.target.value)} placeholder="Type the message that will be shown to the member in their dashboard..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', resize: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Attach PDF Document (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '8px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Browse File'}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
                {fileUrl && <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Document attached successfully</span>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setIsNewCommModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={handleSendComm}
                disabled={!commTitle || !commMessage}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#0B1B3F', color: '#fff', fontWeight: 600, cursor: (!commTitle || !commMessage) ? 'not-allowed' : 'pointer', opacity: (!commTitle || !commMessage) ? 0.5 : 1 }}
              >
                <Send size={16} /> Send to Member
              </button>
            </div>
          </div>
        )}
      </Modal>

    </motion.div>
  );
};

export default AdminCommunications;
