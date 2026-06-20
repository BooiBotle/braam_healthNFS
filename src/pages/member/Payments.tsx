import { C, Icon, badge } from "../../components/shared";

export default function Payments() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ textAlign:"center", maxWidth:440 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:C.grey100, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <Icon name="creditcard" size={26} color={C.grey500}/>
        </div>
        <div style={{ fontSize:21, fontWeight:800, color:C.navy, marginBottom:8 }}>Card Payments</div>
        <div style={{ ...badge(C.grey100, C.gold), marginBottom:14, display:"inline-flex" }}><Icon name="clock" size={11} color={C.gold}/>COMING SOON</div>
        <div style={{ fontSize:13.5, color:C.grey700, lineHeight:1.6, marginBottom:16 }}>
          Online card payments will be available here shortly. In the meantime, please contact NFS Insure to arrange payment.
        </div>
        <div style={{ fontSize:13.5, color:C.navy, fontWeight:600 }}>
          +27 10 011 0010 · <span style={{ color:C.teal, textDecoration:"underline" }}>info@nfs.insure</span>
        </div>
      </div>
    </div>
  );
}
