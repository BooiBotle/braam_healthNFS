import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminSystemUsers = () => {
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchSystemUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSystemUsers(data || []);
    } catch (err) {
      console.error('Error fetching system users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchSystemUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ portal_role: newRole })
        .eq('id', userId);
      if (error) throw error;
      setSystemUsers(prev => prev.map(u => u.id === userId ? { ...u, portal_role: newRole } : u));
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);
      if (error) throw error;
      setSystemUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link 
          to="/admin" 
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '12px',
            background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0',
            textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            System Users Directory
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Manage access levels and status for all registered profiles.
          </p>
        </div>
      </div>

      <div style={{ 
        background: '#fff', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', border: '1px solid #e2e8f0'
      }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.625rem', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)', color: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(28,35,64,0.2)' }}>
              <Shield size={20} />
            </div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>Global Access Control</div>
          </div>
        </div>

        <div style={{ padding: '0', overflowX: 'auto', background: '#fff' }}>
          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Activity size={32} color="var(--navy)" />
              </motion.div>
              <span style={{ fontWeight: 600 }}>Loading system users...</span>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '1rem 2rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>User details</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Role assignment</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Account Status</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: 600, textAlign: 'right', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {systemUsers.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: idx === systemUsers.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                        {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unnamed User'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '4px' }}>
                        {u.email || u.phone || 'No contact info'}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <select 
                        value={u.portal_role || 'member'}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        style={{ 
                          padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem', background: '#fff', fontWeight: 600, color: '#0f172a',
                          cursor: 'pointer', outline: 'none'
                        }}
                      >
                        <option value="member">Member</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                        background: u.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: u.is_active ? '#10b981' : '#ef4444', textTransform: 'uppercase'
                      }}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                        style={{ 
                          padding: '0.375rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0',
                          background: u.is_active ? '#fff' : '#10b981', 
                          color: u.is_active ? '#ef4444' : '#fff',
                          fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: u.is_active ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        {u.is_active ? 'Disable Access' : 'Enable Access'}
                      </button>
                    </td>
                  </tr>
                ))}
                {systemUsers.length === 0 && !loadingUsers && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      No system users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSystemUsers;
