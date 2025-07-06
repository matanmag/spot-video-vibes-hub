-- Drop the existing foreign key that points to auth.users
ALTER TABLE public.videos 
DROP CONSTRAINT videos_user_id_fkey;

-- Add the correct foreign key that points to public.profiles
ALTER TABLE public.videos 
ADD CONSTRAINT videos_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;