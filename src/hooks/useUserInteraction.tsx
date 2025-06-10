
import { useState, useEffect, useCallback } from 'react';

export const useUserInteraction = () => {
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const handleInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      console.log('User interaction detected - enabling autoplay');
    }
  }, [hasUserInteracted]);

  useEffect(() => {
    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [handleInteraction]);

  return { hasUserInteracted, triggerInteraction: handleInteraction };
};
