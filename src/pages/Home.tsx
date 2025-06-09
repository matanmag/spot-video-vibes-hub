import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VideoCard from '@/components/VideoCard';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['videos', searchQuery],
    queryFn: async ({ pageParam }) => {
      console.log('Fetching videos with pageParam:', pageParam);
      
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

      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
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

  if (isLoading) {
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
    <div className="relative h-screen overflow-hidden bg-black pb-16">
      {/* Floating Search Bar */}
      <div className="absolute top-16 left-4 right-4 z-50">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/80 backdrop-blur-sm border-border/50"
          />
        </div>
      </div>

      {/* Video Feed */}
      <div className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {allVideos.map((video, index) => (
          <VideoCard
            key={`${video.id}-${index}`}
            video={video}
          />
        ))}
        
        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="text-white text-sm">Loading more videos...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
