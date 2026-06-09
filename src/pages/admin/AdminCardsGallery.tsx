import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Search, CreditCard, User, Calendar, ShieldCheck } from 'lucide-react';

const AdminCardsGallery = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('member_cards')
        .select(`
          id,
          card_number,
          status,
          issued_at,
          expires_at,
          members (
            profiles (first_name, last_name, sa_id_number, avatar_url)
          ),
          dependants (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Cards Gallery
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Visual overview of generated membership cards.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
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

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading cards gallery...</div>
      ) : filteredCards.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <CreditCard size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>No cards found</div>
          <div style={{ color: '#64748b', marginTop: '0.5rem' }}>Try adjusting your search criteria.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredCards.map(card => {
            const isDependant = !!card.dependants;
            const profile = card.members?.profiles;
            const holderName = isDependant 
              ? `${card.dependants.first_name} ${card.dependants.last_name}`
              : `${profile?.first_name} ${profile?.last_name}`;
            
            // Format card number to look like XXXX XXXX XXXX XXXX
            const formattedCardNum = card.card_number?.match(/.{1,4}/g)?.join(' ') || card.card_number;

            return (
              <motion.div 
                whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                key={card.id} 
                style={{ 
                  background: 'linear-gradient(135deg, #1c2340 0%, #0f172a 100%)', 
                  borderRadius: '16px', padding: '1.5rem', color: '#ffffff',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden',
                  aspectRatio: '1.586/1' // Standard credit card ratio
                }}
              >
                {/* Background Pattern */}
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '140%', background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 70%)', transform: 'rotate(15deg)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={20} color="var(--gold)" />
                    NFS INSURE
                  </div>
                  {card.status === 'active' && (
                    <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                      Active
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '1.25rem', letterSpacing: '3px', fontFamily: 'monospace', fontWeight: 500, opacity: 0.9 }}>
                    {formattedCardNum}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {profile?.avatar_url && !isDependant ? (
                      <img src={profile.avatar_url} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '2px' }}>
                        {isDependant ? 'Dependant' : 'Cardholder'}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {holderName}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '2px' }}>
                      Valid Thru
                    </div>
                    <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                      {card.expires_at ? new Date(card.expires_at).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : '12/99'}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default AdminCardsGallery;
