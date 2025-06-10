
import { useRef } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfo from '@/components/VideoInfo';
import VideoActions from '@/components/VideoActions';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
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

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full snap-start flex items-center justify-center bg-black"
    >
      <VideoPlayer video={video} containerRef={containerRef} />

      {/* Video Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex justify-between items-end">
          <VideoInfo video={video} />
          <VideoActions videoId={video.id} />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
