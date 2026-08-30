import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldCheck, CheckCircle, XCircle, FileText, Download,
  User, Eye, AlertCircle, RefreshCw, X, Check, Shield, MessageSquare,
  Clock, ChevronRight
} from 'lucide-react';

const DOC_LABEL: Record<string, string> = {
  sa_id: 'SA ID Document',
  proof_of_address: 'Proof of Address',
  proof_of_income: 'Proof of Income',
  bank_statement: 'Bank Statement',
  selfie_with_id: 'Selfie with ID',
};

const STATUS_CFG = {
  pending_review: { label: 'Pending Review', color: '#854d0e', bg: '#fef9c3', icon: Clock },
  verified:       { label: 'Verified',       color: '#15803d', bg: '#f0fdf4', icon: CheckCircle },
  approved:       { label: 'Verified',       color: '#15803d', bg: '#f0fdf4', icon: CheckCircle },
  rejected:       { label: 'Rejected',       color: '#b91c1c', bg: '#fef2f2', icon: XCircle },
};
function sCfg(s: string) { return (STATUS_CFG as any)[s] || { label: s, color: '#475569', bg: '#f1f5f9', icon: FileText }; }

function avatar(name: string) {
  return (name || 'M').split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
}

// ── Document Review Panel ────────────────────────────────────────────────
function ReviewPanel({ doc, onApprove, onReject, onClose }: any) {
  const [notes, setNotes] = useState(doc.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const profile = doc.members?.profiles;
  const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
  const cfg = sCfg(doc.status);
  const StatusIcon = cfg.icon;

  const doApprove = async () => {
    setSaving(true);
    await onApprove(doc.id, notes);
    setSaving(false);
  };
  const doReject = async () => {
    if (!notes.trim()) { alert('Please add a rejection reason in the notes field.'); return; }
    setSaving(true);
    await onReject(doc.id, notes);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 35 }}
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 500, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0B1B3F, #1e3a7a)', padding: '22px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
              {avatar(name)}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{profile?.sa_id_number || '—'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#fff' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <StatusIcon size={10} /> {cfg.label}
          </span>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
            {DOC_LABEL[doc.doc_type] || doc.doc_type.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* Document preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Document</div>
          {doc.file_url ? (
            <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {doc.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={doc.file_url} alt="KYC Document" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: '#f8fafc' }} />
              ) : (
                <div style={{ padding: '30px', background: '#f8fafc', textAlign: 'center' }}>
                  <FileText size={40} color="#94a3b8" style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{doc.file_name || 'Document'}</div>
                </div>
              )}
              <div style={{ padding: '10px 14px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{doc.file_name}</span>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#0369a1', textDecoration: 'none' }}>
                  <Eye size={13} /> Open Full Size
                </a>
              </div>
            </div>
          ) : (
            <div style={{ padding: '30px', background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              No file URL available
            </div>
          )}
        </div>

        {/* Member info */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Member Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Full Name', value: name },
              { label: 'SA ID Number', value: profile?.sa_id_number || '—' },
              { label: 'Phone', value: profile?.phone || '—' },
              { label: 'Uploaded', value: new Date(doc.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin notes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Admin Notes</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder={doc.status === 'pending_review' ? 'Add notes — required if rejecting…' : 'Add an internal note…'}
            style={{ width: '100%', minHeight: 80, padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
          {doc.status === 'rejected' && doc.admin_notes && (
            <div style={{ marginTop: 6, padding: '8px 12px', background: '#fef2f2', borderRadius: 7, border: '1px solid #fecaca', fontSize: 11.5, color: '#991b1b', fontWeight: 500 }}>
              Previous rejection reason: {doc.admin_notes}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 24px', background: '#f8fafc', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={doApprove} disabled={saving}
            style={{ padding: '12px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Check size={15} /> Verify & Approve
          </button>
          <button onClick={doReject} disabled={saving}
            style={{ padding: '12px 0', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <X size={15} /> Reject
          </button>
        </div>
        {(doc.status === 'verified' || doc.status === 'approved') && (
          <button onClick={doReject} disabled={saving}
            style={{ marginTop: 10, width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid #fecaca', background: '#fff', color: '#b91c1c', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            Revoke Verification
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── KYC Request Modal ─────────────────────────────────────────────────────
function KYCRequestModal({ members, onClose, onSent }: any) {
  const [memberId, setMemberId] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const send = async () => {
    if (!memberId) { setErr('Please select a member.'); return; }
    setSending(true);
    setErr('');
    try {
      const { error } = await supabase.from('kyc_requests').insert({
        member_id: memberId,
        requested_by: 'admin',
        status: 'pending',
        message: msg || 'Please upload your KYC documents to proceed with your membership.',
      });
      if (error) throw error;
      onSent();
      onClose();
    } catch (e: any) { setErr(e.message); }
    finally { setSending(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, padding: '28px 30px', width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Request KYC from Member</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>The member will see this request on their KYC page as an urgent alert.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block' }}>Member *</label>
            <select value={memberId} onChange={e => setMemberId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none' }}>
              <option value="">Select member…</option>
              {members.map((m: any) => {
                const p = m.profiles;
                const n = p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : m.id;
                return <option key={m.id} value={m.id}>{n}</option>;
              })}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block' }}>Message to Member (optional)</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="e.g. Please upload your bank statement and proof of address to activate your debit order."
              style={{ width: '100%', minHeight: 80, padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
          </div>
        </div>

        {err && <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginBottom: 12 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={send} disabled={sending} style={{ padding: '9px 18px', borderRadius: 8, background: '#0B1B3F', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {sending ? 'Sending…' : 'Send KYC Request'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const AdminKYC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showKYCRequest, setShowKYCRequest] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('kyc_documents')
        .select(`
          id, doc_type, file_name, file_url, status, admin_notes, created_at,
          members (id, profiles (first_name, last_name, sa_id_number, phone))
        `)
        .order('created_at', { ascending: false });
      if (statusFilter !== 'all') query = (query as any).eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      setDocuments(data || []);

      const { data: mems } = await supabase.from('members').select('id, profiles(first_name, last_name)');
      setMembers(mems || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const approveDoc = async (docId: string, notes: string) => {
    await supabase.from('kyc_documents').update({ status: 'verified', admin_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', docId);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'verified', admin_notes: notes } : d));
    if (selectedDoc?.id === docId) setSelectedDoc((p: any) => p ? { ...p, status: 'verified', admin_notes: notes } : p);
    setToastMsg('Document verified ✓');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const rejectDoc = async (docId: string, notes: string) => {
    await supabase.from('kyc_documents').update({ status: 'rejected', admin_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', docId);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'rejected', admin_notes: notes } : d));
    if (selectedDoc?.id === docId) setSelectedDoc((p: any) => p ? { ...p, status: 'rejected', admin_notes: notes } : p);
    setToastMsg('Document rejected');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filteredDocs = documents.filter(doc => {
    const profile = doc.members?.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    return !q || name.includes(q) || (profile?.sa_id_number || '').includes(q);
  });

  const pendingCount = documents.filter(d => d.status === 'pending_review').length;
  const verifiedCount = documents.filter(d => d.status === 'verified' || d.status === 'approved').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;
  const tabCount = (t: string) => t === 'all' ? documents.length : documents.filter(d => d.status === t || (t === 'verified' && d.status === 'approved')).length;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }} />
        )}
      </AnimatePresence>

      {/* Review panel */}
      <AnimatePresence>
        {selectedDoc && <ReviewPanel doc={selectedDoc} onApprove={approveDoc} onReject={rejectDoc} onClose={() => setSelectedDoc(null)} />}
      </AnimatePresence>

      {/* KYC request modal */}
      <AnimatePresence>
        {showKYCRequest && <KYCRequestModal members={members} onClose={() => setShowKYCRequest(false)} onSent={() => setToastMsg('KYC request sent!')} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '10px 22px', borderRadius: 30, fontWeight: 700, fontSize: 13, zIndex: 2000, boxShadow: '0 4px 20px rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>KYC Review</h1>
            <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>Verify member identity documents for FICA compliance and debit mandate activation.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={fetchDocuments} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#fff', color: '#374151', border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => setShowKYCRequest(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#0B1B3F', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Shield size={14} /> Request KYC
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Pending Review', value: pendingCount, color: '#d97706', icon: Clock },
            { label: 'Verified', value: verifiedCount, color: '#10b981', icon: CheckCircle },
            { label: 'Rejected', value: rejectedCount, color: '#dc2626', icon: XCircle },
            { label: 'Total Docs', value: documents.length, color: '#6366f1', icon: FileText },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 700, marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>

          {/* Filters + search */}
          <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex' }}>
              {['all', 'pending_review', 'verified', 'rejected'].map(tab => (
                <button key={tab} onClick={() => setStatusFilter(tab)}
                  style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, color: statusFilter === tab ? '#0B1B3F' : '#94a3b8', borderBottom: statusFilter === tab ? '2px solid #0B1B3F' : '2px solid transparent', transition: 'all 0.2s' }}>
                  {tab === 'all' ? 'All' : tab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: statusFilter === tab ? '#0B1B3F' : '#f1f5f9', color: statusFilter === tab ? '#fff' : '#64748b' }}>
                    {tabCount(tab)}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search members…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', width: 220 }} />
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', gap: 16 }}>
            <div style={{ width: 36 }} />
            <div style={{ flex: '0 0 200px' }}>Member</div>
            <div style={{ flex: '0 0 180px' }}>Document Type</div>
            <div style={{ flex: 1 }}>File</div>
            <div style={{ flex: '0 0 120px' }}>Uploaded</div>
            <div style={{ flex: '0 0 110px' }}>Status</div>
            <div style={{ width: 80, textAlign: 'right' }}>Action</div>
          </div>

          {/* Doc list */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: 12 }}>
                <RefreshCw size={24} />
              </motion.div>
              <div style={{ fontSize: 13 }}>Loading KYC documents…</div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <ShieldCheck size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No documents found</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Try a different filter or ask members to upload their documents.</div>
            </div>
          ) : filteredDocs.map((doc, i) => {
            const profile = doc.members?.profiles;
            const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
            const cfg = sCfg(doc.status);
            const StatusIcon = cfg.icon;

            return (
              <motion.div key={doc.id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', gap: 16, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setSelectedDoc(doc)}
              >
                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: cfg.color, flexShrink: 0 }}>
                  {avatar(name)}
                </div>

                {/* Name */}
                <div style={{ flex: '0 0 200px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{profile?.sa_id_number || '—'}</div>
                </div>

                {/* Doc type */}
                <div style={{ flex: '0 0 180px', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                  {DOC_LABEL[doc.doc_type] || doc.doc_type.replace(/_/g, ' ')}
                </div>

                {/* File */}
                <div style={{ flex: 1, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={13} color="#94a3b8" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name || '—'}</span>
                </div>

                {/* Date */}
                <div style={{ flex: '0 0 120px', fontSize: 12, color: '#64748b' }}>
                  {new Date(doc.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                {/* Status */}
                <div style={{ flex: '0 0 110px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 800, color: cfg.color, background: cfg.bg }}>
                    <StatusIcon size={10} /> {cfg.label}
                  </span>
                </div>

                {/* Quick actions */}
                <div style={{ width: 80, display: 'flex', gap: 5, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                  {doc.status === 'pending_review' ? (
                    <>
                      <button onClick={() => approveDoc(doc.id, '')} title="Verify"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => setSelectedDoc(doc)} title="Review & Reject"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Eye size={13} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setSelectedDoc(doc)} title="Review"
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Eye size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default AdminKYC;
