import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Lock, Mail, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const steps = ['Account', 'Personal', 'Plan', 'Disclaimers', 'Banking', 'Review'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as any } },
};

const ApplyPage = () => {
  const navigate = useNavigate();
  const { signUpWithPassword, signInWithOAuth, loginWithOtp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [idType, setIdType] = useState<'sa_id' | 'passport'>('sa_id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    authMethod: 'password', // 'password' | 'magiclink' | 'google'
    password: '',
    firstName: '', lastName: '', idNumber: '', mobile: '', email: '', address: '',
    planId: '', planName: '', planFee: 0,
    hasPreExisting: false, isPregnant: false, acceptsTerms: false,
    bankName: '', accountHolder: '', accountNumber: '', accountType: '', branchCode: ''
  });

  const plans = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Essential', price: 450, features: ['2 Consultations p/m', 'Basic Scripts', 'No Chronic'] },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Standard', price: 650, features: ['4 Consultations p/m', 'Standard Scripts', 'Basic Chronic'] },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Premium', price: 850, features: ['Unlimited Consultations', 'All Scripts', 'Full Chronic'] }
  ];

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep < steps.length) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let authUserId = null;

      // 1. Authenticate based on chosen method
      if (formData.authMethod === 'password') {
        const { data, error } = await signUpWithPassword(formData.email, formData.password);
        if (error) throw error;
        authUserId = data.user?.id;
      } else if (formData.authMethod === 'magiclink') {
        const { error } = await loginWithOtp(formData.email);
        if (error) throw error;
        // Magic link sends email, user must click it. For application, we might want to capture data first.
        // We will proceed to create application without authUserId initially if magiclink, but ideally
        // the user would verify first. For this demo, we'll proceed.
      } else if (formData.authMethod === 'google') {
        await signInWithOAuth('google');
        // Google redirects away, so the application data would be lost unless saved in localStorage.
        // In a real app, you'd save state to localStorage before redirect.
        return; 
      }

      // Fetch a clinic ID (Assuming Braam Health Centre is the only one for now)
      const { data: clinic } = await supabase.from('clinics').select('id').limit(1).single();

      // Ensure planId is valid (fallback to a dummy UUID if mock data is used)
      let planIdToUse = formData.planId;
      if (!planIdToUse) {
        // If they didn't select one properly, query the first active plan from DB
        const { data: dbPlan } = await supabase.from('plans').select('id').eq('is_active', true).limit(1).single();
        planIdToUse = dbPlan?.id || '00000000-0000-0000-0000-000000000000';
      }

      // 2. Create Application Record
      const { error: appError } = await supabase.from('applications').insert({
        clinic_id: clinic?.id || '00000000-0000-0000-0000-000000000000',
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
              Complete the form below — it takes less than 5 minutes.
            </p>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: 'var(--sp-16) 0' }}>
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto', padding: '0 var(--sp-6)' }}>
          
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
              
              {/* STEP 1: ACCOUNT & AUTH */}
              {currentStep === 1 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Create Account</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    How would you like to sign in to your portal? You can change this later in settings.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
                    
                    {/* Google Auth Option */}
                    <button type="button" onClick={() => setFormData({ ...formData, authMethod: 'google' })} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-4)',
                      background: formData.authMethod === 'google' ? 'var(--accent-subtle)' : 'transparent',
                      border: formData.authMethod === 'google' ? '2px solid var(--navy)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', transition: 'all 200ms'
                    }}>
                      <div style={{ background: 'white', padding: 'var(--sp-2)', borderRadius: '50%', border: '1px solid var(--border)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>Continue with Google</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Fastest setup</div>
                      </div>
                    </button>

                    {/* Email/Password Option */}
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

                    {/* Magic Link Option */}
                    <button type="button" onClick={() => setFormData({ ...formData, authMethod: 'magiclink' })} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-4)',
                      background: formData.authMethod === 'magiclink' ? 'var(--accent-subtle)' : 'transparent',
                      border: formData.authMethod === 'magiclink' ? '2px solid var(--navy)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', transition: 'all 200ms'
                    }}>
                      <div style={{ background: 'var(--bg-surface-sunken)', padding: 'var(--sp-3)', borderRadius: '50%', color: 'var(--text-muted)' }}><Mail size={18} /></div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>Magic Link</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Passwordless sign-in via email</div>
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
                    Tell us about yourself so we can set up your membership.
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

              {/* STEP 3: PLAN */}
              {currentStep === 3 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Choose Plan</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Select the membership plan that suits your needs.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
                    {plans.map(plan => (
                      <div 
                        key={plan.name}
                        onClick={() => setFormData({ ...formData, planName: plan.name, planFee: plan.price, planId: plan.id })}
                        style={{
                          padding: 'var(--sp-5)', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                          border: formData.planName === plan.name ? '2px solid var(--gold)' : '1px solid var(--border)',
                          background: formData.planName === plan.name ? 'var(--gold-subtle)' : 'var(--bg-surface-sunken)',
                          transition: 'all 200ms',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                          <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-heading)' }}>{plan.name}</h3>
                          <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>R{plan.price}<span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span></div>
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                          {plan.features.map(f => (
                            <li key={f} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={12} color="var(--status-success)" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary" disabled={!formData.planName}>Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 4: DISCLAIMERS */}
              {currentStep === 4 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Medical History</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Please declare any existing conditions.
                  </p>

                  <div className="form-group" style={{ marginBottom: 'var(--sp-6)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} 
                        checked={formData.hasPreExisting} onChange={e => setFormData({ ...formData, hasPreExisting: e.target.checked })} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>I have pre-existing chronic conditions</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Examples: Hypertension, Diabetes, Asthma. A 6-month waiting period may apply for chronic medication benefits.</div>
                      </div>
                    </label>
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--sp-8)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }}
                        checked={formData.isPregnant} onChange={e => setFormData({ ...formData, isPregnant: e.target.checked })} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>I am currently pregnant</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>A 10-month waiting period applies for maternity-related sonars and specialist referrals.</div>
                      </div>
                    </label>
                  </div>

                  <div style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--navy)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--navy)', margin: 0, lineHeight: 1.6 }}>
                      <strong>Important:</strong> NFS Insure operates as a primary healthcare provider network, not a medical aid scheme. We provide access to private GP care, acute medication, and basic procedures at Braam Health Centre. We do not cover hospitalization, specialist fees, or external emergency services.
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary">Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 5: BANKING */}
              {currentStep === 5 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Debit Order Mandate</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Where should we deduct your monthly membership fee?
                  </p>

                  <div className="form-group">
                    <label className="form-label">Bank Name</label>
                    <select className="form-input" required value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })}>
                      <option value="">Select Bank</option>
                      <option value="fnb">FNB</option>
                      <option value="standard">Standard Bank</option>
                      <option value="absa">ABSA</option>
                      <option value="nedbank">Nedbank</option>
                      <option value="capitec">Capitec</option>
                      <option value="discovery">Discovery Bank</option>
                      <option value="tymebank">TymeBank</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Holder Name</label>
                    <input type="text" className="form-input" placeholder="As it appears on your statement" required
                      value={formData.accountHolder} onChange={e => setFormData({ ...formData, accountHolder: e.target.value })} />
                  </div>

                  <div className="grid-2" style={{ gap: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Account Number</label>
                      <input type="text" className="form-input" required
                        value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Account Type</label>
                      <select className="form-input" required value={formData.accountType} onChange={e => setFormData({ ...formData, accountType: e.target.value })}>
                        <option value="">Select Type</option>
                        <option value="cheque">Cheque / Current</option>
                        <option value="savings">Savings</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary">Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}

              {/* STEP 6: REVIEW */}
              {currentStep === 6 && (
                <div>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Review & Submit</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    Please review your details before submitting your application.
                  </p>

                  <div style={{ background: 'var(--bg-surface-sunken)', padding: 'var(--sp-6)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--sp-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{formData.firstName} {formData.lastName}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{formData.idNumber}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Plan</div>
                        <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{formData.planName}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>R{formData.planFee}/mo</div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-1)' }}>Auth Method</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                         {formData.authMethod === 'google' ? 'Google OAuth' : formData.authMethod === 'magiclink' ? 'Magic Link Email' : 'Email & Password'}
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--sp-8)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} required
                        checked={formData.acceptsTerms} onChange={e => setFormData({ ...formData, acceptsTerms: e.target.checked })} />
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        I confirm that the information provided is true and accurate. I accept the <Link to="/terms" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/popia" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>POPIA Compliance Statement</Link>, and authorize NFS Insure to debit my account monthly.
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








