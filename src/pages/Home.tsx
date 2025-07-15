
import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import VideoCard from '@/components/OptimizedVideoCard';
import MobileLocationSearch from '@/components/MobileLocationSearch';
import VideoSkeletonList from '@/components/VideoSkeletonList';
import { useLocationPreference } from '@/hooks/useLocationPreference';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Home = () => {
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { selectedSpotId, updateLocationPreference, loading: locationLoading } = useLocationPreference();
  const [isLocationChanging, setIsLocationChanging] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
      logger.info('Fetching videos with pageParam:', pageParam, 'spotId:', selectedSpotId);
      
      let query = supabase
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
        .limit(8); // Reduced from 10 to 8 for better performance

      // Filter by location if selected
      if (selectedSpotId) {
        query = query.eq('spot_id', selectedSpotId);
      }

      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching videos:', error);
        throw error;
      }

      logger.info('Fetched videos:', data);
      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 8) return undefined; // Updated to match new limit
      return lastPage[lastPage.length - 1]?.created_at;
    },
    initialPageParam: undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes for video feed
    refetchOnWindowFocus: false,
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

  // Refetch when location changes
  useEffect(() => {
    refetch();
  }, [selectedSpotId, refetch]);

  // Optimized intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Preload earlier for smoother experience
      }
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

  logger.info('Current state:', { 
    isInitialLoading, 
    isLocationChanging,
    locationLoading, 
    error, 
    videosCount: allVideos.length,
    selectedSpotId 
  });

  if (error) {
    logger.error('Home page error:', error);
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
                  <div className="space-y-4">
                    <p className="text-sm">Be the first to upload a video!</p>
                    {!user && !authLoading && (
                      <Button
                        onClick={() => navigate('/login')}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign in to upload
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {allVideos.map((video, index) => (
                <div 
                  key={`${video.id}-${index}`} 
                  className="snap-item animate-fade-in"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <VideoCard video={video} />
                </div>
              ))}
              
              {/* Load more trigger */}
              <div ref={loadMoreRef} className="snap-item flex items-center justify-center">
                {isFetchingNextPage && (
                  <div className="text-foreground text-sm">Loading more videos...</div>
                )}
              </div>
            </>
          )}
          
          {/* Login prompt for unauthenticated users */}
          {!user && !authLoading && allVideos.length > 0 && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
              <Button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 shadow-lg"
              >
                <LogIn className="h-4 w-4" />
                Sign in for full experience
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
