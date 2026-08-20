import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Heart, Stethoscope, Briefcase, Pill, User, X, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getActiveClinics, getPlansForClinic, type Clinic, type ClinicPlan } from '../../lib/api/clinics';
import PlansCarousel from '../../components/PlansCarousel';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as any } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

type Plan = ClinicPlan;

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
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinics() {
      const activeClinics = await getActiveClinics();
      setClinics(activeClinics);
      if (activeClinics.length > 0) {
        setSelectedClinicId(activeClinics[0].id);
      } else {
        setLoading(false);
      }
    }
    fetchClinics();
  }, []);

  useEffect(() => {
    async function loadPlans() {
      if (!selectedClinicId) return;
      setLoading(true);
      const data = await getPlansForClinic(selectedClinicId);
      setPlans(data || []);
      setLoading(false);
    }
    loadPlans();
  }, [selectedClinicId]);

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
              {selectedClinicId 
                ? `All plans include GP consultations at ${clinics.find(c => c.id === selectedClinicId)?.name || 'our network clinics'}. Cancel anytime — no lock-in contracts, no hidden fees.`
                : `All plans include GP consultations at our network clinics. Cancel anytime — no lock-in contracts, no hidden fees.`}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Plans Grid */}
      <section style={{ padding: 'var(--sp-20) 0' }}>
        <div className="container">
          
          {/* Clinic Selector */}
          {clinics.length > 0 && (
            <div style={{ marginBottom: 'var(--sp-12)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 'var(--sp-4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Select Your Clinic
              </label>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center', background: 'var(--bg-surface-sunken)', padding: '6px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                {clinics.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClinicId(c.id)}
                    style={{
                      padding: '10px 20px', borderRadius: 'var(--radius-lg)',
                      border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-sm)',
                      display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                      background: selectedClinicId === c.id ? 'var(--accent)' : 'transparent',
                      color: selectedClinicId === c.id ? '#fff' : 'var(--text-secondary)',
                      boxShadow: selectedClinicId === c.id ? '0 4px 12px var(--accent-subtle)' : 'none',
                    }}
                  >
                    <MapPin size={16} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--sp-10)' }}>Loading plans...</div>
          ) : plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--text-muted)' }}>
              No plans available for this clinic.
            </div>
          ) : (
            <PlansCarousel plans={plans} />
          )}
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



