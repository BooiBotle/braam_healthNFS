import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Search, CheckCircle, XCircle, RefreshCw, Zap, 
  DollarSign, Check, X, Shield, Download, Filter
} from 'lucide-react';

const AdminDebitOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('debit_orders')
        .select(`
          id,
          amount_cents,
          collection_date,
          status,
          failure_reason,
          members (
            id,
            profiles (first_name, last_name, sa_id_number, phone)
          ),
          plans (name)
        `)
        .order('collection_date', { ascending: false });

      if (user?.clinicId) {
        query = query.eq('clinic_id', user.clinicId);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching debit orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Status Updater for a single record
  const updateSingleStatus = async (orderId: string, newStatus: 'processed' | 'failed' | 'pending') => {
    try {
      const { error } = await supabase
        .from('debit_orders')
        .update({
          status: newStatus,
          processed_at: newStatus === 'processed' ? new Date().toISOString() : null,
          reconciled: newStatus === 'processed',
          reconciled_at: newStatus === 'processed' ? new Date().toISOString() : null
        })
        .eq('id', orderId);

      if (error) throw error;

      setActionMsg(`Order updated to ${newStatus.toUpperCase()}!`);
      fetchOrders();
      setTimeout(() => setActionMsg(''), 2500);
    } catch (err: any) {
      console.error('Reconciliation error:', err);
      setActionMsg('Failed to update status.');
    }
  };

  // 1-Click Bulk Action for all selected checkboxes
  const handleBulkUpdate = async (newStatus: 'processed' | 'failed') => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase
        .from('debit_orders')
        .update({
          status: newStatus,
          processed_at: newStatus === 'processed' ? new Date().toISOString() : null,
          reconciled: newStatus === 'processed',
          reconciled_at: newStatus === 'processed' ? new Date().toISOString() : null
        })
        .in('id', selectedIds);

      if (error) throw error;

      setActionMsg(`Successfully reconciled ${selectedIds.length} orders to ${newStatus.toUpperCase()}!`);
      setSelectedIds([]);
      fetchOrders();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err: any) {
      console.error('Bulk update error:', err);
      setActionMsg('Bulk reconciliation failed.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredOrders = orders.filter(order => {
    const profile = order.members?.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
    const idNum = profile?.sa_id_number || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || idNum.includes(query);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1200px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Zap size={20} color="#c9a033" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              1-Click Rapid Reconciliation Hub
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Ultra-fast manual payment entry and debit order status updates for clinic staff.
          </p>
        </div>

        {/* Action feedback alert */}
        {actionMsg && (
          <div style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: '0.875rem', border: '1px solid #bbf7d0' }}>
            {actionMsg}
          </div>
        )}
      </div>

      {/* 1-Click Bulk Action Bar */}
      <div style={{
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '1rem 1.25rem', marginBottom: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search member name or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
            />
          </div>

          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontWeight: 600 }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processed">Paid / Processed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Bulk Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
            {selectedIds.length} Selected
          </span>

          <button 
            onClick={() => handleBulkUpdate('processed')}
            disabled={selectedIds.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: selectedIds.length > 0 ? '#10b981' : '#cbd5e1',
              color: '#ffffff', fontWeight: 700, fontSize: '0.8125rem',
              border: 'none', cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            <CheckCircle size={16} /> Mark Selected Paid
          </button>

          <button 
            onClick={() => handleBulkUpdate('failed')}
            disabled={selectedIds.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: selectedIds.length > 0 ? '#ef4444' : '#cbd5e1',
              color: '#ffffff', fontWeight: 700, fontSize: '0.8125rem',
              border: 'none', cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            <XCircle size={16} /> Mark Selected Failed
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.875rem 1rem', width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Member Name</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Plan</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Due Date</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>1-Click Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading records...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No debit orders found matching criteria.</td></tr>
            ) : (
              filteredOrders.map(order => {
                const profile = order.members?.profiles;
                const isPaid = order.status === 'processed' || order.status === 'success';
                const isFailed = order.status === 'failed';

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                      />
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                        {profile ? `${profile.first_name} ${profile.last_name}` : 'Member Account'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{profile?.sa_id_number || 'SA ID'}</div>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#334155', fontWeight: 500 }}>
                      {order.plans?.name || 'Standard'}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                      R {(order.amount_cents / 100).toFixed(2)}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                      {new Date(order.collection_date).toLocaleDateString('en-ZA')}
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem', borderRadius: '20px', fontSize: '0.6875rem', fontWeight: 700,
                        background: isPaid ? '#dcfce7' : isFailed ? '#fee2e2' : '#fef9c3',
                        color: isPaid ? '#15803d' : isFailed ? '#b91c1c' : '#854d0e'
                      }}>
                        {isPaid ? 'PAID' : isFailed ? 'FAILED' : 'PENDING'}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        {!isPaid && (
                          <button 
                            onClick={() => updateSingleStatus(order.id, 'processed')}
                            style={{
                              padding: '0.375rem 0.75rem', borderRadius: '6px',
                              background: '#10b981', color: '#ffffff', border: 'none',
                              fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Mark Paid
                          </button>
                        )}
                        {!isFailed && (
                          <button 
                            onClick={() => updateSingleStatus(order.id, 'failed')}
                            style={{
                              padding: '0.375rem 0.75rem', borderRadius: '6px',
                              background: '#f87171', color: '#ffffff', border: 'none',
                              fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Mark Failed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </motion.div>
  );
};

export default AdminDebitOrders;
