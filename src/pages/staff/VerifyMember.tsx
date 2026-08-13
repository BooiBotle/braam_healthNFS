import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, User, Activity, CheckCircle, ShieldAlert, X, FileText, Camera, ScanLine } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { getTokenBalance, recordConsultationWithToken, getDependants, type TokenBalance, type Dependant } from '../../lib/api/member';

const VerifyMember = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [member, setMember] = useState<any>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(''); // member or dependant ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Consultation Modal State
  const [showModal, setShowModal] = useState(false);
  const [consultType, setConsultType] = useState('walk_in');
  const [presentingComplaint, setPresentingComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentGiven, setTreatmentGiven] = useState('');
  const [doctorName, setDoctorName] = useState('');
  
  // Manager Override state
  const [isOverride, setIsOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideBy, setOverrideBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // QR Camera scan state
  const [showCamera, setShowCamera] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  // Clean up camera on unmount
  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setError('');
    setMember(null);
    setTokenBalance(null);
    setDependants([]);
    setSuccessMsg('');
    try {
      let query = supabase
        .from('members')
        .select(`*, profiles!inner (full_name, sa_id_number, phone, email, avatar_url), plans (name, consultations_pm)`);
      const cleanTerm = term.trim().toUpperCase();
      if (/^\d{10,}$/.test(cleanTerm)) {
        query = query.eq('profiles.sa_id_number', cleanTerm);
      } else {
        query = query.eq('card_number', cleanTerm);
      }
      const { data, error: fetchErr } = await query.maybeSingle();
      if (fetchErr || !data) {
        const { data: depData } = await supabase
          .from('dependants')
          .select('*, members(*, profiles(*), plans(*))')
          .or(`card_number.eq.${cleanTerm},sa_id_number.eq.${cleanTerm}`)
          .maybeSingle();
        if (depData && depData.members) {
          const parentMem = depData.members;
          setMember(parentMem);
          setSelectedPatientId(depData.id);
          const bal = await getTokenBalance(parentMem.id);
          setTokenBalance(bal);
          const deps = await getDependants(parentMem.id);
          setDependants(deps);
          return;
        }
        throw new Error('Member not found. Please check card number or SA ID.');
      }
      setMember(data);
      setSelectedPatientId(data.id);
      const bal = await getTokenBalance(data.id);
      setTokenBalance(bal);
      const deps = await getDependants(data.id);
      setDependants(deps);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Member not found. Please check card number.');
    } finally {
      setLoading(false);
    }
  };

  const startQRScan = async () => {
    setScanError('');
    if (!('BarcodeDetector' in window)) {
      setScanError('QR scanning is not supported in this browser. Please use Chrome or Edge, or type the card number manually.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setShowCamera(true);
      // Wait for video element to mount
      setTimeout(async () => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        scanningRef.current = true;
        const scan = async () => {
          if (!scanningRef.current || !videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopCamera();
              setSearchTerm(code);
              await doSearch(code);
              return;
            }
          } catch { /* continue scanning */ }
          if (scanningRef.current) requestAnimationFrame(scan);
        };
        requestAnimationFrame(scan);
      }, 300);
    } catch (err: any) {
      setScanError('Camera access denied. Please allow camera permissions and try again.');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSearch(searchTerm);
  };

  const handleOpenConsultationModal = () => {
    if (!member) return;
    setShowModal(true);
    setSuccessMsg('');
    setIsOverride(false);
    setOverrideReason('');
    setPresentingComplaint('');
    setClinicalNotes('');
    setDiagnosis('');
    setTreatmentGiven('');
    setDoctorName(user?.name || '');
  };

  const handleRecordConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !tokenBalance) return;

    if (tokenBalance.monthly_tokens !== -1 && tokenBalance.tokens_remaining <= 0 && !isOverride) {
      alert("0 Tokens Remaining. You must check Manager Override and provide an authorizing reason to log this visit.");
      return;
    }

    if (isOverride && !overrideReason.trim()) {
      alert("Please provide an override reason for recording a zero-token consultation.");
      return;
    }

    setSubmitting(true);
    try {
      const isDependant = selectedPatientId !== member.id;

      const res = await recordConsultationWithToken({
        clinicId: member.clinic_id || user?.clinicId || '00000000-0000-0000-0000-000000000000',
        memberId: member.id,
        dependantId: isDependant ? selectedPatientId : undefined,
        consultationType: consultType,
        presentingComplaint,
        clinicalNotes,
        diagnosis,
        treatmentGiven,
        seenBy: user?.id,
        doctorName: doctorName || user?.name || 'Staff',
        isOverride,
        overrideReason: isOverride ? overrideReason : undefined,
        overrideBy: isOverride ? (overrideBy || user?.id) : undefined
      });

      if (res.success) {
        setSuccessMsg('Consultation recorded successfully! 1 Token deducted.');
        setShowModal(false);
        // Refresh token balance
        const updatedBal = await getTokenBalance(member.id);
        setTokenBalance(updatedBal);
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Failed to record consultation: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isUnlimited = tokenBalance?.monthly_tokens === -1;
  const tokensRem = tokenBalance?.tokens_remaining ?? 0;
  const isZeroTokens = !isUnlimited && tokensRem <= 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      <div style={{ marginBottom: 'var(--sp-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
          Verify Member & Tokens
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Scan QR or search card number to verify consultation token eligibility.</p>
      </div>

      {successMsg && (
        <div style={{ background: '#E3F6EC', color: '#1E9E5A', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
          <CheckCircle size={20} />
          {successMsg}
        </div>
      )}

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-8)', maxWidth: '640px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Card Number (e.g. NFS8 9012 3456 7) or SA ID" 
              style={{ paddingLeft: 'var(--sp-10)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Verify'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={startQRScan}
            disabled={loading || showCamera}
            style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
          >
            <Camera size={16} /> Scan QR
          </button>
        </form>
        {scanError && (
          <div style={{ color: 'var(--status-error)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-3)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <ScanLine size={15} style={{ marginTop: 2, flexShrink: 0 }} /> {scanError}
          </div>
        )}
        {error && <div style={{ color: 'var(--status-error)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-3)' }}>{error}</div>}
      </div>

      {/* Camera QR Scan Overlay */}
      {showCamera && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ScanLine size={22} /> Point camera at member QR code
          </div>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '3px solid #C9963A', boxShadow: '0 0 40px rgba(201,150,58,0.4)' }}>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{ display: 'block', width: '100%', maxWidth: '360px', height: 'auto' }}
            />
            {/* Scan line animation */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(90deg, transparent, #C9963A, transparent)',
              animation: 'scanline 2s ease-in-out infinite'
            }} />
          </div>
          <button
            onClick={stopCamera}
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600
            }}
          >
            Cancel Scan
          </button>
          <style>{`@keyframes scanline { 0%,100% { top: 0; } 50% { top: calc(100% - 3px); } }`}</style>
        </div>
      )}

      {member && tokenBalance && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-6)' }}>
          
          {/* Member Profile Details */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)' }}>
                {member.profiles?.avatar_url ? <img src={member.profiles.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <User size={32} />}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', margin: 0 }}>{member.profiles?.full_name}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>ID: {member.profiles?.sa_id_number || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-2)', borderBottom: '1px solid var(--border)' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Status</span>
                 <span className={`section-badge ${member.status === 'active' ? 'section-badge-gold' : ''}`}>
                   {member.status?.toUpperCase()}
                 </span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-2)', borderBottom: '1px solid var(--border)' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Card Number</span>
                 <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{member.card_number}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-2)', borderBottom: '1px solid var(--border)' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Current Plan</span>
                 <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{tokenBalance.plan_name}</span>
               </div>
               {dependants.length > 0 && (
                 <div style={{ paddingTop: 'var(--sp-2)' }}>
                   <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>SELECT PATIENT FOR VISIT</label>
                   <select 
                     className="form-input" 
                     value={selectedPatientId} 
                     onChange={(e) => setSelectedPatientId(e.target.value)}
                     style={{ fontSize: '13px', padding: '8px 12px' }}
                   >
                     <option value={member.id}>Primary Member: {member.profiles?.full_name}</option>
                     {dependants.map(d => (
                       <option key={d.id} value={d.id}>Dependant: {d.first_name} {d.last_name} ({d.relationship})</option>
                     ))}
                   </select>
                   <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>* Dependants share the primary member's monthly token pool.</div>
                 </div>
               )}
            </div>
          </div>

          {/* Token Breakdown & Verification Status */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <Activity size={20} color="var(--navy)" />
                <h3 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Monthly Token Pool</h3>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                background: isUnlimited || tokensRem > 1 ? '#E3F6EC' : tokensRem === 1 ? '#FEF3C7' : '#FBE7E7',
                color: isUnlimited || tokensRem > 1 ? '#1E9E5A' : tokensRem === 1 ? '#D97706' : '#D14343'
              }}>
                {isUnlimited ? 'ELIGIBLE' : tokensRem > 1 ? 'ELIGIBLE' : tokensRem === 1 ? '1 TOKEN REMAINING' : 'NO TOKENS REMAINING'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: 'var(--sp-6)', background: 'var(--bg-surface-sunken)', padding: '16px', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Tokens</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>{isUnlimited ? '∞' : tokenBalance.monthly_tokens}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tokens Used</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>{tokenBalance.tokens_used}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Remaining</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: isZeroTokens ? '#D14343' : tokensRem === 1 ? '#D97706' : '#1E9E5A' }}>
                  {isUnlimited ? '∞' : tokenBalance.tokens_remaining}
                </div>
              </div>
            </div>

            {isZeroTokens && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--status-error)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                <ShieldAlert size={22} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: 'var(--text-sm)' }}>
                  <strong>NO TOKENS REMAINING.</strong> Member has reached their monthly consultation allowance ({tokenBalance.tokens_used} / {tokenBalance.monthly_tokens} used). Explicit Manager Override is required to log another consultation.
                </div>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'var(--sp-2)', padding: '12px', fontSize: '14px' }} 
              disabled={member.status !== 'active'}
              onClick={handleOpenConsultationModal}
            >
              <FileText size={16} /> {isZeroTokens ? 'Log Visit (Manager Override)' : 'Complete & Record Consultation (Deduct 1 Token)'}
            </button>
          </div>

        </div>
      )}

      {/* Record Consultation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#fff', width: '100%', maxWidth: '560px',
              borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh'
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy)', color: '#fff' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>Record Completed Consultation</h2>
                <div style={{ fontSize: '12px', color: '#9FB0CE' }}>
                  Patient: {selectedPatientId === member?.id ? member?.profiles?.full_name : 'Dependant Visit'}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9FB0CE' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleRecordConsultation} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Consultation Type</label>
                  <select className="form-input" value={consultType} onChange={(e) => setConsultType(e.target.value)} style={{ marginTop: '4px' }}>
                    <option value="walk_in">Walk-in</option>
                    <option value="appointment">Appointment</option>
                    <option value="emergency">Emergency</option>
                    <option value="chronic_review">Chronic Review</option>
                    <option value="follow_up">Follow-up</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Doctor / Practitioner</label>
                  <input type="text" className="form-input" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Dr M J Diago" style={{ marginTop: '4px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Presenting Complaint</label>
                <input type="text" className="form-input" value={presentingComplaint} onChange={(e) => setPresentingComplaint(e.target.value)} placeholder="e.g. Cough and fever for 3 days" style={{ marginTop: '4px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Primary Diagnosis</label>
                <input type="text" className="form-input" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Upper Respiratory Tract Infection" style={{ marginTop: '4px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Clinical Notes & Treatment</label>
                <textarea className="form-input" rows={3} value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Enter clinical notes and treatment given..." style={{ marginTop: '4px', resize: 'vertical' }} />
              </div>

              {/* Zero Token Manager Override Section */}
              {isZeroTokens && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                    <AlertTriangle size={18} />
                    Manager Override Required (0 Tokens Remaining)
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#7F1D1D', marginBottom: '10px', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={isOverride} 
                      onChange={(e) => setIsOverride(e.target.checked)} 
                    />
                    I confirm Manager Override for this consultation
                  </label>

                  {isOverride && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#991B1B' }}>OVERRIDE REASON (REQUIRED)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={overrideReason} 
                          onChange={(e) => setOverrideReason(e.target.value)} 
                          placeholder="e.g. Approved emergency care by Practice Manager" 
                          style={{ marginTop: '4px', background: '#fff' }} 
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#991B1B' }}>AUTHORISING MANAGER NAME / ID</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={overrideBy} 
                          onChange={(e) => setOverrideBy(e.target.value)} 
                          placeholder="Manager Name or Staff ID" 
                          style={{ marginTop: '4px', background: '#fff' }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Recording & Deducting Token...' : isZeroTokens ? 'Log Consultation with Override' : 'Deduct 1 Token & Record Visit'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default VerifyMember;
