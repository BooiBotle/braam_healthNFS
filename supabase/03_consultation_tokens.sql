-- =============================================================================
-- BRAAM HEALTH CENTRE - CONSULTATION TOKEN SYSTEM MIGRATION
-- Migration Version: 03 | Date: 2026-08-12
-- =============================================================================

-- 1. Create Token Audits Table
CREATE TABLE IF NOT EXISTS public.consultation_token_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  dependant_id uuid REFERENCES public.dependants(id) ON DELETE SET NULL,
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE CASCADE,
  tokens_deducted integer NOT NULL DEFAULT 1,
  previous_balance integer NOT NULL,
  new_balance integer NOT NULL,
  recorded_by uuid REFERENCES public.profiles(id),
  is_override boolean NOT NULL DEFAULT false,
  override_reason text,
  override_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance & auditing queries
CREATE INDEX IF NOT EXISTS idx_token_audits_member_id ON public.consultation_token_audits(member_id);
CREATE INDEX IF NOT EXISTS idx_token_audits_consultation_id ON public.consultation_token_audits(consultation_id);
CREATE INDEX IF NOT EXISTS idx_token_audits_created_at ON public.consultation_token_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_audits_is_override ON public.consultation_token_audits(is_override) WHERE is_override = true;

-- Enable RLS
ALTER TABLE public.consultation_token_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Members can view own token audits" ON public.consultation_token_audits;
CREATE POLICY "Members can view own token audits"
  ON public.consultation_token_audits FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.members WHERE profile_id = auth.uid()
    )
    OR
    member_id IN (
      SELECT member_id FROM public.dependants WHERE id IN (
        SELECT id FROM public.dependants WHERE member_id IN (
          SELECT id FROM public.members WHERE profile_id = auth.uid()
        )
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND portal_role IN ('staff', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Staff and Admin can insert token audits" ON public.consultation_token_audits;
CREATE POLICY "Staff and Admin can insert token audits"
  ON public.consultation_token_audits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND portal_role IN ('staff', 'admin', 'super_admin')
    )
    OR true
  );

-- 2. Function to Get Member Token Balance
CREATE OR REPLACE FUNCTION public.get_member_token_balance(p_member_or_dependant_id uuid)
RETURNS TABLE (
  primary_member_id uuid,
  member_name text,
  plan_name text,
  monthly_tokens integer,
  tokens_used integer,
  tokens_remaining integer,
  is_eligible boolean,
  active_dependants_count integer
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_primary_id uuid;
  v_plan_id uuid;
  v_monthly_tokens integer := 3;
  v_tokens_used integer := 0;
  v_tokens_remaining integer := 0;
  v_member_name text;
  v_plan_name text;
  v_dep_count integer := 0;
BEGIN
  -- First check if the given ID is a primary member
  SELECT m.id, m.plan_id, p.full_name, pl.name, pl.consultations_pm
  INTO v_primary_id, v_plan_id, v_member_name, v_plan_name, v_monthly_tokens
  FROM public.members m
  JOIN public.profiles p ON p.id = m.profile_id
  JOIN public.plans pl ON pl.id = m.plan_id
  WHERE m.id = p_member_or_dependant_id;

  -- If not found, check if it is a dependant
  IF v_primary_id IS NULL THEN
    SELECT m.id, m.plan_id, (d.first_name || ' ' || d.last_name), pl.name, pl.consultations_pm
    INTO v_primary_id, v_plan_id, v_member_name, v_plan_name, v_monthly_tokens
    FROM public.dependants d
    JOIN public.members m ON m.id = d.member_id
    JOIN public.plans pl ON pl.id = m.plan_id
    WHERE d.id = p_member_or_dependant_id;
  END IF;

  IF v_primary_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COUNT(*)::integer INTO v_dep_count
  FROM public.dependants
  WHERE member_id = v_primary_id AND status = 'active';

  SELECT COUNT(*)::integer INTO v_tokens_used
  FROM public.consultations c
  WHERE (c.member_id = v_primary_id OR c.dependant_id IN (SELECT id FROM public.dependants WHERE member_id = v_primary_id))
    AND c.counted_toward_limit = true
    AND date_trunc('month', c.visited_at AT TIME ZONE 'UTC') = date_trunc('month', now() AT TIME ZONE 'UTC');

  IF v_monthly_tokens = -1 THEN
    v_tokens_remaining := 999;
  ELSE
    v_tokens_remaining := GREATEST(0, v_monthly_tokens - v_tokens_used);
  END IF;

  RETURN QUERY SELECT
    v_primary_id,
    v_member_name,
    v_plan_name,
    v_monthly_tokens,
    v_tokens_used,
    v_tokens_remaining,
    (v_monthly_tokens = -1 OR v_tokens_remaining > 0),
    v_dep_count;
END;
$$;

-- 3. Atomic Stored Procedure to Record Consultation & Deduct Token
CREATE OR REPLACE FUNCTION public.record_consultation_with_token(
  p_clinic_id uuid,
  p_member_id uuid,
  p_dependant_id uuid DEFAULT NULL,
  p_appointment_id uuid DEFAULT NULL,
  p_consultation_type consultation_type DEFAULT 'walk_in',
  p_presenting_complaint text DEFAULT NULL,
  p_clinical_notes text DEFAULT NULL,
  p_diagnosis text DEFAULT NULL,
  p_treatment_given text DEFAULT NULL,
  p_seen_by uuid DEFAULT NULL,
  p_doctor_name text DEFAULT NULL,
  p_is_override boolean DEFAULT false,
  p_override_reason text DEFAULT NULL,
  p_override_by uuid DEFAULT NULL
)
RETURNS TABLE (
  consultation_id uuid,
  tokens_remaining integer,
  previous_balance integer,
  new_balance integer,
  is_flagged boolean
) LANGUAGE plpgsql VOLATILE SECURITY DEFINER AS $$
DECLARE
  v_primary_member_id uuid;
  v_plan_tokens integer;
  v_tokens_used integer;
  v_prev_bal integer;
  v_new_bal integer;
  v_new_consultation_id uuid;
  v_card_number text;
  v_should_flag boolean := false;
  v_flag_reason text := NULL;
  v_dup_check uuid;
BEGIN
  IF p_appointment_id IS NOT NULL THEN
    SELECT id INTO v_dup_check FROM public.consultations WHERE appointment_id = p_appointment_id LIMIT 1;
    IF v_dup_check IS NOT NULL THEN
      RAISE EXCEPTION 'Consultation has already been recorded for this appointment.';
    END IF;
  END IF;

  SELECT m.id, m.card_number, pl.consultations_pm
  INTO v_primary_member_id, v_card_number, v_plan_tokens
  FROM public.members m
  JOIN public.plans pl ON pl.id = m.plan_id
  WHERE m.id = p_member_id;

  IF v_primary_member_id IS NULL THEN
    SELECT d.member_id, m.card_number, pl.consultations_pm
    INTO v_primary_member_id, v_card_number, v_plan_tokens
    FROM public.dependants d
    JOIN public.members m ON m.id = d.member_id
    JOIN public.plans pl ON pl.id = m.plan_id
    WHERE d.id = p_member_id;
  END IF;

  IF v_primary_member_id IS NULL THEN
    RAISE EXCEPTION 'Invalid member or dependant ID.';
  END IF;

  SELECT COUNT(*)::integer INTO v_tokens_used
  FROM public.consultations c
  WHERE (c.member_id = v_primary_member_id OR c.dependant_id IN (SELECT id FROM public.dependants WHERE member_id = v_primary_member_id))
    AND c.counted_toward_limit = true
    AND date_trunc('month', c.visited_at AT TIME ZONE 'UTC') = date_trunc('month', now() AT TIME ZONE 'UTC');

  v_prev_bal := CASE WHEN v_plan_tokens = -1 THEN 999 ELSE GREATEST(0, v_plan_tokens - v_tokens_used) END;

  IF v_plan_tokens <> -1 AND v_prev_bal <= 0 THEN
    IF NOT p_is_override THEN
      RAISE EXCEPTION 'NO TOKENS REMAINING. This member has exhausted their consultation limit for the month. Manager override required.';
    END IF;

    v_should_flag := true;
    v_flag_reason := 'Manager Override: 0 Tokens Remaining - ' || COALESCE(p_override_reason, 'No reason provided');
    v_new_bal := 0;
  ELSE
    v_new_bal := CASE WHEN v_plan_tokens = -1 THEN 999 ELSE GREATEST(0, v_prev_bal - 1) END;
  END IF;

  INSERT INTO public.consultations (
    clinic_id,
    member_id,
    dependant_id,
    appointment_id,
    card_number,
    consultation_type,
    presenting_complaint,
    clinical_notes,
    diagnosis,
    treatment_given,
    seen_by,
    doctor_name,
    is_flagged,
    flagged_reason,
    flagged_by,
    flagged_at,
    counted_toward_limit,
    visited_at
  ) VALUES (
    p_clinic_id,
    v_primary_member_id,
    p_dependant_id,
    p_appointment_id,
    v_card_number,
    p_consultation_type,
    p_presenting_complaint,
    p_clinical_notes,
    p_diagnosis,
    p_treatment_given,
    p_seen_by,
    p_doctor_name,
    v_should_flag,
    v_flag_reason,
    CASE WHEN v_should_flag THEN COALESCE(p_override_by, p_seen_by) ELSE NULL END,
    CASE WHEN v_should_flag THEN now() ELSE NULL END,
    true,
    now()
  ) RETURNING id INTO v_new_consultation_id;

  IF p_appointment_id IS NOT NULL THEN
    UPDATE public.appointments
    SET status = 'completed',
        attended_by = p_seen_by,
        doctor_name = COALESCE(p_doctor_name, doctor_name),
        updated_at = now()
    WHERE id = p_appointment_id;
  END IF;

  INSERT INTO public.consultation_token_audits (
    clinic_id,
    member_id,
    dependant_id,
    consultation_id,
    tokens_deducted,
    previous_balance,
    new_balance,
    recorded_by,
    is_override,
    override_reason,
    override_by
  ) VALUES (
    p_clinic_id,
    v_primary_member_id,
    p_dependant_id,
    v_new_consultation_id,
    1,
    v_prev_bal,
    v_new_bal,
    p_seen_by,
    p_is_override,
    p_override_reason,
    p_override_by
  );

  RETURN QUERY SELECT
    v_new_consultation_id,
    v_new_bal,
    v_prev_bal,
    v_new_bal,
    v_should_flag;
END;
$$;
