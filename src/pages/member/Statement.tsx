import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  getMemberDetails, getConsultations, getPayments, getDebitOrders,
  type Consultation, type Payment, type Member
} from "../../lib/api/member";
import { C, S, Icon, Btn, Card } from "../../components/shared";
import { motion } from "framer-motion";

// ── Print styles injected into <head> ────────────────────────────────────────
const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #nfs-statement, #nfs-statement * { visibility: visible !important; }
  #nfs-statement {
    position: fixed !important;
    inset: 0 !important;
    padding: 40px 48px !important;
    background: #fff !important;
    font-family: 'Inter', 'Helvetica Neue', sans-serif !important;
  }
  .no-print { display: none !important; }
  .print-break { page-break-before: always; }
}
`;

export default function Statement() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [member, setMember] = useState<Member | null>(null);
  const [appPlan, setAppPlan] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [failedPayments, setFailedPayments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inject print styles
    const style = document.createElement('style');
    style.id = 'nfs-print-styles';
    style.textContent = PRINT_STYLES;
    if (!document.getElementById('nfs-print-styles')) document.head.appendChild(style);
    return () => document.getElementById('nfs-print-styles')?.remove();
  }, []);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        // Load member + profile + clinic
        const mem = await getMemberDetails(user.id);
        setMember(mem);

        // Fetch full profile
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);

        // Fetch clinic
        const clinicId = mem?.clinic_id;
        if (clinicId) {
          const { data: cl } = await supabase.from('clinics').select('*').eq('id', clinicId).single();
          setClinic(cl);
        }

        if (mem) {
          const [cons, pays, orders] = await Promise.all([
            getConsultations(mem.id),
            getPayments(mem.id),
            getDebitOrders(mem.id),
          ]);
          setConsultations(cons);
          setPayments(pays);
          const collected = orders.filter(o => o.status === 'success' || o.status === 'successful').reduce((s, o) => s + o.amount_cents, 0);
          const failed = orders.filter(o => o.status === 'failed').length;
          setTotalCollected(collected);
          setFailedPayments(failed);
        }

        // Fallback plan from latest application
        if (!mem?.plan_id) {
          const { data: app } = await supabase.from('applications').select('plan_id').eq('profile_id', user.id).order('submitted_at', { ascending: false }).limit(1).maybeSingle();
          if (app?.plan_id) {
            const { data: plan } = await supabase.from('plans').select('*').eq('id', app.plan_id).single();
            if (plan) setAppPlan(plan);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: C.navy }} />
    </div>
  );

  const plan = member?.plan || appPlan;
  const monthlyFee = plan?.monthly_fee_cents ? plan.monthly_fee_cents / 100 : (plan?.monthly_fee || 0);
  const memberName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user?.name : user?.name;
  const memberPhone = profile?.phone || '+27 00 000 0000';
  const today = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  const statementNo = `NFS-${(member?.id || user?.id || '').slice(0, 8).toUpperCase()}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const statusColor = (s?: string) => {
    if (s === 'active') return '#16a34a';
    if (s === 'pending') return '#d97706';
    if (s === 'suspended') return '#dc2626';
    return '#475569';
  };

  const payStatus = (s: string) => {
    if (s === 'success' || s === 'successful' || s === 'completed') return { label: 'PAID', color: '#16a34a', bg: '#f0fdf4' };
    if (s === 'failed') return { label: 'FAILED', color: '#dc2626', bg: '#fef2f2' };
    return { label: s.toUpperCase(), color: '#475569', bg: '#f8fafc' };
  };

  return (
    <div>
      {/* ── Top action bar ── */}
      <div className="no-print" style={{ background: C.navy, color: C.white, margin: "-30px -36px 28px", padding: "16px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Membership Statement</span>
          <span style={{ marginLeft: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{statementNo}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {/* Email — Coming Soon */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(201,150,58,0.25)', border: '1px solid rgba(201,150,58,0.4)', fontSize: 12.5, fontWeight: 600, color: '#E8B85A' }}>
            <Icon name="mail" size={13} color="#E8B85A" />
            Email me this statement
            <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 800, background: '#E8B85A', color: '#0B1B3F', padding: '2px 6px', borderRadius: 10 }}>SOON</span>
          </div>
          <button
            onClick={handlePrint}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 8, background: C.white, color: C.navy, border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
          >
            <Icon name="print" size={13} color={C.navy} /> Print / Save as PDF
          </button>
          <button
            onClick={() => navigate("/member")}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, background: 'transparent', color: C.white, border: '1px solid rgba(255,255,255,0.3)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>

      {/* ── Printable statement body ── */}
      <div id="nfs-statement" style={{ maxWidth: 820, margin: '0 auto', background: '#fff' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 24, borderBottom: `3px solid ${C.navy}` }}>
          <div>
            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="shield" size={24} color={C.gold} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.navy, letterSpacing: '-0.02em' }}>{clinic?.name || 'Braam Health Centre'}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: '0.06em', textTransform: 'uppercase' }}>NFS Insure Network</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.grey500, lineHeight: 1.7 }}>
              NFS Insure Consultant (Pty) Ltd · FSP 53910<br />
              {clinic?.address_line1 || 'Eagle Canyon Office Park, Randpark Ridge, 2154'}<br />
              {clinic?.phone && <>{clinic.phone} · </>}{clinic?.email || 'info@nfs.insure'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.navy, marginBottom: 4 }}>MEMBERSHIP STATEMENT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ fontSize: 11, color: C.grey500 }}>Statement No: <strong style={{ color: C.navy, fontFamily: 'monospace' }}>{statementNo}</strong></div>
              <div style={{ fontSize: 11, color: C.grey500 }}>Generated: <strong style={{ color: C.navy }}>{today}</strong></div>
              <div style={{ fontSize: 11, color: C.grey500 }}>Period: <strong style={{ color: C.navy }}>Year to Date {new Date().getFullYear()}</strong></div>
            </div>
          </div>
        </div>

        {/* Member + plan info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          {/* Member info */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Member Information</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 6 }}>{memberName || 'Member'}</div>
            <div style={{ fontSize: 12.5, color: C.grey700, lineHeight: 1.8 }}>
              <div>{user?.email}</div>
              <div>{memberPhone}</div>
              {profile?.sa_id_number && <div>ID: {profile.sa_id_number}</div>}
              {profile?.address_line1 && <div style={{ marginTop: 4 }}>{profile.address_line1}{profile.city ? `, ${profile.city}` : ''}</div>}
            </div>
          </div>

          {/* Membership details */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Membership Details</div>
            <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Plan', plan?.name || '—'],
                  ['Monthly Fee', monthlyFee > 0 ? `R${monthlyFee.toFixed(2)}` : '—'],
                  ['Debit Day', '1st of month'],
                  ['Card Number', member?.card_number || 'Not assigned'],
                  ['Status', (member?.status || 'pending').toUpperCase()],
                  ['Member Since', new Date(member?.created_at || Date.now()).toLocaleDateString('en-ZA')],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ color: C.grey500, paddingTop: 7, paddingBottom: 7, paddingRight: 16, fontWeight: 500, whiteSpace: 'nowrap' }}>{k}</td>
                    <td style={{ color: k === 'Status' ? statusColor(member?.status) : C.navy, fontWeight: 700, paddingTop: 7, paddingBottom: 7 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Collected', value: `R${(totalCollected / 100).toFixed(2)}`, color: C.teal },
            { label: 'Consultations Used', value: String(consultations.length), color: C.navy },
            { label: 'Failed Payments', value: String(failedPayments), color: failedPayments > 0 ? '#dc2626' : C.navy },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: `1px solid #e2e8f0`, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.grey500, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Payment history */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Payment History</div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', background: C.navy, padding: '10px 16px' }}>
              <span style={{ flex: 2, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</span>
              <span style={{ flex: 1, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reference</span>
              <span style={{ flex: 1, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Amount</span>
              <span style={{ flex: 1, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Status</span>
            </div>
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: C.grey500, fontSize: 13 }}>
                <Icon name="creditcard" size={28} color={C.grey300} /><br />No payments on record.
              </div>
            ) : payments.map((p, i) => {
              const s = payStatus(p.status || 'completed');
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: i < payments.length - 1 ? '1px solid #f1f5f9' : 'none', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <span style={{ flex: 2, fontSize: 13, color: C.navy }}>{new Date(p.created_at || p.date || Date.now()).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span style={{ flex: 1, fontSize: 12, color: C.grey500, fontFamily: 'monospace' }}>{p.id?.slice(0, 8).toUpperCase() || '—'}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.navy, textAlign: 'right' }}>R{(p.amount_cents / 100).toFixed(2)}</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 800, color: s.color, background: s.bg }}>{s.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consultation history */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Consultation History</div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', background: C.navy, padding: '10px 16px' }}>
              <span style={{ flex: '0 0 160px', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</span>
              <span style={{ flex: 1, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type / Notes</span>
            </div>
            {consultations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: C.grey500, fontSize: 13 }}>
                <Icon name="pulse" size={28} color={C.grey300} /><br />No consultations on record.
              </div>
            ) : consultations.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: i < consultations.length - 1 ? '1px solid #f1f5f9' : 'none', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <span style={{ flex: '0 0 160px', fontSize: 13, color: C.navy, fontWeight: 600 }}>{new Date(c.visited_at || c.consultation_date || Date.now()).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span style={{ flex: 1, fontSize: 12.5, color: C.grey700 }}>{c.consultation_type || 'General Consultation'}{c.clinical_notes ? ` — ${c.clinical_notes}` : ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `2px solid ${C.navy}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: C.grey500, lineHeight: 1.7 }}>
            <strong style={{ color: C.navy }}>NFS Insure Consultant (Pty) Ltd</strong><br />
            Authorised Financial Services Provider · FSP 53910<br />
            This statement is computer-generated and valid without a signature.
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: C.grey500 }}>
            <div style={{ fontWeight: 700, color: C.teal, fontSize: 13 }}>www.nfs.insure</div>
            <div>info@nfs.insure</div>
            <div>+27 10 011 0010</div>
          </div>
        </div>
      </div>
    </div>
  );
}
