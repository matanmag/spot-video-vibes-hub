
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { trackView } = useVideoViews(video.id);

  // Debug function to log state changes
  const updateDebugInfo = useCallback((info: string) => {
    const timestamp = new Date().toISOString().split('T')[1];
    console.log(`[${timestamp}] VideoPlayer ${video.title}: ${info}`);
    setDebugInfo(info);
  }, [video.title]);

  const handlePlayVideo = useCallback(async () => {
    const videoElement = videoRef.current;
    if (!videoElement || !isReady || hasError) {
      updateDebugInfo(`Cannot play: ready=${isReady}, error=${hasError}, element=${!!videoElement}`);
      return;
    }

    try {
      updateDebugInfo('Attempting to play video...');
      await videoElement.play();
      setIsPlaying(true);
      trackView();
      updateDebugInfo('Video playing successfully');
    } catch (error) {
      console.error('Error playing video:', error);
      updateDebugInfo(`Play error: ${error}`);
      setHasError(true);
    }
  }, [trackView, isReady, hasError, updateDebugInfo]);

  const handlePauseVideo = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.pause();
      setIsPlaying(false);
      updateDebugInfo('Video paused');
    }
  }, [updateDebugInfo]);

  // Intersection observer for detecting when video is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.7;
        
        setIsInView(isVisible);
        updateDebugInfo(`In view: ${isVisible} (ratio: ${entry.intersectionRatio})`);
      },
      {
        threshold: [0.7],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
      updateDebugInfo('Intersection observer attached');
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, updateDebugInfo]);

  // Set video source when in view
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || hasSource || !isInView) return;

    const videoUrl = video.optimized_url || video.video_url;
    updateDebugInfo(`Setting video source: ${videoUrl}`);
    
    // Test if URL is accessible before setting source
    fetch(videoUrl, { method: 'HEAD' })
      .then(response => {
        updateDebugInfo(`URL test response: ${response.status} ${response.statusText}`);
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
  }, [isInView, video.optimized_url, video.video_url, hasSource, updateDebugInfo]);

  // Play/pause based on view state
  useEffect(() => {
    if (isInView && isReady && !hasError) {
      handlePlayVideo();
    } else if (!isInView) {
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
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs z-10">
          <div>Status: {debugInfo}</div>
          <div>Ready: {isReady ? 'Yes' : 'No'}</div>
          <div>Error: {hasError ? 'Yes' : 'No'}</div>
          <div>In View: {isInView ? 'Yes' : 'No'}</div>
          <div>Has Source: {hasSource ? 'Yes' : 'No'}</div>
          <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
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
            <p className="text-sm opacity-75">Unable to load video</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs mt-2 opacity-60">{debugInfo}</p>
            )}
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
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onWaiting={handleWaiting}
        onStalled={handleStalled}
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
