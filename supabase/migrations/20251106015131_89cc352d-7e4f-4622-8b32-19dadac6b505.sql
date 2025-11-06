-- Fix signup trigger to avoid duplicate role inserts and idempotent client creation
create or replace function public.handle_client_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- If signing up as admin
  if new.raw_user_meta_data->>'is_admin' = 'true' then
    -- Create or keep profile
    insert into public.profiles (id, full_name, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.email
    )
    on conflict (id) do nothing;

    -- Assign admin role (idempotent)
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::app_role)
    on conflict (user_id, role) do nothing;

  elsif new.raw_user_meta_data->>'user_type' = 'client' then
    -- Create or keep profile
    insert into public.profiles (id, full_name, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.email
    )
    on conflict (id) do nothing;

    -- Create client only if not exists for this user
    insert into public.clients (user_id, full_name, phone, email)
    select new.id,
           coalesce(new.raw_user_meta_data->>'full_name', ''),
           coalesce(new.raw_user_meta_data->>'phone', ''),
           new.email
    where not exists (
      select 1 from public.clients c where c.user_id = new.id
    );

    -- Assign client role (idempotent)
    insert into public.user_roles (user_id, role)
    values (new.id, 'client'::app_role)
    on conflict (user_id, role) do nothing;

  else
    -- Default: create only profile
    insert into public.profiles (id, full_name, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.email
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;
