import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // We should only allow access if there's a valid session (Supabase auto-logs them in via the email link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Your password reset link is invalid or has expired. Please request a new one.');
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
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
      {/* Background with abstract shapes */}
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
          <div style={{ width: '48px', height: '48px', background: 'var(--navy)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--sp-6)' }}>
            <ShieldCheck size={28} color="var(--gold)" />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-heading)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-2)' }}>
            Update Password
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter your new secure password below.
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
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-2)' }}>Password Updated!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
                Your password has been changed successfully. Redirecting to portal...
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    style={{ paddingLeft: '44px', height: '48px' }}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Type your password again"
                    style={{ paddingLeft: '44px', height: '48px' }}
                    required
                    minLength={8}
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
                disabled={loading || !!error.includes('expired')}
                style={{ width: '100%', height: '48px', justifyContent: 'center', marginTop: 'var(--sp-2)' }}
              >
                {loading ? 'Updating...' : (
                  <>Save Password <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;



