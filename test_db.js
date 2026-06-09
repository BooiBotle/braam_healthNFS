import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: users, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test_admin@nfs.insure', // replace with a real admin email or just skip auth if we want to query
    password: 'test'
  });
  // We can't easily sign in because we don't know the password.
}
