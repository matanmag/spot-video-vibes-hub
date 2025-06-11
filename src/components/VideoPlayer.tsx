
import { useRef, useEffect, useState, useCallback } from 'react';
import { useVideoViews } from '@/hooks/useVideoViews';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { VideoDebugOverlay } from './video/VideoDebugOverlay';
import { VideoLoadingStates } from './video/VideoLoadingStates';
import { VideoErrorState } from './video/VideoErrorState';

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
  const { trackView } = useVideoViews(video.id);
  
  // Simplified state management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Get optimized video URL (prioritize H.264 MP4)
  const getOptimizedVideoUrl = useCallback(() => {
    const url = video.optimized_url || video.video_url;
    console.log(`Using video URL: ${url} for ${video.title}`);
    return url;
  }, [video.optimized_url, video.video_url, video.title]);

  const updateDebugInfo = useCallback((info: string) => {
    const timestamp = new Date().toISOString().split('T')[1];
    console.log(`[${timestamp}] VideoPlayer ${video.title}: ${info}`);
    setDebugInfo(info);
  }, [video.title]);

  // Intersection Observer for lazy loading
  const isInView = useIntersectionObserver({
    elementRef: containerRef,
    threshold: 0.5,
    onIntersect: (isVisible) => {
      updateDebugInfo(`In view: ${isVisible}`);
    }
  });

  // Video event handlers
  const handleCanPlay = useCallback(() => {
    updateDebugInfo('Video ready to play');
    setIsReady(true);
    setHasError(false);
  }, [updateDebugInfo]);

  const handlePlay = useCallback(() => {
    updateDebugInfo('Video started playing');
    setIsPlaying(true);
    
    // Track view only once when video actually starts playing
    if (!hasTrackedView) {
      trackView();
      setHasTrackedView(true);
    }
  }, [updateDebugInfo, trackView, hasTrackedView]);

  const handlePause = useCallback(() => {
    updateDebugInfo('Video paused');
    setIsPlaying(false);
  }, [updateDebugInfo]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = e.currentTarget.error;
    const errorMessage = error ? `Code ${error.code}: ${error.message}` : 'Unknown error';
    console.error('Video error:', error);
    updateDebugInfo(`Error: ${errorMessage}`);
    setHasError(true);
    setIsReady(false);
  }, [updateDebugInfo]);

  const handleLoadStart = useCallback(() => {
    updateDebugInfo('Video loading started');
    setHasError(false);
  }, [updateDebugInfo]);

  const handleWaiting = useCallback(() => {
    updateDebugInfo('Video buffering...');
  }, [updateDebugInfo]);

  const handleLoadedData = useCallback(() => {
    updateDebugInfo('Video data loaded');
  }, [updateDebugInfo]);

  // Load video when in view
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isInView) return;

    const videoUrl = getOptimizedVideoUrl();
    if (videoElement.src !== videoUrl) {
      updateDebugInfo(`Loading video: ${videoUrl}`);
      videoElement.src = videoUrl;
      videoElement.load();
    }
  }, [isInView, getOptimizedVideoUrl, updateDebugInfo]);

  const handleRetry = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      updateDebugInfo('Retrying video load...');
      setHasError(false);
      setIsReady(false);
      videoElement.load();
    }
  }, [updateDebugInfo]);

  return (
    <>
      {/* Debug overlay - only in development */}
      <VideoDebugOverlay
        debugInfo={debugInfo}
        isReady={isReady}
        hasError={hasError}
        isInView={isInView}
        hasSource={!!getOptimizedVideoUrl()}
        isPlaying={isPlaying}
        isMobile={false}
        hasUserInteracted={true}
        loadAttempts={0}
      />

      {/* Loading states - show thumbnail until ready */}
      <VideoLoadingStates
        isReady={isReady}
        hasError={hasError}
        thumbnailUrl={video.thumbnail_url}
      />

      {/* Error state */}
      <VideoErrorState
        hasError={hasError}
        isMobile={false}
        debugInfo={debugInfo}
        onRetry={handleRetry}
      />

      {/* Video Element with native autoplay */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={video.thumbnail_url}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onWaiting={handleWaiting}
        onLoadedData={handleLoadedData}
        crossOrigin="anonymous"
        style={{
          WebkitPlaysinline: true,
        } as React.CSSProperties}
      />
    </>
  );
};

export default VideoPlayer;
