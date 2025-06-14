import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import FeedItem from '@/components/FeedItem';
import MobileLocationSearch from '@/components/MobileLocationSearch';
import VideoSkeletonList from '@/components/VideoSkeletonList';
import { useLocationPreference } from '@/hooks/useLocationPreference';

const Home = () => {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { selectedSpotId, updateLocationPreference, loading: locationLoading } = useLocationPreference();
  const [isLocationChanging, setIsLocationChanging] = useState(false);

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

      // Filter by location if selected
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

      console.log('Fetched videos:', data);
      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
    initialPageParam: undefined,
  });

  // Handle location preference updates with loading state
  const handleLocationChange = async (spotId: string | null, spotName?: string) => {
    setIsLocationChanging(true);
    updateLocationPreference(spotId);
    
    // Add a small delay to show the loading state
    setTimeout(() => {
      setIsLocationChanging(false);
    }, 500);
  };

  // Handle search button click - navigate to search page
  const handleSearchClick = () => {
    navigate('/search');
  };

  // Refetch when location changes
  useEffect(() => {
    refetch();
  }, [selectedSpotId, refetch]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allVideos = data?.pages.flatMap(page => page) || [];
  const isInitialLoading = isLoading || locationLoading;
  const showSkeletons = isInitialLoading || isLocationChanging;

  console.log('Current state:', { 
    isInitialLoading, 
    isLocationChanging,
    locationLoading, 
    error, 
    videosCount: allVideos.length,
    selectedSpotId 
  });

  if (error) {
    console.error('Home page error:', error);
    return (
      <div className="h-screen flex flex-col bg-background">
        <MobileLocationSearch
          selectedSpotId={selectedSpotId}
          onLocationSelect={handleLocationChange}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-destructive text-lg">Error loading videos: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-background">
      {/* Mobile Location Search Bar */}
      <MobileLocationSearch
        selectedSpotId={selectedSpotId}
        onLocationSelect={handleLocationChange}
        isLoading={isLocationChanging}
      />

      {/* Video Feed with Loading States */}
      {showSkeletons ? (
        <VideoSkeletonList count={3} />
      ) : (
        <div className="snap-container scrollbar-hide">
          {allVideos.length === 0 ? (
            <div className="snap-item flex items-center justify-center h-screen">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">No videos found</p>
                {selectedSpotId ? (
                  <p className="text-sm">Try selecting a different location or browse all locations</p>
                ) : (
                  <p className="text-sm">Be the first to upload a video!</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {allVideos.map((video, index) => {
                return (
                  <div 
                    key={`${video.id}-${index}`} 
                    className="snap-item animate-fade-in"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <FeedItem
                      video={video}
                      comments={0}
                      bookmarks={0}
                      shares={0}
                      onSearchClick={handleSearchClick}
                    />
                  </div>
                );
              })}
              
              {/* Load more trigger */}
              <div ref={loadMoreRef} className="snap-item flex items-center justify-center">
                {isFetchingNextPage && (
                  <div className="text-foreground text-sm">Loading more videos...</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
