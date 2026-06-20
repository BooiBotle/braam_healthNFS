import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMemberDetails, getDependants, type Dependant } from "../../lib/api/member";
import { C, S, Icon, Btn, Card } from "../../components/shared";

export default function Dependants() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) {
          const data = await getDependants(mem.id);
          setDependants(data);
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
          <div style={S.pageTitle}>Dependants</div>
          <div style={S.pageSub}>Manage family members linked to your plan.</div>
        </div>
        <Btn variant="primary" size="md" sx={{ background:C.navy }}><Icon name="plus" size={14}/>Add Dependant</Btn>
      </div>
      <Card sx={{ padding:0 }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Name","Relationship","Date of Birth","Added"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"14px 20px", fontSize:11.5, fontWeight:700, color:C.grey500, textTransform:"uppercase", letterSpacing:"0.6px", borderBottom:`1px solid ${C.grey100}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign:"center", padding:"34px 0", color:C.grey500, fontSize:13.5 }}>Loading dependants...</td></tr>
            ) : dependants.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign:"center", padding:"34px 0", color:C.grey500, fontSize:13.5 }}>No dependants added to your profile.</td></tr>
            ) : (
              dependants.map(d => (
                <tr key={d.id}>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color:C.navy, fontWeight:600 }}>{d.first_name} {d.last_name}</td>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color:C.grey700 }}>{d.relationship}</td>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color:C.grey700 }}>{d.date_of_birth}</td>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color:C.grey500 }}>Added today</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
