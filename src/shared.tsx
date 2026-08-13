// Shared design tokens, primitives, and the Icon set used by every page.
// Import what you need: import { C, S, btn, badge, Btn, Card, ... } from "../components/shared";
import type { CSSProperties, ReactNode, ChangeEvent } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
export const C = {
  navy:     "#0B1B3F",
  navyMid:  "#142a52",
  navyLine: "#22335c",
  gold:     "#C9963A",
  goldLt:   "#E8B85A",
  teal:     "#13A89E",
  tealDk:   "#0E8A82",
  white:    "#FFFFFF",
  offWhite: "#F4F6F9",
  grey100:  "#EBEEF2",
  grey300:  "#CBD3DD",
  grey500:  "#8392A6",
  grey700:  "#475569",
  red:      "#D14343",
  redBg:    "#FBE7E7",
  green:    "#1E9E5A",
  greenBg:  "#E3F6EC",
  whatsapp: "#25D366",
} as const;

export const S = {
  shell:    { fontFamily:"'Inter','Helvetica Neue',sans-serif", background:C.offWhite, minHeight:"100vh", display:"flex" } as CSSProperties,
  sidebar:  { width:248, background:C.navy, minHeight:"100vh", display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, alignSelf:"flex-start" } as CSSProperties,
  logoWrap: { padding:"22px 22px 16px", borderBottom:`1px solid ${C.navyLine}` } as CSSProperties,
  navWrap:  { flex:1, padding:"14px 0", overflowY:"auto" } as CSSProperties,
  navItem:  (active: boolean): CSSProperties => ({
    display:"flex", alignItems:"center", gap:11, padding:"10px 22px", cursor:"pointer",
    color: active ? C.goldLt : "#B8C2D6",
    background: active ? "rgba(255,255,255,0.06)" : "transparent",
    borderLeft: active ? `3px solid ${C.gold}` : "3px solid transparent",
    fontSize:13.5, fontWeight: active ? 600 : 400,
    textDecoration:"none",
  }),
  bottomWrap:{ borderTop:`1px solid ${C.navyLine}`, padding:"14px 0" } as CSSProperties,
  servingBox:{ padding:"14px 22px 18px", display:"flex", alignItems:"center", gap:10 } as CSSProperties,
  page:     { flex:1, padding:"30px 36px", maxWidth:1180 } as CSSProperties,
  pageTitleRow:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 } as CSSProperties,
  pageTitle:{ fontSize:24, fontWeight:800, color:C.navy, marginBottom:5 } as CSSProperties,
  pageSub:  { fontSize:13.5, color:C.grey500 } as CSSProperties,
  back:     { display:"flex", alignItems:"center", gap:6, color:C.grey700, fontSize:13.5, fontWeight:500, cursor:"pointer", marginBottom:18, textDecoration:"none" } as CSSProperties,
  card:     (extra: CSSProperties = {}): CSSProperties => ({ background:C.white, borderRadius:12, padding:24, border:`1px solid ${C.grey100}`, boxShadow:"0 1px 2px rgba(15,30,60,0.04)", ...extra }),
  cardHead: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 } as CSSProperties,
  cardTitle:{ fontSize:15.5, fontWeight:700, color:C.navy } as CSSProperties,
  label:    { fontSize:11, fontWeight:600, color:C.grey500, textTransform:"uppercase", letterSpacing:"0.8px" } as CSSProperties,
  grid:     (cols: number, gap = 18): CSSProperties => ({ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap }),
  row:      (gap = 10): CSSProperties => ({ display:"flex", alignItems:"center", gap }),
  divider:  { border:"none", borderTop:`1px solid ${C.grey100}`, margin:"18px 0" } as CSSProperties,
  input:    { border:`1px solid ${C.grey300}`, borderRadius:8, padding:"9px 13px", fontSize:13.5, color:C.navy, outline:"none", width:"100%", boxSizing:"border-box", background:C.white } as CSSProperties,
  inputWrap:{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 } as CSSProperties,
  inputLabel:{ fontSize:12.5, fontWeight:600, color:C.grey700 } as CSSProperties,
};

export type BtnVariant = "primary" | "teal" | "secondary" | "danger" | "ghost" | "gold" | "whatsapp" | "disabled";
export type BtnSize = "sm" | "md" | "lg";

export const btn = (variant: BtnVariant = "primary", size: BtnSize = "md"): CSSProperties => {
  const base: CSSProperties = { borderRadius:8, fontWeight:600, cursor:"pointer", border:"none", display:"inline-flex", alignItems:"center", gap:7, whiteSpace:"nowrap" };
  const sizes: Record<BtnSize, CSSProperties> = { sm:{ padding:"7px 13px", fontSize:12.5 }, md:{ padding:"10px 18px", fontSize:13.5 }, lg:{ padding:"13px 22px", fontSize:14.5 } };
  const variants: Record<BtnVariant, CSSProperties> = {
    primary:   { background:C.navy, color:C.white },
    teal:      { background:C.teal, color:C.white },
    secondary: { background:C.white, color:C.navy, border:`1px solid ${C.grey300}` },
    danger:    { background:C.red, color:C.white },
    ghost:     { background:"transparent", color:C.teal },
    gold:      { background:C.gold, color:C.white },
    whatsapp:  { background:C.whatsapp, color:C.white },
    disabled:  { background:C.grey100, color:C.grey500, cursor:"not-allowed" },
  };
  return { ...base, ...sizes[size], ...variants[variant] };
};

export const badge = (bg: string, fg: string): CSSProperties => ({ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:bg, color:fg, letterSpacing:"0.3px" });

// ─── ICONS ───────────────────────────────────────────────────────────────────
export type IconName =
  | "home" | "card" | "pulse" | "users" | "bank" | "calendar" | "creditcard"
  | "trend" | "doc" | "shield" | "building" | "user" | "logout" | "back"
  | "edit" | "plus" | "upload" | "download" | "print" | "mail" | "phone"
  | "pin" | "chat" | "clock" | "file" | "check" | "note" | "arrowRight" | "refresh";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }: IconProps) => {
  const P: Record<IconName, ReactNode> = {
    home:        <><path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10"/></>,
    card:        <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
    pulse:       <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
    users:       <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    bank:        <><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 9l9-6 9 6"/><line x1="7" y1="13" x2="7" y2="16"/><line x1="12" y1="13" x2="12" y2="16"/><line x1="17" y1="13" x2="17" y2="16"/></>,
    calendar:    <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    creditcard:  <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    trend:       <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    doc:         <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></>,
    shield:      <><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/><polyline points="9 12 11 14 15 10"/></>,
    building:    <><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="10" y1="22" x2="10" y2="18"/><line x1="14" y1="22" x2="14" y2="18"/></>,
    user:        <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0116 0v2"/></>,
    logout:      <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    back:        <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    edit:        <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    plus:        <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    upload:      <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    download:    <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    print:       <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
    mail:        <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    phone:       <><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.02 1.22 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></>,
    pin:         <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    chat:        <><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></>,
    clock:       <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    file:        <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    check:       <><polyline points="20 6 9 17 4 12"/></>,
    note:        <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    arrowRight:  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    refresh:     <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {P[name]}
    </svg>
  );
};

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────────────────
interface BtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  onClick?: () => void;
  sx?: CSSProperties;
  type?: "button" | "submit" | "reset";
}

export const Btn = ({ children, variant = "primary", size = "md", onClick, sx, type }: BtnProps) => (
  <button type={type || "button"} style={{ ...btn(variant,size), ...sx }} onClick={onClick}>{children}</button>
);

interface CardProps {
  children: ReactNode;
  sx?: CSSProperties;
}

export const Card = ({ children, sx }: CardProps) => <div style={S.card(sx)}>{children}</div>;

interface CardHeadProps {
  title: string;
  action?: string;
  actionIcon?: IconName;
  onAction?: () => void;
}

export const CardHead = ({ title, action, actionIcon, onAction }: CardHeadProps) => (
  <div style={S.cardHead}>
    <span style={S.cardTitle}>{title}</span>
    {action && <Btn variant="ghost" size="sm" onClick={onAction}>{actionIcon && <Icon name={actionIcon} size={13}/>}{action}</Btn>}
  </div>
);

interface FieldProps {
  label: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}

export const Field = ({ label, value, onChange, type = "text", placeholder }: FieldProps) => (
  <div style={S.inputWrap}>
    <label style={S.inputLabel}>{label}</label>
    <input type={type} value={value} placeholder={placeholder} onChange={onChange} style={S.input}/>
  </div>
);

export const WhatsAppFab = () => (
  <div style={{ position:"fixed", bottom:24, right:28, background:C.whatsapp, color:C.white, borderRadius:30, padding:"11px 18px", display:"flex", alignItems:"center", gap:8, fontWeight:600, fontSize:13.5, boxShadow:"0 4px 14px rgba(0,0,0,0.18)", cursor:"pointer", zIndex:50 }}>
    <Icon name="chat" size={16} color={C.white}/> WhatsApp Support
  </div>
);

interface FileRowProps {
  label: string;
  hint: string;
  required?: boolean;
}

export const FileRow = ({ label, hint, required }: FileRowProps) => (
  <Card sx={{ marginBottom:16 }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
      <Icon name="file" size={15} color={C.navy}/>
      <span style={{ fontWeight:700, color:C.navy, fontSize:14.5 }}>{label}</span>
      {required && <span style={{ color:C.red, fontWeight:700 }}>*</span>}
    </div>
    <div style={{ fontSize:12.5, color:C.grey500, marginBottom:12 }}>{hint}</div>
    <div style={{ border:`1px dashed ${C.grey300}`, borderRadius:8, padding:"11px 14px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:C.grey700, fontSize:13, cursor:"pointer" }}>
      <Icon name="upload" size={14} color={C.grey700}/> Choose File
    </div>
  </Card>
);

interface DetailProps {
  label: string;
  value: string;
  muted?: boolean;
}

export const Detail = ({ label, value, muted }: DetailProps) => (
  <div>
    <div style={{ fontSize:11.5, color:C.grey500 }}>{label}</div>
    <div style={{ fontSize:14.5, fontWeight:700, color: muted ? C.grey500 : C.navy, marginTop:3 }}>{value}</div>
  </div>
);

interface ContactRowProps {
  icon: IconName;
  label: string;
  value: string;
  link?: boolean;
}

export const ContactRow = ({ icon, label, value, link }: ContactRowProps) => (
  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
    <div style={{ background:C.grey100, borderRadius:99, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon name={icon} size={15} color={C.grey700}/>
    </div>
    <div>
      <div style={{ fontSize:11.5, color:C.grey500 }}>{label}</div>
      <div style={{ fontSize:13.5, fontWeight:700, color: link?C.teal:C.navy }}>{value}</div>
    </div>
  </div>
);

// ─── DIGITAL MEMBERSHIP CARD ──────────────────────────────────────────────────
export interface MemberCardProps {
  compact?: boolean;
  memberNum?: string;
  memberName?: string;
  planName?: string;
  status?: string;
  tokensRemaining?: number;
  totalTokens?: number;
}

export const MemberCard = ({ compact, memberNum, memberName, planName, status, tokensRemaining, totalTokens }: MemberCardProps) => {
  const rem = tokensRemaining ?? 2;
  const tot = totalTokens ?? 3;
  const isUnlimited = tot === -1;

  const tokenColor = isUnlimited || rem > 1 ? "#2DD4BF" : rem === 1 ? "#FBBF24" : "#F87171";
  const tokenBg = isUnlimited || rem > 1 ? "rgba(19, 168, 158, 0.25)" : rem === 1 ? "rgba(201, 150, 58, 0.25)" : "rgba(209, 67, 67, 0.3)";
  const tokenBorder = isUnlimited || rem > 1 ? "rgba(19, 168, 158, 0.5)" : rem === 1 ? "rgba(201, 150, 58, 0.5)" : "rgba(209, 67, 67, 0.6)";
  const tokenText = isUnlimited ? "UNLIMITED" : `${rem} / ${tot} REMAINING`;

  return (
    <div style={{
      background:`linear-gradient(135deg, ${C.navy} 0%, #0c2557 55%, ${C.navyMid} 100%)`,
      borderRadius:16, padding:compact?20:26, color:C.white, position:"relative", overflow:"hidden",
      boxShadow:"0 10px 30px rgba(11,27,63,0.35)", maxWidth: compact?"100%":520,
    }}>
      <div style={{ position:"absolute", right:-60, top:-60, width:220, height:220, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.08)" }}/>
      <div style={{ position:"absolute", right:-20, top:-20, width:160, height:160, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.08)" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative", zIndex:1 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <Icon name="building" size={18} color={C.goldLt}/>
            <span style={{ fontWeight:800, fontSize:19, letterSpacing:".3px" }}>NFS <span style={{ color:C.goldLt, fontWeight:600 }}>| INSURE</span></span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6, fontSize:11.5, color:"#9FB0CE" }}>
            <span style={{ width:14, height:14, borderRadius:"50%", background:"#fff", display:"inline-block" }}/>
            Braam Health Centre
          </div>
        </div>
        <span style={{ ...badge("transparent","#E8B85A"), border:`1px solid ${C.goldLt}`, fontSize:10.5 }}>{status?.toUpperCase() || "ACTIVE"}</span>
      </div>

      <div style={{ marginTop:20, position:"relative", zIndex:1, display:"flex", justifyContent:"space-between" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize:10.5, letterSpacing:"1.4px", color:"#8DA0C2", textTransform:"uppercase", marginBottom:4 }}>Membership Number</div>
          <div style={{ fontSize:20, fontWeight:700, letterSpacing:"1.5px", fontFamily:"monospace" }}>{memberNum || "NFS8 9012 3456 7"}</div>

          <div style={{ display:"flex", gap:28, marginTop:14 }}>
            <div>
              <div style={{ fontSize:10, letterSpacing:"1.2px", color:"#8DA0C2", textTransform:"uppercase", marginBottom:3 }}>Member</div>
              <div style={{ fontWeight:700, fontSize:13.5 }}>{memberName?.toUpperCase() || "EZILE GCSAMBA"}</div>
            </div>
            <div>
              <div style={{ fontSize:10, letterSpacing:"1.2px", color:"#8DA0C2", textTransform:"uppercase", marginBottom:3 }}>Plan</div>
              <div style={{ fontWeight:700, fontSize:13.5, color:C.goldLt }}>{planName?.toUpperCase() || "COUPLE"}</div>
            </div>
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:10, width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft: 12 }}>
          <svg width="60" height="60" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/>
            {Array.from({length:64}).map((_,i)=>{
              const x=(i%8)*8, y=Math.floor(i/8)*8;
              return ((i*7+3)%5===0) ? <rect key={i} x={x} y={y} width="8" height="8" fill="#0B1B3F"/> : null;
            })}
          </svg>
        </div>
      </div>

      <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.12)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", zIndex:1 }}>
        <div>
          <div style={{ fontSize:9.5, letterSpacing:"1.2px", color:"#8DA0C2", textTransform:"uppercase", marginBottom:3 }}>CONSULTATION TOKENS</div>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:6,
            background: tokenBg, border:`1px solid ${tokenBorder}`, color: tokenColor,
            fontSize:12, fontWeight:700, letterSpacing:"0.4px"
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background: tokenColor, display:"inline-block" }} />
            {tokenText}
          </div>
        </div>
        {!compact && (
          <div style={{ fontSize:11.5, color:"#9FB0CE", display:"flex", alignItems:"center", gap:4 }}>
            <Icon name="note" size={13} color={C.goldLt}/> Digital Token Verified
          </div>
        )}
      </div>

      {!compact && (
        <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11.5, color:"#9FB0CE" }}>
          <span>Show QR at reception for instant verification</span>
          <span style={{ color:C.goldLt, fontWeight:600 }}>Active Membership</span>
        </div>
      )}
    </div>
  );
};


// ─── SHARED DATA (mock) ──────────────────────────────────────────────────────
export interface ConsultEntry {
  date: string;
  weekday: string;
  text: string;
}

export const consultData: ConsultEntry[] = [
  { date:"Apr 28, 2026", weekday:"Tuesday at 10:30", text:"End of month review. Ankle healed well. BP 128/80. Outstanding progress over 7 months — BP normalised, weight reduced, cholesterol improved. Plan to maintain current regimen and annual review." },
  { date:"Apr 17, 2026", weekday:"Friday at 11:00", text:"Walk-in. Patient fell during morning run — mild ankle sprain, no fracture on clinical exam. RICE advised. Voltaren gel dispensed. Strapping applied. Follow-up PRN." },
  { date:"Apr 3, 2026", weekday:"Friday at 09:00", text:"Monthly review. BP 130/82. Stable on 2.5mg Amlodipine. Rash resolved. Patient reports feeling the best in years. Continue current management. Review in 4 weeks." },
  { date:"Mar 20, 2026", weekday:"Friday at 14:00", text:"BP on reduced dose: 132/84. Acceptable. Continue 2.5mg. Patient in good spirits. Minor skin rash on forearm — likely contact dermatitis. Hydrocortisone cream dispensed." },
  { date:"Mar 6, 2026", weekday:"Friday at 10:15", text:"Routine monthly review. BP 128/80 — within target range. Patient very motivated. Weight 81kg (total 3kg loss since starting). Discussed reducing Amlodipine to 2.5mg as BP well-controlled." },
  { date:"Feb 19, 2026", weekday:"Thursday at 11:30", text:"Cholesterol follow-up results — total 5.2 mmol/L (improved from 5.8). LDL 3.1, HDL 1.4. Dietary changes effective. No statin needed. Continue monitoring annually. BP 130/82." },
];

export interface ApptEntry {
  mon: string;
  day: number;
  time: string;
  title: string;
  req: string;
  status: "Confirmed" | "Completed";
  note: string;
}

export const apptData: ApptEntry[] = [
  { mon:"MAY", day:8, time:"10:00", title:"Quarterly review — BP and cholesterol", req:"Requested 5 May 2026", status:"Confirmed", note:"Upcoming appointment scheduled." },
  { mon:"OCT", day:3, time:"09:00", title:"Blood pressure follow-up", req:"Requested 1 Oct 2025", status:"Completed", note:"Seen by Dr Khumalo. BP elevated — medication reviewed." },
  { mon:"NOV", day:6, time:"09:00", title:"Monthly BP check and medication renewal", req:"Requested 4 Nov 2025", status:"Completed", note:"BP improving. Amlodipine renewed." },
  { mon:"NOV", day:20, time:"10:30", title:"Chest tightness after exercise", req:"Requested 19 Nov 2025", status:"Completed", note:"ECG normal. Cholesterol blood test ordered." },
  { mon:"DEC", day:4, time:"11:15", title:"Routine BP review and 2-month prescription", req:"Requested 2 Dec 2025", status:"Completed", note:"Amlodipine 5mg renewed for 2 months." },
];

export type PlanState = "normal" | "current" | "upgrade" | "soon";

export interface Plan {
  name: string;
  price: string | null;
  per: string;
  features: string[];
  cta: string;
  state: PlanState;
  popular?: boolean;
  comingSoon?: boolean;
}

export const plans: Plan[] = [
  { name:"Essential", price:"R550", per:"Single member", features:["3 consultations/month","Single member","Medication included","24/7 access"], cta:"Switch to Essential", state:"normal" },
  { name:"Couple", price:"R720", per:"2 adults", features:["6 consultations/month","2 adults","Medication included","24/7 access"], cta:"Your current plan", state:"current" },
  { name:"Family", price:"R850", per:"Family of 4", features:["12 consultations/month","Family of 4","Medication included","24/7 access"], cta:"Upgrade to Family", state:"upgrade" },
  { name:"Family+", price:"R1 150", per:"Family of 6", features:["18 consultations/month","Family of 6","Medication included","24/7 access"], cta:"Upgrade to Family+", state:"upgrade", popular:true },
  { name:"Senior Care", price:"R650", per:"Single, 60+", features:["4 consultations/month","Single 60+","Medication included","Chronic script","24/7 access"], cta:"Switch to Senior Care", state:"normal" },
  { name:"Corporate", price:"R480", per:"Per employee (min. 10)", features:["3 consultations/month","Min. 10 employees","Medication included","24/7 access"], cta:"Switch to Corporate", state:"normal" },
  { name:"Basic Health Membership", price:"R599", per:"1 member", features:["3 consultations/month","1 member"], cta:"Switch to Basic Health Membership", state:"normal" },
  { name:"Braam Health Membership", price:"R888", per:"1 member", features:["3 consultations/month","1 member"], cta:"Upgrade to Braam Health Membership", state:"upgrade" },
  { name:"Braam Health Plus+", price:"R1 333", per:"2 members", features:["6 consultations/month","2 members"], cta:"Upgrade to Braam Health Plus+", state:"upgrade" },
  { name:"Corporate Membership", price:"R499", per:"1 member (min. 10)", features:["3 consultations/month","1 member (min. 10)"], cta:"Switch to Corporate Membership", state:"normal" },
  { name:"Chronic Medication Programme", price:null, per:"1 member", features:["0 consultations/month","1 member"], cta:"Coming Soon", state:"soon", comingSoon:true },
];
