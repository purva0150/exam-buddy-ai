
-- Re-add FK constraints so PostgREST can do joins
ALTER TABLE public.duty_assignments
  ADD CONSTRAINT duty_assignments_faculty_id_fkey
  FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.nlp_requests
  ADD CONSTRAINT nlp_requests_faculty_id_fkey
  FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conflicts
  ADD CONSTRAINT conflicts_faculty_id_fkey
  FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
