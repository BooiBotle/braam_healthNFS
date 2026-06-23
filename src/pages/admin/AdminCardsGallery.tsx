import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Search, CreditCard, User, Calendar, ShieldCheck, QrCode, Activity } from 'lucide-react';
import QRCode from 'react-qr-code';

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
          {filteredCards.map(card => {
            const isDependant = !!card.dependants;
            const profile = card.members?.profiles;
            const holderName = isDependant 
              ? `${card.dependants.first_name} ${card.dependants.last_name}`
              : `${profile?.first_name} ${profile?.last_name}`;
            
            // Format card number to look like XXXX XXXX XXXX XXXX
            const formattedCardNum = card.card_number?.match(/.{1,4}/g)?.join(' ') || card.card_number;
            
            // Create a JSON payload for the QR Code
            const qrPayload = JSON.stringify({
              v: 1,
              n: holderName,
              c: card.card_number,
              t: isDependant ? 'DEP' : 'MAIN',
              s: card.status
            });

            return (
              <motion.div 
                whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)' }}
                key={card.id} 
                style={{ 
                  background: 'linear-gradient(135deg, #1c2340 0%, #0b1120 100%)', 
                  borderRadius: '24px', color: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)', position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', minHeight: '240px', border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {/* Background Decorators */}
                <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(20px)' }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(30px)' }} />

                <div style={{ display: 'flex', padding: '1.5rem', flex: 1, gap: '1.5rem', position: 'relative', zIndex: 2 }}>
                  
                  {/* Left Column: Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ background: 'linear-gradient(135deg, var(--gold), #b48e2d)', padding: '6px', borderRadius: '8px' }}>
                        <ShieldCheck size={20} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '2px', color: '#fff', lineHeight: 1 }}>
                          NFS INSURE
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>
                          Braam Health Plus
                        </div>
                      </div>
                    </div>

                    <div style={{ margin: '1rem 0' }}>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8', marginBottom: '4px' }}>
                        Card Number
                      </div>
                      <div style={{ fontSize: '1.35rem', letterSpacing: '4px', fontFamily: '"Space Mono", monospace', fontWeight: 500, color: '#f8fafc', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {formattedCardNum}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '2px' }}>
                          Cardholder
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {holderName}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '2px' }}>
                          Valid Thru
                        </div>
                        <div style={{ fontSize: '0.875rem', fontFamily: '"Space Mono", monospace', color: '#fff' }}>
                          {card.expires_at ? new Date(card.expires_at).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : '12/99'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: QR & Status */}
                  <div style={{ width: '110px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                    <div style={{ 
                      fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', 
                      background: card.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                      color: card.status === 'active' ? '#34d399' : '#f87171', 
                      padding: '4px 10px', borderRadius: '20px', fontWeight: 700,
                      border: `1px solid ${card.status === 'active' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`
                    }}>
                      {card.status}
                    </div>

                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                      <QRCode 
                        value={qrPayload} 
                        size={85}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="Q"
                      />
                    </div>
                    
                    <div style={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
                      <QrCode size={10} /> SCANNABLE
                    </div>
                  </div>

                </div>
                
                {/* Bottom Strip */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                    <User size={12} /> {isDependant ? 'Dependant Member' : 'Primary Member'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                    <Activity size={12} /> ID: {profile?.sa_id_number || 'N/A'}
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
