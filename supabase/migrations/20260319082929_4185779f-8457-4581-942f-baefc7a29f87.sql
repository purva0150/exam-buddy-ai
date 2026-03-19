
-- Remove the FK constraint on profiles.id so we can insert sample faculty
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
