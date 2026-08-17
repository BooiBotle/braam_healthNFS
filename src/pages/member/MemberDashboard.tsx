import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { getMemberDetails, getAppointments, getConsultations, getPayments, type Member, type Appointment, type Consultation, type Payment } from "../../lib/api/member";
import {
  C, S, Icon, Btn, Card, CardHead, MemberCard, WhatsAppFab,
  badge, type IconName,
} from "../../components/shared";
import { motion } from "framer-motion";

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
  diagnosis?: string;
  doctor?: string;
  last?: boolean;
}

const ConsultRow = ({ date, time, text, diagnosis, doctor, last }: ConsultRowProps) => (
  <div style={{ display:"flex", gap:14, padding:"14px 0", borderBottom: last? "none" : `1px solid ${C.grey100}` }}>
    <div style={{ background:"#E7EEFB", borderRadius:99, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon name="clock" size={14} color={C.navy}/>
    </div>
    <div style={{ flex:1 }}>
      <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{date}</div>
      {diagnosis && <div style={{ fontSize:12.5, color:C.gold, fontWeight:600, marginTop:1 }}>{diagnosis}</div>}
      <div style={{ fontSize:13, color:C.grey700, lineHeight:1.55, marginTop:2 }}>{text}</div>
      {doctor && <div style={{ fontSize:11.5, color:C.grey500, marginTop:3 }}>👨‍⚕️ {doctor}</div>}
    </div>
    <div style={{ fontSize:12.5, color:C.grey500, flexShrink:0 }}>{time}</div>
  </div>
);

interface Comm {
  id: string;
  type: string;
  title: string;
  message: string;
  document_url: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [member, setMember] = useState<Member | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [comms, setComms] = useState<Comm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const mem = await getMemberDetails(user!.id);
      if (mem) {
        setMember(mem);
        const [appts, cons, pays, { data: commData }] = await Promise.all([
          getAppointments(mem.id),
          getConsultations(mem.id),
          getPayments(mem.id),
          supabase.from('communications').select('*').eq('member_id', mem.id).eq('status', 'pending')
        ]);
        setAppointments(appts);
        setConsultations(cons);
        setPayments(pays);
        setComms(commData || []);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <motion.div
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          style={{ width:40, height:40, borderRadius:"50%", border:`3px solid ${C.grey100}`, borderTop:`3px solid ${C.navy}`, margin:"0 auto 12px" }}
        />
        <div style={{ color: C.grey500, fontSize: 13 }}>Loading your dashboard...</div>
      </div>
    );
  }

  // No plan — direct them to plan selection
  if (!member?.plan_id) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{
          background: "linear-gradient(135deg, #0B1B3F, #0c2557)",
          borderRadius: 24, padding: 40, color: "#fff", textAlign: "center",
          maxWidth: 480, margin: "0 auto",
          boxShadow: "0 20px 50px rgba(11,27,63,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Welcome to Braam Health!</div>
          <div style={{ fontSize: 14, color: "#8DA0C2", lineHeight: 1.7, marginBottom: 28 }}>
            You don't have a membership plan yet. Choose a plan to unlock your consultation allowance, medication benefits, and access to your digital membership card.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Btn
              variant="primary"
              size="lg"
              sx={{ width: "100%", justifyContent: "center", background: "#E8B85A", color: "#0B1B3F", fontWeight: 800 }}
              onClick={() => navigate("/member/upgrade")}
            >
              <Icon name="arrowRight" size={16} /> Choose a Membership Plan
            </Btn>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Already applied? An admin may still be reviewing your request.
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const plan = member?.plan;
  const consultationsLimit = plan?.consultations_pm ?? 3;
  const consultationsUsed = member?.consultations_used_this_month ?? 0;
  const consultationsRemaining = Math.max(0, consultationsLimit === -1 ? 999 : consultationsLimit - consultationsUsed);
  const usagePct = consultationsLimit === -1 ? 0 : Math.min(100, (consultationsUsed / (consultationsLimit || 1)) * 100);

  return (
    <div>
      {/* Pending Communications Alert */}
      {comms.length > 0 && (
        <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {comms.map(comm => (
            <div key={comm.id} style={{ 
              background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px",
              display: "flex", gap: 16, alignItems: "flex-start", boxShadow: "0 4px 12px rgba(217, 119, 6, 0.05)"
            }}>
              <div style={{ background: "#fef3c7", color: "#d97706", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="mail" size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#92400e", fontSize: 16 }}>{comm.title}</h4>
                <p style={{ margin: 0, color: "#b45309", fontSize: 14, lineHeight: 1.5 }}>{comm.message}</p>
                {comm.document_url && (
                  <a href={comm.document_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 16px", background: "#d97706", color: "#fff", textDecoration: "none", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                    <Icon name="download" size={14} /> Download Document
                  </a>
                )}
                <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                  <Btn variant="primary" size="sm" onClick={() => navigate("/member/kyc")}>Go to Document Upload</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MemberCard 
        memberNum={member?.card_number}
        memberName={user?.name || ""}
        planName={member?.plan?.name}
        status={member?.status}
      />

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, marginTop:16 }}
      >
        {[
          { icon:"card" as IconName, label:"My Card", route:"/member/card", color:"#E7EEFB", iconColor:C.navy },
          { icon:"pulse" as IconName, label:"Consultations", route:"/member/consultations", color:C.greenBg, iconColor:C.green },
          { icon:"calendar" as IconName, label:"Appointments", route:"/member/appointments", color:"#FEF3C7", iconColor:"#D97706" },
          { icon:"doc" as IconName, label:"Statement", route:"/member/statement", color:"#F5F3FF", iconColor:"#7C3AED" },
        ].map((a) => (
          <div
            key={a.label}
            onClick={() => navigate(a.route)}
            style={{
              background:C.white, borderRadius:12, padding:"14px 8px", textAlign:"center",
              cursor:"pointer", border:`1px solid ${C.grey100}`, boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
              transition:"transform .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform="translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform="translateY(0)")}
          >
            <div style={{ width:34, height:34, borderRadius:9, background:a.color, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 7px" }}>
              <Icon name={a.icon} size={16} color={a.iconColor} />
            </div>
            <div style={{ fontSize:11.5, fontWeight:600, color:C.navy }}>{a.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Plan + Consultation Usage Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ ...S.grid(2, 16), marginTop:16 }}
      >
        {/* Plan Card */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={S.label}>YOUR PLAN</span>
            <Btn variant="ghost" size="sm" onClick={()=>navigate("/member/upgrade")}><Icon name="refresh" size={12}/>Change</Btn>
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:C.navy, marginTop:6 }}>{plan?.name || "No Plan"}</div>
          <div style={{ fontSize:12.5, color:C.grey500, marginBottom:14 }}>{plan?.description || "Contact support to select a plan"}</div>
          <div style={{ fontSize:24, fontWeight:800, color:C.navy }}>
            R{plan?.monthly_fee_cents ? (plan.monthly_fee_cents / 100).toFixed(0) : plan?.monthly_fee || 0}
            <span style={{ fontSize:13, fontWeight:500, color:C.grey500 }}> /month</span>
          </div>
          <div style={{ fontSize:12, color:C.grey500, marginTop:2 }}>Debit on the 1st of each month</div>

          {/* Mini plan benefits */}
          <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.grey100}`, display:"flex", flexDirection:"column", gap:6 }}>
            {[
              { icon:"🩺", text:`${consultationsLimit === -1 ? "Unlimited" : consultationsLimit} consultations/month`, ok: true },
              { icon:"💊", text:"Medication included", ok: plan?.includes_medication },
              { icon:"🕐", text:"24/7 access", ok: plan?.includes_24h_access },
              { icon:"📋", text:"Chronic programme", ok: plan?.includes_chronic },
            ].map(b => (
              <div key={b.text} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color: b.ok ? C.navy : C.grey500 }}>
                <span>{b.icon}</span>
                <span style={{ flex:1 }}>{b.text}</span>
                {b.ok ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.grey500} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Consultation Usage Card */}
        <Card>
          <span style={S.label}>CONSULTATION USAGE</span>
          
          <div style={{ textAlign:"center", margin:"16px 0 12px" }}>
            <div style={{ fontSize:48, fontWeight:900, color:C.navy, lineHeight:1 }}>
              {consultationsUsed}
              <span style={{ fontSize:20, color:C.grey500, fontWeight:500 }}>
                /{consultationsLimit === -1 ? "∞" : consultationsLimit}
              </span>
            </div>
            <div style={{ fontSize:12, color:C.grey500, marginTop:4 }}>used this month</div>
          </div>

          {consultationsLimit !== -1 && (
            <div style={{ background:C.grey100, borderRadius:99, height:10, marginBottom:14, overflow:"hidden" }}>
              <motion.div
                initial={{ width:0 }}
                animate={{ width:`${usagePct}%` }}
                transition={{ duration:1.2, ease:"easeOut", delay:0.5 }}
                style={{ 
                  height:"100%", borderRadius:99,
                  background: usagePct >= 100 ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : usagePct >= 75 ? "linear-gradient(90deg, #f59e0b, #C9963A)"
                    : "linear-gradient(90deg, #13A89E, #0B1B3F)",
                }}
              />
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            <div style={{ background:C.offWhite, borderRadius:10, padding:10, textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:consultationsRemaining === 0 ? C.red : C.green }}>
                {consultationsLimit === -1 ? "∞" : consultationsRemaining}
              </div>
              <div style={{ fontSize:10.5, color:C.grey500, textTransform:"uppercase", letterSpacing:"0.5px" }}>Remaining</div>
            </div>
            <div style={{ background:C.offWhite, borderRadius:10, padding:10, textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>{consultationsUsed}</div>
              <div style={{ fontSize:10.5, color:C.grey500, textTransform:"uppercase", letterSpacing:"0.5px" }}>Used</div>
            </div>
          </div>

          {consultationsLimit !== -1 && consultationsUsed >= consultationsLimit ? (
            <div style={{ background:"#FBE7E7", border:`1px solid ${C.red}33`, borderRadius:10, padding:"10px 12px", fontSize:12.5, color:C.red, fontWeight:600 }}>
              ⚠️ Monthly limit reached. Additional visits may require payment.
            </div>
          ) : (
            <div style={{ background:C.greenBg, border:`1px solid #BBF7D0`, borderRadius:10, padding:"10px 12px", fontSize:12.5, color:C.green, fontWeight:600 }}>
              ✓ {consultationsRemaining === 999 ? "Unlimited consultations" : `${consultationsRemaining} consultation${consultationsRemaining !== 1 ? "s" : ""} remaining`} at {member?.clinic?.name || "Braam Health Centre"}
            </div>
          )}

          <Btn
            variant="primary" size="sm"
            sx={{ width:"100%", justifyContent:"center", marginTop:12 }}
            onClick={() => navigate("/member/consultations")}
          >
            <Icon name="clock" size={12} /> View History
          </Btn>
        </Card>
      </motion.div>

      {/* Your Details */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card sx={{ marginTop:16 }}>
          <CardHead title="Your Details" action="Edit" actionIcon="edit" onAction={()=>navigate("/member/profile")}/>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Row icon="user" text={user?.name || "Unknown"} extra={<span style={{ ...badge(C.greenBg,C.green), marginLeft:8 }}>{member?.status || "Active"}</span>}/>
            <Row icon="mail" text={user?.email || ""}/>
            <Row icon="card" text={member?.card_number || "No Card"}/>
            <Row icon="calendar" text={`Member since ${new Date(member?.created_at || Date.now()).toLocaleDateString()}`}/>
            {member?.clinic && <Row icon="building" text={`${member.clinic.name}${member.clinic.city ? ` — ${member.clinic.city}` : ""}`}/>}
          </div>
        </Card>
      </motion.div>

      {/* Appointments */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card sx={{ marginTop:16 }}>
          <CardHead title="Appointments" action="Book" actionIcon="calendar" onAction={()=>navigate("/member/appointments")}/>
          {appointments.length === 0 ? (
            <div style={{ textAlign:"center", padding:"22px 0", color:C.grey500, fontSize:13.5 }}>No upcoming appointments.</div>
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
      </motion.div>

      {/* Consultation History */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card sx={{ marginTop:16 }}>
          <CardHead title="Consultation History" action="View All" actionIcon="arrowRight" onAction={()=>navigate("/member/consultations")}/>
          {consultations.length === 0 ? (
            <div style={{ textAlign:"center", padding:"22px 0", color:C.grey500, fontSize:13.5 }}>No consultations on record yet.</div>
          ) : (
            consultations.slice(0,3).map((c,i)=>{
              const d = new Date(c.visited_at || c.consultation_date || Date.now());
              return (
                <ConsultRow 
                  key={c.id} 
                  date={d.toDateString()} 
                  time={d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                  text={c.clinical_notes || c.consultation_type.replace(/_/g, ' ')}
                  diagnosis={(c as any).diagnosis}
                  doctor={(c as any).doctor_name}
                  last={i===Math.min(consultations.length - 1, 2)}
                />
              );
            })
          )}
        </Card>
      </motion.div>

      {/* Payment History */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card sx={{ marginTop:16 }}>
          <CardHead title="Payment History"/>
          {payments.length === 0 ? (
            <div style={{ textAlign:"center", padding:"22px 0", color:C.grey500, fontSize:13.5 }}>No payments on record yet.</div>
          ) : (
            payments.slice(0,3).map((p,i)=>{
              const pd = new Date(p.created_at || p.date || Date.now());
              return (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom: i===Math.min(payments.length - 1, 2)? "none" : `1px solid ${C.grey100}` }}>
                   <div>
                     <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{pd.toDateString()}</div>
                     <div style={{ fontSize:13, color:C.grey700, marginTop:2 }}>{p.method}</div>
                   </div>
                   <div style={{ fontWeight:700, color:C.navy }}>R{(p.amount_cents / 100).toFixed(2)}</div>
                </div>
              );
            })
          )}
        </Card>
      </motion.div>

      <WhatsAppFab/>
    </div>
  );
}
