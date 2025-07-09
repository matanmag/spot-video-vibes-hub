
import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from '@/components/VideoCard';
import LocationSearch from '@/components/LocationSearch';
import { useLocationPreference } from '@/hooks/useLocationPreference';

interface SearchResultsProps {
  query: string;
}

const SearchResults = ({ query }: SearchResultsProps) => {
  const { selectedSpotId, updateLocationPreference } = useLocationPreference();
  const [localSpotId, setLocalSpotId] = useState<string | null>(selectedSpotId);

  useEffect(() => {
    setLocalSpotId(selectedSpotId);
  }, [selectedSpotId]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['search-videos', query, localSpotId],
    queryFn: async ({ pageParam }) => {
      logger.info('Searching videos with query:', query, 'spotId:', localSpotId, 'pageParam:', pageParam);
      
      let queryBuilder = supabase
        .from('videos')
        .select(`
          *,
          spots (
            name,
            latitude,
            longitude
          ),
          profiles!videos_user_id_fkey (
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Add text search if query exists
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Filter by location if selected
      if (localSpotId) {
        queryBuilder = queryBuilder.eq('spot_id', localSpotId);
      }

      if (pageParam) {
        queryBuilder = queryBuilder.lt('created_at', pageParam);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        logger.error('Error searching videos:', error);
        throw error;
      }

      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
    initialPageParam: undefined,
    enabled: query.trim().length > 0 || localSpotId !== null
  });

  useEffect(() => {
    refetch();
  }, [query, localSpotId, refetch]);

  const handleLocationChange = (spotId: string | null) => {
    setLocalSpotId(spotId);
    updateLocationPreference(spotId);
  };

  const allVideos = data?.pages.flatMap(page => page) || [];

  if (!query.trim() && !localSpotId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mb-8">
          <LocationSearch
            selectedSpotId={localSpotId}
            onLocationSelect={handleLocationChange}
            placeholder="Search for surf spots..."
            className="w-full"
          />
        </div>
        <div className="text-center text-white/60">
          <p className="text-lg mb-2">Search for videos</p>
          <p className="text-sm">Enter a search term or select a location to find videos</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-lg">Searching...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500 text-lg">Error searching videos</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Location Filter */}
      <div className="p-4 border-b border-border/20">
        <LocationSearch
          selectedSpotId={localSpotId}
          onLocationSelect={handleLocationChange}
          placeholder="Filter by location..."
          className="max-w-md"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {allVideos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white/60">
              <p className="text-lg mb-2">No videos found</p>
              <p className="text-sm">
                {query.trim() ? 
                  `No results for "${query}"${localSpotId ? ' in this location' : ''}` :
                  'No videos in this location'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {allVideos.map((video, index) => (
              <VideoCard
                key={`${video.id}-${index}`}
                video={video}
              />
            ))}
            
            {/* Load more section */}
            <div className="h-20 flex items-center justify-center">
              {isFetchingNextPage ? (
                <div className="text-white text-sm">Loading more videos...</div>
              ) : hasNextPage ? (
                <button
                  onClick={() => fetchNextPage()}
                  className="text-primary text-sm hover:underline"
                >
                  Load more videos
                </button>
              ) : allVideos.length > 0 ? (
                <div className="text-white/50 text-sm">No more videos</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
