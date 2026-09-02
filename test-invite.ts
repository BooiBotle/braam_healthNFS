import { supabaseAdmin } from './src/lib/supabaseAdmin';

supabaseAdmin.auth.admin.inviteUserByEmail('test@test.com', {
  data: {},
  redirectTo: 'http://localhost/update-password'
});
