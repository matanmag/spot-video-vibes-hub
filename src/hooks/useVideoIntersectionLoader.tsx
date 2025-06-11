
import { useEffect, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface UseVideoIntersectionLoaderProps {
  containerRef: React.RefObject<HTMLDivElement>;
  getOptimizedVideoUrl: () => string;
  updateDebugInfo: (info: string) => void;
}

export const useVideoIntersectionLoader = ({
  containerRef,
  getOptimizedVideoUrl,
  updateDebugInfo
}: UseVideoIntersectionLoaderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer for lazy loading
  const isInView = useIntersectionObserver({
    elementRef: containerRef,
    threshold: 0.5,
    onIntersect: (isVisible) => {
      updateDebugInfo(`In view: ${isVisible}`);
    }
  });

  // Load video when in view
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isInView) return;

    const videoUrl = getOptimizedVideoUrl();
    if (videoElement.src !== videoUrl) {
      updateDebugInfo(`Loading video: ${videoUrl}`);
      videoElement.src = videoUrl;
      videoElement.load();
    }
  }, [isInView, getOptimizedVideoUrl, updateDebugInfo]);

  return { videoRef, isInView };
};
