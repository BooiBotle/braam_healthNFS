import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPlans, getMemberDetails, type Plan } from "../../lib/api/member";
import { C, S, Icon, Btn, Card, badge, type BtnVariant } from "../../components/shared";

const PlanCard = ({ p, currentPlanId }: { p: Plan, currentPlanId?: string }) => {
  const isCurrent = p.id === currentPlanId;
  const isSoon = false; // Mock feature
  const isPopular = p.name === "Family"; // Mock feature

  const variant: BtnVariant =
    isCurrent ? "secondary" :
    isSoon ? "disabled" :
    isPopular ? "primary" : "primary";

  return (
    <Card sx={{ position:"relative", border: isCurrent ? `2px solid ${C.navy}` : `1px solid ${C.grey100}`, display:"flex", flexDirection:"column" }}>
      {isCurrent && <span style={{ position:"absolute", top:-12, left:18, ...badge(C.navy, C.white) }}><Icon name="check" size={10} color={C.white}/>Current plan</span>}
      {isPopular && !isCurrent && <span style={{ position:"absolute", top:-12, left:18, ...badge("#FCE9CC", "#B97A14") }}>✨ Most popular</span>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:6 }}>
        <div style={{ fontWeight:800, color:C.navy, fontSize:16 }}>{p.name}</div>
        {p.monthly_fee && <div style={{ fontWeight:800, color:C.navy, fontSize:17 }}>R{p.monthly_fee}<span style={{ fontSize:11.5, color:C.grey500, fontWeight:500 }}>/mo</span></div>}
      </div>
      <div style={{ fontSize:12.5, color:C.grey500, marginBottom:14 }}>{p.description}</div>

      <div style={{ flex:1 }}>
        {/* Mock features since they are not in DB schema explicitly */}
        {["Unlimited GP visits", "Basic pathology", "Chronic medication coverage"].map(f=>(
          <div key={f} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <Icon name="check" size={13} color={C.green}/>
            <span style={{ fontSize:12.5, color:C.grey700 }}>{f}</span>
          </div>
        ))}
      </div>

      <Btn
        variant={variant}
        size="sm"
        sx={{ width:"100%", justifyContent:"center", marginTop:14, background:!isCurrent||isPopular?C.navy:undefined }}
      >
        {isCurrent ? "Current Plan" : "Upgrade"} {!isCurrent && <Icon name="arrowRight" size={12}/>}
      </Btn>
    </Card>
  );
};

export default function UpgradePlan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) setCurrentPlanId(mem.plan_id);
      }
      const data = await getPlans();
      setPlans(data);
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitle}>Upgrade Your Plan</div>
      <div style={{ ...S.pageSub, marginBottom:22 }}>Choose a plan that fits your family. Changes take effect from your next debit order collection.</div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: C.grey500 }}>Loading plans...</div>
      ) : (
        <div style={{ ...S.grid(3, 16) }}>
          {plans.map(p=><PlanCard key={p.id} p={p} currentPlanId={currentPlanId}/>)}
        </div>
      )}

      <Card sx={{ marginTop:20, background:C.offWhite, border:"none" }}>
        <div style={{ fontWeight:700, color:C.navy, fontSize:13.5, marginBottom:10 }}>How plan changes work</div>
        <ul style={{ margin:0, paddingLeft:18, color:C.grey700, fontSize:13, lineHeight:1.8 }}>
          <li>Requests are reviewed within 1–2 business days by our team.</li>
          <li>Approved changes take effect from your next debit order collection date.</li>
          <li>You'll receive an email confirmation when your plan change is processed.</li>
          <li>Only one pending request can be active at a time.</li>
        </ul>
      </Card>
    </div>
  );
}
