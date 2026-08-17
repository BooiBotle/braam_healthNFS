import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Search, CreditCard, User, ShieldCheck, QrCode, Activity, ExternalLink, Filter } from 'lucide-react';
import QRCode from 'react-qr-code';

const AdminCardsGallery = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
            id,
            status,
            profiles (first_name, last_name, sa_id_number, avatar_url),
            plans (name, consultations_pm)
          ),
          dependants (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

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

  const statusColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    active: { bg: 'rgba(16,185,129,0.12)', text: '#10b981', border: 'rgba(16,185,129,0.3)', glow: 'rgba(16,185,129,0.6)' },
    pending: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.6)' },
    suspended: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.3)', glow: 'rgba(239,68,68,0.6)' },
    cancelled: { bg: 'rgba(100,116,139,0.12)', text: '#64748b', border: 'rgba(100,116,139,0.3)', glow: 'rgba(100,116,139,0.6)' },
    lost: { bg: 'rgba(251,146,60,0.12)', text: '#fb923c', border: 'rgba(251,146,60,0.3)', glow: 'rgba(251,146,60,0.6)' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1300px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Cards Gallery
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            All issued membership cards with working QR codes. Scan to view full member profile.
          </p>
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px' }}>
          {filteredCards.length} cards shown
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name or card number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 38px',
              borderRadius: '10px', border: '1px solid #e2e8f0',
              fontSize: '13.5px', color: '#0f172a', outline: 'none',
              background: '#fff', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'active', 'pending', 'suspended', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600,
                border: '1px solid', cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all .15s',
                background: statusFilter === s ? '#0f172a' : '#fff',
                color: statusFilter === s ? '#fff' : '#64748b',
                borderColor: statusFilter === s ? '#0f172a' : '#e2e8f0',
              }}
            >
              {s === 'all' ? '🗂 All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, #1c2340 0%, #0b1120 100%)',
              borderRadius: '24px', height: '220px',
              opacity: 0.4, animation: 'pulse 2s infinite',
            }} />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div style={{
          padding: '4rem 2rem', textAlign: 'center', background: '#ffffff',
          borderRadius: '16px', border: '1px solid #e2e8f0',
        }}>
          <CreditCard size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>No cards found</div>
          <div style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '14px' }}>Try adjusting your search or filter criteria.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredCards.map(card => {
            const isDependant = !!card.dependants;
            const profile = card.members?.profiles;
            const memberPlan = card.members?.plans;
            const holderName = isDependant
              ? `${card.dependants.first_name} ${card.dependants.last_name}`
              : `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();

            const formattedCardNum = card.card_number || '—';
            const sc = statusColors[card.status] || statusColors.cancelled;
            const isHovered = hoveredCard === card.id;

            // QR encodes a link to the public member profile
            const qrValue = `${window.location.origin}/member-profile/${encodeURIComponent(card.card_number || '')}`;

            return (
              <motion.div
                whileHover={{ y: -8, boxShadow: '0 28px 56px -12px rgba(15, 23, 42, 0.55)' }}
                key={card.id}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: memberPlan?.name?.toLowerCase().includes("premium") 
                    ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
                    : memberPlan?.name?.toLowerCase().includes("family")
                    ? "linear-gradient(135deg, #0f766e 0%, #115e59 100%)"
                    : "linear-gradient(135deg, #1c2340 0%, #0b1120 100%)",
                  borderRadius: '24px', color: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  border: `1px solid rgba(255,255,255,${isHovered ? '0.12' : '0.06'})`,
                  transition: 'border-color .2s',
                }}
              >
                {/* Decorators */}
                <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', padding: '22px 20px 16px', flex: 1, gap: '16px', position: 'relative', zIndex: 2 }}>

                  {/* Left Column: Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    {/* Logo row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ background: 'linear-gradient(135deg, #C9963A, #E8B85A)', padding: '6px', borderRadius: '8px', flexShrink: 0 }}>
                        <ShieldCheck size={18} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '1.5px', color: '#fff', lineHeight: 1 }}>
                          NFS INSURE
                        </div>
                        <div style={{ fontSize: '9px', color: '#C9963A', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>
                          {memberPlan?.name || 'Braam Health'}
                        </div>
                      </div>
                    </div>

                    {/* Card number */}
                    <div style={{ margin: '8px 0' }}>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8', marginBottom: '4px' }}>
                        Card Number
                      </div>
                      <div style={{ fontSize: '1.15rem', letterSpacing: '3px', fontFamily: '"Space Mono", monospace', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formattedCardNum}
                      </div>
                    </div>

                    {/* Holder / Expiry */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '2px' }}>Cardholder</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {holderName || 'Unknown'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                        <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '2px' }}>Valid Thru</div>
                        <div style={{ fontSize: '12px', fontFamily: '"Space Mono", monospace', color: '#fff' }}>
                          {card.expires_at ? new Date(card.expires_at).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : '—/—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: QR + Status */}
                  <div style={{ width: '110px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '16px' }}>
                    {/* Status badge */}
                    <div style={{
                      fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px',
                      background: sc.bg, color: sc.text, padding: '3px 9px', borderRadius: '20px',
                      fontWeight: 700, border: `1px solid ${sc.border}`,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.text, boxShadow: `0 0 4px ${sc.glow}` }} />
                      {card.status}
                    </div>

                    {/* Real QR Code */}
                    <div style={{ background: '#ffffff', padding: '7px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', cursor: 'pointer' }}
                      onClick={() => window.open(`/member-profile/${encodeURIComponent(card.card_number || '')}`, '_blank')}
                    >
                      <QRCode
                        value={qrValue}
                        size={80}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="Q"
                      />
                    </div>

                    <div style={{ fontSize: '9px', color: '#64748b', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                      <QrCode size={9} /> SCAN TO VIEW
                    </div>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div style={{
                  background: 'rgba(0,0,0,0.25)', padding: '8px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                    <User size={11} /> {isDependant ? 'Dependant' : 'Primary Member'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                    <Activity size={11} /> {memberPlan?.consultations_pm === -1 ? '∞' : memberPlan?.consultations_pm || '—'} consults/mo
                  </div>
                  {card.card_number && (
                    <a
                      href={`/member-profile/${encodeURIComponent(card.card_number)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#C9963A', textDecoration: 'none', fontWeight: 600 }}
                    >
                      <ExternalLink size={10} /> View
                    </a>
                  )}
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
