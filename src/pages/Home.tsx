
import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from '@/components/VideoCard';
import SearchBar from '@/components/SearchBar';
import BottomTabBar from '@/components/BottomTabBar';
import { useLocationPreference } from '@/hooks/useLocationPreference';

const Home = () => {
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { selectedSpotId, updateLocationPreference, loading: locationLoading } = useLocationPreference();

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

  if (isLoading || locationLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-red-500 text-lg">Error loading videos</div>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-2 bg-[#111618]/70 backdrop-blur">
        <SearchBar autoFocus={false} />
      </div>

      {/* Video Feed */}
      <div
        id="feed"
        className="h-screen pt-[64px] overflow-y-scroll snap-y snap-mandatory scroll-smooth overscroll-contain"
      >
        {allVideos.length === 0 ? (
          <div className="h-screen flex items-center justify-center snap-start">
            <div className="text-center text-white/60">
              <p className="text-lg mb-2">No videos found</p>
              {selectedSpotId ? (
                <p className="text-sm">Try selecting a different location or browse all locations</p>
              ) : (
                <p className="text-sm">Be the first to upload a video!</p>
              )}
            </div>
          </div>
        ) : (
          allVideos.map((video, index) => (
            <VideoCard
              key={`${video.id}-${index}`}
              video={video}
            />
          ))
        )}
        
        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="text-white text-sm">Loading more videos...</div>
          )}
        </div>
      </div>

      <BottomTabBar />
    </>
  );
};

export default Home;
