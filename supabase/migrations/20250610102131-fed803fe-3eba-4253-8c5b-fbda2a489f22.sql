
-- 1. Add views column to videos table
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;

-- 2. Add unique constraint to likes table for safety (PostgreSQL compatible syntax)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'likes_unique' 
        AND conrelid = 'public.likes'::regclass
    ) THEN
        ALTER TABLE public.likes 
        ADD CONSTRAINT likes_unique UNIQUE(user_id, video_id);
    END IF;
END $$;

-- 3. Create video_views table for tracking view uniqueness
CREATE TABLE IF NOT EXISTS public.video_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  viewer TEXT NOT NULL, -- user_id or IP address
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, viewer)
);

-- Enable RLS on video_views
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert video views (for anonymous tracking)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'video_views' 
        AND policyname = 'Anyone can track video views'
    ) THEN
        CREATE POLICY "Anyone can track video views" 
          ON public.video_views 
          FOR INSERT 
          WITH CHECK (true);
    END IF;
END $$;

-- Allow anyone to select video views (for counting)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'video_views' 
        AND policyname = 'Anyone can view video views'
    ) THEN
        CREATE POLICY "Anyone can view video views" 
          ON public.video_views 
          FOR SELECT 
          USING (true);
    END IF;
END $$;

-- 4. Update storage bucket file size limit to 200MB
UPDATE storage.buckets
SET file_size_limit = 209715200
WHERE id = 'videos-public';
