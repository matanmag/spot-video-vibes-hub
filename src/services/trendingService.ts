import { supabase } from '@/integrations/supabase/client';

export interface TrendingVideo {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  views: number;
  likes_count: number;
  created_at: string;
  spot_name: string | null;
  user_email: string | null;
}

export const fetchTrendingVideos = async (daysBack = 7) => {
  const { data, error } = await supabase.rpc('get_trending_videos', { days_back: daysBack });

  if (error) {
    throw new Error(error.message);
  }

  return data as TrendingVideo[];
};
