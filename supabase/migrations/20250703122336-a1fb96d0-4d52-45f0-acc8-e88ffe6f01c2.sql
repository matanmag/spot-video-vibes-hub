-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts and recreate them consistently
DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;
DROP POLICY IF EXISTS "Users can create their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Videos table policies
CREATE POLICY "Allow select for authenticated users on videos" 
ON public.videos 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow insert when user_id matches auth.uid() on videos" 
ON public.videos 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update when user_id matches auth.uid() on videos" 
ON public.videos 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow delete when user_id matches auth.uid() on videos" 
ON public.videos 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Likes table policies
CREATE POLICY "Allow select for authenticated users on likes" 
ON public.likes 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow insert when user_id matches auth.uid() on likes" 
ON public.likes 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update when user_id matches auth.uid() on likes" 
ON public.likes 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow delete when user_id matches auth.uid() on likes" 
ON public.likes 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Profiles table policies
CREATE POLICY "Allow select for authenticated users on profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow insert when id matches auth.uid() on profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow update when id matches auth.uid() on profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Allow delete when id matches auth.uid() on profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (auth.uid() = id);