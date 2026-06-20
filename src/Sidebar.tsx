import { NavLink } from "react-router-dom";
import { C, S, Icon, type IconName } from "./shared";

interface NavEntry {
  to: string;
  label: string;
  icon: IconName;
}

const NAV: NavEntry[] = [
  { to:"/",               label:"Dashboard",        icon:"home" },
  { to:"/my-card",         label:"My Card",          icon:"card" },
  { to:"/consultations",   label:"Consultations",    icon:"pulse" },
  { to:"/dependants",      label:"Dependants",       icon:"users" },
  { to:"/debit-orders",    label:"Debit Orders",     icon:"bank" },
  { to:"/appointments",    label:"Appointments",     icon:"calendar" },
  { to:"/payments",        label:"Payments",         icon:"creditcard" },
  { to:"/upgrade",         label:"Upgrade Plan",     icon:"trend" },
  { to:"/statement",       label:"Statement",        icon:"doc" },
  { to:"/kyc",             label:"KYC Verification", icon:"shield" },
  { to:"/clinic-info",     label:"Clinic Info",      icon:"building" },
  { to:"/profile",         label:"Profile",          icon:"user" },
];

export default function Sidebar() {
  return (
    <div style={S.sidebar}>
      <div style={S.logoWrap}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Icon name="building" size={20} color={C.goldLt}/>
          <span style={{ color:C.white, fontWeight:800, fontSize:18 }}>
            NFS <span style={{ color:C.goldLt, fontWeight:600 }}>| INSURE</span>
          </span>
        </div>
        <div style={{ fontSize:11.5, color:"#8DA0C2", marginTop:5 }}>Braam Health Centre · Member</div>
      </div>

      <div style={S.navWrap}>
        {NAV.map(n=>(
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to==="/"}
            style={({isActive})=>S.navItem(isActive)}
          >
            {({isActive}) => (
              <>
                <Icon name={n.icon} size={15} color={isActive?C.goldLt:"#9AAAC4"}/>
                {n.label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div style={S.bottomWrap}>
        <div style={S.navItem(false)} onClick={()=>{ /* hook up logout here */ }}>
          <Icon name="logout" size={15} color="#9AAAC4"/>
          Logout
        </div>
        <div style={S.servingBox}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:"#fff", flexShrink:0 }}/>
          <div>
            <div style={{ fontSize:10.5, color:"#8DA0C2" }}>Serving</div>
            <div style={{ fontSize:12, fontWeight:700, color:C.white }}>Braam Health Centre</div>
          </div>
        </div>
      </div>
    </div>
  );
}
