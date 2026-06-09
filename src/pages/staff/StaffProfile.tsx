import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Shield, Key, Moon, Sun, Monitor, CheckCircle, AlertCircle } from 'lucide-react';
import EditableProfile from '../../components/EditableProfile';
import { supabase } from '../../lib/supabase';

const StaffProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  
  // Security State
  const [password, setPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Preference State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    
    setIsUpdatingPassword(true);
    setPasswordMessage(null);
    
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setPasswordMessage({ type: 'error', text: error.message });
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassword('');
      setTimeout(() => setPasswordMessage(null), 3000);
    }
    setIsUpdatingPassword(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header Profile Summary */}
      <div className="card" style={{ padding: 'var(--sp-8)', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--navy)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-3xl)', fontWeight: 700 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', margin: 0, color: 'var(--text-heading)' }}>
            {user?.name}
          </h1>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-1)' }}>
            <span className="section-badge section-badge-gold">{user?.role?.toUpperCase()}</span>
            <span>Braam Health Centre</span>
          </div>
        </div>
      </div>

      <div className="responsive-grid-profile">
        
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <button 
            onClick={() => setActiveTab('personal')}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)',
              background: activeTab === 'personal' ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === 'personal' ? 'var(--navy)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'personal' ? 600 : 500,
              transition: 'all 0.2s ease'
            }}
          >
            <User size={18} /> Personal Details
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)',
              background: activeTab === 'security' ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === 'security' ? 'var(--navy)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'security' ? 600 : 500,
              transition: 'all 0.2s ease'
            }}
          >
            <Shield size={18} /> Security
          </button>
          
          <button 
            onClick={() => setActiveTab('preferences')}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)',
              background: activeTab === 'preferences' ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === 'preferences' ? 'var(--navy)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'preferences' ? 600 : 500,
              transition: 'all 0.2s ease'
            }}
          >
            <Bell size={18} /> Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div>
          <AnimatePresence mode="wait">
            
            {activeTab === 'personal' && (
              <motion.div key="personal" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <EditableProfile />
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="card" style={{ padding: 'var(--sp-8)' }}>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--sp-2)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <Shield size={24} color="var(--gold)" />
                  Password & Security
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-8)' }}>Update your password to keep your account secure.</p>
                
                {passwordMessage && (
                  <div style={{ padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', backgroundColor: passwordMessage.type === 'success' ? 'rgba(34, 160, 107, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: passwordMessage.type === 'success' ? 'var(--status-success)' : 'var(--status-error)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {passwordMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Key size={14} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="password" placeholder="Min. 6 characters" className="form-input" style={{ paddingLeft: '2.5rem' }} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isUpdatingPassword || !password}>
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div key="preferences" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                
                <div className="card" style={{ padding: 'var(--sp-8)', marginBottom: 'var(--sp-6)' }}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <Monitor size={20} color="var(--navy)" /> Theme
                  </h2>
                  <div className="responsive-flex">
                    <button onClick={() => toggleTheme('light')} style={{ flex: 1, padding: 'var(--sp-6)', borderRadius: 'var(--radius-lg)', border: theme === 'light' ? '2px solid var(--gold)' : '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <Sun size={32} color={theme === 'light' ? 'var(--gold)' : 'var(--text-muted)'} />
                      <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Light Mode</span>
                    </button>
                    <button onClick={() => toggleTheme('dark')} style={{ flex: 1, padding: 'var(--sp-6)', borderRadius: 'var(--radius-lg)', border: theme === 'dark' ? '2px solid var(--gold)' : '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <Moon size={32} color={theme === 'dark' ? 'var(--gold)' : 'var(--text-muted)'} />
                      <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Dark Mode</span>
                    </button>
                  </div>
                </div>

                <div className="card" style={{ padding: 'var(--sp-8)' }}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <Bell size={20} color="var(--navy)" /> Notifications
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>Email Notifications</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Receive daily summaries and critical alerts via email.</div>
                      </div>
                      <div 
                        onClick={() => setEmailAlerts(!emailAlerts)}
                        style={{ width: '44px', height: '24px', background: emailAlerts ? 'var(--gold)' : 'var(--border-strong)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease' }}
                      >
                        <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: emailAlerts ? '22px' : '2px', transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>SMS Alerts</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Get instant text messages for urgent clinic updates.</div>
                      </div>
                      <div 
                        onClick={() => setSmsAlerts(!smsAlerts)}
                        style={{ width: '44px', height: '24px', background: smsAlerts ? 'var(--gold)' : 'var(--border-strong)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease' }}
                      >
                        <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: smsAlerts ? '22px' : '2px', transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default StaffProfile;





