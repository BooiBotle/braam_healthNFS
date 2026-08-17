import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getConsultations, getMemberDetails, type Member, type Consultation } from "../../lib/api/member";
import { C, S, Icon, Card, badge } from "../../components/shared";
import { motion } from "framer-motion";

export default function Consultations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        if (mem) {
          setMember(mem);
          const data = await getConsultations(mem.id);
          setConsultations(data);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const plan = member?.plan;
  const consultationsLimit = plan?.consultations_pm ?? 3;
  const consultationsUsed = member?.consultations_used_this_month ?? 0;
  const consultationsRemaining = Math.max(0, consultationsLimit === -1 ? 999 : consultationsLimit - consultationsUsed);
  const usagePct = consultationsLimit === -1 ? 0 : Math.min(100, (consultationsUsed / (consultationsLimit || 1)) * 100);

  // Group consultations by month
  const byMonth: Record<string, any[]> = {};
  consultations.forEach((c) => {
    const dateStr = (c as any).visited_at || (c as any).consultation_date || new Date().toISOString();
    const d = new Date(dateStr);
    const key = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(c);
  });

  return (
    <div>
      <div style={S.back} onClick={() => navigate("/member")}>
        <Icon name="back" size={15} /> Back to Dashboard
      </div>
      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>Consultation History</div>
          <div style={S.pageSub}>Your complete visit record at Braam Health Centre.</div>
        </div>
      </div>

      {/* Usage Summary Banner */}
      {!loading && plan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, #0c2557 100%)`,
            borderRadius: 16, padding: "20px 24px", color: "#fff",
            marginBottom: 20, position: "relative", overflow: "hidden",
            boxShadow: "0 8px 24px rgba(11,27,63,0.25)",
          }}
        >
          <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", right: 10, top: 10, width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8DA0C2", marginBottom: 4 }}>
                {new Date().toLocaleString('default', { month: 'long' })} Usage — {plan.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{consultationsUsed}</div>
                <div style={{ fontSize: 20, color: "#8DA0C2" }}>/ {consultationsLimit === -1 ? "∞" : consultationsLimit}</div>
              </div>
              <div style={{ fontSize: 12, color: "#8DA0C2", marginTop: 4 }}>consultations used this month</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: consultationsRemaining === 0 ? "#ef4444" : "#10b981" }}>
                {consultationsLimit === -1 ? "∞" : consultationsRemaining}
              </div>
              <div style={{ fontSize: 11, color: "#8DA0C2", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remaining</div>
            </div>
          </div>

          {consultationsLimit !== -1 && (
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 8, overflow: "hidden", marginTop: 16, position: "relative", zIndex: 1 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePct}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                style={{
                  height: "100%", borderRadius: 99,
                  background: usagePct >= 100 ? "#ef4444"
                    : usagePct >= 75 ? "#f59e0b"
                    : "linear-gradient(90deg, #10b981, #13A89E)",
                  boxShadow: "0 0 10px rgba(16,185,129,0.4)",
                }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Stats row */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Visits", value: consultations.length, icon: "pulse" as const, color: C.navy },
            { label: "This Month", value: consultationsUsed, icon: "calendar" as const, color: C.teal },
            { label: "Plan Limit", value: consultationsLimit === -1 ? "∞" : consultationsLimit, icon: "shield" as const, color: C.gold },
          ].map((s) => (
            <Card key={s.label} sx={{ textAlign: "center", padding: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.offWhite, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <Icon name={s.icon} size={16} color={s.color} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Consultation Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {loading ? (
          <Card>
            <div style={{ textAlign: "center", padding: 20, color: C.grey500 }}>Loading consultations...</div>
          </Card>
        ) : consultations.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🩺</div>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 16 }}>No consultations yet</div>
              <div style={{ color: C.grey500, fontSize: 13.5, marginTop: 6 }}>Your consultation history will appear here after your first visit.</div>
            </div>
          </Card>
        ) : (
          Object.entries(byMonth).map(([month, cons]) => (
            <div key={month}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "1.5px", padding: "12px 0 8px" }}>
                {month}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cons.map((c: any, idx: number) => {
                  const dateStr = c.visited_at || c.consultation_date || new Date().toISOString();
                  const d = new Date(dateStr);
                  const isExpanded = expanded === c.id;

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        background: C.white, borderRadius: 14,
                        border: `1px solid ${isExpanded ? C.navy + "30" : C.grey100}`,
                        boxShadow: isExpanded ? "0 4px 16px rgba(11,27,63,0.08)" : "0 1px 2px rgba(0,0,0,0.04)",
                        overflow: "hidden", transition: "box-shadow .2s",
                      }}
                    >
                      {/* Consultation Header */}
                      <div
                        style={{ display: "flex", gap: 14, padding: 16, cursor: "pointer" }}
                        onClick={() => setExpanded(isExpanded ? null : c.id)}
                      >
                        {/* Date Badge */}
                        <div style={{
                          flexShrink: 0, width: 44, height: 52, borderRadius: 10,
                          background: "linear-gradient(135deg, #E7EEFB, #D0DEFF)",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{d.getDate()}</div>
                          <div style={{ fontSize: 9, color: C.grey500, textTransform: "uppercase" }}>
                            {d.toLocaleString('default', { month: 'short' })}
                          </div>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>
                                {c.diagnosis || c.consultation_type?.replace(/_/g, ' ') || 'General Consultation'}
                              </div>
                              {c.doctor_name && (
                                <div style={{ fontSize: 12, color: C.grey500, marginTop: 2 }}>👨‍⚕️ {c.doctor_name}</div>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{
                                ...badge(
                                  c.counted_toward_limit ? "#FEF3C7" : C.greenBg,
                                  c.counted_toward_limit ? "#D97706" : C.green
                                ),
                                fontSize: 10,
                              }}>
                                {c.counted_toward_limit ? `#${c.consultation_number || idx + 1}` : "Free"}
                              </span>
                              <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke={C.grey500} strokeWidth="2"
                                style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: ".2s", flexShrink: 0 }}
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: C.grey500, marginTop: 4 }}>
                            {d.toLocaleString('default', { weekday: 'long' })} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{
                            borderTop: `1px solid ${C.grey100}`,
                            padding: 16,
                            background: C.offWhite,
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {c.presenting_complaint && (
                              <div>
                                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Presenting Complaint</div>
                                <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.6 }}>{c.presenting_complaint}</div>
                              </div>
                            )}
                            {c.clinical_notes && (
                              <div>
                                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Clinical Notes</div>
                                <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.6 }}>{c.clinical_notes}</div>
                              </div>
                            )}
                            {c.treatment_given && (
                              <div>
                                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Treatment Given</div>
                                <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.6 }}>{c.treatment_given}</div>
                              </div>
                            )}

                            {/* Vitals */}
                            {(c.bp_systolic || c.temperature_c || c.weight_kg || c.glucose_mmol) && (
                              <div>
                                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Vitals</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                                  {c.bp_systolic && c.bp_diastolic && (
                                    <div style={{ background: C.white, borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.grey100}` }}>
                                      <div style={{ fontSize: 10, color: C.grey500 }}>Blood Pressure</div>
                                      <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{c.bp_systolic}/{c.bp_diastolic} <span style={{ fontSize: 11, fontWeight: 400 }}>mmHg</span></div>
                                    </div>
                                  )}
                                  {c.temperature_c && (
                                    <div style={{ background: C.white, borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.grey100}` }}>
                                      <div style={{ fontSize: 10, color: C.grey500 }}>Temperature</div>
                                      <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{c.temperature_c} <span style={{ fontSize: 11, fontWeight: 400 }}>°C</span></div>
                                    </div>
                                  )}
                                  {c.weight_kg && (
                                    <div style={{ background: C.white, borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.grey100}` }}>
                                      <div style={{ fontSize: 10, color: C.grey500 }}>Weight</div>
                                      <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{c.weight_kg} <span style={{ fontSize: 11, fontWeight: 400 }}>kg</span></div>
                                    </div>
                                  )}
                                  {c.glucose_mmol && (
                                    <div style={{ background: C.white, borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.grey100}` }}>
                                      <div style={{ fontSize: 10, color: C.grey500 }}>Glucose</div>
                                      <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{c.glucose_mmol} <span style={{ fontSize: 11, fontWeight: 400 }}>mmol/L</span></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Flags */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {c.sick_note_issued && (
                                <span style={{ ...badge("#DBEAFE", "#1D4ED8"), fontSize: 10.5 }}>📄 Sick Note Issued</span>
                              )}
                              {c.referral_issued && (
                                <span style={{ ...badge("#F5F3FF", "#7C3AED"), fontSize: 10.5 }}>↗ Referral Issued</span>
                              )}
                              {c.follow_up_required && (
                                <span style={{ ...badge("#FEF3C7", "#D97706"), fontSize: 10.5 }}>🔄 Follow-up Required</span>
                              )}
                              {c.is_flagged && (
                                <span style={{ ...badge("#FBE7E7", C.red), fontSize: 10.5 }}>⚠️ {c.flagged_reason || "Flagged"}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
