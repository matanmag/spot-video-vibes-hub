
import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLocationPreference } from '@/hooks/useLocationPreference';
import { useVideoPreloader } from '@/hooks/useVideoPreloader';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';

export const useHomeLogic = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const navigate = useNavigate();
  const { selectedSpotId, updateLocationPreference, loading: locationLoading } = useLocationPreference();
  const { optimalQuality } = useNetworkQuality();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['videos', selectedSpotId],
    queryFn: async ({ pageParam }) => {
      console.log('Fetching videos with pageParam:', pageParam, 'spotId:', selectedSpotId);
      
      let query = supabase
        .from('videos')
        .select(`
          *,
          spots (
            name,
            latitude,
            longitude
          ),
          profiles (
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (selectedSpotId) {
        query = query.eq('spot_id', selectedSpotId);
      }

      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        throw error;
      }

      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
    initialPageParam: undefined,
  });

  const allVideos = data?.pages.flatMap(page => page) || [];

  // Preload videos based on current position
  useVideoPreloader(allVideos, currentVideoIndex, optimalQuality);

  // Refetch when location changes
  useEffect(() => {
    refetch();
  }, [selectedSpotId, refetch]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCurrentVideoIndexChange = (index: number) => {
    if (index !== currentVideoIndex && index < allVideos.length) {
      setCurrentVideoIndex(index);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    currentVideoIndex,
    selectedSpotId,
    updateLocationPreference,
    optimalQuality,
    allVideos,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    locationLoading,
    handleSearchKeyPress,
    handleCurrentVideoIndexChange
  };
};
