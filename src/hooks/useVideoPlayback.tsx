
import { useCallback, useRef } from 'react';

interface UseVideoPlaybackProps {
  isReady: boolean;
  hasError: boolean;
  isMobile: boolean;
  hasUserInteracted: boolean;
  isMuted: boolean;
  setIsPlaying: (playing: boolean) => void;
  setShowMobileControls: (show: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  updateDebugInfo: (info: string) => void;
  trackView: () => void;
}

export const useVideoPlayback = ({
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
}: UseVideoPlaybackProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

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
        // Don't set error state for playback issues
      }
    }
  }, [isReady, hasError, isMobile, hasUserInteracted, isMuted, updateDebugInfo, trackView, setIsPlaying, setShowMobileControls]);

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
  }, [isMobile, updateDebugInfo, setIsPlaying, setShowMobileControls]);

  const handleToggleMute = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const newMutedState = !isMuted;
      videoElement.muted = newMutedState;
      setIsMuted(newMutedState);
      updateDebugInfo(`Video ${newMutedState ? 'muted' : 'unmuted'}`);
    }
  }, [isMuted, updateDebugInfo, setIsMuted]);

  return {
    videoRef,
    handlePlayVideo,
    handlePauseVideo,
    handleToggleMute
  };
};
