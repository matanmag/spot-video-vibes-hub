
import { useCallback } from 'react';
import { logger } from '@/utils/logger';

interface Video {
  id: string;
  title: string;
  video_url: string;
  optimized_url?: string;
  thumbnail_url?: string;
}

export const useVideoUrl = (video: Video) => {
  const getOptimizedVideoUrl = useCallback(() => {
    const url = video.optimized_url || video.video_url;
    logger.info(`Using video URL: ${url} for ${video.title}`);
    return url;
  }, [video.optimized_url, video.video_url, video.title]);

  return { getOptimizedVideoUrl };
};
