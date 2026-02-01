-- Add must_change_password flag to students table
ALTER TABLE public.students 
ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT true;

-- Create a view that hides sensitive data (password_hash)
CREATE VIEW public.students_public
WITH (security_invoker=on) AS
  SELECT id, registration_number, email, full_name, must_change_password, created_at, updated_at
  FROM public.students;