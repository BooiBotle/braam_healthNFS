-- =============================================================================
-- PRODUCTION-READY USER TRIGGER
-- =============================================================================
-- This trigger safely parses the metadata provided during signup and inserts
-- it into the profiles table. It includes an EXCEPTION block so that if ANY
-- part of the metadata is malformed, it defaults to a safe 'member' profile
-- instead of crashing the GoTrue Auth server.

-- Drop the old function and trigger completely to clean up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_first_name text;
  v_last_name text;
  v_phone text;
  v_role public.portal_role;
BEGIN
  -- 1. Safely extract values. If they don't exist, they become NULL.
  v_first_name := nullif(new.raw_user_meta_data->>'first_name', '');
  v_last_name  := nullif(new.raw_user_meta_data->>'last_name', '');
  v_phone      := nullif(new.raw_user_meta_data->>'phone', '');
  
  -- 2. Safely cast the portal_role. If the user didn't pass one, or passed
  -- an invalid string, the EXCEPTION block catches it and defaults to 'member'.
  BEGIN
    v_role := coalesce((new.raw_user_meta_data->>'portal_role')::public.portal_role, 'member'::public.portal_role);
  EXCEPTION WHEN OTHERS THEN
    v_role := 'member'::public.portal_role;
  END;

  -- 3. Insert the profile. We use ON CONFLICT DO NOTHING just in case
  -- the profile was somehow manually created via a backend script before this fires.
  BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, phone, portal_role)
    VALUES (new.id, new.email, v_first_name, v_last_name, v_phone, v_role)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- If the insert STILL fails (e.g., due to a bizarre constraint), 
    -- we do nothing so the user account is still created successfully in Auth.
  END;
  
  RETURN NEW;
END;
$$;

-- Create the trigger again
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
