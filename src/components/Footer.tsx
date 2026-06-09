import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  return (
    <footer style={{
      background: 'var(--bg-surface-sunken)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative top edge gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--accent), var(--gold), transparent)',
        opacity: 0.4,
      }} />

      <div className="container" style={{ padding: 'var(--sp-16) var(--sp-6) var(--sp-8)' }}>
        
        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
          gap: 'var(--sp-10)',
          marginBottom: 'var(--sp-12)',
        }} className="footer-grid">

          {/* Brand Column */}
          <div>
            <Link to="/" style={{ 
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
              background: theme === 'dark' ? '#ffffff' : 'transparent',
              padding: theme === 'dark' ? '6px 12px' : '0',
              borderRadius: 'var(--radius-md)',
              boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              marginBottom: 'var(--sp-4)'
            }}>
              <img src="/nfs-logo.png" alt="NFS Insure" style={{ height: theme === 'dark' ? '24px' : '32px', width: 'auto' }} />
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginTop: 'var(--sp-4)', maxWidth: '320px' }}>
              Ensuring quality general practice for all. Unlimited GP consultations, dispensed medication, and health screenings — powered by Braam Health Centre.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
              marginTop: 'var(--sp-5)', padding: 'var(--sp-2) var(--sp-4)',
              background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
              fontWeight: 600, color: 'var(--accent)',
            }}>
              <Shield size={10} /> FSP No. 53910
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 'var(--sp-5)' }}>
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {[
                { to: '/plans', label: 'View Plans' },
                { to: '/apply', label: 'Apply for Membership' },
                { to: '/login', label: 'Member Portal' },
                { to: '/contact', label: 'Contact Us' },
              ].map(link => (
                <Link key={link.to} to={link.to} style={{
                  fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                  transition: 'color 200ms', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 'var(--sp-5)' }}>
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <Link to="/terms" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Terms of Service</Link>
              <Link to="/privacy" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Privacy Policy</Link>
              <Link to="/popia" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>POPIA Compliance</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 'var(--sp-5)' }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
                <MapPin size={14} color="var(--accent)" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Eagle Canyon Office Park, Randpark Ridge, Johannesburg, 2154
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                <Phone size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>+27 10 011 0010</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                <Mail size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>info@nfs.insure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 'var(--sp-6)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 'var(--sp-4)',
        }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} NFS Insure Consultant (Pty) Ltd. All rights reserved.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', opacity: 0.7 }}>
            Authorised Financial Services Provider &middot; Regulated by the FSCA
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: var(--sp-8) !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
