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
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedUsers() {
  console.log("Seeding users via Supabase Admin API...");

  const usersToCreate = [
    { email: 'admin@nfs.insure', password: 'TestAdmin123!', role: 'admin', firstName: 'System', lastName: 'Admin' },
    { email: 'staff@nfs.insure', password: 'TestStaff123!', role: 'staff', firstName: 'Clinic', lastName: 'Staff' }
  ];

  // 1. Get Clinic ID
  const { data: clinics, error: clinicErr } = await supabase.from('clinics').select('id').eq('name', 'Braam Health Centre').limit(1);
  if (clinicErr || !clinics || clinics.length === 0) {
    console.error("Error finding clinic:", clinicErr);
    return;
  }
  const clinicId = clinics[0].id;

  for (const u of usersToCreate) {
    console.log(`Processing ${u.email}...`);
    
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(x => x.email === u.email);

    if (existing) {
      console.log(`Deleting old user ${u.email}...`);
      await supabase.auth.admin.deleteUser(existing.id);
    }

    // Create user via Admin API
    console.log(`Creating user ${u.email}...`);
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        first_name: u.firstName,
        last_name: u.lastName,
        portal_role: u.role
      }
    });

    if (createErr) {
      console.error(`Failed to create ${u.email}:`, createErr.message);
      continue;
    }

    // Upsert the profile manually to bypass any trigger issues
    console.log(`Upserting profile for ${u.email}...`);
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: newUser.user.id,
      email: u.email,
      first_name: u.firstName,
      last_name: u.lastName,
      portal_role: u.role,
      clinic_id: clinicId
    });

    if (profileErr) {
      console.error(`Failed to create profile for ${u.email}:`, profileErr.message);
    } else {
      console.log(`Successfully seeded ${u.email}!\n`);
    }
  }

  console.log("Done seeding users. You can now login!");
}

seedUsers();
