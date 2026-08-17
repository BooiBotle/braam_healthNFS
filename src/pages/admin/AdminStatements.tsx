import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Search, Mail, FileText, CheckCircle, XCircle } from 'lucide-react';

const AdminStatements = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('statement_requests')
        .select(`
          id,
          status,
          created_at,
          members (
            card_number,
            profiles (first_name, last_name, sa_id_number, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching statement requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('statement_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setActionMsg(`Request marked as ${newStatus}`);
      setTimeout(() => setActionMsg(''), 3000);
      fetchRequests();
    } catch (err: any) {
      console.error(err);
      setActionMsg('Failed to update status.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const profile = req.members?.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Statement Requests
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Process member requests for emailed account statements.
          </p>
        </div>
        {actionMsg && (
          <div style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: '0.875rem', border: '1px solid #bbf7d0' }}>
            {actionMsg}
          </div>
        )}
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" placeholder="Search member name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontWeight: 600 }}>
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed / Sent</option>
        </select>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Member</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Requested On</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr> : 
             filteredRequests.length === 0 ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No requests found.</td></tr> :
             filteredRequests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.members?.profiles?.first_name} {req.members?.profiles?.last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.members?.card_number || req.members?.profiles?.sa_id_number}</div>
                </td>
                <td style={{ padding: '1rem', color: '#0f172a', fontSize: '0.875rem' }}>{req.members?.profiles?.email || 'No email provided'}</td>
                <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>{new Date(req.created_at).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: req.status === 'completed' ? '#dcfce7' : '#fef9c3', color: req.status === 'completed' ? '#15803d' : '#854d0e' }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {req.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(req.id, 'completed')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                      <CheckCircle size={14} /> Mark as Sent
                    </button>
                  )}
                  {req.status === 'completed' && (
                    <button onClick={() => handleUpdateStatus(req.id, 'pending')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                      Revert
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
export default AdminStatements;
