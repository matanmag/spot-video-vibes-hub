
import { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoViews } from '@/hooks/useVideoViews';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useUserInteraction } from '@/hooks/useUserInteraction';
import { useMobileIntersectionObserver } from '@/hooks/useMobileIntersectionObserver';
import { MobileVideoLoader } from './mobile/MobileVideoLoader';
import { MobileVideoControls } from './mobile/MobileVideoControls';

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
  const [isReady, setIsReady] = useState(false);
  const [hasSource, setHasSource] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  const { trackView } = useVideoViews(video.id);
  const { isMobile, isTouch } = useMobileDetection();
  const { hasUserInteracted, triggerInteraction } = useUserInteraction();

  // Debug function to log state changes
  const updateDebugInfo = useCallback((info: string) => {
    const timestamp = new Date().toISOString().split('T')[1];
    console.log(`[${timestamp}] VideoPlayer ${video.title}: ${info}`);
    setDebugInfo(info);
  }, [video.title]);

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

  // Enhanced play function for mobile
  const handlePlayVideo = useCallback(async () => {
    const videoElement = videoRef.current;
    if (!videoElement || !isReady || hasError) {
      updateDebugInfo(`Cannot play: ready=${isReady}, error=${hasError}, element=${!!videoElement}`);
      return;
    }

    try {
      updateDebugInfo('Attempting to play video...');
      
      // For mobile, ensure we have user interaction before autoplay
      if (isMobile && !hasUserInteracted) {
        updateDebugInfo('Mobile detected - waiting for user interaction');
        setShowMobileControls(true);
        return;
      }

      // Set volume based on mobile best practices
      if (isMobile) {
        videoElement.muted = isMuted;
      }

      await videoElement.play();
      setIsPlaying(true);
      setShowMobileControls(false);
      trackView();
      updateDebugInfo('Video playing successfully');
    } catch (error: any) {
      console.error('Error playing video:', error);
      updateDebugInfo(`Play error: ${error.message}`);
      
      // On mobile, show controls on play failure
      if (isMobile) {
        setShowMobileControls(true);
      }
      
      // If autoplay fails due to policy, don't treat as error
      if (error.name === 'NotAllowedError') {
        updateDebugInfo('Autoplay blocked - user interaction required');
        setShowMobileControls(true);
      } else {
        setHasError(true);
      }
    }
  }, [trackView, isReady, hasError, isMobile, hasUserInteracted, isMuted, updateDebugInfo]);

  const handlePauseVideo = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.pause();
      setIsPlaying(false);
      updateDebugInfo('Video paused');
      
      if (isMobile) {
        setShowMobileControls(true);
      }
    }
  }, [isMobile, updateDebugInfo]);

  const handleToggleMute = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const newMutedState = !isMuted;
      videoElement.muted = newMutedState;
      setIsMuted(newMutedState);
      updateDebugInfo(`Video ${newMutedState ? 'muted' : 'unmuted'}`);
    }
  }, [isMuted, updateDebugInfo]);

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
  }, [isInView, video.optimized_url, video.video_url, hasSource, hasError, isMobile, loadVideoForMobile, updateDebugInfo]);

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
  }, [loadAttempts, hasError, isMobile, loadVideoForMobile]);

  // Hide mobile controls after inactivity
  useEffect(() => {
    if (!isMobile || !showMobileControls) return;

    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowMobileControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showMobileControls, isPlaying, isMobile]);

  // Video event handlers
  const handleCanPlay = () => {
    updateDebugInfo('Video can play (sufficient data loaded)');
    setIsReady(true);
    setHasError(false);
  };

  const handleLoadedData = () => {
    updateDebugInfo('Video loaded data (enough data for current position)');
    setIsReady(true);
    setHasError(false);
  };

  const handleLoadedMetadata = () => {
    updateDebugInfo('Video metadata loaded');
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = e.currentTarget.error;
    const errorMessage = error ? `Code ${error.code}: ${error.message}` : 'Unknown error';
    console.error(`Video error for ${video.title}:`, error);
    updateDebugInfo(`Video error: ${errorMessage}`);
    setIsReady(false);
    setHasError(true);
  };

  const handleLoadStart = () => {
    updateDebugInfo('Video load started');
    setHasError(false);
  };

  const handleWaiting = () => {
    updateDebugInfo('Video waiting for data');
  };

  const handleStalled = () => {
    updateDebugInfo('Video stalled - network issues?');
  };

  return (
    <>
      {/* Debug overlay - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs z-20">
          <div>Status: {debugInfo}</div>
          <div>Ready: {isReady ? 'Yes' : 'No'}</div>
          <div>Error: {hasError ? 'Yes' : 'No'}</div>
          <div>In View: {isInView ? 'Yes' : 'No'}</div>
          <div>Has Source: {hasSource ? 'Yes' : 'No'}</div>
          <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>User Interaction: {hasUserInteracted ? 'Yes' : 'No'}</div>
          <div>Load Attempts: {loadAttempts}</div>
        </div>
      )}

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
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-white text-center">
            <p className="text-lg mb-2">Video unavailable</p>
            <p className="text-sm opacity-75">
              {isMobile ? 'Tap to retry' : 'Unable to load video'}
            </p>
            {isMobile && (
              <button
                onClick={() => {
                  setHasError(false);
                  setLoadAttempts(0);
                  loadVideoForMobile();
                }}
                className="mt-2 px-4 py-2 bg-white/20 rounded text-sm"
              >
                Retry
              </button>
            )}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs mt-2 opacity-60">{debugInfo}</p>
            )}
          </div>
        </div>
      )}

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
      {!isMobile && !isPlaying && isInView && isReady && !hasError && (
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
