import { useAuth } from '../../context/AuthContext'

export default function MemberDashboard() {
  const { profile, signOut } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="text-lg font-bold text-blue-600 mb-8">HealthNFS</h2>
        <nav className="space-y-2">
          {['Dashboard', 'My Profile', 'Appointments', 'Records'].map(item => (
            <a key={item} href="#" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">{item}</a>
          ))}
        </nav>
        <button onClick={signOut} className="absolute bottom-6 left-6 text-sm text-red-500 hover:underline">Sign Out</button>
      </aside>
      <main className="ml-64 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome, {profile?.full_name ?? 'Member'} 👋</h1>
        <p className="text-gray-500 text-sm mb-8">Here's your health summary</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ label: 'Upcoming Appointments', value: '2' }, { label: 'Active Records', value: '5' }, { label: 'Notifications', value: '1' }].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}