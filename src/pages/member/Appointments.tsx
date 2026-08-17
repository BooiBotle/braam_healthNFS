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
  const [member, setMember] = useState<any | null>(null);

  // New Appointment State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    reason: ''
  });

  const load = async () => {
    if (user) {
      const mem = await getMemberDetails(user.id);
      if (mem) {
        setMember(mem);
        const data = await getAppointments(mem.id);
        setAppointments(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !newAppt.reason) return;
    try {
      const { supabase } = await import("../../lib/supabase");
      const { error } = await supabase.from('appointments').insert([{
        clinic_id: member.clinic_id,
        member_id: member.id,
        appointment_date: newAppt.appointment_date,
        appointment_time: newAppt.appointment_time,
        reason: newAppt.reason,
        status: 'pending',
        booked_by: user?.id
      }]);
      if (error) throw error;
      setIsModalOpen(false);
      setNewAppt({ appointment_date: new Date().toISOString().split('T')[0], appointment_time: '09:00', reason: '' });
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to request appointment');
    }
  };

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>Appointments</div>
          <div style={S.pageSub}>Request and track your clinic appointments.</div>
        </div>
        <Btn variant="primary" size="md" sx={{ background:C.navy }} onClick={() => setIsModalOpen(true)}>
          <Icon name="calendar" size={14}/>Request Appointment
        </Btn>
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

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: '100%', maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 16px', color: C.navy }}>Request Appointment</h3>
            <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.grey500, marginBottom: 4 }}>Date</label>
                  <input type="date" required value={newAppt.appointment_date} onChange={e => setNewAppt({...newAppt, appointment_date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${C.grey100}`, boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.grey500, marginBottom: 4 }}>Time</label>
                  <input type="time" required value={newAppt.appointment_time} onChange={e => setNewAppt({...newAppt, appointment_time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${C.grey100}`, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.grey500, marginBottom: 4 }}>Reason for Visit</label>
                <input type="text" required placeholder="e.g. Checkup" value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${C.grey100}`, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Btn variant="secondary" sx={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</Btn>
                <Btn variant="primary" sx={{ flex: 1, justifyContent: 'center', background: C.navy }} type="submit">Submit Request</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
