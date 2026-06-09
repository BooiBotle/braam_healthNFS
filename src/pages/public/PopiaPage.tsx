import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PopiaPage = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      <section style={{ background: 'var(--hero-gradient)', paddingBottom: 'var(--sp-16)' }}>
        <div className="container">
          <Navbar />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: 'center', paddingTop: 'var(--sp-8)' }}>
            <h1 style={{ fontSize: 'var(--text-4xl)', letterSpacing: '-0.02em' }}>POPIA Compliance Statement</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--sp-3)' }}>Protection of Personal Information Act &middot; Braam Health Centre</p>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: 'var(--sp-16) 0' }}>
        <div className="container-narrow">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="card" style={{ padding: 'var(--sp-10)', lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>1. Introduction</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>
              NFS Insure Consultant (Pty) Ltd t/a Braam Health Centre ("we", "us", or "our") respects your privacy and is committed to protecting your personal information. This statement explains how we process personal data in compliance with the Protection of Personal Information Act 4 of 2013 (POPIA) of South Africa.
            </p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>2. Collection of Personal Information</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>
              We collect personal information directly from you when you apply for membership, book a consultation, or interact with our portal. This includes your name, ID number, contact details, medical history, and billing information. We only collect information that is reasonably necessary for us to provide our healthcare and membership services.
            </p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>3. Purpose of Processing</h2>
            <ul style={{ marginBottom: 'var(--sp-6)', paddingLeft: 'var(--sp-5)', listStyleType: 'disc' }}>
              <li style={{ marginBottom: 'var(--sp-2)' }}>Providing general practice medical consultations and dispensing medication.</li>
              <li style={{ marginBottom: 'var(--sp-2)' }}>Managing your Braam Health Centre membership and maintaining your digital profile.</li>
              <li style={{ marginBottom: 'var(--sp-2)' }}>Processing debit orders and financial transactions.</li>
              <li style={{ marginBottom: 'var(--sp-2)' }}>Communicating important account updates and medical follow-ups.</li>
              <li>Complying with statutory and regulatory reporting requirements.</li>
            </ul>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>4. Information Sharing</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>
              We treat your medical and personal records with the strictest confidentiality. We do not sell your personal information. We may share your data with trusted third-party service providers (such as payment gateways or specialized pathology labs) only when necessary to fulfill our services to you, and subject to strict confidentiality agreements.
            </p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>5. Security Safeguards</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>
              We have implemented robust technical and organizational measures to secure your data against unauthorized access, loss, or destruction. This includes encrypted databases, secure cloud storage, and strict access controls for our clinic staff.
            </p>

            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', marginBottom: 'var(--sp-4)' }}>6. Your Rights</h2>
            <p style={{ marginBottom: 'var(--sp-6)' }}>
              Under POPIA, you have the right to request access to your personal information, request corrections or deletion of inaccurate data, and object to the processing of your data. To exercise these rights, please contact our Information Officer.
            </p>

            <div style={{ background: 'var(--bg-surface-sunken)', padding: 'var(--sp-6)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--sp-8)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>Information Officer Contact Details</h3>
              <p style={{ marginBottom: 'var(--sp-1)' }}><strong>Email:</strong> <a href="mailto:info@nfs.insure" style={{ color: 'var(--accent)', fontWeight: 600 }}>info@nfs.insure</a></p>
              <p><strong>Physical Address:</strong> Eagle Canyon Office Park, Randpark Ridge, Johannesburg, 2154</p>
            </div>

          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PopiaPage;

