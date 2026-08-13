import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getConsultations, getMemberDetails, type Consultation } from "../../lib/api/member";
import { C, S, Icon, Card, badge } from "../../components/shared";

export default function Consultations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) {
          const data = await getConsultations(mem.id);
          setConsultations(data);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitle}>Consultation History</div>
      <div style={{ ...S.pageSub, marginBottom:22 }}>Your past visits to Braam Health Centre.</div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 20, color: C.grey500 }}>Loading consultations...</div>
        ) : consultations.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: 20, color: C.grey500 }}>No consultations found.</div>
          </Card>
        ) : consultations.map((c) => {
          const dateStr = c.visited_at || c.consultation_date || new Date().toISOString();
          const date = new Date(dateStr);
          const mon = date.toLocaleString('default', { month: 'short' });
          const day = date.getDate();
          const year = date.getFullYear();
          const weekday = date.toLocaleString('default', { weekday: 'long' });
          
          return (
            <Card key={c.id}>
              <div style={{ display:"flex", gap:18 }}>
                <div style={{ width:64, flexShrink:0, textAlign:"center" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.grey500, textTransform:"uppercase" }}>{mon}</div>
                  <div style={{ fontSize:24, fontWeight:800, color:C.navy }}>{day}</div>
                  <div style={{ fontSize:11, color:C.grey500 }}>{year}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13.5, color:C.navy, lineHeight:1.55 }}>{c.clinical_notes || c.consultation_type.replace('_', ' ')}</div>
                  <div style={{ fontSize:12, color:C.grey500, marginTop:6 }}>{weekday} at {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div style={{ flexShrink:0 }}>
                  <span style={{ ...badge(C.greenBg, C.green), border:`1px solid ${C.green}33` }}>⚕ Meds</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
