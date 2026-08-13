import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Edit, MapPin, Phone, Mail,
  Search, Activity, ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getAllClinics, updateClinic, type Clinic } from '../../lib/api/clinics';

const SuperAdminClinics = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => { loadClinics(); }, []);

  const loadClinics = async () => {
    setLoading(true);
    try {
      const data = await getAllClinics();
      setClinics(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updateClinic(id, { is_active: !current });
      loadClinics();
    } catch (err) { console.error(err); }
  };

  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.doctor_name && c.doctor_name.toLowerCase().includes(search.toLowerCase())) ||
    (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  const d = {
    card: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    cardHover: isDark ? 'rgba(255,255,255,0.07)' : '#fafaf8',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(28,35,64,0.06)',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textSub: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    gold: '#c9a033',
    goldSoft: isDark ? 'rgba(201,160,51,0.12)' : 'rgba(201,160,51,0.07)',
    green: '#10b981',
    red: '#ef4444',
    navy: '#1c2340',
    shadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(28,35,64,0.04)',
    shadowHover: isDark ? '0 8px 28px rgba(0,0,0,0.45)' : '0 6px 20px rgba(28,35,64,0.08)',
  };

  return (
    <div style={{ color: d.text, maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: d.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>NFS Super Admin Portal</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: d.text, lineHeight: 1.2 }}>
              Branch Clinic Network
            </h1>
            <p style={{ fontSize: '0.8125rem', color: d.textSub, marginTop: '0.25rem' }}>Register, edit, and manage clinic facilities across the NFS network</p>
          </div>
          <button
            onClick={() => navigate('/super-admin/clinics/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.125rem', borderRadius: '10px',
              background: `linear-gradient(135deg, ${d.gold} 0%, #b38d2a 100%)`,
              color: d.navy, fontWeight: 800, fontSize: '0.8125rem',
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(201,160,51,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s', fontFamily: 'Inter'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(201,160,51,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(201,160,51,0.3)'; }}
          >
            <Plus size={16} /> Add Clinic Branch
          </button>
        </div>
      </motion.div>

      {/* Search + Stats bar */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '360px' }}>
          <Search size={15} color={d.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text" placeholder="Search by name, doctor, city…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '9px', background: d.card, border: `1px solid ${d.border}`, color: d.text, fontSize: '0.8125rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter', boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = d.gold + '50'}
            onBlur={e => e.currentTarget.style.borderColor = d.border}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: `${clinics.filter(c => c.is_active).length} Active`, color: d.green, bg: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5' },
            { label: `${clinics.filter(c => !c.is_active).length} Inactive`, color: d.red, bg: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2' },
            { label: `${clinics.filter(c => c.open_24h).length} 24-Hour`, color: d.gold, bg: d.goldSoft },
          ].map((stat, i) => (
            <span key={i} style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '7px', background: stat.bg, color: stat.color, border: `1px solid ${stat.color}20` }}>{stat.label}</span>
          ))}
        </div>
      </motion.div>

      {/* Clinic Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem', color: d.textMuted }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Activity size={22} color={d.gold} /></motion.div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Loading clinic network…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: d.card, borderRadius: '14px', border: `1px solid ${d.border}`, color: d.textMuted, fontSize: '0.875rem' }}>
          No clinics match "{search}"
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }} className="clinics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,300px), 1fr))', gap: '1rem' }}>
          {filtered.map(clinic => (
            <div
              key={clinic.id}
              onMouseEnter={() => setHoveredId(clinic.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: d.card, borderRadius: '14px', border: `1px solid ${hoveredId === clinic.id ? d.gold + '25' : d.border}`,
                padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: hoveredId === clinic.id ? d.shadowHover : d.shadow,
                transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                transform: hoveredId === clinic.id ? 'translateY(-3px)' : 'none',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${d.gold}, transparent)`, opacity: hoveredId === clinic.id ? 0.7 : 0.2, transition: 'opacity 0.22s' }} />

              <div>
                {/* Clinic header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: d.goldSoft, border: `1px solid ${isDark ? 'rgba(201,160,51,0.2)' : 'rgba(201,160,51,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.gold, fontWeight: 800, fontSize: '1rem', fontFamily: 'Outfit', flexShrink: 0 }}>
                      {clinic.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: d.text, lineHeight: 1.2 }}>{clinic.name}</h3>
                      <span style={{ fontSize: '0.6875rem', color: d.gold, fontWeight: 700 }}>Dr. {clinic.doctor_name || 'General Practitioner'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: clinic.is_active ? (isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5') : (isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2'), color: clinic.is_active ? '#059669' : '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {clinic.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {clinic.open_24h && (
                      <span style={{ fontSize: '0.5625rem', fontWeight: 800, padding: '2px 6px', borderRadius: '5px', background: d.goldSoft, color: d.gold, letterSpacing: '0.03em' }}>24H</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: d.textSub, marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={12} color={d.gold} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clinic.address_line1 || 'No address set'}, {clinic.city || 'South Africa'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={12} color={d.gold} style={{ flexShrink: 0 }} />
                    <span>{clinic.phone || '+27 10 000 0000'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={12} color={d.gold} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clinic.email || 'info@clinic.co.za'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.875rem', borderTop: `1px solid ${d.border}` }}>
                <button
                  onClick={() => navigate(`/super-admin/clinics/edit/${clinic.id}`)}
                  style={{ flex: 1, padding: '0.45rem', borderRadius: '8px', background: d.navy, color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Edit size={13} color={d.gold} /> Edit Facility
                </button>
                <button
                  onClick={() => handleToggle(clinic.id, clinic.is_active)}
                  style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', background: clinic.is_active ? (isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2') : (isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5'), color: clinic.is_active ? d.red : '#059669', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${clinic.is_active ? (isDark ? 'rgba(239,68,68,0.2)' : '#fecaca') : (isDark ? 'rgba(16,185,129,0.2)' : '#bbf7d0')}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {clinic.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {clinic.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <style>{`
        @media (max-width: 580px) { .clinics-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 400px) { .clinics-grid { gap: 0.75rem !important; } }
      `}</style>
    </div>
  );
};

export default SuperAdminClinics;
