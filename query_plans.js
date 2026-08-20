import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: clinics } = await supabase.from('clinics').select('id, name');
  console.log("Clinics:", clinics);
  const { data: plans } = await supabase.from('plans').select('*');
  console.log("Plans length:", plans?.length);
  console.log("First plan:", plans?.[0]);
}
main();
