import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle, XCircle, RefreshCw, Zap, DollarSign,
  Check, X, Shield, Filter, Clock, AlertTriangle, User, Phone,
  CreditCard, ChevronRight, FileText, MessageSquare, Building,
  Plus, Calendar, Eye
} from 'lucide-react';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:    { label: 'Pending',    color: '#d97706', bg: '#fffbeb', icon: Clock },
  processed:  { label: 'Processed', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  success:    { label: 'Processed', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  failed:     { label: 'Failed',    color: '#dc2626', bg: '#fef2f2', icon: XCircle },
  cancelled:  { label: 'Cancelled', color: '#475569', bg: '#f1f5f9', icon: X },
};

const TABS = ['all', 'pending', 'processed', 'failed'];

function sCfg(s: string) { return STATUS_CFG[s] || STATUS_CFG.pending; }

function avatar(name: string) {
  return (name || 'M').split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`;
}

// ── Detail Panel ──────────────────────────────────────────────────────────
function DetailPanel({ order, onUpdateStatus, onRequestKYC, onClose }: any) {
  const [failReason, setFailReason] = useState(order.failure_reason || '');
  const [saving, setSaving] = useState(false);
  const [kycMsg, setKycMsg] = useState('');
  const [kycNote, setKycNote] = useState('');
  const [sendingKYC, setSendingKYC] = useState(false);

  const profile = order.members?.profiles;
  const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown Member';
  const bd = order.members?.banking_details
    ? (typeof order.members.banking_details === 'string' ? JSON.parse(order.members.banking_details || '{}') : order.members.banking_details)
    : null;
  const cfg = sCfg(order.status);
  const StatusIcon = cfg.icon;

  const doUpdate = async (status: string) => {
    setSaving(true);
    await onUpdateStatus(order.id, status, failReason, order.members?.id);
    setSaving(false);
  };

  const requestKYC = async () => {
    setSendingKYC(true);
    try {
      await supabase.from('kyc_requests').insert({
        member_id: order.members?.id,
        requested_by: 'admin',
        status: 'pending',
        message: kycNote || 'Please upload your KYC documents to continue with your debit order.',
      });
      setKycMsg('KYC request sent to member.');
      setTimeout(() => setKycMsg(''), 3000);
    } catch { setKycMsg('Failed to send KYC request.'); }
    finally { setSendingKYC(false); }
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 35 }}
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0B1B3F, #1e3a7a)', padding: '22px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
              {avatar(name)}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                {profile?.sa_id_number || '—'} · {profile?.phone || '—'}
              </div>
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
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
            R{(order.amount_cents / 100).toFixed(2)}
          </span>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
            {new Date(order.collection_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* Member banking details */}
        <Section title="Member Banking Details">
          {bd ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Bank', value: bd.bank_name, icon: Building },
                { label: 'Account Holder', value: bd.account_holder || bd.account_name, icon: User },
                { label: 'Account Number', value: bd.account_number, icon: CreditCard },
                { label: 'Branch Code', value: bd.branch_code, icon: Building },
                { label: 'Account Type', value: bd.account_type, icon: FileText },
              ].filter(i => i.value).map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon size={10} /> {label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px 0', fontSize: 13, color: '#94a3b8' }}>
              Member has not yet submitted banking details. They need to set up their debit mandate first.
            </div>
          )}
        </Section>

        {/* KYC status + request */}
        <Section title="KYC Status">
          <div style={{ marginBottom: 10 }}>
            <MemberKYCStatus memberId={order.members?.id} />
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Send a KYC request with an optional note:</div>
          <textarea value={kycNote} onChange={e => setKycNote(e.target.value)}
            placeholder="Optional message to member about what documents are needed…"
            style={{ width: '100%', minHeight: 64, padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', marginBottom: 8 }} />
          <button onClick={requestKYC} disabled={sendingKYC}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#1e3a7a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            <Shield size={13} /> {sendingKYC ? 'Sending…' : 'Request KYC from Member'}
          </button>
          {kycMsg && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: kycMsg.includes('Failed') ? '#dc2626' : '#16a34a' }}>{kycMsg}</div>}
        </Section>

        {/* Failure reason (if marking failed) */}
        <Section title="Failure Reason">
          <textarea value={failReason} onChange={e => setFailReason(e.target.value)}
            placeholder="e.g. Insufficient funds, account closed, wrong details…"
            style={{ width: '100%', minHeight: 72, padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>This note is shown to the member when a debit order fails.</div>
        </Section>

        {/* Plan info */}
        <Section title="Plan">
          <div style={{ fontSize: 13, color: '#374151' }}>
            <strong>{order.plans?.name || '—'}</strong>
          </div>
        </Section>
      </div>

      {/* Footer actions */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 24px', background: '#f8fafc', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <button onClick={() => doUpdate('processed')} disabled={saving}
            style={{ padding: '12px 0', borderRadius: 10, border: order.status === 'processed' ? '2px solid #10b981' : '1px solid #bbf7d0', background: order.status === 'processed' ? '#f0fdf4' : '#fff', color: '#15803d', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Check size={15} /> Mark Processed
          </button>
          <button onClick={() => doUpdate('failed')} disabled={saving}
            style={{ padding: '12px 0', borderRadius: 10, border: order.status === 'failed' ? '2px solid #ef4444' : '1px solid #fecaca', background: order.status === 'failed' ? '#fef2f2' : '#fff', color: '#b91c1c', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <X size={15} /> Mark Failed
          </button>
        </div>
        <button onClick={() => doUpdate('pending')} disabled={saving}
          style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Clock size={13} /> Reset to Pending
        </button>
      </div>
    </motion.div>
  );
}

// ── KYC status inline component ────────────────────────────────────────────
function MemberKYCStatus({ memberId }: { memberId: string }) {
  const [kyc, setKyc] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;
    supabase.from('kyc_documents').select('doc_type, status').eq('member_id', memberId)
      .then(({ data }) => { setKyc(data || []); setLoading(false); });
  }, [memberId]);

  if (loading) return <div style={{ fontSize: 12, color: '#94a3b8' }}>Loading KYC…</div>;
  if (!kyc.length) return (
    <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
      No KYC documents uploaded yet
    </div>
  );

  const all = kyc.every(d => d.status === 'verified');
  return (
    <div style={{ padding: '10px 14px', background: all ? '#f0fdf4' : '#fffbeb', borderRadius: 8, border: `1px solid ${all ? '#bbf7d0' : '#fde68a'}`, fontSize: 13, color: all ? '#15803d' : '#92400e', fontWeight: 600 }}>
      {all ? '✓ All documents verified' : `${kyc.filter(d => d.status === 'verified').length}/${kyc.length} documents verified`}
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        {kyc.map(d => (
          <span key={d.doc_type} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700, background: d.status === 'verified' ? '#dcfce7' : d.status === 'pending_review' ? '#fef9c3' : '#fee2e2', color: d.status === 'verified' ? '#16a34a' : d.status === 'pending_review' ? '#854d0e' : '#dc2626' }}>
            {d.doc_type.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

// ── Create Debit Order Modal ───────────────────────────────────────────────
function CreateOrderModal({ members, onClose, onCreated }: any) {
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (!memberId || !amount || !date) { setErr('Please fill all fields.'); return; }
    setSaving(true);
    setErr('');
    try {
      const mem = members.find((m: any) => m.id === memberId);
      const { error } = await supabase.from('debit_orders').insert({
        member_id: memberId,
        plan_id: mem?.plan_id || null,
        amount_cents: Math.round(parseFloat(amount) * 100),
        collection_date: date,
        status: 'pending',
      });
      if (error) throw error;
      onCreated();
      onClose();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, padding: '28px 30px', width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Create Debit Order</div>

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block' }}>Amount (R) *</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block' }}>Collection Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {err && <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginBottom: 12 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: '9px 18px', borderRadius: 8, background: '#0B1B3F', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? 'Creating…' : 'Create Order'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const AdminDebitOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('debit_orders')
        .select(`
          id, amount_cents, collection_date, status, failure_reason, created_at,
          members (
            id, plan_id, payment_method, banking_details,
            profiles (first_name, last_name, sa_id_number, phone, email)
          ),
          plans (name, monthly_fee_cents)
        `)
        .order('collection_date', { ascending: false });
      if (user?.clinicId) query = (query as any).eq('clinic_id', user.clinicId);
      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);

      // For create modal
      const { data: mems } = await supabase.from('members').select('id, plan_id, profiles(first_name, last_name)');
      setMembers(mems || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string, failureReason: string, memberId: string) => {
    try {
      await supabase.from('debit_orders').update({
        status,
        failure_reason: status === 'failed' ? failureReason : null,
        processed_at: status === 'processed' ? new Date().toISOString() : null,
      }).eq('id', orderId);

      // If failed, optionally create notification record
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, failure_reason: status === 'failed' ? failureReason : null } : o));
      if (selectedApp?.id === orderId) setSelectedApp((p: any) => p ? { ...p, status, failure_reason: status === 'failed' ? failureReason : null } : p);
      setToastMsg(`Order marked as ${status}`);
      setTimeout(() => setToastMsg(''), 2500);
    } catch (e: any) { alert('Update failed: ' + e.message); }
  };

  const bulkUpdate = async (status: string) => {
    if (!selectedIds.length) return;
    for (const id of selectedIds) {
      await supabase.from('debit_orders').update({ status, processed_at: status === 'processed' ? new Date().toISOString() : null }).eq('id', id);
    }
    setSelectedIds([]);
    setToastMsg(`${selectedIds.length} orders marked as ${status}`);
    setTimeout(() => setToastMsg(''), 2500);
    fetchOrders();
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const filtered = orders.filter(o => {
    const profile = o.members?.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchQ = !q || name.includes(q) || (profile?.sa_id_number || '').includes(q);
    const matchTab = activeTab === 'all' || o.status === activeTab || (activeTab === 'processed' && o.status === 'success');
    return matchQ && matchTab;
  });

  const totalPending = orders.filter(o => o.status === 'pending').reduce((s, o) => s + o.amount_cents, 0);
  const totalProcessed = orders.filter(o => o.status === 'processed' || o.status === 'success').reduce((s, o) => s + o.amount_cents, 0);
  const failedCount = orders.filter(o => o.status === 'failed').length;
  const tabCount = (t: string) => t === 'all' ? orders.length : orders.filter(o => o.status === t || (t === 'processed' && o.status === 'success')).length;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedApp(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }} />
        )}
      </AnimatePresence>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedApp && (
          <DetailPanel order={selectedApp} onUpdateStatus={updateStatus} onRequestKYC={() => {}} onClose={() => setSelectedApp(null)} />
        )}
      </AnimatePresence>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && <CreateOrderModal members={members} onClose={() => setShowCreate(false)} onCreated={fetchOrders} />}
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Debit Orders</h1>
            <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>Manage monthly collections, mark results, and request KYC from members.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => fetchOrders()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#fff', color: '#374151', border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#0B1B3F', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={14} /> New Debit Order
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Pending (R)', value: `R${(totalPending / 100).toFixed(2)}`, color: '#d97706', icon: Clock },
            { label: 'Collected (R)', value: `R${(totalProcessed / 100).toFixed(2)}`, color: '#10b981', icon: CheckCircle },
            { label: 'Failed', value: String(failedCount), color: failedCount > 0 ? '#dc2626' : '#64748b', icon: XCircle },
            { label: 'Total Orders', value: String(orders.length), color: '#6366f1', icon: CreditCard },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 700, marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 16, padding: '12px 18px', background: '#0B1B3F', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{selectedIds.length} selected</span>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button onClick={() => bulkUpdate('processed')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  <Check size={13} /> Mark All Processed
                </button>
                <button onClick={() => bulkUpdate('failed')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  <X size={13} /> Mark All Failed
                </button>
                <button onClick={() => setSelectedIds([])}
                  style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>

          {/* Tabs + search */}
          <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex' }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, color: activeTab === tab ? '#0B1B3F' : '#94a3b8', borderBottom: activeTab === tab ? '2px solid #0B1B3F' : '2px solid transparent', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: activeTab === tab ? '#0B1B3F' : '#f1f5f9', color: activeTab === tab ? '#fff' : '#64748b' }}>
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

          {/* Order list */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: 12 }}>
                <RefreshCw size={24} />
              </motion.div>
              <div style={{ fontSize: 13 }}>Loading debit orders…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <CreditCard size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No debit orders found</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Try a different filter or create a new debit order.</div>
            </div>
          ) : (
            <div>
              {/* Column headers */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', gap: 16 }}>
                <div style={{ width: 20 }} />
                <div style={{ width: 36 }} />
                <div style={{ flex: '0 0 200px' }}>Member</div>
                <div style={{ flex: '0 0 160px' }}>Plan</div>
                <div style={{ flex: '0 0 110px' }}>Amount</div>
                <div style={{ flex: '0 0 120px' }}>Collection Date</div>
                <div style={{ flex: 1 }}>Status</div>
                <div style={{ width: 80, textAlign: 'right' }}>Actions</div>
              </div>

              {filtered.map((order, i) => {
                const profile = order.members?.profiles;
                const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
                const cfg = sCfg(order.status);
                const StatusIcon = cfg.icon;
                const isSelected = selectedIds.includes(order.id);

                return (
                  <motion.div key={order.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                    style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', gap: 16, background: isSelected ? '#f0f4ff' : 'transparent', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Checkbox */}
                    <div onClick={e => { e.stopPropagation(); toggleSelect(order.id); }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: isSelected ? '2px solid #0B1B3F' : '1.5px solid #cbd5e1', background: isSelected ? '#0B1B3F' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {isSelected && <Check size={11} color="#fff" />}
                      </div>
                    </div>

                    {/* Avatar */}
                    <div onClick={() => setSelectedApp(order)} style={{ width: 36, height: 36, borderRadius: '50%', background: `${cfg.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: cfg.color, flexShrink: 0 }}>
                      {avatar(name)}
                    </div>

                    {/* Name */}
                    <div onClick={() => setSelectedApp(order)} style={{ flex: '0 0 200px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{profile?.sa_id_number || '—'}</div>
                    </div>

                    {/* Plan */}
                    <div onClick={() => setSelectedApp(order)} style={{ flex: '0 0 160px', fontSize: 12.5, color: '#374151' }}>{order.plans?.name || '—'}</div>

                    {/* Amount */}
                    <div onClick={() => setSelectedApp(order)} style={{ flex: '0 0 110px', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>R{(order.amount_cents / 100).toFixed(2)}</div>

                    {/* Date */}
                    <div onClick={() => setSelectedApp(order)} style={{ flex: '0 0 120px', fontSize: 12, color: '#64748b' }}>
                      {new Date(order.collection_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Status */}
                    <div onClick={() => setSelectedApp(order)} style={{ flex: 1 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 800, color: cfg.color, background: cfg.bg }}>
                        <StatusIcon size={10} /> {cfg.label}
                      </span>
                      {order.failure_reason && <div style={{ fontSize: 10.5, color: '#dc2626', marginTop: 3 }}>{order.failure_reason}</div>}
                    </div>

                    {/* Quick actions */}
                    <div style={{ width: 80, display: 'flex', gap: 5, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => updateStatus(order.id, 'processed', '', order.members?.id)} title="Mark Processed"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => updateStatus(order.id, 'failed', '', order.members?.id)} title="Mark Failed"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default AdminDebitOrders;
