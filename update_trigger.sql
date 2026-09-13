create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, first_name, last_name, phone, portal_role, clinic_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'portal_role')::portal_role, 'member'),
    (new.raw_user_meta_data->>'clinic_id')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
