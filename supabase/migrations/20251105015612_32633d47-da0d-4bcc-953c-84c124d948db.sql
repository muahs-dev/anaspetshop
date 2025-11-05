-- Create pet_expenses table
CREATE TABLE public.pet_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pet_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for staff and admins
CREATE POLICY "Only staff and admins can access pet expenses"
ON public.pet_expenses
FOR ALL
USING (is_admin_or_staff());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pet_expenses_updated_at
BEFORE UPDATE ON public.pet_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();