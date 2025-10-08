-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create new policy: users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create new policy: admins and staff can view all profiles
CREATE POLICY "Admins and staff can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin_or_staff());