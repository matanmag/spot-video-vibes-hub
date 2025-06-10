
import { useState, useCallback } from 'react';

export const useVideoState = (video: { title: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasSource, setHasSource] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Debug function to log state changes
  const updateDebugInfo = useCallback((info: string) => {
    const timestamp = new Date().toISOString().split('T')[1];
    console.log(`[${timestamp}] VideoPlayer ${video.title}: ${info}`);
    setDebugInfo(info);
  }, [video.title]);

  return {
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
  };
};
