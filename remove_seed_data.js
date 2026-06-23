import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function removeSeedData() {
  console.log("Removing seed data...");

  // 1. Delete Auth Users (cascades to profiles, members, etc.)
  const emailsToDelete = [
    'thabo.nkosi@gmail.com',
    'priya.moodley@gmail.com',
    'andile.dlamini@gmail.com',
    'zanele.khumalo@gmail.com',
    'corporate.admin@sunrisesecurity.co.za',
    'dummy_member@nfs.insure',
    'john.doe@example.com'
  ];

  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error("Failed to fetch users:", usersErr);
  } else {
    for (const u of usersData.users) {
      if (emailsToDelete.includes(u.email)) {
        console.log(`Deleting auth.user: ${u.email}`);
        await supabase.auth.admin.deleteUser(u.id);
      }
    }
  }

  // 2. Delete Agreement Templates
  console.log("Deleting seeded agreement templates...");
  await supabase.from('agreement_templates').delete().in('version', ['2025-v1-seed', '2025-v2-seed']);

  // 3. Delete Medications
  console.log("Deleting seeded medications...");
  await supabase.from('medications').delete().in('name', [
    'Amoxicillin 500mg Capsules',
    'Metformin 500mg Tablets',
    'Atenolol 50mg Tablets',
    'Ibuprofen 400mg Tablets',
    'Omeprazole 20mg Capsules',
    'Salbutamol Inhaler 100mcg',
    'Amlodipine 5mg Tablets',
    'Simvastatin 20mg Tablets'
  ]);

  // 4. Delete System Settings
  console.log("Deleting seeded system settings...");
  await supabase.from('system_settings').delete().in('key', [
    'clinic_name', 'clinic_email', 'clinic_phone', 'clinic_whatsapp',
    'debit_collection_day', 'kyc_review_sla_hours', 'max_dependants_per_member',
    'consultation_limit_alert_threshold', 'card_expiry_years',
    'popia_consent_version', 'agreement_template_version',
    'sms_otp_expiry_minutes', 'step_up_max_attempts',
    'welcome_email_enabled', 'portal_maintenance_mode',
    'support_email', 'support_phone'
  ]);

  // 5. Delete JS seed specific hardcoded records (if they didn't cascade)
  console.log("Deleting leftover JS seed records...");
  await supabase.from('consultations').delete().eq('id', '44444444-4444-4444-4444-444444444444');
  await supabase.from('appointments').delete().eq('id', '33333333-3333-3333-3333-333333333333');
  await supabase.from('members').delete().eq('id', '22222222-2222-2222-2222-222222222222');
  await supabase.from('applications').delete().eq('id', '11111111-1111-1111-1111-111111111111');
  await supabase.from('applications').delete().eq('applicant_email', 'john.doe@example.com'); // just in case

  console.log("Seed data removal complete.");
}

removeSeedData().catch(console.error);
