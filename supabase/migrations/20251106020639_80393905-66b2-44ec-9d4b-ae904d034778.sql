-- Modificar trigger para deixar usuários pendentes de aprovação
-- Agora apenas cria o profile, sem criar role automaticamente
create or replace function public.handle_client_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Para todos os usuários (exceto admins com senha especial), apenas criar profile
  -- Admin vai aprovar e definir a role depois
  
  if new.raw_user_meta_data->>'is_admin' = 'true' then
    -- Apenas admins com senha especial recebem role imediatamente
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
$$;