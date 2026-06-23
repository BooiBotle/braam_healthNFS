import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Plus, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { User, CreditCard, Shield, Activity, Calendar } from 'lucide-react';
const AdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [clinicId, setClinicId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  useEffect(() => {
    fetchMembersAndData();
  }, []);

  const fetchMembersAndData = async () => {
    setLoading(true);
    try {
      // Fetch active clinic
      const { data: clinicData } = await supabase.from('clinics').select('id').limit(1).single();
      if (clinicData) setClinicId(clinicData.id);

      // Fetch plans for dropdown
      const { data: plansData } = await supabase.from('plans').select('id, name').eq('is_active', true);
      if (plansData) {
        setPlans(plansData);
        if (plansData.length > 0) {
          // form moved to AdminOnboarding
        }
      }

      // Fetch members
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          status,
          card_number,
          created_at,
          profiles (first_name, last_name, sa_id_number, passport_number),
          plans (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        setFetchError(error.message || 'Failed to fetch members');
        throw error;
      }
      console.log('Fetched members:', data);
      setMembers(data || []);
      setFetchError(null);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      setFetchError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Quick Stats
  const activeCount = members.filter(m => m.status === 'active').length;
  const suspendedCount = members.filter(m => m.status === 'suspended').length;
  
  const filteredMembers = members.filter(member => {
    const fullName = `${member.profiles?.first_name} ${member.profiles?.last_name}`.toLowerCase();
    const idNumber = member.profiles?.sa_id_number || member.profiles?.passport_number || '';
    const cardNumber = member.card_number || '';
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || idNumber.includes(query) || cardNumber.toLowerCase().includes(query);
  });

  const getInitials = (first: string, last: string) => {
    return `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'suspended': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'cancelled': return { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', border: 'rgba(100, 116, 139, 0.3)' };
      default: return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'ID Number', 'Card Number', 'Plan', 'Status', 'Joined Date'];
    const rows = filteredMembers.map(m => [
      `${m.profiles?.first_name} ${m.profiles?.last_name}`,
      m.profiles?.sa_id_number || m.profiles?.passport_number || 'N/A',
      m.card_number || 'No card',
      m.plans?.name || 'N/A',
      m.status,
      new Date(m.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <>
      <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Members
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage platform members.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button 
            onClick={handleExportCSV}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.625rem 1.25rem', borderRadius: '8px', 
              background: '#ffffff', color: '#0f172a', 
              border: '1px solid #e2e8f0', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <ShieldCheck size={16} /> Export CSV
          </button>
          
          <Link 
            to="/admin/onboarding"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.625rem 1.25rem', borderRadius: '8px', 
              background: 'linear-gradient(135deg, #1c2340 0%, #2a345c 100%)', color: '#ffffff', textDecoration: 'none',
              border: 'none', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(28, 35, 64, 0.2)'
            }}
          >
            <Plus size={16} /> Add New User
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <motion.div whileHover={{ y: -2 }} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Members</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{members.length}</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Members</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{activeCount}</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suspended Accounts</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{suspendedCount}</div>
        </motion.div>
      </div>

      <div style={{ 
        background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' 
      }}>
        
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or card number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '0.875rem', color: '#0f172a', outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Number</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading members...</td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>
                    Error fetching members: {fetchError}
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No members found.</td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => {
                  const statusStyling = getStatusColor(member.status);
                  return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={member.id} 
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #1c2340 0%, #3b487c 100%)', 
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(28, 35, 64, 0.2)'
                        }}>
                          {getInitials(member.profiles?.first_name, member.profiles?.last_name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {member.profiles?.first_name} {member.profiles?.last_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                            {member.card_number || 'No NFC Card'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                      {member.profiles?.sa_id_number || member.profiles?.passport_number || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>
                      {member.plans?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ 
                        padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                        background: statusStyling.bg,
                        color: statusStyling.color,
                        border: `1px solid ${statusStyling.border}`,
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        {member.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                      {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedMember(member)}
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          padding: '0.5rem 1rem', borderRadius: '8px', 
                          background: '#f8fafc', color: '#1c2340', border: '1px solid #e2e8f0',
                          fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        View Profile
                      </button>
                    </td>
                  </motion.tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>


    </motion.div>

      <Modal 
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="Member Profile"
        maxWidth="600px"
      >
        {selectedMember && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, #1c2340 0%, #3b487c 100%)', 
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 600
              }}>
                {(selectedMember.profiles?.first_name?.[0] || '') + (selectedMember.profiles?.last_name?.[0] || '')}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  {selectedMember.profiles?.first_name} {selectedMember.profiles?.last_name}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Joined {new Date(selectedMember.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <User size={14} /> ID Number
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedMember.profiles?.sa_id_number || selectedMember.profiles?.passport_number || 'N/A'}</div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Shield size={14} /> Active Plan
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedMember.plans?.name || 'None'}</div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <CreditCard size={14} /> NFC Card Number
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedMember.card_number || 'Not Issued'}</div>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Activity size={14} /> Status
                </div>
                <div style={{ color: '#0f172a', fontWeight: 500, textTransform: 'capitalize' }}>{selectedMember.status}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>Edit Member</button>
               <button style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>Suspend Account</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminMembers;
