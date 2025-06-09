
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from '@/components/VideoCard';
import { useRef, useEffect } from 'react';

interface SearchResultsProps {
  query: string;
}

const SearchResults = ({ query }: SearchResultsProps) => {
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
    queryKey: ['search-videos', query],
    queryFn: async ({ pageParam }) => {
      console.log('Searching videos with query:', query, 'pageParam:', pageParam);
      
      let queryBuilder = supabase
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
        queryBuilder = queryBuilder.lt('created_at', pageParam);
      }

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,spots.name.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Error searching videos:', error);
        throw error;
      }

      console.log('Search results:', data);
      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
    initialPageParam: undefined,
    enabled: !!query.trim(),
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

  if (!query.trim()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Enter a search query to find videos</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Searching videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500">Error searching videos</p>
        </div>
      </div>
    );
  }

  if (allVideos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">No videos found for "{query}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto snap-y snap-mandatory">
      {allVideos.map((video, index) => (
        <VideoCard
          key={`${video.id}-${index}`}
          video={video}
        />
      ))}
      
      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="text-white text-sm">Loading more results...</div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
