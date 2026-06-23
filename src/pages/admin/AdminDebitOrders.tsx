import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { Search, Wallet, Download, RefreshCcw, AlertCircle, User, Shield, CreditCard, Activity, Calendar } from 'lucide-react';
const AdminDebitOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

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
          retry_count,
          members (
            profiles (first_name, last_name, sa_id_number)
          ),
          plans (name)
        `)
        .order('collection_date', { ascending: false });

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

  const filteredOrders = orders.filter(order => {
    const profile = order.members?.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
    const idNum = profile?.sa_id_number || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || idNum.includes(query);
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return { bg: '#fef9c3', text: '#854d0e' };
      case 'success': return { bg: '#f0fdf4', text: '#15803d' };
      case 'failed': return { bg: '#fef2f2', text: '#b91c1c' };
      case 'reversed': return { bg: '#fff7ed', text: '#c2410c' };
      case 'cancelled': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <>
      <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Debit Orders
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage monthly collections and track failed payments.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '8px', 
              background: '#ffffff', color: '#0f172a', 
              border: '1px solid #e2e8f0', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Download size={16} /> Export Batches
          </button>
          
          <button 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '8px', 
              background: '#1c2340', color: '#ffffff', 
              border: 'none', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <RefreshCcw size={16} /> Retry Failed
          </button>
        </div>
      </div>

      <div style={{ 
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' 
      }}>
        
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by member name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '0.875rem', color: '#0f172a', outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'pending', 'success', 'failed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px',
                  background: statusFilter === status ? '#1c2340' : '#f8fafc',
                  color: statusFilter === status ? '#ffffff' : '#64748b',
                  border: statusFilter === status ? '1px solid #1c2340' : '1px solid #e2e8f0',
                  fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading debit orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Wallet size={32} color="#cbd5e1" />
                      <span>No debit orders found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const colors = getStatusColor(order.status);
                  const profile = order.members?.profiles;
                  
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {new Date(order.collection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>
                          {profile?.first_name} {profile?.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          ID: {profile?.sa_id_number || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {order.plans?.name || 'Unknown Plan'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                        R {(order.amount_cents / 100).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span style={{ 
                            padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            background: colors.bg,
                            color: colors.text,
                            textTransform: 'capitalize',
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            {order.status === 'failed' && <AlertCircle size={12} />}
                            {order.status}
                          </span>
                          {order.status === 'failed' && order.retry_count > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>Retry {order.retry_count}/3</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0.375rem 0.75rem', borderRadius: '6px', 
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
                            fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </motion.div>

      <Modal 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Debit Order Details"
        maxWidth="600px"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: selectedOrder.status === 'success' ? '#dcfce7' : selectedOrder.status === 'failed' ? '#fee2e2' : '#f1f5f9', 
                color: selectedOrder.status === 'success' ? '#16a34a' : selectedOrder.status === 'failed' ? '#ef4444' : '#64748b', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 600
              }}>
                <Wallet size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  R {(selectedOrder.amount_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Collected on {new Date(selectedOrder.collection_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> Member Name
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedOrder.members?.profiles?.first_name} {selectedOrder.members?.profiles?.last_name}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Shield size={14} /> Plan Name
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedOrder.plans?.name || 'Unknown Plan'}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Activity size={14} /> Status
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500, textTransform: 'capitalize' }}>
                  {selectedOrder.status.replace('_', ' ')}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <RefreshCcw size={14} /> Retries
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {selectedOrder.retry_count} / 3
                </div>
              </div>
            </div>

            {selectedOrder.status === 'failed' && (
              <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <AlertCircle size={14} /> Failure Reason
                </div>
                <div style={{ color: '#991b1b', fontWeight: 500, lineHeight: 1.5 }}>
                  {selectedOrder.failure_reason || 'Insufficient funds or account inactive.'}
                </div>
              </div>
            )}

            {selectedOrder.status === 'failed' && selectedOrder.retry_count < 3 && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#1c2340', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Retry Collection Now
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminDebitOrders;
