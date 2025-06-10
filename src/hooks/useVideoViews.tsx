
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useVideoViews = (videoId: string) => {
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const { user } = useAuth();

  const trackView = async () => {
    if (hasTrackedView) return;

    try {
      // Use user ID if authenticated, otherwise use a session-based identifier
      const viewer = user?.id || `session_${Date.now()}_${Math.random()}`;
      
      const { error } = await supabase
        .from('video_views')
        .insert({
          video_id: videoId,
          viewer: viewer
        });

      if (!error) {
        setHasTrackedView(true);
        
        // Update the video views count
        const { error: updateError } = await supabase.rpc('increment_video_views', {
          video_id: videoId
        });

        if (updateError) {
          console.error('Error updating video views count:', updateError);
        }
      }
    } catch (error) {
      console.error('Error tracking video view:', error);
    }
  };

  return { trackView, hasTrackedView };
};
