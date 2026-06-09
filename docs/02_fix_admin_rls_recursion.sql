-- =============================================================================
-- NFS INSURE | BRAAM HEALTH CENTRE
-- FIX: Admin RLS Recursion & Profile Visibility
-- Run this in your Supabase SQL Editor to fix the login redirect issue
-- =============================================================================

-- 1. Create a secure function to check admin status without triggering infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to safely check the user's role
SET search_path = public
AS $$
DECLARE
  is_admin_flag BOOLEAN;
BEGIN
  SELECT portal_role IN ('admin', 'super_admin') INTO is_admin_flag
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_admin_flag, false);
END;
$$;

-- 2. CRITICAL: Ensure users can ALWAYS read their own profile (Fixes the login bug)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING ( auth.uid() = id );

-- 3. Replace the recursive admin policy on profiles with the secure function
DROP POLICY IF EXISTS "Admin Full Access on Profiles" ON profiles;
CREATE POLICY "Admin Full Access on Profiles"
ON profiles FOR ALL
USING ( public.is_admin() )
WITH CHECK ( public.is_admin() );

-- 4. Replace other admin policies to use the fast, non-recursive function
DROP POLICY IF EXISTS "Admin Full Access on Members" ON members;
CREATE POLICY "Admin Full Access on Members" ON members FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access on Applications" ON applications;
CREATE POLICY "Admin Full Access on Applications" ON applications FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access on Consultations" ON consultations;
CREATE POLICY "Admin Full Access on Consultations" ON consultations FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access on Appointments" ON appointments;
CREATE POLICY "Admin Full Access on Appointments" ON appointments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access on Meds" ON medication_dispenses;
CREATE POLICY "Admin Full Access on Meds" ON medication_dispenses FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access on Debits" ON debit_orders;
CREATE POLICY "Admin Full Access on Debits" ON debit_orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access on Plan Changes" ON plan_changes;
CREATE POLICY "Admin Full Access on Plan Changes" ON plan_changes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access on Dependants" ON dependants;
CREATE POLICY "Admin Full Access on Dependants" ON dependants FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access on KYC" ON kyc_documents;
CREATE POLICY "Admin Full Access on KYC" ON kyc_documents FOR ALL USING (public.is_admin());
