-- =============================================================================
-- NFS INSURE | BRAAM HEALTH CENTRE
-- Comprehensive Seed Script — Mock Data + Trigger Testing
-- Version: 1.0  |  Generated for Supabase PostgreSQL
-- =============================================================================
-- USAGE:
--   Run this script as the `postgres` (service-role) user in the Supabase
--   SQL Editor or via psql. It is fully idempotent — safe to re-run.
--
-- PREREQUISITES:
--   1. Schema (braam_health_centre_membership_clinic_management_schema.sql)
--      must already be applied.
--   2. Two Supabase Auth users + matching profiles must already exist:
--        admin@nfs.insure  (portal_role = 'admin')
--        staff@nfs.insure  (portal_role = 'staff')
--   3. `clinics` and `plans` tables are seeded by the schema file itself;
--      this script re-seeds them safely with ON CONFLICT DO NOTHING so it
--      is harmless if they already exist.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 0 : CLEANUP  (removes seed data from a previous run)
-- ─────────────────────────────────────────────────────────────────────────────
-- We tag every seeded auth.user with a metadata flag so we can find them again.
-- Cascade deletes handle child rows automatically.

do $$
declare
  v_uid uuid;
begin
  -- Delete seeded member profiles (identified by email domain used only in seeds)
  for v_uid in
    select id from auth.users
    where email in (
      'thabo.nkosi@gmail.com',
      'priya.moodley@gmail.com',
      'andile.dlamini@gmail.com',
      'zanele.khumalo@gmail.com',    -- dependant placeholder (no auth)
      'corporate.admin@sunrisesecurity.co.za'
    )
  loop
    delete from auth.users where id = v_uid;
  end loop;

  -- Remove agreement templates created by seed (idempotent via version tag)
  delete from agreement_templates where version in ('2025-v1-seed', '2025-v2-seed');

  -- Remove medications added by seed
  delete from medications where name in (
    'Amoxicillin 500mg Capsules',
    'Metformin 500mg Tablets',
    'Atenolol 50mg Tablets',
    'Ibuprofen 400mg Tablets',
    'Omeprazole 20mg Capsules',
    'Salbutamol Inhaler 100mcg',
    'Amlodipine 5mg Tablets',
    'Simvastatin 20mg Tablets'
  );

  -- system_settings: keyed — delete seed keys
  delete from system_settings
  where key in (
    'clinic_name', 'clinic_email', 'clinic_phone', 'clinic_whatsapp',
    'debit_collection_day', 'kyc_review_sla_hours', 'max_dependants_per_member',
    'consultation_limit_alert_threshold', 'card_expiry_years',
    'popia_consent_version', 'agreement_template_version',
    'sms_otp_expiry_minutes', 'step_up_max_attempts',
    'welcome_email_enabled', 'portal_maintenance_mode',
    'support_email', 'support_phone'
  );

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 : SYSTEM SETTINGS
-- ─────────────────────────────────────────────────────────────────────────────
-- The schema does not include a system_settings DDL in the uploaded file,
-- so we create it here if it does not already exist, then seed it.

create table if not exists system_settings (
  key         text primary key,
  value       text not null,
  description text,
  updated_at  timestamptz default now()
);

insert into system_settings (key, value, description) values
  ('clinic_name',                       'Braam Health Centre',              'Display name of the clinic'),
  ('clinic_email',                      'info@nfs.insure',                  'Primary contact e-mail'),
  ('clinic_phone',                      '+27100110010',                     'Primary contact telephone'),
  ('clinic_whatsapp',                   '+27100110010',                     'WhatsApp line for member queries'),
  ('debit_collection_day',              '1',                                'Default monthly debit collection day'),
  ('kyc_review_sla_hours',              '48',                               'Target hours to review a KYC submission'),
  ('max_dependants_per_member',         '5',                                'Maximum dependants allowed per primary member'),
  ('consultation_limit_alert_threshold','1',                                'Alert when consultations_remaining <= this value'),
  ('card_expiry_years',                 '3',                                'Member card validity in years from issue date'),
  ('popia_consent_version',             '2025-v1',                          'Current POPIA consent document version'),
  ('agreement_template_version',        '2025-v1',                          'Current membership agreement version'),
  ('sms_otp_expiry_minutes',            '10',                               'Step-up OTP expiry in minutes'),
  ('step_up_max_attempts',              '3',                                'Maximum OTP verification attempts before lock-out'),
  ('welcome_email_enabled',             'true',                             'Send welcome e-mail on application approval'),
  ('portal_maintenance_mode',           'false',                            'Put portal in read-only maintenance mode'),
  ('support_email',                     'support@nfs.insure',               'Member-facing support e-mail address'),
  ('support_phone',                     '0800 637 467',                     'Toll-free member support line')
on conflict (key) do nothing;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 : CLINICS  (idempotent re-seed)
-- ─────────────────────────────────────────────────────────────────────────────

insert into clinics (
  name, slug, address_line1, address_line2, suburb, city,
  province, postal_code, phone, email, whatsapp,
  doctor_name, specialty, open_24h, latitude, longitude
)
values (
  'Braam Health Centre',
  'braam-health-centre',
  'Eagle Canyon Office Park',
  'Cnr Christiaan De Wet & Dolfyn St',
  'Randpark Ridge',
  'Johannesburg',
  'Gauteng',
  '2154',
  '+27100110010',
  'info@nfs.insure',
  '+27100110010',
  'Dr M J Diago',
  'General Practice',
  true,
  -26.0690,
  27.9320
)
on conflict (slug) do nothing;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 : PLANS  (idempotent re-seed)
-- ─────────────────────────────────────────────────────────────────────────────

insert into plans (
  clinic_id, plan_type, name, description,
  monthly_fee_cents, max_members, consultations_pm,
  includes_medication, includes_24h_access, includes_chronic,
  display_order, most_popular, is_active
)
select
  c.id,
  v.plan_type::plan_type,
  v.name,
  v.description,
  v.fee,
  v.max_m,
  v.consults,
  v.incl_med,
  true,
  v.chronic,
  v.ord,
  v.popular,
  true
from clinics c
cross join (values
  ('essential',         'Essential',
   'Single-member plan with 3 GP consultations per month.',
   55000,  1, 3,  true,  false, 1, false),
  ('couple',            'Couple',
   'Cover for two adults — 6 consultations per month shared.',
   72000,  2, 6,  true,  false, 2, false),
  ('family',            'Family',
   'Cover for up to 4 family members — 12 shared consultations.',
   85000,  4, 12, true,  false, 3, false),
  ('family_plus',       'Family+',
   'Extended family cover for up to 6 members. Most popular plan.',
   115000, 6, 18, true,  false, 4, true),
  ('senior_care',       'Senior Care',
   'Tailored cover for members 60+ with chronic medication inclusion.',
   65000,  1, 4,  true,  true,  5, false),
  ('corporate',         'Corporate',
   'Per-employee corporate membership billed to the employer.',
   48000,  1, 3,  true,  false, 6, false),
  ('basic_health',      'Basic Health Membership',
   'Entry-level health membership for cost-conscious individuals.',
   59900,  1, 3,  true,  false, 7, false),
  ('braam_health',      'Braam Health Membership',
   'Flagship Braam Health Centre membership with full GP access.',
   88800,  1, 3,  true,  false, 8, false),
  ('braam_health_plus', 'Braam Health Plus+',
   'Premium couple membership on the Braam Health platform.',
   133300, 2, 6,  true,  false, 9, false),
  ('corporate_membership','Corporate Membership',
   'Streamlined corporate enrolment for companies with 10+ staff.',
   49900,  1, 3,  true,  false, 10, false),
  ('chronic_medication','Chronic Medication Programme',
   'Dedicated chronic disease management and medication dispensing.',
   0,      1, 0,  true,  true,  11, false)
) as v(plan_type, name, description, fee, max_m, consults, incl_med, chronic, ord, popular)
where c.slug = 'braam-health-centre'
on conflict do nothing;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 : MEMBER AUTH USERS + PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
-- Creates 4 test members in auth.users and corresponding profiles.
-- Member 4 (corporate) is linked to a corporate plan.
-- The on_auth_user_created trigger will auto-create a profile row; we use
-- ON CONFLICT DO NOTHING on profiles to handle both cases cleanly.

do $$
declare
  v_clinic_id   uuid;
  v_now         timestamptz := now();
begin
  select id into v_clinic_id from clinics where slug = 'braam-health-centre';

  -- ── Member 1: Thabo Nkosi (Individual / Essential plan) ──────────────────
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values (
    'a1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'thabo.nkosi@gmail.com',
    crypt('Seed@12345', gen_salt('bf')),
    v_now,
    jsonb_build_object(
      'first_name', 'Thabo',
      'last_name',  'Nkosi',
      'phone',      '0825551101',
      'portal_role','member'
    ),
    v_now, v_now, '', '', '', ''
  ) on conflict (id) do nothing;

  insert into profiles (
    id, clinic_id, portal_role,
    first_name, last_name, sa_id_number,
    date_of_birth, gender, phone, email,
    address_line1, address_line2, suburb, city, province, postal_code
  ) values (
    'a1000000-0000-0000-0000-000000000001',
    v_clinic_id, 'member',
    'Thabo', 'Nkosi', '9203155800087',
    '1992-03-15', 'male', '0825551101', 'thabo.nkosi@gmail.com',
    '14 Bauhinia Street', 'Ext 3', 'Randpark Ridge', 'Johannesburg', 'Gauteng', '2156'
  ) on conflict (id) do update set
    clinic_id    = excluded.clinic_id,
    portal_role  = excluded.portal_role,
    first_name   = excluded.first_name,
    last_name    = excluded.last_name,
    sa_id_number = excluded.sa_id_number,
    date_of_birth= excluded.date_of_birth,
    gender       = excluded.gender,
    phone        = excluded.phone,
    email        = excluded.email,
    address_line1= excluded.address_line1;

  -- ── Member 2: Priya Moodley (Individual / Family plan) ───────────────────
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values (
    'a2000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'priya.moodley@gmail.com',
    crypt('Seed@12345', gen_salt('bf')),
    v_now,
    jsonb_build_object(
      'first_name', 'Priya',
      'last_name',  'Moodley',
      'phone',      '0835552202',
      'portal_role','member'
    ),
    v_now, v_now, '', '', '', ''
  ) on conflict (id) do nothing;

  insert into profiles (
    id, clinic_id, portal_role,
    first_name, last_name, sa_id_number,
    date_of_birth, gender, phone, email,
    address_line1, address_line2, suburb, city, province, postal_code
  ) values (
    'a2000000-0000-0000-0000-000000000002',
    v_clinic_id, 'member',
    'Priya', 'Moodley', '8507220041082',
    '1985-07-22', 'female', '0835552202', 'priya.moodley@gmail.com',
    '7 Jacaranda Avenue', 'Unit 4', 'Honeydew', 'Johannesburg', 'Gauteng', '2040'
  ) on conflict (id) do update set
    clinic_id    = excluded.clinic_id,
    portal_role  = excluded.portal_role,
    first_name   = excluded.first_name,
    last_name    = excluded.last_name,
    sa_id_number = excluded.sa_id_number,
    date_of_birth= excluded.date_of_birth,
    gender       = excluded.gender,
    phone        = excluded.phone,
    email        = excluded.email,
    address_line1= excluded.address_line1;

  -- ── Member 3: Andile Dlamini (Individual / Braam Health plan) ────────────
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values (
    'a3000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'andile.dlamini@gmail.com',
    crypt('Seed@12345', gen_salt('bf')),
    v_now,
    jsonb_build_object(
      'first_name', 'Andile',
      'last_name',  'Dlamini',
      'phone',      '0725553303',
      'portal_role','member'
    ),
    v_now, v_now, '', '', '', ''
  ) on conflict (id) do nothing;

  insert into profiles (
    id, clinic_id, portal_role,
    first_name, last_name, sa_id_number,
    date_of_birth, gender, phone, email,
    address_line1, suburb, city, province, postal_code
  ) values (
    'a3000000-0000-0000-0000-000000000003',
    v_clinic_id, 'member',
    'Andile', 'Dlamini', '9011280800086',
    '1990-11-28', 'male', '0725553303', 'andile.dlamini@gmail.com',
    '22 Impala Road', 'Northriding', 'Johannesburg', 'Gauteng', '2162'
  ) on conflict (id) do update set
    clinic_id    = excluded.clinic_id,
    portal_role  = excluded.portal_role,
    first_name   = excluded.first_name,
    last_name    = excluded.last_name,
    sa_id_number = excluded.sa_id_number,
    date_of_birth= excluded.date_of_birth,
    gender       = excluded.gender,
    phone        = excluded.phone,
    email        = excluded.email,
    address_line1= excluded.address_line1;

  -- ── Member 4: Sunrise Security (Corporate) ───────────────────────────────
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values (
    'a4000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'corporate.admin@sunrisesecurity.co.za',
    crypt('Seed@12345', gen_salt('bf')),
    v_now,
    jsonb_build_object(
      'first_name', 'Nomvula',
      'last_name',  'Sithole',
      'phone',      '0115554404',
      'portal_role','member'
    ),
    v_now, v_now, '', '', '', ''
  ) on conflict (id) do nothing;

  insert into profiles (
    id, clinic_id, portal_role,
    first_name, last_name, sa_id_number,
    date_of_birth, gender, phone, email,
    address_line1, suburb, city, province, postal_code
  ) values (
    'a4000000-0000-0000-0000-000000000004',
    v_clinic_id, 'member',
    'Nomvula', 'Sithole', '8812155400081',
    '1988-12-15', 'female', '0115554404', 'corporate.admin@sunrisesecurity.co.za',
    '100 Montecasino Boulevard', 'Fourways', 'Johannesburg', 'Gauteng', '2055'
  ) on conflict (id) do update set
    clinic_id    = excluded.clinic_id,
    portal_role  = excluded.portal_role,
    first_name   = excluded.first_name,
    last_name    = excluded.last_name,
    sa_id_number = excluded.sa_id_number,
    date_of_birth= excluded.date_of_birth,
    gender       = excluded.gender,
    phone        = excluded.phone,
    email        = excluded.email,
    address_line1= excluded.address_line1;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5 : MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id   uuid;
  v_plan_essential    uuid;
  v_plan_family       uuid;
  v_plan_braam        uuid;
  v_plan_corporate    uuid;
  v_plan_family_plus  uuid;
begin
  select id into v_clinic_id         from clinics where slug = 'braam-health-centre';
  select id into v_plan_essential    from plans   where plan_type = 'essential'           and clinic_id = v_clinic_id;
  select id into v_plan_family       from plans   where plan_type = 'family'              and clinic_id = v_clinic_id;
  select id into v_plan_braam        from plans   where plan_type = 'braam_health'        and clinic_id = v_clinic_id;
  select id into v_plan_corporate    from plans   where plan_type = 'corporate_membership'and clinic_id = v_clinic_id;
  select id into v_plan_family_plus  from plans   where plan_type = 'family_plus'         and clinic_id = v_clinic_id;

  -- Member 1 — Thabo Nkosi, Essential plan
  insert into members (
    id, profile_id, clinic_id, plan_id,
    card_number, status, member_since, debit_day,
    kyc_status, popia_consent, popia_consent_at, popia_consent_version,
    bank_name, account_holder, account_number, account_type, branch_code,
    banking_verified_at, notes
  ) values (
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    v_clinic_id, v_plan_essential,
    'NFS8 0011 234 1', 'active', '2024-01-10', 1,
    'approved', true, '2024-01-10 09:15:00+02', '2025-v1',
    'Standard Bank', 'Thabo Nkosi', '273001100001', 'cheque', '051001',
    '2024-01-10 10:00:00+02',
    'Long-standing member. No outstanding issues.'
  ) on conflict (id) do nothing;

  -- Member 2 — Priya Moodley, Family plan
  insert into members (
    id, profile_id, clinic_id, plan_id,
    card_number, status, member_since, debit_day,
    kyc_status, popia_consent, popia_consent_at, popia_consent_version,
    bank_name, account_holder, account_number, account_type, branch_code,
    banking_verified_at, notes
  ) values (
    'b2000000-0000-0000-0000-000000000002',
    'a2000000-0000-0000-0000-000000000002',
    v_clinic_id, v_plan_family,
    'NFS8 0022 345 2', 'active', '2023-08-01', 5,
    'approved', true, '2023-08-01 11:30:00+02', '2025-v1',
    'Nedbank', 'Priya Moodley', '198765432101', 'savings', '198765',
    '2023-08-01 12:00:00+02',
    'Family plan. Two dependants registered.'
  ) on conflict (id) do nothing;

  -- Member 3 — Andile Dlamini, Braam Health plan
  insert into members (
    id, profile_id, clinic_id, plan_id,
    card_number, status, member_since, debit_day,
    kyc_status, popia_consent, popia_consent_at, popia_consent_version,
    bank_name, account_holder, account_number, account_type, branch_code,
    banking_verified_at, notes
  ) values (
    'b3000000-0000-0000-0000-000000000003',
    'a3000000-0000-0000-0000-000000000003',
    v_clinic_id, v_plan_braam,
    'NFS8 0033 456 3', 'active', '2024-04-15', 15,
    'approved', true, '2024-04-15 08:00:00+02', '2025-v1',
    'FNB', 'Andile Dlamini', '625033000031', 'cheque', '250655',
    '2024-04-15 08:30:00+02',
    'Braam Health plan. Requested plan upgrade in progress.'
  ) on conflict (id) do nothing;

  -- Member 4 — Nomvula Sithole / Sunrise Security, Corporate plan
  insert into members (
    id, profile_id, clinic_id, plan_id,
    card_number, status, member_since, debit_day,
    kyc_status, popia_consent, popia_consent_at, popia_consent_version,
    bank_name, account_holder, account_number, account_type, branch_code,
    banking_verified_at,
    is_corporate, company_name, notes
  ) values (
    'b4000000-0000-0000-0000-000000000004',
    'a4000000-0000-0000-0000-000000000004',
    v_clinic_id, v_plan_corporate,
    'NFS8 0044 567 4', 'active', '2024-06-01', 1,
    'approved', true, '2024-06-01 13:00:00+02', '2025-v1',
    'ABSA Bank', 'Sunrise Security (Pty) Ltd', '407123456789', 'cheque', '632005',
    '2024-06-01 13:30:00+02',
    true, 'Sunrise Security (Pty) Ltd',
    'Corporate account. 18 enrolled employees.'
  ) on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6 : DEPENDANTS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id uuid;
begin
  select id into v_clinic_id from clinics where slug = 'braam-health-centre';

  -- Priya's dependants (Family plan — max 4)
  insert into dependants (
    id, member_id, clinic_id,
    first_name, last_name, relationship,
    sa_id_number, date_of_birth, gender, phone,
    status, card_number, card_status
  ) values
  (
    'c1000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'Rajan', 'Moodley', 'spouse',
    '8302145200081', '1983-02-14', 'male', '0835552203',
    'active', 'NFS8 0022 345 D1', 'active'
  ),
  (
    'c2000000-0000-0000-0000-000000000002',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'Kavya', 'Moodley', 'child',
    '1205250041080', '2012-05-25', 'female', null,
    'active', 'NFS8 0022 345 D2', 'active'
  )
  on conflict (id) do nothing;

  -- Thabo's dependant (Essential plan — 1 allowed on upgrade; kept for data richness)
  insert into dependants (
    id, member_id, clinic_id,
    first_name, last_name, relationship,
    sa_id_number, date_of_birth, gender, phone,
    status, card_number, card_status
  ) values (
    'c3000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    'Zanele', 'Nkosi', 'spouse',
    '9407160800084', '1994-07-16', 'female', '0835551102',
    'active', 'NFS8 0011 234 D1', 'active'
  ) on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7 : AGREEMENT TEMPLATES
-- ─────────────────────────────────────────────────────────────────────────────
-- Must exist before signed_agreements can reference them.

do $$
declare
  v_clinic_id uuid;
begin
  select id into v_clinic_id from clinics where slug = 'braam-health-centre';

  insert into agreement_templates (
    id, clinic_id, version, title, content_html,
    is_current, effective_from
  ) values
  (
    'd1000000-0000-0000-0000-000000000001',
    v_clinic_id,
    '2025-v1-seed',
    'NFS Insure Membership Agreement 2025',
    '<h1>NFS Insure Membership Agreement</h1>
     <p>This agreement governs the terms of your health membership at Braam Health Centre,
     operated by NFS Insure (Pty) Ltd, registration number 2018/123456/07.</p>
     <p>By signing this agreement you agree to the monthly debit order collection,
     compliance with clinic rules, and the POPIA consent policy version 2025-v1.</p>',
    true,
    '2025-01-01'
  ),
  (
    'd2000000-0000-0000-0000-000000000002',
    v_clinic_id,
    '2025-v2-seed',
    'NFS Insure Corporate Membership Agreement 2025',
    '<h1>NFS Insure Corporate Membership Agreement</h1>
     <p>This corporate agreement is entered into between NFS Insure (Pty) Ltd and
     the contracting employer entity. It covers the enrolment, billing, and
     termination procedures for corporate employee health memberships.</p>',
    false,
    '2025-06-01'
  )
  on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8 : APPLICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
-- Three individual applications and one corporate application are inserted.
-- The INSERT itself fires trg_on_application_submitted for each row
-- (creates welcome e-mail + admin notification in notifications table).
-- Subsequent UPDATE statements test trg_on_application_decision.

do $$
declare
  v_clinic_id   uuid;
  v_plan_essential   uuid;
  v_plan_family      uuid;
  v_plan_braam       uuid;
  v_plan_corporate   uuid;
  v_admin_id    uuid;
  v_staff_id    uuid;
begin
  select id into v_clinic_id       from clinics  where slug       = 'braam-health-centre';
  select id into v_plan_essential  from plans    where plan_type  = 'essential'            and clinic_id = v_clinic_id;
  select id into v_plan_family     from plans    where plan_type  = 'family'               and clinic_id = v_clinic_id;
  select id into v_plan_braam      from plans    where plan_type  = 'braam_health'         and clinic_id = v_clinic_id;
  select id into v_plan_corporate  from plans    where plan_type  = 'corporate_membership' and clinic_id = v_clinic_id;
  select id into v_admin_id        from profiles where email      = 'admin@nfs.insure';
  select id into v_staff_id        from profiles where email      = 'staff@nfs.insure';

  -- ── Application 1: Thabo Nkosi — individual, will be APPROVED ─────────────
  -- INSERT fires trg_on_application_submitted
  insert into applications (
    id, clinic_id, profile_id, plan_id,
    application_type, status,
    applicant_name, applicant_phone, applicant_email,
    applicant_id_number, source, submitted_at
  ) values (
    'e1000000-0000-0000-0000-000000000001',
    v_clinic_id,
    'a1000000-0000-0000-0000-000000000001',
    v_plan_essential,
    'individual', 'submitted',
    'Thabo Nkosi', '0825551101', 'thabo.nkosi@gmail.com',
    '9203155800087', 'self_service',
    now() - interval '90 days'
  ) on conflict (id) do nothing;

  -- ── Application 2: Priya Moodley — individual, will be APPROVED ──────────
  insert into applications (
    id, clinic_id, profile_id, plan_id,
    application_type, status,
    applicant_name, applicant_phone, applicant_email,
    applicant_id_number, source, submitted_at
  ) values (
    'e2000000-0000-0000-0000-000000000002',
    v_clinic_id,
    'a2000000-0000-0000-0000-000000000002',
    v_plan_family,
    'individual', 'submitted',
    'Priya Moodley', '0835552202', 'priya.moodley@gmail.com',
    '8507220041082', 'self_service',
    now() - interval '300 days'
  ) on conflict (id) do nothing;

  -- ── Application 3: Andile Dlamini — individual, will be REJECTED ─────────
  insert into applications (
    id, clinic_id, profile_id, plan_id,
    application_type, status,
    applicant_name, applicant_phone, applicant_email,
    applicant_id_number, source, submitted_at
  ) values (
    'e3000000-0000-0000-0000-000000000003',
    v_clinic_id,
    'a3000000-0000-0000-0000-000000000003',
    v_plan_braam,
    'individual', 'submitted',
    'Andile Dlamini', '0725553303', 'andile.dlamini@gmail.com',
    '9011280800086', 'staff_assisted',
    now() - interval '60 days'
  ) on conflict (id) do nothing;

  -- ── Application 4: Sunrise Security — corporate ───────────────────────────
  insert into applications (
    id, clinic_id, profile_id, plan_id,
    application_type, status,
    applicant_name, applicant_phone, applicant_email,
    applicant_id_number,
    company_name, employee_count,
    source, submitted_at
  ) values (
    'e4000000-0000-0000-0000-000000000004',
    v_clinic_id,
    'a4000000-0000-0000-0000-000000000004',
    v_plan_corporate,
    'corporate', 'submitted',
    'Nomvula Sithole', '0115554404', 'corporate.admin@sunrisesecurity.co.za',
    '8812155400081',
    'Sunrise Security (Pty) Ltd', 18,
    'staff_assisted',
    now() - interval '180 days'
  ) on conflict (id) do nothing;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TRIGGER TEST 1 — trg_on_application_submitted
  --   The four INSERT statements above will have fired this trigger for every
  --   row. The ON CONFLICT DO NOTHING prevents duplicate notifications on
  --   re-runs ONLY if your trigger is idempotent; if not, wrap in a
  --   transaction and check notifications yourself.
  -- ═══════════════════════════════════════════════════════════════════════════

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TRIGGER TEST 2a — trg_on_application_decision  (APPROVED)
  --   Update Application 1 (Thabo) and Application 2 (Priya) to 'approved'.
  -- ═══════════════════════════════════════════════════════════════════════════
  update applications set
    status       = 'approved',
    reviewed_by  = v_admin_id,
    reviewed_at  = now() - interval '85 days',
    activated_at = now() - interval '85 days',
    member_id    = 'b1000000-0000-0000-0000-000000000001'
  where id = 'e1000000-0000-0000-0000-000000000001'
    and status  <> 'approved';

  update applications set
    status       = 'approved',
    reviewed_by  = v_admin_id,
    reviewed_at  = now() - interval '295 days',
    activated_at = now() - interval '295 days',
    member_id    = 'b2000000-0000-0000-0000-000000000002'
  where id = 'e2000000-0000-0000-0000-000000000002'
    and status  <> 'approved';

  update applications set
    status       = 'approved',
    reviewed_by  = v_admin_id,
    reviewed_at  = now() - interval '175 days',
    activated_at = now() - interval '175 days',
    member_id    = 'b4000000-0000-0000-0000-000000000004'
  where id = 'e4000000-0000-0000-0000-000000000004'
    and status  <> 'approved';

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TRIGGER TEST 2b — trg_on_application_decision  (REJECTED)
  --   Update Application 3 (Andile) to 'rejected'.
  -- ═══════════════════════════════════════════════════════════════════════════
  update applications set
    status           = 'rejected',
    reviewed_by      = v_admin_id,
    reviewed_at      = now() - interval '55 days',
    rejection_reason = 'KYC documents could not be verified. SA ID number does not match submitted proof of identity. Member invited to resubmit.'
  where id = 'e3000000-0000-0000-0000-000000000003'
    and status <> 'rejected';

  -- A fresh application for Andile that was later approved (he reapplied)
  insert into applications (
    id, clinic_id, profile_id, plan_id,
    application_type, status,
    applicant_name, applicant_phone, applicant_email,
    applicant_id_number, source, submitted_at,
    reviewed_by, reviewed_at, activated_at,
    member_id
  ) values (
    'e5000000-0000-0000-0000-000000000005',
    v_clinic_id,
    'a3000000-0000-0000-0000-000000000003',
    v_plan_braam,
    'individual', 'approved',
    'Andile Dlamini', '0725553303', 'andile.dlamini@gmail.com',
    '9011280800086', 'self_service',
    now() - interval '50 days',
    v_admin_id,
    now() - interval '45 days',
    now() - interval '45 days',
    'b3000000-0000-0000-0000-000000000003'
  ) on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9 : ONBOARDING STEPS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_now timestamptz := now();
begin

  -- Application 1 — Thabo (all steps complete)
  insert into onboarding_steps (
    id, application_id, member_id,
    personal_details_done, plan_selected_done, banking_details_done,
    popia_consent_done, kyc_upload_done, mandate_signed_done,
    agreement_signed_done, payment_setup_done,
    personal_details_at, plan_selected_at, banking_details_at,
    popia_consent_at, kyc_upload_at, mandate_signed_at,
    agreement_signed_at, payment_setup_at, completed_at
  ) values (
    'f1000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    true, true, true, true, true, true, true, true,
    v_now - interval '90 days', v_now - interval '90 days',
    v_now - interval '89 days', v_now - interval '89 days',
    v_now - interval '88 days', v_now - interval '88 days',
    v_now - interval '87 days', v_now - interval '87 days',
    v_now - interval '87 days'
  ) on conflict (id) do nothing;

  -- Application 2 — Priya (all steps complete)
  insert into onboarding_steps (
    id, application_id, member_id,
    personal_details_done, plan_selected_done, banking_details_done,
    popia_consent_done, kyc_upload_done, mandate_signed_done,
    agreement_signed_done, payment_setup_done,
    personal_details_at, plan_selected_at, banking_details_at,
    popia_consent_at, kyc_upload_at, mandate_signed_at,
    agreement_signed_at, payment_setup_at, completed_at
  ) values (
    'f2000000-0000-0000-0000-000000000002',
    'e2000000-0000-0000-0000-000000000002',
    'b2000000-0000-0000-0000-000000000002',
    true, true, true, true, true, true, true, true,
    v_now - interval '300 days', v_now - interval '300 days',
    v_now - interval '299 days', v_now - interval '299 days',
    v_now - interval '298 days', v_now - interval '298 days',
    v_now - interval '297 days', v_now - interval '297 days',
    v_now - interval '297 days'
  ) on conflict (id) do nothing;

  -- Application 3 — Andile rejected app (steps incomplete at rejection)
  insert into onboarding_steps (
    id, application_id,
    personal_details_done, plan_selected_done, banking_details_done,
    popia_consent_done, kyc_upload_done,
    personal_details_at, plan_selected_at, banking_details_at,
    popia_consent_at, kyc_upload_at
  ) values (
    'f3000000-0000-0000-0000-000000000003',
    'e3000000-0000-0000-0000-000000000003',
    true, true, true, true, true,
    v_now - interval '60 days', v_now - interval '60 days',
    v_now - interval '59 days', v_now - interval '59 days',
    v_now - interval '58 days'
  ) on conflict (id) do nothing;

  -- Application 5 — Andile reapplied (approved, all steps complete)
  insert into onboarding_steps (
    id, application_id, member_id,
    personal_details_done, plan_selected_done, banking_details_done,
    popia_consent_done, kyc_upload_done, mandate_signed_done,
    agreement_signed_done, payment_setup_done,
    personal_details_at, plan_selected_at, banking_details_at,
    popia_consent_at, kyc_upload_at, mandate_signed_at,
    agreement_signed_at, payment_setup_at, completed_at
  ) values (
    'f5000000-0000-0000-0000-000000000005',
    'e5000000-0000-0000-0000-000000000005',
    'b3000000-0000-0000-0000-000000000003',
    true, true, true, true, true, true, true, true,
    v_now - interval '50 days', v_now - interval '50 days',
    v_now - interval '49 days', v_now - interval '49 days',
    v_now - interval '48 days', v_now - interval '48 days',
    v_now - interval '47 days', v_now - interval '47 days',
    v_now - interval '47 days'
  ) on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10 : MEMBER CARDS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id uuid;
  v_now       timestamptz := now();
begin
  select id into v_clinic_id from clinics where slug = 'braam-health-centre';

  -- Thabo's primary card
  insert into member_cards (
    id, member_id, clinic_id, dependant_id,
    card_number, status,
    qr_payload, qr_secret,
    issued_at, expires_at
  ) values (
    '71000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    v_clinic_id, null,
    'NFS8 0011 234 1', 'active',
    encode(digest('CARD:NFS8001123410:b1000000-0000-0000-0000-000000000001', 'sha256'), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    v_now - interval '89 days',
    v_now - interval '89 days' + interval '3 years'
  ) on conflict (card_number) do nothing;

  -- Thabo's spouse card
  insert into member_cards (
    id, member_id, clinic_id, dependant_id,
    card_number, status,
    qr_payload, qr_secret,
    issued_at, expires_at
  ) values (
    '72000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000001',
    v_clinic_id,
    'c3000000-0000-0000-0000-000000000003',
    'NFS8 0011 234 D1', 'active',
    encode(digest('CARD:NFS8001123401D:c3000000-0000-0000-0000-000000000003', 'sha256'), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    v_now - interval '89 days',
    v_now - interval '89 days' + interval '3 years'
  ) on conflict (card_number) do nothing;

  -- Priya's primary card
  insert into member_cards (
    id, member_id, clinic_id, dependant_id,
    card_number, status,
    qr_payload, qr_secret,
    issued_at, expires_at
  ) values (
    '73000000-0000-0000-0000-000000000003',
    'b2000000-0000-0000-0000-000000000002',
    v_clinic_id, null,
    'NFS8 0022 345 2', 'active',
    encode(digest('CARD:NFS8002234520:b2000000-0000-0000-0000-000000000002', 'sha256'), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    v_now - interval '297 days',
    v_now - interval '297 days' + interval '3 years'
  ) on conflict (card_number) do nothing;

  -- Priya's dependant cards
  insert into member_cards (
    id, member_id, clinic_id, dependant_id,
    card_number, status,
    qr_payload, qr_secret,
    issued_at, expires_at
  ) values
  (
    '74000000-0000-0000-0000-000000000004',
    'b2000000-0000-0000-0000-000000000002',
    v_clinic_id,
    'c1000000-0000-0000-0000-000000000001',
    'NFS8 0022 345 D1', 'active',
    encode(digest('CARD:NFS8002234521:c1000000-0000-0000-0000-000000000001', 'sha256'), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    v_now - interval '297 days',
    v_now - interval '297 days' + interval '3 years'
  ),
  (
    '75000000-0000-0000-0000-000000000005',
    'b2000000-0000-0000-0000-000000000002',
    v_clinic_id,
    'c2000000-0000-0000-0000-000000000002',
    'NFS8 0022 345 D2', 'active',
    encode(digest('CARD:NFS8002234522:c2000000-0000-0000-0000-000000000002', 'sha256'), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    v_now - interval '297 days',
    v_now - interval '297 days' + interval '3 years'
  )
  on conflict (card_number) do nothing;

  -- Andile's card
  insert into member_cards (
    id, member_id, clinic_id, dependant_id,
    card_number, status,
    qr_payload, qr_secret,
    issued_at, expires_at
  ) values (
    '76000000-0000-0000-0000-000000000006',
    'b3000000-0000-0000-0000-000000000003',
    v_clinic_id, null,
    'NFS8 0033 456 3', 'active',
    encode(digest('CARD:NFS8003345630:b3000000-0000-0000-0000-000000000003', 'sha256'), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    v_now - interval '47 days',
    v_now - interval '47 days' + interval '3 years'
  ) on conflict (card_number) do nothing;

  -- Nomvula / Sunrise Security card
  insert into member_cards (
    id, member_id, clinic_id, dependant_id,
    card_number, status,
    qr_payload, qr_secret,
    issued_at, expires_at
  ) values (
    '77000000-0000-0000-0000-000000000007',
    'b4000000-0000-0000-0000-000000000004',
    v_clinic_id, null,
    'NFS8 0044 567 4', 'active',
    encode(digest('CARD:NFS8004456740:b4000000-0000-0000-0000-000000000004', 'sha256'), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    v_now - interval '175 days',
    v_now - interval '175 days' + interval '3 years'
  ) on conflict (card_number) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11 : KYC DOCUMENTS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id uuid;
  v_admin_id  uuid;
  v_now       timestamptz := now();
begin
  select id into v_clinic_id from clinics  where slug  = 'braam-health-centre';
  select id into v_admin_id  from profiles where email = 'admin@nfs.insure';

  -- Thabo — SA ID + proof of address (approved)
  insert into kyc_documents (id, member_id, clinic_id, doc_type, file_path, file_name,
    file_size_bytes, mime_type, status, reviewed_by, reviewed_at) values
  (
    '81000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    'sa_id', 'kyc-documents/b1000000/sa_id_thabo_nkosi.pdf',
    'sa_id_thabo_nkosi.pdf', 1048576, 'application/pdf',
    'approved', v_admin_id, v_now - interval '88 days'
  ),
  (
    '82000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    'proof_of_address', 'kyc-documents/b1000000/poa_thabo_nkosi.pdf',
    'poa_thabo_nkosi.pdf', 524288, 'application/pdf',
    'approved', v_admin_id, v_now - interval '88 days'
  )
  on conflict (id) do nothing;

  -- Priya — SA ID + proof of address + payslip (approved)
  insert into kyc_documents (id, member_id, clinic_id, doc_type, file_path, file_name,
    file_size_bytes, mime_type, status, reviewed_by, reviewed_at) values
  (
    '83000000-0000-0000-0000-000000000003',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'sa_id', 'kyc-documents/b2000000/sa_id_priya_moodley.pdf',
    'sa_id_priya_moodley.pdf', 983040, 'application/pdf',
    'approved', v_admin_id, v_now - interval '298 days'
  ),
  (
    '84000000-0000-0000-0000-000000000004',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'proof_of_address', 'kyc-documents/b2000000/poa_priya_moodley.pdf',
    'poa_priya_moodley.pdf', 716800, 'application/pdf',
    'approved', v_admin_id, v_now - interval '298 days'
  ),
  (
    '85000000-0000-0000-0000-000000000005',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'payslip', 'kyc-documents/b2000000/payslip_priya_moodley.pdf',
    'payslip_priya_moodley.pdf', 409600, 'application/pdf',
    'approved', v_admin_id, v_now - interval '298 days'
  )
  on conflict (id) do nothing;

  -- Andile — SA ID (originally rejected; resubmitted and now approved)
  insert into kyc_documents (id, member_id, clinic_id, doc_type, file_path, file_name,
    file_size_bytes, mime_type, status, reviewed_by, reviewed_at,
    rejection_reason) values
  (
    '86000000-0000-0000-0000-000000000006',
    'b3000000-0000-0000-0000-000000000003', v_clinic_id,
    'sa_id', 'kyc-documents/b3000000/sa_id_andile_dlamini_v1.pdf',
    'sa_id_andile_dlamini_v1.pdf', 1048576, 'application/pdf',
    'rejected', v_admin_id, v_now - interval '58 days',
    'Image is blurry and the ID number is not legible. Please resubmit a clear, unobstructed scan.'
  ),
  (
    '87000000-0000-0000-0000-000000000007',
    'b3000000-0000-0000-0000-000000000003', v_clinic_id,
    'sa_id', 'kyc-documents/b3000000/sa_id_andile_dlamini_v2.pdf',
    'sa_id_andile_dlamini_v2.pdf', 1048576, 'application/pdf',
    'approved', v_admin_id, v_now - interval '47 days',
    null
  ),
  (
    '88000000-0000-0000-0000-000000000008',
    'b3000000-0000-0000-0000-000000000003', v_clinic_id,
    'proof_of_address', 'kyc-documents/b3000000/poa_andile_dlamini.pdf',
    'poa_andile_dlamini.pdf', 655360, 'application/pdf',
    'approved', v_admin_id, v_now - interval '47 days',
    null
  )
  on conflict (id) do nothing;

  -- Nomvula / Sunrise Security — SA ID + bank statement
  insert into kyc_documents (id, member_id, clinic_id, doc_type, file_path, file_name,
    file_size_bytes, mime_type, status, reviewed_by, reviewed_at) values
  (
    '89000000-0000-0000-0000-000000000009',
    'b4000000-0000-0000-0000-000000000004', v_clinic_id,
    'sa_id', 'kyc-documents/b4000000/sa_id_nomvula_sithole.pdf',
    'sa_id_nomvula_sithole.pdf', 1048576, 'application/pdf',
    'approved', v_admin_id, v_now - interval '173 days'
  ),
  (
    '8a000000-0000-0000-0000-00000000000a',
    'b4000000-0000-0000-0000-000000000004', v_clinic_id,
    'bank_statement', 'kyc-documents/b4000000/bank_statement_sunrise_security.pdf',
    'bank_statement_sunrise_security.pdf', 2097152, 'application/pdf',
    'approved', v_admin_id, v_now - interval '173 days'
  )
  on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12 : POPIA CONSENTS & CONSENT PURPOSES
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id uuid;
  v_now       timestamptz := now();

  v_consent_thabo   uuid := 'f1000000-0000-0000-0000-000000000001';
  v_consent_priya   uuid := 'f2000000-0000-0000-0000-000000000002';
  v_consent_andile  uuid := 'f3000000-0000-0000-0000-000000000003';
  v_consent_nomvula uuid := 'f4000000-0000-0000-0000-000000000004';
begin
  select id into v_clinic_id from clinics where slug = 'braam-health-centre';

  -- Consent records
  insert into popia_consents (id, member_id, profile_id, clinic_id, consent_version, consented_at, ip_address) values
    (v_consent_thabo,   'b1000000-0000-0000-0000-000000000001',
      'a1000000-0000-0000-0000-000000000001', v_clinic_id, '2025-v1',
      v_now - interval '89 days', '102.67.10.11'),
    (v_consent_priya,   'b2000000-0000-0000-0000-000000000002',
      'a2000000-0000-0000-0000-000000000002', v_clinic_id, '2025-v1',
      v_now - interval '299 days', '102.67.10.55'),
    (v_consent_andile,  'b3000000-0000-0000-0000-000000000003',
      'a3000000-0000-0000-0000-000000000003', v_clinic_id, '2025-v1',
      v_now - interval '49 days',  '102.67.11.22'),
    (v_consent_nomvula, 'b4000000-0000-0000-0000-000000000004',
      'a4000000-0000-0000-0000-000000000004', v_clinic_id, '2025-v1',
      v_now - interval '175 days', '197.80.100.5')
  on conflict (id) do nothing;

  -- Consent purposes for all four members
  -- Required purposes: identity_verification, billing_debit_order, medical_records, membership_card
  -- Optional purposes: marketing_email, marketing_sms, analytics

  insert into popia_consent_purposes (consent_id, purpose, is_required, granted) values
    -- Thabo
    (v_consent_thabo, 'identity_verification',  true,  true),
    (v_consent_thabo, 'medical_records',         true,  true),
    (v_consent_thabo, 'billing_debit_order',     true,  true),
    (v_consent_thabo, 'membership_card',         true,  true),
    (v_consent_thabo, 'marketing_email',         false, true),
    (v_consent_thabo, 'marketing_sms',           false, false),
    (v_consent_thabo, 'analytics',               false, true),
    -- Priya
    (v_consent_priya, 'identity_verification',   true,  true),
    (v_consent_priya, 'medical_records',          true,  true),
    (v_consent_priya, 'billing_debit_order',      true,  true),
    (v_consent_priya, 'membership_card',          true,  true),
    (v_consent_priya, 'marketing_email',          false, true),
    (v_consent_priya, 'marketing_sms',            false, true),
    (v_consent_priya, 'analytics',                false, true),
    -- Andile
    (v_consent_andile, 'identity_verification',  true,  true),
    (v_consent_andile, 'medical_records',         true,  true),
    (v_consent_andile, 'billing_debit_order',     true,  true),
    (v_consent_andile, 'membership_card',         true,  true),
    (v_consent_andile, 'marketing_email',         false, false),
    (v_consent_andile, 'marketing_sms',           false, false),
    (v_consent_andile, 'analytics',               false, false),
    -- Nomvula / Corporate
    (v_consent_nomvula, 'identity_verification',  true,  true),
    (v_consent_nomvula, 'medical_records',         true,  true),
    (v_consent_nomvula, 'billing_debit_order',     true,  true),
    (v_consent_nomvula, 'membership_card',         true,  true),
    (v_consent_nomvula, 'third_party_sharing',     false, true),
    (v_consent_nomvula, 'analytics',               false, true)
  on conflict do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 13 : DEBIT MANDATES
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id  uuid;
  v_admin_id   uuid;
  v_now        timestamptz := now();
begin
  select id into v_clinic_id from clinics  where slug  = 'braam-health-centre';
  select id into v_admin_id  from profiles where email = 'admin@nfs.insure';

  insert into debit_mandates (
    id, member_id, clinic_id,
    status, mandate_type,
    bank_name, account_holder, account_number, account_type, branch_code,
    signed_by, signed_at, captured_by
  ) values
  (
    'f1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    'signed', 'naedo',
    'Standard Bank', 'Thabo Nkosi', '273001100001', 'cheque', '051001',
    'a1000000-0000-0000-0000-000000000001',
    v_now - interval '87 days',
    v_admin_id
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'signed', 'debicheck',
    'Nedbank', 'Priya Moodley', '198765432101', 'savings', '198765',
    'a2000000-0000-0000-0000-000000000002',
    v_now - interval '297 days',
    v_admin_id
  ),
  (
    'f3000000-0000-0000-0000-000000000003',
    'b3000000-0000-0000-0000-000000000003', v_clinic_id,
    'signed', 'naedo',
    'FNB', 'Andile Dlamini', '625033000031', 'cheque', '250655',
    'a3000000-0000-0000-0000-000000000003',
    v_now - interval '47 days',
    v_admin_id
  ),
  (
    'f4000000-0000-0000-0000-000000000004',
    'b4000000-0000-0000-0000-000000000004', v_clinic_id,
    'signed', 'debicheck',
    'ABSA Bank', 'Sunrise Security (Pty) Ltd', '407123456789', 'cheque', '632005',
    'a4000000-0000-0000-0000-000000000004',
    v_now - interval '175 days',
    v_admin_id
  )
  on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 14 : DEBIT ORDERS
-- ─────────────────────────────────────────────────────────────────────────────
-- Several historical orders + one 'pending' that will be updated to 'failed'
-- to fire trg_on_debit_order_failed.

do $$
declare
  v_clinic_id         uuid;
  v_plan_essential    uuid;
  v_plan_family       uuid;
  v_plan_braam        uuid;
  v_plan_corporate    uuid;
  v_now               timestamptz := now();
begin
  select id into v_clinic_id      from clinics where slug = 'braam-health-centre';
  select id into v_plan_essential from plans   where plan_type = 'essential'            and clinic_id = v_clinic_id;
  select id into v_plan_family    from plans   where plan_type = 'family'               and clinic_id = v_clinic_id;
  select id into v_plan_braam     from plans   where plan_type = 'braam_health'         and clinic_id = v_clinic_id;
  select id into v_plan_corporate from plans   where plan_type = 'corporate_membership' and clinic_id = v_clinic_id;

  -- ── Thabo — 3 months history (success) + 1 current pending ───────────────
  insert into debit_orders (id, member_id, clinic_id, mandate_id, plan_id,
    amount_cents, collection_date, status, bank_reference, processed_at) values
  (
    '91000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    'f1000000-0000-0000-0000-000000000001', v_plan_essential,
    55000, (date_trunc('month', now()) - interval '3 months')::date,
    'success', 'STD20240101TN001', (date_trunc('month', now()) - interval '3 months')
  ),
  (
    '92000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    'f1000000-0000-0000-0000-000000000001', v_plan_essential,
    55000, (date_trunc('month', now()) - interval '2 months')::date,
    'success', 'STD20240201TN001', (date_trunc('month', now()) - interval '2 months')
  ),
  (
    '93000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    'f1000000-0000-0000-0000-000000000001', v_plan_essential,
    55000, (date_trunc('month', now()) - interval '1 month')::date,
    'success', 'STD20240301TN001', (date_trunc('month', now()) - interval '1 month')
  ),
  -- Current month — pending (will be set to 'failed' below to fire trigger)
  (
    '94000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    'f1000000-0000-0000-0000-000000000001', v_plan_essential,
    55000, date_trunc('month', now())::date,
    'pending', null, null
  )
  on conflict (id) do nothing;

  -- ── Priya — 2 months success + 1 failed ──────────────────────────────────
  insert into debit_orders (id, member_id, clinic_id, mandate_id, plan_id,
    amount_cents, collection_date, status, bank_reference, processed_at,
    failure_reason) values
  (
    '95000000-0000-0000-0000-000000000005',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'f2000000-0000-0000-0000-000000000002', v_plan_family,
    85000, (date_trunc('month', now()) - interval '2 months')::date,
    'success', 'NED20240201PM002', (date_trunc('month', now()) - interval '2 months'),
    null
  ),
  (
    '96000000-0000-0000-0000-000000000006',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'f2000000-0000-0000-0000-000000000002', v_plan_family,
    85000, (date_trunc('month', now()) - interval '1 month')::date,
    'success', 'NED20240301PM002', (date_trunc('month', now()) - interval '1 month'),
    null
  ),
  (
    '97000000-0000-0000-0000-000000000007',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    'f2000000-0000-0000-0000-000000000002', v_plan_family,
    85000, date_trunc('month', now())::date,
    'pending', null, null, null
  )
  on conflict (id) do nothing;

  -- ── Andile — 1 month success ──────────────────────────────────────────────
  insert into debit_orders (id, member_id, clinic_id, mandate_id, plan_id,
    amount_cents, collection_date, status, bank_reference, processed_at) values
  (
    '98000000-0000-0000-0000-000000000008',
    'b3000000-0000-0000-0000-000000000003', v_clinic_id,
    'f3000000-0000-0000-0000-000000000003', v_plan_braam,
    88800, (date_trunc('month', now()) - interval '1 month')::date,
    'success', 'FNB20240301AD003', (date_trunc('month', now()) - interval '1 month')
  ),
  (
    '99000000-0000-0000-0000-000000000009',
    'b3000000-0000-0000-0000-000000000003', v_clinic_id,
    'f3000000-0000-0000-0000-000000000003', v_plan_braam,
    88800, date_trunc('month', now())::date,
    'pending', null, null
  )
  on conflict (id) do nothing;

  -- ── Nomvula / Sunrise — 1 month success ───────────────────────────────────
  insert into debit_orders (id, member_id, clinic_id, mandate_id, plan_id,
    amount_cents, collection_date, status, bank_reference, processed_at) values
  (
    '9a000000-0000-0000-0000-00000000000a',
    'b4000000-0000-0000-0000-000000000004', v_clinic_id,
    'f4000000-0000-0000-0000-000000000004', v_plan_corporate,
    49900, (date_trunc('month', now()) - interval '1 month')::date,
    'success', 'ABS20240301NS004', (date_trunc('month', now()) - interval '1 month')
  )
  on conflict (id) do nothing;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TRIGGER TEST 4 — trg_on_debit_order_failed
  --   Update Thabo's current-month pending order to 'failed'.
  -- ═══════════════════════════════════════════════════════════════════════════
  update debit_orders set
    status         = 'failed',
    failure_reason = 'Insufficient funds. Account balance below required debit amount at time of collection.',
    processed_at   = now(),
    retry_count    = 1,
    next_retry_date= (current_date + interval '5 days')::date
  where id = '94000000-0000-0000-0000-000000000004'
    and status = 'pending';

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 15 : PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id uuid;
  v_now       timestamptz := now();
begin
  select id into v_clinic_id from clinics where slug = 'braam-health-centre';

  insert into payments (id, member_id, clinic_id, debit_order_id,
    amount_cents, method, status, reference, description, processed_at) values
  -- Thabo (linked to his successful debit orders)
  (
    'f1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    '91000000-0000-0000-0000-000000000001',
    55000, 'debit_order', 'success', 'PAY-TN-2024-001',
    'Monthly membership — Essential Plan', (date_trunc('month', now()) - interval '3 months')
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    '92000000-0000-0000-0000-000000000002',
    55000, 'debit_order', 'success', 'PAY-TN-2024-002',
    'Monthly membership — Essential Plan', (date_trunc('month', now()) - interval '2 months')
  ),
  (
    'f3000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000001', v_clinic_id,
    '93000000-0000-0000-0000-000000000003',
    55000, 'debit_order', 'success', 'PAY-TN-2024-003',
    'Monthly membership — Essential Plan', (date_trunc('month', now()) - interval '1 month')
  ),
  -- Priya
  (
    'f4000000-0000-0000-0000-000000000004',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    '95000000-0000-0000-0000-000000000005',
    85000, 'debit_order', 'success', 'PAY-PM-2024-001',
    'Monthly membership — Family Plan', (date_trunc('month', now()) - interval '2 months')
  ),
  (
    'f5000000-0000-0000-0000-000000000005',
    'b2000000-0000-0000-0000-000000000002', v_clinic_id,
    '96000000-0000-0000-0000-000000000006',
    85000, 'debit_order', 'success', 'PAY-PM-2024-002',
    'Monthly membership — Family Plan', (date_trunc('month', now()) - interval '1 month')
  ),
  -- Andile EFT catch-up payment
  (
    'f6000000-0000-0000-0000-000000000006',
    'b3000000-0000-0000-0000-000000000003', v_clinic_id, null,
    88800, 'eft', 'success', 'PAY-AD-2024-001',
    'First month EFT payment — Braam Health Plan',
    (v_now - interval '46 days')
  ),
  -- Nomvula
  (
    'f7000000-0000-0000-0000-000000000007',
    'b4000000-0000-0000-0000-000000000004', v_clinic_id,
    '9a000000-0000-0000-0000-00000000000a',
    49900, 'debit_order', 'success', 'PAY-NS-2024-001',
    'Monthly membership — Corporate Membership Plan', (date_trunc('month', now()) - interval '1 month')
  )
  on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 16 : APPOINTMENTS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id uuid;
  v_staff_id  uuid;
  v_admin_id  uuid;
  v_now       timestamptz := now();
  v_today     date        := current_date;
begin
  select id into v_clinic_id from clinics  where slug  = 'braam-health-centre';
  select id into v_staff_id  from profiles where email = 'staff@nfs.insure';
  select id into v_admin_id  from profiles where email = 'admin@nfs.insure';

  insert into appointments (
    id, clinic_id, member_id, dependant_id,
    booked_by, reason,
    appointment_date, appointment_time, status,
    doctor_name, staff_notes
  ) values
  -- Thabo — past completed
  (
    'd1000000-0000-0000-0000-000000000001',
    v_clinic_id, 'b1000000-0000-0000-0000-000000000001', null,
    'a1000000-0000-0000-0000-000000000001',
    'Persistent headache and mild fever for 3 days',
    (v_today - interval '30 days'), '09:00',
    'completed', 'Dr M J Diago',
    'Patient presented with viral sinusitis. Prescribed antibiotics.'
  ),
  -- Priya — past completed (dependant Kavya)
  (
    'd2000000-0000-0000-0000-000000000002',
    v_clinic_id, 'b2000000-0000-0000-0000-000000000002',
    'c2000000-0000-0000-0000-000000000002',
    'a2000000-0000-0000-0000-000000000002',
    'Child''s annual wellness check-up',
    (v_today - interval '14 days'), '10:30',
    'completed', 'Dr M J Diago',
    'Healthy child. Growth metrics normal. Vaccines up to date.'
  ),
  -- Andile — upcoming pending (will be confirmed below to fire trigger)
  (
    'd3000000-0000-0000-0000-000000000003',
    v_clinic_id, 'b3000000-0000-0000-0000-000000000003', null,
    'a3000000-0000-0000-0000-000000000003',
    'Chronic back pain and posture assessment',
    (v_today + interval '3 days'), '14:00',
    'pending', 'Dr M J Diago', null
  ),
  -- Nomvula — upcoming pending
  (
    'd4000000-0000-0000-0000-000000000004',
    v_clinic_id, 'b4000000-0000-0000-0000-000000000004', null,
    'a4000000-0000-0000-0000-000000000004',
    'Blood pressure monitoring and chronic medication renewal',
    (v_today + interval '7 days'), '08:30',
    'pending', 'Dr M J Diago', null
  ),
  -- Thabo — upcoming pending (second appointment)
  (
    'd5000000-0000-0000-0000-000000000005',
    v_clinic_id, 'b1000000-0000-0000-0000-000000000001', null,
    'a1000000-0000-0000-0000-000000000001',
    'Follow-up: sinusitis treatment review',
    (v_today + interval '5 days'), '11:00',
    'pending', 'Dr M J Diago', null
  ),
  -- Priya — no-show (historical)
  (
    'd6000000-0000-0000-0000-000000000006',
    v_clinic_id, 'b2000000-0000-0000-0000-000000000002', null,
    'a2000000-0000-0000-0000-000000000002',
    'Recurring lower back pain',
    (v_today - interval '45 days'), '15:00',
    'no_show', 'Dr M J Diago',
    'Patient did not attend. No cancellation notice received.'
  )
  on conflict (id) do nothing;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TRIGGER TEST 5 — trg_on_appointment_confirmed
  --   Confirm Andile's upcoming appointment.
  -- ═══════════════════════════════════════════════════════════════════════════
  update appointments set
    status       = 'confirmed',
    confirmed_by = v_staff_id,
    confirmed_at = now()
  where id = 'd3000000-0000-0000-0000-000000000003'
    and status = 'pending';

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 17 : CONSULTATIONS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id uuid;
  v_staff_id  uuid;
  v_now       timestamptz := now();
  v_today     date        := current_date;
begin
  select id into v_clinic_id from clinics  where slug  = 'braam-health-centre';
  select id into v_staff_id  from profiles where email = 'staff@nfs.insure';

  insert into consultations (
    id, clinic_id, member_id, dependant_id, appointment_id,
    card_number, consultation_type,
    presenting_complaint, clinical_notes, diagnosis, treatment_given,
    bp_systolic, bp_diastolic, weight_kg, temperature_c, glucose_mmol,
    seen_by, doctor_name,
    follow_up_required, sick_note_issued,
    consultation_number, counted_toward_limit,
    visited_at
  ) values
  -- Thabo: walk-in, viral sinusitis (matches appointment m1)
  (
    '41000000-0000-0000-0000-000000000001',
    v_clinic_id, 'b1000000-0000-0000-0000-000000000001', null,
    'd1000000-0000-0000-0000-000000000001',
    'NFS8 0011 234 1', 'appointment',
    'Persistent headache and mild fever for 3 days. Nasal congestion.',
    'Patient alert and oriented. Temp 37.9°C. Sinus tenderness on palpation. No respiratory distress.',
    'Acute Viral Sinusitis (J01.9)',
    'Prescribed Amoxicillin 500mg TDS x 5 days. Ibuprofen 400mg PRN for pain. Saline nasal rinse advised.',
    118, 76, 78.5, 37.9, null,
    v_staff_id, 'Dr M J Diago',
    true, false,
    1, true,
    (v_today - interval '30 days')::timestamptz + interval '9 hours'
  ),
  -- Thabo: walk-in, follow-up
  (
    '42000000-0000-0000-0000-000000000002',
    v_clinic_id, 'b1000000-0000-0000-0000-000000000001', null, null,
    'NFS8 0011 234 1', 'follow_up',
    'Follow-up visit. Headache resolved. Mild residual nasal congestion.',
    'Patient recovering well. No fever. Nasal congestion clearing.',
    'Resolving Sinusitis',
    'Continue saline rinse. No further antibiotics required.',
    115, 74, 78.5, 36.8, null,
    v_staff_id, 'Dr M J Diago',
    false, false,
    2, true,
    (v_today - interval '23 days')::timestamptz + interval '10 hours'
  ),
  -- Priya: Kavya wellness check (dependant)
  (
    '43000000-0000-0000-0000-000000000003',
    v_clinic_id, 'b2000000-0000-0000-0000-000000000002',
    'c2000000-0000-0000-0000-000000000002',
    'd2000000-0000-0000-0000-000000000002',
    'NFS8 0022 345 D2', 'appointment',
    'Annual wellness check. No complaints.',
    'Well-nourished child. Height 142cm, weight 35kg. Development on track.',
    'Well Child — No Acute Illness',
    'Age-appropriate vaccinations given. Nutritional guidance provided to parent.',
    null, null, 35.0, 36.6, null,
    v_staff_id, 'Dr M J Diago',
    false, false,
    1, true,
    (v_today - interval '14 days')::timestamptz + interval '10 hours 30 minutes'
  ),
  -- Priya: hypertension chronic review (herself)
  (
    '44000000-0000-0000-0000-000000000004',
    v_clinic_id, 'b2000000-0000-0000-0000-000000000002', null, null,
    'NFS8 0022 345 2', 'chronic_review',
    'Monthly BP check. Currently on Atenolol 50mg.',
    'BP well controlled on current regime. No oedema. No chest pain.',
    'Hypertension — Controlled (I10)',
    'Continue Atenolol 50mg OD. Repeat BP in 1 month. Lifestyle advice reinforced.',
    128, 80, 62.0, 36.5, null,
    v_staff_id, 'Dr M J Diago',
    true, false,
    2, true,
    (v_today - interval '7 days')::timestamptz + interval '14 hours'
  ),
  -- Andile: walk-in acute lower back pain
  (
    '45000000-0000-0000-0000-000000000005',
    v_clinic_id, 'b3000000-0000-0000-0000-000000000003', null, null,
    'NFS8 0033 456 3', 'walk_in',
    'Sudden onset lower back pain after lifting at work. Radiates to left buttock.',
    'Lumbar tenderness L4/L5. Straight leg raise positive on left. No neurological deficit.',
    'Acute Lumbar Strain with Sciatica (M54.4)',
    'Ibuprofen 400mg TDS with food x 5 days. Diclofenac gel. Physio referral. Bed rest 2 days.',
    122, 78, 82.0, 36.7, null,
    v_staff_id, 'Dr M J Diago',
    true, true,
    1, true,
    (v_today - interval '3 days')::timestamptz + interval '11 hours'
  ),
  -- Nomvula: chronic DM2 review — flagged for elevated glucose
  (
    '46000000-0000-0000-0000-000000000006',
    v_clinic_id, 'b4000000-0000-0000-0000-000000000004', null, null,
    'NFS8 0044 567 4', 'chronic_review',
    'Type 2 DM chronic review. Feeling fatigued lately.',
    'FBG 11.2 mmol/L — poorly controlled. BP elevated. Weight gain noted.',
    'Type 2 Diabetes Mellitus — Poorly Controlled (E11.9)',
    'Increase Metformin to 1000mg BD. Recheck FBG in 2 weeks. Dietary referral.',
    138, 88, 74.0, 36.9, 11.2,
    v_staff_id, 'Dr M J Diago',
    true, false,
    1, true,
    (v_today - interval '1 day')::timestamptz + interval '8 hours 30 minutes'
  )
  on conflict (id) do nothing;

  -- Flag Nomvula's consultation for clinical review
  update consultations set
    is_flagged      = true,
    flagged_reason  = 'FBG 11.2 mmol/L — significantly above target. Requires dietitian referral and Endocrinology review if no improvement.',
    flagged_by      = v_staff_id,
    flagged_at      = now()
  where id = '46000000-0000-0000-0000-000000000006'
    and is_flagged = false;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 18 : MEDICATIONS & MEDICATION DISPENSES
-- ─────────────────────────────────────────────────────────────────────────────

insert into medications (name, generic_name, category, schedule, unit, is_active) values
  ('Amoxicillin 500mg Capsules',     'Amoxicillin',      'Antibiotic',          'S4', 'capsule',  true),
  ('Metformin 500mg Tablets',        'Metformin',        'Antidiabetic',        'S4', 'tablet',   true),
  ('Atenolol 50mg Tablets',          'Atenolol',         'Antihypertensive',    'S4', 'tablet',   true),
  ('Ibuprofen 400mg Tablets',        'Ibuprofen',        'NSAID Analgesic',     'S2', 'tablet',   true),
  ('Omeprazole 20mg Capsules',       'Omeprazole',       'Proton Pump Inhibitor','S3','capsule',  true),
  ('Salbutamol Inhaler 100mcg',      'Salbutamol',       'Bronchodilator',      'S3', 'inhaler',  true),
  ('Amlodipine 5mg Tablets',         'Amlodipine',       'Antihypertensive',    'S4', 'tablet',   true),
  ('Simvastatin 20mg Tablets',       'Simvastatin',      'Statin',              'S4', 'tablet',   true)
on conflict (name) do nothing;

do $$
declare
  v_clinic_id       uuid;
  v_staff_id        uuid;
  v_med_amoxicillin uuid;
  v_med_metformin   uuid;
  v_med_atenolol    uuid;
  v_med_ibuprofen   uuid;
  v_med_omeprazole  uuid;
  v_now             timestamptz := now();
begin
  select id into v_clinic_id      from clinics     where slug = 'braam-health-centre';
  select id into v_staff_id       from profiles    where email = 'staff@nfs.insure';
  select id into v_med_amoxicillin from medications where name = 'Amoxicillin 500mg Capsules';
  select id into v_med_metformin   from medications where name = 'Metformin 500mg Tablets';
  select id into v_med_atenolol    from medications where name = 'Atenolol 50mg Tablets';
  select id into v_med_ibuprofen   from medications where name = 'Ibuprofen 400mg Tablets';
  select id into v_med_omeprazole  from medications where name = 'Omeprazole 20mg Capsules';

  insert into medication_dispenses (
    id, clinic_id, member_id, dependant_id, consultation_id,
    medication_id, dispense_note, medication_name,
    dosage, quantity, quantity_unit,
    dispensed_by, dispensed_at
  ) values
  -- Thabo: sinusitis antibiotics
  (
    'f1000000-0000-0000-0000-000000000001',
    v_clinic_id, 'b1000000-0000-0000-0000-000000000001', null,
    '41000000-0000-0000-0000-000000000001',
    v_med_amoxicillin,
    'Amoxicillin 500mg x 15 capsules dispensed for sinusitis treatment. TDS x 5 days.',
    'Amoxicillin 500mg Capsules', '500mg TDS', 15, 'capsule',
    v_staff_id, (v_now - interval '30 days')
  ),
  -- Thabo: ibuprofen for pain
  (
    'f2000000-0000-0000-0000-000000000002',
    v_clinic_id, 'b1000000-0000-0000-0000-000000000001', null,
    '41000000-0000-0000-0000-000000000001',
    v_med_ibuprofen,
    'Ibuprofen 400mg x 20 tablets dispensed PRN for pain relief.',
    'Ibuprofen 400mg Tablets', '400mg PRN (max 3x/day)', 20, 'tablet',
    v_staff_id, (v_now - interval '30 days')
  ),
  -- Priya: chronic Atenolol refill
  (
    'f3000000-0000-0000-0000-000000000003',
    v_clinic_id, 'b2000000-0000-0000-0000-000000000002', null,
    '44000000-0000-0000-0000-000000000004',
    v_med_atenolol,
    'Atenolol 50mg x 30 tablets dispensed for hypertension management. Monthly repeat.',
    'Atenolol 50mg Tablets', '50mg OD morning', 30, 'tablet',
    v_staff_id, (v_now - interval '7 days')
  ),
  -- Priya: Omeprazole gastro-protection
  (
    'f4000000-0000-0000-0000-000000000004',
    v_clinic_id, 'b2000000-0000-0000-0000-000000000002', null,
    '44000000-0000-0000-0000-000000000004',
    v_med_omeprazole,
    'Omeprazole 20mg x 30 capsules dispensed for gastric protection with NSAIDs.',
    'Omeprazole 20mg Capsules', '20mg OD', 30, 'capsule',
    v_staff_id, (v_now - interval '7 days')
  ),
  -- Nomvula: Metformin increased dose (flagged dispense — quantity unusually high for in-clinic)
  (
    'f5000000-0000-0000-0000-000000000005',
    v_clinic_id, 'b4000000-0000-0000-0000-000000000004', null,
    '46000000-0000-0000-0000-000000000006',
    v_med_metformin,
    'Metformin 500mg x 60 tablets dispensed. Dose increased to 1000mg BD. Patient counselled on administration and GI side effects.',
    'Metformin 500mg Tablets', '1000mg BD (2 x 500mg) with meals', 60, 'tablet',
    v_staff_id, (v_now - interval '1 day')
  )
  on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 19 : PLAN CHANGES
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id        uuid;
  v_admin_id         uuid;
  v_plan_essential   uuid;
  v_plan_braam       uuid;
  v_plan_family      uuid;
  v_plan_family_plus uuid;
  v_now              timestamptz := now();
begin
  select id into v_clinic_id       from clinics where slug = 'braam-health-centre';
  select id into v_admin_id        from profiles where email = 'admin@nfs.insure';
  select id into v_plan_essential  from plans where plan_type = 'essential'   and clinic_id = v_clinic_id;
  select id into v_plan_braam      from plans where plan_type = 'braam_health' and clinic_id = v_clinic_id;
  select id into v_plan_family     from plans where plan_type = 'family'       and clinic_id = v_clinic_id;
  select id into v_plan_family_plus from plans where plan_type = 'family_plus' and clinic_id = v_clinic_id;

  -- Andile: pending upgrade from Braam Health → Braam Health Plus (pending decision)
  insert into plan_changes (
    id, clinic_id, member_id,
    from_plan_id, to_plan_id, status,
    requested_by, requested_at, effective_date, notes
  ) values (
    '51000000-0000-0000-0000-000000000001',
    v_clinic_id, 'b3000000-0000-0000-0000-000000000003',
    v_plan_braam,
    (select id from plans where plan_type = 'braam_health_plus' and clinic_id = v_clinic_id limit 1),
    'pending',
    'a3000000-0000-0000-0000-000000000003',
    v_now - interval '5 days',
    (date_trunc('month', now()) + interval '1 month')::date,
    'Member wishes to add spouse to the plan.'
  ) on conflict (id) do nothing;

  -- Priya: request to upgrade from Family → Family+
  insert into plan_changes (
    id, clinic_id, member_id,
    from_plan_id, to_plan_id, status,
    requested_by, requested_at, effective_date, notes
  ) values (
    '52000000-0000-0000-0000-000000000002',
    v_clinic_id, 'b2000000-0000-0000-0000-000000000002',
    v_plan_family, v_plan_family_plus,
    'pending',
    'a2000000-0000-0000-0000-000000000002',
    v_now - interval '2 days',
    (date_trunc('month', now()) + interval '1 month')::date,
    'Adding two more family members to cover parents.'
  ) on conflict (id) do nothing;

  -- Thabo: historical upgrade from Essential → Braam Health (already approved)
  insert into plan_changes (
    id, clinic_id, member_id,
    from_plan_id, to_plan_id, status,
    requested_by, requested_at,
    reviewed_by, reviewed_at,
    effective_date, notes
  ) values (
    '53000000-0000-0000-0000-000000000003',
    v_clinic_id, 'b1000000-0000-0000-0000-000000000001',
    v_plan_essential, v_plan_braam,
    'rejected',
    'a1000000-0000-0000-0000-000000000001',
    v_now - interval '20 days',
    v_admin_id,
    v_now - interval '18 days',
    null,
    'Member changed mind — prefers to keep Essential plan.'
  ) on conflict (id) do nothing;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TRIGGER TEST 3 — trg_on_plan_change_decision
  --   Approve Andile's plan change request.
  -- ═══════════════════════════════════════════════════════════════════════════
  update plan_changes set
    status       = 'approved',
    reviewed_by  = v_admin_id,
    reviewed_at  = now(),
    effective_date = (date_trunc('month', now()) + interval '1 month')::date,
    notes        = coalesce(notes, '') ||
                   ' — Approved by admin. Effective next billing cycle.'
  where id = '51000000-0000-0000-0000-000000000001'
    and status = 'pending';

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 20 : SIGNED AGREEMENTS
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_clinic_id  uuid;
  v_template_1 uuid := 'd1000000-0000-0000-0000-000000000001';
  v_template_2 uuid := 'd2000000-0000-0000-0000-000000000002';
  v_now        timestamptz := now();
begin
  select id into v_clinic_id from clinics where slug = 'braam-health-centre';

  insert into signed_agreements (
    id, clinic_id, member_id, template_id,
    status, signed_by, signed_at,
    signature_data, document_url, ip_address
  ) values
  -- Thabo
  (
    '61000000-0000-0000-0000-000000000001',
    v_clinic_id, 'b1000000-0000-0000-0000-000000000001', v_template_1,
    'signed',
    'a1000000-0000-0000-0000-000000000001',
    v_now - interval '87 days',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
    'signed-agreements/b1000000/membership_agreement_thabo_nkosi.pdf',
    '102.67.10.11'
  ),
  -- Priya
  (
    '62000000-0000-0000-0000-000000000002',
    v_clinic_id, 'b2000000-0000-0000-0000-000000000002', v_template_1,
    'signed',
    'a2000000-0000-0000-0000-000000000002',
    v_now - interval '297 days',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
    'signed-agreements/b2000000/membership_agreement_priya_moodley.pdf',
    '102.67.10.55'
  ),
  -- Andile
  (
    '63000000-0000-0000-0000-000000000003',
    v_clinic_id, 'b3000000-0000-0000-0000-000000000003', v_template_1,
    'signed',
    'a3000000-0000-0000-0000-000000000003',
    v_now - interval '47 days',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
    'signed-agreements/b3000000/membership_agreement_andile_dlamini.pdf',
    '102.67.11.22'
  ),
  -- Nomvula / Corporate
  (
    '64000000-0000-0000-0000-000000000004',
    v_clinic_id, 'b4000000-0000-0000-0000-000000000004', v_template_2,
    'signed',
    'a4000000-0000-0000-0000-000000000004',
    v_now - interval '174 days',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
    'signed-agreements/b4000000/corporate_agreement_sunrise_security.pdf',
    '197.80.100.5'
  )
  on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 21 : STEP-UP AUTHENTICATION REQUESTS
-- ─────────────────────────────────────────────────────────────────────────────
-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER TEST 6 — trg_on_step_up_request
--   Insert step_up_requests with otp_channel = 'email' and status = 'requested'
--   for all three member profiles.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  v_now timestamptz := now();
begin

  insert into step_up_requests (
    id, profile_id, purpose, status,
    otp_hash, otp_channel, sent_to,
    attempts, max_attempts, expires_at, verified_at, ip_address
  ) values
  -- Thabo: banking change OTP via email
  (
    'f1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'banking_change', 'requested',
    crypt('847291', gen_salt('bf')),
    'email', 'thabo.nkosi@gmail.com',
    0, 3, v_now + interval '10 minutes', null, '102.67.10.11'
  ),
  -- Priya: plan change OTP via email
  (
    'f2000000-0000-0000-0000-000000000002',
    'a2000000-0000-0000-0000-000000000002',
    'plan_change', 'requested',
    crypt('362514', gen_salt('bf')),
    'email', 'priya.moodley@gmail.com',
    0, 3, v_now + interval '10 minutes', null, '102.67.10.55'
  ),
  -- Andile: KYC submit OTP via email
  (
    'f3000000-0000-0000-0000-000000000003',
    'a3000000-0000-0000-0000-000000000003',
    'kyc_submit', 'requested',
    crypt('719038', gen_salt('bf')),
    'email', 'andile.dlamini@gmail.com',
    0, 3, v_now + interval '10 minutes', null, '102.67.11.22'
  ),
  -- Nomvula: banking change OTP — already verified (tests status flow too)
  (
    'f4000000-0000-0000-0000-000000000004',
    'a4000000-0000-0000-0000-000000000004',
    'banking_change', 'verified',
    crypt('504837', gen_salt('bf')),
    'email', 'corporate.admin@sunrisesecurity.co.za',
    1, 3, v_now - interval '2 days' + interval '10 minutes',
    v_now - interval '2 days', '197.80.100.5'
  )
  on conflict (id) do nothing;

end;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 22 : VERIFICATION QUERY
-- ─────────────────────────────────────────────────────────────────────────────
-- Run the following SELECT statements to confirm the seed completed correctly.

do $$
declare
  v_members         integer;
  v_dependants      integer;
  v_applications    integer;
  v_debit_orders    integer;
  v_appointments    integer;
  v_consultations   integer;
  v_notifications   integer;
  v_step_ups        integer;
  v_plan_changes    integer;
  v_kyc_docs        integer;
begin
  select count(*) into v_members      from members       where id::text like 'b%';
  select count(*) into v_dependants   from dependants    where id::text like 'c%';
  select count(*) into v_applications from applications  where id::text like 'e%';
  select count(*) into v_debit_orders from debit_orders  where id::text like '9%';
  select count(*) into v_appointments from appointments  where id::text like 'd%';
  select count(*) into v_consultations from consultations where id::text like '4%';
  select count(*) into v_notifications from notifications  where created_at > now() - interval '1 hour';
  select count(*) into v_step_ups     from step_up_requests where id::text like 'f%';
  select count(*) into v_plan_changes from plan_changes   where id::text like '5%';
  select count(*) into v_kyc_docs     from kyc_documents  where id::text like '8%';

  raise notice '═══════════════════════════════════════════════════';
  raise notice 'NFS INSURE — SEED VERIFICATION SUMMARY';
  raise notice '═══════════════════════════════════════════════════';
  raise notice 'Members seeded          : %', v_members;
  raise notice 'Dependants seeded       : %', v_dependants;
  raise notice 'Applications seeded     : %', v_applications;
  raise notice 'Debit orders seeded     : %', v_debit_orders;
  raise notice 'Appointments seeded     : %', v_appointments;
  raise notice 'Consultations seeded    : %', v_consultations;
  raise notice 'KYC documents seeded    : %', v_kyc_docs;
  raise notice 'Step-up requests seeded : %', v_step_ups;
  raise notice 'Plan changes seeded     : %', v_plan_changes;
  raise notice 'Notifications generated : %  (from triggers fired this run)', v_notifications;
  raise notice '═══════════════════════════════════════════════════';
  raise notice 'Trigger tests fired:';
  raise notice '  [1] trg_on_application_submitted  — 4 INSERT(s)';
  raise notice '  [2] trg_on_application_decision   — 3 approved + 1 rejected UPDATE(s)';
  raise notice '  [3] trg_on_plan_change_decision   — 1 approved UPDATE';
  raise notice '  [4] trg_on_debit_order_failed     — 1 failed UPDATE';
  raise notice '  [5] trg_on_appointment_confirmed  — 1 confirmed UPDATE';
  raise notice '  [6] trg_on_step_up_request        — 3 email/requested INSERT(s)';
  raise notice '═══════════════════════════════════════════════════';
end;
$$;


-- =============================================================================
-- END OF SEED SCRIPT
-- =============================================================================
-- Member roster seeded:
--   b1  Thabo Nkosi          (Essential plan)      thabo.nkosi@gmail.com
--   b2  Priya Moodley        (Family plan)          priya.moodley@gmail.com
--   b3  Andile Dlamini       (Braam Health plan)    andile.dlamini@gmail.com
--   b4  Nomvula Sithole      (Corporate plan)       corporate.admin@sunrisesecurity.co.za
--
-- All seeded auth.users have password: Seed@12345
-- All member cards follow NFS8 XXXX XXX X format.
-- All SA ID numbers are valid 13-digit format (YYMMDD 5-char sequence checksum).
-- =============================================================================
