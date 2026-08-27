import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, User, Activity, CheckCircle, Camera, CameraOff, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';

type ScanMode = 'manual' | 'camera';
type ConsultType = 'walk_in' | 'appointment' | 'follow_up' | 'emergency';

const VerifyMember = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [scanMode, setScanMode] = useState<ScanMode>('manual');
  const [showAddConsult, setShowAddConsult] = useState(false);
  const [consultType, setConsultType] = useState<ConsultType>('walk_in');
  const [consultNotes, setConsultNotes] = useState('');
  const [showFullCard, setShowFullCard] = useState(false);

  // QR Scanner refs
  const scannerRef = useRef<any>(null);
  const scannerDivId = 'qr-scanner-container';

  useEffect(() => {
    if (scanMode === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }
    return () => { stopScanner(); };
  }, [scanMode]);

  const startScanner = async () => {
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      if (scannerRef.current) scannerRef.current.clear();
      
      scannerRef.current = new Html5QrcodeScanner(
        scannerDivId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );
      scannerRef.current.render(
        (decodedText: string) => {
          // Extract card number from URL or use raw value
          let cardNum = decodedText;
          try {
            const url = new URL(decodedText);
            const parts = url.pathname.split('/');
            const encoded = parts[parts.length - 1];
            cardNum = decodeURIComponent(encoded);
          } catch { /* not a URL, use raw text */ }

          setSearchTerm(cardNum);
          setScanMode('manual');
          handleSearchByCard(cardNum);
        },
        (errorMsg: string) => { /* silent camera errors */ }
      );
    } catch (e) {
      console.error('QR scanner error:', e);
      setError('Camera scanner unavailable. Please use manual entry.');
      setScanMode('manual');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try { scannerRef.current.clear(); } catch { /* ignore */ }
      scannerRef.current = null;
    }
  };

  const handleSearchByCard = async (cardNum: string) => {
    if (!cardNum.trim()) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setMember(null);
    setShowAddConsult(false);

    try {
      const cleaned = cardNum.trim().toUpperCase();
      let query = supabase
        .from('members')
        .select(`
          *,
          profiles!inner(full_name, first_name, last_name, sa_id_number, phone, email, avatar_url, date_of_birth, gender),
          plans(name, consultations_pm, includes_medication, includes_24h_access, includes_chronic),
          clinic:clinics(name, address_line1, city, phone)
        `);

      // Detect search type: long number = SA ID, else = card number
      if (/^\d{10,}$/.test(cleaned)) {
        query = query.eq('profiles.sa_id_number', cleaned);
      } else {
        query = query.eq('card_number', cleaned);
      }

      const { data, error: qErr } = await query.single();
      if (qErr) throw qErr;

      // Get monthly consultation count
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: usedThisMonth } = await supabase
        .from('consultations')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', data.id)
        .gte('visited_at', startOfMonth);

      // Get total consultations
      const { count: totalCount } = await supabase
        .from('consultations')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', data.id);

      // Get recent consultations for display
      const { data: recentCons } = await supabase
        .from('consultations')
        .select('id, visited_at, consultation_type, diagnosis, doctor_name, counted_toward_limit, consultation_number')
        .eq('member_id', data.id)
        .order('visited_at', { ascending: false })
        .limit(5);

      setMember({
        ...data,
        consultations_this_month: usedThisMonth || 0,
        total_consultations: totalCount || 0,
        recent_consultations: recentCons || [],
      });
    } catch (err: any) {
      console.error(err);
      setError('Member not found. Check card number, member number, or SA ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearchByCard(searchTerm);
  };

  const registerConsultation = async () => {
    if (!member || !user?.clinicId) return;
    setIsRegistering(true);
    setSuccessMsg('');
    setError('');

    const limitReached = member.plans?.consultations_pm !== -1 &&
      member.consultations_this_month >= (member.plans?.consultations_pm || 0);

    try {
      const { error: insertErr } = await supabase.from('consultations').insert([{
        member_id: member.id,
        clinic_id: user.clinicId,
        card_number: member.card_number,
        visited_at: new Date().toISOString(),
        consultation_date: new Date().toISOString(),
        consultation_type: consultType,
        status: 'completed',
        clinical_notes: consultNotes || null,
        is_flagged: limitReached,
        flagged_reason: limitReached ? 'Consultation Limit Exceeded' : null,
        flag_resolved: false,
        seen_by: user.id,
        counted_toward_limit: true,
      }]);

      if (insertErr) throw insertErr;

      setSuccessMsg(`✓ Consultation registered! ${limitReached ? '⚠️ Monthly limit exceeded — member may need to pay.' : ''}`);
      setMember((prev: any) => ({
        ...prev,
        consultations_this_month: prev.consultations_this_month + 1,
      }));
      setShowAddConsult(false);
      setConsultNotes('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to register: ' + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const plan = member?.plans;
  const consultationsLimit = plan?.consultations_pm ?? 0;
  const consultationsUsed = member?.consultations_this_month ?? 0;
  const usagePct = consultationsLimit === -1 ? 0 : Math.min(100, (consultationsUsed / (consultationsLimit || 1)) * 100);
  const limitReached = consultationsLimit !== -1 && consultationsUsed >= consultationsLimit;
  const profile = member?.profiles;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
          Verify Member
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Scan QR code, enter card number, or member number to verify eligibility and register visits.
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { mode: 'manual', label: 'Manual Entry', icon: <Search size={15} /> },
          { mode: 'camera', label: 'QR Scanner', icon: <Camera size={15} /> },
        ].map((m) => (
          <button
            key={m.mode}
            onClick={() => setScanMode(m.mode as ScanMode)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13.5px',
              border: '1px solid',
              cursor: 'pointer', transition: 'all .15s',
              background: scanMode === m.mode ? 'var(--navy)' : '#fff',
              color: scanMode === m.mode ? '#fff' : 'var(--text-secondary)',
              borderColor: scanMode === m.mode ? 'var(--navy)' : 'var(--border)',
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Manual Entry */}
      {scanMode === 'manual' && (
        <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: '20px', maxWidth: '600px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Card number (e.g. NFS8 0011 234 1) or SA ID..."
                style={{ paddingLeft: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !searchTerm.trim()}>
              {loading ? 'Searching...' : 'Verify'}
            </button>
          </form>
          {error && (
            <div style={{ color: 'var(--status-error)', fontSize: '13px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>
      )}

      {/* QR Camera Scanner */}
      {scanMode === 'camera' && (
        <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: '20px', maxWidth: '600px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: '2px' }}>Point camera at member QR code</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Works with any NFS Insure member card</div>
            </div>
            <button onClick={() => setScanMode('manual')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <CameraOff size={20} />
            </button>
          </div>
          <div
            id={scannerDivId}
            style={{ borderRadius: '12px', overflow: 'hidden', minHeight: '300px' }}
          />
          {error && (
            <div style={{ color: 'var(--status-error)', fontSize: '13px', marginTop: '10px' }}>{error}</div>
          )}
        </div>
      )}

      {/* Member Result */}
      <AnimatePresence>
        {member && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Status Banner */}
            <div style={{
              padding: '10px 18px', borderRadius: '12px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: member.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${member.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: member.status === 'active' ? '#10b981' : '#ef4444',
                  boxShadow: member.status === 'active' ? '0 0 8px rgba(16,185,129,0.6)' : '0 0 8px rgba(239,68,68,0.6)',
                }} />
                <span style={{ fontWeight: 700, fontSize: '14px', color: member.status === 'active' ? '#10b981' : '#ef4444' }}>
                  {member.status === 'active' ? '✓ VERIFIED — ACTIVE MEMBER' : `⚠ MEMBERSHIP ${member.status?.toUpperCase()}`}
                </span>
              </div>
              <button onClick={() => setMember(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

              {/* Member Info Card */}
              <div className="card" style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar"
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                  ) : (
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--navy), #1c2340)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px', fontWeight: 800, color: '#fff',
                    }}>
                      {(profile?.full_name || profile?.first_name || 'M').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', margin: '0 0 4px' }}>
                      {profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()}
                    </h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {profile?.sa_id_number ? `ID: ${profile.sa_id_number}` : 'No ID on file'}
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Card Number', value: member.card_number },
                    { label: 'Plan', value: plan?.name || 'N/A', highlight: true },
                    { label: 'Clinic', value: member.clinic?.name || 'N/A' },
                    { label: 'Phone', value: profile?.phone || 'N/A' },
                    { label: 'Email', value: profile?.email || 'N/A' },
                  ].map((row) => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{row.label}</span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: row.highlight ? 'var(--gold)' : 'var(--text-heading)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Policy Status</div>
                  {member.status === 'active' ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', color: '#047857', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600 }}>
                      <CheckCircle size={14} /> Active & Paid
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', color: '#b45309', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600 }}>
                      <AlertTriangle size={14} /> Pending Payment / Activation
                    </div>
                  )}
                </div>

                {/* Plan Benefits */}
                {plan && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Plan Benefits</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { ok: true, text: `${consultationsLimit === -1 ? 'Unlimited' : consultationsLimit} consultations/month` },
                        { ok: plan.includes_medication, text: 'Medication included' },
                        { ok: plan.includes_24h_access, text: '24/7 access' },
                        { ok: plan.includes_chronic, text: 'Chronic programme' },
                      ].map((b) => (
                        <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: b.ok ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                          {b.ok
                            ? <CheckCircle size={12} color="#10b981" />
                            : <X size={12} color="var(--text-muted)" />
                          }
                          {b.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member QR */}
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Member QR</div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', display: 'inline-block' }}>
                      <QRCode
                        value={`${window.location.origin}/member-profile/${encodeURIComponent(member.card_number)}`}
                        size={80} bgColor="#ffffff" fgColor="#0B1B3F" level="Q"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Usage Card */}
              <div className="card" style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Activity size={20} color="var(--navy)" />
                  <h3 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Consultation Usage</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Big number */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '56px', fontWeight: 900, color: 'var(--text-heading)', lineHeight: 1 }}>
                    {consultationsUsed}
                    <span style={{ fontSize: '24px', color: 'var(--text-muted)', fontWeight: 400 }}>
                      /{consultationsLimit === -1 ? '∞' : consultationsLimit}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>visits used this month</div>
                </div>

                {/* Progress bar */}
                {consultationsLimit !== -1 && (
                  <div style={{ background: 'var(--surface)', borderRadius: '99px', height: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{
                        height: '100%', borderRadius: '99px',
                        background: usagePct >= 100 ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : usagePct >= 75 ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                          : 'linear-gradient(90deg, #10b981, #13A89E)',
                      }}
                    />
                  </div>
                )}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Used', value: consultationsUsed, color: 'var(--text-heading)' },
                    {
                      label: 'Remaining',
                      value: consultationsLimit === -1 ? '∞' : Math.max(0, consultationsLimit - consultationsUsed),
                      color: limitReached ? 'var(--status-error)' : '#10b981',
                    },
                    { label: 'Total All Time', value: member.total_consultations, color: 'var(--navy)' },
                  ].map((s) => (
                    <div key={s.label} style={{
                      background: 'var(--surface)', borderRadius: '10px', padding: '10px',
                      textAlign: 'center', border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Warning */}
                {limitReached && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px', padding: '10px 14px',
                    display: 'flex', gap: '10px', marginBottom: '16px',
                  }}>
                    <AlertTriangle size={16} color="var(--status-error)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12.5px', color: 'var(--status-error)' }}>
                      <strong>Limit Reached.</strong> This member has used all {consultationsLimit} consultations this month.
                      Subsequent visits require out-of-pocket payment.
                    </div>
                  </div>
                )}

                {/* Success */}
                {successMsg && (
                  <div style={{
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: '10px', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px',
                    color: 'var(--status-success)', fontWeight: 500,
                  }}>
                    <CheckCircle size={16} /> {successMsg}
                  </div>
                )}

                {/* Add Consultation Button / Form */}
                {!showAddConsult ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    disabled={member.status !== 'active' || isRegistering}
                    onClick={() => setShowAddConsult(true)}
                  >
                    <Plus size={16} /> Register New Visit
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)', marginBottom: '12px' }}>
                      Register Consultation
                    </div>

                    {/* Consultation Type */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        Visit Type
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                          { value: 'walk_in', label: '🚶 Walk-in' },
                          { value: 'appointment', label: '📅 Appointment' },
                          { value: 'follow_up', label: '🔄 Follow-up' },
                          { value: 'emergency', label: '🚨 Emergency' },
                        ].map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setConsultType(t.value as ConsultType)}
                            style={{
                              padding: '8px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600,
                              cursor: 'pointer', border: '1px solid',
                              background: consultType === t.value ? 'var(--navy)' : '#fff',
                              color: consultType === t.value ? '#fff' : 'var(--text-secondary)',
                              borderColor: consultType === t.value ? 'var(--navy)' : 'var(--border)',
                              transition: 'all .15s',
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        Notes (optional)
                      </label>
                      <textarea
                        className="form-input"
                        style={{ resize: 'vertical', minHeight: '72px', fontFamily: 'inherit', fontSize: '13px' }}
                        placeholder="Brief description of the visit..."
                        value={consultNotes}
                        onChange={(e) => setConsultNotes(e.target.value)}
                      />
                    </div>

                    {limitReached && (
                      <div style={{
                        padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                        color: '#D97706', marginBottom: '12px', fontWeight: 500,
                      }}>
                        ⚠️ This visit will be flagged as exceeding the monthly limit.
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={isRegistering}
                        onClick={registerConsultation}
                      >
                        {isRegistering ? 'Registering...' : '✓ Confirm & Register'}
                      </button>
                      <button
                        onClick={() => setShowAddConsult(false)}
                        style={{
                          padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                          background: '#fff', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Recent Consultations */}
                {member.recent_consultations?.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                      Recent Visits
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {member.recent_consultations.slice(0, 4).map((c: any, i: number) => {
                        const d = new Date(c.visited_at || c.created_at);
                        return (
                          <div key={c.id} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px', borderRadius: '8px', background: 'var(--surface)',
                            border: '1px solid var(--border)',
                          }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>
                              {d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                            </div>
                            <div style={{ flex: 1, fontSize: '12.5px', color: 'var(--text-heading)', fontWeight: 500 }}>
                              {c.diagnosis || c.consultation_type?.replace(/_/g, ' ') || 'Consultation'}
                            </div>
                            {c.counted_toward_limit && (
                              <div style={{
                                fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                                borderRadius: '99px', background: 'rgba(201,150,58,0.15)',
                                color: '#C9963A', border: '1px solid rgba(201,150,58,0.3)', flexShrink: 0,
                              }}>
                                #{c.consultation_number || i + 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default VerifyMember;
