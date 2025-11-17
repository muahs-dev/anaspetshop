-- Atualizar função handle_client_signup para sempre criar admin
create or replace function public.handle_client_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Criar sempre o perfil
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;

  -- 2. Atribuir sempre o papel de admin
  insert into public.user_roles (user_id, role)
  values (new.id, 'admin'::app_role)
  on conflict (user_id, role) do nothing;

  -- 3. (Opcional) Se for cliente, criar entrada na tabela clients
  if new.raw_user_meta_data->>'user_type' = 'client' then
    insert into public.clients (user_id, full_name, phone, email)
    select new.id,
           coalesce(new.raw_user_meta_data->>'full_name', ''),
           coalesce(new.raw_user_meta_data->>'phone', ''),
           new.email
    where not exists (
      select 1 from public.clients c where c.user_id = new.id
    );
  end if;

  return new;
end;
$$;