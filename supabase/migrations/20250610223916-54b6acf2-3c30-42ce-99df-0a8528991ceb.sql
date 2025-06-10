
-- Add the optimized_url column to the videos table
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS optimized_url TEXT;
