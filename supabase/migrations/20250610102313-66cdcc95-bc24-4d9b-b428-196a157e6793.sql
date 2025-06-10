
-- Create RPC function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.videos 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = video_id;
END;
$$;
