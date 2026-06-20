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
  consultation_date: string;
  consultation_type: string;
  status: string;
  clinical_notes?: string;
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

// API Functions

export async function getMemberDetails(userId: string) {
  // First get profile, then member
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
    .order('consultation_date', { ascending: false });
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
    .order('monthly_fee', { ascending: true });
  if (error) console.error("Error fetching plans:", error);
  return data || [];
}
