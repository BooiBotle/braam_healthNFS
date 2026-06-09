-- =============================================================================
-- NFS INSURE | BRAAM HEALTH CENTRE
-- Supabase Database Triggers & Edge Function Webhooks Wiring
-- Version: 1.0  |  Date: 2026-06-01
-- =============================================================================
-- This script configures the PostgreSQL-side triggers, trigger functions, 
-- and pg_net webhooks to automatically generate notifications on core platform 
-- events (application submitted/approved, plan changes, payment failures, etc.)
-- and securely route email notifications to the 'send-email' Deno Edge Function.
-- =============================================================================

-- Enable the pg_net extension to allow asynchronous HTTP requests inside triggers
create extension if not exists "pg_net";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. SYSTEM CONFIGURATION TABLE
-- -----------------------------------------------------------------------------
-- Used to securely store Supabase credentials in the database to avoid hardcoding.
create table if not exists system_settings (
  key         text primary key,
  value       text not null,
  description text,
  updated_at  timestamptz default now()
);

-- Seed configuration parameters (Update these with actual keys)
insert into system_settings (key, value, description)
values 
  ('supabase_url', 'https://your-project-id.supabase.co', 'The base URL of your Supabase project (used to call Edge Functions)'),
  ('supabase_service_role_key', 'your-service-role-key', 'Service role key for authenticated HTTP requests to Edge Functions')
on conflict (key) do update 
set description = excluded.description;


-- -----------------------------------------------------------------------------
-- 2. EMAIL NOTIFICATION DISPATCH TRIGGER
-- -----------------------------------------------------------------------------
-- Fires AFTER INSERT on 'notifications' table to call the 'send-email' Deno function.
create or replace function trg_fn_deliver_email_notification()
returns trigger language plpgsql security definer as $$
declare
  v_supabase_url text;
  v_service_role_key text;
  v_payload jsonb;
begin
  -- Enforce sending email notifications that are marked pending
  if new.channel <> 'email' or new.status <> 'pending' then
    return new;
  end if;

  -- Retrieve configuration variables
  select value into v_supabase_url from system_settings where key = 'supabase_url';
  select value into v_service_role_key from system_settings where key = 'supabase_service_role_key';

  -- Gracefully skip HTTP request if placeholders are still present (avoids crashing database during initial seed)
  if v_supabase_url is null or v_supabase_url = 'https://your-project-id.supabase.co' or 
     v_service_role_key is null or v_service_role_key = 'your-service-role-key' then
    raise notice 'Supabase Edge Function parameters are not yet configured. Notification % remains pending.', new.id;
    return new;
  end if;

  -- Prepare payload to match Deno Edge Function interface
  v_payload := jsonb_build_object(
    'to', new.recipient,
    'subject', new.subject,
    'html', new.body
  );

  -- Perform asynchronous HTTP POST request using pg_net
  perform net.http_post(
    url := rtrim(v_supabase_url, '/') || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := v_payload
  );

  -- Mark notification as successfully queued/sent in pg_net
  new.status := 'sent';
  new.sent_at := now();

  return new;
exception when others then
  -- Handle exceptions gracefully and record the error in notifications log
  new.status := 'failed';
  new.failed_at := now();
  new.failure_reason := SQLERRM;
  return new;
end;
$$;

-- Create the execution trigger
drop trigger if exists trg_deliver_email_notification on notifications;
create trigger trg_deliver_email_notification
  before insert on notifications
  for each row execute function trg_fn_deliver_email_notification();


-- -----------------------------------------------------------------------------
-- 3. LIFECYCLE EVENT NOTIFICATION CREATOR FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------------------

-- =============================================================================
-- TRIGGER A: Application Submitted (Onboarding initiated)
-- =============================================================================
-- Fires after an application is inserted. Inserts welcome mail for applicant
-- and notification for administrative team.
create or replace function trg_fn_on_application_submitted()
returns trigger language plpgsql security definer as $$
declare
  v_body text;
  v_plan_name text;
begin
  -- Fetch the selected plan name
  select name into v_plan_name from plans where id = new.plan_id;

  -- A. Welcome Notification for the Applicant
  v_body := '<html><body style="font-family: sans-serif; color: #0D1B2A; background-color: #F5F7FA; padding: 20px;">' ||
            '<div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">' ||
            '<h2 style="color: #1A7A6E; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; margin-top: 0;">Application Received</h2>' ||
            '<p>Dear <strong>' || coalesce(new.applicant_name, 'Valued Applicant') || '</strong>,</p>' ||
            '<p>Thank you for submitting your membership application to <strong>NFS Insure | Braam Health Centre</strong>.</p>' ||
            '<p>Our administrative team is currently reviewing your FICA credentials and underwriting requirements. This process typically takes 1–2 business days.</p>' ||
            '<div style="background-color: #F5F7FA; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #C9A84C;">' ||
            '<p style="margin: 0;"><strong>Application ID:</strong> ' || new.id || '</p>' ||
            '<p style="margin: 5px 0 0 0;"><strong>Selected Plan:</strong> ' || coalesce(v_plan_name, 'Primary Health') || '</p>' ||
            '</div>' ||
            '<p>We will send you an email confirmation the moment your membership application has been approved and activated.</p>' ||
            '<p>Kind regards,<br><strong>Admin Team | Braam Health Centre</strong></p>' ||
            '<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0;">' ||
            '<footer style="font-size: 11px; color: #64748B; line-height: 1.5;">' ||
            'NFS Insure Consultant (Pty) Ltd | FSP 53910 | Regulated by the FSCA<br>' ||
            'Eagle Canyon Office Park, Randpark Ridge | info@nfs.insure | +27 10 011 0010' ||
            '</footer></div></body></html>';

  insert into notifications (clinic_id, profile_id, channel, status, subject, body, recipient)
  values (
    new.clinic_id,
    new.profile_id,
    'email',
    'pending',
    'Application Received - NFS Insure | Braam Health Centre',
    v_body,
    new.applicant_email
  );

  -- B. Notification for back-office administrators
  v_body := '<html><body style="font-family: sans-serif; color: #0D1B2A; padding: 20px;">' ||
            '<h3 style="color: #1A2C42; border-left: 4px solid #C9A84C; padding-left: 10px;">New Membership Application Submitted</h3>' ||
            '<p>A new membership application requires review in the Admin Portal.</p>' ||
            '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">' ||
            '<tr style="background: #F5F7FA;"><td style="padding: 8px; border: 1px solid #E2E8F0;"><strong>Applicant:</strong></td><td style="padding: 8px; border: 1px solid #E2E8F0;">' || coalesce(new.applicant_name, 'N/A') || '</td></tr>' ||
            '<tr><td style="padding: 8px; border: 1px solid #E2E8F0;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #E2E8F0;">' || coalesce(new.applicant_email, 'N/A') || '</td></tr>' ||
            '<tr style="background: #F5F7FA;"><td style="padding: 8px; border: 1px solid #E2E8F0;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #E2E8F0;">' || coalesce(new.applicant_phone, 'N/A') || '</td></tr>' ||
            '<tr><td style="padding: 8px; border: 1px solid #E2E8F0;"><strong>Plan:</strong></td><td style="padding: 8px; border: 1px solid #E2E8F0;">' || coalesce(v_plan_name, 'N/A') || '</td></tr>' ||
            '</table>' ||
            '<p><a href="https://braamhealthcentre.nfsconnect.co.za/admin/applications" style="background-color: #1A7A6E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Open Applications Inbox</a></p>' ||
            '</body></html>';

  insert into notifications (clinic_id, channel, status, subject, body, recipient)
  values (
    new.clinic_id,
    'email',
    'pending',
    'Action Required: New Membership Application Received',
    v_body,
    'applications@nfs.insure' -- Configured admin mail address
  );

  return new;
end;
$$;

drop trigger if exists trg_on_application_submitted on applications;
create trigger trg_on_application_submitted
  after insert on applications
  for each row execute function trg_fn_on_application_submitted();


-- =============================================================================
-- TRIGGER B: Application Reviewed (Approved / Rejected)
-- =============================================================================
-- Fires when application is set to approved or rejected. Approvals send membership
-- card details; rejections send reasons.
create or replace function trg_fn_on_application_decision()
returns trigger language plpgsql security definer as $$
declare
  v_body text;
  v_card_num text;
  v_plan_name text;
begin
  -- Only execute if the status changes
  if old.status = new.status then
    return new;
  end if;

  select name into v_plan_name from plans where id = new.plan_id;

  -- Application APPROVED
  if new.status = 'approved' then
    -- Retrieve the active card number associated with the new member record
    select card_number into v_card_num from members where id = new.member_id;

    v_body := '<html><body style="font-family: sans-serif; color: #0D1B2A; background-color: #F5F7FA; padding: 20px;">' ||
              '<div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">' ||
              '<h2 style="color: #16A34A; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; margin-top: 0;">Membership Approved! 🎉</h2>' ||
              '<p>Dear <strong>' || coalesce(new.applicant_name, 'Valued Member') || '</strong>,</p>' ||
              '<p>We are delighted to inform you that your application has been **approved** and your primary healthcare membership is now active!</p>' ||
              '<div style="background-color: #0D1B2A; color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">' ||
              '<h4 style="color: #C9A84C; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Digital Membership Card</h4>' ||
              '<p style="font-size: 26px; font-weight: bold; margin: 5px 0; font-family: monospace; color: #ffffff; letter-spacing: 1px;">' || coalesce(v_card_num, 'NFS8 0000 0000 0') || '</p>' ||
              '<p style="font-size: 13px; color: #94A3B8; margin: 5px 0 0 0;">Status: ACTIVE | Plan: ' || coalesce(v_plan_name, 'Primary Health') || '</p>' ||
              '</div>' ||
              '<p>Your digital membership card is now accessible on your **Member Portal**. You can download it to your device or click "Add to Google Wallet" for instant receptions scanning (requires zero internet connection at the clinic desk!).</p>' ||
              '<p><a href="https://braamhealthcentre.nfsconnect.co.za/login" style="background-color: #1A7A6E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Access Member Portal</a></p>' ||
              '<p>We look forward to serving your healthcare needs.</p>' ||
              '<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0;">' ||
              '<footer style="font-size: 11px; color: #64748B; line-height: 1.5;">' ||
              'NFS Insure Consultant (Pty) Ltd | FSP 53910 | Regulated by the FSCA<br>' ||
              'Eagle Canyon Office Park, Randpark Ridge | info@nfs.insure | +27 10 011 0010' ||
              '</footer></div></body></html>';

    insert into notifications (clinic_id, profile_id, member_id, channel, status, subject, body, recipient)
    values (
      new.clinic_id,
      new.profile_id,
      new.member_id,
      'email',
      'pending',
      'Welcome to Braam Health Centre - Membership Activated!',
      v_body,
      new.applicant_email
    );

  -- Application REJECTED
  elsif new.status = 'rejected' then
    v_body := '<html><body style="font-family: sans-serif; color: #0D1B2A; background-color: #F5F7FA; padding: 20px;">' ||
              '<div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">' ||
              '<h2 style="color: #DC2626; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; margin-top: 0;">Membership Application Update</h2>' ||
              '<p>Dear ' || coalesce(new.applicant_name, 'Applicant') || ',</p>' ||
              '<p>Thank you for your interest in NFS Insure | Braam Health Centre.</p>' ||
              '<p>Following a rigorous review of your FICA files and onboarding details, we regret to inform you that we are unable to approve your membership request at this time.</p>' ||
              '<div style="background-color: #FFF5F5; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; color: #7A2020;">' ||
              '<p style="margin: 0; font-weight: bold;">Reason for Decision:</p>' ||
              '<p style="margin: 5px 0 0 0; color: #9B2C2C;">' || coalesce(new.rejection_reason, 'Application failed to meet FICA compliance or underwriting requirements.') || '</p>' ||
              '</div>' ||
              '<p>If you believe this decision was made in error or would like to upload replacement FICA credentials, please contact our helpdesk at info@nfs.insure.</p>' ||
              '<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0;">' ||
              '<footer style="font-size: 11px; color: #64748B; line-height: 1.5;">' ||
              'NFS Insure Consultant (Pty) Ltd | FSP 53910 | Regulated by the FSCA<br>' ||
              'Eagle Canyon Office Park, Randpark Ridge | info@nfs.insure | +27 10 011 0010' ||
              '</footer></div></body></html>';

    insert into notifications (clinic_id, profile_id, channel, status, subject, body, recipient)
    values (
      new.clinic_id,
      new.profile_id,
      'email',
      'pending',
      'NFS Insure | Membership Application Decision',
      v_body,
      new.applicant_email
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_application_decision on applications;
create trigger trg_on_application_decision
  after update of status on applications
  for each row execute function trg_fn_on_application_decision();


-- =============================================================================
-- TRIGGER C: Plan Upgrade Approved
-- =============================================================================
-- Fires when plan change status is modified to approved. Sends details of the 
-- new active plan.
create or replace function trg_fn_on_plan_change_decision()
returns trigger language plpgsql security definer as $$
declare
  v_body text;
  v_member_email text;
  v_member_name text;
  v_from_plan text;
  v_to_plan text;
begin
  -- Only execute if the plan is approved
  if old.status = new.status or new.status <> 'approved' then
    return new;
  end if;

  -- Resolve emails and plan names
  select email, full_name into v_member_email, v_member_name 
  from profiles where id = (select profile_id from members where id = new.member_id);

  select name into v_from_plan from plans where id = new.from_plan_id;
  select name into v_to_plan from plans where id = new.to_plan_id;

  v_body := '<html><body style="font-family: sans-serif; color: #0D1B2A; background-color: #F5F7FA; padding: 20px;">' ||
            '<div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">' ||
            '<h2 style="color: #1A7A6E; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; margin-top: 0;">Plan Modification Approved</h2>' ||
            '<p>Dear <strong>' || coalesce(v_member_name, 'Valued Member') || '</strong>,</p>' ||
            '<p>We are pleased to confirm that your membership plan modification has been **approved** by our administration team!</p>' ||
            '<div style="background-color: #F5F7FA; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1A7A6E;">' ||
            '<p style="margin: 0;"><strong>Previous Membership Tier:</strong> ' || coalesce(v_from_plan, 'N/A') || '</p>' ||
            '<p style="margin: 5px 0 0 0;"><strong>New Membership Tier:</strong> <strong>' || coalesce(v_to_plan, 'N/A') || '</strong></p>' ||
            '<p style="margin: 5px 0 0 0;"><strong>Effective Billing Date:</strong> ' || coalesce(new.effective_date::text, 'Next debit order collection date') || '</p>' ||
            '</div>' ||
            '<p>Your new plan allowances, monthly fees, and included chronic/pharmaceutical benefits are now active on your profile dashboard.</p>' ||
            '<p>Thank you for choosing NFS Insure | Braam Health Centre.</p>' ||
            '<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0;">' ||
            '<footer style="font-size: 11px; color: #64748B; line-height: 1.5;">' ||
            'NFS Insure Consultant (Pty) Ltd | FSP 53910 | Regulated by the FSCA<br>' ||
            'Eagle Canyon Office Park, Randpark Ridge | info@nfs.insure | +27 10 011 0010' ||
            '</footer></div></body></html>';

  insert into notifications (clinic_id, member_id, channel, status, subject, body, recipient)
  values (
    new.clinic_id,
    new.member_id,
    'email',
    'pending',
    'Membership Plan Modification Confirmed',
    v_body,
    v_member_email
  );

  return new;
end;
$$;

drop trigger if exists trg_on_plan_change_decision on plan_changes;
create trigger trg_on_plan_change_decision
  after update of status on plan_changes
  for each row execute function trg_fn_on_plan_change_decision();


-- =============================================================================
-- TRIGGER D: Debit Order Collection Fails
-- =============================================================================
-- Fires when a debit order status goes to failed. Alerts the member immediately
-- and provides card payment retry links to avoid service suspension.
create or replace function trg_fn_on_debit_order_failed()
returns trigger language plpgsql security definer as $$
declare
  v_body text;
  v_member_email text;
  v_member_name text;
begin
  if old.status = new.status or new.status <> 'failed' then
    return new;
  end if;

  -- Resolve member details
  select email, full_name into v_member_email, v_member_name 
  from profiles where id = (select profile_id from members where id = new.member_id);

  if v_member_email is null then
    return new;
  end if;

  v_body := '<html><body style="font-family: sans-serif; color: #0D1B2A; background-color: #F5F7FA; padding: 20px;">' ||
            '<div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 4px solid #DC2626; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">' ||
            '<h2 style="color: #DC2626; margin-top: 0;">Urgent: Payment Collection Failed</h2>' ||
            '<p>Dear <strong>' || coalesce(v_member_name, 'Valued Member') || '</strong>,</p>' ||
            '<p>We regret to inform you that your monthly debit order collection for your primary healthcare membership has **failed**.</p>' ||
            '<div style="background-color: #FFF5F5; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; color: #7A2020;">' ||
            '<p style="margin: 0;"><strong>Failed Settle Amount:</strong> R ' || (new.amount_cents / 100.0)::numeric(10,2) || '</p>' ||
            '<p style="margin: 5px 0 0 0;"><strong>Failed Date:</strong> ' || new.collection_date || '</p>' ||
            '<p style="margin: 5px 0 0 0;"><strong>Bank Response Code:</strong> ' || coalesce(new.failure_reason, 'Insufficient funds or mandate authorization error') || '</p>' ||
            '</div>' ||
            '<p style="color: #DC2626; font-weight: bold;">⚠️ Critical Alert: To prevent your primary healthcare benefits and active clinic/medication access from being suspended, please settle this outstanding amount immediately.</p>' ||
            '<p>You can instantly settle this balance using your debit/credit card via our secure Yoco payment gateway in your Member Portal Payments tab.</p>' ||
            '<p><a href="https://braamhealthcentre.nfsconnect.co.za/member/payments" style="background-color: #1A7A6E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Retry Outstanding Settle with Card</a></p>' ||
            '<p>If you believe this payment failed in error, or if you need to adjust your banking mandates, contact NFS Insure immediately at +27 10 011 0010.</p>' ||
            '<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0;">' ||
            '<footer style="font-size: 11px; color: #64748B; line-height: 1.5;">' ||
            'NFS Insure Consultant (Pty) Ltd | FSP 53910 | Regulated by the FSCA<br>' ||
            'Eagle Canyon Office Park, Randpark Ridge | info@nfs.insure | +27 10 011 0010' ||
            '</footer></div></body></html>';

  insert into notifications (clinic_id, member_id, channel, status, subject, body, recipient)
  values (
    new.clinic_id,
    new.member_id,
    'email',
    'pending',
    'URGENT: Membership Debit Order Failed',
    v_body,
    v_member_email
  );

  return new;
end;
$$;

drop trigger if exists trg_on_debit_order_failed on debit_orders;
create trigger trg_on_debit_order_failed
  after update of status on debit_orders
  for each row execute function trg_fn_on_debit_order_failed();


-- =============================================================================
-- TRIGGER E: Appointment State Confirmed
-- =============================================================================
-- Fires when an appointment status goes to confirmed. Sends details of the GP
-- date, time, and clinic name.
create or replace function trg_fn_on_appointment_confirmed()
returns trigger language plpgsql security definer as $$
declare
  v_body text;
  v_member_email text;
  v_member_name text;
  v_clinic_name text;
begin
  if old.status = new.status or new.status <> 'confirmed' then
    return new;
  end if;

  -- Resolve member details and clinic details
  select email, full_name into v_member_email, v_member_name 
  from profiles where id = (select profile_id from members where id = new.member_id);

  select name into v_clinic_name from clinics where id = new.clinic_id;

  if v_member_email is null then
    return new;
  end if;

  v_body := '<html><body style="font-family: sans-serif; color: #0D1B2A; background-color: #F5F7FA; padding: 20px;">' ||
            '<div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">' ||
            '<h2 style="color: #1A7A6E; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; margin-top: 0;">Appointment Confirmed</h2>' ||
            '<p>Dear <strong>' || coalesce(v_member_name, 'Valued Member') || '</strong>,</p>' ||
            '<p>Your requested healthcare consultation has been **confirmed** by the clinic team at <strong>' || coalesce(v_clinic_name, 'Braam Health Centre') || '</strong>.</p>' ||
            '<div style="background-color: #F5F7FA; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1A7A6E;">' ||
            '<p style="margin: 0;"><strong>Date:</strong> ' || new.appointment_date || '</p>' ||
            '<p style="margin: 5px 0 0 0;"><strong>Time Slot:</strong> ' || new.appointment_time || '</p>' ||
            '<p style="margin: 5px 0 0 0;"><strong>Reason:</strong> ' || coalesce(new.reason, 'General GP Consultation') || '</p>' ||
            '<p style="margin: 5px 0 0 0;"><strong>Practitioner:</strong> ' || coalesce(new.doctor_name, 'Dr M J Diago') || '</p>' ||
            '</div>' ||
            '<p>To minimize delays and support social distancing inside the lobby, please arrive 5 minutes before your scheduled slot and have your mobile Digital Card scannable for verification.</p>' ||
            '<p>If you need to reschedule, please call our helpdesk at least 24 hours prior.</p>' ||
            '<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0;">' ||
            '<footer style="font-size: 11px; color: #64748B; line-height: 1.5;">' ||
            'NFS Insure Consultant (Pty) Ltd | FSP 53910 | Regulated by the FSCA<br>' ||
            'Eagle Canyon Office Park, Randpark Ridge | info@nfs.insure | +27 10 011 0010' ||
            '</footer></div></body></html>';

  insert into notifications (clinic_id, member_id, channel, status, subject, body, recipient)
  values (
    new.clinic_id,
    new.member_id,
    'email',
    'pending',
    'Appointment Confirmed - Braam Health Centre',
    v_body,
    v_member_email
  );

  return new;
end;
$$;

drop trigger if exists trg_on_appointment_confirmed on appointments;
create trigger trg_on_appointment_confirmed
  after update of status on appointments
  for each row execute function trg_fn_on_appointment_confirmed();


-- =============================================================================
-- TRIGGER F: Step-Up Authentication Request Generated
-- =============================================================================
-- Fires BEFORE INSERT on 'step_up_requests' when channel is email.
-- Automatically generates a secure 6-digit OTP, bcrypt-hashes it into otp_hash,
-- and inserts a pending verification email containing the plaintext OTP!
create or replace function trg_fn_on_step_up_request()
returns trigger language plpgsql security definer as $$
declare
  v_otp text;
  v_body text;
  v_member_email text;
  v_member_name text;
  v_clinic_id uuid;
begin
  -- Trigger only if OTP channel is email and we are creating a fresh request
  if new.otp_channel <> 'email' or new.status <> 'requested' then
    return new;
  end if;

  -- 1. Fetch user profiles and associated clinic
  select email, full_name, clinic_id into v_member_email, v_member_name, v_clinic_id
  from profiles where id = new.profile_id;

  if v_member_email is null then
    return new;
  end if;

  -- 2. Generate a secure, pseudo-random 6-digit OTP
  v_otp := lpad(floor(random() * 1000000)::text, 6, '0');

  -- 3. Hash the plaintext OTP using Blowfish/crypt and store it in otp_hash
  new.otp_hash := crypt(v_otp, gen_salt('bf'));
  new.sent_to  := v_member_email;

  -- 4. Compile the secure HTML email payload (with the PLAINTEXT OTP)
  v_body := '<html><body style="font-family: sans-serif; color: #0D1B2A; background-color: #F5F7FA; padding: 20px;">' ||
            '<div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 4px solid #C9A84C; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">' ||
            '<h3 style="color: #0D1B2A; margin-top: 0; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Security Verification Code</h3>' ||
            '<p>Dear ' || coalesce(v_member_name, 'Member') || ',</p>' ||
            '<p>A step-up identity challenge was triggered on your membership account to authorize a sensitive transaction (such as updating banking credentials or uploading legal FICA documents).</p>' ||
            '<p>Please enter the following single-use verification code inside your portal screen to complete the request:</p>' ||
            '<div style="background-color: #F8FAFC; text-align: center; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px dashed #C9A84C;">' ||
            '<span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; font-family: monospace; color: #1A7A6E;">' || v_otp || '</span>' ||
            '</div>' ||
            '<p style="font-size: 13px; color: #64748B; text-align: center; margin: 0;">This code is valid for exactly **10 minutes**. If you did not trigger this request, please log in and change your password immediately.</p>' ||
            '<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0;">' ||
            '<footer style="font-size: 10px; color: #94A3B8; text-align: center; line-height: 1.5;">' ||
            'NFS Insure Consultant (Pty) Ltd | FSP 53910 | Regulated by the FSCA<br>' ||
            'Eagle Canyon Office Park, Randpark Ridge' ||
            '</footer></div></body></html>';

  -- 5. Write to notifications queue (this will immediately fire Trigger 2 and send the mail!)
  insert into notifications (clinic_id, profile_id, channel, status, subject, body, recipient)
  values (
    v_clinic_id,
    new.profile_id,
    'email',
    'pending',
    'Security Verification Code - Step-Up Authentication',
    v_body,
    v_member_email
  );

  return new;
end;
$$;

drop trigger if exists trg_on_step_up_request on step_up_requests;
create trigger trg_on_step_up_request
  before insert on step_up_requests
  for each row execute function trg_fn_on_step_up_request();
