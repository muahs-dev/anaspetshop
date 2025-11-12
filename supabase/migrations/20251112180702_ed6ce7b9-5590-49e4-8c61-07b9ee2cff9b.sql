-- Create approval history table
CREATE TABLE IF NOT EXISTS public.approval_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('approved', 'rejected')),
  assigned_role app_role,
  approved_by uuid NOT NULL,
  approved_by_email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view approval history
CREATE POLICY "Admins can view approval history"
ON public.approval_history
FOR SELECT
USING (is_admin());

-- Only admins can insert approval history
CREATE POLICY "Admins can insert approval history"
ON public.approval_history
FOR INSERT
WITH CHECK (is_admin());

-- Create index for faster queries
CREATE INDEX idx_approval_history_created_at ON public.approval_history(created_at DESC);
CREATE INDEX idx_approval_history_user_id ON public.approval_history(user_id);