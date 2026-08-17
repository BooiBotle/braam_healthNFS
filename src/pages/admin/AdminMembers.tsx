import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Plus, X, ShieldCheck, Shield, Activity, CreditCard, User, CheckCircle, AlertTriangle, RefreshCw, PauseCircle, PlayCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { logAudit } from '../../lib/api/audit';

const STATUS_CONFIG: Record<string, { bg: string; color: string; border: string; glow: string; label: string }> = {
  active:    { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.3)',  glow: 'rgba(16,185,129,0.6)',  label: 'Active' },
  suspended: { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', border: 'rgba(239,68,68,0.3)',   glow: 'rgba(239,68,68,0.6)',   label: 'Suspended' },
  pending:   { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)',  glow: 'rgba(245,158,11,0.6)',  label: 'Pending' },
  cancelled: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: 'rgba(100,116,139,0.3)', glow: 'rgba(100,116,139,0.5)', label: 'Cancelled' },
  on_hold:   { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.3)',  glow: 'rgba(251,146,60,0.6)',  label: 'On Hold' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.cancelled;
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
      textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '5px',
    }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.color, boxShadow: `0 0 4px ${sc.glow}` }} />
      {sc.label}
    </span>
  );
};

const AdminMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Inline editing state
  const [newPlanId, setNewPlanId] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [showHoldForm, setShowHoldForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [{ data: plansData }, { data: membersData, error: membersError }] = await Promise.all([
        supabase.from('plans').select('id, name, consultations_pm, monthly_fee_cents, includes_medication, includes_24h_access, includes_chronic').eq('is_active', true).order('display_order'),
        supabase.from('members')
          .select(`
            id, status, card_number, created_at, plan_id,
            profiles (first_name, last_name, sa_id_number, passport_number, phone, email, avatar_url),
            plans (id, name, consultations_pm, monthly_fee_cents)
          `)
          .order('created_at', { ascending: false }),
      ]);

      if (membersError) throw membersError;
      setPlans(plansData || []);
      setMembers(membersData || []);
    } catch (err: any) {
      setFetchError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // When a member is selected, pre-fill the plan dropdown
  useEffect(() => {
    if (selectedMember) {
      setNewPlanId(selectedMember.plan_id || '');
      setUpdateMsg('');
      setShowHoldForm(false);
      setHoldReason('');
    }
  }, [selectedMember]);

  const handleUpdatePlan = async () => {
    if (!selectedMember || !newPlanId) return;
    setUpdating(true);
    setUpdateMsg('');
    try {
      const { error } = await supabase
        .from('members')
        .update({ plan_id: newPlanId, updated_at: new Date().toISOString() })
        .eq('id', selectedMember.id);
      if (error) throw error;

      const newPlan = plans.find(p => p.id === newPlanId);
      setUpdateMsg(`✓ Plan updated to "${newPlan?.name || 'selected plan'}" successfully.`);
      setSelectedMember((prev: any) => ({ ...prev, plan_id: newPlanId, plans: newPlan }));
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, plan_id: newPlanId, plans: newPlan } : m));
    } catch (err: any) {
      setUpdateMsg('⚠ Failed: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSetStatus = async (status: string) => {
    if (!selectedMember) return;
    setUpdating(true);
    setUpdateMsg('');
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      const { error } = await supabase.from('members').update(updateData).eq('id', selectedMember.id);
      if (error) throw error;
      
      const memberName = `${selectedMember.profiles?.first_name || ''} ${selectedMember.profiles?.last_name || ''}`.trim();
      
      await logAudit({
        performed_by: user?.id || 'system',
        performer_name: user?.name || 'Admin',
        action: `member_status_${status}`,
        entity_type: 'member',
        entity_id: selectedMember.id,
        details: `Member status for ${memberName} was changed to ${status} by ${user?.name || 'Admin'}`,
      });

      const label = STATUS_CONFIG[status]?.label || status;
      setUpdateMsg(`✓ Member status changed to "${label}".`);
      setSelectedMember((prev: any) => ({ ...prev, status }));
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, status } : m));
      setShowHoldForm(false);
    } catch (err: any) {
      setUpdateMsg('⚠ Failed: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'ID Number', 'Card Number', 'Plan', 'Consults/Month', 'Status', 'Joined'];
    const rows = filteredMembers.map(m => [
      `${m.profiles?.first_name} ${m.profiles?.last_name}`,
      m.profiles?.sa_id_number || m.profiles?.passport_number || 'N/A',
      m.card_number || 'No card',
      m.plans?.name || 'N/A',
      m.plans?.consultations_pm ?? 'N/A',
      m.status,
      new Date(m.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMembers = members.filter(m => {
    const name = `${m.profiles?.first_name || ''} ${m.profiles?.last_name || ''}`.toLowerCase();
    const id = m.profiles?.sa_id_number || m.profiles?.passport_number || '';
    const card = m.card_number || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || id.includes(q) || card.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    suspended: members.filter(m => m.status === 'suspended').length,
    on_hold: members.filter(m => m.status === 'on_hold').length,
    no_plan: members.filter(m => !m.plan_id).length,
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1200px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Members</h1>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>Manage members, update plans and control account status.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '8px', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              <Download size={15} /> Export CSV
            </button>
            <Link to="/admin/onboarding" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '8px', background: 'linear-gradient(135deg, #1c2340, #2a345c)', color: '#fff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              <Plus size={15} /> Add New Member
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '2rem' }}>
          {[
            { label: 'Total Members', value: stats.total, color: '#0f172a' },
            { label: 'Active', value: stats.active, color: '#10b981' },
            { label: 'Suspended', value: stats.suspended, color: '#ef4444' },
            { label: 'On Hold', value: stats.on_hold, color: '#fb923c' },
            { label: 'No Plan', value: stats.no_plan, color: '#f59e0b' },
          ].map(s => (
            <motion.div key={s.label} whileHover={{ y: -2 }} style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, color: s.color, marginTop: '0.25rem' }}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by name, ID, or card number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', 'active', 'suspended', 'on_hold', 'pending', 'cancelled'].map(s => {
                const sc = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    border: '1px solid', cursor: 'pointer', textTransform: 'capitalize',
                    background: statusFilter === s ? '#0f172a' : '#fff',
                    color: statusFilter === s ? '#fff' : '#64748b',
                    borderColor: statusFilter === s ? '#0f172a' : '#e2e8f0',
                  }}>
                    {s === 'all' ? '🗂 All' : (sc?.label || s)}
                  </button>
                );
              })}
            </div>
            <button onClick={fetchData} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Member', 'ID Number', 'Plan', 'Consults/Mo', 'Status', 'Joined', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 6 ? 'right' : 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading members...</td></tr>
                ) : fetchError ? (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>Error: {fetchError}</td></tr>
                ) : filteredMembers.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No members found.</td></tr>
                ) : (
                  filteredMembers.map((member, idx) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      whileHover={{ backgroundColor: '#f8fafc' }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #1c2340, #3b487c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>
                            {((member.profiles?.first_name || '?')[0] + (member.profiles?.last_name || '?')[0]).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                              {member.profiles?.first_name} {member.profiles?.last_name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '1px', fontFamily: 'monospace' }}>
                              {member.card_number || 'No card'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>
                        {member.profiles?.sa_id_number || member.profiles?.passport_number || '—'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {member.plans ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>{member.plans.name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>R{((member.plans.monthly_fee_cents || 0) / 100).toFixed(0)}/mo</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.25)' }}>
                            No plan assigned
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: member.plans ? '#0f172a' : '#cbd5e1' }}>
                          {member.plans ? (member.plans.consultations_pm === -1 ? '∞' : member.plans.consultations_pm) : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <StatusBadge status={member.status} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '13px', color: '#64748b' }}>
                        {new Date(member.created_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedMember(member)}
                          style={{ padding: '6px 14px', borderRadius: '8px', background: '#f8fafc', color: '#1c2340', border: '1px solid #e2e8f0', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Manage
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </motion.div>

      {/* ─── Member Management Modal ─── */}
      <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title="Manage Member" maxWidth="640px">
        {selectedMember && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Member Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #1c2340, #3b487c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600, flexShrink: 0 }}>
                {((selectedMember.profiles?.first_name || '?')[0] + (selectedMember.profiles?.last_name || '?')[0]).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '1.125rem', color: '#0f172a' }}>
                  {selectedMember.profiles?.first_name} {selectedMember.profiles?.last_name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{selectedMember.card_number || 'No card'}</span>
                  <StatusBadge status={selectedMember.status} />
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { icon: <User size={13} />, label: 'SA ID', value: selectedMember.profiles?.sa_id_number || 'N/A' },
                { icon: <CreditCard size={13} />, label: 'Card', value: selectedMember.card_number || 'Not issued' },
                { icon: <Shield size={13} />, label: 'Current Plan', value: selectedMember.plans?.name || 'None' },
                { icon: <Activity size={13} />, label: 'Consults/Month', value: selectedMember.plans?.consultations_pm != null ? (selectedMember.plans.consultations_pm === -1 ? 'Unlimited' : selectedMember.plans.consultations_pm) : 'N/A' },
              ].map(row => (
                <div key={row.label} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    {row.icon} {row.label}
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '13.5px' }}>{row.value}</div>
                </div>
              ))}
            </div>

            {/* ─── Change Plan ─── */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} color="#1c2340" /> Change Membership Plan
              </div>

              <div style={{ marginBottom: '10px', fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                Changing the plan will immediately update the member's consultation allowance. Current month usage is not reset.
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={newPlanId}
                  onChange={e => setNewPlanId(e.target.value)}
                  style={{ width: '100%', padding: '12px 36px 12px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="">— Select a plan —</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R{(p.monthly_fee_cents / 100).toFixed(0)}/mo · {p.consultations_pm === -1 ? 'Unlimited' : p.consultations_pm} consults/mo
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>

              {/* Show selected plan details */}
              {newPlanId && (() => {
                const sel = plans.find(p => p.id === newPlanId);
                if (!sel) return null;
                return (
                  <div style={{ marginTop: '10px', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '12.5px' }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '6px' }}>Plan Preview: {sel.name}</div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#166534' }}>
                      <span>🩺 {sel.consultations_pm === -1 ? 'Unlimited' : sel.consultations_pm} consults/mo</span>
                      {sel.includes_medication && <span>💊 Medication</span>}
                      {sel.includes_24h_access && <span>🕐 24/7 Access</span>}
                      {sel.includes_chronic && <span>📋 Chronic</span>}
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={handleUpdatePlan}
                disabled={!newPlanId || newPlanId === selectedMember.plan_id || updating}
                style={{
                  marginTop: '12px', width: '100%', padding: '12px',
                  borderRadius: '10px', fontWeight: 700, fontSize: '14px',
                  border: 'none', cursor: (!newPlanId || newPlanId === selectedMember.plan_id || updating) ? 'not-allowed' : 'pointer',
                  background: (!newPlanId || newPlanId === selectedMember.plan_id || updating) ? '#f1f5f9' : '#1c2340',
                  color: (!newPlanId || newPlanId === selectedMember.plan_id || updating) ? '#94a3b8' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all .15s',
                }}
              >
                <RefreshCw size={15} /> {updating ? 'Updating...' : (newPlanId === selectedMember.plan_id ? 'Same plan selected' : 'Save Plan Change')}
              </button>
            </div>

            {/* ─── Account Status Controls ─── */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} /> Account Status Control
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px', lineHeight: 1.5 }}>
                Payments are handled outside the system. Use these controls to manually manage the member's access.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Activate */}
                <button
                  onClick={() => handleSetStatus('active')}
                  disabled={selectedMember.status === 'active' || updating}
                  style={{
                    padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                    border: '1px solid rgba(16,185,129,0.3)',
                    background: selectedMember.status === 'active' ? 'rgba(16,185,129,0.1)' : '#fff',
                    color: '#10b981', cursor: selectedMember.status === 'active' ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: selectedMember.status === 'active' ? 0.6 : 1,
                  }}
                >
                  <PlayCircle size={16} />
                  {selectedMember.status === 'active' ? '✓ Currently Active' : 'Activate Account'}
                </button>

                {/* Put on hold (non-payment) */}
                <button
                  onClick={() => setShowHoldForm(!showHoldForm)}
                  disabled={selectedMember.status === 'on_hold' || updating}
                  style={{
                    padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                    border: '1px solid rgba(251,146,60,0.3)',
                    background: selectedMember.status === 'on_hold' ? 'rgba(251,146,60,0.1)' : '#fff',
                    color: '#fb923c', cursor: selectedMember.status === 'on_hold' ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: selectedMember.status === 'on_hold' ? 0.6 : 1,
                  }}
                >
                  <PauseCircle size={16} />
                  {selectedMember.status === 'on_hold' ? '⏸ Account On Hold' : 'Put On Hold'}
                </button>

                {/* Suspend */}
                <button
                  onClick={() => handleSetStatus('suspended')}
                  disabled={selectedMember.status === 'suspended' || updating}
                  style={{
                    padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: selectedMember.status === 'suspended' ? 'rgba(239,68,68,0.1)' : '#fff',
                    color: '#ef4444', cursor: selectedMember.status === 'suspended' ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: selectedMember.status === 'suspended' ? 0.6 : 1,
                  }}
                >
                  <AlertTriangle size={16} />
                  {selectedMember.status === 'suspended' ? '⛔ Suspended' : 'Suspend Account'}
                </button>

                {/* Cancel */}
                <button
                  onClick={() => handleSetStatus('cancelled')}
                  disabled={selectedMember.status === 'cancelled' || updating}
                  style={{
                    padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                    border: '1px solid rgba(100,116,139,0.3)',
                    background: selectedMember.status === 'cancelled' ? 'rgba(100,116,139,0.1)' : '#fff',
                    color: '#64748b', cursor: selectedMember.status === 'cancelled' ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: selectedMember.status === 'cancelled' ? 0.6 : 1,
                  }}
                >
                  <X size={16} />
                  {selectedMember.status === 'cancelled' ? '✕ Cancelled' : 'Cancel Membership'}
                </button>
              </div>

              {/* On Hold explanation */}
              <AnimatePresence>
                {showHoldForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '12px', overflow: 'hidden' }}
                  >
                    <div style={{ padding: '14px', background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#c2410c', marginBottom: '8px' }}>
                        ⏸ Putting account on hold
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#92400e', lineHeight: 1.55, margin: '0 0 12px' }}>
                        This will <strong>prevent the member from using their plan benefits</strong> until the account is reactivated. Use this when payment has not been received. The member can still log in but consultations will be blocked.
                      </p>
                      <button
                        onClick={() => handleSetStatus('on_hold')}
                        disabled={updating}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#fb923c', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px' }}
                      >
                        {updating ? 'Updating...' : 'Confirm — Put Account On Hold'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Success/error message */}
            <AnimatePresence>
              {updateMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 500,
                    background: updateMsg.startsWith('✓') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${updateMsg.startsWith('✓') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    color: updateMsg.startsWith('✓') ? '#10b981' : '#ef4444',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  {updateMsg.startsWith('✓') ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                  {updateMsg}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminMembers;
