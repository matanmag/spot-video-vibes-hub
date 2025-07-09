import { useQuery } from '@tanstack/react-query';
import { fetchTrendingVideos, TrendingVideo } from '@/services/trendingService';

export const useTrendingVideos = (daysBack = 7) => {
  return useQuery<TrendingVideo[]>({
    queryKey: ['trendingVideos', daysBack],
    queryFn: () => fetchTrendingVideos(daysBack),
  });
};
