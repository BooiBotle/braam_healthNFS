-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO CLEAN UP CORRUPTED USERS
-- This will delete the raw SQL inserted users that are crashing your Auth server.

DELETE FROM public.profiles WHERE email IN ('admin@nfs.insure', 'staff@nfs.insure', 'staff1@nfs.insure');
DELETE FROM auth.identities WHERE id IN (SELECT id FROM auth.users WHERE email IN ('admin@nfs.insure', 'staff@nfs.insure', 'staff1@nfs.insure'));
DELETE FROM auth.users WHERE email IN ('admin@nfs.insure', 'staff@nfs.insure', 'staff1@nfs.insure');
