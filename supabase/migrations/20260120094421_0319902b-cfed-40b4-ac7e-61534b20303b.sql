-- Add status column to notices table
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Update existing notices to be published (since they were created before status existed)
UPDATE public.notices SET status = 'published' WHERE status = 'draft';

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Notices are viewable by everyone" ON public.notices;

-- Create policy for students/public to only see published notices
CREATE POLICY "Published notices are viewable by everyone"
ON public.notices
FOR SELECT
USING (status = 'published');

-- Create policy for admins to view all notices
CREATE POLICY "Admins can view all notices"
ON public.notices
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to insert notices
CREATE POLICY "Admins can insert notices"
ON public.notices
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to update notices
CREATE POLICY "Admins can update notices"
ON public.notices
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to delete notices
CREATE POLICY "Admins can delete notices"
ON public.notices
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));