
import { useState, useEffect } from 'react';

export type NetworkQuality = 'slow' | 'medium' | 'fast';

export const useNetworkQuality = () => {
  const [quality, setQuality] = useState<NetworkQuality>('medium');
  const [connectionSpeed, setConnectionSpeed] = useState<number>(0);

  useEffect(() => {
    // Check if Network Information API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateQuality = () => {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        
        setConnectionSpeed(downlink);

        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1.5) {
          setQuality('slow');
        } else if (effectiveType === '3g' || downlink < 10) {
          setQuality('medium');
        } else {
          setQuality('fast');
        }
      };

      updateQuality();
      connection.addEventListener('change', updateQuality);

      return () => {
        connection.removeEventListener('change', updateQuality);
      };
    } else {
      // Fallback: estimate based on download speed test
      const testConnection = async () => {
        try {
          const startTime = Date.now();
          await fetch('/favicon.ico?' + Math.random(), { cache: 'no-cache' });
          const duration = Date.now() - startTime;
          
          if (duration > 1000) {
            setQuality('slow');
          } else if (duration > 300) {
            setQuality('medium');
          } else {
            setQuality('fast');
          }
        } catch (error) {
          setQuality('medium'); // Default fallback
        }
      };

      testConnection();
    }
  }, []);

  const getOptimalQuality = () => {
    switch (quality) {
      case 'slow':
        return '480p';
      case 'medium':
        return '720p';
      case 'fast':
        return '1080p';
      default:
        return '720p';
    }
  };

  return {
    networkQuality: quality,
    connectionSpeed,
    optimalQuality: getOptimalQuality()
  };
};
