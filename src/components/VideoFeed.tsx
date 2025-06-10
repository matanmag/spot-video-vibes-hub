
import { useRef, useEffect } from 'react';
import VideoCard from '@/components/VideoCard';

interface Video {
  id: string;
  title: string;
  video_url: string;
  created_at: string;
  spots?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  profiles?: {
    email: string;
  };
}

interface VideoFeedProps {
  videos: Video[];
  onCurrentVideoIndexChange: (index: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

const VideoFeed = ({
  videos,
  onCurrentVideoIndexChange,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage
}: VideoFeedProps) => {
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Track current video index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const videoHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / videoHeight);
      
      if (newIndex < videos.length) {
        onCurrentVideoIndexChange(newIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [videos.length, onCurrentVideoIndexChange]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onFetchNextPage();
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
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  return (
    <div className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide pt-24">
      {videos.map((video, index) => (
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
  );
};

export default VideoFeed;
