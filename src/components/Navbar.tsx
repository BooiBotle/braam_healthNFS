import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/plans', label: 'Plans' },
    { to: '/apply', label: 'Apply' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'var(--sp-4) 0',
      position: 'relative',
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/" style={{ 
        display: 'flex', alignItems: 'center', textDecoration: 'none',
        background: theme === 'dark' ? '#ffffff' : 'transparent',
        padding: theme === 'dark' ? '6px 12px' : '0',
        borderRadius: 'var(--radius-md)',
        boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      }}>
        <img
          src="/nfs-logo.png"
          alt="NFS Insure"
          style={{
            height: theme === 'dark' ? '28px' : '36px',
            width: 'auto',
          }}
        />
      </Link>

      {/* Desktop Nav */}
      <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-6)', alignItems: 'center' }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: isActive(link.to) ? 600 : 500,
                color: isActive(link.to) ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'color 200ms',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-surface-sunken)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)', padding: 'var(--sp-2)',
              cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'all 200ms',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <Link to="/login" className="btn btn-primary" style={{ padding: 'var(--sp-2) var(--sp-5)' }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Mobile Hamburger */}
      <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 'var(--sp-2)' }}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text-heading)', cursor: 'pointer', display: 'flex', padding: 'var(--sp-2)' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--sp-4)',
          boxShadow: 'var(--shadow-lg)', zIndex: 200,
          display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)',
        }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-body)', padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-md)' }}>
              {link.label}
            </Link>
          ))}
          <div style={{ height: '1px', background: 'var(--border)' }} />
          <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
