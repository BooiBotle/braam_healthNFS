-- Allow anon to read active clinics
DROP POLICY IF EXISTS "clinics_select_anon" ON clinics;
CREATE POLICY "clinics_select_anon" ON clinics FOR SELECT TO anon USING (is_active = true);

-- Allow anon to read active plans
DROP POLICY IF EXISTS "plans_select_anon" ON plans;
CREATE POLICY "plans_select_anon" ON plans FOR SELECT TO anon USING (is_active = true);
