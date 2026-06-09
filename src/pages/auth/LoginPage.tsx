import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, User, FileText, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const LoginPage = () => {
  
  const { loginWithOtp, verifyOtp, signInWithPassword, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/member');
    }
  }, [user, navigate]);

  const [role, setRole] = useState<'member' | 'staff' | 'admin'>('member');
  const [authMethod, setAuthMethod] = useState<'magic' | 'password'>('magic');

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [password, setPassword] = useState('');
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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError('');
    const { error } = await signInWithPassword(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    setError('Google login will be enabled once configured in Supabase Auth.');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>

      {/* LEFT PANEL — Branding */}
      <div className="desktop-only" style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 100%)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Abstract glows */}
        <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '500px', height: '500px', background: 'var(--gold)', filter: 'blur(180px)', opacity: 0.15, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '400px', height: '400px', background: 'var(--navy-lighter)', filter: 'blur(160px)', opacity: 0.3, borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', padding: 'var(--sp-12)' }}>
          {/* Logo */}
          <Link to="/" style={{ 
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            background: '#ffffff',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            width: 'fit-content',
          }}>
            <img src="/nfs-logo.png" alt="NFS Insure" style={{ height: '32px', width: 'auto' }} />
          </Link>

          {/* Center content */}
          <div style={{ margin: 'auto 0' }}>
            <h1 style={{ fontSize: 'var(--text-5xl)', color: 'white', fontWeight: 800, lineHeight: 1.1, marginBottom: 'var(--sp-5)', letterSpacing: '-0.03em' }}>
              Your secure <br/>portal to <br/>
              <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, var(--gold) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                better health.
              </span>
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.55)', maxWidth: '400px', lineHeight: 1.7 }}>
              Access your medical records, track benefits, manage dependants, and view your digital membership card — all from one dashboard.
            </p>
          </div>

          {/* Bottom */}
          <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 'var(--text-xs)' }}>
            <span>&copy; {new Date().getFullYear()} NFS Insure</span>
            <span>•</span>
            <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.35)' }}>Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" style={{ color: 'rgba(255,255,255,0.35)' }}>Terms</Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: 'var(--sp-8)', position: 'relative',
        minWidth: 0, maxWidth: '560px',
      }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', width: 'fit-content' }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div style={{ margin: 'auto 0', width: '100%', maxWidth: '380px', alignSelf: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* Header */}
            <div style={{ marginBottom: 'var(--sp-8)' }}>
              <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-1)', letterSpacing: '-0.02em' }}>Welcome back</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Sign in to access your portal.</p>
            </div>

            {/* Role Switcher — 3 roles */}
            <div className="role-switcher" style={{ marginBottom: 'var(--sp-6)' }}>
              <button className={role === 'member' ? 'active' : ''} onClick={() => { setRole('member'); setAuthMethod('magic'); setError(''); }}>
                <User size={12} /> Member
              </button>
              <button className={role === 'staff' ? 'active' : ''} onClick={() => { setRole('staff'); setAuthMethod('password'); setError(''); }}>
                <FileText size={12} /> Staff
              </button>
              <button className={role === 'admin' ? 'active' : ''} onClick={() => { setRole('admin'); setAuthMethod('password'); setError(''); }}>
                <ShieldCheck size={12} /> Admin
              </button>
            </div>

            {/* Auth Method Tabs (Members get choice, Staff/Admin forced to password) */}
            {role === 'member' && (
              <div className="auth-tabs">
                <button className={`auth-tab ${authMethod === 'magic' ? 'active' : ''}`} onClick={() => { setAuthMethod('magic'); setError(''); }}>
                  Magic Link
                </button>
                <button className={`auth-tab ${authMethod === 'password' ? 'active' : ''}`} onClick={() => { setAuthMethod('password'); setError(''); }}>
                  Password
                </button>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                    padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-4)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAGIC LINK FORM */}
            {authMethod === 'magic' ? (
              !otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: 'var(--sp-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 'var(--sp-3)' }}>
                    {loading ? 'Sending link...' : 'Continue with Email'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div className="form-group">
                    <label className="form-label">Verification Code</label>
                    <input type="text" className="form-input" style={{ textAlign: 'center', letterSpacing: '6px', fontWeight: 700 }} placeholder="------" value={token} onChange={e => setToken(e.target.value)} required />
                    <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>Code sent to {email}</p>
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 'var(--sp-3)' }}>
                    {loading ? 'Verifying...' : 'Sign In'}
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--sp-2)' }}>
                    Cancel
                  </button>
                </form>
              )
            ) : (
              /* PASSWORD FORM (Staff / Admin / Member-password) */
              <form onSubmit={handlePasswordLogin}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: 'var(--sp-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="form-label">Password</label>
                    <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Forgot?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Key size={14} style={{ position: 'absolute', left: 'var(--sp-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="password" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 'var(--sp-3)' }}>
                  {loading ? 'Signing in...' : `Sign In as ${role === 'admin' ? 'Admin' : 'Staff'}`}
                </button>
              </form>
            )}

            {/* Google OAuth (members only) */}
            {role === 'member' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', margin: 'var(--sp-6) 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>
                <button onClick={handleGoogleLogin} className="btn btn-outline" style={{ width: '100%', padding: 'var(--sp-3)' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', marginRight: '6px', background: 'linear-gradient(135deg, #EA4335, #FBBC05, #34A853, #4285F4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G</span>
                  Continue with Google
                </button>
              </>
            )}

            {/* Footer link */}
            {role === 'member' && (
              <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--sp-8)' }}>
                Don't have an account? <Link to="/apply" style={{ color: 'var(--accent)', fontWeight: 600 }}>Apply here</Link>
              </p>
            )}

            {(role === 'staff' || role === 'admin') && (
              <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-8)', lineHeight: 1.6 }}>
                {role === 'admin' ? 'Admin' : 'Staff'} accounts are provisioned by the clinic administrator. <br/>
                Contact <span style={{ color: 'var(--accent)' }}>info@nfs.insure</span> for assistance.
              </p>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;







