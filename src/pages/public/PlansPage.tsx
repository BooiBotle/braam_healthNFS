import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Heart, Stethoscope, Briefcase, Pill, User, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const plans = [
  {
    name: 'Basic Health', members: '1 Member', price: 'R599', suffix: '/mo',
    icon: <Heart size={18} />, iconBg: 'var(--accent-subtle)', iconColor: 'var(--accent)',
    features: ['3 GP consultations/month', '3 basic dispensed medications', 'Medical assessments & certificates', 'Bedside medical examinations', 'Sick notes & medical reports', 'Referral letters', 'Family planning'],
    popular: false, badge: null, disabled: false,
  },
  {
    name: 'Braam Health', members: '1 Member', price: 'R888', suffix: '/mo',
    icon: <Stethoscope size={18} />, iconBg: 'var(--gold-subtle)', iconColor: 'var(--gold)',
    features: ['3 GP consultations/month', 'All dispensed oral medication in stock', 'Written prescriptions', 'Injectable medication (IMI)', 'Minor surgical procedures', 'Ear syringing', 'ECG (heart trace)', 'Chronic medication prescriptions', 'Family planning'],
    popular: true, badge: 'MOST POPULAR', disabled: false,
  },
  {
    name: 'Braam Health Plus+', members: '2 Members', price: 'R1,333', suffix: '/mo',
    icon: <Shield size={18} />, iconBg: 'var(--accent-subtle)', iconColor: 'var(--accent)',
    features: ['6 GP consultations/month', 'All dispensed medication in stock', '1 additional relative (switchable)', 'Nebulization & oxygen therapy', 'Intravenous therapy (IVI)', 'Minor surgical procedures', 'ECG (heart trace)', 'All Braam Health benefits', 'Removal of foreign bodies'],
    popular: false, badge: 'BEST VALUE', disabled: false,
  },
  {
    name: 'Corporate', members: 'Per Employee', price: 'R499', suffix: '/mo',
    icon: <Briefcase size={18} />, iconBg: 'var(--accent-subtle)', iconColor: 'var(--accent)',
    features: ['3 GP consultations/month', 'Basic dispensed medication', 'Chronic medication prescriptions', 'Medical examinations & forms', 'Sick notes & medical reports', 'Minimum 10 employees'],
    popular: false, badge: 'ENTERPRISE', disabled: false,
  },
  {
    name: 'Chronic Programme', members: '1 Member', price: 'Coming Soon', suffix: '',
    icon: <Pill size={18} />, iconBg: 'var(--gold-subtle)', iconColor: 'var(--gold)',
    features: ['Hypertension management', 'Peptic ulcer disease', 'HIV treatment', 'Type 2 diabetes mellitus', 'Asthma management', 'Epilepsy management', 'Mental health conditions'],
    popular: false, badge: 'CHRONIC CARE', disabled: true,
  },
];

const comparison = [
  { feature: 'GP Consultations',     basic: '3/mo',  standard: '3/mo',  plus: '6/mo' },
  { feature: 'Basic Dispensed Meds',  basic: true,    standard: true,    plus: true },
  { feature: 'All Oral Medication',   basic: false,   standard: true,    plus: true },
  { feature: 'Written Prescriptions', basic: false,   standard: true,    plus: true },
  { feature: 'Injectable Meds (IMI)', basic: false,   standard: true,    plus: true },
  { feature: 'Minor Surgery',         basic: false,   standard: true,    plus: true },
  { feature: 'ECG (Heart Trace)',     basic: false,   standard: true,    plus: true },
  { feature: 'Nebulization',          basic: false,   standard: false,   plus: true },
  { feature: 'Oxygen Therapy',        basic: false,   standard: false,   plus: true },
  { feature: 'IV Therapy (IVI)',      basic: false,   standard: false,   plus: true },
  { feature: 'Covered Members',       basic: '1',     standard: '1',     plus: '2' },
];

const faqs = [
  { q: 'Are there any co-payments when I visit?', a: 'No. If you have active consults remaining on your plan, there are zero co-payments or hidden fees for the consultation or covered medications.' },
  { q: 'What happens if I need a specialist?', a: 'Our plans cover primary healthcare (GP visits). If you require a specialist, we will provide a referral letter. Specialist fees are not covered.' },
  { q: 'Can I cancel at any time?', a: 'Yes. Cancel your membership with one calendar month\'s notice via the member portal or by contacting our admin team. No penalties.' },
  { q: 'How do I activate my membership?', a: 'Apply online, and once your first debit order clears and FICA documents are verified, your digital membership card is instantly activated.' },
  { q: 'Is this a medical aid?', a: 'No. This is a primary healthcare membership plan. It does not cover hospitalisation, specialists, or emergency ambulance services.' },
];

const CellValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === 'string') return <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{value}</span>;
  return value
    ? <Check size={16} color="var(--accent)" />
    : <X size={16} style={{ color: 'var(--text-muted)', opacity: 0.25 }} />;
};

const PlansPage = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero */}
      <section style={{ background: 'var(--hero-gradient)', position: 'relative', paddingBottom: 'var(--sp-20)' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'var(--gold)', filter: 'blur(160px)', opacity: 0.06, borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="container">
          <Navbar />
          <motion.div initial="hidden" animate="visible" variants={stagger} style={{ textAlign: 'center', paddingTop: 'var(--sp-12)', maxWidth: '650px', margin: '0 auto' }}>
            <motion.span variants={fadeUp} className="section-badge-gold section-badge" style={{ marginBottom: 'var(--sp-5)', display: 'inline-flex' }}>Plans & Pricing</motion.span>
            <motion.h1 variants={fadeUp} style={{ fontSize: 'var(--text-5xl)', letterSpacing: '-0.03em', marginBottom: 'var(--sp-4)' }}>
              Transparent pricing, <span className="text-gradient">zero surprises.</span>
            </motion.h1>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.7 }}>
              All plans include GP consultations at Braam Health Centre in Braamfontein. Cancel anytime — no lock-in contracts, no hidden fees.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Plans Grid */}
      <section style={{ padding: 'var(--sp-20) 0' }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="plans-grid"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name} variants={fadeUp}
                className="card card-interactive"
                style={{
                  padding: 'var(--sp-8)',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? '2px solid var(--gold)' : undefined,
                  boxShadow: plan.popular ? 'var(--shadow-lg), var(--shadow-glow-gold)' : undefined,
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '-11px', right: 'var(--sp-5)',
                    background: plan.popular ? 'linear-gradient(135deg, var(--gold), var(--gold-hover))' : 'var(--bg-surface-sunken)',
                    color: plan.popular ? '#1a1a1a' : 'var(--text-secondary)',
                    padding: '3px 12px', borderRadius: 'var(--radius-full)',
                    fontSize: '9px', fontWeight: 800, letterSpacing: '0.06em',
                    border: plan.popular ? 'none' : '1px solid var(--border)',
                    boxShadow: plan.popular ? '0 4px 12px var(--gold-glow)' : 'none',
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: plan.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.iconColor }}>
                    {plan.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.2 }}>{plan.name}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={10} /> {plan.members}</p>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-6)' }}>
                  <span style={{ fontSize: plan.disabled ? 'var(--text-xl)' : 'var(--text-3xl)', fontWeight: 800, color: plan.popular ? 'var(--gold)' : plan.disabled ? 'var(--text-muted)' : 'var(--text-heading)', letterSpacing: '-0.02em' }}>
                    {plan.price}
                  </span>
                  {plan.suffix && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginLeft: '2px' }}>{plan.suffix}</span>}
                </div>

                <div style={{ height: '1px', background: 'var(--border)', marginBottom: 'var(--sp-5)' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      <Check size={14} color={plan.popular ? 'var(--gold)' : 'var(--accent)'} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.disabled ? '#' : '/apply'}
                  className={`btn ${plan.popular ? 'btn-gold' : 'btn-outline'}`}
                  style={{ width: '100%', pointerEvents: plan.disabled ? 'none' : 'auto', opacity: plan.disabled ? 0.4 : 1 }}
                >
                  {plan.disabled ? 'Coming Soon' : 'Apply Now'} {!plan.disabled && <ArrowRight size={13} />}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ background: 'var(--bg-surface-sunken)', padding: 'var(--sp-20) 0', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)' }} />
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em' }}>Feature Comparison</motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', marginTop: 'var(--sp-3)' }}>See exactly what's included in each tier.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'separate', borderSpacing: 0, background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
              <thead>
                <tr>
                  <th style={{ padding: 'var(--sp-4) var(--sp-6)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Feature</th>
                  <th style={{ padding: 'var(--sp-4)', textAlign: 'center', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-heading)', borderBottom: '1px solid var(--border)' }}>Basic</th>
                  <th style={{ padding: 'var(--sp-4)', textAlign: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--gold)', borderBottom: '2px solid var(--gold)', background: 'var(--gold-subtle)' }}>Braam Health</th>
                  <th style={{ padding: 'var(--sp-4)', textAlign: 'center', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-heading)', borderBottom: '1px solid var(--border)' }}>Plus+</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < comparison.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: 'var(--sp-3) var(--sp-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.feature}</td>
                    <td style={{ padding: 'var(--sp-3)', textAlign: 'center', borderBottom: '1px solid var(--border)' }}><CellValue value={row.basic} /></td>
                    <td style={{ padding: 'var(--sp-3)', textAlign: 'center', background: 'var(--gold-subtle)', borderBottom: '1px solid var(--border)' }}><CellValue value={row.standard} /></td>
                    <td style={{ padding: 'var(--sp-3)', textAlign: 'center', borderBottom: '1px solid var(--border)' }}><CellValue value={row.plus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding: 'var(--sp-20) 0' }}>
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
              <h2 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: 'var(--sp-3)' }}>Everything you need to know about our membership plans.</p>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} className="card" style={{ padding: 'var(--sp-6) var(--sp-8)' }}>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--text-heading)' }}>{faq.q}</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--sp-6);
        }
        @media (max-width: 1100px) {
          .plans-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .plans-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .plans-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default PlansPage;
