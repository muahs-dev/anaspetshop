-- Alterar função handle_client_signup para aprovar automaticamente usuários staff
CREATE OR REPLACE FUNCTION public.handle_client_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Para admins com senha especial
  if new.raw_user_meta_data->>'is_admin' = 'true' then
    insert into public.profiles (id, full_name, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.email
    )
    on conflict (id) do nothing;

    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::app_role)
    on conflict (user_id, role) do nothing;
  
  -- Para staff (aprovação automática)
  elsif new.raw_user_meta_data->>'user_type' = 'staff' then
    insert into public.profiles (id, full_name, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.email
    )
    on conflict (id) do nothing;

    -- Adicionar role staff automaticamente
    insert into public.user_roles (user_id, role)
    values (new.id, 'staff'::app_role)
    on conflict (user_id, role) do nothing;
  
  else
    -- Todos os outros usuários ficam pendentes (sem role)
    insert into public.profiles (id, full_name, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.email
    )
    on conflict (id) do nothing;
    
    -- Se for cliente, criar entrada na tabela clients também
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
  end if;

  return new;
end;
$function$;