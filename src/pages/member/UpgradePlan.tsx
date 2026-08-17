import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMemberDetails, type Member } from "../../lib/api/member";
import { supabase } from "../../lib/supabase";
import { C, S, Icon, Btn, Card } from "../../components/shared";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

interface Plan {
  id: string;
  name: string;
  description: string;
  monthly_fee_cents: number;
  consultations_pm: number;
  max_members: number;
  includes_medication: boolean;
  includes_24h_access: boolean;
  includes_chronic: boolean;
  most_popular: boolean;
  is_active: boolean;
  display_order: number;
}

export default function UpgradePlan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appliedPlan, setAppliedPlan] = useState<Plan | null>(null);

  const hasNoPlan = !member?.plan_id;

  useEffect(() => {
    async function load() {
      if (user) {
        const mem = await getMemberDetails(user.id);
        setMember(mem);
      }

      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      setPlans(data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleApply = async () => {
    if (!selectedPlan || !member) return;
    setApplying(true);
    try {
      // Update the member's plan directly (admin will be notified)
      // For self-service, this just submits a request (sets pending plan_id)
      // but we keep them on existing plan. If no plan, set it immediately as pending.
      const updateData: any = {
        requested_plan_id: selectedPlan.id,
        updated_at: new Date().toISOString(),
      };

      // If member has no plan at all, set the plan immediately as pending
      if (hasNoPlan) {
        updateData.plan_id = selectedPlan.id;
        updateData.status = 'pending';
      }

      // 1. Update member with requested_plan_id
      const { error: memberError } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', member.id);

      if (memberError) throw memberError;

      // 2. Insert into plan_changes table so admins see it in AdminPlanChanges
      const { error: planChangeError } = await supabase
        .from('plan_changes')
        .insert({
          member_id: member.id,
          from_plan_id: member.plan_id || null,
          to_plan_id: selectedPlan.id,
          status: 'pending'
        });

      if (planChangeError) throw planChangeError;

      setAppliedPlan(selectedPlan);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <motion.div
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${C.grey100}`, borderTop: `3px solid ${C.navy}`, margin: "0 auto 12px" }}
        />
        <div style={{ color: C.grey500 }}>Loading plans...</div>
      </div>
    );
  }

  // ─── SUCCESS STATE ───
  if (success && appliedPlan) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 560 }}>
        <div style={{
          background: "linear-gradient(135deg, #0B1B3F, #0c2557)",
          borderRadius: 24, padding: 32, color: "#fff",
          textAlign: "center", boxShadow: "0 20px 50px rgba(11,27,63,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(16,185,129,0.2)", border: "2px solid #10b981",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>

          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            {hasNoPlan ? "Plan Applied!" : "Request Submitted!"}
          </div>
          <div style={{ fontSize: 14, color: "#8DA0C2", lineHeight: 1.6, marginBottom: 24 }}>
            {hasNoPlan
              ? `You have been placed on the ${appliedPlan.name} plan. Your account is now pending admin confirmation. Once confirmed, you'll have full access to ${appliedPlan.consultations_pm === -1 ? 'unlimited' : appliedPlan.consultations_pm} consultations per month.`
              : `Your request to switch to the ${appliedPlan.name} plan has been submitted. An admin will process this change and you'll be notified when it's active.`
            }
          </div>

          {/* Plan details */}
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 20, marginBottom: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#E8B85A", marginBottom: 4 }}>{appliedPlan.name}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
              R{(appliedPlan.monthly_fee_cents / 100).toFixed(0)}<span style={{ fontSize: 13, fontWeight: 400, color: "#8DA0C2" }}>/month</span>
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 20, fontSize: 13, color: "#8DA0C2", flexWrap: "wrap" }}>
              <span>🩺 {appliedPlan.consultations_pm === -1 ? "Unlimited" : appliedPlan.consultations_pm} consults/mo</span>
              {appliedPlan.includes_medication && <span>💊 Medication</span>}
              {appliedPlan.includes_24h_access && <span>🕐 24/7 Access</span>}
              {appliedPlan.includes_chronic && <span>📋 Chronic</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn variant="secondary" sx={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none" }} onClick={() => navigate("/member")}>
              <Icon name="back" size={14} /> Go to Dashboard
            </Btn>
            <Btn variant="primary" sx={{ background: "#E8B85A", color: "#0B1B3F" }} onClick={() => navigate("/member/card")}>
              <Icon name="card" size={14} /> My Card
            </Btn>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div style={S.back} onClick={() => navigate("/member")}>
        <Icon name="back" size={15} /> Back to Dashboard
      </div>

      {/* No Plan Banner */}
      {hasNoPlan && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(135deg, #FFF7ED, #FFFBEB)",
            border: "2px solid rgba(245,158,11,0.4)",
            borderRadius: 16, padding: "18px 20px",
            marginBottom: 24,
            display: "flex", alignItems: "flex-start", gap: 14,
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: "#92400e", fontSize: 16, marginBottom: 4 }}>
              You don't have a plan yet
            </div>
            <div style={{ color: "#B45309", fontSize: 13.5, lineHeight: 1.6 }}>
              Select a plan below and apply. Your application will be reviewed by an admin. Once approved, your membership card and consultation allowance will be activated.
            </div>
          </div>
        </motion.div>
      )}

      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>{hasNoPlan ? "Choose Your Plan" : "Upgrade Your Plan"}</div>
          <div style={S.pageSub}>
            {hasNoPlan
              ? "Select the plan that suits your needs. Each plan directly determines how many consultations you receive per month."
              : "Switch your membership plan. Changes take effect once confirmed by an admin."}
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "32px 20px", color: C.grey500 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 700, color: C.navy }}>No plans available</div>
            <div style={{ marginTop: 6, fontSize: 13.5 }}>Contact the clinic to enquire about membership plans.</div>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
          {plans.map((p, i) => {
            const isCurrent = p.id === member?.plan_id;
            const isSelected = selectedPlan?.id === p.id;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                onClick={() => !isCurrent && setSelectedPlan(isSelected ? null : p)}
                style={{
                  background: C.white, borderRadius: 16, padding: 22,
                  border: `2px solid ${isSelected ? C.navy : isCurrent ? C.teal : C.grey100}`,
                  cursor: isCurrent ? "default" : "pointer",
                  boxShadow: isSelected ? "0 8px 24px rgba(11,27,63,0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
                  position: "relative", transition: "all .15s",
                }}
              >
                {/* Badges */}
                {isCurrent && (
                  <div style={{ position: "absolute", top: -11, left: 16, background: C.teal, color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                    ✓ YOUR CURRENT PLAN
                  </div>
                )}
                {p.most_popular && !isCurrent && (
                  <div style={{ position: "absolute", top: -11, left: 16, background: C.gold, color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                    ✨ MOST POPULAR
                  </div>
                )}
                {isSelected && !isCurrent && (
                  <div style={{ position: "absolute", top: -11, right: 16, background: C.navy, color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                    ✓ SELECTED
                  </div>
                )}

                {/* Plan name & price */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: C.navy }}>{p.name}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: C.navy }}>
                      R{(p.monthly_fee_cents / 100).toFixed(0)}
                    </div>
                    <div style={{ fontSize: 11, color: C.grey500 }}>/month</div>
                  </div>
                </div>

                {p.description && (
                  <div style={{ fontSize: 12.5, color: C.grey500, marginBottom: 14, lineHeight: 1.5 }}>{p.description}</div>
                )}

                {/* CONSULTATION HIGHLIGHT — the most important thing */}
                <div style={{
                  background: isSelected ? "linear-gradient(135deg, #0B1B3F, #0c2557)" : "linear-gradient(135deg, #E7EEFB, #D0DEFF)",
                  borderRadius: 12, padding: "12px 14px", marginBottom: 14,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: isSelected ? "#E8B85A" : C.navy, lineHeight: 1 }}>
                    {p.consultations_pm === -1 ? "∞" : p.consultations_pm}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? "#fff" : C.navy }}>
                      {p.consultations_pm === -1 ? "Unlimited" : `${p.consultations_pm}`} Consultations
                    </div>
                    <div style={{ fontSize: 11, color: isSelected ? "#8DA0C2" : C.grey500 }}>
                      per member, per month
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { ok: true, text: `Up to ${p.max_members} member${p.max_members > 1 ? 's' : ''}`, icon: "👥" },
                    { ok: p.includes_medication, text: "Medication included", icon: "💊" },
                    { ok: p.includes_24h_access, text: "24/7 access", icon: "🕐" },
                    { ok: p.includes_chronic, text: "Chronic medication programme", icon: "📋" },
                  ].map(b => (
                    <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: b.ok ? C.navy : C.grey500 }}>
                      <span>{b.icon}</span>
                      {b.ok
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.grey500} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      }
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>

                {!isCurrent && (
                  <div style={{
                    marginTop: 14, padding: "10px", borderRadius: 10, textAlign: "center",
                    background: isSelected ? C.navy : C.offWhite,
                    color: isSelected ? "#fff" : C.grey500,
                    fontWeight: 700, fontSize: 13.5, transition: "all .15s",
                  }}>
                    {isSelected ? "✓ Selected — Click Apply below" : "Click to select this plan"}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Apply Panel */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: "sticky", bottom: 16,
              background: "linear-gradient(135deg, #0B1B3F, #0c2557)",
              borderRadius: 16, padding: "18px 22px",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              boxShadow: "0 8px 32px rgba(11,27,63,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ color: "#fff" }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Apply for: {selectedPlan.name}</div>
              <div style={{ color: "#8DA0C2", fontSize: 13, marginTop: 2 }}>
                R{(selectedPlan.monthly_fee_cents / 100).toFixed(0)}/mo · {selectedPlan.consultations_pm === -1 ? "Unlimited" : selectedPlan.consultations_pm} consults/mo
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                style={{
                  padding: "10px 22px", borderRadius: 10,
                  background: applying ? "rgba(201,150,58,0.6)" : "#E8B85A",
                  color: "#0B1B3F", border: "none",
                  fontWeight: 800, cursor: applying ? "not-allowed" : "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {applying ? "Submitting..." : (hasNoPlan ? "Apply for This Plan" : "Request Plan Change")}
                {!applying && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it works */}
      <Card sx={{ marginTop: 20, background: C.offWhite, border: "none" }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, marginBottom: 10 }}>ℹ️ How plan selection works</div>
        <ul style={{ margin: 0, paddingLeft: 18, color: C.grey700, fontSize: 13, lineHeight: 1.9 }}>
          <li>Select a plan and click <strong>Apply</strong> — your request is sent immediately.</li>
          <li>An admin will review and confirm your plan assignment (usually within 1–2 business days).</li>
          <li>Once confirmed, your <strong>consultation allowance</strong> activates based on the plan limit.</li>
          <li>Payments are handled directly with the clinic — the system reflects what the admin sets.</li>
          <li>If payment is not received, the admin may place your account on hold.</li>
        </ul>
      </Card>
    </div>
  );
}
