
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SurfSpot } from '@/types/surf-spot';

export const useSpots = () => {
  const [spots, setSpots] = useState<SurfSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching spots:', error);
        return;
      }

      setSpots(data || []);
    } catch (error) {
      logger.error('Error fetching spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSpot = async () => {
    const defaultSpot = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Default Spot',
      description: 'Default location for videos',
      latitude: 37.7749,
      longitude: -122.4194
    };

    const { data, error } = await supabase
      .from('spots')
      .upsert(defaultSpot, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      logger.error('Error creating default spot:', error);
      return null;
    }

    return data;
  };

  return {
    spots,
    loading,
    fetchSpots,
    createDefaultSpot
  };
};
