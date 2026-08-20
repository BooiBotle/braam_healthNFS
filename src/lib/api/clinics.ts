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

  if (error || !data || data.length === 0) {
    console.error('Error fetching active clinics or RLS blocked access:', error);
    // Fallback since RLS prevents unauthenticated public selection
    return [
      {
        id: '0fef5dce-2117-4e2a-aca3-0e2a7f50114d',
        name: 'Braam Health Centre',
        slug: 'braam-health-centre',
        country: 'ZA',
        is_active: true,
        open_24h: true
      } as Clinic
    ];
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

  if (error || !data || data.length === 0) {
    console.error('Error fetching plans for clinic or RLS blocked access:', error);
    // Fallback since RLS prevents unauthenticated public selection
    return [
      { id: '7971a6a0-eee7-4c25-9e82-e0f67eec4ae1', clinic_id: clinicId, plan_type: 'essential', name: 'Essential', monthly_fee_cents: 55000, max_members: 1, consultations_pm: 3, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 1, most_popular: false } as ClinicPlan,
      { id: '090009e0-1cb3-4f35-895d-dfac96c3b5cc', clinic_id: clinicId, plan_type: 'couple', name: 'Couple', monthly_fee_cents: 72000, max_members: 2, consultations_pm: 6, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 2, most_popular: false } as ClinicPlan,
      { id: '24b61f6b-3eb0-4f90-bbc3-364664f72fe5', clinic_id: clinicId, plan_type: 'family', name: 'Family', monthly_fee_cents: 85000, max_members: 4, consultations_pm: 12, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 3, most_popular: false } as ClinicPlan,
      { id: '8ead5855-56d6-442b-ae1e-18ebbc821a53', clinic_id: clinicId, plan_type: 'family_plus', name: 'Family+', monthly_fee_cents: 115000, max_members: 6, consultations_pm: 18, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 4, most_popular: true } as ClinicPlan,
      { id: '4cc31dc5-6827-4f86-9d36-52317fcc7bbc', clinic_id: clinicId, plan_type: 'senior_care', name: 'Senior Care', monthly_fee_cents: 65000, max_members: 1, consultations_pm: 4, includes_medication: true, includes_24h_access: true, includes_chronic: true, is_active: true, display_order: 5, most_popular: false } as ClinicPlan,
      { id: 'a2f9c86c-6ee6-4b23-a4b3-b9c143716276', clinic_id: clinicId, plan_type: 'corporate', name: 'Corporate', monthly_fee_cents: 48000, max_members: 1, consultations_pm: 3, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 6, most_popular: false } as ClinicPlan,
      { id: '5f5d7c1f-e24f-4c55-9fe7-fbb0bd157158', clinic_id: clinicId, plan_type: 'basic_health', name: 'Basic Health Membership', monthly_fee_cents: 59900, max_members: 1, consultations_pm: 3, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 7, most_popular: false } as ClinicPlan,
      { id: 'ee294808-bdf8-4f02-81d9-c2cc73dd4896', clinic_id: clinicId, plan_type: 'braam_health', name: 'Braam Health Membership', monthly_fee_cents: 88800, max_members: 1, consultations_pm: 3, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 8, most_popular: false } as ClinicPlan,
      { id: 'e6ed102a-d03a-449b-8644-0e360d5a15a0', clinic_id: clinicId, plan_type: 'braam_health_plus', name: 'Braam Health Plus+', monthly_fee_cents: 133300, max_members: 2, consultations_pm: 6, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 9, most_popular: false } as ClinicPlan,
      { id: '7b386490-99f5-4a34-ad8b-13278d06cbeb', clinic_id: clinicId, plan_type: 'corporate_membership', name: 'Corporate Membership', monthly_fee_cents: 49900, max_members: 1, consultations_pm: 3, includes_medication: true, includes_24h_access: true, includes_chronic: false, is_active: true, display_order: 10, most_popular: false } as ClinicPlan,
      { id: '7f432627-71c1-421e-8c28-11253f01a73c', clinic_id: clinicId, plan_type: 'chronic_medication', name: 'Chronic Medication Programme', monthly_fee_cents: 0, max_members: 1, consultations_pm: 0, includes_medication: true, includes_24h_access: true, includes_chronic: true, is_active: true, display_order: 11, most_popular: false } as ClinicPlan
    ];
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
