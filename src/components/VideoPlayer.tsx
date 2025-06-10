
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
  const [hasError, setHasError] = useState(false);
  const { trackView } = useVideoViews(video.id);

  const handlePlayVideo = useCallback(async () => {
    if (videoRef.current && isReady && !hasError) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
        trackView();
      } catch (error) {
        console.error('Error playing video:', error);
        setHasError(true);
      }
    }
  }, [trackView, isReady, hasError]);

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

  // Set video source when in view
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || hasSource) return;

    if (isInView) {
      console.log(`Setting video source for: ${video.title}`);
      // Use optimized URL if available, otherwise fall back to original
      const videoUrl = video.optimized_url || video.video_url;
      console.log(`Video URL: ${videoUrl}`);
      
      videoElement.src = videoUrl;
      videoElement.load(); // Force reload of the video
      setHasSource(true);
      setHasError(false);
    }
  }, [isInView, video.optimized_url, video.video_url, video.title, hasSource]);

  // Play/pause based on view state
  useEffect(() => {
    if (isInView && isReady && !hasError) {
      handlePlayVideo();
    } else {
      handlePauseVideo();
    }
  }, [isInView, isReady, hasError, handlePlayVideo, handlePauseVideo]);

  const handleVideoClick = () => {
    if (videoRef.current && isReady && !hasError) {
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
    setHasError(false);
  };

  const handleLoadedData = () => {
    console.log(`Video loaded data: ${video.title}`);
    setIsReady(true);
    setHasError(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error(`Video error for ${video.title}:`, e.currentTarget.error);
    setIsReady(false);
    setHasError(true);
  };

  const handleLoadStart = () => {
    console.log(`Video load start: ${video.title}`);
    setHasError(false);
  };

  return (
    <>
      {/* Thumbnail placeholder - shown until video is ready */}
      {(!isReady || hasError) && video.thumbnail_url && (
        <div className="absolute inset-0">
          <img
            src={video.thumbnail_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover blur-lg scale-110"
          />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <p className="text-lg mb-2">Video unavailable</p>
            <p className="text-sm opacity-75">Unable to load video</p>
          </div>
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
        onLoadedData={handleLoadedData}
        onError={handleError}
        onLoadStart={handleLoadStart}
        crossOrigin="anonymous"
      />

      {/* Play/Pause indicator */}
      {!isPlaying && isInView && isReady && !hasError && (
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
