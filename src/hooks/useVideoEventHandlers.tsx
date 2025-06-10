
import { useCallback } from 'react';

interface UseVideoEventHandlersProps {
  updateDebugInfo: (info: string) => void;
  setIsReady: (ready: boolean) => void;
  setHasError: (error: boolean) => void;
}

export const useVideoEventHandlers = ({
  updateDebugInfo,
  setIsReady,
  setHasError
}: UseVideoEventHandlersProps) => {
  const handleCanPlay = useCallback(() => {
    updateDebugInfo('Video can play (sufficient data loaded)');
    setIsReady(true);
    setHasError(false);
  }, [updateDebugInfo, setIsReady, setHasError]);

  const handleLoadedData = useCallback(() => {
    updateDebugInfo('Video loaded data (enough data for current position)');
    setIsReady(true);
    setHasError(false);
  }, [updateDebugInfo, setIsReady, setHasError]);

  const handleLoadedMetadata = useCallback(() => {
    updateDebugInfo('Video metadata loaded');
  }, [updateDebugInfo]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = e.currentTarget.error;
    const errorMessage = error ? `Code ${error.code}: ${error.message}` : 'Unknown error';
    console.error(`Video error:`, error);
    updateDebugInfo(`Video error: ${errorMessage}`);
    setIsReady(false);
    setHasError(true);
  }, [updateDebugInfo, setIsReady, setHasError]);

  const handleLoadStart = useCallback(() => {
    updateDebugInfo('Video load started');
    setHasError(false);
  }, [updateDebugInfo, setHasError]);

  const handleWaiting = useCallback(() => {
    updateDebugInfo('Video waiting for data');
  }, [updateDebugInfo]);

  const handleStalled = useCallback(() => {
    updateDebugInfo('Video stalled - network issues?');
  }, [updateDebugInfo]);

  return {
    handleCanPlay,
    handleLoadedData,
    handleLoadedMetadata,
    handleError,
    handleLoadStart,
    handleWaiting,
    handleStalled
  };
};
