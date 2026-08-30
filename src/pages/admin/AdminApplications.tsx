import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, User, Shield, Check, X, CreditCard, Calendar,
  Clock, Activity, DollarSign, Users, Phone, Mail, ExternalLink,
  RefreshCw, ChevronRight, CheckCircle, AlertTriangle, Zap, Filter,
  Eye, ArrowRight, Building, MessageSquare, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logAudit } from '../../lib/api/audit';

// ── Types ──────────────────────────────────────────────────────────────────
type AppStatus = 'submitted' | 'awaiting_approval' | 'approved' | 'rejected' | 'cancelled' | 'completed' | string;

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  submitted:        { label: 'New',          color: '#c2410c', bg: '#fff7ed', icon: FileText },
  awaiting_approval:{ label: 'Under Review', color: '#854d0e', bg: '#fef9c3', icon: Clock },
  pending:          { label: 'Under Review', color: '#854d0e', bg: '#fef9c3', icon: Clock },
  approved:         { label: 'Approved',     color: '#15803d', bg: '#f0fdf4', icon: CheckCircle },
  rejected:         { label: 'Rejected',     color: '#b91c1c', bg: '#fef2f2', icon: X },
  cancelled:        { label: 'Cancelled',    color: '#475569', bg: '#f1f5f9', icon: X },
  completed:        { label: 'Active',       color: '#1d4ed8', bg: '#eff6ff', icon: Shield },
};

const TABS = [
  { key: 'all',               label: 'All' },
  { key: 'submitted',         label: 'New' },
  { key: 'awaiting_approval', label: 'Under Review' },
  { key: 'approved',          label: 'Approved' },
  { key: 'completed',         label: 'Active' },
  { key: 'rejected',          label: 'Rejected' },
];

function statusCfg(status: string) {
  return STATUS_CFG[status] || { label: status, color: '#475569', bg: '#f1f5f9', icon: FileText };
}

function avatar(name: string) {
  return (name || 'U').split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

// ── Detail Panel ───────────────────────────────────────────────────────────
function DetailPanel({ app, memberData, loadingMember, onStatus, onActivate, onClose }: any) {
  const [tab, setTab] = useState<'overview' | 'member' | 'banking'>('overview');
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const cfg = statusCfg(app.status);
  const StatusIcon = cfg.icon;
  const osArr = app.onboarding_steps || [];
  const osRec = Array.isArray(osArr) ? osArr[0] : osArr;
  const hasPOP = !!osRec?.proof_of_payment_url;
  const paymentDone = !!osRec?.payment_setup_done;

  const saveNote = async () => {
    if (!adminNote.trim()) return;
    setSavingNote(true);
    await supabase.from('applications').update({ rejection_reason: adminNote }).eq('id', app.id);
    setSavingNote(false);
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 35 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 560,
        background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        zIndex: 1000, display: 'flex', flexDirection: 'column', overflowY: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0B1B3F, #1e3a7a)', padding: '24px 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>
              {avatar(app.display_name)}
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{app.display_name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>Submitted {timeAgo(app.submitted_at)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#fff' }}>
            <X size={16} />
          </button>
        </div>

        {/* Status + Plan badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
            <StatusIcon size={11} /> {cfg.label}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
            <Shield size={11} /> {app.plans?.name || 'Unknown Plan'}
          </span>
          {hasPOP && !paymentDone && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#166534' }}>
              <Check size={11} /> POP Uploaded
            </span>
          )}
          {paymentDone && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>
              <CheckCircle size={11} /> Payment Verified
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
        {[
          { key: 'overview', label: 'Overview', icon: Eye },
          { key: 'member',   label: 'Member Data', icon: User },
          { key: 'banking',  label: 'Banking', icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as any)}
            style={{
              flex: 1, padding: '13px 0', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              color: tab === key ? '#0B1B3F' : '#94a3b8',
              borderBottom: tab === key ? '2px solid #0B1B3F' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Contact info */}
              <Section title="Applicant Details">
                <InfoGrid items={[
                  { label: 'Full Name', value: app.display_name, icon: User },
                  { label: 'ID Number', value: app.display_id_number, icon: Shield },
                  { label: 'Phone', value: app.display_phone, icon: Phone },
                  { label: 'Email', value: app.display_email, icon: Mail },
                  { label: 'Application Type', value: app.application_type, icon: FileText },
                  { label: 'Submitted', value: new Date(app.submitted_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
                ]} />
              </Section>

              {/* Payment Section */}
              <Section title="Payment Status">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: paymentDone ? '#f0fdf4' : hasPOP ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${paymentDone ? '#bbf7d0' : hasPOP ? '#fde68a' : '#fecaca'}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: paymentDone ? '#dcfce7' : hasPOP ? '#fef9c3' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {paymentDone ? <CheckCircle size={18} color="#16a34a" /> : hasPOP ? <Clock size={18} color="#d97706" /> : <AlertTriangle size={18} color="#dc2626" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: paymentDone ? '#15803d' : hasPOP ? '#92400e' : '#991b1b' }}>
                        {paymentDone ? 'Payment Verified — Policy Active' : hasPOP ? 'POP Uploaded — Awaiting Admin Verification' : 'No Proof of Payment Yet'}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {paymentDone ? 'Member policy is currently active.' : hasPOP ? 'Review the document and activate the policy below.' : 'Member has not yet uploaded proof of payment.'}
                      </div>
                    </div>
                  </div>

                  {hasPOP && (
                    <a href={osRec.proof_of_payment_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#0369a1', textDecoration: 'none' }}>
                      <ExternalLink size={14} /> View Proof of Payment Document
                    </a>
                  )}
                </div>
              </Section>

              {/* Admin note */}
              <Section title="Admin Note">
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Add an internal note about this application..."
                  style={{ width: '100%', minHeight: 80, padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                />
                <button onClick={saveNote} disabled={savingNote || !adminNote.trim()}
                  style={{ marginTop: 8, padding: '8px 16px', background: '#0B1B3F', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: !adminNote.trim() ? 0.4 : 1 }}>
                  {savingNote ? 'Saving…' : 'Save Note'}
                </button>
              </Section>

              {/* Timeline */}
              <Section title="Application Timeline">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: 'Application Submitted', date: app.submitted_at, done: true, color: '#3b82f6' },
                    { label: 'Under Review', date: app.reviewed_at, done: !!app.reviewed_at, color: '#f59e0b' },
                    { label: 'Approved / Rejected', date: ['approved','rejected','completed'].includes(app.status) ? app.reviewed_at : null, done: ['approved','rejected','completed'].includes(app.status), color: app.status === 'rejected' ? '#ef4444' : '#10b981' },
                    { label: 'Payment Received', date: osRec?.payment_setup_at, done: paymentDone, color: '#8b5cf6' },
                    { label: 'Policy Activated', date: osRec?.payment_setup_at, done: paymentDone, color: '#10b981' },
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i === 4 ? 0 : 16, position: 'relative' }}>
                      {i < 4 && <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 2, background: '#e2e8f0' }} />}
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: step.done ? step.color : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                        {step.done ? <Check size={12} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />}
                      </div>
                      <div style={{ paddingTop: 2 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: step.done ? '#0f172a' : '#94a3b8' }}>{step.label}</div>
                        {step.date && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{new Date(step.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </motion.div>
          )}

          {/* MEMBER DATA TAB */}
          {tab === 'member' && (
            <motion.div key="mem" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loadingMember ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: 12 }}>
                    <RefreshCw size={24} />
                  </motion.div>
                  <div style={{ fontSize: 13 }}>Loading member data…</div>
                </div>
              ) : memberData?.member ? (
                <>
                  <Section title="Member Profile">
                    <InfoGrid items={[
                      { label: 'Member Status', value: memberData.member.status, icon: Shield, highlight: memberData.member.status === 'active' },
                      { label: 'Plan', value: memberData.member.plans?.name || 'N/A', icon: CreditCard },
                      { label: 'Member Since', value: memberData.member.member_since ? new Date(memberData.member.member_since).toLocaleDateString('en-ZA') : 'Pending', icon: Calendar },
                    ]} />
                    <Link to={`/admin/members`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#3b82f6', fontWeight: 600, textDecoration: 'none', marginTop: 12 }}>
                      View full member profile <ArrowRight size={12} />
                    </Link>
                  </Section>

                  <Section title={`Consultations (${memberData.consultations.length})`}>
                    {memberData.consultations.length === 0 ? <Empty text="No consultations on record" /> : memberData.consultations.map((c: any) => (
                      <Row key={c.id} label={new Date(c.visited_at || '').toLocaleDateString('en-ZA')} value={c.consultation_type || 'General'} />
                    ))}
                  </Section>

                  <Section title={`Appointments (${memberData.appointments.length})`}>
                    {memberData.appointments.length === 0 ? <Empty text="No appointments booked" /> : memberData.appointments.map((a: any) => (
                      <Row key={a.id} label={new Date(a.appointment_date).toLocaleDateString('en-ZA')} value={a.status} />
                    ))}
                  </Section>

                  <Section title={`Dependants (${memberData.dependants.length})`}>
                    {memberData.dependants.length === 0 ? <Empty text="No dependants registered" /> : memberData.dependants.map((d: any) => (
                      <Row key={d.id} label={`${d.first_name} ${d.last_name}`} value={d.relationship} />
                    ))}
                  </Section>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <User size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1B3F', marginBottom: 6 }}>No member record yet</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>The applicant does not have an active member profile. It will be created automatically once the policy is activated.</div>
                </div>
              )}
            </motion.div>
          )}

          {/* BANKING TAB */}
          {tab === 'banking' && (
            <motion.div key="bank" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Section title="Applicant Banking Details">
                {app.banking_details ? (
                  <InfoGrid items={[
                    { label: 'Bank', value: (typeof app.banking_details === 'object' ? app.banking_details : JSON.parse(app.banking_details || '{}')).bank_name, icon: Building },
                    { label: 'Account Number', value: (typeof app.banking_details === 'object' ? app.banking_details : JSON.parse(app.banking_details || '{}')).account_number, icon: CreditCard },
                    { label: 'Branch Code', value: (typeof app.banking_details === 'object' ? app.banking_details : JSON.parse(app.banking_details || '{}')).branch_code, icon: Building },
                    { label: 'Account Type', value: (typeof app.banking_details === 'object' ? app.banking_details : JSON.parse(app.banking_details || '{}')).account_type, icon: FileText },
                  ]} />
                ) : (
                  <Empty text="No banking details captured on this application" />
                )}
              </Section>

              <Section title="Agreements">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Terms & Conditions Agreed', value: app.agreed_terms },
                    { label: 'POPIA Consent Given', value: app.metadata?.agreed_popia },
                    { label: 'Medical Disclosure Signed', value: app.metadata?.agreed_medical_disclosure },
                    { label: 'Debit Mandate Authorised', value: app.authorized_debit || app.metadata?.agreed_debit_mandate },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: value ? '#f0fdf4' : '#fef2f2', border: `1px solid ${value ? '#bbf7d0' : '#fecaca'}` }}>
                      {value ? <Check size={14} color="#16a34a" /> : <X size={14} color="#dc2626" />}
                      <span style={{ fontSize: 13, fontWeight: 500, color: value ? '#15803d' : '#991b1b' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 28px', background: '#f8fafc', flexShrink: 0 }}>
        {/* Activate Policy */}
        {app.status === 'approved' && !paymentDone && (
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => onActivate(app.id, app.member_id, app.profile_id)}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.02em' }}>
              <Zap size={16} /> Activate Policy & Confirm Payment
            </button>
            <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 6 }}>
              Only click after confirming payment was received outside the system.
            </div>
          </div>
        )}

        {/* Status buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <button onClick={() => onStatus(app.id, 'approved', app.display_name)}
            style={{ padding: '10px 0', borderRadius: 8, border: app.status === 'approved' ? '2px solid #10b981' : '1px solid #e2e8f0', background: app.status === 'approved' ? '#f0fdf4' : '#fff', color: app.status === 'approved' ? '#15803d' : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
            <Check size={13} /> Approve
          </button>
          <button onClick={() => onStatus(app.id, 'awaiting_approval', app.display_name)}
            style={{ padding: '10px 0', borderRadius: 8, border: app.status === 'awaiting_approval' ? '2px solid #eab308' : '1px solid #e2e8f0', background: app.status === 'awaiting_approval' ? '#fefce8' : '#fff', color: app.status === 'awaiting_approval' ? '#854d0e' : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
            <Clock size={13} /> Review
          </button>
          <button onClick={() => onStatus(app.id, 'rejected', app.display_name)}
            style={{ padding: '10px 0', borderRadius: 8, border: app.status === 'rejected' ? '2px solid #ef4444' : '1px solid #e2e8f0', background: app.status === 'rejected' ? '#fef2f2' : '#fff', color: app.status === 'rejected' ? '#b91c1c' : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
            <X size={13} /> Reject
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Small shared components ────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value?: string | null; icon: any; highlight?: boolean }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {items.filter(i => i.value).map(({ label, value, icon: Icon, highlight }) => (
        <div key={label} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon size={10} /> {label}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? '#10b981' : '#0f172a', textTransform: 'capitalize' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#374151' }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ fontSize: 13, color: '#94a3b8', padding: '12px 0' }}>{text}</div>;
}

// ── Main Component ─────────────────────────────────────────────────────────
const AdminApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [memberData, setMemberData] = useState<any | null>(null);
  const [loadingMemberData, setLoadingMemberData] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchApplications(); }, []);

  useEffect(() => {
    if (selectedApp) {
      const profile: any = Array.isArray(selectedApp.profiles) ? selectedApp.profiles[0] : selectedApp.profiles;
      const idNumber = selectedApp.applicant_id_number || profile?.sa_id_number;
      fetchMemberData(selectedApp.profile_id, idNumber);
    } else {
      setMemberData(null);
    }
  }, [selectedApp]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id, application_type, status, applicant_name, applicant_id_number,
          submitted_at, profile_id, member_id, metadata, banking_details,
          agreed_terms, authorized_debit, reviewed_at, rejection_reason,
          profiles!applications_profile_id_fkey (
            full_name, first_name, last_name, sa_id_number, phone, email
          ),
          plans (id, name, monthly_fee_cents),
          onboarding_steps (id, payment_setup_done, proof_of_payment_url, payment_setup_at)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      const enriched = data?.map(app => {
        const profile: any = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
        const meta = typeof app.metadata === 'string' ? JSON.parse(app.metadata || '{}') : (app.metadata || {});
        return {
          ...app,
          display_name: app.applicant_name || meta.applicant_name || profile?.full_name || (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : '') || 'Unknown Applicant',
          display_id_number: app.applicant_id_number || meta.applicant_id_number || profile?.sa_id_number || 'N/A',
          display_phone: profile?.phone || meta.applicant_phone || 'N/A',
          display_email: profile?.email || meta.applicant_email || 'N/A',
        };
      });
      setApplications(enriched || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberData = async (profileId?: string, idNumber?: string) => {
    if (!profileId && !idNumber) { setMemberData(null); return; }
    setLoadingMemberData(true);
    try {
      let profile = null;
      if (profileId) {
        const { data } = await supabase.from('profiles').select('id, full_name, first_name, last_name, phone, email, sa_id_number').eq('id', profileId);
        if (data?.length) profile = data[0];
      }
      if (!profile && idNumber) {
        const { data } = await supabase.from('profiles').select('id, full_name, first_name, last_name, phone, email, sa_id_number').eq('sa_id_number', idNumber);
        if (data?.length) profile = data[0];
      }
      if (profile) {
        const { data: member } = await supabase.from('members').select('*, plans(name)').eq('profile_id', profile.id).single();
        if (member) {
          const [appts, cons, deps] = await Promise.all([
            supabase.from('appointments').select('*').eq('member_id', member.id).order('appointment_date', { ascending: false }).limit(5),
            supabase.from('consultations').select('*').eq('member_id', member.id).order('visited_at', { ascending: false }).limit(5),
            supabase.from('dependants').select('*').eq('member_id', member.id),
          ]);
          setMemberData({ profile, member, appointments: appts.data || [], consultations: cons.data || [], dependants: deps.data || [] });
        } else {
          setMemberData({ profile, member: null, appointments: [], consultations: [], dependants: [] });
        }
      } else {
        setMemberData(null);
      }
    } catch { setMemberData(null); }
    finally { setLoadingMemberData(false); }
  };

  const handleStatus = async (appId: string, status: string, applicantName: string) => {
    try {
      const { error } = await supabase.from('applications').update({ status, reviewed_at: new Date().toISOString() }).eq('id', appId);
      if (error) throw error;
      await logAudit({ performed_by: user?.id || 'system', performer_name: user?.name || 'Admin', action: `application_${status}`, entity_type: 'application', entity_id: appId, details: `Application for ${applicantName} was marked ${status} by ${user?.name || 'Admin'}` });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      if (selectedApp?.id === appId) setSelectedApp((p: any) => ({ ...p, status }));
      setSuccessMsg(`Application ${status.replace('_', ' ')}`);
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleActivate = async (appId: string, memberId: string | null, profileId: string | null) => {
    try {
      const app = applications.find(a => a.id === appId);
      const osArr = app?.onboarding_steps || [];
      const osRec = Array.isArray(osArr) ? osArr[0] : osArr;

      if (osRec?.id) {
        const { error } = await supabase.from('onboarding_steps').update({ payment_setup_done: true, payment_setup_at: new Date().toISOString() }).eq('id', osRec.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('onboarding_steps').insert({ application_id: appId, member_id: memberId, payment_setup_done: true, payment_setup_at: new Date().toISOString() });
        if (error) throw error;
      }

      if (memberId) await supabase.from('members').update({ status: 'active', member_since: new Date().toISOString().split('T')[0] }).eq('id', memberId);
      else if (profileId) await supabase.from('members').update({ status: 'active', member_since: new Date().toISOString().split('T')[0] }).eq('profile_id', profileId);

      await supabase.from('applications').update({ status: 'completed' }).eq('id', appId);
      await logAudit({ performed_by: user?.id || 'system', performer_name: user?.name || 'Admin', action: 'policy_activated', entity_type: 'application', entity_id: appId, details: `Policy activated for application ${appId}` });

      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'completed', onboarding_steps: [{ ...osRec, payment_setup_done: true }] } : a));
      if (selectedApp?.id === appId) {
        setSelectedApp((p: any) => p ? { ...p, status: 'completed', onboarding_steps: [{ ...osRec, payment_setup_done: true }] } : p);
        fetchMemberData(profileId || undefined, undefined);
      }
      setSuccessMsg('Policy activated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(`Failed to activate policy: ${err.message}`);
    }
  };

  // Filtering
  const filtered = applications.filter(app => {
    const matchTab = activeTab === 'all' || app.status === activeTab || (activeTab === 'awaiting_approval' && app.status === 'pending');
    const q = searchQuery.toLowerCase();
    const matchQ = !q || app.display_name.toLowerCase().includes(q) || app.display_id_number.includes(q) || app.display_email?.toLowerCase().includes(q);
    return matchTab && matchQ;
  });

  // Tab counts
  const tabCount = (key: string) => {
    if (key === 'all') return applications.length;
    if (key === 'awaiting_approval') return applications.filter(a => a.status === 'awaiting_approval' || a.status === 'pending').length;
    return applications.filter(a => a.status === key).length;
  };

  return (
    <>
      {/* Backdrop for panel */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedApp(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }} />
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedApp && (
          <DetailPanel
            app={selectedApp}
            memberData={memberData}
            loadingMember={loadingMemberData}
            onStatus={handleStatus}
            onActivate={handleActivate}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '10px 22px', borderRadius: 30, fontWeight: 700, fontSize: 13, zIndex: 2000, boxShadow: '0 4px 20px rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 1100 }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Applications</h1>
            <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>Review, approve and manage new membership applications.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={fetchApplications} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#fff', color: '#374151', border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: applications.length, color: '#6366f1', icon: FileText },
            { label: 'New', value: applications.filter(a => a.status === 'submitted').length, color: '#f59e0b', icon: Zap },
            { label: 'Awaiting POP', value: applications.filter(a => { const os = Array.isArray(a.onboarding_steps) ? a.onboarding_steps[0] : a.onboarding_steps; return a.status === 'approved' && !os?.proof_of_payment_url; }).length, color: '#ef4444', icon: AlertTriangle },
            { label: 'Active', value: applications.filter(a => a.status === 'completed').length, color: '#10b981', icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>

          {/* Tabs + search */}
          <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
              {TABS.map(tab => {
                const count = tabCount(tab.key);
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, color: activeTab === tab.key ? '#0B1B3F' : '#94a3b8', borderBottom: activeTab === tab.key ? '2px solid #0B1B3F' : '2px solid transparent', transition: 'all 0.2s' }}>
                    {tab.label}
                    {count > 0 && (
                      <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: activeTab === tab.key ? '#0B1B3F' : '#f1f5f9', color: activeTab === tab.key ? '#fff' : '#64748b' }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search applicants…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', width: 220 }} />
            </div>
          </div>

          {/* Application list */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: 12 }}>
                <RefreshCw size={24} />
              </motion.div>
              <div style={{ fontSize: 13 }}>Loading applications…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <FileText size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No applications found</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Try a different tab or search query.</div>
            </div>
          ) : (
            <div>
              {filtered.map((app, i) => {
                const cfg = statusCfg(app.status);
                const StatusIcon = cfg.icon;
                const osArr = app.onboarding_steps || [];
                const osRec = Array.isArray(osArr) ? osArr[0] : osArr;
                const hasPOP = !!osRec?.proof_of_payment_url;
                const paymentDone = !!osRec?.payment_setup_done;

                return (
                  <motion.div key={app.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedApp(app)}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Avatar */}
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${cfg.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: cfg.color, flexShrink: 0 }}>
                      {avatar(app.display_name)}
                    </div>

                    {/* Name + ID */}
                    <div style={{ flex: '0 0 200px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{app.display_name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>ID: {app.display_id_number}</div>
                    </div>

                    {/* Plan */}
                    <div style={{ flex: '0 0 140px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{app.plans?.name || '—'}</div>

                    {/* Submitted */}
                    <div style={{ flex: '0 0 110px', fontSize: 12, color: '#94a3b8' }}>{timeAgo(app.submitted_at)}</div>

                    {/* POP indicator */}
                    <div style={{ flex: '0 0 110px' }}>
                      {paymentDone ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '3px 9px', borderRadius: 20 }}>
                          <Shield size={10} /> Active
                        </span>
                      ) : hasPOP ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#15803d', background: '#f0fdf4', padding: '3px 9px', borderRadius: 20 }}>
                          <Check size={10} /> POP Uploaded
                        </span>
                      ) : null}
                    </div>

                    {/* Status badge */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                        <StatusIcon size={10} /> {cfg.label}
                      </span>
                      <ChevronRight size={16} color="#cbd5e1" />
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

export default AdminApplications;
