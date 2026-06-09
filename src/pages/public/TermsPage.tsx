import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TermsPage = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      <section style={{ background: 'var(--hero-gradient)', paddingBottom: 'var(--sp-16)' }}>
        <div className="container">
          <Navbar />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: 'center', paddingTop: 'var(--sp-8)' }}>
            <h1 style={{ fontSize: 'var(--text-4xl)', letterSpacing: '-0.02em' }}>Terms of Service</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--sp-3)' }}>Last updated: June 2026</p>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: 'var(--sp-16) 0' }}>
        <div className="container-narrow">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="card" style={{ padding: 'var(--sp-10)', lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service. These terms apply to all visitors, users, and members of the platform.</p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>2. Membership Plans</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>Our primary healthcare membership plans provide access to general practitioner consultations and basic dispensed medication as outlined in the selected tier. This is not a medical aid scheme and does not cover hospitalisation, specialists, or emergency ambulance services.</p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>3. Payment and Billing</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>Membership fees are collected via monthly debit order or card payment. Failed payments may result in immediate suspension of benefits until the outstanding balance is settled. All fees are quoted in South African Rand (ZAR).</p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>4. Cancellation</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>You may cancel your membership at any time with one calendar month's notice via the member portal or by contacting our administration team. No penalty fees will be charged for cancellation.</p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>5. Limitation of Liability</h2>
            <p>NFS Insure Consultant (Pty) Ltd and Braam Health Centre shall not be held liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the services. Our total liability shall not exceed the amount paid by you during the preceding 12-month period.</p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TermsPage;

