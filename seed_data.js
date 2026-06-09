import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedData() {
  console.log("Seeding mock data for Staff Portal...");

  // 1. Get Clinic ID
  const { data: clinics } = await supabase.from('clinics').select('id').eq('name', 'Braam Health Centre').limit(1);
  if (!clinics || clinics.length === 0) return console.error("No clinic found");
  const clinicId = clinics[0].id;

  // 2. Get Plan ID (Family)
  const { data: plans } = await supabase.from('plans').select('id').eq('plan_type', 'family').limit(1);
  const planId = plans?.[0]?.id;

  // 3. Create a mock application
  const { data: appData, error: appErr } = await supabase.from('applications').upsert({
    id: '11111111-1111-1111-1111-111111111111',
    clinic_id: clinicId,
    plan_id: planId,
    first_name: 'John',
    last_name: 'Doe',
    phone: '0825550001',
    email: 'john.doe@example.com',
    status: 'submitted'
  });
  console.log("Mock Application Seeded:", appErr ? appErr.message : 'OK');

  // 4. Create a mock member
  // Note: We need a profile ID for the member, but we can bypass it by creating a dummy profile first
  const { data: profileData, error: profErr } = await supabase.auth.admin.createUser({
    email: 'dummy_member@nfs.insure',
    password: 'TestMember123!',
    email_confirm: true,
    user_metadata: { first_name: 'Jane', last_name: 'Smith', portal_role: 'member', phone: '0825550002' }
  });

  let memberProfileId = null;
  if (profileData?.user) {
    memberProfileId = profileData.user.id;
    // ensure profile exists manually due to bypassed trigger
    await supabase.from('profiles').upsert({
      id: memberProfileId,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'dummy_member@nfs.insure',
      phone: '0825550002',
      sa_id_number: '9001015000088',
      portal_role: 'member'
    });
  } else {
    // If user already exists, just get the ID
    const { data: users } = await supabase.auth.admin.listUsers();
    memberProfileId = users?.users?.find(u => u.email === 'dummy_member@nfs.insure')?.id;
  }

  if (memberProfileId) {
    const { data: memberData, error: memErr } = await supabase.from('members').upsert({
      id: '22222222-2222-2222-2222-222222222222',
      profile_id: memberProfileId,
      clinic_id: clinicId,
      plan_id: planId,
      card_number: 'NFS8901234567',
      status: 'active'
    });
    console.log("Mock Member Seeded:", memErr ? memErr.message : 'OK');

    // 5. Create a mock appointment for today
    const today = new Date().toISOString().split('T')[0];
    const { error: aptErr } = await supabase.from('appointments').upsert({
      id: '33333333-3333-3333-3333-333333333333',
      member_id: '22222222-2222-2222-2222-222222222222',
      clinic_id: clinicId,
      appointment_date: today,
      appointment_time: '14:30:00',
      reason: 'General Checkup',
      status: 'pending'
    });
    console.log("Mock Appointment Seeded:", aptErr ? aptErr.message : 'OK');

    // 6. Create a mock consultation for today
    const { error: conErr } = await supabase.from('consultations').upsert({
      id: '44444444-4444-4444-4444-444444444444',
      member_id: '22222222-2222-2222-2222-222222222222',
      clinic_id: clinicId,
      consultation_date: today + 'T10:00:00Z',
      consultation_type: 'walk_in',
      status: 'completed',
      clinical_notes: 'Patient complained of headache. Prescribed paracetamol.'
    });
    console.log("Mock Consultation Seeded:", conErr ? conErr.message : 'OK');
  }

  console.log("Mock data seeding complete!");
}

seedData();
