import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  LogOut, Shield, LayoutDashboard, CreditCard, Activity, 
  Users, Calendar, FileText, CheckSquare, Settings, Menu, X
} from 'lucide-react';

const PortalLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const memberLinks = [
    { name: 'Dashboard', path: '/member', icon: <LayoutDashboard size={18}/> },
    { name: 'My Card', path: '/member/card', icon: <CreditCard size={18}/> },
    { name: 'Consultations', path: '/member/consultations', icon: <Activity size={18}/> },
    { name: 'Dependants', path: '/member/dependants', icon: <Users size={18}/> },
    { name: 'Debit Orders', path: '/member/debits', icon: <FileText size={18}/> },
    { name: 'Appointments', path: '/member/appointments', icon: <Calendar size={18}/> },
  ];

  const staffLinks = [
    { name: 'Dashboard', path: '/staff', icon: <LayoutDashboard size={18}/> },
    { name: 'Verify Member', path: '/staff/verify', icon: <CheckSquare size={18}/> },
    { name: 'Appointments', path: '/staff/appointments', icon: <Calendar size={18}/> },
    { name: 'Consultations', path: '/staff/consultations', icon: <Activity size={18}/> },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18}/> },
    { name: 'Members', path: '/admin/members', icon: <Users size={18}/> },
    { name: 'Applications', path: '/admin/applications', icon: <FileText size={18}/> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18}/> },
  ];

  let links = [];
  if (user?.role === 'member') links = memberLinks;
  if (user?.role === 'staff') links = staffLinks;
  if (user?.role === 'admin') links = adminLinks;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--light-gray)' }}>
      {/* Mobile Toggle */}
      <button 
        className="btn btn-ghost" 
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 50, display: 'none' /* handled via media queries in a real app */ }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu />
      </button>

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: 'var(--navy-dark)',
        color: 'var(--white)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        transition: 'transform 0.3s ease',
        zIndex: 40
      }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Shield size={24} color="var(--gold)" />
          <div style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'Outfit' }}>
            NFS Insure
          </div>
        </div>
        
        <div style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-gray)', letterSpacing: '0.05em' }}>
          {user?.role} Portal
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
          {links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive(link.path) ? 'var(--white)' : 'var(--text-gray)',
                backgroundColor: isActive(link.path) ? 'var(--navy-mid)' : 'transparent',
                marginBottom: '0.25rem',
                fontWeight: isActive(link.path) ? 600 : 400,
                borderLeft: isActive(link.path) ? '3px solid var(--gold)' : '3px solid transparent'
              }}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Braam Health Centre</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red-alert)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
