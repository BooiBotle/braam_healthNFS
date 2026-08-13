import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Shield, LayoutDashboard, CreditCard, Activity,
  Users, Calendar, FileText, Settings, Menu, X,
  Search, Pill, BarChart2,
  UserPlus, FileSignature, ShieldCheck, Image,
  Wallet, RefreshCcw, ArrowRightLeft, TrendingUp,
  List, LineChart, Download, Link as LinkIcon, Lock, PenTool,
  HelpCircle, Building2, Crown, Radio, ChevronRight, Home,
  BarChart3
} from 'lucide-react';

const PortalLayout = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [clinicName, setClinicName] = useState<string>('Braam Health Centre');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    async function loadClinicInfo() {
      if (user?.clinicId) {
        const { data } = await supabase.from('clinics').select('name').eq('id', user.clinicId).single();
        if (data?.name) setClinicName(data.name);
      } else if (user?.role !== 'super_admin') {
        const { data } = await supabase.from('clinics').select('name').limit(1).single();
        if (data?.name) setClinicName(data.name);
      }
    }
    loadClinicInfo();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const memberLinks = [
    { category: 'Overview', name: 'Dashboard', path: '/member', icon: <LayoutDashboard size={16} /> },
    { category: 'Overview', name: 'My Card', path: '/member/card', icon: <CreditCard size={16} /> },
    { category: 'Overview', name: 'Clinic Info', path: '/member/clinic-info', icon: <Activity size={16} /> },
    { category: 'Clinical & Health', name: 'Consultations', path: '/member/consultations', icon: <Activity size={16} /> },
    { category: 'Clinical & Health', name: 'Appointments', path: '/member/appointments', icon: <Calendar size={16} /> },
    { category: 'Clinical & Health', name: 'Dependants', path: '/member/dependants', icon: <Users size={16} /> },
    { category: 'Financials & Care', name: 'Statement', path: '/member/statement', icon: <FileText size={16} /> },
    { category: 'Financials & Care', name: 'Debit Orders', path: '/member/debits', icon: <Wallet size={16} /> },
    { category: 'Financials & Care', name: 'Payments', path: '/member/payments', icon: <CreditCard size={16} /> },
    { category: 'Financials & Care', name: 'Change Plan', path: '/member/upgrade', icon: <ArrowRightLeft size={16} /> },
    { category: 'Financials & Care', name: 'KYC & Documents', path: '/member/kyc', icon: <ShieldCheck size={16} /> },
    { category: 'Account & Support', name: 'My Profile', path: '/member/profile', icon: <Users size={16} /> },
  ];

  const staffLinks = [
    { category: 'Core Operations', name: 'Dashboard', path: '/staff', icon: <LayoutDashboard size={16} /> },
    { category: 'Core Operations', name: 'Verify Member', path: '/staff/verify', icon: <Search size={16} /> },
    { category: 'Clinical Services', name: 'Appointments', path: '/staff/appointments', icon: <Calendar size={16} /> },
    { category: 'Clinical Services', name: 'Consultations', path: '/staff/consultations', icon: <Activity size={16} /> },
    { category: 'Clinical Services', name: 'Medication', path: '/staff/medication', icon: <Pill size={16} /> },
    { category: 'Branch Admin', name: 'Applications', path: '/staff/applications', icon: <FileText size={16} /> },
    { category: 'Branch Admin', name: 'Peak Hours', path: '/staff/peak-hours', icon: <BarChart2 size={16} /> },
    { category: 'Account & Support', name: 'My Profile', path: '/staff/profile', icon: <Users size={16} /> },
  ];

  const superAdminLinks = [
    { category: 'Executive Oversight', name: 'Dashboard', path: '/super-admin', icon: <LayoutDashboard size={16} /> },
    { category: 'Executive Oversight', name: 'Analytics & Reports', path: '/super-admin/analytics', icon: <BarChart3 size={16} /> },
    { category: 'Executive Oversight', name: 'Clinics & Branches', path: '/super-admin/clinics', icon: <Building2 size={16} /> },
    { category: 'Executive Oversight', name: 'User Directory', path: '/super-admin/users', icon: <Users size={16} /> },
    { category: 'Risk & Communications', name: 'Clinical Risk Monitor', path: '/super-admin/clinical-risk', icon: <ShieldCheck size={16} /> },
    { category: 'Risk & Communications', name: 'Inter-Clinic Broadcasts', path: '/super-admin/communications', icon: <Radio size={16} /> },
    { category: 'Risk & Communications', name: 'Treasury Command', path: '/super-admin/financials', icon: <Wallet size={16} /> },
    { category: 'Account & System Support', name: 'Super Admin Help Desk', path: '/super-admin/support', icon: <HelpCircle size={16} /> },
    { category: 'Account & System Support', name: 'Profile & Preferences', path: '/super-admin/profile', icon: <Settings size={16} /> },
  ];

  const adminLinks = [
    { category: 'Overview & Setup', name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={16} /> },
    { category: 'Overview & Setup', name: 'Plans & Pricing', path: '/admin/plans', icon: <Activity size={16} /> },
    { category: 'People & Care', name: 'Members', path: '/admin/members', icon: <Users size={16} /> },
    { category: 'People & Care', name: 'Applications', path: '/admin/applications', icon: <FileText size={16} /> },
    { category: 'People & Care', name: 'Onboarding', path: '/admin/onboarding', icon: <UserPlus size={16} /> },
    { category: 'People & Care', name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={16} /> },
    { category: 'Financials & Compliance', name: '1-Click Reconciliation', path: '/admin/debit-orders', icon: <Wallet size={16} /> },
    { category: 'Financials & Compliance', name: 'Mandates', path: '/admin/mandates', icon: <FileSignature size={16} /> },
    { category: 'Financials & Compliance', name: 'Reconciliation', path: '/admin/reconciliation', icon: <RefreshCcw size={16} /> },
    { category: 'Financials & Compliance', name: 'Plan Changes', path: '/admin/plan-changes', icon: <ArrowRightLeft size={16} /> },
    { category: 'Financials & Compliance', name: 'KYC Queue', path: '/admin/kyc', icon: <ShieldCheck size={16} /> },
    { category: 'Financials & Compliance', name: 'POPIA Register', path: '/admin/popia', icon: <Lock size={16} /> },
    { category: 'Financials & Compliance', name: 'Signed Agreements', path: '/admin/agreements', icon: <PenTool size={16} /> },
    { category: 'Account & Support', name: 'Clinic Support Desk', path: '/admin/support', icon: <HelpCircle size={16} /> },
    { category: 'Account & Support', name: 'My Profile', path: '/admin/profile', icon: <Users size={16} /> },
  ];

  let links: any[] = [];
  if (user?.role === 'member') links = memberLinks;
  if (user?.role === 'staff') links = staffLinks;
  if (user?.role === 'admin') links = adminLinks;
  if (user?.role === 'super_admin') links = superAdminLinks;

  const isSuperAdmin = user?.role === 'super_admin';

  const categorizedLinks = links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, typeof links>);

  const isActive = (path: string) => location.pathname === path;

  // ────────────────────── Design tokens ──────────────────────
  const sidebarWidth = '250px';
  const sidebarBg = isDark ? '#0f172a' : '#ffffff';
  const sidebarBorder = isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(28,35,64,0.07)';
  const sidebarText = isDark ? '#f1f5f9' : '#0f172a';
  const categoryColor = isDark ? '#64748b' : '#94a3b8';
  const inactiveLinkColor = isDark ? '#94a3b8' : '#64748b';
  const gold = '#c9a033';
  const navy = '#1c2340';

  // Top 5 quick links for mobile bottom tab bar
  const mobileQuickLinks = links.slice(0, 4);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: isDark ? '#090d16' : '#f8f9fc' }}>

      {/* ═══════════════════════════════════════════════════════
          MOBILE NAV — entirely rebuilt
      ══════════════════════════════════════════════════════════ */}
      {isMobile && (
        <>
          {/* ─── Frosted Glass Top Bar ─── */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            background: isDark ? 'rgba(9,13,22,0.88)' : 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(28,35,64,0.07)'}`,
            padding: '0 1rem',
            height: '56px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: `linear-gradient(135deg, ${navy} 0%, #263060 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: gold, boxShadow: '0 2px 8px rgba(28,35,64,0.3)'
              }}>
                {isSuperAdmin ? <Crown size={15} /> : <Shield size={15} />}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.8125rem', fontFamily: 'Outfit', color: sidebarText, lineHeight: 1.1 }}>
                  {isSuperAdmin ? 'NFS Super Admin' : 'NFS Health'}
                </div>
                <div style={{ fontSize: '0.5625rem', color: gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isSuperAdmin ? 'Portal Command' : clinicName}
                </div>
              </div>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: mobileOpen ? (isDark ? 'rgba(201,160,51,0.15)' : 'rgba(201,160,51,0.1)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(28,35,64,0.05)'),
                border: `1px solid ${mobileOpen ? 'rgba(201,160,51,0.3)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(28,35,64,0.08)')}`,
                color: mobileOpen ? gold : sidebarText,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileOpen ? 'x' : 'menu'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>

          {/* ─── Backdrop ─── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(9,13,22,0.6)', backdropFilter: 'blur(4px)', zIndex: 55 }}
              />
            )}
          </AnimatePresence>

          {/* ─── Full-height Slide-in Side Drawer ─── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
                style={{
                  position: 'fixed', top: 0, left: 0, bottom: 0,
                  width: 'min(85vw, 320px)',
                  background: isDark ? '#0c1221' : '#ffffff',
                  zIndex: 60, display: 'flex', flexDirection: 'column',
                  boxShadow: '8px 0 40px rgba(0,0,0,0.35)',
                  borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(28,35,64,0.07)'}`,
                }}
              >
                {/* Drawer header */}
                <div style={{
                  padding: '1.25rem 1.25rem 1rem',
                  background: isDark
                    ? 'linear-gradient(160deg, rgba(28,35,64,0.8) 0%, rgba(15,23,42,0.9) 100%)'
                    : 'linear-gradient(160deg, #1c2340 0%, #263060 100%)',
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(201,160,51,0.2), rgba(201,160,51,0.1))',
                      border: '1px solid rgba(201,160,51,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold
                    }}>
                      {isSuperAdmin ? <Crown size={20} /> : <Shield size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'Outfit', color: '#ffffff', lineHeight: 1.1 }}>
                        {isSuperAdmin ? 'NFS SUPER ADMIN' : 'NFS HEALTH'}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: gold, fontWeight: 700, marginTop: '2px', letterSpacing: '0.06em' }}>
                        {isSuperAdmin ? 'PORTAL COMMAND' : clinicName.toUpperCase()}
                      </div>
                    </div>
                    <button onClick={() => setMobileOpen(false)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>

                  {/* User chip in header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg, ${gold}, #b38d2a)`, color: navy, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0 }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.5625rem', color: gold, fontWeight: 700 }}>{isSuperAdmin ? 'Super Administrator' : clinicName}</div>
                    </div>
                    <button onClick={handleLogout} style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'rgba(239,68,68,0.2)', color: '#f87171', fontWeight: 700, fontSize: '0.625rem', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', flexShrink: 0 }}>
                      <LogOut size={12} />
                    </button>
                  </div>
                </div>

                {/* Navigation list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 0.875rem' }}>
                  {Object.entries(categorizedLinks).map(([cat, catLinks]: [string, any], catIdx) => (
                    <div key={cat} style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 800, color: categoryColor, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.375rem', marginBottom: '0.375rem' }}>
                        {cat}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {catLinks.map((link: any) => {
                          const active = isActive(link.path);
                          return (
                            <Link key={link.path} to={link.path}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.625rem',
                                padding: '0.55rem 0.75rem', borderRadius: '10px', textDecoration: 'none',
                                background: active ? (isDark ? 'rgba(201,160,51,0.14)' : 'rgba(28,35,64,0.07)') : 'transparent',
                                borderLeft: `3px solid ${active ? gold : 'transparent'}`,
                                color: active ? sidebarText : inactiveLinkColor,
                                fontWeight: active ? 700 : 500, fontSize: '0.8375rem',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ color: active ? gold : (isDark ? '#64748b' : '#94a3b8'), display: 'flex', flexShrink: 0 }}>{link.icon}</div>
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.name}</span>
                              {active && <ChevronRight size={13} color={gold} style={{ flexShrink: 0 }} />}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Floating Bottom Action Bar (quick links) ─── */}
          <div style={{
            position: 'fixed', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
            zIndex: 48, display: 'flex', gap: '0.25rem',
            background: isDark ? 'rgba(9,13,22,0.92)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(28,35,64,0.08)'}`,
            borderRadius: '20px', padding: '0.4rem 0.5rem',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(28,35,64,0.12)',
            maxWidth: 'calc(100vw - 2rem)'
          }}>
            {mobileQuickLinks.map((link: any) => {
              const active = isActive(link.path);
              return (
                <Link key={link.path} to={link.path} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  padding: '0.4rem 0.875rem', borderRadius: '14px', textDecoration: 'none',
                  background: active ? (isDark ? 'rgba(201,160,51,0.15)' : 'rgba(201,160,51,0.1)') : 'transparent',
                  color: active ? gold : inactiveLinkColor,
                  transition: 'all 0.18s', minWidth: '48px'
                }}>
                  <div style={{ display: 'flex', color: active ? gold : (isDark ? '#64748b' : '#94a3b8') }}>{link.icon}</div>
                  <span style={{ fontSize: '0.5rem', fontWeight: active ? 800 : 600, letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60px', textAlign: 'center' }}>
                    {link.name.split(' ')[0]}
                  </span>
                </Link>
              );
            })}
            {/* All menu button */}
            <button onClick={() => setMobileOpen(true)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: '0.4rem 0.875rem', borderRadius: '14px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: inactiveLinkColor, minWidth: '48px'
            }}>
              <Menu size={16} color={isDark ? '#64748b' : '#94a3b8'} />
              <span style={{ fontSize: '0.5rem', fontWeight: 600 }}>More</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          DESKTOP SIDEBAR — polished
      ══════════════════════════════════════════════════════════ */}
      {!isMobile && (
        <aside style={{
          width: sidebarWidth,
          background: sidebarBg,
          borderRight: sidebarBorder,
          boxShadow: isDark ? '4px 0 30px rgba(0,0,0,0.2)' : '2px 0 16px rgba(28,35,64,0.03)',
          color: sidebarText,
          display: 'flex', flexDirection: 'column',
          position: 'fixed', height: '100vh', zIndex: 40,
          overflowY: 'auto',
        }}>
          {/* Brand Header */}
          <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: sidebarBorder, flexShrink: 0 }}>
            {isSuperAdmin ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `linear-gradient(135deg, ${navy} 0%, #263060 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, flexShrink: 0, boxShadow: '0 4px 14px rgba(28,35,64,0.25)' }}>
                    <Crown size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'Outfit', color: sidebarText, letterSpacing: '-0.01em', lineHeight: 1.1 }}>NFS SUPER ADMIN</div>
                    <div style={{ fontSize: '0.6rem', color: gold, fontWeight: 800, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portal Command</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.5rem', borderRadius: '8px', background: isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5', border: `1px solid ${isDark ? 'rgba(16,185,129,0.15)' : '#bbf7d0'}` }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.625rem', color: '#059669', fontWeight: 700 }}>All Systems Operational</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, flexShrink: 0 }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.0625rem', fontWeight: 800, fontFamily: 'Outfit', color: sidebarText, letterSpacing: '-0.02em', lineHeight: 1.1 }}>NFS HEALTH</div>
                    <div style={{ fontSize: '0.6875rem', color: categoryColor, fontWeight: 600, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{clinicName}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.625rem', color: '#10b981', fontWeight: 700 }}>✓ Clinic Branch Active</div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0.875rem 0.75rem', overflowY: 'auto' }}>
            {Object.entries(categorizedLinks).map(([category, catLinks]: [string, any]) => (
              <div key={category} style={{ marginBottom: '1.125rem' }}>
                <div style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: categoryColor, marginBottom: '0.375rem', paddingLeft: '0.5rem' }}>
                  {category}
                </div>
                {catLinks.map((link: any) => {
                  const active = isActive(link.path);
                  return (
                    <Link key={link.path} to={link.path} style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.55rem 0.75rem', borderRadius: '10px',
                      color: active ? sidebarText : inactiveLinkColor,
                      backgroundColor: active ? (isDark ? 'rgba(201,160,51,0.12)' : 'rgba(28,35,64,0.06)') : 'transparent',
                      marginBottom: '2px', fontWeight: active ? 700 : 500, fontSize: '0.8125rem',
                      transition: 'all 0.15s ease',
                      borderLeft: `3px solid ${active ? gold : 'transparent'}`,
                      textDecoration: 'none'
                    }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(28,35,64,0.04)'; e.currentTarget.style.color = sidebarText; e.currentTarget.style.transform = 'translateX(2px)'; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = inactiveLinkColor; e.currentTarget.style.transform = 'translateX(0)'; } }}
                    >
                      <div style={{ color: active ? gold : (isDark ? '#64748b' : '#94a3b8'), display: 'flex', alignItems: 'center', flexShrink: 0 }}>{link.icon}</div>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.name}</span>
                      {active && <ChevronRight size={13} color={gold} style={{ flexShrink: 0 }} />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer user area */}
          <div style={{ padding: '0.875rem 1rem', borderTop: sidebarBorder, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Link to={`/${user?.role === 'super_admin' ? 'super-admin' : user?.role}/profile`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flex: 1, overflow: 'hidden' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${gold}, #b38d2a)`, color: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: sidebarText, lineHeight: 1.1 }}>{user?.name}</div>
                  <div style={{ fontSize: '0.5625rem', color: categoryColor, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isSuperAdmin ? 'Super Administrator' : clinicName}</div>
                </div>
              </Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? '0' : sidebarWidth,
        display: 'flex', flexDirection: 'column',
        width: '100%',
        backgroundColor: isDark ? '#090d16' : '#f8f9fc',
        minHeight: '100vh',
      }}>
        <div style={{
          padding: isMobile ? '4.5rem 0.875rem 5.5rem 0.875rem' : '1.75rem 2.25rem',
          flex: 1,
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
