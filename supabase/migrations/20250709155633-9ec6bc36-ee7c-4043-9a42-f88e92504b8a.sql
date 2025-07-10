-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Anyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create get_trending_videos function
CREATE OR REPLACE FUNCTION public.get_trending_videos(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  id UUID,
  title TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  views INTEGER,
  likes_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  spot_name TEXT,
  user_email TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.thumbnail_url,
    v.video_url,
    COALESCE(v.views, 0) as views,
    COALESCE(l.likes_count, 0) as likes_count,
    v.created_at,
    s.name as spot_name,
    p.email as user_email
  FROM public.videos v
  LEFT JOIN public.spots s ON v.spot_id = s.id
  LEFT JOIN public.profiles p ON v.user_id = p.id
  LEFT JOIN (
    SELECT video_id, COUNT(*) as likes_count
    FROM public.likes
    GROUP BY video_id
  ) l ON v.id = l.video_id
  WHERE v.created_at >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY (COALESCE(v.views, 0) + COALESCE(l.likes_count, 0)) DESC
  LIMIT 50;
END;
$$;