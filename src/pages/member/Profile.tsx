import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProfile, type Profile } from "../../lib/api/member";
import { C, S, Icon, Btn, Card, Detail } from "../../components/shared";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await getProfile(user.id);
        setProfile(data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>Profile</div>
          <div style={S.pageSub}>Your personal and contact information.</div>
        </div>
        <Btn variant="secondary" size="md"><Icon name="edit" size={13}/>Edit Profile</Btn>
      </div>

      <div style={{ ...S.grid(2,18), marginBottom:18 }}>
        <Card>
          <div style={S.cardTitle}>Personal Details</div>
          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:16 }}>
            <Detail label="Full Name" value={profile ? `${profile.first_name} ${profile.last_name}` : user?.name || ""} />
            <Detail label="SA ID Number" value={profile?.sa_id_number || "Not provided"} muted={!profile?.sa_id_number}/>
            <Detail label="Date of Birth" value="Not provided" muted/>
          </div>
        </Card>
        <Card>
          <div style={S.cardTitle}>Contact Information</div>
          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:16 }}>
            <Detail label="Phone Number" value={profile?.phone || "Not provided"} muted={!profile?.phone}/>
            <Detail label="Email Address" value={profile?.email || user?.email || ""}/>
            <Detail label="Physical Address" value="Not provided" muted/>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={S.cardTitle}>Banking Details</div>
          <Btn variant="secondary" size="sm"><Icon name="shield" size={12}/>Edit Banking</Btn>
        </div>
        <div style={{ ...S.grid(2,18), marginTop:16 }}>
          <Detail label="Bank Name" value="Not provided" muted/>
          <Detail label="Account Holder" value="Not provided" muted/>
          <Detail label="Account Number" value="Not provided" muted/>
          <Detail label="Collection Date" value="1st of month"/>
        </div>
        <div style={{ fontSize:12, color:C.grey500, marginTop:14, display:"flex", gap:6, alignItems:"center" }}>
          <Icon name="shield" size={12} color={C.grey500}/> Editing banking details requires identity verification via SMS.
        </div>
      </Card>
    </div>
  );
}
