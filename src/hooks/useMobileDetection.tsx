
import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 
        'blackberry', 'windows phone', 'mobile'
      ];
      
      const isMobileDevice = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      );
      
      const isTouchDevice = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;

      setIsMobile(isMobileDevice);
      setIsTouch(isTouchDevice);
    };

    checkMobile();
    
    // Re-check on resize (for responsive debugging)
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isTouch };
};
