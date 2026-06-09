import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PrivacyPage = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      <section style={{ background: 'var(--hero-gradient)', paddingBottom: 'var(--sp-16)' }}>
        <div className="container">
          <Navbar />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: 'center', paddingTop: 'var(--sp-8)' }}>
            <h1 style={{ fontSize: 'var(--text-4xl)', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--sp-3)' }}>POPIA Compliant &middot; Last updated: June 2026</p>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: 'var(--sp-16) 0' }}>
        <div className="container-narrow">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="card" style={{ padding: 'var(--sp-10)', lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>Information Collection</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>We collect personal information necessary for providing healthcare services, including identification numbers, medical history, contact details, and financial information for billing purposes. All data is collected with your explicit consent in compliance with the Protection of Personal Information Act (POPIA).</p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>Data Usage</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>Your data is used strictly for medical record keeping, appointment scheduling, membership billing, and legal compliance. We do not sell, share, or distribute your personal data to any third parties for marketing purposes.</p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>Data Security</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>We implement industry-standard security measures including encryption at rest and in transit, role-based access controls, and regular security audits to protect your medical and personal records against unauthorized access, alteration, or disclosure.</p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>Your Rights</h2>
            <p>Under POPIA, you have the right to access, correct, or delete your personal information at any time. To exercise these rights, contact our Information Officer at <span style={{ color: 'var(--accent)', fontWeight: 600 }}>info@nfs.insure</span>.</p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PrivacyPage;

