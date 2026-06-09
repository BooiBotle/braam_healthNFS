-- =============================================================================
-- NFS INSURE | BRAAM HEALTH CENTRE
-- Admin Full Access RLS Override Script
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- 1. Enable RLS on all core tables (in case it wasn't already)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dispenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE debit_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependants ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- 2. Create the Admin Override Policies
-- These policies grant ALL privileges (SELECT, INSERT, UPDATE, DELETE)
-- to any user whose portal_role is 'admin' or 'super_admin'.

-- PROFILES
DROP POLICY IF EXISTS "Admin Full Access on Profiles" ON profiles;
CREATE POLICY "Admin Full Access on Profiles"
ON profiles FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- MEMBERS
DROP POLICY IF EXISTS "Admin Full Access on Members" ON members;
CREATE POLICY "Admin Full Access on Members"
ON members FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- APPLICATIONS
DROP POLICY IF EXISTS "Admin Full Access on Applications" ON applications;
CREATE POLICY "Admin Full Access on Applications"
ON applications FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- CONSULTATIONS
DROP POLICY IF EXISTS "Admin Full Access on Consultations" ON consultations;
CREATE POLICY "Admin Full Access on Consultations"
ON consultations FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- APPOINTMENTS
DROP POLICY IF EXISTS "Admin Full Access on Appointments" ON appointments;
CREATE POLICY "Admin Full Access on Appointments"
ON appointments FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- MEDICATION DISPENSES
DROP POLICY IF EXISTS "Admin Full Access on Meds" ON medication_dispenses;
CREATE POLICY "Admin Full Access on Meds"
ON medication_dispenses FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- DEBIT ORDERS
DROP POLICY IF EXISTS "Admin Full Access on Debits" ON debit_orders;
CREATE POLICY "Admin Full Access on Debits"
ON debit_orders FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- PLAN CHANGES
DROP POLICY IF EXISTS "Admin Full Access on Plan Changes" ON plan_changes;
CREATE POLICY "Admin Full Access on Plan Changes"
ON plan_changes FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- DEPENDANTS
DROP POLICY IF EXISTS "Admin Full Access on Dependants" ON dependants;
CREATE POLICY "Admin Full Access on Dependants"
ON dependants FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- KYC DOCUMENTS
DROP POLICY IF EXISTS "Admin Full Access on KYC" ON kyc_documents;
CREATE POLICY "Admin Full Access on KYC"
ON kyc_documents FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE portal_role IN ('admin', 'super_admin'))
);

-- NOTE: As an admin, you will now bypass any clinic-level isolation,
-- giving you complete visibility over all system users and records.
