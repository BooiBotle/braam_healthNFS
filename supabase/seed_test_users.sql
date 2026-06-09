-- Bulletproof Test Users Seed Script
-- Run this in your Supabase SQL Editor. It safely cleans up old test accounts before creating new ones.

-- 1. Create a default clinic if one doesn't exist
INSERT INTO public.clinics (name, slug, address_line1, phone, email)
SELECT 'Braam Health Centre', 'braam-health-centre', 'Eagle Canyon Office Park', '011 123 4567', 'info@nfs.insure'
WHERE NOT EXISTS (SELECT 1 FROM public.clinics WHERE name = 'Braam Health Centre');

-- Get the clinic ID
DO $$
DECLARE
    v_clinic_id uuid;
    admin_id uuid := gen_random_uuid();
    staff_id uuid := gen_random_uuid();
    old_admin_id uuid;
    old_staff_id uuid;
BEGIN
    SELECT id INTO v_clinic_id FROM public.clinics LIMIT 1;

    ------------------------------------------------------------------
    -- A. CLEANUP OLD ACCOUNTS (Avoids foreign key conflicts)
    ------------------------------------------------------------------
    
    -- Cleanup Admin
    SELECT id INTO old_admin_id FROM auth.users WHERE email = 'admin@nfs.insure';
    IF old_admin_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = old_admin_id;
        DELETE FROM auth.identities WHERE user_id = old_admin_id;
        DELETE FROM auth.users WHERE id = old_admin_id;
    END IF;

    -- Cleanup Staff
    SELECT id INTO old_staff_id FROM auth.users WHERE email = 'staff@nfs.insure';
    IF old_staff_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = old_staff_id;
        DELETE FROM auth.identities WHERE user_id = old_staff_id;
        DELETE FROM auth.users WHERE id = old_staff_id;
    END IF;

    ------------------------------------------------------------------
    -- B. CREATE ADMIN USER
    ------------------------------------------------------------------
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@nfs.insure',
        crypt('TestAdmin123!', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        now(),
        now()
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        admin_id,
        format('{"sub": "%s", "email": "%s"}', admin_id::text, 'admin@nfs.insure')::jsonb,
        'email',
        admin_id::text,
        now(),
        now(),
        now()
    );

    ------------------------------------------------------------------
    -- C. CREATE STAFF USER
    ------------------------------------------------------------------
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        staff_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'staff@nfs.insure',
        crypt('TestStaff123!', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        now(),
        now()
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        staff_id,
        format('{"sub": "%s", "email": "%s"}', staff_id::text, 'staff@nfs.insure')::jsonb,
        'email',
        staff_id::text,
        now(),
        now(),
        now()
    );

    ------------------------------------------------------------------
    -- D. ASSIGN PROFILES & ROLES
    ------------------------------------------------------------------
    INSERT INTO public.profiles (id, clinic_id, portal_role, first_name, last_name, is_active)
    VALUES (admin_id, v_clinic_id, 'admin', 'System', 'Admin', true)
    ON CONFLICT (id) DO UPDATE SET portal_role = 'admin', clinic_id = EXCLUDED.clinic_id;

    INSERT INTO public.profiles (id, clinic_id, portal_role, first_name, last_name, is_active)
    VALUES (staff_id, v_clinic_id, 'staff', 'Clinic', 'Staff', true)
    ON CONFLICT (id) DO UPDATE SET portal_role = 'staff', clinic_id = EXCLUDED.clinic_id;

END $$;
