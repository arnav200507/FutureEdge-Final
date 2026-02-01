-- Create student_forms table
CREATE TABLE public.student_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  form_name TEXT NOT NULL,
  exam_type TEXT,
  round TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_forms ENABLE ROW LEVEL SECURITY;

-- Deny direct access (use edge function instead)
CREATE POLICY "Deny direct access to student_forms"
  ON public.student_forms
  FOR ALL
  USING (false);

-- Create trigger for updated_at
CREATE TRIGGER update_student_forms_updated_at
  BEFORE UPDATE ON public.student_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for forms (private, admin-only upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('student-forms', 'student-forms', false, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']);

-- Storage policies: Only admin can upload/manage, students can download their own
CREATE POLICY "Admin can upload forms"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'student-forms');

CREATE POLICY "Admin can update forms"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'student-forms');

CREATE POLICY "Admin can delete forms"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'student-forms');

CREATE POLICY "Students can download their forms"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'student-forms');