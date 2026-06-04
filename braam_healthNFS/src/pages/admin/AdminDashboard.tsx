import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', backgroundColor: '#0d1b2e', color: 'white', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '16px' }}>NFS</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#c9a84c', border: '1px solid #c9a84c', padding: '1px 5px', borderRadius: '3px' }}>INSURE</span>
          </div>
          <p style={{ color: '#6b8caa', fontSize: '11px', marginTop: '4px' }}>Braam Health Centre · Admin</p>
        </div>
        {['Dashboard', 'Members', 'Applications', 'Onboarding', 'Appointments', 'Mandates', 'KYC Queue', 'Cards', 'Debit Orders', 'Audit Log'].map((item, i) => (
          <div key={item} style={{ padding: '10px 24px', fontSize: '14px', color: i === 0 ? 'white' : '#8aa0b8', backgroundColor: i === 0 ? '#1e2d3d' : 'transparent', cursor: 'pointer' }}>
            {item}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '24px' }}>
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </aside>
      <main style={{ flex: 1, backgroundColor: '#f4f5f7', padding: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0d1b2e', marginBottom: '4px' }}>Admin Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>Overview of membership platform metrics.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Total Members', value: '0', sub: '0 active' },
            { label: 'Monthly Revenue', value: 'R 0', sub: '0% collection' },
            { label: 'Consultations', value: '0', sub: 'This month' },
            { label: 'Pending Items', value: '0', sub: 'Requires action' }
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{card.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#0d1b2e' }}>{card.value}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{card.sub}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}