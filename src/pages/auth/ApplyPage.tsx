import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const steps = ['Personal', 'Plan', 'Disclaimers', 'Banking', 'Mandate', 'Review'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const ApplyPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [idType, setIdType] = useState<'sa_id' | 'passport'>('sa_id');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', idNumber: '', mobile: '', email: '', address: ''
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 6) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero Header */}
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

      {/* Main Content */}
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
                      background: isPast ? 'var(--accent)' : isActive ? 'linear-gradient(135deg, var(--accent), var(--gold))' : 'var(--bg-surface-sunken)',
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
                      color: isActive ? 'var(--text-heading)' : isPast ? 'var(--accent)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}>
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div style={{
                      flex: 1, height: '2px',
                      background: isPast ? 'var(--accent)' : 'var(--border)',
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
              {currentStep === 1 ? (
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
                        border: idType === 'sa_id' ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: idType === 'sa_id' ? 'var(--accent-subtle)' : 'var(--bg-surface-sunken)',
                        color: idType === 'sa_id' ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms',
                      }}>
                        SA ID Number
                      </button>
                      <button type="button" onClick={() => setIdType('passport')} style={{
                        flex: 1, padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-md)',
                        border: idType === 'passport' ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: idType === 'passport' ? 'var(--accent-subtle)' : 'var(--bg-surface-sunken)',
                        color: idType === 'passport' ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms',
                      }}>
                        Passport
                      </button>
                    </div>
                    <input type="text" className="form-input" placeholder={idType === 'sa_id' ? '13-digit SA ID number' : 'Passport number'} required
                      value={formData.idNumber} onChange={e => setFormData({ ...formData, idNumber: e.target.value })} />
                  </div>

                  <div className="grid-2" style={{ gap: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Mobile Number</label>
                      <input type="tel" className="form-input" placeholder="082 123 4567" required
                        value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" placeholder="john@example.com" required
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--sp-8)' }}>
                    <label className="form-label">Residential Address <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)' }}>(optional)</span></label>
                    <input type="text" className="form-input" placeholder="123 Main St, Johannesburg"
                      value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: 'var(--sp-3) var(--sp-6)' }}>
                      Continue <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--sp-12) 0' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto var(--sp-5)',
                  }}>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--accent)' }}>{currentStep}</span>
                  </div>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-2)' }}>
                    {steps[currentStep - 1]}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)', maxWidth: '400px', margin: '0 auto var(--sp-8)' }}>
                    This step will be wired up to the Supabase database during the next phase.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-4)' }}>
                    <button onClick={handleBack} className="btn btn-outline" style={{ padding: 'var(--sp-3) var(--sp-6)' }}>
                      <ArrowLeft size={14} /> Back
                    </button>
                    {currentStep < 6 && (
                      <button onClick={() => setCurrentStep(c => c + 1)} className="btn btn-primary" style={{ padding: 'var(--sp-3) var(--sp-6)' }}>
                        Continue <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div style={{ textAlign: 'center', marginTop: 'var(--sp-8)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              Already a member? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in here</Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApplyPage;
