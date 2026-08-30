import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { getMemberDetails, getDebitOrders, type DebitOrder } from "../../lib/api/member";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Banknote, CheckCircle, AlertTriangle, Clock, Shield,
  ChevronRight, RefreshCw, Check, X, Info, FileText, ArrowRight
} from "lucide-react";

const BANKS = [
  'ABSA Bank', 'Capitec Bank', 'Discovery Bank', 'First National Bank (FNB)',
  'Investec', 'Nedbank', 'Standard Bank', 'TymeBank', 'African Bank', 'Other'
];

const statusCfg = (status: string) => {
  if (status === 'processed' || status === 'success' || status === 'successful')
    return { label: 'Processed', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle };
  if (status === 'failed')
    return { label: 'Failed', color: '#dc2626', bg: '#fef2f2', icon: X };
  if (status === 'pending')
    return { label: 'Pending', color: '#d97706', bg: '#fffbeb', icon: Clock };
  return { label: status, color: '#475569', bg: '#f1f5f9', icon: Clock };
};

export default function DebitOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [member, setMember] = useState<any>(null);
  const [orders, setOrders] = useState<DebitOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Payment preference
  const [paymentMethod, setPaymentMethod] = useState<'debit_order' | 'eft' | ''>('');

  // Banking / mandate form
  const [banking, setBanking] = useState({
    bank_name: '', account_holder: '', account_number: '',
    branch_code: '', account_type: 'current',
  });
  const [mandateSigned, setMandateSigned] = useState(false);

  // KYC status
  const [kycStatus, setKycStatus] = useState<'verified' | 'pending' | 'incomplete'>('incomplete');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const mem = await getMemberDetails(user.id);
      setMember(mem);

      if (mem) {
        // Payment preference
        setPaymentMethod(mem.payment_method || '');
        setMandateSigned(!!mem.debit_mandate_signed);

        // Banking details (stored as JSON on member)
        const bd = typeof mem.banking_details === 'string'
          ? JSON.parse(mem.banking_details || '{}')
          : (mem.banking_details || {});
        if (bd.bank_name) setBanking({
          bank_name: bd.bank_name || '',
          account_holder: bd.account_holder || bd.account_name || '',
          account_number: bd.account_number || '',
          branch_code: bd.branch_code || '',
          account_type: bd.account_type || 'current',
        });

        // Debit order history
        const data = await getDebitOrders(mem.id);
        setOrders(data);

        // KYC status — check kyc_documents
        const { data: kycDocs } = await supabase
          .from('kyc_documents')
          .select('status, doc_type')
          .eq('member_id', mem.id);

        if (!kycDocs?.length) setKycStatus('incomplete');
        else if (kycDocs.every((d: any) => d.status === 'verified')) setKycStatus('verified');
        else setKycStatus('pending');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const savePreference = async (method: 'debit_order' | 'eft') => {
    setPaymentMethod(method);
    if (!member?.id) return;
    await supabase.from('members').update({ payment_method: method }).eq('id', member.id);
  };

  const saveMandate = async () => {
    if (!member?.id) return;
    if (!banking.bank_name || !banking.account_number || !banking.branch_code) {
      setSaveMsg('Please fill in all required banking fields.');
      return;
    }
    if (!mandateSigned) {
      setSaveMsg('Please authorize the debit mandate to continue.');
      return;
    }
    setSaving(true);
    setSaveMsg('');
    try {
      const { error } = await supabase.from('members').update({
        payment_method: 'debit_order',
        banking_details: banking,
        debit_mandate_signed: true,
      }).eq('id', member.id);
      if (error) throw error;
      setSaveMsg('✓ Debit mandate saved successfully!');
      setTimeout(() => setSaveMsg(''), 4000);
      load();
    } catch (err: any) {
      setSaveMsg('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0B1B3F' }} />
    </div>
  );

  const totalCollected = orders.filter(o => o.status === 'processed' || o.status === 'success').reduce((s, o) => s + o.amount_cents, 0);
  const failedCount = orders.filter(o => o.status === 'failed').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // Most recent failed/pending
  const latestFailed = orders.find(o => o.status === 'failed');
  const nextPending = orders.find(o => o.status === 'pending');
  const lastSuccess = orders.find(o => o.status === 'processed' || o.status === 'success');

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 780 }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Debit Orders</h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>
          Manage your payment method, banking mandate, and collection history.
        </p>
      </div>

      {/* ── Alert banners ── */}
      <AnimatePresence>
        {latestFailed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 16, padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 3 }}>
                Debit Order Failed — Action Required
              </div>
              <div style={{ fontSize: 13, color: '#b91c1c', lineHeight: 1.5 }}>
                Your debit order of <strong>R{(latestFailed.amount_cents / 100).toFixed(2)}</strong> scheduled for{' '}
                {new Date(latestFailed.collection_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })} could not be collected.
                {(latestFailed as any).failure_reason && <> Reason: {(latestFailed as any).failure_reason}.</>} Please ensure sufficient funds and correct banking details.
              </div>
            </div>
            <button onClick={() => navigate('/member/payments')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Pay Now <ArrowRight size={13} />
            </button>
          </motion.div>
        )}
        {!latestFailed && lastSuccess && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 16, padding: '14px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>
              Last collection of <strong>R{(lastSuccess.amount_cents / 100).toFixed(2)}</strong> was processed successfully on{' '}
              {new Date(lastSuccess.collection_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </div>
          </motion.div>
        )}
        {nextPending && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 16, padding: '14px 20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock size={18} color="#d97706" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
              Next collection of <strong>R{(nextPending.amount_cents / 100).toFixed(2)}</strong> is scheduled for{' '}
              {new Date(nextPending.collection_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}.
              Please ensure sufficient funds in your account.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Collected', value: `R${(totalCollected / 100).toFixed(2)}`, color: '#10b981' },
          { label: 'Pending', value: String(pendingCount), color: '#d97706' },
          { label: 'Failed', value: String(failedCount), color: failedCount > 0 ? '#dc2626' : '#64748b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Payment method selection ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Payment Method</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            {
              key: 'debit_order',
              icon: CreditCard,
              title: 'Debit Order',
              desc: 'Authorize us to collect your monthly premium automatically. Banking details required.',
            },
            {
              key: 'eft',
              icon: Banknote,
              title: 'Manual EFT',
              desc: 'You pay your monthly premium manually via EFT and upload proof of payment each month.',
            },
          ].map(({ key, icon: Icon, title, desc }) => {
            const active = paymentMethod === key;
            return (
              <button key={key} onClick={() => savePreference(key as any)}
                style={{
                  padding: '18px 20px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  border: active ? '2px solid #0B1B3F' : '1px solid #e2e8f0',
                  background: active ? '#f0f4ff' : '#fafbfc',
                  transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: active ? '#0B1B3F' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={active ? '#fff' : '#64748b'} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: active ? '#0B1B3F' : '#374151' }}>{title}</div>
                  {active && <Check size={16} color="#0B1B3F" style={{ marginLeft: 'auto' }} />}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
              </button>
            );
          })}
        </div>

        {paymentMethod === 'eft' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            style={{ padding: '14px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, display: 'flex', gap: 10 }}>
            <Info size={16} color="#0369a1" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: '#0c4a6e', lineHeight: 1.6 }}>
              With Manual EFT, you pay each month and upload your proof of payment via the{' '}
              <button onClick={() => navigate('/member/payments')} style={{ background: 'none', border: 'none', color: '#0369a1', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                Payments page
              </button>. Failure to pay on time may result in your policy becoming inactive.
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Debit Order Mandate ── */}
      <AnimatePresence>
        {paymentMethod === 'debit_order' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>

            {/* KYC status */}
            {kycStatus !== 'verified' && (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: kycStatus === 'pending' ? '#fffbeb' : '#fef2f2', border: `1px solid ${kycStatus === 'pending' ? '#fde68a' : '#fecaca'}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Shield size={18} color={kycStatus === 'pending' ? '#d97706' : '#dc2626'} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: kycStatus === 'pending' ? '#92400e' : '#991b1b', marginBottom: 2 }}>
                    {kycStatus === 'pending' ? 'KYC Documents Under Review' : 'KYC Verification Required'}
                  </div>
                  <div style={{ fontSize: 12, color: kycStatus === 'pending' ? '#92400e' : '#b91c1c' }}>
                    {kycStatus === 'pending'
                      ? 'Your documents are being reviewed. Your debit mandate will be activated once KYC is complete.'
                      : 'A debit mandate requires verified identity documents. Please upload your KYC documents before activating a debit order.'}
                  </div>
                </div>
                {kycStatus === 'incomplete' && (
                  <button onClick={() => navigate('/member/kyc')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#0B1B3F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Upload KYC <ArrowRight size={13} />
                  </button>
                )}
              </div>
            )}

            <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              Banking Details & Debit Mandate
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[
                { label: 'Bank Name *', field: 'bank_name', type: 'select', options: BANKS },
                { label: 'Account Holder Name *', field: 'account_holder', type: 'text', placeholder: 'Full name as on bank account' },
                { label: 'Account Number *', field: 'account_number', type: 'text', placeholder: 'e.g. 62847291034' },
                { label: 'Branch Code *', field: 'branch_code', type: 'text', placeholder: 'e.g. 250655' },
              ].map(({ label, field, type, placeholder, options }) => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{label}</label>
                  {type === 'select' ? (
                    <select value={(banking as any)[field]} onChange={e => setBanking(b => ({ ...b, [field]: e.target.value }))}
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none' }}>
                      <option value="">Select bank…</option>
                      {options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type} value={(banking as any)[field]} placeholder={placeholder}
                      onChange={e => setBanking(b => ({ ...b, [field]: e.target.value }))}
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none' }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block' }}>Account Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['current', 'savings', 'transmission'].map(t => (
                  <button key={t} onClick={() => setBanking(b => ({ ...b, account_type: t }))}
                    style={{ padding: '7px 16px', borderRadius: 8, border: banking.account_type === t ? '2px solid #0B1B3F' : '1px solid #e2e8f0', background: banking.account_type === t ? '#f0f4ff' : '#fff', fontSize: 12, fontWeight: 600, color: banking.account_type === t ? '#0B1B3F' : '#64748b', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Mandate authorization */}
            <div style={{ padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 16 }}>
              <label style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start' }}>
                <input type="checkbox" checked={mandateSigned} onChange={e => setMandateSigned(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.6 }}>
                  I hereby authorise <strong>NFS Insure Consultant (Pty) Ltd (FSP 53910)</strong> to debit my bank account as detailed above on the 1st of each month for the amount due for my membership plan. I understand I will receive notice of any changes to the debit amount. This mandate may be cancelled by me in writing with 30 days' notice.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: saveMsg.includes('✓') ? '#16a34a' : '#dc2626' }}>{saveMsg}</div>
              <button onClick={saveMandate} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'linear-gradient(135deg, #0B1B3F, #1e3a7a)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save & Authorise Mandate</>}
              </button>
            </div>

            {mandateSigned && member?.debit_mandate_signed && (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <CheckCircle size={15} color="#16a34a" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#15803d' }}>Debit mandate is active. Collection day: 1st of each month.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collection History ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Collection History</div>
        </div>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <CreditCard size={36} color="#e2e8f0" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No collections yet</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              {paymentMethod === 'eft' ? 'Manual EFT payments are tracked on the Payments page.' : 'Your debit order history will appear here once collections begin.'}
            </div>
          </div>
        ) : (
          <div>
            {orders.map((o, i) => {
              const cfg = statusCfg(o.status);
              const StatusIcon = cfg.icon;
              return (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: i < orders.length - 1 ? '1px solid #f1f5f9' : 'none', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                    <StatusIcon size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      R{(o.amount_cents / 100).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>
                      {new Date(o.collection_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    {(o as any).failure_reason && (
                      <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>Reason: {(o as any).failure_reason}</div>
                    )}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
