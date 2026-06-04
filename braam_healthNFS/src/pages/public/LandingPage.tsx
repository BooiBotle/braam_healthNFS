import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// Floating background icons (medical symbols scattered in bg)
const BgIcons = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {[
      { top: '8%', left: '18%', icon: '♡', size: 22, opacity: 0.08 },
      { top: '15%', left: '55%', icon: '⚕', size: 18, opacity: 0.07 },
      { top: '12%', right: '12%', icon: '💊', size: 16, opacity: 0.06 },
      { top: '35%', left: '8%', icon: '🩺', size: 20, opacity: 0.07 },
      { top: '55%', left: '42%', icon: '♡', size: 16, opacity: 0.05 },
      { top: '70%', left: '15%', icon: '⚕', size: 22, opacity: 0.07 },
      { top: '80%', right: '25%', icon: '💉', size: 16, opacity: 0.06 },
      { top: '25%', right: '30%', icon: '🩺', size: 18, opacity: 0.05 },
      { top: '60%', right: '10%', icon: '♡', size: 20, opacity: 0.07 },
      { top: '45%', left: '62%', icon: '💊', size: 14, opacity: 0.06 },
      { top: '88%', left: '55%', icon: '⚕', size: 18, opacity: 0.06 },
      { top: '5%', right: '40%', icon: '🛡', size: 16, opacity: 0.07 },
    ].map((item, i) => (
      <span key={i} style={{
        position: 'absolute',
        top: item.top,
        left: item.left,
        right: (item as any).right,
        fontSize: item.size,
        opacity: item.opacity,
        color: '#c9a84c',
        userSelect: 'none',
      }}>
        {item.icon}
      </span>
    ))}
  </div>
)

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'member' | 'staff'>('member')
  const [email, setEmail] = useState('')
  const [staffPin, setStaffPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) setError(error.message)
    else setOtpSent(true)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: staffPin })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b1220',
      color: 'white',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <BgIcons />

      {/* Subtle radial gradient glow top-left */}
      <div style={{
        position: 'absolute', top: '-100px', left: '-100px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* NAV */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#c9a84c"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#c9a84c"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#c9a84c"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#c9a84c"/>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '1px', color: 'white' }}>NFS</span>
            <span style={{
              fontSize: '12px', fontWeight: '700', letterSpacing: '2px',
              color: '#c9a84c', border: '1px solid #c9a84c',
              padding: '2px 7px', borderRadius: '4px',
            }}>INSURE</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', margin: '0 4px' }}>|</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Braam Health Centre</span>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* DEV NAV — remove before production */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '4px 6px', marginRight: '12px',
          }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,165,0,0.7)', fontWeight: '700', letterSpacing: '0.5px', marginRight: '6px', textTransform: 'uppercase' }}>
              🚧 Dev
            </span>
            {[
              { label: 'Member Portal', path: '/member/dashboard', color: '#10b981' },
              { label: 'Admin Portal', path: '/admin/dashboard', color: '#6366f1' },
              { label: 'Staff Portal', path: '/staff/dashboard', color: '#f59e0b' },
              { label: 'Register', path: '/register', color: '#94a3b8' },
            ].map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${link.color}55`,
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: link.color,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                {link.label}
              </button>
            ))}
          </div>

          <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none', padding: '0 8px' }}>Plans</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none', padding: '0 8px' }}>Apply</a>
          <button
            onClick={() => document.getElementById('signin-card')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              backgroundColor: '#c9a84c', color: '#0b1220',
              border: 'none', borderRadius: '8px',
              padding: '9px 22px', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', marginLeft: '8px',
            }}>
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO */}
      <main style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 48px 60px',
        maxWidth: '1300px', margin: '0 auto',
        gap: '60px',
      }}>
        {/* Left — hero copy */}
        <div style={{ flex: 1, maxWidth: '580px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '999px', padding: '6px 16px',
            marginBottom: '32px',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#c9a84c', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1.5px', color: '#c9a84c', textTransform: 'uppercase' }}>
              Healthcare Membership Platform
            </span>
          </div>

          <h1 style={{ fontSize: '56px', fontWeight: '700', lineHeight: '1.15', margin: '0 0 12px', color: 'white' }}>
            Ensuring quality<br />general practice
          </h1>
          <h1 style={{ fontSize: '56px', fontWeight: '700', lineHeight: '1.15', margin: '0 0 28px', color: '#c9a84c' }}>
            for all, locally and<br />globally
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', lineHeight: '1.7', marginBottom: '40px', maxWidth: '480px' }}>
            Unlimited GP consultations, dispensed medication, and health screenings —
            powered by Braam Health Centre and NFS Insure FSP 53910.
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '44px' }}>
            {[
              { icon: '♡', text: 'Plans from R499/month — cancel anytime' },
              { icon: '⚕', text: 'GP consultations, screenings & dispensed medication' },
              { icon: '🛡', text: 'Chronic medication programme included' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                  background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px',
                }}>
                  {item.icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px' }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button style={{
              backgroundColor: '#c9a84c', color: '#0b1220',
              border: 'none', borderRadius: '10px',
              padding: '14px 28px', fontSize: '15px', fontWeight: '700',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              View all plans <span style={{ fontSize: '16px' }}>›</span>
            </button>
            <button style={{
              backgroundColor: 'transparent', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px',
              padding: '14px 28px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer',
            }}>
              Apply for membership
            </button>
          </div>

          {/* Clinic info footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '44px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}>
              🏥
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              Braam Health Centre · Dr M J Diago · Braamfontein · 08:00–20:00 daily
            </span>
          </div>
        </div>

        {/* Right — sign in card */}
        <div id="signin-card" style={{
          width: '360px', flexShrink: 0,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(12px)',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>Sign in</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '24px' }}>
            Enter your credentials to continue
          </p>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: '8px',
            background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
            padding: '4px', marginBottom: '24px',
          }}>
            <button
              onClick={() => { setActiveTab('member'); setError(''); setOtpSent(false); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: activeTab === 'member' ? '#c9a84c' : 'transparent',
                color: activeTab === 'member' ? '#0b1220' : 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
              ✉ Member / Email
            </button>
            <button
              onClick={() => { setActiveTab('staff'); setError(''); setOtpSent(false); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: activeTab === 'staff' ? '#c9a84c' : 'transparent',
                color: activeTab === 'staff' ? '#0b1220' : 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
              🔑 Staff
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
              color: '#fca5a5', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Member OTP flow */}
          {activeTab === 'member' && !otpSent && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>✉</span>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    style={{
                      width: '100%', padding: '11px 14px 11px 36px',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px', color: 'white', fontSize: '14px',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px',
                background: '#c9a84c', color: '#0b1220',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Sending...' : 'Send verification code'}
              </button>
            </form>
          )}

          {/* Member OTP verify */}
          {activeTab === 'member' && otpSent && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>
                A verification code was sent to <strong style={{ color: 'white' }}>{email}</strong>
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  Verification code
                </label>
                <input
                  type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code" required maxLength={6}
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', color: 'white', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center',
                  }}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px',
                background: '#c9a84c', color: '#0b1220',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Verifying...' : 'Verify & sign in'}
              </button>
              <button type="button" onClick={() => setOtpSent(false)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: '13px', cursor: 'pointer', textDecoration: 'underline',
              }}>
                Use a different email
              </button>
            </form>
          )}

          {/* Staff PIN login */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  Email address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', color: 'white', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  Password
                </label>
                <input
                  type="password" value={staffPin} onChange={e => setStaffPin(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', color: 'white', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px',
                background: '#c9a84c', color: '#0b1220',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* Footer trust badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
              NFS Insure · FSP No. 53910 · Secured platform
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
