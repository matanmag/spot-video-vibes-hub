
import { useRef } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfo from '@/components/VideoInfo';
import VideoActions from '@/components/VideoActions';

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

  console.log('Rendering VideoCard for:', video.title, {
    video_url: video.video_url,
    optimized_url: video.optimized_url,
    thumbnail_url: video.thumbnail_url
  });

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden"
    >
      <VideoPlayer video={video} containerRef={containerRef} />

      {/* Video Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 pb-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex justify-between items-end pointer-events-auto">
          <VideoInfo video={video} />
          <VideoActions videoId={video.id} />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
