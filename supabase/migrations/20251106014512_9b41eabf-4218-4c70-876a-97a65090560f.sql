-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_handle_client ON auth.users;

-- Update the handle_client_signup function to handle admin signup
CREATE OR REPLACE FUNCTION public.handle_client_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if signing up as admin (based on metadata)
  IF NEW.raw_user_meta_data->>'is_admin' = 'true' THEN
    -- Create profile
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role);
    
  -- Check if signing up as client (based on metadata)
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'client' THEN
    -- Create profile
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create client record
    INSERT INTO public.clients (user_id, full_name, phone, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      NEW.email
    );
    
    -- Assign client role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client'::app_role);
  ELSE
    -- Default: create only profile, no role (will need admin approval)
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_handle_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_client_signup();