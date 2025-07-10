-- Add foreign key relationship between videos.user_id and profiles.id
-- This allows joining videos with user profiles
ALTER TABLE public.videos 
ADD CONSTRAINT videos_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;