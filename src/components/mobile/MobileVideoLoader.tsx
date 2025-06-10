
import { useCallback } from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface MobileVideoLoaderProps {
  videoElement: HTMLVideoElement | null;
  videoUrl: string;
  onLoadSuccess: () => void;
  onLoadError: (error: string) => void;
  onDebugUpdate: (info: string) => void;
}

export const MobileVideoLoader = ({
  videoElement,
  videoUrl,
  onLoadSuccess,
  onLoadError,
  onDebugUpdate
}: MobileVideoLoaderProps) => {
  const { isMobile } = useMobileDetection();

  const loadVideoForMobile = useCallback(async () => {
    if (!videoElement || !videoUrl) return;

    try {
      onDebugUpdate('Starting mobile video load...');

      // For mobile, we need to be more careful about loading
      if (isMobile) {
        // Set mobile-specific attributes
        videoElement.setAttribute('webkit-playsinline', 'true');
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('preload', 'none'); // Start with minimal preload
        
        onDebugUpdate('Mobile attributes set');
      }

      // Test URL accessibility first
      const response = await fetch(videoUrl, { 
        method: 'HEAD',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      onDebugUpdate(`URL test successful: ${response.status}`);

      // Set source and load
      videoElement.src = videoUrl;
      
      // For mobile, load metadata only initially
      if (isMobile) {
        videoElement.preload = 'metadata';
      }

      await new Promise((resolve, reject) => {
        const onLoadedData = () => {
          videoElement.removeEventListener('loadeddata', onLoadedData);
          videoElement.removeEventListener('error', onError);
          resolve(true);
        };

        const onError = (e: Event) => {
          videoElement.removeEventListener('loadeddata', onLoadedData);
          videoElement.removeEventListener('error', onError);
          const error = videoElement.error;
          reject(new Error(error ? `Video error ${error.code}: ${error.message}` : 'Unknown video error'));
        };

        videoElement.addEventListener('loadeddata', onLoadedData);
        videoElement.addEventListener('error', onError);
        videoElement.load();
      });

      onLoadSuccess();
      onDebugUpdate('Video loaded successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onLoadError(errorMessage);
      onDebugUpdate(`Load failed: ${errorMessage}`);
    }
  }, [videoElement, videoUrl, isMobile, onLoadSuccess, onLoadError, onDebugUpdate]);

  return { loadVideoForMobile };
};
