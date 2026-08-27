import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, User, ArrowRight, Info, CheckCircle, Pill, Briefcase, Stethoscope, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ClinicPlan } from '../lib/api/clinics';
import PlanDetailsModal from './PlanDetailsModal';
import { useAuth } from '../context/AuthContext';

interface Props {
  plans: ClinicPlan[];
  isLandingPage?: boolean;
}

export default function PlansCarousel({ plans, isLandingPage = false }: Props) {
  const { user } = useAuth();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ClinicPlan | null>(null);

  // Auto-play focus
  useEffect(() => {
    if (plans.length === 0 || isHovered || selectedPlan) return;
    
    const interval = setInterval(() => {
      setFocusedIndex((prev) => (prev + 1) % plans.length);
    }, 4000); // 4 seconds per plan
    
    return () => clearInterval(interval);
  }, [plans.length, isHovered, selectedPlan]);

  if (plans.length === 0) return null;

  const itemsPerPage = 5;
  const totalPages = Math.ceil(plans.length / itemsPerPage);
  
  // Calculate which page we are currently on based on the focused index
  const currentPage = Math.floor(focusedIndex / itemsPerPage);
  
  // Get the plans for the current page
  const visiblePlans = plans.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleDotClick = (pageIndex: number) => {
    setFocusedIndex(pageIndex * itemsPerPage);
  };

  const getPlanIcon = (planType: string) => {
    if (planType.includes('corporate')) return <Briefcase size={20} />;
    if (planType.includes('chronic')) return <Pill size={20} />;
    if (planType.includes('plus')) return <Shield size={20} />;
    if (planType.includes('braam_health')) return <Stethoscope size={20} />;
    return <Heart size={20} />;
  };

  return (
    <div 
      style={{ position: 'relative', padding: 'var(--sp-4) 0' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .carousel-container::-webkit-scrollbar {
          display: none;
        }
        .carousel-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
        }
        .carousel-item {
          scroll-snap-align: center;
        }
      `}</style>
      <div className="carousel-container" style={{ overflowX: 'auto', padding: 'var(--sp-4)', margin: '0 calc(var(--sp-4) * -1)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 'var(--sp-6)',
            alignItems: 'stretch',
            minWidth: 'max-content', // ensures it doesn't squish too much on smaller screens
            paddingBottom: 'var(--sp-4)',
          }}
        >
          {visiblePlans.map((plan, localIndex) => {
            const globalIndex = currentPage * itemsPerPage + localIndex;
            const isFocused = globalIndex === focusedIndex;
            const isPopular = plan.most_popular;
            
            return (
              <motion.div
                key={plan.id}
                className="carousel-item"
                onClick={() => setFocusedIndex(globalIndex)}
                animate={{
                  scale: isFocused ? 1.05 : 0.98,
                  opacity: isFocused ? 1 : 0.7,
                  y: isFocused ? -8 : 0,
                  boxShadow: isFocused 
                    ? (isPopular ? '0 20px 40px var(--gold-glow)' : '0 20px 40px var(--shadow-lg)') 
                    : '0 4px 12px var(--shadow-sm)',
                  borderColor: isFocused 
                    ? (isPopular ? 'var(--gold)' : 'var(--accent)') 
                    : (isPopular ? 'var(--gold-subtle)' : 'var(--border)'),
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  padding: 'var(--sp-6)',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-surface)',
                  border: '2px solid',
                  position: 'relative',
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  zIndex: isFocused ? 10 : 1,
                  minWidth: '280px',
                }}
              >
                {/* Glow Background for focused */}
                {isFocused && (
                  <div style={{ position: 'absolute', inset: 0, background: isPopular ? 'linear-gradient(180deg, var(--gold-subtle) 0%, transparent 100%)' : 'linear-gradient(180deg, var(--accent-subtle) 0%, transparent 100%)', opacity: 0.3, zIndex: 0 }} />
                )}

                <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {isPopular && (
                    <div style={{
                      position: 'absolute', top: '-14px', right: '-14px',
                      background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))',
                      color: '#1a1a1a', padding: '4px 14px', borderRadius: '0 var(--radius-xl) 0 var(--radius-xl)',
                      fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
                      boxShadow: '0 4px 12px var(--gold-glow)',
                    }}>
                      MOST POPULAR
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                    <motion.div 
                      animate={{ 
                        backgroundColor: isFocused ? (isPopular ? 'var(--gold)' : 'var(--accent)') : (isPopular ? 'var(--gold-subtle)' : 'var(--accent-subtle)'),
                        color: isFocused ? '#fff' : (isPopular ? 'var(--gold)' : 'var(--accent)'),
                      }}
                      style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {getPlanIcon(plan.plan_type || '')}
                    </motion.div>
                    <div>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.2 }}>{plan.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{plan.max_members} Member{plan.max_members > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: isFocused ? (isPopular ? 'var(--gold)' : 'var(--accent)') : 'var(--text-heading)', letterSpacing: '-0.02em', transition: 'color 0.3s' }}>
                      R{(plan.monthly_fee_cents / 100).toFixed(0)}
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginLeft: '2px' }}>/mo</span>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={14} color={isPopular ? 'var(--gold)' : 'var(--accent)'} style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>{plan.consultations_pm === -1 ? 'Unlimited' : plan.consultations_pm} GP consults/mo</span>
                    </li>
                    {plan.includes_medication && (
                      <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={14} color={isPopular ? 'var(--gold)' : 'var(--accent)'} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>Dispensed Meds Included</span>
                      </li>
                    )}
                    {plan.includes_24h_access && (
                      <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={14} color={isPopular ? 'var(--gold)' : 'var(--accent)'} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>24/7 Access</span>
                      </li>
                    )}
                  </ul>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginTop: 'auto' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); }}
                      style={{ 
                        width: '100%', padding: '10px', fontSize: 'var(--text-xs)', fontWeight: 600,
                        background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-surface-sunken)'; e.currentTarget.style.color = 'var(--text-heading)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <Info size={14} /> View Details
                    </button>
                    
                    <Link
                      to="/apply"
                      className={`btn ${isPopular ? 'btn-gold' : 'btn-primary'}`}
                      style={{ width: '100%', padding: '12px', fontSize: 'var(--text-sm)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Apply Now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-12)' }}>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              style={{
                width: currentPage === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentPage === idx ? 'var(--accent)' : 'var(--border-strong)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <PlanDetailsModal 
        plan={selectedPlan} 
        isOpen={!!selectedPlan} 
        onClose={() => setSelectedPlan(null)} 
      />
    </div>
  );
}
