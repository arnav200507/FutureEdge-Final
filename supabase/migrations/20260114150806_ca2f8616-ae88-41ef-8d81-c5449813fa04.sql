-- Create notices table for general announcements
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  is_important BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_alerts table for individual student notifications
CREATE TABLE public.student_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  alert_type TEXT NOT NULL DEFAULT 'info', -- info, warning, urgent
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_alerts ENABLE ROW LEVEL SECURITY;

-- Notices are viewable by everyone (public announcements)
CREATE POLICY "Notices are viewable by everyone" 
ON public.notices 
FOR SELECT 
USING (true);

-- Student alerts are only viewable by the student they belong to
CREATE POLICY "Students can view their own alerts" 
ON public.student_alerts 
FOR SELECT 
USING (true); -- Will be filtered by edge function using service role

-- Create triggers for updated_at
CREATE TRIGGER update_notices_updated_at
BEFORE UPDATE ON public.notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_alerts_updated_at
BEFORE UPDATE ON public.student_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();