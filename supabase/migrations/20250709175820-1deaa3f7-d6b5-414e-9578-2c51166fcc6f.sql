-- Update comments table to use 'body' instead of 'text' and add admin override to RLS policies
ALTER TABLE public.comments RENAME COLUMN text TO body;

-- Update RLS policies to include admin override for delete/update
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;

-- Create new policies with admin override
CREATE POLICY "Users can delete their own comments or admins can delete any" 
ON public.comments 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their own comments or admins can update any" 
ON public.comments 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- Update get_trending_videos function to match specification
CREATE OR REPLACE FUNCTION public.get_trending_videos(days_back integer DEFAULT 7)
RETURNS TABLE(
  id uuid, 
  title text, 
  thumbnail_url text, 
  video_url text, 
  views integer, 
  likes_count bigint, 
  created_at timestamp with time zone, 
  spot_name text, 
  user_email text
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
  LIMIT 20;
END;
$$;