
import { useCallback } from 'react';
import { logger } from '@/utils/logger';

interface UseVideoPlayerEventHandlersProps {
  updateDebugInfo: (info: string) => void;
  setIsReady: (ready: boolean) => void;
  setHasError: (error: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  trackView: () => void;
  hasTrackedView: boolean;
  setHasTrackedView: (tracked: boolean) => void;
}

export const useVideoPlayerEventHandlers = ({
  updateDebugInfo,
  setIsReady,
  setHasError,
  setIsPlaying,
  trackView,
  hasTrackedView,
  setHasTrackedView
}: UseVideoPlayerEventHandlersProps) => {
  const handleCanPlay = useCallback(() => {
    updateDebugInfo('Video ready to play');
    setIsReady(true);
    setHasError(false);
  }, [updateDebugInfo, setIsReady, setHasError]);

  const handlePlay = useCallback(() => {
    updateDebugInfo('Video started playing');
    setIsPlaying(true);
    
    // Track view only once when video actually starts playing
    if (!hasTrackedView) {
      trackView();
      setHasTrackedView(true);
    }
  }, [updateDebugInfo, setIsPlaying, trackView, hasTrackedView, setHasTrackedView]);

  const handlePause = useCallback(() => {
    updateDebugInfo('Video paused');
    setIsPlaying(false);
  }, [updateDebugInfo, setIsPlaying]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = e.currentTarget.error;
    const errorMessage = error ? `Code ${error.code}: ${error.message}` : 'Unknown error';
    logger.error('Video error:', error);
    updateDebugInfo(`Error: ${errorMessage}`);
    setHasError(true);
    setIsReady(false);
  }, [updateDebugInfo, setHasError, setIsReady]);

  const handleLoadStart = useCallback(() => {
    updateDebugInfo('Video loading started');
    setHasError(false);
  }, [updateDebugInfo, setHasError]);

  const handleWaiting = useCallback(() => {
    updateDebugInfo('Video buffering...');
  }, [updateDebugInfo]);

  const handleLoadedData = useCallback(() => {
    updateDebugInfo('Video data loaded');
  }, [updateDebugInfo]);

  return {
    handleCanPlay,
    handlePlay,
    handlePause,
    handleError,
    handleLoadStart,
    handleWaiting,
    handleLoadedData
  };
};
