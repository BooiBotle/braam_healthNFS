import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as any } },
};

const ContactPage = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      <section style={{ background: 'var(--hero-gradient)', paddingBottom: 'var(--sp-20)' }}>
        <div className="container">
          <Navbar />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: 'center', paddingTop: 'var(--sp-8)', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 'var(--text-4xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-3)' }}>
              Get in <span className="text-gradient">touch</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)' }}>
              Have a question or need assistance? We're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: 'var(--sp-20) 0' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: 'var(--sp-10)' }}>
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--sp-6)' }}>Contact Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                {[
                  { icon: <Phone size={18} />, label: 'Phone / WhatsApp', value: '+27 10 011 0010' },
                  { icon: <Mail size={18} />, label: 'Email', value: 'info@nfs.insure' },
                  { icon: <Clock size={18} />, label: 'Operating Hours', value: 'Mon – Fri: 08:00 – 17:00\nSat: 09:00 – 13:00' },
                  { icon: <MapPin size={18} />, label: 'Address', value: 'Braam Health Centre\nEagle Canyon Office Park\nRandpark Ridge, Johannesburg, 2154' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)', flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--sp-1)' }}>{item.label}</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-heading)', fontWeight: 500, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 'var(--sp-8)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-6)' }}>Send a Message</h2>
              <form>
                <div className="grid-2" style={{ gap: 'var(--sp-4)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-input" placeholder="John" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-input" placeholder="Doe" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-input" placeholder="How can we help?" />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows={4} placeholder="Tell us more..."></textarea>
                </div>
                <button type="button" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactPage;



