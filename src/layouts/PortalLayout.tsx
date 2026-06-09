import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  LogOut, Shield, LayoutDashboard, CreditCard, Activity, 
  Users, Calendar, FileText, Settings, Menu, X,
  Search, Pill, BarChart2,
  UserPlus, FileSignature, ShieldCheck, Image,
  Wallet, RefreshCcw, ArrowRightLeft, TrendingUp,
  List, LineChart, Download, Link as LinkIcon, Lock, PenTool
} from 'lucide-react';

const PortalLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const memberLinks = [
    { category: 'Home', name: 'Dashboard', path: '/member', icon: <LayoutDashboard size={16}/> },
    { category: 'Home', name: 'My Card', path: '/member/card', icon: <CreditCard size={16}/> },
    { category: 'Health', name: 'Consultations', path: '/member/consultations', icon: <Activity size={16}/> },
    { category: 'Health', name: 'Appointments', path: '/member/appointments', icon: <Calendar size={16}/> },
    { category: 'Account', name: 'Dependants', path: '/member/dependants', icon: <Users size={16}/> },
    { category: 'Account', name: 'Debit Orders', path: '/member/debits', icon: <FileText size={16}/> },
  ];

  const staffLinks = [
    { category: 'Core', name: 'Dashboard', path: '/staff', icon: <LayoutDashboard size={16}/> },
    { category: 'Core', name: 'Verify Member', path: '/staff/verify', icon: <Search size={16}/> },
    { category: 'Clinical', name: 'Appointments', path: '/staff/appointments', icon: <Calendar size={16}/> },
    { category: 'Clinical', name: 'Consultations', path: '/staff/consultations', icon: <Activity size={16}/> },
    { category: 'Clinical', name: 'Medication', path: '/staff/medication', icon: <Pill size={16}/> },
    { category: 'Admin', name: 'Applications', path: '/staff/applications', icon: <FileText size={16}/> },
    { category: 'Admin', name: 'Peak Hours', path: '/staff/peak-hours', icon: <BarChart2 size={16}/> },
  ];

  const adminLinks = [
    { category: 'Overview', name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={16}/> },
    
    { category: 'People', name: 'Members', path: '/admin/members', icon: <Users size={16}/> },
    { category: 'People', name: 'Applications', path: '/admin/applications', icon: <FileText size={16}/> },
    { category: 'People', name: 'Onboarding', path: '/admin/onboarding', icon: <UserPlus size={16}/> },
    { category: 'People', name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={16}/> },
    
    { category: 'Financials', name: 'Debit Orders', path: '/admin/debit-orders', icon: <Wallet size={16}/> },
    { category: 'Financials', name: 'Mandates', path: '/admin/mandates', icon: <FileSignature size={16}/> },
    { category: 'Financials', name: 'Reconciliation', path: '/admin/reconciliation', icon: <RefreshCcw size={16}/> },
    { category: 'Financials', name: 'Plan Changes', path: '/admin/plan-changes', icon: <ArrowRightLeft size={16}/> },
    
    { category: 'Compliance & Risk', name: 'KYC Queue', path: '/admin/kyc', icon: <ShieldCheck size={16}/> },
    { category: 'Compliance & Risk', name: 'POPIA Register', path: '/admin/popia', icon: <Lock size={16}/> },
    { category: 'Compliance & Risk', name: 'Signed Agreements', path: '/admin/agreements', icon: <PenTool size={16}/> },
    { category: 'Compliance & Risk', name: 'Audit Log', path: '/admin/audit', icon: <List size={16}/> },
    
    { category: 'Operations', name: 'Cards', path: '/admin/cards', icon: <CreditCard size={16}/> },
    { category: 'Operations', name: 'Cards Gallery', path: '/admin/cards-gallery', icon: <Image size={16}/> },
    { category: 'Operations', name: 'Cross-Sell Pipeline', path: '/admin/cross-sell', icon: <TrendingUp size={16}/> },
    
    { category: 'System', name: 'Retention Report', path: '/admin/retention', icon: <LineChart size={16}/> },
    { category: 'System', name: 'Reports & Exports', path: '/admin/reports', icon: <Download size={16}/> },
    { category: 'System', name: 'Integrations', path: '/admin/integrations', icon: <LinkIcon size={16}/> },
    { category: 'System', name: 'Settings', path: '/admin/settings', icon: <Settings size={16}/> },
  ];

  let links: any[] = [];
  if (user?.role === 'member') links = memberLinks;
  if (user?.role === 'staff') links = staffLinks;
  if (user?.role === 'admin') links = adminLinks;

  // Group links by category
  const categorizedLinks = links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, typeof links>);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--light-gray)' }}>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 35,
            transition: 'all 0.3s ease'
          }}
        />
      )}

      {/* Mobile Floating Header */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          zIndex: 30,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'transform 0.3s ease',
          transform: mobileOpen ? 'translateY(-150%)' : 'translateY(0)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }} />
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>
              NFS Health
            </span>
          </div>
          <button 
            onClick={() => setMobileOpen(true)}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: '#ffffff', 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            <Menu size={18} />
          </button>
        </div>
      )}

      {/* Premium Glass Sidebar */}
      <aside style={{
        width: '230px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 40
      }}>
        <div style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="var(--gold)" />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>
            NFS Insure
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
          {Object.entries(categorizedLinks).map(([category, catLinks]: [string, any]) => (
            <div key={category} style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                color: 'rgba(255,255,255,0.4)', 
                marginBottom: '0.5rem',
                paddingLeft: '0.5rem'
              }}>
                {category}
              </div>
              {catLinks.map((link: any) => {
                const active = isActive(link.path);
                return (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    onClick={() => { if (isMobile) setMobileOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      marginBottom: '0.25rem',
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.8125rem',
                      transition: 'all 0.15s ease',
                      border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                      }
                    }}
                  >
                    <div style={{ color: active ? 'var(--gold)' : 'rgba(255,255,255,0.4)' }}>
                      {link.icon}
                    </div>
                    {link.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.375rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Link 
              to={`/${user?.role}/profile`}
              onClick={() => { if (isMobile) setMobileOpen(false); }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#ffffff',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--gold) 0%, #e0be60 100%)', 
                color: '#1c2340', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 700, fontSize: '0.9375rem', flexShrink: 0, 
                boxShadow: '0 2px 8px rgba(201,160,51,0.25)' 
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#ffffff' }}>{user?.name}</div>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Manage Profile</div>
              </div>
            </Link>
            
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />
            
            <button 
              onClick={handleLogout}
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', 
                color: 'var(--status-error)', backgroundColor: 'transparent', border: 'none', 
                cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem', 
                width: '100%', borderRadius: '8px', transition: 'all 0.2s ease' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(222, 53, 11, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: isMobile ? '0' : '230px', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        width: '100%'
      }}>
        <div style={{ 
          padding: isMobile ? '6rem 1rem 2rem 1rem' : '2rem 3rem', 
          flex: 1, 
          maxWidth: '1400px', 
          width: '100%', 
          margin: '0 auto' 
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;






