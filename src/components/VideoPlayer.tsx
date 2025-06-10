
import { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoViews } from '@/hooks/useVideoViews';

interface Video {
  id: string;
  title: string;
  video_url: string;
  optimized_url?: string;
  thumbnail_url?: string;
}

interface VideoPlayerProps {
  video: Video;
  containerRef: React.RefObject<HTMLDivElement>;
}

const VideoPlayer = ({ video, containerRef }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasSource, setHasSource] = useState(false);
  const { trackView } = useVideoViews(video.id);

  const handlePlayVideo = useCallback(async () => {
    if (videoRef.current && isReady) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
        trackView();
      } catch (error) {
        console.error('Error playing video:', error);
      }
    }
  }, [trackView, isReady]);

  const handlePauseVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Intersection observer for detecting when video is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.7;
        
        setIsInView(isVisible);
      },
      {
        threshold: [0.7],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef]);

  // Lazy loading: attach src only when in view
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || hasSource) return;

    if (isInView) {
      // Use optimized URL if available, otherwise fall back to original
      const videoUrl = video.optimized_url || video.video_url;
      videoElement.src = videoUrl;
      setHasSource(true);
      console.log(`Loading video source: ${video.title}`);
    }
  }, [isInView, video.optimized_url, video.video_url, video.title, hasSource]);

  // Play/pause based on view state
  useEffect(() => {
    if (isInView && isReady) {
      handlePlayVideo();
    } else {
      handlePauseVideo();
    }
  }, [isInView, isReady, handlePlayVideo, handlePauseVideo]);

  const handleVideoClick = () => {
    if (videoRef.current && isReady) {
      if (isPlaying) {
        handlePauseVideo();
      } else {
        handlePlayVideo();
      }
    }
  };

  const handleCanPlay = () => {
    console.log(`Video ready: ${video.title}`);
    setIsReady(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error(`Video error for ${video.title}:`, e);
    setIsReady(false);
  };

  return (
    <>
      {/* Thumbnail placeholder - shown until video is ready */}
      {!isReady && video.thumbnail_url && (
        <div className="absolute inset-0">
          <img
            src={video.thumbnail_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover blur-lg scale-110"
          />
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover cursor-pointer"
        preload="metadata"
        muted
        playsInline
        loop
        poster={video.thumbnail_url}
        onClick={handleVideoClick}
        onCanPlay={handleCanPlay}
        onError={handleError}
      />

      {/* Play/Pause indicator */}
      {!isPlaying && isInView && isReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;
