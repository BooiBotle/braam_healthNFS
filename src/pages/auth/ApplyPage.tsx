import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Lock, Mail, ShieldCheck, Building2, MapPin, Clock, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getActiveClinics, getPlansForClinic, type Clinic, type ClinicPlan } from '../../lib/api/clinics';

const steps = ['Account', 'Personal', 'Clinic', 'Plan', 'Disclaimers', 'Banking', 'Review'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as any } },
};

function isValidSAId(idNumber: string): boolean {
  if (!/^\d{13}$/.test(idNumber)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = idNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(idNumber.charAt(i), 10);
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

const ApplyPage = () => {
  const navigate = useNavigate();
  const { user, signUpWithPassword, signInWithOAuth, loginWithOtp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [idType, setIdType] = useState<'sa_id' | 'passport'>('sa_id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicPlans, setClinicPlans] = useState<ClinicPlan[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  const [formData, setFormData] = useState({
    authMethod: 'password', // 'password' | 'magiclink' | 'google'
    password: '',
    firstName: '', lastName: '', idNumber: '', mobile: '', email: '', address: '',
    clinicId: '', clinicName: '',
    planId: '', planName: '', planFee: 0,
    hasPreExisting: false, isPregnant: false, acceptsTerms: false,
    bankName: '', accountHolder: '', accountNumber: '', accountType: '', branchCode: ''
  });

  useEffect(() => {
    getActiveClinics().then(data => {
      setClinics(data);
      setLoadingClinics(false);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, clinicId: data[0].id, clinicName: data[0].name }));
      }
    });
  }, []);

  // Skip Step 1 if user is already authenticated (e.g. returning from Google Auth)
  useEffect(() => {
    if (user && currentStep === 1) {
      setCurrentStep(2);
      // Pre-fill email and name from user if available
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        firstName: prev.firstName || (user.name ? user.name.split(' ')[0] : ''),
        lastName: prev.lastName || (user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '')
      }));
    }
  }, [user, currentStep]);

  // When step changes to Step 4 (Choose Plan), fetch plans for selected clinic
  useEffect(() => {
    if (currentStep === 4 && formData.clinicId) {
      getPlansForClinic(formData.clinicId).then(plans => {
        setClinicPlans(plans);
        if (plans.length > 0 && !formData.planId) {
          setFormData(prev => ({
            ...prev,
            planId: plans[0].id,
            planName: plans[0].name,
            planFee: plans[0].monthly_fee_cents / 100
          }));
        }
      });
    }
  }, [currentStep, formData.clinicId]);

  const defaultPlans = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Essential Care', price: 450, features: ['2 Consultations p/m', 'Basic Medication', '24/7 Access'] },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Standard Care', price: 650, features: ['4 Consultations p/m', 'Full Prescriptions', 'Chronic Care'] },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Premium Care', price: 850, features: ['Unlimited Consultations', 'Complete Prescriptions', '24/7 Priority'] }
  ];

  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Step 1: Handle Google Auth immediately if selected
    if (currentStep === 1 && formData.authMethod === 'google') {
      await signInWithOAuth('google', window.location.origin + '/apply');
      return; // Stop here, page will redirect
    }

    // Step 2: Validate ID Number
    if (currentStep === 2 && idType === 'sa_id') {
      if (!isValidSAId(formData.idNumber)) {
        alert("Please enter a valid 13-digit South African ID number.");
        return;
      }
    }

    if (currentStep < steps.length) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let authUserId = user?.id || null;

      // 1. Authenticate based on chosen method (only if not already authenticated via Google)
      if (!authUserId) {
        if (formData.authMethod === 'password') {
          const { data, error } = await signUpWithPassword(formData.email, formData.password);
          if (error) throw error;
          authUserId = data.user?.id;
        } else if (formData.authMethod === 'magiclink') {
          const { error } = await loginWithOtp(formData.email);
          if (error) throw error;
        }
      }

      // Ensure a clinicId is assigned
      let clinicIdToUse = formData.clinicId;
      if (!clinicIdToUse && clinics.length > 0) {
        clinicIdToUse = clinics[0].id;
      }

      // Ensure planId is valid
      let planIdToUse = formData.planId;
      if (!planIdToUse) {
        const { data: dbPlan } = await supabase.from('plans').select('id').eq('is_active', true).limit(1).single();
        planIdToUse = dbPlan?.id || '00000000-0000-0000-0000-000000000000';
      }

      // 2. Create Application Record with selected clinic_id
      const { error: appError } = await supabase.from('applications').insert({
        clinic_id: clinicIdToUse || '00000000-0000-0000-0000-000000000000',
        plan_id: planIdToUse,
        profile_id: authUserId,
        status: 'submitted',
        applicant_name: `${formData.firstName} ${formData.lastName}`,
        applicant_phone: formData.mobile,
        applicant_email: formData.email,
        applicant_id_number: formData.idNumber,
        source: 'self_service'
      });

      if (appError) throw appError;

      // Update profile with clinic_id if profile exists
      if (authUserId && clinicIdToUse) {
        await supabase.from('profiles').update({
          clinic_id: clinicIdToUse,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.mobile,
          sa_id_number: formData.idNumber
        }).eq('id', authUserId);
      }

      // Success
      navigate('/login?message=application_submitted');

    } catch (err: any) {
      console.error('Application Error:', err);
      setErrorMsg(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <section style={{ background: 'var(--hero-gradient)', paddingBottom: 'var(--sp-16)' }}>
        <div className="container">
          <Navbar />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: 'center', paddingTop: 'var(--sp-6)' }}>
            <h1 style={{ fontSize: 'var(--text-4xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-2)' }}>
              Apply for <span className="text-gradient">Membership</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>
              Complete the multi-step application form — select your local clinic, choose a plan, and get covered.
            </p>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: 'var(--sp-16) 0' }}>
        <div className="container" style={{ maxWidth: '780px', margin: '0 auto', padding: '0 var(--sp-6)' }}>
          
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--sp-10)' }}>
            {steps.map((step, index) => {
              const num = index + 1;
              const isActive = num === currentStep;
              const isPast = num < currentStep;

              return (
                <React.Fragment key={step}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-1)', flex: 0 }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: isPast ? 'var(--gold)' : isActive ? 'var(--navy)' : 'var(--bg-surface-sunken)',
                      border: !isActive && !isPast ? '1px solid var(--border)' : 'none',
                      color: isActive || isPast ? 'white' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700,
                      boxShadow: isActive ? '0 0 0 4px var(--accent-subtle)' : 'none',
                      transition: 'all 300ms',
                    }}>
                      {isPast ? <Check size={14} /> : num}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--text-heading)' : isPast ? 'var(--gold)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}>
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div style={{
                      flex: 1, height: '2px',
                      background: isPast ? 'var(--gold)' : 'var(--border)',
                      margin: '0 var(--sp-2)', transform: 'translateY(-8px)',
                      borderRadius: '1px', transition: 'background 300ms',
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Form Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="card"
              style={{ padding: 'var(--sp-8)' }}
            >
              
              {/* STEP 1: ACCOUNT */}
              {currentStep === 1 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Create Account</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    How would you like to sign in to your portal? You can change this later in settings.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
                    <button type="button" disabled style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-4)',
                      background: 'var(--bg-surface-sunken)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)', cursor: 'not-allowed', textAlign: 'left', transition: 'all 200ms',
                      opacity: 0.6
                    }}>
                      <div style={{ background: 'white', padding: 'var(--sp-2)', borderRadius: '50%', border: '1px solid var(--border)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center' }}>
                          Continue with Google
                          <span style={{ fontSize: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 700 }}>Coming Soon</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Fastest setup</div>
                      </div>
                    </button>

                    <button type="button" onClick={() => setFormData({ ...formData, authMethod: 'password' })} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-4)',
                      background: formData.authMethod === 'password' ? 'var(--accent-subtle)' : 'transparent',
                      border: formData.authMethod === 'password' ? '2px solid var(--navy)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', transition: 'all 200ms'
                    }}>
                      <div style={{ background: 'var(--bg-surface-sunken)', padding: 'var(--sp-3)', borderRadius: '50%', color: 'var(--text-muted)' }}><Lock size={18} /></div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>Email & Password</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Standard secure login</div>
                      </div>
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="you@example.com" required
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>

                  {formData.authMethod === 'password' && (
                    <div className="form-group">
                      <label className="form-label">Create Password</label>
                      <input type="password" className="form-input" placeholder="Min 8 characters" required minLength={8}
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-8)' }}>
                    <button type="submit" className="btn btn-primary">Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 2: PERSONAL */}
              {currentStep === 2 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Personal Details</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Tell us about yourself so we can set up your membership profile.
                  </p>

                  <div className="grid-2" style={{ gap: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">First Name</label>
                      <input type="text" className="form-input" placeholder="John" required
                        value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Last Name</label>
                      <input type="text" className="form-input" placeholder="Doe" required
                        value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Identity Document</label>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                      <button type="button" onClick={() => setIdType('sa_id')} style={{
                        flex: 1, padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-md)',
                        border: idType === 'sa_id' ? '1px solid var(--navy)' : '1px solid var(--border)',
                        background: idType === 'sa_id' ? 'var(--accent-subtle)' : 'var(--bg-surface-sunken)',
                        color: idType === 'sa_id' ? 'var(--navy)' : 'var(--text-secondary)',
                        fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms',
                      }}>
                        SA ID Number
                      </button>
                      <button type="button" onClick={() => setIdType('passport')} style={{
                        flex: 1, padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-md)',
                        border: idType === 'passport' ? '1px solid var(--navy)' : '1px solid var(--border)',
                        background: idType === 'passport' ? 'var(--accent-subtle)' : 'var(--bg-surface-sunken)',
                        color: idType === 'passport' ? 'var(--navy)' : 'var(--text-secondary)',
                        fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms',
                      }}>
                        Passport
                      </button>
                    </div>
                    <input type="text" className="form-input" placeholder={idType === 'sa_id' ? '13-digit SA ID number' : 'Passport number'} required
                      value={formData.idNumber} onChange={e => setFormData({ ...formData, idNumber: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input type="tel" className="form-input" placeholder="082 123 4567" required
                      value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary">Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 3: CLINIC SELECTION (Right before Plan!) */}
              {currentStep === 3 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Select Clinic Branch</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Choose the primary healthcare clinic branch you wish to attend for medical consultations.
                  </p>

                  {loadingClinics ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading network clinics...</div>
                  ) : clinics.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No active clinics available currently.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
                      {clinics.map(clinic => {
                        const isSelected = formData.clinicId === clinic.id;
                        return (
                          <div
                            key={clinic.id}
                            onClick={() => setFormData({ ...formData, clinicId: clinic.id, clinicName: clinic.name, planId: '', planName: '' })}
                            style={{
                              padding: 'var(--sp-5)', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                              border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border)',
                              background: isSelected ? 'var(--gold-subtle)' : 'var(--bg-surface-sunken)',
                              transition: 'all 200ms', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                                <Building2 size={20} />
                              </div>
                              <div>
                                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-heading)', margin: 0 }}>{clinic.name}</h3>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {clinic.doctor_name || 'General Practice'} • {clinic.address_line1 || clinic.city || 'ZA'}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              {clinic.open_24h && (
                                <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', color: 'var(--status-success)', fontSize: '11px', fontWeight: 700 }}>
                                  24/7 Facility
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary" disabled={!formData.clinicId}>Continue to Plans <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 4: CHOOSE PLAN (Filtered by Selected Clinic) */}
              {currentStep === 4 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Choose Plan</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Showing available membership plans offered by <strong>{formData.clinicName || 'Selected Clinic'}</strong>.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
                    {(clinicPlans.length > 0 ? clinicPlans : defaultPlans).map((plan: any) => {
                      const isSelected = formData.planName === plan.name;
                      const feeDisplay = plan.monthly_fee_cents ? (plan.monthly_fee_cents / 100) : (plan.price || 450);

                      return (
                        <div 
                          key={plan.id || plan.name}
                          onClick={() => setFormData({ ...formData, planName: plan.name, planFee: feeDisplay, planId: plan.id })}
                          style={{
                            padding: 'var(--sp-5)', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                            border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--gold-subtle)' : 'var(--bg-surface-sunken)',
                            transition: 'all 200ms',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-heading)', margin: 0 }}>{plan.name}</h3>
                            <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>R{feeDisplay}<span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span></div>
                          </div>

                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            {plan.consultations_pm ? `${plan.consultations_pm} Consultations p/m` : 'Multi-consultation benefit included'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary" disabled={!formData.planName}>Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 5: DISCLAIMERS */}
              {currentStep === 5 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Medical History</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Please declare any pre-existing medical conditions.
                  </p>

                  <div className="form-group" style={{ marginBottom: 'var(--sp-6)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} 
                        checked={formData.hasPreExisting} onChange={e => setFormData({ ...formData, hasPreExisting: e.target.checked })} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>I have pre-existing chronic conditions</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Examples: Hypertension, Diabetes, Asthma.</div>
                      </div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary">Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 6: BANKING */}
              {currentStep === 6 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Debit Order Mandate</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Banking details for monthly membership collection.
                  </p>

                  <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
                    <div className="form-group">
                      <label className="form-label">Bank Name</label>
                      <select className="form-input" required value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })}>
                        <option value="">Select Bank</option>
                        <option value="fnb">First National Bank (FNB)</option>
                        <option value="standard">Standard Bank</option>
                        <option value="absa">ABSA</option>
                        <option value="nedbank">Nedbank</option>
                        <option value="capitec">Capitec Bank</option>
                        <option value="discovery">Discovery Bank</option>
                        <option value="investec">Investec</option>
                        <option value="tymebank">TymeBank</option>
                        <option value="african">African Bank</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Branch Code</label>
                      <input type="text" className="form-input" required placeholder="e.g. 250655"
                        value={formData.branchCode} onChange={e => setFormData({ ...formData, branchCode: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Holder Name</label>
                    <input type="text" className="form-input" required placeholder="As it appears on your statement"
                      value={formData.accountHolder} onChange={e => setFormData({ ...formData, accountHolder: e.target.value })} />
                  </div>

                  <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
                    <div className="form-group">
                      <label className="form-label">Account Number</label>
                      <input type="text" className="form-input" required placeholder="Account number"
                        value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Account Type</label>
                      <select className="form-input" required value={formData.accountType} onChange={e => setFormData({ ...formData, accountType: e.target.value })}>
                        <option value="">Select Type</option>
                        <option value="cheque">Cheque / Current</option>
                        <option value="savings">Savings</option>
                        <option value="transmission">Transmission</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary">Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 7: REVIEW */}
              {currentStep === 7 && (
                <div>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Review & Submit</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Please review your application summary.
                  </p>

                  <div style={{ background: 'var(--bg-surface-sunken)', padding: 'var(--sp-6)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--sp-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Applicant</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{formData.firstName} {formData.lastName}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Branch</div>
                        <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{formData.clinicName}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', fontWeight: 600 }}>{formData.planName} (R{formData.planFee}/mo)</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--sp-8)' }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>Terms & Conditions</h3>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, height: '120px', overflowY: 'auto', paddingRight: 'var(--sp-3)' }}>
                        <p style={{ marginBottom: '8px' }}>1. <strong>Membership:</strong> This is a primary healthcare membership, not a medical aid scheme. It provides access to network clinics for GP consultations and dispensed acute medication.</p>
                        <p style={{ marginBottom: '8px' }}>2. <strong>Debit Order Mandate:</strong> By submitting this application, you authorize NFS Insure (or its appointed payment provider) to debit the specified bank account monthly for the selected plan fee.</p>
                        <p style={{ marginBottom: '8px' }}>3. <strong>Waiting Periods:</strong> A standard 30-day waiting period applies for new chronic medication registrations. Acute consultations are available upon activation.</p>
                        <p style={{ marginBottom: '8px' }}>4. <strong>Cancellations:</strong> Membership may be cancelled at any time with one calendar month's written notice. No cancellation penalties apply.</p>
                        <p>5. <strong>Data Privacy:</strong> Your personal and medical information is processed in accordance with the POPI Act.</p>
                      </div>
                      <div style={{ marginTop: 'var(--sp-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-3)' }}>
                        <a href="/terms.pdf" target="_blank" style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={14} /> Download Full Terms & Conditions (PDF)
                        </a>
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} required
                        checked={formData.acceptsTerms} onChange={e => setFormData({ ...formData, acceptsTerms: e.target.checked })} />
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        I have read, understood, and accept the Terms & Conditions, and I authorize the monthly debit order for my {formData.clinicName || 'clinic'} membership.
                      </div>
                    </label>
                  </div>

                  {errorMsg && (
                    <div style={{ color: 'var(--status-error)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', padding: 'var(--sp-3)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }} disabled={isSubmitting}><ArrowLeft size={18} /> Back</button>
                    <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={!formData.acceptsTerms || isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Application'} <ShieldCheck size={18} style={{ marginLeft: 'var(--sp-2)' }} />
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ApplyPage;
