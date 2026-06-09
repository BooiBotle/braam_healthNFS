-- RUN THIS IN SUPABASE SQL EDITOR TO BYPASS THE BUGGY TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We are intentionally doing nothing here so that the trigger stops crashing
  -- the Supabase Auth server. Our seed script will handle profile creation manually.
  RETURN NEW;
END;
$$;
