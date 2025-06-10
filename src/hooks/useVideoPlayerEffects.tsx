
import { useEffect } from 'react';
import { useVideoViews } from '@/hooks/useVideoViews';

interface Video {
  id: string;
  title: string;
  video_url: string;
  optimized_720p_url?: string;
  optimized_480p_url?: string;
  optimized_1080p_url?: string;
  thumbnail_url?: string;
}

interface UseVideoPlayerEffectsProps {
  video: Video;
  containerRef: React.RefObject<HTMLDivElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  currentVideoUrl: string;
  setIsInView: (value: boolean) => void;
  setIsPlaying: (value: boolean) => void;
}

export const useVideoPlayerEffects = ({
  video,
  containerRef,
  videoRef,
  currentVideoUrl,
  setIsInView,
  setIsPlaying
}: UseVideoPlayerEffectsProps) => {
  const { trackView } = useVideoViews(video.id);

  // Intersection Observer Effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
        
        if (videoRef.current) {
          if (entry.isIntersecting) {
            trackView();
            
            videoRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch((error) => {
              console.error('Error playing video:', error);
            });
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, trackView, setIsInView, setIsPlaying, videoRef]);

  // Video Source Update Effect
  useEffect(() => {
    if (videoRef.current && currentVideoUrl) {
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      videoRef.current.src = currentVideoUrl;
      videoRef.current.currentTime = currentTime;
      
      if (wasPlaying) {
        videoRef.current.play();
      }
    }
  }, [currentVideoUrl, videoRef]);
};
