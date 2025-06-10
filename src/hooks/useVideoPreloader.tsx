
import { useEffect, useRef } from 'react';

interface Video {
  id: string;
  video_url: string;
  optimized_720p_url?: string;
  optimized_480p_url?: string;
}

export const useVideoPreloader = (
  videos: Video[],
  currentIndex: number,
  preferredQuality: string = '720p'
) => {
  const preloadedVideos = useRef<Set<string>>(new Set());

  useEffect(() => {
    const preloadVideo = (video: Video) => {
      if (preloadedVideos.current.has(video.id)) return;

      let videoUrl = video.video_url;
      
      // Select optimal URL based on quality preference
      if (preferredQuality === '480p' && video.optimized_480p_url) {
        videoUrl = video.optimized_480p_url;
      } else if (preferredQuality === '720p' && video.optimized_720p_url) {
        videoUrl = video.optimized_720p_url;
      }

      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = videoUrl;
      videoElement.load();

      preloadedVideos.current.add(video.id);
      console.log(`Preloaded video: ${video.id}`);
    };

    // Preload current, next, and previous videos
    const currentVideo = videos[currentIndex];
    const nextVideo = videos[currentIndex + 1];
    const prevVideo = videos[currentIndex - 1];

    if (currentVideo) preloadVideo(currentVideo);
    if (nextVideo) preloadVideo(nextVideo);
    if (prevVideo) preloadVideo(prevVideo);

  }, [videos, currentIndex, preferredQuality]);

  return { preloadedVideos: preloadedVideos.current };
};
