import { supabase } from '../supabase';

// Types
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sa_id_number?: string;
}

export interface Member {
  id: string;
  profile_id: string;
  clinic_id: string;
  plan_id: string;
  card_number: string;
  status: string;
  created_at: string;
  plan?: Plan;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthly_fee: number;
  monthly_fee_cents?: number;
  consultations_pm?: number;
}

export interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: string;
  doctor_name?: string;
  clinical_notes?: string;
}

export interface Consultation {
  id: string;
  consultation_date?: string;
  visited_at?: string;
  consultation_type: string;
  status?: string;
  clinical_notes?: string;
  diagnosis?: string;
  is_flagged?: boolean;
  flagged_reason?: string;
}

export interface DebitOrder {
  id: string;
  collection_date: string;
  amount_cents: number;
  status: string;
}

export interface Payment {
  id: string;
  date: string;
  amount_cents: number;
  status: string;
  method: string;
}

export interface Dependant {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  date_of_birth: string;
}

export interface TokenBalance {
  primary_member_id: string;
  member_name: string;
  plan_name: string;
  monthly_tokens: number;
  tokens_used: number;
  tokens_remaining: number;
  is_eligible: boolean;
  active_dependants_count: number;
}

export interface TokenAudit {
  id: string;
  clinic_id: string;
  member_id: string;
  dependant_id?: string;
  consultation_id: string;
  tokens_deducted: number;
  previous_balance: number;
  new_balance: number;
  recorded_by?: string;
  is_override: boolean;
  override_reason?: string;
  override_by?: string;
  created_at: string;
  profiles?: { full_name: string };
  override_profiles?: { full_name: string };
}

// API Functions

export async function getMemberDetails(userId: string) {
  const { data: member, error } = await supabase
    .from('members')
    .select(`*, plan:plans(*)`)
    .eq('profile_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching member:", error);
  }
  return member;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) console.error("Error fetching profile:", error);
  return data;
}

export async function getAppointments(memberId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('member_id', memberId)
    .order('appointment_date', { ascending: false });
  if (error) console.error("Error fetching appointments:", error);
  return data || [];
}

export async function getConsultations(memberId: string) {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });
  if (error) console.error("Error fetching consultations:", error);
  return data || [];
}

export async function getDebitOrders(memberId: string) {
  const { data, error } = await supabase
    .from('debit_orders')
    .select('*')
    .eq('member_id', memberId)
    .order('collection_date', { ascending: false });
  if (error) console.error("Error fetching debit orders:", error);
  return data || [];
}

export async function getPayments(memberId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', memberId)
    .order('date', { ascending: false });
  if (error) console.error("Error fetching payments:", error);
  return data || [];
}

export async function getDependants(memberId: string) {
  const { data, error } = await supabase
    .from('dependants')
    .select('*')
    .eq('member_id', memberId);
  if (error) console.error("Error fetching dependants:", error);
  return data || [];
}

export async function getPlans() {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('monthly_fee_cents', { ascending: true });
  if (error) console.error("Error fetching plans:", error);
  return data || [];
}

/**
 * Fetch dynamic Token Balance for a member or dependant (shared pool)
 */
export async function getTokenBalance(memberOrDependantId: string): Promise<TokenBalance | null> {
  try {
    // Try RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_member_token_balance', {
      p_member_or_dependant_id: memberOrDependantId
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      return rpcData[0];
    }
  } catch (e) {
    console.warn("RPC get_member_token_balance not available, running fallback query:", e);
  }

  // Fallback calculation via direct Supabase queries
  try {
    let primaryMemberId = memberOrDependantId;
    let memberName = '';
    let planName = 'Basic Health Membership';
    let monthlyTokens = 3;

    // Check if primary member
    const { data: mem } = await supabase
      .from('members')
      .select('id, profiles(full_name), plans(name, consultations_pm)')
      .eq('id', memberOrDependantId)
      .maybeSingle();

    if (mem) {
      primaryMemberId = mem.id;
      memberName = mem.profiles?.full_name || 'Member';
      planName = mem.plans?.name || planName;
      monthlyTokens = mem.plans?.consultations_pm ?? 3;
    } else {
      // Check dependant
      const { data: dep } = await supabase
        .from('dependants')
        .select('id, first_name, last_name, member_id, members(profiles(full_name), plans(name, consultations_pm))')
        .eq('id', memberOrDependantId)
        .maybeSingle();

      if (dep && dep.members) {
        primaryMemberId = dep.member_id;
        memberName = `${dep.first_name} ${dep.last_name}`;
        planName = dep.members.plans?.name || planName;
        monthlyTokens = dep.members.plans?.consultations_pm ?? 3;
      }
    }

    if (!primaryMemberId) return null;

    // Get active dependants count
    const { count: depCount } = await supabase
      .from('dependants')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', primaryMemberId)
      .eq('status', 'active');

    // Get start of current month ISO string
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Query consultations for primary member + dependants
    const { count: tokensUsed } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', primaryMemberId)
      .gte('created_at', startOfMonth);

    const used = tokensUsed || 0;
    const remaining = monthlyTokens === -1 ? 999 : Math.max(0, monthlyTokens - used);

    return {
      primary_member_id: primaryMemberId,
      member_name: memberName,
      plan_name: planName,
      monthly_tokens: monthlyTokens,
      tokens_used: used,
      tokens_remaining: remaining,
      is_eligible: monthlyTokens === -1 || remaining > 0,
      active_dependants_count: depCount || 0
    };
  } catch (err) {
    console.error("Error in fallback getTokenBalance:", err);
    return null;
  }
}

/**
 * Record a completed consultation with token deduction & optional manager override
 */
export async function recordConsultationWithToken(params: {
  clinicId: string;
  memberId: string;
  dependantId?: string;
  appointmentId?: string;
  consultationType?: string;
  presentingComplaint?: string;
  clinicalNotes?: string;
  diagnosis?: string;
  treatmentGiven?: string;
  seenBy?: string;
  doctorName?: string;
  isOverride?: boolean;
  overrideReason?: string;
  overrideBy?: string;
}) {
  // Try RPC first
  try {
    const { data, error } = await supabase.rpc('record_consultation_with_token', {
      p_clinic_id: params.clinicId,
      p_member_id: params.memberId,
      p_dependant_id: params.dependantId || null,
      p_appointment_id: params.appointmentId || null,
      p_consultation_type: params.consultationType || 'walk_in',
      p_presenting_complaint: params.presentingComplaint || null,
      p_clinical_notes: params.clinicalNotes || null,
      p_diagnosis: params.diagnosis || null,
      p_treatment_given: params.treatmentGiven || null,
      p_seen_by: params.seenBy || null,
      p_doctor_name: params.doctorName || null,
      p_is_override: !!params.isOverride,
      p_override_reason: params.overrideReason || null,
      p_override_by: params.overrideBy || null
    });

    if (!error && data && data.length > 0) {
      return { success: true, data: data[0] };
    }
  } catch (e) {
    console.warn("RPC record_consultation_with_token failed, using fallback insert:", e);
  }

  // Fallback direct execution
  try {
    const balance = await getTokenBalance(params.memberId);
    if (!balance) throw new Error("Member not found");

    if (balance.monthly_tokens !== -1 && balance.tokens_remaining <= 0 && !params.isOverride) {
      throw new Error("NO TOKENS REMAINING. This member has exhausted their consultation limit for the month. Manager override required.");
    }

    const isFlagged = balance.monthly_tokens !== -1 && balance.tokens_remaining <= 0 && params.isOverride;
    const flaggedReason = isFlagged ? `Manager Override: 0 Tokens Remaining - ${params.overrideReason || 'No reason specified'}` : undefined;

    // Get card number
    const { data: memData } = await supabase
      .from('members')
      .select('card_number')
      .eq('id', balance.primary_member_id)
      .maybeSingle();

    const newConsultationPayload: any = {
      clinic_id: params.clinicId,
      member_id: balance.primary_member_id,
      dependant_id: params.dependantId || null,
      appointment_id: params.appointmentId || null,
      card_number: memData?.card_number || 'NFS8 0000 0000 0',
      consultation_type: params.consultationType || 'walk_in',
      presenting_complaint: params.presentingComplaint || null,
      clinical_notes: params.clinicalNotes || null,
      diagnosis: params.diagnosis || null,
      treatment_given: params.treatmentGiven || null,
      seen_by: params.seenBy || null,
      doctor_name: params.doctorName || null,
      is_flagged: isFlagged,
      flagged_reason: flaggedReason,
      flagged_by: isFlagged ? (params.overrideBy || params.seenBy || null) : null,
      flagged_at: isFlagged ? new Date().toISOString() : null,
      counted_toward_limit: true,
      created_at: new Date().toISOString()
    };

    const { data: consultData, error: consultErr } = await supabase
      .from('consultations')
      .insert(newConsultationPayload)
      .select()
      .single();

    if (consultErr) throw consultErr;

    // If appointment ID present, mark appointment completed
    if (params.appointmentId) {
      await supabase
        .from('appointments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', params.appointmentId);
    }

    // Insert audit log
    const prevBal = balance.tokens_remaining;
    const newBal = isFlagged ? 0 : Math.max(0, prevBal - 1);

    await supabase.from('consultation_token_audits').insert({
      clinic_id: params.clinicId,
      member_id: balance.primary_member_id,
      dependant_id: params.dependantId || null,
      consultation_id: consultData.id,
      tokens_deducted: 1,
      previous_balance: prevBal,
      new_balance: newBal,
      recorded_by: params.seenBy || null,
      is_override: !!params.isOverride,
      override_reason: params.overrideReason || null,
      override_by: params.overrideBy || null
    });

    return { success: true, data: consultData };
  } catch (err: any) {
    console.error("Error recording consultation with token:", err);
    return { success: false, error: err.message || 'Failed to record consultation' };
  }
}

/**
 * Fetch token audits for a member
 */
export async function getTokenAudits(memberId: string): Promise<TokenAudit[]> {
  try {
    const { data, error } = await supabase
      .from('consultation_token_audits')
      .select('*, profiles:recorded_by(full_name), override_profiles:override_by(full_name)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching token audits:", err);
    return [];
  }
}
