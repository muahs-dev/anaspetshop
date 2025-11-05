-- Make pet_id nullable in pet_expenses
ALTER TABLE pet_expenses ALTER COLUMN pet_id DROP NOT NULL;

-- Add image_url column to pet_expenses
ALTER TABLE pet_expenses ADD COLUMN image_url text;

-- Create storage bucket for expense receipts if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for expense receipts
CREATE POLICY "Expense receipts are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-receipts');

CREATE POLICY "Staff and admins can upload expense receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-receipts' AND is_admin_or_staff());

CREATE POLICY "Staff and admins can update expense receipts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'expense-receipts' AND is_admin_or_staff());

CREATE POLICY "Staff and admins can delete expense receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'expense-receipts' AND is_admin_or_staff());