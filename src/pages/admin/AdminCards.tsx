import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { Search, CreditCard, Download, Filter, Eye, User, Calendar, Activity, Info } from 'lucide-react';
const AdminCards = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  useEffect(() => {
    fetchCards();
  }, [statusFilter]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('member_cards')
        .select(`
          id,
          card_number,
          status,
          issued_at,
          expires_at,
          members (
            profiles (first_name, last_name, sa_id_number)
          ),
          dependants (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(card => {
    const pProfile = card.members?.profiles;
    const isDependant = !!card.dependants;
    const name = isDependant 
      ? `${card.dependants.first_name} ${card.dependants.last_name}`.toLowerCase()
      : `${pProfile?.first_name || ''} ${pProfile?.last_name || ''}`.toLowerCase();
    
    const cardNum = (card.card_number || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || cardNum.includes(query);
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return { bg: '#fef9c3', text: '#854d0e' };
      case 'active': return { bg: '#f0fdf4', text: '#15803d' };
      case 'suspended': return { bg: '#fef2f2', text: '#b91c1c' };
      case 'cancelled': return { bg: '#f1f5f9', text: '#475569' };
      case 'lost': return { bg: '#fff7ed', text: '#c2410c' };
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
            Physical & Digital Cards
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage member access cards and wallet passes.
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
            <Download size={16} /> Export Print Batch
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
              placeholder="Search by name or card number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '0.875rem', color: '#0f172a', outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="#94a3b8" />
            {['all', 'pending', 'active', 'suspended', 'lost'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.4rem 0.75rem', borderRadius: '6px',
                  background: statusFilter === status ? '#1c2340' : 'transparent',
                  color: statusFilter === status ? '#ffffff' : '#64748b',
                  border: statusFilter === status ? '1px solid #1c2340' : '1px solid transparent',
                  fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
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
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Card Number</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cardholder</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issued</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading cards...</td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <CreditCard size={32} color="#cbd5e1" />
                      <span>No cards found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const colors = getStatusColor(card.status);
                  const isDependant = !!card.dependants;
                  const profile = card.members?.profiles;
                  const holderName = isDependant 
                    ? `${card.dependants.first_name} ${card.dependants.last_name}`
                    : `${profile?.first_name} ${profile?.last_name}`;
                  
                  return (
                    <tr key={card.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', letterSpacing: '1px' }}>
                          {card.card_number}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>
                          {holderName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          {isDependant ? 'Dependant' : 'Main Member'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#475569' }}>
                          <CreditCard size={14} /> Physical & Digital
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: colors.bg,
                          color: colors.text,
                          textTransform: 'capitalize'
                        }}>
                          {card.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a' }}>
                        {card.issued_at ? new Date(card.issued_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedCard(card)}
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '6px', 
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
                            transition: 'all 0.2s', cursor: 'pointer'
                          }}
                        >
                          <Eye size={16} />
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
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title="Card Details"
        maxWidth="600px"
      >
        {selectedCard && (() => {
          const isDependant = !!selectedCard.dependants;
          const profile = selectedCard.members?.profiles;
          const holderName = isDependant 
            ? `${selectedCard.dependants.first_name} ${selectedCard.dependants.last_name}`
            : `${profile?.first_name} ${profile?.last_name}`;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ 
                  width: '64px', height: '40px', borderRadius: '6px', 
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '1px' }}>
                    {selectedCard.card_number}
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                    Status: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{selectedCard.status}</span>
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <User size={14} /> Cardholder
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 500 }}>
                    {holderName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {isDependant ? 'Dependant' : 'Main Member'}
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Activity size={14} /> Link to Member
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 500 }}>
                    {profile?.first_name} {profile?.last_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    ID: {profile?.sa_id_number}
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Calendar size={14} /> Issued Date
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 500 }}>
                    {selectedCard.issued_at ? new Date(selectedCard.issued_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Info size={14} /> Expiry Date
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 500 }}>
                    {selectedCard.expires_at ? new Date(selectedCard.expires_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                  Re-issue Card
                </button>
                {selectedCard.status === 'active' && (
                  <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
                    Suspend Card
                  </button>
                )}
                {selectedCard.status === 'suspended' && (
                  <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #10b981', background: '#f0fdf4', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>
                    Activate Card
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
};

export default AdminCards;
