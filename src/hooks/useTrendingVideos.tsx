import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrendingVideo {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  views: number;
  likes_count: number;
  created_at: string;
  spot_name: string;
  user_email: string;
}

export const useTrendingVideos = (daysBack: number = 7) => {
  const {
    data: videos = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['trending-videos', daysBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_videos', {
        days_back: daysBack
      });

      if (error) throw error;
      return data as TrendingVideo[];
    },
  });

  return {
    videos,
    isLoading,
    error,
    refetch,
  };
};