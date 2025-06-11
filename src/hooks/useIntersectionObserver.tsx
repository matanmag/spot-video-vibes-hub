
import { useState, useEffect, useCallback } from 'react';

interface UseIntersectionObserverProps {
  elementRef: React.RefObject<HTMLElement>;
  threshold?: number;
  rootMargin?: string;
  onIntersect?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void;
}

export const useIntersectionObserver = ({
  elementRef,
  threshold = 0.5,
  rootMargin = '0px',
  onIntersect
}: UseIntersectionObserverProps) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    const isVisible = entry.isIntersecting && entry.intersectionRatio >= threshold;
    
    setIsIntersecting(isVisible);
    onIntersect?.(isVisible, entry);
  }, [threshold, onIntersect]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [threshold, 1.0],
      rootMargin
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, handleIntersection, threshold, rootMargin]);

  return isIntersecting;
};
