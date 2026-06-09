CREATE OR REPLACE FUNCTION public.add_portal_role_to_jwt(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
BEGIN
  -- Extract the role from the profiles table for the given user_id
  SELECT portal_role::text INTO v_role 
  FROM public.profiles 
  WHERE id = (event->>'user_id')::uuid;
  
  -- If no profile is found, default to 'member'
  IF v_role IS NULL THEN
    v_role := 'member';
  END IF;

  -- Add the role to the JWT claims
  RETURN jsonb_set(event, '{claims,portal_role}', to_jsonb(v_role));
END;
$$;

-- Ensure Supabase Auth can execute this hook
GRANT EXECUTE ON FUNCTION public.add_portal_role_to_jwt(jsonb) TO supabase_auth_admin;
