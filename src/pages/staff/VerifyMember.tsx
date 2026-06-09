import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, User, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const VerifyMember = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    setMember(null);

    try {
      // Search first by card_number
      let query = supabase
        .from('members')
        .select(`
          *,
          profiles!inner (full_name, sa_id_number, phone, email, avatar_url),
          plans (name, consultations_pm)
        `);

      // If search term looks like an ID number (numeric and long), try filtering by it
      if (/^\d{10,}$/.test(searchTerm.trim())) {
        query = query.eq('profiles.sa_id_number', searchTerm.trim());
      } else {
        query = query.eq('card_number', searchTerm.trim().toUpperCase());
      }

      const { data, error } = await query.single();

      if (error) throw error;
      
      // Also fetch consultation count for this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', data.id)
        .gte('consultation_date', startOfMonth);

      setMember({ ...data, consultations_this_month: count || 0 });

    } catch (err) {
      console.error(err);
      setError('Member not found. Please check the card number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      <div style={{ marginBottom: 'var(--sp-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
          Verify Member
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Scan or enter member card number to verify eligibility.</p>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-8)', maxWidth: '600px' }}>
        <form onSubmit={handleSearch} className="responsive-flex">
          <div className="form-group" style={{ flex: 1, marginBottom: 0, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter Card Number (e.g. NFS8 9012 3456 7)" 
              style={{ paddingLeft: 'var(--sp-10)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Verify'}
          </button>
        </form>
        {error && <div style={{ color: 'var(--status-error)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-3)' }}>{error}</div>}
      </div>

      {member && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-6)' }}>
          
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)' }}>
                {member.profiles?.avatar_url ? <img src={member.profiles.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <User size={32} />}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', margin: 0 }}>{member.profiles?.full_name}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>ID: {member.profiles?.sa_id_number}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-2)', borderBottom: '1px solid var(--border)' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Status</span>
                 <span className={`section-badge ${member.status === 'active' ? 'section-badge-gold' : ''}`}>
                   {member.status?.toUpperCase()}
                 </span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-2)', borderBottom: '1px solid var(--border)' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Card Number</span>
                 <span style={{ fontWeight: 600 }}>{member.card_number}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-2)', borderBottom: '1px solid var(--border)' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Plan</span>
                 <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{member.plans?.name}</span>
               </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)' }}>
              <Activity size={20} color="var(--navy)" />
              <h3 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Consultation Usage</h3>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
               <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-heading)' }}>
                 {member.consultations_this_month} <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)' }}>/ {member.plans?.consultations_pm === -1 ? 'Unlimited' : member.plans?.consultations_pm}</span>
               </div>
               <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Visits used this month</div>
            </div>

            {member.plans?.consultations_pm !== -1 && member.consultations_this_month >= member.plans?.consultations_pm && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
                <AlertTriangle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: 'var(--text-sm)' }}>
                  <strong>Limit Reached.</strong> This member has exhausted their consultation limit for this month. Subsequent visits may require out-of-pocket payment.
                </div>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'var(--sp-4)' }} 
              disabled={member.status !== 'active'}
              onClick={async () => {
                 // Register visit logic would go here
                 alert('Consultation registered successfully!');
              }}
            >
              Register New Visit
            </button>
          </div>

        </div>
      )}

    </motion.div>
  );
};

export default VerifyMember;




