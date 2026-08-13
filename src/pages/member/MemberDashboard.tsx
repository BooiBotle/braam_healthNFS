import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  getMemberDetails, 
  getTokenBalance, 
  getAppointments, 
  getConsultations, 
  getPayments, 
  type Member, 
  type TokenBalance, 
  type Appointment, 
  type Consultation, 
  type Payment 
} from "../../lib/api/member";
import {
  C, S, Icon, Btn, Card, CardHead, MemberCard, WhatsAppFab,
  badge, type IconName,
} from "../../components/shared";

interface RowProps {
  icon: IconName;
  text: string;
  extra?: React.ReactNode;
}

const Row = ({ icon, text, extra }: RowProps) => (
  <div style={{ display:"flex", alignItems:"center", gap:11 }}>
    <Icon name={icon} size={15} color={C.grey500}/>
    <span style={{ fontSize:13.5, color:C.navy }}>{text}</span>
    {extra}
  </div>
);

interface AppointmentRowProps {
  date: string;
  time: string;
  title: string;
  status: string;
  note: string;
  last?: boolean;
}

const AppointmentRow = ({ date, time, title, status, note, last }: AppointmentRowProps) => {
  const statusStyle = status==="confirmed" ? badge("#DCEFFB", C.navy) : badge(C.greenBg, C.green);
  return (
    <div style={{ borderBottom: last? "none" : `1px solid ${C.grey100}`, padding:"14px 0" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
        <div style={{ background:C.greenBg, borderRadius:8, padding:8, flexShrink:0 }}>
          <Icon name="calendar" size={15} color={C.green}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontWeight:700, color:C.navy, fontSize:14.5 }}>{date} · {time}</div>
              <div style={{ fontSize:13, color:C.grey700, marginTop:2 }}>{title}</div>
            </div>
            <span style={statusStyle}>{status.toUpperCase()}</span>
          </div>
          {note && (
            <div style={{ background:C.offWhite, borderRadius:6, padding:"7px 11px", fontSize:12.5, color:C.grey700, marginTop:9, display:"flex", gap:6, alignItems:"center" }}>
              <Icon name="note" size={12} color={C.grey500}/> {note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ConsultRowProps {
  date: string;
  time: string;
  text: string;
  last?: boolean;
}

const ConsultRow = ({ date, time, text, last }: ConsultRowProps) => (
  <div style={{ display:"flex", gap:14, padding:"14px 0", borderBottom: last? "none" : `1px solid ${C.grey100}` }}>
    <div style={{ background:"#E7EEFB", borderRadius:99, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon name="clock" size={14} color={C.navy}/>
    </div>
    <div style={{ flex:1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{date}</div>
        <span style={{ ...badge(C.greenBg, C.green), fontSize: 10 }}>1 Token Used</span>
      </div>
      <div style={{ fontSize:13, color:C.grey700, lineHeight:1.55, marginTop:2 }}>{text}</div>
    </div>
    <div style={{ fontSize:12.5, color:C.grey500, flexShrink:0 }}>{time}</div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [member, setMember] = useState<Member | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const mem = await getMemberDetails(user!.id);
      if (mem) {
        setMember(mem);
        const [bal, appts, cons, pays] = await Promise.all([
          getTokenBalance(mem.id),
          getAppointments(mem.id),
          getConsultations(mem.id),
          getPayments(mem.id)
        ]);
        setTokenBalance(bal);
        setAppointments(appts);
        setConsultations(cons);
        setPayments(pays);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.grey500 }}>Loading dashboard...</div>;
  }

  const isUnlimited = tokenBalance?.monthly_tokens === -1;
  const totalTokens = tokenBalance?.monthly_tokens ?? 3;
  // Always use server-computed tokens_remaining for consistency with MemberCard
  const tokensUsed = tokenBalance?.tokens_used ?? 0;
  const tokensRemaining = isUnlimited ? 999 : (tokenBalance?.tokens_remaining ?? Math.max(0, totalTokens - tokensUsed));
  const pctUsed = isUnlimited ? 0 : Math.min(100, Math.round((tokensUsed / Math.max(1, totalTokens)) * 100));


  return (
    <div>
      <MemberCard 
        memberNum={member?.card_number}
        memberName={user?.name || ""}
        planName={member?.plan?.name || tokenBalance?.plan_name}
        status={member?.status}
        tokensRemaining={tokensRemaining}
        totalTokens={totalTokens}
      />

      <div style={{ ...S.grid(2, 18), marginTop:20 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={S.label}>YOUR PLAN</span>
            <Btn variant="ghost" size="sm" onClick={()=>navigate("/member/upgrade")}><Icon name="refresh" size={12}/>Change</Btn>
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:C.navy, marginTop:6 }}>{member?.plan?.name || tokenBalance?.plan_name || "No Plan"}</div>
          <div style={{ fontSize:12.5, color:C.grey500, marginBottom:14 }}>{member?.plan?.description || "Active subscription"}</div>
          <div style={{ fontSize:24, fontWeight:800, color:C.navy }}>
            R{((member?.plan?.monthly_fee_cents || 0) / 100) || member?.plan?.monthly_fee || 0}
            <span style={{ fontSize:13, fontWeight:500, color:C.grey500 }}> /month</span>
          </div>
          <div style={{ fontSize:12, color:C.grey500, marginTop:2 }}>Debit on the 1st of each month</div>
        </Card>

        {/* Consultation Tokens Widget */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={S.label}>CONSULTATION TOKENS</span>
            <Btn variant="ghost" size="sm" onClick={()=>navigate("/member/consultations")}><Icon name="doc" size={12}/>History</Btn>
          </div>
          <div style={{ fontSize:32, fontWeight:800, color:C.navy, margin:"8px 0 4px" }}>
            {isUnlimited ? 'Unlimited' : `${tokensUsed} / ${totalTokens} used`}
          </div>
          <div style={{ fontSize:13, color: isUnlimited || tokensRemaining > 1 ? C.tealDk : tokensRemaining === 1 ? C.gold : C.red, fontWeight: 700, marginBottom:10 }}>
            {isUnlimited ? 'Unlimited consultations included' : `${tokensRemaining} ${tokensRemaining === 1 ? 'token' : 'tokens'} remaining this month`}
          </div>
          <div style={{ background:C.grey100, borderRadius:99, height:8, marginBottom:12, overflow: "hidden" }}>
            <div style={{ 
              width: `${pctUsed}%`, 
              background: tokensRemaining === 0 ? C.red : tokensRemaining === 1 ? C.gold : C.teal, 
              height:"100%", borderRadius:99, transition: "width 0.4s ease" 
            }}/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, textAlign: "center", fontSize: 11, color: C.grey500, background: C.offWhite, padding: "8px", borderRadius: 8 }}>
            <div>
              <div style={{ fontWeight: 600 }}>INCLUDED</div>
              <div style={{ fontWeight: 800, color: C.navy, fontSize: 13 }}>{isUnlimited ? '∞' : totalTokens}</div>
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>USED</div>
              <div style={{ fontWeight: 800, color: C.navy, fontSize: 13 }}>{tokensUsed}</div>
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>REMAINING</div>
              <div style={{ fontWeight: 800, color: tokensRemaining === 0 ? C.red : C.teal, fontSize: 13 }}>{isUnlimited ? '∞' : tokensRemaining}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card sx={{ marginTop:18 }}>
        <CardHead title="Your Details" action="Edit" actionIcon="edit" onAction={()=>navigate("/member/profile")}/>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Row icon="user" text={user?.name || "Unknown"} extra={<span style={{ ...badge(C.greenBg,C.green), marginLeft:8 }}>{member?.status || "Active"}</span>}/>
          <Row icon="mail" text={user?.email || ""}/>
          <Row icon="phone" text={user?.id ? "0825550002" : "Not provided"}/>
          <Row icon="card" text={member?.card_number || "No Card"}/>
          <Row icon="pin" text="Not provided"/>
          <Row icon="calendar" text={`Member since ${new Date(member?.created_at || Date.now()).toLocaleDateString()}`}/>
        </div>
      </Card>

      <Card sx={{ marginTop:18 }}>
        <CardHead title="Appointments" action="Book" actionIcon="calendar" onAction={()=>navigate("/member/appointments")}/>
        {appointments.length === 0 ? (
          <div style={{ textAlign:"center", padding:"22px 0", color:C.grey500, fontSize:13.5 }}>No upcoming appointments. (Booking an appointment does not deduct tokens).</div>
        ) : (
          appointments.slice(0, 3).map((a, i) => (
            <AppointmentRow 
              key={a.id}
              date={new Date(a.appointment_date).toDateString()} 
              time={a.appointment_time} 
              title={a.reason} 
              status={a.status} 
              note={a.clinical_notes || ""} 
              last={i === Math.min(appointments.length - 1, 2)}
            />
          ))
        )}
      </Card>

      <Card sx={{ marginTop:18 }}>
        <CardHead title="Consultation History (Token Log)" action="View All" actionIcon="doc" onAction={()=>navigate("/member/consultations")}/>
        {consultations.length === 0 ? (
          <div style={{ textAlign:"center", padding:"22px 0", color:C.grey500, fontSize:13.5 }}>No consultations recorded yet this month.</div>
        ) : (
          consultations.slice(0,3).map((c,i)=>{
            const consultDate = new Date(c.created_at || c.visited_at || c.consultation_date || Date.now());
            return (
              <ConsultRow 
                key={c.id} 
                date={consultDate.toDateString()} 
                time={consultDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                text={c.clinical_notes || c.diagnosis || c.consultation_type.replace('_', ' ')} 
                last={i===Math.min(consultations.length - 1, 2)}
              />
            );
          })
        )}
      </Card>

      <Card sx={{ marginTop:18 }}>
        <CardHead title="Payment History"/>
        {payments.length === 0 ? (
          <div style={{ textAlign:"center", padding:"22px 0", color:C.grey500, fontSize:13.5 }}>No payments on record yet.</div>
        ) : (
          payments.slice(0,3).map((p,i)=>(
             <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom: i===Math.min(payments.length - 1, 2)? "none" : `1px solid ${C.grey100}` }}>
                <div>
                  <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{new Date(p.date).toDateString()}</div>
                  <div style={{ fontSize:13, color:C.grey700, marginTop:2 }}>{p.method}</div>
                </div>
                <div style={{ fontWeight:700, color:C.navy }}>R{(p.amount_cents / 100).toFixed(2)}</div>
             </div>
          ))
        )}
      </Card>

      <WhatsAppFab/>
    </div>
  );
}
