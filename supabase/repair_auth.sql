-- 1. Ensure the trigger is correct and handles empty metadata safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_first_name text;
  v_last_name text;
  v_phone text;
  v_role portal_role;
BEGIN
  -- Safely extract values, defaulting to null if missing
  v_first_name := nullif(new.raw_user_meta_data->>'first_name', '');
  v_last_name  := nullif(new.raw_user_meta_data->>'last_name', '');
  v_phone      := nullif(new.raw_user_meta_data->>'phone', '');
  
  -- Safely extract and cast the role
  BEGIN
    v_role := coalesce(nullif(new.raw_user_meta_data->>'portal_role', '')::portal_role, 'member'::portal_role);
  EXCEPTION WHEN OTHERS THEN
    v_role := 'member'::portal_role;
  END;

  INSERT INTO public.profiles (id, email, first_name, last_name, phone, portal_role)
  VALUES (new.id, new.email, v_first_name, v_last_name, v_phone, v_role)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 2. Ensure permissions are perfectly intact for Supabase Auth to connect
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
