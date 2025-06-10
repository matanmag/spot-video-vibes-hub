
import { useState, useEffect, useCallback } from 'react';
import { useMobileDetection } from './useMobileDetection';

interface UseMobileIntersectionObserverProps {
  containerRef: React.RefObject<HTMLElement>;
  onVisibilityChange: (isVisible: boolean, ratio: number) => void;
}

export const useMobileIntersectionObserver = ({
  containerRef,
  onVisibilityChange
}: UseMobileIntersectionObserverProps) => {
  const [isInView, setIsInView] = useState(false);
  const { isMobile } = useMobileDetection();

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    
    // For mobile, we're more lenient with the visibility threshold
    const threshold = isMobile ? 0.5 : 0.7;
    const isVisible = entry.isIntersecting && entry.intersectionRatio > threshold;
    
    setIsInView(isVisible);
    onVisibilityChange(isVisible, entry.intersectionRatio);
  }, [isMobile, onVisibilityChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: isMobile ? [0.5, 0.7, 1.0] : [0.7, 1.0],
      rootMargin: isMobile ? '0px' : '-10% 0px -10% 0px'
    });

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, handleIntersection, isMobile]);

  return isInView;
};
