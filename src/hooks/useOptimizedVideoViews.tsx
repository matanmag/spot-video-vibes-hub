import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// Debounced video view tracking to reduce DB calls
export const useOptimizedVideoViews = () => {
  const pendingViews = useRef(new Set<string>());
  const debounceTimer = useRef<NodeJS.Timeout>();

  const trackView = useCallback((videoId: string) => {
    if (pendingViews.current.has(videoId)) return;
    
    pendingViews.current.add(videoId);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Debounce view tracking
    debounceTimer.current = setTimeout(async () => {
      const viewsToTrack = Array.from(pendingViews.current);
      pendingViews.current.clear();
      
      // Batch process views
      for (const id of viewsToTrack) {
        try {
          const { error } = await supabase
            .rpc('increment_video_views', { video_id: id });
          
          if (error) {
            logger.error('Error tracking view:', error);
          }
        } catch (error) {
          logger.error('Error tracking view:', error);
        }
      }
    }, 1000); // 1 second debounce
  }, []);

  return { trackView };
};