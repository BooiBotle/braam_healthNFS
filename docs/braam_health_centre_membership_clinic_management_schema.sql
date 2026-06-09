-- =============================================================================
-- NFS INSURE | BRAAM HEALTH CENTRE
-- Complete Supabase Schema
-- Version: 1.0  |  Date: 2026-05-24
-- Covers: All DB tables, indexes, RLS policies, views, functions,
--         triggers, storage buckets, and seed/config data
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";       -- fuzzy text search
create extension if not exists "unaccent";       -- accent-insensitive search
create extension if not exists "moddatetime";    -- auto-updated_at trigger


-- =============================================================================
-- SECTION 1: ENUMS
-- =============================================================================

create type member_status      as enum ('pending', 'active', 'suspended', 'cancelled', 'deceased');
create type plan_type          as enum (
  'essential', 'couple', 'family', 'family_plus',
  'senior_care', 'corporate',
  'basic_health', 'braam_health', 'braam_health_plus',
  'corporate_membership', 'chronic_medication'
);
create type application_status as enum ('submitted', 'awaiting_approval', 'approved', 'rejected', 'cancelled');
create type application_type   as enum ('individual', 'corporate');
create type kyc_status         as enum ('not_submitted', 'pending_review', 'approved', 'rejected', 'resubmission_requested');
create type kyc_doc_type       as enum ('sa_id', 'proof_of_address', 'payslip', 'bank_statement', 'passport', 'other');
create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type debit_order_status as enum ('pending', 'success', 'failed', 'reversed', 'cancelled');
create type plan_change_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type card_status        as enum ('pending', 'active', 'suspended', 'cancelled', 'lost');
create type gender             as enum ('male', 'female', 'other', 'prefer_not_to_say');
create type relationship_type  as enum ('spouse', 'partner', 'child', 'parent', 'sibling', 'other');
create type mandate_status     as enum ('pending', 'signed', 'cancelled', 'expired');
create type agreement_status   as enum ('pending', 'signed', 'expired', 'revoked');
create type notification_channel as enum ('email', 'sms', 'whatsapp', 'in_app');
create type notification_status  as enum ('pending', 'sent', 'failed', 'delivered', 'read');
create type cross_sell_stage   as enum ('identified', 'contacted', 'proposal_sent', 'converted', 'not_interested');
create type consultation_type  as enum ('walk_in', 'appointment', 'emergency', 'chronic_review', 'follow_up');
create type portal_role        as enum ('member', 'staff', 'admin', 'super_admin');
create type step_up_purpose    as enum ('banking_change', 'kyc_submit', 'plan_change', 'account_delete');
create type step_up_status     as enum ('requested', 'verified', 'expired', 'failed');
create type payment_method     as enum ('debit_order', 'card', 'eft', 'cash', 'other');
create type payment_status     as enum ('pending', 'success', 'failed', 'refunded', 'reversed');
create type export_format      as enum ('csv', 'pdf', 'xlsx');
create type report_type        as enum (
  'member_list', 'consultation_summary', 'revenue_summary',
  'kyc_status', 'plan_distribution', 'debit_order_performance',
  'retention', 'medication_register'
);
create type integration_name   as enum ('yoco', 'whatsapp', 'naedo', 'debicheck', 'google_wallet', 'sms_otp', 'email');
create type integration_status as enum ('active', 'inactive', 'error', 'pending_config');
create type consent_purpose    as enum (
  'identity_verification', 'medical_records', 'billing_debit_order',
  'membership_card', 'marketing_email', 'marketing_sms',
  'third_party_sharing', 'analytics'
);


-- =============================================================================
-- SECTION 2: LOOKUP / CONFIG TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2.1  Clinics  (multi-clinic architecture)
-- ---------------------------------------------------------------------------
create table clinics (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,               -- e.g. 'braam-health-centre'
  address_line1 text,
  address_line2 text,
  suburb        text,
  city          text,
  province      text,
  postal_code   text,
  country       text not null default 'ZA',
  phone         text,
  email         text,
  whatsapp      text,
  doctor_name   text,
  specialty     text default 'General Practice',
  open_24h      boolean not null default true,
  latitude      numeric(10,7),
  longitude     numeric(10,7),
  logo_url      text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Seed: Braam Health Centre
insert into clinics (name, slug, address_line1, address_line2, suburb, city, province, postal_code,
                     phone, email, whatsapp, doctor_name, open_24h)
values ('Braam Health Centre', 'braam-health-centre',
        'Eagle Canyon Office Park', 'Cnr Christiaan De Wet & Dolfyn St',
        'Randpark Ridge', 'Johannesburg', 'Gauteng', '2154',
        '+27100110010', 'info@nfs.insure', '+27100110010',
        'Dr M J Diago', true);


-- ---------------------------------------------------------------------------
-- 2.2  Membership Plans
-- ---------------------------------------------------------------------------
create table plans (
  id                  uuid primary key default uuid_generate_v4(),
  clinic_id           uuid references clinics(id) on delete cascade,
  plan_type           plan_type not null,
  name                text not null,
  description         text,
  monthly_fee_cents   integer not null,              -- stored in cents (R550 = 55000)
  max_members         integer not null default 1,
  consultations_pm    integer not null default 3,    -- per month; -1 = unlimited
  includes_medication boolean not null default true,
  includes_24h_access boolean not null default true,
  includes_chronic    boolean not null default false,
  min_employees       integer,                       -- for corporate plans
  age_min             integer,                       -- for senior_care
  is_active           boolean not null default true,
  is_coming_soon      boolean not null default false,
  display_order       integer not null default 0,
  most_popular        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Seed plans
insert into plans (clinic_id, plan_type, name, monthly_fee_cents, max_members, consultations_pm,
                   includes_medication, includes_24h_access, includes_chronic, display_order, most_popular)
select c.id, v.plan_type::plan_type, v.name, v.fee, v.max_m, v.consults, true, true, v.chronic, v.ord, v.pop
from clinics c, (values
  ('essential',            'Essential',                  55000,  1, 3,  false, 1, false),
  ('couple',               'Couple',                     72000,  2, 6,  false, 2, false),
  ('family',               'Family',                     85000,  4, 12, false, 3, false),
  ('family_plus',          'Family+',                   115000,  6, 18, false, 4, true),
  ('senior_care',          'Senior Care',                65000,  1, 4,  true,  5, false),
  ('corporate',            'Corporate',                  48000,  1, 3,  false, 6, false),
  ('basic_health',         'Basic Health Membership',    59900,  1, 3,  false, 7, false),
  ('braam_health',         'Braam Health Membership',    88800,  1, 3,  false, 8, false),
  ('braam_health_plus',    'Braam Health Plus+',        133300,  2, 6,  false, 9, false),
  ('corporate_membership', 'Corporate Membership',       49900,  1, 3,  false, 10, false),
  ('chronic_medication',   'Chronic Medication Programme', 0,   1, 0,  true,  11, false)
) as v(plan_type, name, fee, max_m, consults, chronic, ord, pop)
where c.slug = 'braam-health-centre';


-- =============================================================================
-- SECTION 3: USER / IDENTITY TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3.1  Profiles  (extends Supabase auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  clinic_id       uuid references clinics(id),
  portal_role     portal_role not null default 'member',
  first_name      text,
  last_name       text,
  full_name       text generated always as (
                    coalesce(first_name, '') || ' ' || coalesce(last_name, '')
                  ) stored,
  sa_id_number    text unique,
  passport_number text,
  date_of_birth   date,
  gender          gender,
  phone           text,
  email           text,
  address_line1   text,
  address_line2   text,
  suburb          text,
  city            text,
  province        text,
  postal_code     text,
  country         text default 'ZA',
  avatar_url      text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_profiles_clinic_id   on profiles(clinic_id);
create index idx_profiles_sa_id       on profiles(sa_id_number);
create index idx_profiles_phone       on profiles(phone);
create index idx_profiles_portal_role on profiles(portal_role);
create index idx_profiles_full_name   on profiles using gin(full_name gin_trgm_ops);


-- ---------------------------------------------------------------------------
-- 3.2  Members  (health membership record, separate from auth profile)
-- ---------------------------------------------------------------------------
create table members (
  id                  uuid primary key default uuid_generate_v4(),
  profile_id          uuid not null references profiles(id) on delete cascade,
  clinic_id           uuid not null references clinics(id),
  plan_id             uuid not null references plans(id),
  card_number         text unique,                  -- NFS8 9012 3456 7
  status              member_status not null default 'pending',
  member_since        date,
  debit_day           integer not null default 1 check (debit_day between 1 and 28),
  kyc_status          kyc_status not null default 'not_submitted',
  popia_consent       boolean not null default false,
  popia_consent_at    timestamptz,
  popia_consent_version text,
  notes               text,
  -- banking
  bank_name           text,
  account_holder      text,
  account_number      text,
  account_type        text,
  branch_code         text,
  banking_verified_at timestamptz,
  -- corporate
  is_corporate        boolean not null default false,
  company_name        text,
  -- internal flags
  consultation_limit_alert boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_members_profile_id  on members(profile_id);
create index idx_members_clinic_id   on members(clinic_id);
create index idx_members_plan_id     on members(plan_id);
create index idx_members_status      on members(status);
create index idx_members_card_number on members(card_number);


-- ---------------------------------------------------------------------------
-- 3.3  Dependants
-- ---------------------------------------------------------------------------
create table dependants (
  id               uuid primary key default uuid_generate_v4(),
  member_id        uuid not null references members(id) on delete cascade,
  clinic_id        uuid not null references clinics(id),
  first_name       text not null,
  last_name        text not null,
  full_name        text generated always as (first_name || ' ' || last_name) stored,
  relationship     relationship_type not null,
  sa_id_number     text,
  date_of_birth    date,
  gender           gender,
  phone            text,
  status           member_status not null default 'active',
  -- own card
  card_number      text unique,
  card_status      card_status not null default 'pending',
  added_at         timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_dependants_member_id on dependants(member_id);
create index idx_dependants_clinic_id on dependants(clinic_id);


-- =============================================================================
-- SECTION 4: APPLICATIONS & ONBOARDING
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 4.1  Applications
-- ---------------------------------------------------------------------------
create table applications (
  id                uuid primary key default uuid_generate_v4(),
  clinic_id         uuid not null references clinics(id),
  profile_id        uuid references profiles(id),
  plan_id           uuid not null references plans(id),
  application_type  application_type not null default 'individual',
  status            application_status not null default 'submitted',
  -- applicant snapshot (in case profile not yet created)
  applicant_name    text,
  applicant_phone   text,
  applicant_email   text,
  applicant_id_number text,
  -- corporate
  company_name      text,
  employee_count    integer,
  -- admin
  reviewed_by       uuid references profiles(id),
  reviewed_at       timestamptz,
  rejection_reason  text,
  -- activation
  activated_at      timestamptz,
  member_id         uuid references members(id),
  -- metadata
  source            text default 'self_service',   -- 'self_service' | 'staff_assisted' | 'import'
  ip_address        inet,
  user_agent        text,
  submitted_at      timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_applications_clinic_id   on applications(clinic_id);
create index idx_applications_profile_id  on applications(profile_id);
create index idx_applications_status      on applications(status);
create index idx_applications_submitted   on applications(submitted_at desc);


-- ---------------------------------------------------------------------------
-- 4.2  Onboarding Steps tracker
-- ---------------------------------------------------------------------------
create table onboarding_steps (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references applications(id) on delete cascade,
  member_id       uuid references members(id),
  -- step completion flags
  personal_details_done  boolean not null default false,
  plan_selected_done     boolean not null default false,
  banking_details_done   boolean not null default false,
  popia_consent_done     boolean not null default false,
  kyc_upload_done        boolean not null default false,
  mandate_signed_done    boolean not null default false,
  agreement_signed_done  boolean not null default false,
  payment_setup_done     boolean not null default false,
  -- timestamps
  personal_details_at   timestamptz,
  plan_selected_at      timestamptz,
  banking_details_at    timestamptz,
  popia_consent_at      timestamptz,
  kyc_upload_at         timestamptz,
  mandate_signed_at     timestamptz,
  agreement_signed_at   timestamptz,
  payment_setup_at      timestamptz,
  completed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_onboarding_application_id on onboarding_steps(application_id);
create index idx_onboarding_member_id      on onboarding_steps(member_id);


-- =============================================================================
-- SECTION 5: MEMBERSHIP CARDS
-- =============================================================================

create table member_cards (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid not null references members(id) on delete cascade,
  clinic_id       uuid not null references clinics(id),
  dependant_id    uuid references dependants(id),
  card_number     text not null unique,
  status          card_status not null default 'pending',
  -- QR payload is a signed JWT or hash of card_number for offline verification
  qr_payload      text not null,
  qr_secret       text not null default encode(gen_random_bytes(32), 'hex'),
  -- card image
  card_image_url  text,                             -- storage path
  -- wallet
  google_wallet_pass_url text,
  apple_wallet_pass_url  text,
  issued_at       timestamptz,
  expires_at      timestamptz,
  cancelled_at    timestamptz,
  cancel_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_member_cards_member_id  on member_cards(member_id);
create index idx_member_cards_clinic_id  on member_cards(clinic_id);
create index idx_member_cards_card_num   on member_cards(card_number);
create index idx_member_cards_status     on member_cards(status);


-- =============================================================================
-- SECTION 6: KYC DOCUMENTS
-- =============================================================================

create table kyc_documents (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid not null references members(id) on delete cascade,
  clinic_id       uuid not null references clinics(id),
  doc_type        kyc_doc_type not null,
  file_path       text not null,                    -- supabase storage path
  file_name       text,
  file_size_bytes integer,
  mime_type       text,
  status          kyc_status not null default 'pending_review',
  reviewed_by     uuid references profiles(id),
  reviewed_at     timestamptz,
  rejection_reason text,
  expires_at      timestamptz,                      -- for time-sensitive docs
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_kyc_documents_member_id  on kyc_documents(member_id);
create index idx_kyc_documents_clinic_id  on kyc_documents(clinic_id);
create index idx_kyc_documents_doc_type   on kyc_documents(doc_type);
create index idx_kyc_documents_status     on kyc_documents(status);


-- =============================================================================
-- SECTION 7: POPIA CONSENT
-- =============================================================================

create table popia_consents (
  id                uuid primary key default uuid_generate_v4(),
  member_id         uuid not null references members(id) on delete cascade,
  profile_id        uuid not null references profiles(id),
  clinic_id         uuid not null references clinics(id),
  consent_version   text not null default '2024-v1',
  consented_at      timestamptz not null default now(),
  ip_address        inet,
  user_agent        text,
  created_at        timestamptz not null default now()
);

create index idx_popia_consents_member_id  on popia_consents(member_id);
create index idx_popia_consents_profile_id on popia_consents(profile_id);
create index idx_popia_consents_clinic_id  on popia_consents(clinic_id);


-- ---------------------------------------------------------------------------
-- 7.1  Individual consent purpose records
-- ---------------------------------------------------------------------------
create table popia_consent_purposes (
  id               uuid primary key default uuid_generate_v4(),
  consent_id       uuid not null references popia_consents(id) on delete cascade,
  purpose          consent_purpose not null,
  is_required      boolean not null default false,
  granted          boolean not null default false,
  created_at       timestamptz not null default now()
);

create index idx_popia_purposes_consent_id on popia_consent_purposes(consent_id);


-- =============================================================================
-- SECTION 8: DEBIT ORDERS & MANDATES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 8.1  Debit Order Mandates
-- ---------------------------------------------------------------------------
create table debit_mandates (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid not null references members(id) on delete cascade,
  clinic_id       uuid not null references clinics(id),
  status          mandate_status not null default 'pending',
  mandate_type    text not null default 'naedo',   -- 'naedo' | 'debicheck'
  -- banking snapshot at time of signing
  bank_name       text not null,
  account_holder  text not null,
  account_number  text not null,
  account_type    text not null,
  branch_code     text not null,
  -- signature
  signed_by       uuid references profiles(id),
  signed_at       timestamptz,
  signature_data  text,                            -- base64 PNG or DocuSign ref
  document_url    text,                            -- storage path
  -- DebiCheck specific
  debicheck_ref   text,
  debicheck_status text,
  -- admin
  captured_by     uuid references profiles(id),
  cancelled_at    timestamptz,
  cancel_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_mandates_member_id on debit_mandates(member_id);
create index idx_mandates_clinic_id on debit_mandates(clinic_id);
create index idx_mandates_status    on debit_mandates(status);


-- ---------------------------------------------------------------------------
-- 8.2  Debit Order Collections
-- ---------------------------------------------------------------------------
create table debit_orders (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid not null references members(id),
  clinic_id       uuid not null references clinics(id),
  mandate_id      uuid references debit_mandates(id),
  plan_id         uuid references plans(id),
  amount_cents    integer not null,
  collection_date date not null,
  status          debit_order_status not null default 'pending',
  -- bank response
  bank_reference  text,
  failure_reason  text,
  retry_count     integer not null default 0,
  next_retry_date date,
  processed_at    timestamptz,
  -- reconciliation
  reconciled      boolean not null default false,
  reconciled_at   timestamptz,
  reconciled_by   uuid references profiles(id),
  batch_id        uuid,                            -- groups same-run collections
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_debit_orders_member_id       on debit_orders(member_id);
create index idx_debit_orders_clinic_id       on debit_orders(clinic_id);
create index idx_debit_orders_status          on debit_orders(status);
create index idx_debit_orders_collection_date on debit_orders(collection_date);
create index idx_debit_orders_reconciled      on debit_orders(reconciled);


-- ---------------------------------------------------------------------------
-- 8.3  Reconciliation Batches
-- ---------------------------------------------------------------------------
create table reconciliation_batches (
  id                  uuid primary key default uuid_generate_v4(),
  clinic_id           uuid not null references clinics(id),
  batch_date          date not null,
  total_expected_cents integer not null default 0,
  total_collected_cents integer not null default 0,
  total_failed_cents  integer not null default 0,
  member_count        integer not null default 0,
  success_count       integer not null default 0,
  failed_count        integer not null default 0,
  collection_rate_pct numeric(5,2),
  notes               text,
  closed_by           uuid references profiles(id),
  closed_at           timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_reconciliation_clinic_date on reconciliation_batches(clinic_id, batch_date desc);


-- =============================================================================
-- SECTION 9: PAYMENTS
-- =============================================================================

create table payments (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid not null references members(id),
  clinic_id       uuid not null references clinics(id),
  debit_order_id  uuid references debit_orders(id),
  amount_cents    integer not null,
  method          payment_method not null default 'debit_order',
  status          payment_status not null default 'pending',
  reference       text,                            -- bank or gateway ref
  -- Yoco specific
  yoco_checkout_id   text,
  yoco_payment_id    text,
  yoco_charge_id     text,
  -- metadata
  description     text,
  processed_at    timestamptz,
  refunded_at     timestamptz,
  refund_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_payments_member_id  on payments(member_id);
create index idx_payments_clinic_id  on payments(clinic_id);
create index idx_payments_status     on payments(status);
create index idx_payments_created    on payments(created_at desc);


-- =============================================================================
-- SECTION 10: APPOINTMENTS
-- =============================================================================

create table appointments (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid not null references clinics(id),
  member_id       uuid not null references members(id),
  dependant_id    uuid references dependants(id),
  booked_by       uuid references profiles(id),           -- member or staff
  reason          text not null,
  appointment_date date not null,
  appointment_time time not null,
  status          appointment_status not null default 'pending',
  -- staff notes
  staff_notes     text,
  attended_by     uuid references profiles(id),           -- staff who saw the patient
  doctor_name     text,
  -- confirmation
  confirmed_at    timestamptz,
  confirmed_by    uuid references profiles(id),
  cancelled_at    timestamptz,
  cancellation_reason text,
  -- notifications
  reminder_sent   boolean not null default false,
  reminder_sent_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_appointments_clinic_id on appointments(clinic_id);
create index idx_appointments_member_id on appointments(member_id);
create index idx_appointments_date      on appointments(appointment_date, appointment_time);
create index idx_appointments_status    on appointments(status);


-- =============================================================================
-- SECTION 11: CONSULTATIONS
-- =============================================================================

create table consultations (
  id                  uuid primary key default uuid_generate_v4(),
  clinic_id           uuid not null references clinics(id),
  member_id           uuid not null references members(id),
  dependant_id        uuid references dependants(id),
  appointment_id      uuid references appointments(id),
  card_number         text,                               -- snapshot at time of visit
  consultation_type   consultation_type not null default 'walk_in',
  -- clinical record
  presenting_complaint text,
  clinical_notes      text,
  diagnosis           text,
  treatment_given     text,
  follow_up_required  boolean not null default false,
  follow_up_notes     text,
  sick_note_issued    boolean not null default false,
  referral_issued     boolean not null default false,
  referral_notes      text,
  -- vitals snapshot
  bp_systolic         integer,
  bp_diastolic        integer,
  weight_kg           numeric(5,2),
  temperature_c       numeric(4,2),
  glucose_mmol        numeric(5,2),
  -- staff
  seen_by             uuid references profiles(id),
  doctor_name         text,
  -- flags
  is_flagged          boolean not null default false,
  flagged_reason      text,
  flagged_by          uuid references profiles(id),
  flagged_at          timestamptz,
  flag_resolved       boolean not null default false,
  flag_resolved_at    timestamptz,
  flag_resolved_by    uuid references profiles(id),
  -- billing
  consultation_number integer,                           -- monthly counter per member
  counted_toward_limit boolean not null default true,
  -- metadata
  visited_at          timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_consultations_clinic_id  on consultations(clinic_id);
create index idx_consultations_member_id  on consultations(member_id);
create index idx_consultations_visited_at on consultations(visited_at desc);
create index idx_consultations_is_flagged on consultations(is_flagged) where is_flagged = true;
create index idx_consultations_month      on consultations(member_id, date_trunc('month', visited_at AT TIME ZONE 'UTC'));


-- =============================================================================
-- SECTION 12: MEDICATION REGISTER
-- =============================================================================

create table medications (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  generic_name text,
  category    text,
  schedule    text,                  -- S0, S1, S2, S3, S4, S5 etc
  unit        text,                  -- 'tablet', 'capsule', 'ml', 'g', 'tube'
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table medication_dispenses (
  id               uuid primary key default uuid_generate_v4(),
  clinic_id        uuid not null references clinics(id),
  member_id        uuid not null references members(id),
  dependant_id     uuid references dependants(id),
  consultation_id  uuid references consultations(id),
  medication_id    uuid references medications(id),
  -- free-text record (matches existing UI)
  dispense_note    text not null,                  -- e.g. "Metformin 500mg x60 tablets dispensed"
  medication_name  text,                           -- denormalised for fast display
  dosage           text,
  quantity         integer,
  quantity_unit    text,
  -- flags
  is_flagged       boolean not null default false,
  flagged_reason   text,
  flagged_by       uuid references profiles(id),
  flagged_at       timestamptz,
  flag_resolved    boolean not null default false,
  -- dispensed by
  dispensed_by     uuid references profiles(id),
  dispensed_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_med_dispenses_clinic_id      on medication_dispenses(clinic_id);
create index idx_med_dispenses_member_id      on medication_dispenses(member_id);
create index idx_med_dispenses_consultation   on medication_dispenses(consultation_id);
create index idx_med_dispenses_dispensed_at   on medication_dispenses(dispensed_at desc);
create index idx_med_dispenses_flagged        on medication_dispenses(is_flagged) where is_flagged = true;


-- =============================================================================
-- SECTION 13: PLAN CHANGES
-- =============================================================================

create table plan_changes (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid not null references clinics(id),
  member_id       uuid not null references members(id),
  from_plan_id    uuid not null references plans(id),
  to_plan_id      uuid not null references plans(id),
  status          plan_change_status not null default 'pending',
  requested_by    uuid references profiles(id),
  requested_at    timestamptz not null default now(),
  reviewed_by     uuid references profiles(id),
  reviewed_at     timestamptz,
  effective_date  date,
  rejection_reason text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_plan_changes_clinic_id  on plan_changes(clinic_id);
create index idx_plan_changes_member_id  on plan_changes(member_id);
create index idx_plan_changes_status     on plan_changes(status);


-- =============================================================================
-- SECTION 14: SIGNED AGREEMENTS
-- =============================================================================

create table agreement_templates (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid references clinics(id),
  version         text not null,                    -- e.g. '2025-v1'
  title           text not null,
  content_html    text,
  file_path       text,                             -- storage path to PDF template
  is_current      boolean not null default false,
  effective_from  date,
  created_at      timestamptz not null default now()
);

create unique index idx_agreement_templates_current
  on agreement_templates(clinic_id, is_current) where is_current = true;


create table signed_agreements (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid not null references clinics(id),
  member_id       uuid not null references members(id),
  template_id     uuid not null references agreement_templates(id),
  status          agreement_status not null default 'pending',
  signed_by       uuid references profiles(id),
  signed_at       timestamptz,
  signature_data  text,                            -- base64 or DocuSign envelope ID
  document_url    text,                            -- storage: signed PDF
  ip_address      inet,
  user_agent      text,
  revoked_at      timestamptz,
  revoke_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_signed_agreements_clinic_id  on signed_agreements(clinic_id);
create index idx_signed_agreements_member_id  on signed_agreements(member_id);
create index idx_signed_agreements_status     on signed_agreements(status);


-- =============================================================================
-- SECTION 15: STEP-UP AUTHENTICATION
-- =============================================================================

create table step_up_requests (
  id           uuid primary key default uuid_generate_v4(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  purpose      step_up_purpose not null,
  status       step_up_status not null default 'requested',
  otp_hash     text,                              -- bcrypt hash of OTP
  otp_channel  notification_channel not null default 'sms',
  sent_to      text,                              -- phone or email (masked)
  attempts     integer not null default 0,
  max_attempts integer not null default 3,
  expires_at   timestamptz not null default (now() + interval '10 minutes'),
  verified_at  timestamptz,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index idx_step_up_profile_id on step_up_requests(profile_id);
create index idx_step_up_status     on step_up_requests(status);


-- =============================================================================
-- SECTION 16: NOTIFICATIONS
-- =============================================================================

create table notifications (
  id           uuid primary key default uuid_generate_v4(),
  clinic_id    uuid references clinics(id),
  profile_id   uuid references profiles(id),
  member_id    uuid references members(id),
  channel      notification_channel not null,
  status       notification_status not null default 'pending',
  subject      text,
  body         text not null,
  template_key text,
  variables    jsonb,
  recipient    text,                             -- email or phone
  -- provider response
  provider_id  text,
  provider_ref text,
  sent_at      timestamptz,
  delivered_at timestamptz,
  read_at      timestamptz,
  failed_at    timestamptz,
  failure_reason text,
  retry_count  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_notifications_profile_id on notifications(profile_id);
create index idx_notifications_member_id  on notifications(member_id);
create index idx_notifications_status     on notifications(status);
create index idx_notifications_channel    on notifications(channel);
create index idx_notifications_created    on notifications(created_at desc);


-- =============================================================================
-- SECTION 17: AUDIT LOG
-- =============================================================================

create table audit_log (
  id            bigserial primary key,
  clinic_id     uuid references clinics(id),
  performed_by  uuid references profiles(id),
  performer_name text,                            -- denormalised snapshot
  action        text not null,                    -- e.g. 'popia_consent_given'
  entity_type   text not null,                    -- e.g. 'member', 'popia', 'agreement'
  entity_id     text,
  old_data      jsonb,
  new_data      jsonb,
  metadata      jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz not null default now()
);

-- Audit log is IMMUTABLE — no updates, no deletes
create index idx_audit_log_clinic_id     on audit_log(clinic_id);
create index idx_audit_log_performed_by  on audit_log(performed_by);
create index idx_audit_log_action        on audit_log(action);
create index idx_audit_log_entity        on audit_log(entity_type, entity_id);
create index idx_audit_log_created_at    on audit_log(created_at desc);
create index idx_audit_log_action_text   on audit_log using gin(action gin_trgm_ops);


-- =============================================================================
-- SECTION 18: CROSS-SELL PIPELINE
-- =============================================================================

create table cross_sell_pipeline (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid not null references clinics(id),
  member_id       uuid not null references members(id),
  current_plan_id uuid references plans(id),
  target_plan_id  uuid references plans(id),
  stage           cross_sell_stage not null default 'identified',
  assigned_to     uuid references profiles(id),
  identified_at   timestamptz not null default now(),
  contacted_at    timestamptz,
  proposal_sent_at timestamptz,
  converted_at    timestamptz,
  closed_at       timestamptz,
  close_reason    text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_cross_sell_clinic_id  on cross_sell_pipeline(clinic_id);
create index idx_cross_sell_member_id  on cross_sell_pipeline(member_id);
create index idx_cross_sell_stage      on cross_sell_pipeline(stage);


-- =============================================================================
-- SECTION 19: INTEGRATIONS CONFIG
-- =============================================================================

create table integrations (
  id              uuid primary key default uuid_generate_v4(),
  clinic_id       uuid not null references clinics(id),
  integration     integration_name not null,
  status          integration_status not null default 'pending_config',
  config          jsonb not null default '{}',     -- encrypted at app layer
  webhook_url     text,
  last_ping_at    timestamptz,
  last_error      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(clinic_id, integration)
);

create index idx_integrations_clinic_id on integrations(clinic_id);


-- =============================================================================
-- SECTION 20: REPORTS & EXPORTS LOG
-- =============================================================================

create table report_exports (
  id            uuid primary key default uuid_generate_v4(),
  clinic_id     uuid not null references clinics(id),
  generated_by  uuid not null references profiles(id),
  report_type   report_type not null,
  format        export_format not null default 'csv',
  date_from     date,
  date_to       date,
  filters       jsonb,
  row_count     integer,
  file_path     text,                              -- storage path
  file_size_bytes integer,
  status        text not null default 'generating',
  error_message text,
  expires_at    timestamptz default (now() + interval '7 days'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_report_exports_clinic_id    on report_exports(clinic_id);
create index idx_report_exports_generated_by on report_exports(generated_by);
create index idx_report_exports_created      on report_exports(created_at desc);


-- =============================================================================
-- SECTION 21: STATEMENT REQUESTS
-- =============================================================================

create table statement_requests (
  id            uuid primary key default uuid_generate_v4(),
  member_id     uuid not null references members(id),
  clinic_id     uuid not null references clinics(id),
  requested_by  uuid not null references profiles(id),
  delivery      text not null default 'download',   -- 'download' | 'email'
  file_path     text,                               -- storage path to generated PDF
  emailed_to    text,
  generated_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_statement_requests_member_id on statement_requests(member_id);


-- =============================================================================
-- SECTION 22: PEAK HOURS DATA CACHE
-- =============================================================================

-- Materialised cache refreshed daily for peak hours analytics
create table peak_hours_cache (
  id            uuid primary key default uuid_generate_v4(),
  clinic_id     uuid not null references clinics(id),
  period_days   integer not null,                   -- 7, 30, or 90
  hour_of_day   integer not null check (hour_of_day between 0 and 23),
  day_of_week   integer not null check (day_of_week between 0 and 6),  -- 0=Sun
  visit_count   integer not null default 0,
  cached_at     timestamptz not null default now(),
  unique(clinic_id, period_days, hour_of_day, day_of_week)
);


-- =============================================================================
-- SECTION 23: VIEWS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 23.1  v_member_full  – complete member profile for Member Portal & Admin
-- ---------------------------------------------------------------------------
create or replace view v_member_full as
select
  m.id                      as member_id,
  m.card_number,
  m.status                  as member_status,
  m.member_since,
  m.debit_day,
  m.kyc_status,
  m.popia_consent,
  m.popia_consent_at,
  m.is_corporate,
  m.company_name,
  m.bank_name,
  m.account_holder,
  m.account_number,
  m.account_type,
  m.branch_code,
  m.banking_verified_at,
  -- profile
  p.id                      as profile_id,
  p.first_name,
  p.last_name,
  p.full_name,
  p.sa_id_number,
  p.date_of_birth,
  p.gender,
  p.phone,
  p.email,
  p.address_line1,
  p.suburb,
  p.city,
  p.postal_code,
  -- plan
  pl.id                     as plan_id,
  pl.plan_type,
  pl.name                   as plan_name,
  pl.monthly_fee_cents,
  pl.consultations_pm,
  pl.max_members,
  pl.includes_medication,
  pl.includes_chronic,
  -- clinic
  c.id                      as clinic_id,
  c.name                    as clinic_name,
  c.slug                    as clinic_slug,
  -- card
  mc.id                     as card_id,
  mc.qr_payload,
  mc.card_image_url,
  mc.google_wallet_pass_url,
  mc.status                 as card_status,
  -- dependants count
  (select count(*) from dependants d where d.member_id = m.id and d.status = 'active')
                            as active_dependants_count,
  -- consultations this month
  (select count(*) from consultations co
   where co.member_id = m.id
     and co.counted_toward_limit = true
     and date_trunc('month', co.visited_at) = date_trunc('month', now()))
                            as consultations_this_month,
  -- total consultations
  (select count(*) from consultations co where co.member_id = m.id)
                            as consultations_total,
  -- failed payments count
  (select count(*) from debit_orders dob
   where dob.member_id = m.id and dob.status = 'failed')
                            as failed_payments_count,
  -- total collected cents
  (select coalesce(sum(amount_cents),0) from debit_orders dob
   where dob.member_id = m.id and dob.status = 'success')
                            as total_collected_cents
from members m
join profiles p  on p.id  = m.profile_id
join plans   pl  on pl.id = m.plan_id
join clinics c   on c.id  = m.clinic_id
left join member_cards mc
  on mc.member_id = m.id and mc.status = 'active'
  and mc.dependant_id is null;


-- ---------------------------------------------------------------------------
-- 23.2  v_staff_dashboard  – live dashboard for clinic staff
-- ---------------------------------------------------------------------------
create or replace view v_staff_dashboard as
select
  c.id                as clinic_id,
  c.name              as clinic_name,
  -- today stats
  (select count(*) from consultations co
   where co.clinic_id = c.id
     and co.visited_at::date = current_date)            as checkins_today,
  (select count(*) from members m
   where m.clinic_id = c.id and m.status = 'active')    as active_members,
  -- over-limit members
  (select count(*) from members m
   join plans pl on pl.id = m.plan_id
   where m.clinic_id = c.id
     and m.status = 'active'
     and (select count(*) from consultations co
          where co.member_id = m.id
            and co.counted_toward_limit = true
            and date_trunc('month', co.visited_at) = date_trunc('month', now())
         ) > pl.consultations_pm)                        as over_limit_count,
  -- flagged
  (select count(*) from consultations co
   where co.clinic_id = c.id and co.is_flagged = true
     and co.flag_resolved = false)                       as flagged_count,
  -- this month
  (select count(*) from consultations co
   where co.clinic_id = c.id
     and date_trunc('month', co.visited_at) = date_trunc('month', now()))
                                                         as visits_this_month,
  -- revenue this month (cents)
  (select coalesce(sum(amount_cents),0) from debit_orders do2
   where do2.clinic_id = c.id
     and do2.status = 'success'
     and date_trunc('month', do2.collection_date) = date_trunc('month', now()))
                                                         as revenue_this_month_cents
from clinics c
where c.is_active = true;


-- ---------------------------------------------------------------------------
-- 23.3  v_admin_dashboard  – summary for Admin Portal dashboard
-- ---------------------------------------------------------------------------
create or replace view v_admin_dashboard as
select
  c.id                                  as clinic_id,
  c.name                                as clinic_name,
  -- members
  (select count(*) from members m where m.clinic_id = c.id)
                                        as total_members,
  (select count(*) from members m where m.clinic_id = c.id and m.status = 'active')
                                        as active_members,
  -- revenue
  (select coalesce(sum(amount_cents),0) from debit_orders do2
   where do2.clinic_id = c.id and do2.status = 'success'
     and date_trunc('month', do2.collection_date) = date_trunc('month', now()))
                                        as monthly_revenue_cents,
  (select
     case when count(*) = 0 then 0
     else round(100.0 * sum(case when status = 'success' then 1 else 0 end)::numeric / count(*), 2)
     end
   from debit_orders do2
   where do2.clinic_id = c.id
     and date_trunc('month', do2.collection_date) = date_trunc('month', now()))
                                        as collection_rate_pct,
  -- consultations this month
  (select count(*) from consultations co
   where co.clinic_id = c.id
     and date_trunc('month', co.visited_at) = date_trunc('month', now()))
                                        as consultations_this_month,
  -- pending items
  (select count(*) from kyc_documents kd
   where kd.clinic_id = c.id and kd.status = 'pending_review')
                                        as kyc_pending,
  (select count(*) from member_cards mc
   where mc.clinic_id = c.id and mc.status = 'pending')
                                        as cards_to_issue,
  (select count(*) from debit_orders do2
   where do2.clinic_id = c.id and do2.status = 'failed'
     and date_trunc('month', do2.collection_date) = date_trunc('month', now()))
                                        as failed_orders,
  (select count(*) from applications a
   where a.clinic_id = c.id and a.status = 'awaiting_approval')
                                        as pending_applications,
  (select count(*) from plan_changes pc
   where pc.clinic_id = c.id and pc.status = 'pending')
                                        as pending_plan_changes
from clinics c
where c.is_active = true;


-- ---------------------------------------------------------------------------
-- 23.4  v_consultation_limit_breaches  – members over their monthly limit
-- ---------------------------------------------------------------------------
create or replace view v_consultation_limit_breaches as
select
  m.id            as member_id,
  m.clinic_id,
  p.full_name,
  p.phone,
  pl.name         as plan_name,
  pl.consultations_pm as allowed_consultations,
  count(co.id)    as used_consultations,
  count(co.id) - pl.consultations_pm as over_by
from members m
join profiles p  on p.id  = m.profile_id
join plans   pl  on pl.id = m.plan_id
join consultations co
  on  co.member_id = m.id
  and co.counted_toward_limit = true
  and date_trunc('month', co.visited_at) = date_trunc('month', now())
where m.status = 'active'
  and pl.consultations_pm > 0
group by m.id, m.clinic_id, p.full_name, p.phone, pl.name, pl.consultations_pm
having count(co.id) > pl.consultations_pm;


-- ---------------------------------------------------------------------------
-- 23.5  v_flagged_activity  – staff + admin flagged items combined
-- ---------------------------------------------------------------------------
create or replace view v_flagged_activity as
select
  'consultation'     as entity_type,
  co.id              as entity_id,
  co.clinic_id,
  co.member_id,
  p.full_name        as member_name,
  co.clinical_notes  as notes,
  co.visited_at      as flagged_at_time,
  co.flagged_reason,
  co.flag_resolved
from consultations co
join members m on m.id = co.member_id
join profiles p on p.id = m.profile_id
where co.is_flagged = true

union all

select
  'medication'       as entity_type,
  md.id              as entity_id,
  md.clinic_id,
  md.member_id,
  p.full_name        as member_name,
  md.dispense_note   as notes,
  md.dispensed_at    as flagged_at_time,
  md.flagged_reason,
  md.flag_resolved
from medication_dispenses md
join members m on m.id = md.member_id
join profiles p on p.id = m.profile_id
where md.is_flagged = true;


-- ---------------------------------------------------------------------------
-- 23.6  v_monthly_revenue_12m  – revenue series for admin dashboard chart
-- ---------------------------------------------------------------------------
create or replace view v_monthly_revenue_12m as
select
  c.id                                  as clinic_id,
  date_trunc('month', do2.collection_date)::date as month,
  to_char(date_trunc('month', do2.collection_date), 'MM') as month_label,
  coalesce(sum(case when do2.status = 'success' then do2.amount_cents else 0 end), 0) as collected_cents,
  coalesce(sum(do2.amount_cents), 0)    as expected_cents,
  count(case when do2.status = 'failed' then 1 end)  as failed_count,
  count(case when do2.status = 'success' then 1 end) as success_count
from clinics c
left join debit_orders do2
  on  do2.clinic_id = c.id
  and do2.collection_date >= (current_date - interval '12 months')
where c.is_active = true
group by c.id, date_trunc('month', do2.collection_date)
order by month asc;


-- ---------------------------------------------------------------------------
-- 23.7  v_plan_distribution  – plan breakdown for donut chart
-- ---------------------------------------------------------------------------
create or replace view v_plan_distribution as
select
  m.clinic_id,
  pl.plan_type,
  pl.name as plan_name,
  count(m.id) as member_count,
  round(100.0 * count(m.id) / nullif(sum(count(m.id)) over (partition by m.clinic_id), 0), 2) as pct
from members m
join plans pl on pl.id = m.plan_id
where m.status = 'active'
group by m.clinic_id, pl.plan_type, pl.name;


-- ---------------------------------------------------------------------------
-- 23.8  v_kyc_queue  – admin KYC review queue
-- ---------------------------------------------------------------------------
create or replace view v_kyc_queue as
select
  m.id            as member_id,
  m.clinic_id,
  p.full_name,
  p.phone,
  p.email,
  m.kyc_status,
  count(kd.id)    as documents_submitted,
  max(kd.created_at) as last_submitted_at,
  jsonb_agg(jsonb_build_object(
    'doc_type', kd.doc_type,
    'status',   kd.status,
    'file_path', kd.file_path,
    'created_at', kd.created_at
  ) order by kd.created_at) as documents
from members m
join profiles p  on p.id = m.profile_id
join kyc_documents kd on kd.member_id = m.id
where m.kyc_status in ('pending_review', 'resubmission_requested')
group by m.id, m.clinic_id, p.full_name, p.phone, p.email, m.kyc_status;


-- ---------------------------------------------------------------------------
-- 23.9  v_retention_report
-- ---------------------------------------------------------------------------
create or replace view v_retention_report as
with monthly as (
  select
    m.clinic_id,
    date_trunc('month', m.member_since)::date as cohort_month,
    count(*) as new_members
  from members m
  where m.member_since is not null
  group by m.clinic_id, date_trunc('month', m.member_since)
),
cancelled as (
  select
    m.clinic_id,
    date_trunc('month', m.updated_at)::date as cancel_month,
    count(*) as cancelled_members
  from members m
  where m.status in ('cancelled', 'suspended')
  group by m.clinic_id, date_trunc('month', m.updated_at)
)
select
  mo.clinic_id,
  mo.cohort_month,
  mo.new_members,
  coalesce(ca.cancelled_members, 0) as cancelled_members,
  mo.new_members - coalesce(ca.cancelled_members, 0) as net_change
from monthly mo
left join cancelled ca
  on  ca.clinic_id = mo.clinic_id
  and ca.cancel_month = mo.cohort_month
order by mo.clinic_id, mo.cohort_month;


-- =============================================================================
-- SECTION 24: FUNCTIONS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 24.1  Generate card number  NFS[clinic-code][7 digits]
-- ---------------------------------------------------------------------------
create or replace function generate_card_number(p_clinic_id uuid)
returns text language plpgsql as $$
declare
  v_suffix   text;
  v_candidate text;
  v_code     text := 'NFS8';   -- default prefix; extend per clinic
begin
  loop
    v_suffix    := lpad(floor(random() * 9999999)::text, 7, '0');
    v_candidate := v_code || ' ' || substr(v_suffix, 1, 4) || ' ' || substr(v_suffix, 5, 3);
    exit when not exists (
      select 1 from member_cards where card_number = v_candidate
      union
      select 1 from members where card_number = v_candidate
    );
  end loop;
  return v_candidate;
end;
$$;


-- ---------------------------------------------------------------------------
-- 24.2  Get member consultation count for current month
-- ---------------------------------------------------------------------------
create or replace function get_member_consultations_this_month(p_member_id uuid)
returns integer language sql stable as $$
  select count(*)::integer
  from consultations
  where member_id = p_member_id
    and counted_toward_limit = true
    and date_trunc('month', visited_at) = date_trunc('month', now());
$$;


-- ---------------------------------------------------------------------------
-- 24.3  Check if member is over consultation limit
-- ---------------------------------------------------------------------------
create or replace function is_member_over_limit(p_member_id uuid)
returns boolean language sql stable as $$
  select
    get_member_consultations_this_month(p_member_id)
    >
    (select pl.consultations_pm
     from members m join plans pl on pl.id = m.plan_id
     where m.id = p_member_id)
  ;
$$;


-- ---------------------------------------------------------------------------
-- 24.4  Log audit event
-- ---------------------------------------------------------------------------
create or replace function log_audit(
  p_clinic_id    uuid,
  p_performed_by uuid,
  p_action       text,
  p_entity_type  text,
  p_entity_id    text,
  p_old_data     jsonb default null,
  p_new_data     jsonb default null,
  p_metadata     jsonb default null
) returns void language plpgsql security definer as $$
begin
  insert into audit_log (clinic_id, performed_by, performer_name,
                         action, entity_type, entity_id,
                         old_data, new_data, metadata)
  select p_clinic_id, p_performed_by,
         coalesce(prof.full_name, 'System'),
         p_action, p_entity_type, p_entity_id,
         p_old_data, p_new_data, p_metadata
  from profiles prof
  where prof.id = p_performed_by
  on conflict do nothing;

  -- fallback if profile not found
  if not found then
    insert into audit_log (clinic_id, performed_by, performer_name,
                           action, entity_type, entity_id,
                           old_data, new_data, metadata)
    values (p_clinic_id, p_performed_by, 'System',
            p_action, p_entity_type, p_entity_id,
            p_old_data, p_new_data, p_metadata);
  end if;
end;
$$;


-- ---------------------------------------------------------------------------
-- 24.5  Verify member QR code  (called by staff portal)
-- ---------------------------------------------------------------------------
create or replace function verify_member_qr(p_qr_payload text)
returns table (
  member_id            uuid,
  full_name            text,
  plan_name            text,
  status               member_status,
  consultations_used   integer,
  consultations_allowed integer,
  is_over_limit        boolean,
  card_status          card_status
) language sql stable security definer as $$
  select
    m.id,
    p.full_name,
    pl.name,
    m.status,
    get_member_consultations_this_month(m.id),
    pl.consultations_pm,
    is_member_over_limit(m.id),
    mc.status
  from member_cards mc
  join members  m  on m.id  = mc.member_id
  join profiles p  on p.id  = m.profile_id
  join plans    pl on pl.id = m.plan_id
  where mc.qr_payload = p_qr_payload
    and mc.status = 'active'
  limit 1;
$$;


-- ---------------------------------------------------------------------------
-- 24.6  Verify member by identifier (ID / phone / card number)
-- ---------------------------------------------------------------------------
create or replace function verify_member_by_identifier(p_search text)
returns table (
  member_id            uuid,
  full_name            text,
  plan_name            text,
  status               member_status,
  card_number          text,
  consultations_used   integer,
  consultations_allowed integer,
  is_over_limit        boolean
) language sql stable security definer as $$
  select
    m.id,
    p.full_name,
    pl.name,
    m.status,
    m.card_number,
    get_member_consultations_this_month(m.id),
    pl.consultations_pm,
    is_member_over_limit(m.id)
  from members  m
  join profiles p  on p.id  = m.profile_id
  join plans    pl on pl.id = m.plan_id
  where p.sa_id_number    = p_search
     or p.passport_number = p_search
     or m.card_number     = p_search
     or p.phone           = p_search
     or p.phone           = regexp_replace(p_search, '\s|-', '', 'g')
  limit 5;
$$;


-- ---------------------------------------------------------------------------
-- 24.7  Refresh peak hours cache
-- ---------------------------------------------------------------------------
create or replace function refresh_peak_hours_cache(p_clinic_id uuid)
returns void language plpgsql as $$
begin
  delete from peak_hours_cache where clinic_id = p_clinic_id;

  insert into peak_hours_cache (clinic_id, period_days, hour_of_day, day_of_week, visit_count)
  select
    co.clinic_id,
    period.days,
    extract(hour from co.visited_at)::integer,
    extract(dow  from co.visited_at)::integer,
    count(*)
  from consultations co
  cross join (values (7), (30), (90)) as period(days)
  where co.clinic_id = p_clinic_id
    and co.visited_at >= now() - (period.days || ' days')::interval
  group by co.clinic_id, period.days,
           extract(hour from co.visited_at),
           extract(dow  from co.visited_at)
  on conflict (clinic_id, period_days, hour_of_day, day_of_week)
  do update set visit_count = excluded.visit_count,
               cached_at   = now();
end;
$$;


-- ---------------------------------------------------------------------------
-- 24.8  Auto-handle new auth user → create profile
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, first_name, last_name, phone, portal_role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'portal_role')::portal_role, 'member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- =============================================================================
-- SECTION 25: TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 25.1  updated_at auto-maintenance for all major tables
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'clinics','plans','profiles','members','dependants',
    'applications','onboarding_steps','member_cards',
    'kyc_documents','debit_mandates','debit_orders',
    'reconciliation_batches','payments','appointments',
    'consultations','medication_dispenses','plan_changes',
    'agreement_templates','signed_agreements',
    'step_up_requests','notifications','cross_sell_pipeline',
    'integrations','report_exports','statement_requests'
  ]
  loop
    execute format(
      'create trigger trg_%s_updated_at
       before update on %s
       for each row execute function set_updated_at()',
      replace(t, '_', ''), t
    );
  end loop;
end;
$$;


-- ---------------------------------------------------------------------------
-- 25.2  Audit trigger: member status changes
-- ---------------------------------------------------------------------------
create or replace function audit_member_status_change()
returns trigger language plpgsql security definer as $$
begin
  if old.status <> new.status then
    perform log_audit(
      new.clinic_id,
      auth.uid(),
      'member_status_changed',
      'member',
      new.id::text,
      jsonb_build_object('status', old.status),
      jsonb_build_object('status', new.status)
    );
  end if;
  return new;
end;
$$;

create trigger trg_audit_member_status
  after update of status on members
  for each row execute function audit_member_status_change();


-- ---------------------------------------------------------------------------
-- 25.3  Auto-alert: consultation limit breach
-- ---------------------------------------------------------------------------
create or replace function check_consultation_limit()
returns trigger language plpgsql as $$
declare
  v_used    integer;
  v_allowed integer;
begin
  if new.counted_toward_limit then
    v_used    := get_member_consultations_this_month(new.member_id);
    select pl.consultations_pm into v_allowed
    from members m join plans pl on pl.id = m.plan_id
    where m.id = new.member_id;

    if v_used >= v_allowed then
      update members set consultation_limit_alert = true
      where id = new.member_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_check_consultation_limit
  after insert on consultations
  for each row execute function check_consultation_limit();


-- ---------------------------------------------------------------------------
-- 25.4  Audit trigger: POPIA consent
-- ---------------------------------------------------------------------------
create or replace function audit_popia_consent()
returns trigger language plpgsql security definer as $$
begin
  perform log_audit(
    new.clinic_id,
    new.profile_id,
    'popia_consent_given',
    'popia',
    new.id::text,
    null,
    jsonb_build_object('version', new.consent_version, 'member_id', new.member_id)
  );
  return new;
end;
$$;

create trigger trg_audit_popia
  after insert on popia_consents
  for each row execute function audit_popia_consent();


-- ---------------------------------------------------------------------------
-- 25.5  Audit trigger: signed agreements
-- ---------------------------------------------------------------------------
create or replace function audit_agreement_signed()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'signed' and (old.status is null or old.status <> 'signed') then
    perform log_audit(
      new.clinic_id,
      new.signed_by,
      'agreement_signed',
      'agreements',
      new.id::text,
      null,
      jsonb_build_object('member_id', new.member_id, 'template_id', new.template_id)
    );
  end if;
  return new;
end;
$$;

create trigger trg_audit_agreement
  after insert or update of status on signed_agreements
  for each row execute function audit_agreement_signed();


-- ---------------------------------------------------------------------------
-- 25.6  Audit trigger: step-up verification
-- ---------------------------------------------------------------------------
create or replace function audit_step_up()
returns trigger language plpgsql security definer as $$
begin
  if new.status in ('requested','verified','failed','expired') then
    perform log_audit(
      null,
      new.profile_id,
      'step_up_' || new.status,
      'security',
      new.profile_id::text,
      null,
      jsonb_build_object('purpose', new.purpose, 'channel', new.otp_channel)
    );
  end if;
  return new;
end;
$$;

create trigger trg_audit_step_up
  after insert or update of status on step_up_requests
  for each row execute function audit_step_up();


-- =============================================================================
-- SECTION 26: ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
alter table clinics                enable row level security;
alter table plans                  enable row level security;
alter table profiles               enable row level security;
alter table members                enable row level security;
alter table dependants             enable row level security;
alter table applications           enable row level security;
alter table onboarding_steps       enable row level security;
alter table member_cards           enable row level security;
alter table kyc_documents          enable row level security;
alter table popia_consents         enable row level security;
alter table popia_consent_purposes enable row level security;
alter table debit_mandates         enable row level security;
alter table debit_orders           enable row level security;
alter table reconciliation_batches enable row level security;
alter table payments               enable row level security;
alter table appointments           enable row level security;
alter table consultations          enable row level security;
alter table medications            enable row level security;
alter table medication_dispenses   enable row level security;
alter table plan_changes           enable row level security;
alter table agreement_templates    enable row level security;
alter table signed_agreements      enable row level security;
alter table step_up_requests       enable row level security;
alter table notifications          enable row level security;
alter table audit_log              enable row level security;
alter table cross_sell_pipeline    enable row level security;
alter table integrations           enable row level security;
alter table report_exports         enable row level security;
alter table statement_requests     enable row level security;
alter table peak_hours_cache       enable row level security;


-- Helper: current user's portal role
create or replace function current_role_is(p_role portal_role)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and portal_role = p_role
  );
$$;

create or replace function current_user_clinic_id()
returns uuid language sql stable security definer as $$
  select clinic_id from profiles where id = auth.uid();
$$;

create or replace function current_user_member_id()
returns uuid language sql stable security definer as $$
  select id from members where profile_id = auth.uid() limit 1;
$$;


-- ── Clinics ──────────────────────────────────────────────────────────────────
-- Public read for all authenticated users
create policy "clinics_select_all"  on clinics for select to authenticated using (true);
create policy "clinics_admin_all"   on clinics for all    to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Plans ────────────────────────────────────────────────────────────────────
create policy "plans_select_all"  on plans for select to authenticated using (is_active = true);
create policy "plans_admin_write" on plans for all    to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Profiles ────────────────────────────────────────────────────────────────
create policy "profiles_own"        on profiles for all to authenticated
  using (id = auth.uid());
create policy "profiles_staff_read" on profiles for select to authenticated
  using (current_role_is('staff') or current_role_is('admin') or current_role_is('super_admin'));

-- ── Members ──────────────────────────────────────────────────────────────────
create policy "members_own"        on members for select to authenticated
  using (profile_id = auth.uid());
create policy "members_own_update" on members for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
create policy "members_staff_read" on members for select to authenticated
  using (
    clinic_id = current_user_clinic_id()
    and (current_role_is('staff') or current_role_is('admin') or current_role_is('super_admin'))
  );
create policy "members_admin_write" on members for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Dependants ───────────────────────────────────────────────────────────────
create policy "dependants_own" on dependants for all to authenticated
  using (member_id = current_user_member_id());
create policy "dependants_staff_read" on dependants for select to authenticated
  using (
    clinic_id = current_user_clinic_id()
    and (current_role_is('staff') or current_role_is('admin') or current_role_is('super_admin'))
  );

-- ── Applications ─────────────────────────────────────────────────────────────
create policy "applications_own" on applications for select to authenticated
  using (profile_id = auth.uid());
create policy "applications_own_insert" on applications for insert to authenticated
  with check (profile_id = auth.uid());
create policy "applications_staff" on applications for select to authenticated
  using (
    clinic_id = current_user_clinic_id()
    and (current_role_is('staff') or current_role_is('admin') or current_role_is('super_admin'))
  );
create policy "applications_admin_write" on applications for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Member Cards ─────────────────────────────────────────────────────────────
create policy "cards_own" on member_cards for select to authenticated
  using (member_id = current_user_member_id());
create policy "cards_admin_all" on member_cards for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));
create policy "cards_staff_read" on member_cards for select to authenticated
  using (
    clinic_id = current_user_clinic_id()
    and (current_role_is('staff') or current_role_is('admin'))
  );

-- ── KYC Documents ────────────────────────────────────────────────────────────
create policy "kyc_own_insert" on kyc_documents for insert to authenticated
  with check (member_id = current_user_member_id());
create policy "kyc_own_select" on kyc_documents for select to authenticated
  using (member_id = current_user_member_id());
create policy "kyc_admin_all" on kyc_documents for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── POPIA ────────────────────────────────────────────────────────────────────
create policy "popia_own" on popia_consents for all to authenticated
  using (profile_id = auth.uid());
create policy "popia_admin" on popia_consents for select to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Debit Orders / Mandates / Payments ───────────────────────────────────────
create policy "debit_orders_own" on debit_orders for select to authenticated
  using (member_id = current_user_member_id());
create policy "debit_orders_admin" on debit_orders for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

create policy "mandates_own" on debit_mandates for select to authenticated
  using (member_id = current_user_member_id());
create policy "mandates_admin" on debit_mandates for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

create policy "payments_own" on payments for select to authenticated
  using (member_id = current_user_member_id());
create policy "payments_admin" on payments for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Appointments ─────────────────────────────────────────────────────────────
create policy "appointments_own" on appointments for select to authenticated
  using (member_id = current_user_member_id());
create policy "appointments_own_insert" on appointments for insert to authenticated
  with check (member_id = current_user_member_id());
create policy "appointments_staff" on appointments for all to authenticated
  using (
    clinic_id = current_user_clinic_id()
    and (current_role_is('staff') or current_role_is('admin') or current_role_is('super_admin'))
  );

-- ── Consultations ────────────────────────────────────────────────────────────
create policy "consultations_own" on consultations for select to authenticated
  using (member_id = current_user_member_id());
create policy "consultations_staff" on consultations for all to authenticated
  using (
    clinic_id = current_user_clinic_id()
    and (current_role_is('staff') or current_role_is('admin') or current_role_is('super_admin'))
  );

-- ── Medications ──────────────────────────────────────────────────────────────
create policy "medications_read_all" on medications for select to authenticated using (true);
create policy "medications_admin"    on medications for all    to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Medication Dispenses ─────────────────────────────────────────────────────
create policy "med_dispenses_own" on medication_dispenses for select to authenticated
  using (member_id = current_user_member_id());
create policy "med_dispenses_staff" on medication_dispenses for all to authenticated
  using (
    clinic_id = current_user_clinic_id()
    and (current_role_is('staff') or current_role_is('admin') or current_role_is('super_admin'))
  );

-- ── Plan Changes ─────────────────────────────────────────────────────────────
create policy "plan_changes_own_insert" on plan_changes for insert to authenticated
  with check (member_id = current_user_member_id());
create policy "plan_changes_own_select" on plan_changes for select to authenticated
  using (member_id = current_user_member_id());
create policy "plan_changes_admin" on plan_changes for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Signed Agreements ────────────────────────────────────────────────────────
create policy "agreements_own" on signed_agreements for select to authenticated
  using (member_id = current_user_member_id());
create policy "agreements_own_insert" on signed_agreements for insert to authenticated
  with check (member_id = current_user_member_id());
create policy "agreements_admin" on signed_agreements for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Audit Log ────────────────────────────────────────────────────────────────
-- Admin + super_admin read; NO updates or deletes by anyone
create policy "audit_log_admin_select" on audit_log for select to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));
create policy "audit_log_insert_all"   on audit_log for insert to authenticated with check (true);

-- ── Step-up requests ─────────────────────────────────────────────────────────
create policy "step_up_own" on step_up_requests for all to authenticated
  using (profile_id = auth.uid());

-- ── Notifications ────────────────────────────────────────────────────────────
create policy "notifications_own" on notifications for select to authenticated
  using (profile_id = auth.uid());
create policy "notifications_admin" on notifications for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));

-- ── Cross-sell / Reconciliation / Reports (admin only) ───────────────────────
create policy "cross_sell_admin" on cross_sell_pipeline for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));
create policy "reconciliation_admin" on reconciliation_batches for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));
create policy "report_exports_own" on report_exports for all to authenticated
  using (generated_by = auth.uid()
    or current_role_is('admin') or current_role_is('super_admin'));
create policy "integrations_admin" on integrations for all to authenticated
  using (current_role_is('admin') or current_role_is('super_admin'));
create policy "peak_hours_staff" on peak_hours_cache for select to authenticated
  using (
    clinic_id = current_user_clinic_id()
    and (current_role_is('staff') or current_role_is('admin') or current_role_is('super_admin'))
  );
create policy "statement_requests_own" on statement_requests for all to authenticated
  using (requested_by = auth.uid() or member_id = current_user_member_id());


-- =============================================================================
-- SECTION 27: STORAGE BUCKETS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- NOTE: Run these via Supabase Dashboard > Storage > New Bucket
--       OR via the management API / supabase CLI.
--       SQL INSERT approach shown here for documentation.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- KYC documents — private, strict types
  ('kyc-documents',
   'kyc-documents',
   false,
   10485760,   -- 10 MB
   array['image/jpeg','image/png','image/webp','application/pdf']),

  -- Signed agreements — private PDFs
  ('signed-agreements',
   'signed-agreements',
   false,
   10485760,
   array['application/pdf','image/png']),

  -- Debit order mandates — private PDFs
  ('debit-mandates',
   'debit-mandates',
   false,
   10485760,
   array['application/pdf','image/png']),

  -- Member card images — public (QR visible to member)
  ('member-cards',
   'member-cards',
   true,
   5242880,    -- 5 MB
   array['image/png','image/jpeg','image/webp']),

  -- Statement PDFs — private
  ('statements',
   'statements',
   false,
   10485760,
   array['application/pdf']),

  -- Report exports — private
  ('report-exports',
   'report-exports',
   false,
   52428800,   -- 50 MB
   array['text/csv','application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),

  -- Profile avatars — public
  ('avatars',
   'avatars',
   true,
   2097152,    -- 2 MB
   array['image/jpeg','image/png','image/webp']),

  -- Agreement templates — private
  ('agreement-templates',
   'agreement-templates',
   false,
   10485760,
   array['application/pdf','text/html'])

on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 27.1  Storage RLS policies
-- ---------------------------------------------------------------------------

-- kyc-documents: only the owning member (or admin) can read/write
create policy "kyc_docs_member_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "kyc_docs_member_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or current_role_is('admin')
      or current_role_is('super_admin')
    )
  );

create policy "kyc_docs_admin_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (current_role_is('admin') or current_role_is('super_admin'))
  );

-- signed-agreements: member own + admin
create policy "agreements_member_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'signed-agreements'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or current_role_is('admin')
      or current_role_is('super_admin')
    )
  );

create policy "agreements_member_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'signed-agreements'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- member-cards: public read; admin write
create policy "cards_public_read"
  on storage.objects for select to public
  using (bucket_id = 'member-cards');

create policy "cards_admin_write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'member-cards'
    and (current_role_is('admin') or current_role_is('super_admin'))
  );

-- statements: own member + admin
create policy "statements_own_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'statements'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or current_role_is('admin')
      or current_role_is('super_admin')
    )
  );

-- report-exports: generated_by user + admin
create policy "reports_own_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'report-exports'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or current_role_is('admin')
      or current_role_is('super_admin')
    )
  );

-- avatars: public read; own write
create policy "avatars_public_read"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

create policy "avatars_own_write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- debit-mandates: admin only
create policy "mandates_admin_all"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'debit-mandates'
    and (current_role_is('admin') or current_role_is('super_admin'))
  );


-- =============================================================================
-- SECTION 28: REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime on operational tables used by live dashboards
alter publication supabase_realtime add table consultations;
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table plan_changes;
alter publication supabase_realtime add table applications;
alter publication supabase_realtime add table audit_log;
alter publication supabase_realtime add table debit_orders;


-- =============================================================================
-- SECTION 29: SUPABASE AUTH CONFIG (reference / SQL seed)
-- =============================================================================

-- These are configured in Supabase dashboard > Authentication > Settings
-- but documented here for completeness.

-- Site URL:          https://braamhealthcentre.nfsconnect.co.za
-- Redirect URLs:     https://braamhealthcentre.nfsconnect.co.za/**
-- JWT expiry:        3600 (1 hour)
-- Refresh token:     rotate on use = true; reuse interval = 10s
-- Email confirmations: enabled
-- Phone OTP:         enabled (for step-up auth)
-- Password min length: 8

-- Custom claims hook (Edge Function) adds portal_role to JWT:
-- create or replace function add_portal_role_to_jwt(event jsonb)
-- returns jsonb language plpgsql as $$
-- declare
--   v_role portal_role;
-- begin
--   select portal_role into v_role from profiles where id = (event->>'user_id')::uuid;
--   return jsonb_set(event, '{claims,portal_role}', to_jsonb(v_role::text));
-- end;
-- $$;


-- =============================================================================
-- SECTION 30: SCHEDULED JOBS (pg_cron or Supabase Edge Functions)
-- =============================================================================

-- Note: Install pg_cron extension and configure as needed.
-- These are illustrative cron expressions.

-- Daily: refresh peak hours cache for all active clinics
-- select cron.schedule('refresh-peak-hours', '0 2 * * *',
--   $$select refresh_peak_hours_cache(id) from clinics where is_active = true$$
-- );

-- Monthly: create debit order collection batch on 1st of month
-- select cron.schedule('create-debit-batch', '0 6 1 * *',
--   $$
--   insert into reconciliation_batches (clinic_id, batch_date,
--     total_expected_cents, member_count)
--   select
--     m.clinic_id,
--     current_date,
--     sum(pl.monthly_fee_cents),
--     count(m.id)
--   from members m join plans pl on pl.id = m.plan_id
--   where m.status = 'active'
--   group by m.clinic_id;
--   $$
-- );

-- Daily: expire step-up OTP requests
-- select cron.schedule('expire-step-up', '*/5 * * * *',
--   $$update step_up_requests set status = 'expired'
--     where expires_at < now() and status = 'requested'$$
-- );


-- =============================================================================
-- SECTION 31: ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================================================

-- Composite indexes for common query patterns
create index idx_consultations_member_month
  on consultations(member_id, date_trunc('month', visited_at AT TIME ZONE 'UTC') desc)
  where counted_toward_limit = true;

create index idx_debit_orders_member_date
  on debit_orders(member_id, collection_date desc);

create index idx_members_clinic_status
  on members(clinic_id, status);

create index idx_applications_clinic_status
  on applications(clinic_id, status);

create index idx_appointments_clinic_date_status
  on appointments(clinic_id, appointment_date desc, status);

create index idx_audit_log_clinic_date
  on audit_log(clinic_id, created_at desc);

-- Full-text search on members
create index idx_profiles_fts
  on profiles using gin(
    to_tsvector('english',
      coalesce(first_name,'') || ' ' ||
      coalesce(last_name,'') || ' ' ||
      coalesce(sa_id_number,'') || ' ' ||
      coalesce(phone,'')
    )
  );


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
-- Table count:   ~30 core tables
-- View count:     9 views
-- Function count: 10 functions
-- Trigger count:  6 business triggers + 25 updated_at triggers
-- Storage buckets: 8
-- RLS policies:   ~55 policies
-- =============================================================================
