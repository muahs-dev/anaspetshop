-- Fix recursive policy on user_roles and add secure admin check
-- 1) Create SECURITY DEFINER function to check admin without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
  );
$$;

-- 2) Drop the recursive policy and replace with safe policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Allow admins to do anything on user_roles via secure function
CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Ensure users can still view their own roles
-- (Keep existing policy if present; otherwise create it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;