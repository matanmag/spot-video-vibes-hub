
import { useCallback } from 'react';
import { useVideoViews } from '@/hooks/useVideoViews';
import { useVideoPlayerState } from '@/hooks/useVideoPlayerState';
import { useVideoPlayerEventHandlers } from '@/hooks/useVideoPlayerEventHandlers';
import { useVideoUrl } from '@/hooks/useVideoUrl';
import { useVideoIntersectionLoader } from '@/hooks/useVideoIntersectionLoader';
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
  const { trackView } = useVideoViews(video.id);
  
  // State management
  const {
    isPlaying,
    setIsPlaying,
    isReady,
    setIsReady,
    hasError,
    setHasError,
    debugInfo,
    updateDebugInfo,
    hasTrackedView,
    setHasTrackedView
  } = useVideoPlayerState(video.title);

  // Video URL optimization
  const { getOptimizedVideoUrl } = useVideoUrl(video);

  // Event handlers
  const {
    handleCanPlay,
    handlePlay,
    handlePause,
    handleError,
    handleLoadStart,
    handleWaiting,
    handleLoadedData
  } = useVideoPlayerEventHandlers({
    updateDebugInfo,
    setIsReady,
    setHasError,
    setIsPlaying,
    trackView,
    hasTrackedView,
    setHasTrackedView
  });

  // Intersection observer and video loading
  const { videoRef, isInView } = useVideoIntersectionLoader({
    containerRef,
    getOptimizedVideoUrl,
    updateDebugInfo
  });

  const handleRetry = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      updateDebugInfo('Retrying video load...');
      setHasError(false);
      setIsReady(false);
      videoElement.load();
    }
  }, [updateDebugInfo, setHasError, setIsReady]);

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
