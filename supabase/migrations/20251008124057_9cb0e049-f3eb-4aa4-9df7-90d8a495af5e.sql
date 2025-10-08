-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS policy for user_roles (users can view their own roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- 6. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 7. Create helper function to check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
  )
$$;

-- 8. Drop all existing permissive RLS policies
DROP POLICY IF EXISTS "Authenticated users can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can view all pets" ON public.pets;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can view all vaccines" ON public.vaccines;

-- 9. Create new role-based RLS policies for clients
CREATE POLICY "Only staff and admins can access clients"
ON public.clients
FOR ALL
USING (public.is_admin_or_staff());

-- 10. Create new role-based RLS policies for pets
CREATE POLICY "Only staff and admins can access pets"
ON public.pets
FOR ALL
USING (public.is_admin_or_staff());

-- 11. Create new role-based RLS policies for appointments
CREATE POLICY "Only staff and admins can access appointments"
ON public.appointments
FOR ALL
USING (public.is_admin_or_staff());

-- 12. Create new role-based RLS policies for transactions
CREATE POLICY "Only staff and admins can access transactions"
ON public.transactions
FOR ALL
USING (public.is_admin_or_staff());

-- 13. Create new role-based RLS policies for vaccines
CREATE POLICY "Only staff and admins can access vaccines"
ON public.vaccines
FOR ALL
USING (public.is_admin_or_staff());

-- 14. Update storage policies for pet-photos bucket
DROP POLICY IF EXISTS "Anyone can view pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pet photos" ON storage.objects;

CREATE POLICY "Anyone can view pet photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pet-photos');

CREATE POLICY "Only staff and admins can upload pet photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pet-photos' 
  AND public.is_admin_or_staff()
);

CREATE POLICY "Only staff and admins can update pet photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'pet-photos' 
  AND public.is_admin_or_staff()
);

CREATE POLICY "Only staff and admins can delete pet photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'pet-photos' 
  AND public.is_admin_or_staff()
);