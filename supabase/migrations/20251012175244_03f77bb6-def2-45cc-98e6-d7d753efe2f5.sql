-- Add 'client' role to app_role enum and link clients table to auth
-- 1) Add 'client' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- 2) Add user_id to clients table to link with auth.users
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3) Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- 4) Update RLS policies for clients table to allow client users to view/edit their own data
DROP POLICY IF EXISTS "Only staff and admins can access clients" ON public.clients;

-- Clients can view and update their own profile
CREATE POLICY "Clients can view their own profile"
ON public.clients
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Clients can update their own profile"
ON public.clients
FOR UPDATE
USING (auth.uid() = user_id);

-- Staff and admins can view all clients
CREATE POLICY "Staff and admins can view all clients"
ON public.clients
FOR SELECT
USING (is_admin_or_staff());

-- Staff and admins can insert clients
CREATE POLICY "Staff and admins can insert clients"
ON public.clients
FOR INSERT
WITH CHECK (is_admin_or_staff());

-- Staff and admins can update all clients
CREATE POLICY "Staff and admins can update all clients"
ON public.clients
FOR UPDATE
USING (is_admin_or_staff());

-- Staff and admins can delete clients
CREATE POLICY "Staff and admins can delete clients"
ON public.clients
FOR DELETE
USING (is_admin_or_staff());

-- 5) Update trigger to create client profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_client_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if signing up as client (based on metadata)
  IF NEW.raw_user_meta_data->>'user_type' = 'client' THEN
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for client signup
DROP TRIGGER IF EXISTS on_client_user_created ON auth.users;
CREATE TRIGGER on_client_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_client_signup();