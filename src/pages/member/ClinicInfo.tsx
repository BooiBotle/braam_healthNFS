import { useNavigate } from "react-router-dom";
import { C, S, Icon, Btn, Card, ContactRow } from "../../components/shared";

export default function ClinicInfo() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitle}>Clinic Information</div>
      <div style={{ ...S.pageSub, marginBottom:20 }}>Braam Health Centre is open 24/7, every day of the year.</div>

      <div style={{ background:`linear-gradient(120deg, ${C.navy}, ${C.tealDk})`, borderRadius:12, padding:"18px 22px", display:"flex", alignItems:"center", gap:14, color:C.white, marginBottom:22 }}>
        <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:99, width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name="clock" size={20} color={C.white}/>
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:15.5 }}>Open 24 hours, 7 days a week</div>
          <div style={{ fontSize:12.5, opacity:.85 }}>Dr M J Diago · General Practice · No appointment needed for members</div>
        </div>
      </div>

      <div style={{ ...S.grid(2, 18), marginBottom:18 }}>
        <Card>
          <div style={S.label}>CONTACT</div>
          <div style={{ display:"flex", flexDirection:"column", gap:16, marginTop:14 }}>
            <ContactRow icon="phone" label="Phone" value="+27 10 011 0010"/>
            <ContactRow icon="mail" label="Email" value="info@nfs.insure"/>
            <ContactRow icon="chat" label="WhatsApp" value="Chat on WhatsApp" link/>
          </div>
        </Card>
        <Card>
          <div style={S.label}>ADDRESS</div>
          <div style={{ display:"flex", gap:12, marginTop:14 }}>
            <Icon name="pin" size={16} color={C.grey500}/>
            <div style={{ fontSize:13.5, color:C.navy, lineHeight:1.7 }}>
              <strong>Braam Health Centre</strong><br/>
              Eagle Canyon Office Park<br/>
              Cnr Christiaan De Wet &amp; Dolfyn St<br/>
              Randpark Ridge, 2154
            </div>
          </div>
          <Btn variant="secondary" size="sm" sx={{ width:"100%", justifyContent:"center", marginTop:14 }}><Icon name="arrowRight" size={12}/>Get Directions</Btn>
        </Card>
      </div>

      <Card sx={{ marginBottom:18 }}>
        <div style={S.label}>OPERATING HOURS</div>
        {["Monday – Friday","Saturday","Sunday","Public Holidays"].map((d,i)=>(
          <div key={d} style={{ display:"flex", justifyContent:"space-between", padding:"11px 0", borderTop: i>0?`1px solid ${C.grey100}`:"none" }}>
            <span style={{ fontSize:13.5, color:C.grey700 }}>{d}</span>
            <span style={{ fontSize:13.5, fontWeight:700, color:C.green }}>Open 24 hours</span>
          </div>
        ))}
      </Card>

      <Card sx={{ marginBottom:18 }}>
        <div style={S.label}>SERVICES INCLUDED WITH YOUR MEMBERSHIP</div>
        <div style={{ ...S.grid(2,10), marginTop:14 }}>
          {["General practice consultations","Chronic condition management","Routine check-ups & wellness screenings","Wound care & minor procedures","Emergency & after-hours care","Prescribed medication dispensed on-site","Blood pressure & glucose monitoring","Referrals to specialists"].map(s=>(
            <div key={s} style={{ display:"flex", gap:9, alignItems:"center" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:C.teal, flexShrink:0 }}/>
              <span style={{ fontSize:13, color:C.grey700 }}>{s}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card sx={{ background:C.offWhite, border:"none", display:"flex", gap:12, alignItems:"flex-start", marginBottom:18 }}>
        <Icon name="shield" size={17} color={C.navy}/>
        <div style={{ fontSize:12.5, color:C.grey700, lineHeight:1.6 }}>
          This membership is administered by <strong>NFS Insure Consultant (Pty) Ltd</strong>, Authorised FSP No. 53910, regulated by the FSCA. All member data is handled in accordance with POPIA.
        </div>
      </Card>

      <Btn variant="whatsapp" size="lg" sx={{ width:"100%", justifyContent:"center" }}>
        <Icon name="chat" size={16}/> Chat with Support on WhatsApp
      </Btn>
    </div>
  );
}
