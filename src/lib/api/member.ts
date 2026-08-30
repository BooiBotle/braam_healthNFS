import { supabase } from '../supabase';

// Types
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sa_id_number?: string;
  clinic_id?: string;
  portal_role?: string;
}

export interface ClinicDetails {
  id: string;
  name: string;
  slug: string;
  address_line1?: string;
  address_line2?: string;
  suburb?: string;
  city?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  doctor_name?: string;
  specialty?: string;
  open_24h: boolean;
  logo_url?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  branch_code?: string;
  account_type?: string;
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
  clinic?: ClinicDetails;
  profiles?: any;
  consultations_used_this_month?: number;
  payment_method?: 'debit_order' | 'eft';
  debit_mandate_signed?: boolean;
  banking_details?: any;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthly_fee_cents?: number;
  monthly_fee?: number;
  consultations_pm: number;
  includes_medication: boolean;
  includes_24h_access: boolean;
  includes_chronic: boolean;
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
  visited_at?: string;
  consultation_date?: string;
  consultation_type: string;
  status?: string;
  clinical_notes?: string;
  doctor_name?: string;
}

export interface DebitOrder {
  id: string;
  collection_date: string;
  amount_cents: number;
  status: string;
}

export interface Payment {
  id: string;
  date?: string;
  created_at?: string;
  amount_cents: number;
  status: string;
  method: string;
  reference?: string;
  description?: string;
}

export interface Dependant {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  date_of_birth: string;
}

// API Functions

export async function getMemberDetails(userId: string): Promise<Member | null> {
  const { data: member, error } = await supabase
    .from('members')
    .select(`*, plan:plans(*), clinic:clinics(*)`)
    .eq('profile_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching member:", error);
  }

  if (member) {
    // Calculate consultations used in the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: consultations } = await supabase
      .from('consultations')
      .select('id')
      .eq('member_id', member.id)
      .gte('visited_at', startOfMonth.toISOString());

    member.consultations_used_this_month = consultations?.length || 0;
  }

  return member;
}

export async function getMemberByCardNumber(cardNumber: string): Promise<any | null> {
  // Try multiple patterns: exact, uppercase, trimmed
  const cleaned = cardNumber.trim().toUpperCase();
  
  const { data: member, error } = await supabase
    .from('members')
    .select(`
      *,
      plan:plans(*),
      clinic:clinics(*),
      profiles!inner(full_name, first_name, last_name, sa_id_number, phone, email, avatar_url, date_of_birth, gender)
    `)
    .eq('card_number', cleaned)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching member by card:", error);
    return null;
  }

  if (member) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: usedThisMonth } = await supabase
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', member.id)
      .gte('visited_at', startOfMonth.toISOString());

    const { count: totalConsultations } = await supabase
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', member.id);

    const { data: recentConsultations } = await supabase
      .from('consultations')
      .select('*')
      .eq('member_id', member.id)
      .order('visited_at', { ascending: false })
      .limit(5);

    member.consultations_used_this_month = usedThisMonth || 0;
    member.total_consultations = totalConsultations || 0;
    member.recent_consultations = recentConsultations || [];
  }

  return member;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, clinic:clinics(*)')
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

export async function submitConsultationNote(consultId: string, note: string) {
  return await supabase
    .from('consultations')
    .update({ clinical_notes: note })
    .eq('id', consultId);
}

export async function requestStatement(memberId: string) {
  const { error } = await supabase
    .from('statement_requests')
    .insert([{
      member_id: memberId,
      status: 'pending'
    }]);
  if (error) throw error;
}

export async function getConsultations(memberId: string) {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('member_id', memberId)
    .order('visited_at', { ascending: false });
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
    .order('created_at', { ascending: false });
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
