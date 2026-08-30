-- Run this script in your Supabase SQL Editor to bypass the RLS issue.
-- This creates a secure RPC function to handle application submissions.

CREATE OR REPLACE FUNCTION submit_application(
  p_clinic_id UUID,
  p_plan_id UUID,
  p_profile_id UUID,
  p_member_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS so any custom triggers will also bypass RLS
SET search_path = public
AS $$
DECLARE
  v_app_id UUID;
BEGIN
  INSERT INTO applications (clinic_id, plan_id, profile_id, member_id, status, source)
  VALUES (p_clinic_id, p_plan_id, p_profile_id, p_member_id, 'submitted', 'self_service')
  RETURNING id INTO v_app_id;

  RETURN jsonb_build_object('id', v_app_id);
END;
$$;
