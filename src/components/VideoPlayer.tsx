
import { useEffect, useCallback } from 'react';
import { useVideoViews } from '@/hooks/useVideoViews';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useUserInteraction } from '@/hooks/useUserInteraction';
import { useMobileIntersectionObserver } from '@/hooks/useMobileIntersectionObserver';
import { useVideoState } from '@/hooks/useVideoState';
import { useVideoEventHandlers } from '@/hooks/useVideoEventHandlers';
import { useVideoPlayback } from '@/hooks/useVideoPlayback';
import { MobileVideoLoader } from './mobile/MobileVideoLoader';
import { MobileVideoControls } from './mobile/MobileVideoControls';
import { VideoLoadingStates } from './video/VideoLoadingStates';
import { VideoErrorState } from './video/VideoErrorState';
import { VideoDebugOverlay } from './video/VideoDebugOverlay';
import { VideoPlayIndicator } from './video/VideoPlayIndicator';

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
  const { isMobile, isTouch } = useMobileDetection();
  const { hasUserInteracted, triggerInteraction } = useUserInteraction();

  // Video state management
  const {
    isPlaying,
    setIsPlaying,
    isReady,
    setIsReady,
    hasSource,
    setHasSource,
    hasError,
    setHasError,
    isMuted,
    setIsMuted,
    showMobileControls,
    setShowMobileControls,
    debugInfo,
    updateDebugInfo,
    loadAttempts,
    setLoadAttempts
  } = useVideoState(video);

  // Video event handlers
  const {
    handleCanPlay,
    handleLoadedData,
    handleLoadedMetadata,
    handleError,
    handleLoadStart,
    handleWaiting,
    handleStalled
  } = useVideoEventHandlers({
    updateDebugInfo,
    setIsReady,
    setHasError
  });

  // Video playback controls
  const {
    videoRef,
    handlePlayVideo,
    handlePauseVideo,
    handleToggleMute
  } = useVideoPlayback({
    isReady,
    hasError,
    isMobile,
    hasUserInteracted,
    isMuted,
    setIsPlaying,
    setShowMobileControls,
    setIsMuted,
    updateDebugInfo,
    trackView
  });

  // Mobile-optimized intersection observer
  const isInView = useMobileIntersectionObserver({
    containerRef,
    onVisibilityChange: (isVisible, ratio) => {
      updateDebugInfo(`In view: ${isVisible} (ratio: ${ratio.toFixed(2)})`);
      
      // On mobile, show controls when video comes into view
      if (isMobile && isVisible && !isPlaying) {
        setShowMobileControls(true);
      } else if (!isVisible) {
        setShowMobileControls(false);
      }
    }
  });

  // Mobile video loader
  const { loadVideoForMobile } = MobileVideoLoader({
    videoElement: videoRef.current,
    videoUrl: video.optimized_url || video.video_url,
    onLoadSuccess: () => {
      setHasSource(true);
      setIsReady(true);
      setHasError(false);
      setLoadAttempts(0);
    },
    onLoadError: (error) => {
      setHasError(true);
      setIsReady(false);
      updateDebugInfo(`Load error: ${error}`);
      
      // Retry logic for mobile
      if (isMobile && loadAttempts < 2) {
        setTimeout(() => {
          setLoadAttempts(prev => prev + 1);
          updateDebugInfo(`Retrying load (attempt ${loadAttempts + 2})`);
        }, 1000);
      }
    },
    onDebugUpdate: updateDebugInfo
  });

  const handleVideoInteraction = useCallback(() => {
    triggerInteraction();
    
    if (isMobile && !isPlaying && isReady && !hasError) {
      handlePlayVideo();
    } else if (isPlaying) {
      handlePauseVideo();
    } else if (!isPlaying) {
      handlePlayVideo();
    }
  }, [triggerInteraction, isMobile, isPlaying, isReady, hasError, handlePlayVideo, handlePauseVideo]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoadAttempts(0);
    loadVideoForMobile();
  }, [loadVideoForMobile, setHasError, setLoadAttempts]);

  // Load video when in view
  useEffect(() => {
    if (isInView && !hasSource && !hasError) {
      if (isMobile) {
        loadVideoForMobile();
      } else {
        // Desktop loading logic (existing)
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const videoUrl = video.optimized_url || video.video_url;
        updateDebugInfo(`Setting video source: ${videoUrl}`);
        
        fetch(videoUrl, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              videoElement.src = videoUrl;
              videoElement.load();
              setHasSource(true);
              setHasError(false);
              updateDebugInfo('Video source set and loading...');
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          })
          .catch(error => {
            console.error(`Failed to load video URL ${videoUrl}:`, error);
            updateDebugInfo(`URL test failed: ${error.message}`);
            setHasError(true);
          });
      }
    }
  }, [isInView, video.optimized_url, video.video_url, hasSource, hasError, isMobile, loadVideoForMobile, updateDebugInfo, setHasSource, setHasError]);

  // Auto-play when ready and in view (for desktop or after user interaction on mobile)
  useEffect(() => {
    if (isInView && isReady && !hasError) {
      if (!isMobile || hasUserInteracted) {
        handlePlayVideo();
      }
    } else if (!isInView && isPlaying) {
      handlePauseVideo();
    }
  }, [isInView, isReady, hasError, isMobile, hasUserInteracted, isPlaying, handlePlayVideo, handlePauseVideo]);

  // Retry loading on mobile
  useEffect(() => {
    if (isMobile && hasError && loadAttempts > 0 && loadAttempts <= 2) {
      const timer = setTimeout(() => {
        setHasError(false);
        setIsReady(false);
        setHasSource(false);
        loadVideoForMobile();
      }, 1000 * loadAttempts);

      return () => clearTimeout(timer);
    }
  }, [loadAttempts, hasError, isMobile, loadVideoForMobile, setHasError, setIsReady, setHasSource]);

  // Hide mobile controls after inactivity
  useEffect(() => {
    if (!isMobile || !showMobileControls) return;

    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowMobileControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showMobileControls, isPlaying, isMobile, setShowMobileControls]);

  return (
    <>
      {/* Debug overlay */}
      <VideoDebugOverlay
        debugInfo={debugInfo}
        isReady={isReady}
        hasError={hasError}
        isInView={isInView}
        hasSource={hasSource}
        isPlaying={isPlaying}
        isMobile={isMobile}
        hasUserInteracted={hasUserInteracted}
        loadAttempts={loadAttempts}
      />

      {/* Thumbnail placeholder */}
      <VideoLoadingStates
        isReady={isReady}
        hasError={hasError}
        thumbnailUrl={video.thumbnail_url}
      />

      {/* Error state */}
      <VideoErrorState
        hasError={hasError}
        isMobile={isMobile}
        debugInfo={debugInfo}
        onRetry={handleRetry}
      />

      {/* Mobile Video Controls */}
      {isMobile && (
        <MobileVideoControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          showControls={showMobileControls}
          onPlayPause={handleVideoInteraction}
          onToggleMute={handleToggleMute}
          onInteraction={handleVideoInteraction}
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover cursor-pointer"
        preload={isMobile ? "none" : "metadata"}
        muted={isMuted}
        playsInline
        loop
        poster={video.thumbnail_url}
        onClick={handleVideoInteraction}
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onWaiting={handleWaiting}
        onStalled={handleStalled}
        crossOrigin="anonymous"
        style={{
          WebkitPlaysinline: true,
        } as React.CSSProperties}
      />

      {/* Desktop Play/Pause indicator */}
      <VideoPlayIndicator
        isMobile={isMobile}
        isPlaying={isPlaying}
        isInView={isInView}
        isReady={isReady}
        hasError={hasError}
      />
    </>
  );
};

export default VideoPlayer;
