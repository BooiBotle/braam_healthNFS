import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  const { data: clinics, error: cErr } = await supabase.from('clinics').select('*');
  console.log('Clinics:', clinics, 'Err:', cErr);
}
test();
