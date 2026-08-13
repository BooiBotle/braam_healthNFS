import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { C, S, Icon, Btn, Card, Detail } from "../../components/shared";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [formData, setFormData] = useState<any>({
    first_name: '',
    last_name: '',
    sa_id_number: '',
    passport_number: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    suburb: '',
    city: '',
    province: 'Gauteng',
    postal_code: '',
    country: 'ZA'
  });

  useEffect(() => {
    async function load() {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setFormData({
            ...data,
            first_name: data.first_name || user.name.split(' ')[0] || '',
            last_name: data.last_name || user.name.split(' ')[1] || '',
            email: data.email || user.email
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      if (user?.id) {
        const fullName = `${formData.first_name} ${formData.last_name}`.trim();
        const { error } = await supabase.from('profiles').update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          full_name: fullName,
          sa_id_number: formData.sa_id_number,
          passport_number: formData.passport_number,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender,
          phone: formData.phone,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          suburb: formData.suburb,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
          country: formData.country || 'ZA',
          updated_at: new Date().toISOString()
        }).eq('id', user.id);

        if (error) throw error;
        setProfile({ ...formData, full_name: fullName });
        setMsg('Profile details saved successfully!');
        setTimeout(() => { setEditing(false); setMsg(''); }, 1000);
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setMsg(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>Member Profile</div>
          <div style={S.pageSub}>Manage your full profile details and address info.</div>
        </div>
        <Btn variant={editing ? "primary" : "secondary"} size="md" onClick={() => setEditing(!editing)}>
          <Icon name="edit" size={13}/> {editing ? "Cancel Editing" : "Edit Profile"}
        </Btn>
      </div>

      {editing ? (
        <Card sx={{ marginBottom: 18 }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={S.cardTitle}>Edit Personal & Address Details</div>
            
            <div style={{ ...S.grid(2, 14) }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>First Name</label>
                <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.grey300}`, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Last Name</label>
                <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.grey300}`, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>SA ID Number</label>
                <input type="text" value={formData.sa_id_number || ''} onChange={e => setFormData({ ...formData, sa_id_number: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.grey300}`, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Passport Number</label>
                <input type="text" value={formData.passport_number || ''} onChange={e => setFormData({ ...formData, passport_number: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.grey300}`, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Mobile Phone</label>
                <input type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.grey300}`, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Address Line 1</label>
                <input type="text" value={formData.address_line1 || ''} onChange={e => setFormData({ ...formData, address_line1: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.grey300}`, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>City</label>
                <input type="text" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.grey300}`, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Province</label>
                <input type="text" value={formData.province || ''} onChange={e => setFormData({ ...formData, province: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.grey300}`, marginTop: 4 }} />
              </div>
            </div>

            {msg && <div style={{ fontSize: 12, color: msg.includes('Failed') ? C.red : C.green }}>{msg}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn variant="secondary" size="md" onClick={() => setEditing(false)}>Cancel</Btn>
              <button type="submit" disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, background: C.navy, color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <div style={{ ...S.grid(2,18), marginBottom:18 }}>
          <Card>
            <div style={S.cardTitle}>Personal Details</div>
            <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:16 }}>
              <Detail label="Full Name" value={profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`} />
              <Detail label="SA ID Number" value={profile?.sa_id_number || "Not provided"} muted={!profile?.sa_id_number}/>
              <Detail label="Passport" value={profile?.passport_number || "Not provided"} muted={!profile?.passport_number}/>
              <Detail label="Date of Birth" value={profile?.date_of_birth || "Not provided"} muted={!profile?.date_of_birth}/>
            </div>
          </Card>
          <Card>
            <div style={S.cardTitle}>Contact Information</div>
            <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:16 }}>
              <Detail label="Phone Number" value={profile?.phone || "Not provided"} muted={!profile?.phone}/>
              <Detail label="Email Address" value={profile?.email || user?.email || ""}/>
              <Detail label="Physical Address" value={profile?.address_line1 ? `${profile.address_line1}, ${profile.city || ''}` : "Not provided"} muted={!profile?.address_line1}/>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
