
-- First, let's check what policies already exist and only create the missing ones

-- Enable RLS on tables (these commands are safe to run even if already enabled)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
-- For videos table
DO $$
BEGIN
    -- Check and create "Users can create their own videos" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND policyname = 'Users can create their own videos'
    ) THEN
        CREATE POLICY "Users can create their own videos" 
          ON public.videos 
          FOR INSERT 
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Check and create "Users can update their own videos" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND policyname = 'Users can update their own videos'
    ) THEN
        CREATE POLICY "Users can update their own videos" 
          ON public.videos 
          FOR UPDATE 
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;

    -- Check and create "Users can delete their own videos" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND policyname = 'Users can delete their own videos'
    ) THEN
        CREATE POLICY "Users can delete their own videos" 
          ON public.videos 
          FOR DELETE 
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;
END
$$;

-- For likes table
DO $$
BEGIN
    -- Check and create "Users can create their own likes" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' 
        AND policyname = 'Users can create their own likes'
    ) THEN
        CREATE POLICY "Users can create their own likes" 
          ON public.likes 
          FOR INSERT 
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Check and create "Anyone can view likes" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' 
        AND policyname = 'Anyone can view likes'
    ) THEN
        CREATE POLICY "Anyone can view likes" 
          ON public.likes 
          FOR SELECT 
          USING (true);
    END IF;

    -- Check and create "Users can delete their own likes" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' 
        AND policyname = 'Users can delete their own likes'
    ) THEN
        CREATE POLICY "Users can delete their own likes" 
          ON public.likes 
          FOR DELETE 
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;
END
$$;
