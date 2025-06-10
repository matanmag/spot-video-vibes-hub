
-- Add last_spot_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN last_spot_id uuid REFERENCES public.spots(id);
