
import { useState, useCallback } from 'react';

export const useVideoPlayerState = (videoTitle: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const updateDebugInfo = useCallback((info: string) => {
    const timestamp = new Date().toISOString().split('T')[1];
    logger.info(`[${timestamp}] VideoPlayer ${videoTitle}: ${info}`);
    setDebugInfo(info);
  }, [videoTitle]);

  return {
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
  };
};
