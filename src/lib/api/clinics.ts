import { supabase } from '../supabase';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  address_line1?: string;
  address_line2?: string;
  suburb?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  doctor_name?: string;
  specialty?: string;
  open_24h: boolean;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClinicPlan {
  id: string;
  clinic_id: string;
  plan_type: string;
  name: string;
  description?: string;
  monthly_fee_cents: number;
  max_members: number;
  consultations_pm: number;
  includes_medication: boolean;
  includes_24h_access: boolean;
  includes_chronic: boolean;
  min_employees?: number;
  age_min?: number;
  is_active: boolean;
  is_coming_soon: boolean;
  display_order: number;
  most_popular: boolean;
}

// Get all active clinics for public & onboarding selection
export async function getActiveClinics(): Promise<Clinic[]> {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching active clinics:', error);
    return [];
  }
  return data || [];
}

// Get all clinics (for Super Admin management)
export async function getAllClinics(): Promise<Clinic[]> {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all clinics:', error);
    return [];
  }
  return data || [];
}

// Get clinic by ID
export async function getClinicById(clinicId: string): Promise<Clinic | null> {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching clinic by ID:', error);
  }
  return data;
}

// Create new clinic
export async function createClinic(clinicData: Partial<Clinic>): Promise<{ data: Clinic | null; error: any }> {
  const slug = clinicData.slug || clinicData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase
    .from('clinics')
    .insert([{ ...clinicData, slug }])
    .select()
    .single();

  return { data, error };
}

// Update clinic details
export async function updateClinic(clinicId: string, clinicData: Partial<Clinic>): Promise<{ error: any }> {
  const { error } = await supabase
    .from('clinics')
    .update({ ...clinicData, updated_at: new Date().toISOString() })
    .eq('id', clinicId);

  return { error };
}

// Fetch plans for a specific clinic
export async function getPlansForClinic(clinicId: string): Promise<ClinicPlan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching plans for clinic:', error);
    return [];
  }
  return data || [];
}

export const getClinicPlans = getPlansForClinic;
export type Plan = ClinicPlan;

// Save or update plan for a clinic
export async function saveClinicPlan(planData: Partial<ClinicPlan>): Promise<{ data: ClinicPlan | null; error: any }> {
  if (planData.id) {
    const { data, error } = await supabase
      .from('plans')
      .update({ ...planData, updated_at: new Date().toISOString() })
      .eq('id', planData.id)
      .select()
      .single();
    return { data, error };
  } else {
    const { data, error } = await supabase
      .from('plans')
      .insert([planData])
      .select()
      .single();
    return { data, error };
  }
}
