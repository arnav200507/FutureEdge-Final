-- Add new columns for student profile
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS alternate_contact_number text,
ADD COLUMN IF NOT EXISTS home_state text,
ADD COLUMN IF NOT EXISTS preferred_branches text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_colleges text[] DEFAULT '{}';