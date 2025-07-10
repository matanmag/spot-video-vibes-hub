-- Add missing database functions for video management

-- Function to get deletion statistics
CREATE OR REPLACE FUNCTION public.get_deletion_stats()
RETURNS TABLE (
  total_videos BIGINT,
  total_likes BIGINT,
  total_views BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.videos)::BIGINT as total_videos,
    (SELECT COUNT(*) FROM public.likes)::BIGINT as total_likes,
    (SELECT COALESCE(SUM(views), 0) FROM public.videos)::BIGINT as total_views;
END;
$$;

-- Function to get videos for deletion (with proper return type)
CREATE OR REPLACE FUNCTION public.get_videos_for_deletion()
RETURNS TABLE (
  id UUID,
  title TEXT,
  video_url TEXT,
  optimized_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  views INTEGER,
  likes_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.video_url,
    v.optimized_url,
    v.thumbnail_url,
    v.created_at,
    v.views,
    COALESCE(l.likes_count, 0) as likes_count
  FROM public.videos v
  LEFT JOIN (
    SELECT video_id, COUNT(*) as likes_count
    FROM public.likes
    GROUP BY video_id
  ) l ON v.id = l.video_id
  ORDER BY v.created_at DESC;
END;
$$;

-- Function to completely delete a video and all related data
CREATE OR REPLACE FUNCTION public.delete_video_completely(video_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete video views first
  DELETE FROM public.video_views WHERE video_id = video_id_param;
  
  -- Delete likes
  DELETE FROM public.likes WHERE video_id = video_id_param;
  
  -- Finally delete the video itself
  DELETE FROM public.videos WHERE id = video_id_param;
  
  RAISE NOTICE 'Video % and all related data deleted successfully', video_id_param;
END;
$$;