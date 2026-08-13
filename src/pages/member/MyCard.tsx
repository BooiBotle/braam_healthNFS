import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMemberDetails, getTokenBalance, type Member, type TokenBalance } from "../../lib/api/member";
import { C, S, Icon, Btn, MemberCard } from "../../components/shared";

export default function MyCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) {
          setMember(mem);
          const bal = await getTokenBalance(mem.id);
          if (bal) setTokenBalance(bal);
        }
      }
    }
    load();
  }, [user]);

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>Digital Membership Card</div>
          <div style={S.pageSub}>Present this at Braam Health Centre or save it to your device.</div>
        </div>
      </div>
      <MemberCard 
        memberNum={member?.card_number}
        memberName={user?.name || ""}
        planName={member?.plan?.name || tokenBalance?.plan_name}
        status={member?.status}
        tokensRemaining={tokenBalance?.tokens_remaining}
        totalTokens={tokenBalance?.monthly_tokens}
      />
      <div style={{ fontSize:13, color:C.grey500, marginTop:16, marginBottom:18 }}>
        Scan the QR code at reception for instant verification — no internet required.
      </div>
      <Btn variant="primary" size="lg" sx={{ width:"100%", maxWidth:520, justifyContent:"center", background:C.navy }}>
        <Icon name="download" size={15}/> Download Card Image
      </Btn>
      <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0", maxWidth:520 }}>
        <hr style={{ flex:1, border:"none", borderTop:`1px solid ${C.grey300}` }}/>
        <span style={{ fontSize:12, color:C.grey500 }}>or add to wallet</span>
        <hr style={{ flex:1, border:"none", borderTop:`1px solid ${C.grey300}` }}/>
      </div>
      <div style={{ border:`1px solid ${C.grey300}`, borderRadius:10, padding:"14px 18px", display:"flex", alignItems:"center", gap:12, maxWidth:520, cursor:"pointer" }}>
        <div style={{ width:26, height:26, borderRadius:"50%", background:"conic-gradient(#4285F4 0 25%, #34A853 25% 50%, #FBBC05 50% 75%, #EA4335 75% 100%)" }}/>
        <div>
          <div style={{ fontSize:11.5, color:C.grey500 }}>Add to</div>
          <div style={{ fontSize:14.5, fontWeight:700, color:C.navy }}>Google Wallet</div>
        </div>
      </div>
    </div>
  );
}
