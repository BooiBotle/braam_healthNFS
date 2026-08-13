import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { C, S, Icon, Btn, Card, ContactRow } from "../../components/shared";
import { type ClinicDetails } from "../../lib/api/member";

export default function ClinicInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clinic, setClinic] = useState<ClinicDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClinic() {
      if (user?.clinicId) {
        const { data } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', user.clinicId)
          .single();
        if (data) setClinic(data);
      } else {
        // Fallback to first clinic
        const { data } = await supabase.from('clinics').select('*').limit(1).single();
        if (data) setClinic(data);
      }
      setLoading(false);
    }
    loadClinic();
  }, [user]);

  const clinicName = clinic?.name || "Braam Health Centre";
  const doctor = clinic?.doctor_name || "Dr M J Diago";
  const phone = clinic?.phone || "+27 10 011 0010";
  const email = clinic?.email || "info@nfs.insure";
  const whatsapp = clinic?.whatsapp || "+27 82 000 0000";
  const address = clinic?.address_line1 || "Eagle Canyon Office Park, Randpark Ridge";

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitle}>Clinic Information</div>
      <div style={{ ...S.pageSub, marginBottom:20 }}>{clinicName} is available for all your primary healthcare needs.</div>

      <div style={{ background:`linear-gradient(120deg, ${C.navy}, ${C.tealDk})`, borderRadius:12, padding:"18px 22px", display:"flex", alignItems:"center", gap:14, color:C.white, marginBottom:22 }}>
        <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:99, width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name="clock" size={20} color={C.white}/>
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:15.5 }}>{clinic?.open_24h ? 'Open 24 hours, 7 days a week' : 'Operating Branch Facility'}</div>
          <div style={{ fontSize:12.5, opacity:.85 }}>{doctor} · {clinic?.specialty || 'General Practice'} · No appointment needed for members</div>
        </div>
      </div>

      <div style={{ ...S.grid(2, 18), marginBottom:18 }}>
        <Card>
          <div style={S.label}>CONTACT DETAILS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:16, marginTop:14 }}>
            <ContactRow icon="phone" label="Phone" value={phone}/>
            <ContactRow icon="mail" label="Email" value={email}/>
            <ContactRow icon="chat" label="WhatsApp" value={whatsapp} link/>
          </div>
        </Card>
        <Card>
          <div style={S.label}>LOCATION ADDRESS</div>
          <div style={{ display:"flex", gap:12, marginTop:14 }}>
            <Icon name="pin" size={16} color={C.grey500}/>
            <div style={{ fontSize:13.5, color:C.navy, lineHeight:1.7 }}>
              <strong>{clinicName}</strong><br/>
              {address}<br/>
              {clinic?.suburb || clinic?.city || 'South Africa'}
            </div>
          </div>
        </Card>
      </div>

      <Card sx={{ marginBottom:18 }}>
        <div style={S.label}>OPERATING HOURS</div>
        {["Monday – Friday","Saturday","Sunday","Public Holidays"].map((d,i)=>(
          <div key={d} style={{ display:"flex", justifyContent:"space-between", padding:"11px 0", borderTop: i>0?`1px solid ${C.grey100}`:"none" }}>
            <span style={{ fontSize:13.5, color:C.grey700 }}>{d}</span>
            <span style={{ fontSize:13.5, fontWeight:700, color:C.green }}>{clinic?.open_24h ? 'Open 24 hours' : 'Open 08:00 - 18:00'}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
