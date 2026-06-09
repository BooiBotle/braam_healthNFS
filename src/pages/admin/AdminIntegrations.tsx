import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, CreditCard, MessageSquare, Mail, Wallet, Shield, CheckCircle, Settings, Plus } from 'lucide-react';

const AdminIntegrations = () => {
  const integrations = [
    { id: 'naedo', name: 'Netcash NAEDO', type: 'PaymentGateway', status: 'active', icon: CreditCard, color: '#0ea5e9' },
    { id: 'debicheck', name: 'DebiCheck', type: 'PaymentGateway', status: 'active', icon: Shield, color: '#8b5cf6' },
    { id: 'yoco', name: 'Yoco POS', type: 'PaymentGateway', status: 'pending_config', icon: CreditCard, color: '#f97316' },
    { id: 'whatsapp', name: 'WhatsApp API', type: 'Communication', status: 'active', icon: MessageSquare, color: '#10b981' },
    { id: 'sms_otp', name: 'Clickatell SMS', type: 'Communication', status: 'active', icon: MessageSquare, color: '#3b82f6' },
    { id: 'email', name: 'SendGrid', type: 'Communication', status: 'active', icon: Mail, color: '#ef4444' },
    { id: 'google_wallet', name: 'Google Wallet Passes', type: 'Cards', status: 'inactive', icon: Wallet, color: '#475569' },
  ];

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'active': 
        return { bg: '#f0fdf4', text: '#15803d', label: 'Active', icon: <CheckCircle size={14} /> };
      case 'inactive': 
        return { bg: '#f1f5f9', text: '#475569', label: 'Inactive', icon: null };
      case 'pending_config': 
        return { bg: '#fef9c3', text: '#854d0e', label: 'Needs Config', icon: <Settings size={14} /> };
      case 'error': 
        return { bg: '#fef2f2', text: '#b91c1c', label: 'Error', icon: <Shield size={14} /> };
      default: 
        return { bg: '#f1f5f9', text: '#475569', label: status, icon: null };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Integrations
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage third-party connections and API keys.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '8px', 
              background: '#1c2340', color: '#ffffff', 
              border: 'none', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Plus size={16} /> Add Integration
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {integrations.map(integration => {
          const status = getStatusDisplay(integration.status);
          const Icon = integration.icon;
          
          return (
            <div 
              key={integration.id}
              style={{ 
                background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    background: `${integration.color}15`, color: integration.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>{integration.name}</h3>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{integration.type}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                  background: status.bg, color: status.text
                }}>
                  {status.icon} {status.label}
                </span>

                <button style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  padding: '0.375rem 0.75rem', borderRadius: '6px', 
                  background: '#f8fafc', color: '#0f172a', 
                  border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AdminIntegrations;
