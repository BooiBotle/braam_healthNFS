import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMemberByCardNumber } from '../../lib/api/member';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';

const statusColor = (status: string) => {
  switch (status) {
    case 'active':    return { bg: 'rgba(16,185,129,0.15)',  text: '#10b981', border: 'rgba(16,185,129,0.3)' };
    case 'suspended': return { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444', border: 'rgba(239,68,68,0.3)' };
    case 'pending':   return { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
    case 'on_hold':   return { bg: 'rgba(251,146,60,0.12)',  text: '#fb923c', border: 'rgba(251,146,60,0.3)' };
    case 'cancelled': return { bg: 'rgba(100,116,139,0.12)', text: '#64748b', border: 'rgba(100,116,139,0.3)' };
    default:          return { bg: 'rgba(100,116,139,0.12)', text: '#64748b', border: 'rgba(100,116,139,0.3)' };
  }
};

const statusLabel = (status: string) => ({
  active: 'VERIFIED — ACTIVE MEMBER',
  suspended: '⛔ SUSPENDED',
  pending: '⏳ AWAITING PAYMENT',
  on_hold: '⏸ ACCOUNT ON HOLD',
  cancelled: '✕ CANCELLED',
}[status] || `MEMBERSHIP ${status.toUpperCase()}`);

export default function MemberProfilePublic() {
  const { cardNumber } = useParams<{ cardNumber: string }>();
  const [member, setMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cardNumber) return;
    async function load() {
      const data = await getMemberByCardNumber(decodeURIComponent(cardNumber!));
      if (data) {
        setMember(data);
      } else {
        setError('Member not found. This QR code may be invalid or the membership may have been cancelled.');
      }
      setLoading(false);
    }
    load();
  }, [cardNumber]);

  const plan = member?.plan;
  const profile = member?.profiles;
  const consultationsLimit = plan?.consultations_pm ?? 0;
  const consultationsUsed = member?.consultations_used_this_month ?? 0;
  const consultationsRemaining = Math.max(0, (consultationsLimit === -1 ? 999 : consultationsLimit) - consultationsUsed);
  const usagePercent = consultationsLimit === -1 ? 0 : Math.min(100, (consultationsUsed / (consultationsLimit || 1)) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b1120 0%, #0e1a38 40%, #0b1120 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px 16px 48px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative glow effects */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,150,58,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(19,168,158,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '520px', marginBottom: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #C9963A, #E8B85A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '17px', color: '#fff', letterSpacing: '0.3px' }}>
              NFS <span style={{ color: '#C9963A' }}>| INSURE</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Braam Health Centre
            </div>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
          Member Verification Portal — Scan result
        </div>
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
            borderRadius: '24px', padding: '48px 32px', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)', maxWidth: '520px', width: '100%',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                border: '3px solid rgba(201,150,58,0.3)',
                borderTop: '3px solid #C9963A',
              }}
            />
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>Verifying member...</div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(239,68,68,0.08)', backdropFilter: 'blur(20px)',
            borderRadius: '24px', padding: '40px 32px', textAlign: 'center',
            border: '1px solid rgba(239,68,68,0.2)', maxWidth: '520px', width: '100%',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '18px', marginBottom: '8px' }}>
            Verification Failed
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{error}</div>
        </motion.div>
      )}

      {member && (
        <AnimatePresence>
          <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Main Member Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'linear-gradient(135deg, #1c2340 0%, #0b1120 100%)',
                borderRadius: '24px', overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Status Banner */}
              <div style={{
                padding: '8px 20px', textAlign: 'center',
                background: statusColor(member.status || 'unknown').bg,
                borderBottom: `1px solid ${statusColor(member.status || 'unknown').border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: statusColor(member.status || 'unknown').text,
                  boxShadow: `0 0 8px ${statusColor(member.status || 'unknown').text}`,
                }} />
                <span style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: statusColor(member.status || 'unknown').text,
                }}>
                  {statusLabel(member.status || 'unknown')}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '28px 24px', display: 'flex', gap: '20px' }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar"
                      style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                  ) : (
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '16px',
                      background: 'linear-gradient(135deg, #C9963A, #1c2340)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '26px', fontWeight: 800, color: '#fff',
                    }}>
                      {(profile?.full_name || profile?.first_name || 'M').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Member Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '4px', lineHeight: 1.2 }}>
                    {profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown Member'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                    {profile?.sa_id_number ? `ID: ${profile.sa_id_number}` : 'No ID on file'}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(201,150,58,0.15)', border: '1px solid rgba(201,150,58,0.3)',
                    borderRadius: '20px', padding: '4px 12px',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#C9963A', letterSpacing: '0.5px' }}>
                      {plan?.name?.toUpperCase() || 'NO PLAN'}
                    </span>
                  </div>
                </div>

                {/* QR Code */}
                <div style={{
                  flexShrink: 0, background: '#fff', borderRadius: '12px',
                  padding: '8px', alignSelf: 'flex-start',
                }}>
                  <QRCode
                    value={member.card_number || 'UNKNOWN'}
                    size={72} bgColor="#ffffff" fgColor="#0b1120" level="Q"
                  />
                </div>
              </div>

              {/* Card Number Strip */}
              <div style={{
                padding: '12px 24px', background: 'rgba(0,0,0,0.25)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Card Number</div>
                  <div style={{ fontSize: '16px', fontFamily: 'monospace', fontWeight: 700, color: '#fff', letterSpacing: '2px' }}>
                    {member.card_number}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Member Since</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                    {new Date(member.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Plan & Consultation Usage Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                borderRadius: '20px', padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(201,150,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9963A" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Consultation Usage</span>
                <span style={{ fontSize: '11px', color: '#475569', marginLeft: 'auto' }}>
                  {new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Big Usage Display */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '56px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {consultationsUsed}
                  <span style={{ fontSize: '24px', color: '#475569', fontWeight: 500 }}>
                    /{consultationsLimit === -1 ? '∞' : consultationsLimit}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>consultations used this month</div>
              </div>

              {/* Progress Bar */}
              {consultationsLimit !== -1 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.08)', borderRadius: '99px',
                    height: '10px', overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      style={{
                        height: '100%', borderRadius: '99px',
                        background: usagePercent >= 100
                          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : usagePercent >= 75
                          ? 'linear-gradient(90deg, #f59e0b, #C9963A)'
                          : 'linear-gradient(90deg, #10b981, #13A89E)',
                        boxShadow: usagePercent >= 100 ? '0 0 12px rgba(239,68,68,0.5)' : '0 0 12px rgba(16,185,129,0.4)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Used', value: consultationsUsed, color: '#94a3b8' },
                  { label: 'Remaining', value: consultationsLimit === -1 ? '∞' : consultationsRemaining, color: consultationsRemaining === 0 ? '#ef4444' : '#10b981' },
                  { label: 'Plan Limit', value: consultationsLimit === -1 ? 'Unlimited' : consultationsLimit, color: '#C9963A' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px',
                    textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {consultationsLimit !== -1 && consultationsUsed >= consultationsLimit && (
                <div style={{
                  marginTop: '16px', padding: '12px 16px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px',
                }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '13px', marginBottom: '2px' }}>Consultation Limit Reached</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>
                      This member has used all {consultationsLimit} consultations for this month. Further visits may require additional payment.
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Plan Benefits */}
            {plan && (
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                  borderRadius: '20px', padding: '24px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(19,168,158,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#13A89E" strokeWidth="2">
                      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>{plan.name} Plan</span>
                    {plan.monthly_fee_cents && (
                      <span style={{ fontSize: '12px', color: '#475569', marginLeft: '8px' }}>
                        R{(plan.monthly_fee_cents / 100).toFixed(0)}/month
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: `${consultationsLimit === -1 ? 'Unlimited' : consultationsLimit} Consultations/Month`, active: true, icon: '🩺' },
                    { label: 'Medication Included', active: plan.includes_medication, icon: '💊' },
                    { label: '24/7 Access', active: plan.includes_24h_access, icon: '🕐' },
                    { label: 'Chronic Medication Programme', active: plan.includes_chronic, icon: '📋' },
                  ].map((feature) => (
                    <div key={feature.label} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: '10px',
                      background: feature.active ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${feature.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)'}`,
                    }}>
                      <span style={{ fontSize: '16px' }}>{feature.icon}</span>
                      <span style={{ fontSize: '13px', color: feature.active ? '#d1fae5' : '#475569', flex: 1 }}>
                        {feature.label}
                      </span>
                      {feature.active ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Consultations */}
            {member?.recent_consultations?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                  borderRadius: '20px', padding: '24px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(201,150,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9963A" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Recent Consultations</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {member.recent_consultations.map((c: any, i: number) => {
                    const d = new Date(c.visited_at || c.created_at);
                    return (
                      <div key={c.id} style={{
                        display: 'flex', gap: '14px', padding: '14px',
                        background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <div style={{
                          flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px',
                          background: 'rgba(19,168,158,0.1)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexDirection: 'column',
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#13A89E', lineHeight: 1 }}>{d.getDate()}</div>
                          <div style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase' }}>
                            {d.toLocaleString('default', { month: 'short' })}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px', marginBottom: '2px' }}>
                            {c.diagnosis || c.consultation_type?.replace(/_/g, ' ') || 'General Consultation'}
                          </div>
                          {c.doctor_name && (
                            <div style={{ fontSize: '11px', color: '#475569' }}>{c.doctor_name}</div>
                          )}
                          {c.clinical_notes && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', lineHeight: 1.4,
                              overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}>
                              {c.clinical_notes}
                            </div>
                          )}
                        </div>
                        <div style={{
                          flexShrink: 0,
                          background: c.counted_toward_limit ? 'rgba(201,150,58,0.12)' : 'rgba(100,116,139,0.12)',
                          border: `1px solid ${c.counted_toward_limit ? 'rgba(201,150,58,0.25)' : 'rgba(100,116,139,0.25)'}`,
                          borderRadius: '6px', padding: '2px 8px',
                          fontSize: '10px', fontWeight: 700,
                          color: c.counted_toward_limit ? '#C9963A' : '#64748b',
                          alignSelf: 'flex-start',
                        }}>
                          #{c.consultation_number || i + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Contact Info */}
            {(profile?.phone || profile?.email || member?.clinic?.name) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                  borderRadius: '20px', padding: '20px 24px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '14px' }}>Contact Information</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profile?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px' }}>📞</span>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px' }}>✉️</span>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{profile.email}</span>
                    </div>
                  )}
                  {member?.clinic?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px' }}>🏥</span>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{member.clinic.name}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{ textAlign: 'center', padding: '8px', color: '#334155', fontSize: '11px' }}
            >
              Verified at {new Date().toLocaleString('en-ZA')} · NFS Insure — Braam Health Centre
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
