import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPasswordForEmail } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    const { error: resetError } = await resetPasswordForEmail(email);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--sp-4)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background with abstract shapes, matching Apply/Login pages */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0) 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%', width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(10,25,47,0.05) 0%, rgba(10,25,47,0) 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: 'var(--sp-6)' }}>
             {/* If dark mode needs specific logo handle it, for now use standard */}
             <div style={{ width: '48px', height: '48px', background: 'var(--navy)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
               <ShieldCheck size={28} color="var(--gold)" />
             </div>
          </Link>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-heading)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-2)' }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter your email to receive a password reset link and OTP code.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
          style={{ padding: 'var(--sp-8)', backdropFilter: 'blur(20px)', background: 'var(--bg-surface-glass)', border: '1px solid var(--border)' }}
        >
          {success ? (
            <div style={{ textAlign: 'center', padding: 'var(--sp-4) 0' }}>
              <CheckCircle size={48} color="var(--status-success)" style={{ margin: '0 auto var(--sp-4)' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-2)' }}>Check Your Email</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
                We've sent password reset instructions and an OTP to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{ paddingLeft: '44px', height: '48px' }}
                    required
                  />
                </div>
              </div>

              {error && (
                <div style={{ padding: 'var(--sp-3)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', height: '48px', justifyContent: 'center', marginTop: 'var(--sp-2)' }}
              >
                {loading ? 'Sending Request...' : (
                  <>Send Reset Instructions <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: 'var(--sp-8)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: 'var(--navy)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;


