-- Create student_documents table
CREATE TABLE public.student_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 're-upload'))
);

-- Enable RLS
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Deny all direct access (handled via edge functions)
CREATE POLICY "Deny direct access to student_documents"
ON public.student_documents
FOR ALL
USING (false);

-- Create trigger for updated_at
CREATE TRIGGER update_student_documents_updated_at
BEFORE UPDATE ON public.student_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for student documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-documents',
  'student-documents',
  false,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
);

-- Storage policies for student documents
CREATE POLICY "Students can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Students can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'student-documents'
);

CREATE POLICY "Students can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'student-documents'
);

CREATE POLICY "Students can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'student-documents'
);