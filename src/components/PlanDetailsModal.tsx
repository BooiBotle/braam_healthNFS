import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ClinicPlan } from '../lib/api/clinics';

interface Props {
  plan: ClinicPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanDetailsModal({ plan, isOpen, onClose }: Props) {
  if (!plan) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-4)' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative', background: 'var(--bg-surface)', width: '100%', maxWidth: '500px',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Header */}
            <div style={{ padding: 'var(--sp-6)', background: 'var(--bg-surface-sunken)', borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={onClose}
                style={{ position: 'absolute', top: 'var(--sp-4)', right: 'var(--sp-4)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: plan.most_popular ? 'var(--gold-subtle)' : 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.most_popular ? 'var(--gold)' : 'var(--accent)' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-heading)' }}>{plan.name}</h3>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    Up to {plan.max_members} Member{plan.max_members > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 'var(--sp-4)' }}>
                <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: plan.most_popular ? 'var(--gold)' : 'var(--text-heading)', letterSpacing: '-0.02em' }}>
                  R{(plan.monthly_fee_cents / 100).toFixed(0)}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginLeft: '4px' }}>/mo</span>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: 'var(--sp-6)', maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--sp-6)' }}>
                {plan.description || "Comprehensive primary healthcare coverage for you and your family."}
              </p>

              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-4)' }}>
                Included Benefits
              </h4>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                  <Check size={18} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-heading)', marginBottom: '2px' }}>GP Consultations</strong>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{plan.consultations_pm === -1 ? 'Unlimited' : plan.consultations_pm} consultations per month</span>
                  </div>
                </li>
                
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                  {plan.includes_medication ? <Check size={18} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} /> : <X size={18} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />}
                  <div>
                    <strong style={{ display: 'block', fontSize: 'var(--text-sm)', color: plan.includes_medication ? 'var(--text-heading)' : 'var(--text-muted)', marginBottom: '2px', textDecoration: plan.includes_medication ? 'none' : 'line-through' }}>Dispensed Medication</strong>
                    <span style={{ fontSize: 'var(--text-sm)', color: plan.includes_medication ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{plan.includes_medication ? 'Included with every active consultation' : 'Not included in this plan'}</span>
                  </div>
                </li>

                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                  {plan.includes_24h_access ? <Check size={18} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} /> : <X size={18} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />}
                  <div>
                    <strong style={{ display: 'block', fontSize: 'var(--text-sm)', color: plan.includes_24h_access ? 'var(--text-heading)' : 'var(--text-muted)', marginBottom: '2px', textDecoration: plan.includes_24h_access ? 'none' : 'line-through' }}>24/7 Access</strong>
                    <span style={{ fontSize: 'var(--text-sm)', color: plan.includes_24h_access ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{plan.includes_24h_access ? 'Priority after-hours support' : 'Standard operating hours only'}</span>
                  </div>
                </li>

                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                  {plan.includes_chronic ? <Check size={18} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} /> : <X size={18} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />}
                  <div>
                    <strong style={{ display: 'block', fontSize: 'var(--text-sm)', color: plan.includes_chronic ? 'var(--text-heading)' : 'var(--text-muted)', marginBottom: '2px', textDecoration: plan.includes_chronic ? 'none' : 'line-through' }}>Chronic Programme</strong>
                    <span style={{ fontSize: 'var(--text-sm)', color: plan.includes_chronic ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{plan.includes_chronic ? 'Monthly chronic medication dispension' : 'Not included in this plan'}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div style={{ padding: 'var(--sp-6)', background: 'var(--bg-surface-sunken)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--sp-4)' }}>
              <Link
                to="/apply"
                onClick={onClose}
                className={`btn ${plan.most_popular ? 'btn-gold' : 'btn-primary'}`}
                style={{ flex: 1, padding: '14px', fontSize: 'var(--text-sm)' }}
              >
                Apply Now <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
