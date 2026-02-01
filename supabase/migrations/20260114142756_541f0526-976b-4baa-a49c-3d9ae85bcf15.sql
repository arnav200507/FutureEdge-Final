-- Deny all direct access to students table (contains password_hash)
-- All operations go through edge functions using service role
CREATE POLICY "Deny direct select on students"
ON public.students FOR SELECT
USING (false);

CREATE POLICY "Deny direct insert on students"
ON public.students FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny direct update on students"
ON public.students FOR UPDATE
USING (false);

CREATE POLICY "Deny direct delete on students"
ON public.students FOR DELETE
USING (false);

-- Secure the password_reset_tokens table
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny direct access to password_reset_tokens"
ON public.password_reset_tokens FOR ALL
USING (false);