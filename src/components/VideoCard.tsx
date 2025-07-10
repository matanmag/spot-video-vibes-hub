
import { useRef } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfo from '@/components/VideoInfo';
import VideoActions from '@/components/VideoActions';
import { logger } from '@/utils/logger';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  optimized_url?: string;
  thumbnail_url?: string;
  duration?: number;
  views?: number;
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

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  logger.info('Rendering VideoCard for:', video.title, {
    video_url: video.video_url,
    optimized_url: video.optimized_url,
    thumbnail_url: video.thumbnail_url
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col bg-black"
      style={{ height: '100dvh' }}
    >
      {/* Video Player Container */}
      <div className="flex-1 relative overflow-hidden">
        <VideoPlayer video={video} containerRef={containerRef} />
      </div>

      {/* Video Info Overlay - Fixed at bottom with proper spacing */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
        <div className="flex justify-between items-end pointer-events-auto gap-4">
          <div className="flex-1 min-w-0">
            <VideoInfo video={video} />
          </div>
          <div className="flex-shrink-0">
            <VideoActions videoId={video.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
