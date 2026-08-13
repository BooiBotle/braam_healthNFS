import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send, PhoneCall, CheckCircle, MessageSquare, ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSupport = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('medium');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');

    setTimeout(() => {
      setSubmitting(false);
      setMsg('Support request submitted to Super Admin Executive Office! SLA response < 15 mins.');
      setSubject('');
      setDetails('');
      setTimeout(() => setMsg(''), 4000);
    }, 800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '850px' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Clinic Support & Assistance Hub
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Submit priority support requests directly to the Super Admin Executive Office.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Submit Ticket Form */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <MessageSquare size={20} color="#1c2340" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Submit Support Request</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Subject / Issue Summary</label>
              <input 
                type="text" required placeholder="e.g. Request for doctor credential verification"
                value={subject} onChange={e => setSubject(e.target.value)}
                style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Urgency Level</label>
              <select 
                value={priority} onChange={e => setPriority(e.target.value)}
                style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value="low">Low Priority (General Inquiry)</option>
                <option value="medium">Medium Priority (Standard Support)</option>
                <option value="high">High Priority (Urgent Operational Assistance)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Detailed Description</label>
              <textarea 
                rows={4} required placeholder="Describe your request or issue..."
                value={details} onChange={e => setDetails(e.target.value)}
                style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', resize: 'vertical' }}
              />
            </div>

            {msg && (
              <div style={{ fontSize: '0.8125rem', color: '#10b981', background: '#f0fdf4', padding: '0.625rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                {msg}
              </div>
            )}

            <button 
              type="submit" disabled={submitting}
              style={{
                padding: '0.625rem 1.25rem', borderRadius: '8px', background: '#1c2340', color: '#ffffff',
                fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem'
              }}
            >
              {submitting ? 'Submitting...' : <><Send size={16} /> Transmit Request to Super Admin</>}
            </button>
          </form>
        </div>

        {/* Contact Info & Hotlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 1rem 0' }}>Super Admin Emergency Lines</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <PhoneCall size={18} color="#c9a033" />
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>+27 10 011 0099</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>24/7 Super Admin Direct Escalation</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={18} color="#10b981" />
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>compliance@nfs.insure</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Medical Compliance & Regulatory Office</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default AdminSupport;
