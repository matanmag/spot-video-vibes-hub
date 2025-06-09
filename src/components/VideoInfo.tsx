
interface Video {
  id: string;
  title: string;
  description?: string;
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

interface VideoInfoProps {
  video: Video;
}

const VideoInfo = ({ video }: VideoInfoProps) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="flex-1 mr-4 text-white">
      <div className="mb-2">
        <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-white/80 mb-2">{video.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>@{video.profiles?.email?.split('@')[0] || 'user'}</span>
          <span>•</span>
          <span>{formatTimeAgo(video.created_at)}</span>
          {video.spots && (
            <>
              <span>•</span>
              <span>{video.spots.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
