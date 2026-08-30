import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMemberDetails, type Member } from "../../lib/api/member";
import { C, S, Icon, Btn } from "../../components/shared";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

export default function MyCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) setMember(mem);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const cardNumber = member?.card_number || "";
  const qrUrl = cardNumber ? `${window.location.origin}/member-profile/${encodeURIComponent(cardNumber)}` : "";
  const plan = member?.plan;
  const consultationsUsed = member?.consultations_used_this_month || 0;
  const consultationsLimit = plan?.consultations_pm || 0;
  const consultationsRemaining = Math.max(0, consultationsLimit === -1 ? 999 : consultationsLimit - consultationsUsed);
  const usagePct = consultationsLimit === -1 ? 0 : Math.min(100, (consultationsUsed / (consultationsLimit || 1)) * 100);

  const isActive = member?.status === "active";
  const statusColor = isActive ? "#10b981" : (member?.status === "pending" ? "#f59e0b" : "#ef4444");
  const statusBg = isActive ? "rgba(16,185,129,0.15)" : (member?.status === "pending" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)");
  const statusBorder = isActive ? "rgba(16,185,129,0.4)" : (member?.status === "pending" ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)");
  const statusText = isActive ? "ACTIVE" : (member?.status === "pending" ? "AWAITING PAYMENT" : member?.status?.toUpperCase() || "INACTIVE");


  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <motion.div
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            border: `3px solid ${C.grey100}`, borderTop: `3px solid ${C.navy}`,
            margin: "0 auto 12px",
          }}
        />
        <div style={{ color: C.grey500, fontSize: 13 }}>Loading your membership card...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={S.back} onClick={() => navigate("/member")}>
        <Icon name="back" size={15} /> Back to Dashboard
      </div>

      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>{plan?.name ? `${plan.name} Membership Card` : "My Membership Card"}</div>
          <div style={S.pageSub}>Present this card at Braam Health Centre for instant verification.</div>
        </div>
      </div>

      {!member ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: "linear-gradient(135deg, #0B1B3F 0%, #1e3a7a 100%)",
            borderRadius: 24, padding: "40px 32px", textAlign: "center", 
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 40px rgba(11,27,63,0.15)",
            position: "relative", overflow: "hidden",
            color: "#fff", maxWidth: "100%"
          }}
        >
          {/* Animated background elements */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", top: "-50%", left: "-20%", width: 400, height: 400,
              background: "radial-gradient(circle, rgba(201,150,58,0.15) 0%, transparent 70%)",
              borderRadius: "50%", pointerEvents: "none"
            }}
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", bottom: "-30%", right: "-20%", width: 300, height: 300,
              background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
              borderRadius: "50%", pointerEvents: "none"
            }}
          />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px", backdropFilter: "blur(10px)"
              }}
            >
              <div style={{ fontSize: 32 }}>⏳</div>
            </motion.div>
            
            <h3 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px", color: "#ffffff" }}>
              Application Processing
            </h3>
            
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 28px" }}>
              Your membership application is currently under review by our admin team. Once approved, your digital membership card, QR code, and full plan benefits will automatically appear right here!
            </p>

            <div style={{
              background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: "16px 20px",
              display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left",
              border: "1px solid rgba(255,255,255,0.05)", maxWidth: 440, margin: "0 auto"
            }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(201,150,58,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 12 }}>✨</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#E8B85A" }}>What happens next?</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                  You will receive an email as soon as your account is activated. If you have been approved and haven't paid, you'll be able to setup your debit mandate right from your dashboard.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>


      {/* DIGITAL CARD */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: plan?.name?.toLowerCase().includes("premium") 
            ? "linear-gradient(135deg, #1f2937 0%, #111827 50%, #030712 100%)" // Dark / Platinum
            : plan?.name?.toLowerCase().includes("family")
            ? "linear-gradient(135deg, #0f766e 0%, #115e59 50%, #042f2e 100%)" // Teal / Family
            : "linear-gradient(135deg, #0B1B3F 0%, #0c2557 50%, #142a52 100%)", // Navy / Essential (Default)
          borderRadius: 20, padding: 28, color: "#fff",
          boxShadow: "0 20px 50px rgba(11,27,63,0.4)",
          position: "relative", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", right: -10, top: -10, width: 140, height: 140, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,150,58,0.06) 0%, transparent 70%)" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: "linear-gradient(135deg, #C9963A, #E8B85A)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="building" size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: ".3px" }}>
                NFS <span style={{ color: "#E8B85A" }}>| INSURE</span>
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#E8B85A", marginTop: 4, letterSpacing: "0.5px", fontWeight: 700, textTransform: "uppercase" }}>
              {plan?.name ? `${plan.name} PLAN` : "Braam Health Centre"}
            </div>
          </div>
          <div style={{
            background: statusBg, border: `1px solid ${statusBorder}`,
            borderRadius: 20, padding: "4px 12px", fontSize: 10.5, fontWeight: 700, letterSpacing: 1,
            color: statusColor, textTransform: "uppercase" as const,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
            {statusText}
          </div>
        </div>

        {/* Card Number */}
        <div style={{ position: "relative", zIndex: 1, marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: "1.8px", color: "#8DA0C2", textTransform: "uppercase", marginBottom: 6 }}>
            Membership Number
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "3px", fontFamily: "monospace", color: "#fff" }}>
            {cardNumber}
          </div>
        </div>

        {/* Member info + QR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", gap: 32 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "1.4px", color: "#8DA0C2", textTransform: "uppercase", marginBottom: 3 }}>Member</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{member?.profiles?.full_name || member?.profiles?.first_name || user?.name?.toUpperCase() || "MEMBER"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "1.4px", color: "#8DA0C2", textTransform: "uppercase", marginBottom: 3 }}>Plan</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#E8B85A" }}>{plan?.name?.toUpperCase() || "PLAN"}</div>
              </div>
            </div>
          </div>

          {/* Toggle between QR and NFC chip illustration */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowQR(!showQR)}
            style={{ cursor: "pointer" }}
          >
            {showQR ? (
              <div style={{ background: "#fff", borderRadius: 10, padding: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                <QRCode value={qrUrl} size={80} bgColor="#ffffff" fgColor="#0B1B3F" level="Q" />
              </div>
            ) : (
              <div style={{
                width: 96, height: 96, borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 4,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9963A" strokeWidth="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                  <rect x="4" y="13" width="4" height="4" rx="1" fill="#C9963A" stroke="none" opacity="0.7" />
                </svg>
                <span style={{ fontSize: 9, color: "#8DA0C2", letterSpacing: "0.5px" }}>TAP TO SHOW QR</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom strip */}
        <div style={{
          marginTop: 20, paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 11, color: "#8DA0C2", position: "relative", zIndex: 1,
        }}>
          <span>🔒 Tap the card to reveal your QR code</span>
          <span style={{ color: "#E8B85A", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="shield" size={12} color="#E8B85A" /> Secure
          </span>
        </div>
      </motion.div>

      {/* QR Section - Full Size */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          marginTop: 20, background: C.white,
          borderRadius: 16, padding: 24,
          border: `1px solid ${C.grey100}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>Your QR Code</div>
            <div style={{ fontSize: 12, color: C.grey500, marginTop: 2 }}>
              Have staff scan this to verify your membership instantly
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            background: "#fff", padding: 16, borderRadius: 16,
            border: `2px solid ${C.grey100}`,
            boxShadow: "0 4px 20px rgba(11,27,63,0.1)",
          }}>
            <QRCode value={qrUrl} size={200} bgColor="#ffffff" fgColor={C.navy} level="H" />
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: C.grey500, textAlign: "center" }}>
            Points to: <span style={{ color: C.navy, fontWeight: 600, fontFamily: "monospace", fontSize: 11 }}>{cardNumber}</span>
          </div>
          <div style={{
            marginTop: 8, padding: "4px 12px",
            background: "#E3F6EC", borderRadius: 20,
            fontSize: 11, color: C.green, fontWeight: 600,
          }}>
            ✓ Scannable — Works offline & online
          </div>
        </div>
      </motion.div>

      {/* Consultation Usage */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 16, background: C.white,
          borderRadius: 16, padding: 24,
          border: `1px solid ${C.grey100}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ background: "#E7EEFB", borderRadius: 8, padding: 7, display: "flex" }}>
            <Icon name="pulse" size={16} color={C.navy} />
          </div>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>Monthly Consultation Usage</div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.navy, lineHeight: 1 }}>{consultationsUsed}</div>
          <div style={{ fontSize: 18, color: C.grey500 }}>/ {consultationsLimit === -1 ? "∞" : consultationsLimit}</div>
          <div style={{ fontSize: 12, color: C.grey500, marginLeft: 4 }}>this month</div>
        </div>

        {/* Progress bar */}
        {consultationsLimit !== -1 && (
          <div style={{ background: C.grey100, borderRadius: 99, height: 10, overflow: "hidden", marginBottom: 12 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              style={{
                height: "100%", borderRadius: 99,
                background: usagePct >= 100
                  ? "linear-gradient(90deg, #ef4444, #dc2626)"
                  : usagePct >= 75
                  ? "linear-gradient(90deg, #f59e0b, #C9963A)"
                  : `linear-gradient(90deg, ${C.teal}, ${C.navy})`,
              }}
            />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Used", value: consultationsUsed, color: C.navy },
            {
              label: "Remaining",
              value: consultationsLimit === -1 ? "∞" : consultationsRemaining,
              color: consultationsRemaining === 0 ? C.red : C.green
            },
            { label: "Plan Limit", value: consultationsLimit === -1 ? "Unlimited" : consultationsLimit, color: C.gold },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: C.offWhite, borderRadius: 12, padding: 12, textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 10.5, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {consultationsLimit !== -1 && consultationsUsed >= consultationsLimit && (
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "#FBE7E7", border: `1px solid ${C.red}33`,
            borderRadius: 10, fontSize: 12.5, color: C.red, fontWeight: 600,
          }}>
            ⚠️ You have used all consultations for this month. Additional visits may require out-of-pocket payment.
          </div>
        )}
      </motion.div>

      {/* Plan Benefits */}
      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 16, background: C.white,
            borderRadius: 16, padding: 24,
            border: `1px solid ${C.grey100}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ background: "#E3F6EC", borderRadius: 8, padding: 7, display: "flex" }}>
              <Icon name="shield" size={16} color={C.green} />
            </div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>Your Plan Benefits</div>
            <span style={{
              marginLeft: "auto", fontSize: 11, fontWeight: 700, color: C.gold,
              background: "#FEF3C7", borderRadius: 20, padding: "3px 10px",
            }}>
              {plan.name}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                icon: "🩺",
                label: `${consultationsLimit === -1 ? "Unlimited" : consultationsLimit} Consultations/Month`,
                sub: `${consultationsRemaining === 0 ? "No" : consultationsRemaining} remaining this month`,
                active: true,
              },
              {
                icon: "💊", label: "Medication Included",
                sub: plan.includes_medication ? "Prescription medication covered" : "Not included in your plan",
                active: plan.includes_medication,
              },
              {
                icon: "🕐", label: "24/7 Access",
                sub: plan.includes_24h_access ? "Round-the-clock care available" : "Standard hours only",
                active: plan.includes_24h_access,
              },
              {
                icon: "📋", label: "Chronic Medication Programme",
                sub: plan.includes_chronic ? "Chronic scripts covered" : "Not available on your plan",
                active: plan.includes_chronic,
              },
            ].map((b) => (
              <div key={b.label} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", borderRadius: 10,
                background: b.active ? "#F0FDF4" : C.offWhite,
                border: `1px solid ${b.active ? "#BBF7D0" : C.grey100}`,
              }}>
                <span style={{ fontSize: 18 }}>{b.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: C.navy, fontSize: 13.5 }}>{b.label}</div>
                  <div style={{ fontSize: 11.5, color: C.grey500, marginTop: 1 }}>{b.sub}</div>
                </div>
                {b.active ? (
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: C.green, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon name="check" size={12} color="#fff" />
                  </div>
                ) : (
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: C.grey100, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.grey500} strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <Btn
          variant="primary"
          size="lg"
          sx={{ width: "100%", justifyContent: "center", background: C.navy }}
          onClick={() => {
            const url = qrUrl;
            window.open(url, "_blank");
          }}
        >
          <Icon name="arrowRight" size={15} /> View My Member Profile Page
        </Btn>

        {/* Google Wallet */}
        <div style={{
          border: `1px solid ${C.grey100}`, borderRadius: 12, padding: "14px 18px",
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
          background: C.white, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "conic-gradient(#4285F4 0 25%, #34A853 25% 50%, #FBBC05 50% 75%, #EA4335 75% 100%)"
          }} />
          <div>
            <div style={{ fontSize: 11, color: C.grey500 }}>Save to</div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.navy }}>Google Wallet</div>
          </div>
        </div>
      </motion.div>
        </>
      )}
    </div>
  );
}
