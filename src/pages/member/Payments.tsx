import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { getMemberDetails, type Member } from '../../lib/api/member';
import {
  CheckCircle, Copy, Upload, Clock, AlertTriangle, CreditCard, Calendar,
  ArrowRight, Check, Building, Banknote, ExternalLink, RefreshCw, Shield
} from 'lucide-react';

function formatDate(d: Date) {
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function nextPaymentDate(activatedAt?: string | null): Date {
  const base = activatedAt ? new Date(activatedAt) : new Date();
  const next = new Date(base);
  next.setMonth(next.getMonth() + 1);
  next.setDate(1);
  return next;
}

function daysUntil(d: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [latestApp, setLatestApp] = useState<any>(null);
  const [appPlan, setAppPlan] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [popUploaded, setPopUploaded] = useState(false);
  const [existingPop, setExistingPop] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const mem = await getMemberDetails(user.id);
      setMember(mem);

      // Load clinic details with banking
      const clinicId = mem?.clinic_id;
      if (clinicId) {
        const { data: clinicData } = await supabase.from('clinics').select('*').eq('id', clinicId).single();
        setClinic(clinicData);
      }

      // Load application + onboarding steps
      const appQuery = mem?.id
        ? supabase.from('applications').select('*, onboarding_steps(*)').eq('member_id', mem.id).order('submitted_at', { ascending: false }).limit(1).maybeSingle()
        : supabase.from('applications').select('*, onboarding_steps(*)').eq('profile_id', user.id).order('submitted_at', { ascending: false }).limit(1).maybeSingle();

      const { data: appData } = await appQuery;
      setLatestApp(appData);

      if (appData) {
        const osArr = appData.onboarding_steps || [];
        const osRec = Array.isArray(osArr) ? osArr[0] : osArr;
        if (osRec?.proof_of_payment_url) setExistingPop(osRec.proof_of_payment_url);
        if (osRec?.payment_setup_done) setPopUploaded(true);

        // If member has no plan yet, fetch it from the application's plan_id
        if (!mem?.plan_id && appData.plan_id) {
          const { data: planData } = await supabase.from('plans').select('*').eq('id', appData.plan_id).single();
          if (planData) setAppPlan(planData);
        }

        // Also load clinic from application's clinic_id if not loaded from member
        if (!mem?.clinic_id && appData.clinic_id) {
          const { data: clinicData } = await supabase.from('clinics').select('*').eq('id', appData.clinic_id).single();
          if (clinicData) setClinic(clinicData);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => { load(); }, [load]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePOPUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !latestApp) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `pop/${user?.id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('documents').upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

      const osArr = latestApp.onboarding_steps || [];
      const osRec = Array.isArray(osArr) ? osArr[0] : osArr;

      if (osRec?.id) {
        await supabase.from('onboarding_steps').update({ proof_of_payment_url: publicUrl }).eq('id', osRec.id);
      } else {
        await supabase.from('onboarding_steps').insert({
          application_id: latestApp.id,
          member_id: member?.id || null,
          proof_of_payment_url: publicUrl,
        });
      }
      setExistingPop(publicUrl);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0B1B3F' }} />
      </div>
    );
  }

  const plan = member?.plan || appPlan;
  const isApproved = latestApp?.status === 'approved' || latestApp?.status === 'completed';
  const isActive = member?.status === 'active';
  const nextPay = nextPaymentDate(member?.created_at);
  const daysLeft = daysUntil(nextPay);
  const hasBanking = clinic?.bank_name || clinic?.account_number;
  const monthlyFee = plan?.monthly_fee_cents ? plan.monthly_fee_cents / 100 : plan?.monthly_fee || 0;

  const bankFields = [
    { label: 'Bank Name', value: clinic?.bank_name, key: 'bank' },
    { label: 'Account Name', value: clinic?.account_name || clinic?.name, key: 'aname' },
    { label: 'Account Number', value: clinic?.account_number, key: 'anum' },
    { label: 'Branch Code', value: clinic?.branch_code, key: 'branch' },
    { label: 'Account Type', value: clinic?.account_type || 'Current', key: 'type' },
    { label: 'Reference', value: member?.card_number || user?.id?.slice(0, 8)?.toUpperCase(), key: 'ref' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#0B1B3F', marginBottom: 4 }}>Payments</div>
        <div style={{ fontSize: 14, color: '#64748b' }}>Manage your membership payments and upload proof of payment.</div>
      </div>

      {/* ── Status Banner ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #0B1B3F, #1a3a6f)'
            : isApproved
            ? 'linear-gradient(135deg, #14532d, #166534)'
            : 'linear-gradient(135deg, #78350f, #92400e)',
          borderRadius: 20, padding: '24px 28px', color: '#fff',
          display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24,
          boxShadow: '0 8px 32px rgba(11,27,63,0.2)',
        }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isActive ? <Shield size={28} /> : isApproved ? <CheckCircle size={28} /> : <Clock size={28} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
            {isActive ? 'Policy Active' : isApproved ? 'Approved — Payment Required' : 'Application Pending Review'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            {isActive
              ? `Your ${plan?.name || 'membership'} plan is active. Next payment due ${formatDate(nextPay)} (${daysLeft} days).`
              : isApproved
              ? `Your application has been approved. Please make your first payment of R${monthlyFee.toFixed(0)} and upload your proof of payment below.`
              : 'Your application is being reviewed. You will be notified once it is approved.'}
          </div>
        </div>
        {isActive && daysLeft <= 7 && (
          <div style={{ background: '#ef4444', padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
            DUE SOON
          </div>
        )}
      </motion.div>

      {/* ── Plan Summary ── */}
      {plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0B1B3F' }}>{plan.name}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              🩺 {plan.consultations_pm === -1 ? 'Unlimited' : plan.consultations_pm} consults/mo
              {plan.includes_medication && ' · 💊 Medication'}
              {plan.includes_chronic && ' · 📋 Chronic care'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0B1B3F' }}>R{monthlyFee.toFixed(0)}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>per month</div>
          </div>
        </motion.div>
      )}

      {/* ── Payment Schedule ── */}
      {(isApproved || isActive) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Payment Schedule</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'First Payment', date: isApproved ? 'Due now' : formatDate(new Date(member?.created_at || '')), status: isActive ? 'paid' : 'due' },
              { label: 'Next Monthly', date: formatDate(nextPay), status: isActive && daysLeft <= 3 ? 'urgent' : 'upcoming' },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, padding: '16px 18px', borderRadius: 12,
                background: item.status === 'paid' ? '#f0fdf4' : item.status === 'urgent' ? '#fff7ed' : '#f8fafc',
                border: `1px solid ${item.status === 'paid' ? '#bbf7d0' : item.status === 'urgent' ? '#fed7aa' : '#e2e8f0'}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: item.status === 'paid' ? '#15803d' : item.status === 'urgent' ? '#c2410c' : '#0B1B3F' }}>
                  {item.date}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.status === 'paid' ? '#16a34a' : item.status === 'urgent' ? '#ea580c' : '#64748b', marginTop: 4 }}>
                  {item.status === 'paid' ? '✓ Paid' : item.status === 'urgent' ? '⚠ Due soon' : `R${monthlyFee.toFixed(0)}`}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Banking Details ── */}
      {(isApproved || isActive) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 24px', background: 'linear-gradient(135deg, #0B1B3F, #142a52)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Building size={18} color="#E8B85A" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Clinic Banking Details</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{clinic?.name || 'Braam Health Centre'}</div>
            </div>
          </div>

          {hasBanking ? (
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {bankFields.map(({ label, value, key }) => value && (
                  <div key={key} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', position: 'relative' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1B3F', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span>{value}</span>
                      <button
                        onClick={() => copyToClipboard(String(value), key)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === key ? '#10b981' : '#94a3b8', flexShrink: 0, padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                        title="Copy to clipboard"
                      >
                        {copied === key ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                  <strong>Important:</strong> Use your reference number <strong>{member?.card_number || user?.id?.slice(0, 8)?.toUpperCase()}</strong> when making payment so we can match it to your account. Payments are processed manually — upload your proof below.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '28px 24px', textAlign: 'center' }}>
              <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1B3F', marginBottom: 6 }}>Banking details not yet configured</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Please contact your clinic admin to set up payment details.</div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Proof of Payment Upload ── */}
      {(isApproved || isActive) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Proof of Payment
          </div>

          <AnimatePresence mode="wait">
            {existingPop ? (
              <motion.div key="uploaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={22} color="#16a34a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d' }}>Proof of Payment Uploaded</div>
                  <div style={{ fontSize: 12, color: '#16a34a' }}>Awaiting admin verification and policy activation.</div>
                </div>
                <a href={existingPop} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0B1B3F', fontWeight: 600, textDecoration: 'none', padding: '8px 14px', background: '#fff', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <ExternalLink size={14} /> View
                </a>
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <input type="file" id="pop-file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handlePOPUpload} disabled={uploading} />
                <label htmlFor="pop-file" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 12, padding: '32px 20px', border: '2px dashed #cbd5e1', borderRadius: 12,
                  cursor: uploading ? 'wait' : 'pointer', background: '#f8fafc', transition: 'all 0.2s',
                }}>
                  {uploading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <RefreshCw size={28} color="#0B1B3F" />
                      </motion.div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1B3F' }}>Uploading...</div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={24} color="#4f46e5" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1B3F', marginBottom: 4 }}>Upload Proof of Payment</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>Accepts JPG, PNG, PDF · Max 10MB</div>
                      </div>
                    </>
                  )}
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Payment History ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Payment History</div>
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
          <Banknote size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
          <div style={{ fontSize: 13 }}>Payment history will appear here once your policy is active.</div>
        </div>
      </motion.div>

      {/* ── No Application / not eligible ── */}
      {!isApproved && !isActive && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ marginTop: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px', textAlign: 'center' }}>
          <CreditCard size={40} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0B1B3F', marginBottom: 8 }}>No active payment needed</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Apply for a membership plan to get started.</div>
          <button onClick={() => navigate('/member/upgrade')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#E8B85A', color: '#0B1B3F', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Choose a Plan <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
