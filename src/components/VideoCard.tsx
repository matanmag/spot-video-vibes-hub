
import { useRef } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfo from '@/components/VideoInfo';
import VideoActions from '@/components/VideoActions';
import { logger } from '@/utils/logger';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
          <div className="max-w-xl bg-black/40 backdrop-blur-md rounded-2xl p-5 shadow-2xl pointer-events-auto border border-white/10 transition-all duration-300">
            <div className="flex items-center gap-4 mb-3">
              <Avatar>
                <AvatarFallback>
                  {video.profiles?.email ? video.profiles.email[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-white/80 font-semibold text-base drop-shadow-sm">@{video.profiles?.email?.split('@')[0] || 'user'}</span>
            </div>
            <VideoInfo video={video} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
