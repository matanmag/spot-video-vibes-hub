
import { Heart, MessageCircle, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface VideoActionsProps {
  videoId: string;
}

const VideoActions = ({ videoId }: VideoActionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const { toast } = useToast();

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
            .eq('video_id', videoId)
            .maybeSingle();
          
          setIsLiked(!!userLike);
        }

        // Get total like count
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('video_id', videoId);

        setLikeCount(count || 0);
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };

    fetchLikeData();
  }, [videoId]);

  const handleLike = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('like_video', {
        body: { video_id: videoId }
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

  const formatLikeCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
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
  );
};

export default VideoActions;
