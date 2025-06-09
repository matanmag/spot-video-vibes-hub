
import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
        
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch((error) => {
              console.error('Error playing video:', error);
            });
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      {
        threshold: 0.5, // Video needs to be 50% visible to play
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Fetch initial like status and count
  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        // Get current user's like status
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('video_id', video.id)
            .maybeSingle();
          
          setIsLiked(!!userLike);
        }

        // Get total like count
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('video_id', video.id);

        setLikeCount(count || 0);
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };

    fetchLikeData();
  }, [video.id]);

  const handleLike = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('like_video', {
        body: { video_id: video.id }
      });

      if (error) {
        console.error('Error liking video:', error);
        toast({
          title: "Error",
          description: "Failed to update like. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update UI based on response
      setIsLiked(data.liked);
      setLikeCount(data.totalLikes);
      
      toast({
        title: data.liked ? "Liked!" : "Unliked",
        description: data.liked ? "Added to your likes" : "Removed from your likes"
      });
    } catch (error) {
      console.error('Error calling like function:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatLikeCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full snap-start flex items-center justify-center bg-black"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.video_url}
        className="h-full w-full object-cover cursor-pointer"
        muted
        loop
        playsInline
        poster={video.thumbnail_url}
        onClick={handleVideoClick}
        onLoadStart={() => console.log(`Loading video: ${video.title}`)}
        onCanPlay={() => console.log(`Video ready: ${video.title}`)}
        onError={(e) => console.error(`Video error for ${video.title}:`, e)}
      />

      {/* Video Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex justify-between items-end">
          {/* Left side - Video info */}
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

          {/* Right side - Action buttons */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleLike}
              disabled={isLikeLoading}
              className="flex flex-col items-center text-white hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Heart 
                className={`h-8 w-8 mb-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
              />
              <span className="text-xs">{formatLikeCount(likeCount)}</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-blue-500 transition-colors">
              <MessageCircle className="h-8 w-8 mb-1" />
              <span className="text-xs">Comment</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-green-500 transition-colors">
              <Share className="h-8 w-8 mb-1" />
              <span className="text-xs">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Play/Pause indicator */}
      {!isPlaying && isInView && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
