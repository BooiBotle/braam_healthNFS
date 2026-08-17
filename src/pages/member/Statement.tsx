import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMemberDetails, getConsultations, getPayments, getDebitOrders, type Consultation, type Payment, type Member } from "../../lib/api/member";
import { C, S, Icon, Btn, Card } from "../../components/shared";

export default function Statement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [member, setMember] = useState<Member | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [failedPayments, setFailedPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) {
          setMember(mem);
          const [cons, pays, orders] = await Promise.all([
            getConsultations(mem.id),
            getPayments(mem.id),
            getDebitOrders(mem.id)
          ]);
          setConsultations(cons);
          setPayments(pays);
          
          const collected = orders.filter(o => o.status === 'success').reduce((sum, o) => sum + o.amount_cents, 0);
          const failed = orders.filter(o => o.status === 'failed').length;
          setTotalCollected(collected);
          setFailedPayments(failed);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading statement...</div>;

  const handleRequestStatement = async () => {
    if (!member) return;
    setRequesting(true);
    try {
      const { requestStatement } = await import("../../lib/api/member");
      await requestStatement(member.id);
      setRequested(true);
    } catch (err) {
      console.error(err);
      alert("Failed to request statement. Please try again later.");
    } finally {
      setRequesting(false);
    }
  };

  const summaryRows: [string, string][] = [
    ["Plan", member?.plan?.name || "None"],
    ["Monthly Fee", `R${member?.plan?.monthly_fee || 0}`],
    ["Debit Day", "1st of month"],
    ["Card Number", member?.card_number || "Not assigned"],
    ["Status", member?.status?.toUpperCase() || "PENDING"],
    ["Member Since", new Date(member?.created_at || Date.now()).toLocaleDateString()],
  ];

  return (
    <div>
      <div style={{ background:C.navy, color:C.white, margin:"-30px -36px 24px", padding:"18px 36px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:14, fontWeight:600 }}>Your membership statement is ready</span>
        <div style={{ display:"flex", gap:10 }}>
          <Btn 
            variant="gold" 
            size="sm"
            onClick={handleRequestStatement}
            disabled={requesting || requested}
          >
            <Icon name="mail" size={13}/>
            {requesting ? "Sending..." : requested ? "Request Sent ✓" : "Email me this statement"}
          </Btn>
          <Btn variant="secondary" size="sm" sx={{ background:C.white }}><Icon name="print" size={13}/>Print / Save as PDF</Btn>
          <Btn variant="secondary" size="sm" sx={{ background:"transparent", color:C.white, border:"1px solid rgba(255,255,255,0.4)" }} onClick={()=>navigate("/member")}>Close</Btn>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:C.teal }}>Braam Health Centre</div>
          <div style={{ fontSize:12.5, color:C.grey500, marginTop:4, lineHeight:1.6 }}>
            NFS Insure Consultant (Pty) Ltd · FSP 53910<br/>Eagle Canyon Office Park, Randpark Ridge, 2154
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:18, fontWeight:800, color:C.navy }}>Membership Statement</div>
          <div style={{ fontSize:12, color:C.grey500 }}>Generated: {new Date().toLocaleDateString()}</div>
        </div>
      </div>
      <hr style={S.divider}/>

      <div style={{ ...S.grid(2, 30), marginBottom:24 }}>
        <div>
          <div style={S.label}>MEMBER INFORMATION</div>
          <div style={{ fontWeight:800, color:C.navy, fontSize:15, marginTop:8 }}>{user?.name || "Member"}</div>
          <div style={{ fontSize:13, color:C.grey700, marginTop:4 }}>{user?.email}</div>
          <div style={{ fontSize:13, color:C.grey700 }}>+27 00 000 0000</div>
        </div>
        <div>
          <div style={S.label}>MEMBERSHIP DETAILS</div>
          <table style={{ marginTop:8, fontSize:13 }}>
            <tbody>
              {summaryRows.map(([k,v])=>(
                <tr key={k}>
                  <td style={{ color:C.grey500, paddingRight:24, paddingBottom:6 }}>{k}</td>
                  <td style={{ color: k==="Status"?C.green:C.navy, fontWeight:600, paddingBottom:6 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...S.grid(3, 16), marginBottom:24 }}>
        <Card sx={{ textAlign:"center" }}><div style={{ fontSize:26, fontWeight:800, color:C.navy }}>R{(totalCollected / 100).toFixed(2)}</div><div style={{ fontSize:11.5, color:C.grey500, textTransform:"uppercase", marginTop:4 }}>Total Collected</div></Card>
        <Card sx={{ textAlign:"center" }}><div style={{ fontSize:26, fontWeight:800, color:C.navy }}>{consultations.length}</div><div style={{ fontSize:11.5, color:C.grey500, textTransform:"uppercase", marginTop:4 }}>Consultations</div></Card>
        <Card sx={{ textAlign:"center" }}><div style={{ fontSize:26, fontWeight:800, color:C.navy }}>{failedPayments}</div><div style={{ fontSize:11.5, color:C.grey500, textTransform:"uppercase", marginTop:4 }}>Failed Payments</div></Card>
      </div>

      <div style={{ marginBottom:10 }}>
        <div style={{ ...S.label, marginBottom:8 }}>PAYMENT HISTORY</div>
        <div style={{ background:C.grey100, padding:"10px 16px", display:"flex", fontSize:11.5, fontWeight:700, color:C.grey500, textTransform:"uppercase" }}>
          <span style={{ flex:1 }}>Date</span><span style={{ flex:1 }}>Amount</span><span style={{ flex:1 }}>Status</span>
        </div>
        {payments.length === 0 ? (
          <div style={{ textAlign:"center", padding:"20px 0", color:C.grey500, fontSize:13.5, border:`1px solid ${C.grey100}` }}>No payments on record.</div>
        ) : payments.map(p => (
           <div key={p.id} style={{ display:"flex", padding:"12px 16px", borderBottom:`1px solid ${C.grey100}`, fontSize:13 }}>
              <span style={{ flex:1 }}>{new Date(p.created_at || p.date || Date.now()).toLocaleDateString()}</span>
              <span style={{ flex:1 }}>R{(p.amount_cents / 100).toFixed(2)}</span>
              <span style={{ flex:1, color: p.status === 'failed' ? C.red : C.green }}>{(p.status || 'completed').toUpperCase()}</span>
           </div>
        ))}
      </div>

      <div>
        <div style={{ ...S.label, marginBottom:8 }}>CONSULTATION HISTORY</div>
        <div style={{ background:C.grey100, padding:"10px 16px", display:"flex", fontSize:11.5, fontWeight:700, color:C.grey500, textTransform:"uppercase" }}>
          <span style={{ width:180 }}>Date & Time</span><span>Notes</span>
        </div>
        {consultations.length === 0 ? (
           <div style={{ textAlign:"center", padding:"20px 0", color:C.grey500, fontSize:13.5, border:`1px solid ${C.grey100}` }}>No consultations on record.</div>
        ) : consultations.slice(0,5).map(c=>(
          <div key={c.id} style={{ display:"flex", padding:"12px 16px", borderBottom:`1px solid ${C.grey100}`, fontSize:13 }}>
            <span style={{ width:180, color:C.navy, flexShrink:0 }}>{new Date(c.visited_at || c.consultation_date || Date.now()).toLocaleDateString()}</span>
            <span style={{ color:C.grey700 }}>{c.clinical_notes || c.consultation_type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
