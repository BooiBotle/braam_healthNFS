import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Heart, Activity, CheckCircle, Mail, User, FileText, Stethoscope, ArrowRight, Zap, Clock, UserCheck, Briefcase, Pill } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const LandingPage = () => {
  const { loginWithOtp, verifyOtp } = useAuth();
  const [loginRole, setLoginRole] = useState<'member' | 'staff'>('member');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError('');
    const { error } = await loginWithOtp(email);
    if (error) setError(error.message); else setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true); setError('');
    const { error } = await verifyOtp(email, token);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      
      {/* ── HERO ── */}
      <section style={{
        background: 'var(--hero-gradient)',
        position: 'relative',
        paddingBottom: 'var(--sp-24)',
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: '450px', height: '450px', background: 'var(--accent)', filter: 'blur(140px)', opacity: 0.08, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'var(--gold)', filter: 'blur(140px)', opacity: 0.06, borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="container">
          <Navbar />

          <div className="grid-2" style={{ alignItems: 'center', paddingTop: 'var(--sp-12)', gap: 'var(--sp-12)' }}>
            
            {/* Left - Copy */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <span className="section-badge" style={{ marginBottom: 'var(--sp-5)', display: 'inline-flex' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                  Braam Health Centre
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} style={{ fontSize: 'var(--text-5xl)', fontWeight: 800, marginBottom: 'var(--sp-5)', letterSpacing: '-0.03em' }}>
                Quality healthcare,{' '}
                <span className="text-gradient">simplified.</span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.7, marginBottom: 'var(--sp-8)' }}>
                Unlimited GP consultations, dispensed medication, and health screenings — bundled into one affordable monthly membership.
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', marginBottom: 'var(--sp-10)' }}>
                <Link to="/plans" className="btn btn-primary" style={{ padding: 'var(--sp-3) var(--sp-6)' }}>
                  View Plans <ArrowRight size={14} />
                </Link>
                <Link to="/apply" className="btn btn-outline" style={{ padding: 'var(--sp-3) var(--sp-6)' }}>
                  Apply Now
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 'var(--sp-8)', flexWrap: 'wrap' }}>
                {[
                  { icon: <Heart size={14} />, text: 'From R499/mo' },
                  { icon: <Activity size={14} />, text: 'No lock-in' },
                  { icon: <CheckCircle size={14} />, text: 'Instant activation' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Sign In Widget */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="glass" style={{
                padding: 'var(--sp-8)',
                boxShadow: 'var(--shadow-xl), var(--shadow-glow-teal)',
                position: 'relative',
              }}>
                {/* Glow ring */}
                <div style={{ position: 'absolute', inset: '-1px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, var(--accent), var(--gold))', opacity: 0.12, zIndex: -1 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-6)' }}>
                  <div>
                    <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Quick Access</h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Magic-link sign in</p>
                  </div>
                  <div style={{
                    padding: 'var(--sp-2)', borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, var(--accent), var(--gold))',
                  }}>
                    <Shield size={16} color="white" />
                  </div>
                </div>

                <div className="role-switcher" style={{ marginBottom: 'var(--sp-6)' }}>
                  <button className={loginRole === 'member' ? 'active' : ''} onClick={() => setLoginRole('member')}>
                    <User size={12} /> Member
                  </button>
                  <button className={loginRole === 'staff' ? 'active' : ''} onClick={() => setLoginRole('staff')}>
                    <FileText size={12} /> Staff
                  </button>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                      <label className="form-label">Email address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={14} style={{ position: 'absolute', left: 'var(--sp-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    {error && <p style={{ color: '#ef4444', fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-3)' }}>{error}</p>}
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 'var(--sp-3)' }}>
                      {loading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="form-group">
                      <label className="form-label">Verification Code</label>
                      <input type="text" className="form-input" style={{ textAlign: 'center', letterSpacing: '6px', fontWeight: 700 }} placeholder="------" value={token} onChange={e => setToken(e.target.value)} required />
                      <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>Sent to {email}</p>
                    </div>
                    {error && <p style={{ color: '#ef4444', fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-3)' }}>{error}</p>}
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 'var(--sp-3)' }}>
                      {loading ? 'Verifying...' : 'Sign In'}
                    </button>
                    <button type="button" onClick={() => setOtpSent(false)} className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--sp-2)' }}>
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ padding: 'var(--sp-24) 0', position: 'relative' }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}
          >
            <motion.span variants={fadeUp} className="section-badge-gold section-badge" style={{ marginBottom: 'var(--sp-4)', display: 'inline-flex' }}>Why Braam Health</motion.span>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'var(--text-4xl)', maxWidth: '600px', margin: '0 auto', letterSpacing: '-0.02em' }}>
              Everything you need, <span className="text-gradient">nothing you don't.</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid-3"
          >
            {[
              { icon: <Stethoscope size={20} />, title: 'Unlimited GP Visits', desc: 'See a doctor whenever you need to — no co-payments, no hidden fees, no caps on the Braam Health plan.' },
              { icon: <Heart size={20} />, title: 'Dispensed Medication', desc: 'Walk out with your medication in hand. Acute and chronic meds dispensed directly at our in-house pharmacy.' },
              { icon: <Zap size={20} />, title: 'Cancel Anytime', desc: 'Life changes. Upgrade, downgrade, or cancel your membership with one month notice. No penalties ever.' },
              { icon: <Clock size={20} />, title: 'Same-day Appointments', desc: 'Skip the queues. Walk into Braam Health Centre and get seen by a GP on the same day, every day.' },
              { icon: <Shield size={20} />, title: 'Regulated & Compliant', desc: 'NFS Insure (FSP 53910) is an authorised financial services provider, regulated by the FSCA.' },
              { icon: <UserCheck size={20} />, title: 'Digital Membership', desc: 'Your digital membership card is delivered straight to your phone. Just tap to check in at reception.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="card card-interactive"
                style={{ padding: 'var(--sp-8)' }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  background: i % 2 === 0 ? 'var(--accent-subtle)' : 'var(--gold-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i % 2 === 0 ? 'var(--accent)' : 'var(--gold)',
                  marginBottom: 'var(--sp-5)',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-2)' }}>{feature.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PLANS PREVIEW ── */}
      <section style={{
        padding: 'var(--sp-24) 0',
        background: 'var(--bg-surface-sunken)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)' }} />
        
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
            <motion.span variants={fadeUp} className="section-badge" style={{ marginBottom: 'var(--sp-4)', display: 'inline-flex' }}>Membership Plans</motion.span>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'var(--text-4xl)', letterSpacing: '-0.02em' }}>
              Simple, <span className="text-gradient">transparent</span> pricing.
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', maxWidth: '500px', margin: 'var(--sp-4) auto 0' }}>
              No hidden fees. Choose a plan, apply online, and start receiving care immediately.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="plans-grid-landing"
          >
            {[
              {
                name: 'Basic Health', price: 'R599', suffix: '/mo', members: '1 member',
                icon: <Heart size={16} />, iconBg: 'var(--accent-subtle)', iconColor: 'var(--accent)',
                features: ['3 GP consults/month', 'Basic dispensed meds', 'Medical certificates', 'Sick notes'],
                popular: false, badge: null, disabled: false,
              },
              {
                name: 'Braam Health', price: 'R888', suffix: '/mo', members: '1 member',
                icon: <Stethoscope size={16} />, iconBg: 'var(--gold-subtle)', iconColor: 'var(--gold)',
                features: ['3 GP consults/month', 'All oral meds in stock', 'IMI injections', 'Prescriptions', 'Minor surgery'],
                popular: true, badge: 'MOST POPULAR', disabled: false,
              },
              {
                name: 'Braam Health Plus+', price: 'R1,333', suffix: '/mo', members: '2 members',
                icon: <Shield size={16} />, iconBg: 'var(--accent-subtle)', iconColor: 'var(--accent)',
                features: ['6 GP consults/month', 'All meds in stock', 'Nebulization & oxygen', 'IV therapy', '+1 relative'],
                popular: false, badge: 'BEST VALUE', disabled: false,
              },
              {
                name: 'Corporate', price: 'R499', suffix: '/staff/mo', members: 'Per employee',
                icon: <Briefcase size={16} />, iconBg: 'var(--accent-subtle)', iconColor: 'var(--accent)',
                features: ['3 GP consults/month', 'Basic dispensed meds', 'Chronic prescriptions', 'Med exams & forms'],
                popular: false, badge: 'MIN. 10 STAFF', disabled: false,
              },
              {
                name: 'Chronic Programme', price: 'Coming Soon', suffix: '', members: '1 member',
                icon: <Pill size={16} />, iconBg: 'var(--gold-subtle)', iconColor: 'var(--gold)',
                features: ['Hypertension', 'HIV treatment', 'Type 2 Diabetes', 'Asthma', 'Epilepsy'],
                popular: false, badge: 'CHRONIC CARE', disabled: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="card card-interactive"
                style={{
                  padding: 'var(--sp-6)',
                  border: plan.popular ? '2px solid var(--gold)' : undefined,
                  boxShadow: plan.popular ? 'var(--shadow-lg), var(--shadow-glow-gold)' : undefined,
                  position: 'relative',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '-10px', right: 'var(--sp-4)',
                    background: plan.popular ? 'linear-gradient(135deg, var(--gold), var(--gold-hover))' : 'var(--bg-surface-sunken)',
                    color: plan.popular ? '#1a1a1a' : 'var(--text-secondary)',
                    padding: '2px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '9px', fontWeight: 800, letterSpacing: '0.06em',
                    border: plan.popular ? 'none' : '1px solid var(--border)',
                    boxShadow: plan.popular ? '0 4px 12px var(--gold-glow)' : 'none',
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: plan.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.iconColor }}>
                    {plan.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.2 }}>{plan.name}</p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{plan.members}</p>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <span style={{ fontSize: plan.disabled ? 'var(--text-lg)' : 'var(--text-2xl)', fontWeight: 800, color: plan.popular ? 'var(--gold)' : plan.disabled ? 'var(--text-muted)' : 'var(--text-heading)', letterSpacing: '-0.02em' }}>
                    {plan.price}
                  </span>
                  {plan.suffix && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: '2px' }}>{plan.suffix}</span>}
                </div>

                <div style={{ height: '1px', background: 'var(--border)', marginBottom: 'var(--sp-4)' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={12} color={plan.popular ? 'var(--gold)' : 'var(--accent)'} style={{ flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.disabled ? '#' : '/apply'}
                  className={`btn ${plan.popular ? 'btn-gold' : 'btn-outline'}`}
                  style={{ width: '100%', fontSize: 'var(--text-xs)', pointerEvents: plan.disabled ? 'none' : 'auto', opacity: plan.disabled ? 0.4 : 1 }}
                >
                  {plan.disabled ? 'Coming Soon' : 'Apply Now'} {!plan.disabled && <ArrowRight size={12} />}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginTop: 'var(--sp-10)' }}>
            <Link to="/plans" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              Compare all features & plans <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'var(--sp-24) 0' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
              <span className="section-badge" style={{ marginBottom: 'var(--sp-4)', display: 'inline-flex' }}>Get Started</span>
              <h2 style={{ fontSize: 'var(--text-4xl)', letterSpacing: '-0.02em' }}>
                Three steps to <span className="text-gradient">better health.</span>
              </h2>
            </motion.div>

            <div className="grid-3" style={{ gap: 'var(--sp-8)' }}>
              {[
                { num: '01', title: 'Apply Online', desc: 'Select a plan and complete our simple 5-minute digital application form.', icon: <FileText size={20} /> },
                { num: '02', title: 'Get Activated', desc: 'Once approved, your digital membership card is instantly issued to your phone.', icon: <Zap size={20} /> },
                { num: '03', title: 'Walk-in Care', desc: 'Tap your phone at reception and consult with a GP — no cash required.', icon: <Stethoscope size={20} /> },
              ].map((step, i) => (
                <motion.div key={i} variants={fadeUp} style={{ position: 'relative' }}>
                  <div style={{
                    fontSize: 'var(--text-5xl)', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                    color: 'var(--accent)', opacity: 0.08, lineHeight: 1, marginBottom: 'var(--sp-4)',
                    letterSpacing: '-0.04em',
                  }}>
                    {step.num}
                  </div>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
                    background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)', marginBottom: 'var(--sp-4)',
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-2)' }}>{step.title}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: 'var(--sp-20) 0' }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #0d6e65 100%)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--sp-16) var(--sp-12)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '500px', height: '500px', background: 'var(--gold)', filter: 'blur(160px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'var(--text-4xl)', color: 'white', marginBottom: 'var(--sp-4)', letterSpacing: '-0.02em' }}>
                Ready to take control of your health?
              </h2>
              <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '0 auto var(--sp-8)' }}>
                Join thousands of members who trust Braam Health Centre for their primary healthcare needs.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                <Link to="/apply" className="btn" style={{ background: 'white', color: 'var(--accent)', padding: 'var(--sp-3) var(--sp-8)', fontWeight: 700 }}>
                  Apply Now <ArrowRight size={14} />
                </Link>
                <Link to="/plans" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: 'var(--sp-3) var(--sp-8)' }}>
                  View Plans
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .plans-grid-landing {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--sp-5);
        }
        @media (max-width: 1100px) {
          .plans-grid-landing { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .plans-grid-landing { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .plans-grid-landing { grid-template-columns: 1fr; }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default LandingPage;
