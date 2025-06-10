
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Spot {
  id: string;
  name: string;
  country: string | null;
  lat: number;
  lon: number;
}

export const useLocationSearch = (selectedSpotId?: string | null) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpotName, setSelectedSpotName] = useState<string>('');
  const { user } = useAuth();

  // Load selected spot name if there's a selectedSpotId
  useEffect(() => {
    const loadSelectedSpot = async () => {
      if (selectedSpotId) {
        try {
          const { data: spot } = await supabase
            .from('spots')
            .select('name')
            .eq('id', selectedSpotId)
            .maybeSingle();
          
          if (spot) {
            setSelectedSpotName(spot.name);
          }
        } catch (error) {
          console.error('Error loading selected spot:', error);
        }
      } else {
        setSelectedSpotName('');
      }
    };

    loadSelectedSpot();
  }, [selectedSpotId]);

  // Search for spots when query changes
  useEffect(() => {
    const searchSpots = async () => {
      if (searchQuery.trim().length < 1) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        console.log('Searching for:', searchQuery);
        const { data, error } = await supabase.rpc('search_spots', {
          q: searchQuery.trim()
        });

        if (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } else {
          console.log('Search results:', data);
          setSearchResults(data || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchSpots, 200);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = async (spot: Spot | null, onLocationSelect: (spotId: string | null, spotName?: string) => void) => {
    if (spot) {
      setSelectedSpotName(spot.name);
      onLocationSelect(spot.id, spot.name);

      // Update user's location preference if logged in
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ last_spot_id: spot.id })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error updating location preference:', error);
        }
      }
    } else {
      setSelectedSpotName('');
      onLocationSelect(null);
    }
    
    setOpen(false);
    setSearchQuery('');
  };

  const clearSelection = (onLocationSelect: (spotId: string | null) => void) => {
    handleLocationSelect(null, onLocationSelect);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

  return {
    open,
    searchQuery,
    searchResults,
    loading,
    selectedSpotName,
    setSearchQuery,
    handleLocationSelect,
    clearSelection,
    handleOpenChange
  };
};
