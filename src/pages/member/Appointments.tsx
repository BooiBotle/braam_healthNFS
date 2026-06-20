import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAppointments, getMemberDetails, type Appointment } from "../../lib/api/member";
import { C, S, Icon, Btn, Card, badge } from "../../components/shared";

export default function Appointments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) {
          const data = await getAppointments(mem.id);
          setAppointments(data);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>Appointments</div>
          <div style={S.pageSub}>Request and track your clinic appointments.</div>
        </div>
        <Btn variant="primary" size="md" sx={{ background:C.navy }}><Icon name="calendar" size={14}/>Request Appointment</Btn>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 20, color: C.grey500 }}>Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: 20, color: C.grey500 }}>No appointments found.</div>
          </Card>
        ) : appointments.map((a) => {
          const date = new Date(a.appointment_date);
          const mon = date.toLocaleString('default', { month: 'short' });
          const day = date.getDate();
          return (
            <Card key={a.id}>
              <div style={{ display:"flex", gap:18 }}>
                <div style={{ width:60, flexShrink:0, textAlign:"center" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.grey500 }}>{mon}</div>
                  <div style={{ fontSize:24, fontWeight:800, color:C.navy }}>{day}</div>
                  <div style={{ fontSize:11, color:C.grey500, display:"flex", alignItems:"center", gap:3, justifyContent:"center" }}><Icon name="clock" size={10} color={C.grey500}/>{a.appointment_time}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontWeight:700, color:C.navy, fontSize:14.5 }}>{a.reason}</div>
                      <div style={{ fontSize:12, color:C.grey500, marginTop:2 }}>{a.doctor_name || "Doctor"}</div>
                    </div>
                    <span style={a.status==="confirmed" ? badge(C.navy,C.white) : badge(C.grey100,C.grey700)}>{a.status.toUpperCase()}</span>
                  </div>
                  {a.clinical_notes && (
                    <div style={{ background:C.offWhite, borderRadius:6, padding:"7px 11px", fontSize:12.5, color:C.grey700, marginTop:10, display:"flex", gap:6, alignItems:"center" }}>
                      <Icon name="note" size={12} color={C.grey500}/> {a.clinical_notes}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
