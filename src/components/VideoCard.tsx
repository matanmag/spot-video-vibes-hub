
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
        {/* Vertically centered right-side actions */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <VideoActions videoId={video.id} />
        </div>
        {/* Video Info Overlay - Top left, always visible */}
        <div className="absolute top-0 left-0 w-full p-4 z-20 flex pointer-events-none">
          <div className="max-w-xl bg-black/60 rounded-xl p-4 shadow-lg pointer-events-auto">
            <VideoInfo video={video} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
