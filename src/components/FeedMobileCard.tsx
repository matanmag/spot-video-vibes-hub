import VideoPlayer from '@/components/VideoPlayer';
import { LikeButton } from '@/components/LikeButton';
import { CommentButton } from '@/components/CommentButton';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ShareButton } from '@/components/ShareButton';
import { OwnerMenu } from '@/components/OwnerMenu';
import { useAuth } from '@/hooks/useAuth';

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
  user_id: string;
  spots?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  profiles?: {
    email: string;
  };
}

interface FeedMobileCardProps {
  video: Video;
}

export function FeedMobileCard({ video }: FeedMobileCardProps) {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id === video.user_id;

  return (
    <div className="relative h-[100svh] w-full">
      {/* video covers entire viewport */}
      <VideoPlayer
        video={video}
        containerRef={{ current: null }}
      />

      {/* caption + username */}
      <div className="absolute bottom-4 left-4 z-10 max-w-[70%] text-white">
        <p className="text-sm text-turquoise bg-black/30 inline-block px-1.5 py-0.5 rounded">
          {video.spots?.name || 'Unknown spot'}
        </p>
        <h2 className="font-semibold">@{video.profiles?.email?.split('@')[0] || 'user'}</h2>
        <p className="text-sm text-white/80">{video.description || video.title}</p>
      </div>

      {/* side-action stack */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 space-y-6">
        <LikeButton video={video} />
        <CommentButton video={video} />
        <BookmarkButton video={video} />
        <ShareButton video={video} />
        {isOwner && <OwnerMenu videoId={video.id} />}
      </div>
    </div>
  );
}

export default FeedMobileCard;