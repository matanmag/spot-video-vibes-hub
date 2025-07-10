
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

export const useLocationPreference = () => {
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load user's location preference on mount
  useEffect(() => {
    const loadLocationPreference = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('last_spot_id')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.last_spot_id) {
            setSelectedSpotId(profile.last_spot_id);
          }
        } catch (error) {
          logger.error('Error loading location preference:', error);
        }
      }
      setLoading(false);
    };

    loadLocationPreference();
  }, [user]);

  // Update location preference
  const updateLocationPreference = async (spotId: string | null) => {
    setSelectedSpotId(spotId);

    if (user && spotId) {
      try {
        await supabase
          .from('profiles')
          .update({ last_spot_id: spotId })
          .eq('id', user.id);
      } catch (error) {
        logger.error('Error updating location preference:', error);
      }
    }
  };

  return {
    selectedSpotId,
    loading,
    updateLocationPreference
  };
};
