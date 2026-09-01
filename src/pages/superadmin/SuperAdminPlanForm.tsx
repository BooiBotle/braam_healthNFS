import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Check, Sun, Moon, AlertCircle, Users, Clock, Pill, Shield, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getClinicPlans, saveClinicPlan } from '../../lib/api/clinics';

const SuperAdminPlanForm = () => {
  const navigate = useNavigate();
  const { clinicId, planId } = useParams();
  const isEdit = Boolean(planId);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    plan_type: '',
    monthly_fee_cents: 55000,
    consultations_pm: 3,
    max_members: 1,
    includes_chronic: false,
    includes_medication: true,
    includes_24h_access: true,
    is_active: true,
    most_popular: false,
    display_order: 99,
  });

  useEffect(() => {
    if (isEdit && planId && clinicId) {
      getClinicPlans(clinicId).then((plans: any[]) => {
        const found = plans.find((p: any) => p.id === planId);
        if (found) setFormData({ ...formData, ...found });
      });
    }
  }, [planId, isEdit, clinicId]);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Plan name is required';
    if (formData.monthly_fee_cents < 1000) e.monthly_fee_cents = 'Monthly fee must be at least R10';
    if (!formData.description.trim()) e.description = 'A description helps members understand this plan';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (formData.consultations_pm < 1 || formData.consultations_pm > 100) {
      if (formData.consultations_pm !== -1) {
        e.consultations_pm = 'Must be between 1 and 100 consultations per month (or -1 for unlimited)';
      }
    }
    if (formData.max_members < 1) e.max_members = 'Must allow at least 1 member';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) return;
    
    setSaving(true);
    try {
      const { error } = await saveClinicPlan({
        ...formData,
        clinic_id: clinicId,
        plan_type: formData.plan_type || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      });
      if (error) throw error;
      navigate(`/super-admin/clinics/${clinicId}/plans`);
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('Failed to save plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cardBg = isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff';
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0';
  const textColor = isDark ? '#ffffff' : '#0f172a';
  const mutedText = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1';

  const inputStyle = {
    padding: '0.75rem 1rem', borderRadius: '10px',
    background: inputBg, border: inputBorder, color: textColor,
    fontSize: '0.9375rem', width: '100%', boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const labelStyle = { fontSize: '0.875rem', color: mutedText, fontWeight: 600, display: 'block', marginBottom: '6px' };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '820px', margin: '0 auto', color: textColor }}>

      <Link
        to={`/super-admin/clinics/${clinicId}/plans`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#c9a033', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Plans
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: textColor, margin: 0 }}>
            {isEdit ? 'Edit Membership Plan' : 'Create New Membership Plan'}
          </h1>
          <p style={{ color: mutedText, fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Configure plan pricing, consultation limits, and member benefits on behalf of the clinic.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', border: cardBorder, color: textColor, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
        >
          {isDark ? <Sun size={16} color="#c9a033" /> : <Moon size={16} color="#1c2340" />}
          {isDark ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        {[
          { num: 1, label: 'Plan Identity & Price', icon: <Shield size={14} /> },
          { num: 2, label: 'Consultations & Benefits', icon: <Activity size={14} /> },
          { num: 3, label: 'Review & Publish', icon: <Check size={14} /> },
        ].map(s => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
              background: step === s.num ? (isDark ? 'rgba(201,160,51,0.2)' : '#fef9c3') : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
              border: step === s.num ? '1px solid #c9a033' : cardBorder,
              textAlign: 'center', transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: step === s.num ? '#c9a033' : mutedText }}>
              {s.icon}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: step === s.num ? '#c9a033' : mutedText }}>STEP {s.num}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: step === s.num ? textColor : mutedText, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: cardBg, backdropFilter: 'blur(20px)', borderRadius: '20px', border: cardBorder, padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>

        {/* ─── STEP 1: Identity & Price ─── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: textColor, margin: '0 0 4px' }}>
              Step 1 — Plan Name & Monthly Premium
            </h2>

            <div>
              <label style={labelStyle}>Plan Name *</label>
              <input
                style={{ ...inputStyle, border: errors.name ? '1px solid #ef4444' : inputBorder }}
                placeholder="e.g. Essential, Family, Senior Care..."
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} />{errors.name}</div>}
            </div>

            <div>
              <label style={labelStyle}>Plan Description *</label>
              <textarea
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', border: errors.description ? '1px solid #ef4444' : inputBorder }}
                placeholder="Brief summary of who this plan is for and what it includes..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              {errors.description && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} />{errors.description}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Monthly Premium (ZAR) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#c9a033', fontSize: '15px' }}>R</span>
                  <input
                    type="number" min="0" step="50"
                    style={{ ...inputStyle, paddingLeft: '28px', border: errors.monthly_fee_cents ? '1px solid #ef4444' : inputBorder }}
                    placeholder="550"
                    value={formData.monthly_fee_cents / 100}
                    onChange={e => setFormData({ ...formData, monthly_fee_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                  />
                </div>
                {errors.monthly_fee_cents && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.monthly_fee_cents}</div>}
                <div style={{ fontSize: '11px', color: mutedText, marginTop: '4px' }}>
                  = R{(formData.monthly_fee_cents / 100).toFixed(2)} per month
                </div>
              </div>

              <div>
                <label style={labelStyle}>Max Members on Plan</label>
                <input
                  type="number" min="1" max="20"
                  style={inputStyle}
                  value={formData.max_members}
                  onChange={e => setFormData({ ...formData, max_members: parseInt(e.target.value || '1') })}
                />
                <div style={{ fontSize: '11px', color: mutedText, marginTop: '4px' }}>e.g. 1 = single, 2 = couple, 4 = family</div>
              </div>
            </div>

            {/* Status flags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { key: 'is_active', label: 'Plan is Active', sub: 'Members can apply for this plan' },
                { key: 'most_popular', label: 'Mark as Most Popular', sub: 'Highlights this plan to members' },
              ].map((opt) => (
                <label key={opt.key} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px',
                  borderRadius: '10px', cursor: 'pointer',
                  border: (formData as any)[opt.key] ? '1px solid #c9a033' : cardBorder,
                  background: (formData as any)[opt.key] ? (isDark ? 'rgba(201,160,51,0.08)' : '#fffbeb') : inputBg,
                }}>
                  <input
                    type="checkbox"
                    checked={(formData as any)[opt.key]}
                    onChange={e => setFormData({ ...formData, [opt.key]: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#c9a033', marginTop: '2px', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: textColor }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', color: mutedText, marginTop: '2px' }}>{opt.sub}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => { if (validateStep1()) setStep(2); }}
                style={{ padding: '12px 24px', borderRadius: '10px', background: '#c9a033', color: '#1c2340', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Next: Consultations <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Consultations & Benefits ─── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: textColor, margin: '0 0 4px' }}>
              Step 2 — Consultation Allowance & Coverage
            </h2>
            <p style={{ fontSize: '13px', color: mutedText, margin: 0 }}>
              This is the most critical setting. The consultation limit you set here is enforced in real-time for all members on this plan — staff cannot register visits beyond the limit without flagging.
            </p>

            {/* Consultation limit — highlighted */}
            <div style={{
              background: isDark ? 'rgba(201,160,51,0.08)' : '#fffbeb',
              border: errors.consultations_pm ? '2px solid #ef4444' : '2px solid #c9a033',
              borderRadius: '14px', padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(201,160,51,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={16} color="#c9a033" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: textColor }}>Monthly Doctor Consultations Limit</div>
                  <div style={{ fontSize: '12px', color: '#c9a033' }}>This directly controls how many visits a member gets each month</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="number" min="-1" max="100"
                  style={{
                    ...inputStyle, width: '120px', fontSize: '2rem', fontWeight: 900,
                    textAlign: 'center', padding: '12px',
                    border: errors.consultations_pm ? '2px solid #ef4444' : '2px solid #c9a033',
                    color: '#c9a033',
                  }}
                  value={formData.consultations_pm}
                  onChange={e => setFormData({ ...formData, consultations_pm: parseInt(e.target.value || '1') })}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '22px', color: textColor }}>consultations</div>
                  <div style={{ fontSize: '13px', color: mutedText }}>per member, per calendar month</div>
                  <div style={{ fontSize: '12px', color: '#c9a033', marginTop: '4px' }}>
                    💡 Set to -1 for unlimited consultations
                  </div>
                </div>
              </div>

              {errors.consultations_pm && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{errors.consultations_pm}</div>}

              {/* Preset buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                {[3, 4, 6, 8, 12, 18].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData({ ...formData, consultations_pm: n })}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '13px',
                      border: '1px solid',
                      cursor: 'pointer',
                      background: formData.consultations_pm === n ? '#c9a033' : inputBg,
                      color: formData.consultations_pm === n ? '#1c2340' : mutedText,
                      borderColor: formData.consultations_pm === n ? '#c9a033' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                    }}
                  >
                    {n}/mo
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage options */}
            <div>
              <div style={{ fontWeight: 700, color: textColor, marginBottom: '12px', fontSize: '14px' }}>Included Benefits</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'includes_medication', icon: <Pill size={16} color="#7c3aed" />, label: 'Medication Included', sub: 'Prescribed medications from the clinic formulary are covered at no extra cost', bg: '#f5f3ff', color: '#7c3aed' },
                  { key: 'includes_24h_access', icon: <Clock size={16} color="#0284c7" />, label: '24/7 Facility Access', sub: 'Members can visit the clinic at any time, day or night', bg: '#eff6ff', color: '#0284c7' },
                  { key: 'includes_chronic', icon: <Shield size={16} color="#10b981" />, label: 'Chronic Medication Programme', sub: 'Ongoing chronic condition management and script renewals are covered', bg: '#f0fdf4', color: '#10b981' },
                ].map((opt) => (
                  <label key={opt.key} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 16px',
                    borderRadius: '12px', cursor: 'pointer',
                    border: (formData as any)[opt.key] ? `1px solid ${opt.color}40` : cardBorder,
                    background: (formData as any)[opt.key] ? opt.bg : inputBg,
                    transition: 'all .15s',
                  }}>
                    <input
                      type="checkbox"
                      checked={(formData as any)[opt.key]}
                      onChange={e => setFormData({ ...formData, [opt.key]: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: opt.color, marginTop: '2px', flexShrink: 0 }}
                    />
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {opt.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: textColor }}>{opt.label}</div>
                      <div style={{ fontSize: '11.5px', color: mutedText, marginTop: '2px', lineHeight: 1.5 }}>{opt.sub}</div>
                    </div>
                    {(formData as any)[opt.key] && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={12} color="#fff" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setStep(1)} style={{ padding: '12px 24px', borderRadius: '10px', background: 'transparent', border: cardBorder, color: textColor, fontWeight: 600, cursor: 'pointer' }}>Previous</button>
              <button type="button" onClick={() => { if (validateStep2()) setStep(3); }} style={{ padding: '12px 24px', borderRadius: '10px', background: '#c9a033', color: '#1c2340', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Review Plan <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Review & Publish ─── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: textColor, margin: '0 0 4px' }}>
              Step 3 — Review & Publish Plan
            </h2>
            <p style={{ fontSize: '13px', color: mutedText, margin: 0 }}>
              Review all settings before publishing. Members will see this plan immediately after publishing.
            </p>

            {/* Plan Preview Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1c2340 0%, #0b1120 100%)',
              borderRadius: '16px', padding: '24px', color: '#fff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800 }}>{formData.name || 'Unnamed Plan'}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{formData.description || 'No description'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#c9a033' }}>
                    R{(formData.monthly_fee_cents / 100).toFixed(0)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>per month</div>
                </div>
              </div>

              {/* Consultation highlight */}
              <div style={{
                background: 'rgba(201,160,51,0.15)', border: '1px solid rgba(201,160,51,0.3)',
                borderRadius: '12px', padding: '16px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <div style={{ fontSize: '40px', fontWeight: 900, color: '#c9a033', lineHeight: 1 }}>
                  {formData.consultations_pm === -1 ? '∞' : formData.consultations_pm}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>
                    {formData.consultations_pm === -1 ? 'Unlimited' : `${formData.consultations_pm}`} Consultations / Month
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Per member • Enforced in real-time at the clinic
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { ok: true, text: `Up to ${formData.max_members} member${formData.max_members > 1 ? 's' : ''} on plan`, icon: '👥' },
                  { ok: formData.includes_medication, text: 'Medication included', icon: '💊' },
                  { ok: formData.includes_24h_access, text: '24/7 access', icon: '🕐' },
                  { ok: formData.includes_chronic, text: 'Chronic medication programme', icon: '📋' },
                ].map(b => (
                  <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: b.ok ? '#d1fae5' : '#475569' }}>
                    <span style={{ fontSize: '15px' }}>{b.icon}</span>
                    {b.ok
                      ? <Check size={13} color="#10b981" style={{ flexShrink: 0 }} />
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{ flexShrink: 0 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    }
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status flags */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Active', value: formData.is_active, color: '#10b981' },
                { label: 'Most Popular', value: formData.most_popular, color: '#c9a033' },
              ].map(f => (
                <div key={f.label} style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 700,
                  background: f.value ? `${f.color}15` : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                  border: `1px solid ${f.value ? f.color + '40' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0')}`,
                  color: f.value ? f.color : mutedText,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {f.value ? <Check size={12} /> : null} {f.label}: {f.value ? 'Yes' : 'No'}
                </div>
              ))}
            </div>

            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: isDark ? 'rgba(201,160,51,0.08)' : '#fffbeb',
              border: '1px solid rgba(201,160,51,0.25)',
              fontSize: '12.5px', color: '#c9a033',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                <strong>Consultation enforcement:</strong> Members on this plan will be strictly limited to {formData.consultations_pm === -1 ? 'unlimited' : formData.consultations_pm} consultation{formData.consultations_pm !== 1 ? 's' : ''} per month. Staff will be warned and the visit flagged if they exceed this limit.
              </span>
            </div>

            <div style={{ display: 'flex', justify-content: 'space-between', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setStep(2)} style={{ padding: '12px 24px', borderRadius: '10px', background: 'transparent', border: cardBorder, color: textColor, fontWeight: 600, cursor: 'pointer' }}>
                Back to Edit
              </button>
              <button type="submit" disabled={saving} style={{ padding: '12px 28px', borderRadius: '10px', background: '#1c2340', color: '#ffffff', fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
                <Save size={16} /> {saving ? 'Publishing...' : (isEdit ? 'Save Changes' : 'Publish Plan')}
              </button>
            </div>
          </form>
        )}

      </div>
    </motion.div>
  );
};

export default SuperAdminPlanForm;
