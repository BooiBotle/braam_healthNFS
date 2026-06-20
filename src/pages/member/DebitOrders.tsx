import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMemberDetails, getDebitOrders, type DebitOrder } from "../../lib/api/member";
import { C, S, Icon, Btn, Card } from "../../components/shared";

export default function DebitOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<DebitOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) {
          const data = await getDebitOrders(mem.id);
          setOrders(data);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const totalCollected = orders.filter(o => o.status === 'success').reduce((sum, o) => sum + o.amount_cents, 0);
  const failedCount = orders.filter(o => o.status === 'failed').length;

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>Debit Orders</div>
          <div style={S.pageSub}>Monthly payment history and banking mandate.</div>
        </div>
        <Btn variant="secondary" size="md"><Icon name="shield" size={14}/>Change Bank Details</Btn>
      </div>
      <div style={{ ...S.grid(3, 16), marginBottom:18 }}>
        <Card><span style={S.label}>TOTAL COLLECTED</span><div style={{ fontSize:30, fontWeight:800, color:C.navy, marginTop:6 }}>R{(totalCollected / 100).toFixed(2)}</div></Card>
        <Card><span style={S.label}>FAILED PAYMENTS</span><div style={{ fontSize:30, fontWeight:800, color:C.navy, marginTop:6 }}>{failedCount}</div></Card>
        <Card><span style={S.label}>COLLECTION DAY</span><div style={{ fontSize:30, fontWeight:800, color:C.navy, marginTop:6 }}>1st</div></Card>
      </div>
      <Card>
        {loading ? (
          <div style={{ textAlign:"center", padding:"40px 0", color:C.grey500 }}>Loading debit orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <Icon name="creditcard" size={30} color={C.grey300}/>
            <div style={{ color:C.grey500, fontSize:13.5, marginTop:10 }}>No debit orders found.</div>
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign:"left", padding:"14px 20px", fontSize:11.5, fontWeight:700, color:C.grey500, borderBottom:`1px solid ${C.grey100}` }}>DATE</th>
                <th style={{ textAlign:"left", padding:"14px 20px", fontSize:11.5, fontWeight:700, color:C.grey500, borderBottom:`1px solid ${C.grey100}` }}>AMOUNT</th>
                <th style={{ textAlign:"left", padding:"14px 20px", fontSize:11.5, fontWeight:700, color:C.grey500, borderBottom:`1px solid ${C.grey100}` }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}` }}>{new Date(o.collection_date).toLocaleDateString()}</td>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}` }}>R{(o.amount_cents / 100).toFixed(2)}</td>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color: o.status === 'failed' ? C.red : C.green }}>{o.status.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
