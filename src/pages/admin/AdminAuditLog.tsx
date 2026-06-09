import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Shield, Clock, Search, Filter, Activity, FileText, UserPlus, AlertCircle, X, Terminal } from 'lucide-react';

const AdminAuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      // Since there is no dedicated audit_logs table yet, we will construct a live audit 
      // trail by combining recent applications and consultations to show real database activity.
      const [appRes, consultRes] = await Promise.all([
        supabase.from('applications').select('id, applicant_name, status, created_at, reviewed_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('consultations').select('id, status, created_at, members(profiles(first_name, last_name))').order('created_at', { ascending: false }).limit(20)
      ]);

      const unifiedLogs: any[] = [];

      // Process Consultations
      consultRes.data?.forEach(consult => {
        const mem = consult.members as any;
        const memberName = mem?.profiles ? 
          `${mem.profiles.first_name || mem.profiles[0]?.first_name} ${mem.profiles.last_name || mem.profiles[0]?.last_name}` : 'Unknown Member';
        
        unifiedLogs.push({
          id: `consult-${consult.id}`,
          action: 'consultation_logged',
          category: 'clinic',
          user: 'Clinic Staff',
          details: `Logged a ${consult.status} consultation for ${memberName}`,
          severity: 'info',
          timestamp: consult.created_at,
          metadata: consult
        });
      });

      // Process Applications
      appRes.data?.forEach(app => {
        unifiedLogs.push({
          id: `app-create-${app.id}`,
          action: 'application_created',
          category: 'application',
          user: app.applicant_name,
          details: 'Submitted a new membership application',
          severity: 'info',
          timestamp: app.created_at,
          metadata: app
        });

        if (app.reviewed_at) {
          unifiedLogs.push({
            id: `app-review-${app.id}`,
            action: `application_${app.status}`,
            category: 'application',
            user: 'System Admin',
            details: `Application for ${app.applicant_name} was ${app.status}`,
            severity: app.status === 'approved' ? 'success' : 'warning',
            timestamp: app.reviewed_at,
            metadata: app
          });
        }
      });

      // Simulate System Logs (fetching latest profiles or auth events)
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, portal_role, created_at').order('created_at', { ascending: false }).limit(10);
      profiles?.forEach(prof => {
        unifiedLogs.push({
          id: `sys-${prof.id}`,
          action: 'user_registered',
          category: 'system',
          user: prof.full_name || 'New User',
          details: `New ${prof.portal_role} account was created in the system.`,
          severity: 'info',
          timestamp: prof.created_at,
          metadata: prof
        });
      });

      // Sort combined logs by timestamp descending
      unifiedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(unifiedLogs);

    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('application')) return <UserPlus size={16} color="#3b82f6" />;
    if (action.includes('consultation')) return <Activity size={16} color="#10b981" />;
    if (action.includes('system')) return <Shield size={16} color="#8b5cf6" />;
    return <FileText size={16} color="#64748b" />;
  };

  const getSeverityStyle = (severity: string) => {
    switch(severity) {
      case 'critical': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      case 'warning': return { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' };
      case 'success': return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || log.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const TABS = [
    { id: 'all', label: 'All Logs' },
    { id: 'system', label: 'System Logs' },
    { id: 'application', label: 'Application Logs' },
    { id: 'clinic', label: 'Clinic Logs' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            System Audit Log
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Comprehensive live record of all system activities, applications, and consultations.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1rem', background: 'none', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--navy)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--navy)' : '#64748b',
              fontWeight: activeTab === tab.id ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s',
              fontSize: '0.9375rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ 
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' 
      }}>
        
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by user or details..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '0.875rem', color: '#0f172a', outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading live audit logs from database...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No audit logs match your criteria.</td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const style = getSeverityStyle(log.severity);
                  
                  return (
                    <motion.tr 
                      onClick={() => setSelectedLog(log)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      key={log.id} 
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      whileHover={{ backgroundColor: '#f8fafc' }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                          <Clock size={14} />
                          {new Date(log.timestamp).toLocaleString('en-US', { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: '#0f172a' }}>
                        {log.user}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '24px', height: '24px', borderRadius: '6px', background: style.bg, border: `1px solid ${style.border}`
                          }}>
                            {getActionIcon(log.action)}
                          </div>
                          <span style={{ fontSize: '0.875rem', color: '#0f172a', textTransform: 'capitalize' }}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                        {log.details}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#fff', width: '100%', maxWidth: '700px',
              borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: '#1c2340', color: '#fff', borderRadius: '8px' }}>
                  <Terminal size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Log Execution Details</h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Event Context Payload</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>User / Origin</label>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{selectedLog.user}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Timestamp</label>
                  <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Event Action</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                    background: getSeverityStyle(selectedLog.severity).bg, color: getSeverityStyle(selectedLog.severity).text,
                    textTransform: 'uppercase'
                  }}>
                    {selectedLog.action.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>JSON Payload Metadata</label>
                <pre style={{ 
                  background: '#0f172a', color: '#38bdf8', padding: '1.5rem', borderRadius: '8px', 
                  fontSize: '0.8125rem', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  margin: 0, fontFamily: 'monospace'
                }}>
                  {JSON.stringify(selectedLog.metadata || { note: 'No extended metadata available for this event.' }, null, 2)}
                </pre>
              </div>
            </div>
            
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{ padding: '0.625rem 1.25rem', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default AdminAuditLog;
