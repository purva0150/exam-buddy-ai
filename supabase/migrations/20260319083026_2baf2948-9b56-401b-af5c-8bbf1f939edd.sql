
-- Remove FK constraints on duty_assignments so sample faculty can be assigned
ALTER TABLE public.duty_assignments DROP CONSTRAINT IF EXISTS duty_assignments_faculty_id_fkey;
ALTER TABLE public.conflicts DROP CONSTRAINT IF EXISTS conflicts_faculty_id_fkey;
ALTER TABLE public.nlp_requests DROP CONSTRAINT IF EXISTS nlp_requests_faculty_id_fkey;
