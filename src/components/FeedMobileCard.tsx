import { useState } from 'react';
import { MoreVertical, Heart, MessageCircle, Share, Trash2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import VideoPlayer from '@/components/VideoPlayer';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useComments } from '@/hooks/useComments';

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

const FeedMobileCard = ({ video }: FeedMobileCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { data: comments = [], addComment } = useComments(video.id);

  const useDeleteVideoMutation = () => {
    return useMutation({
      mutationFn: async (videoId: string) => {
        const { error } = await supabase
          .from('videos')
          .delete()
          .eq('id', videoId);
        
        if (error) throw error;
      },
      onSuccess: () => {
        toast({
          title: "Video deleted",
          description: "Your video has been deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['videos'] });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete video",
          variant: "destructive",
        });
      },
    });
  };

  const deleteVideoMutation = useDeleteVideoMutation();

  const handleDeleteVideo = () => {
    if (user?.id === video.user_id) {
      deleteVideoMutation.mutate(video.id);
    }
  };

  const canShowDropdown = user?.id === video.user_id;

  const handleLikeClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like videos",
        action: (
          <Button
            size="sm"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1"
          >
            <LogIn className="h-3 w-3" />
            Sign in
          </Button>
        ),
      });
      return;
    }
    setIsLiked(!isLiked);
  };

  const handleCommentClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment on videos",
        action: (
          <Button
            size="sm"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1"
          >
            <LogIn className="h-3 w-3" />
            Sign in
          </Button>
        ),
      });
      return;
    }
    setCommentsOpen(true);
  };

  return (
    <div className="relative w-full h-screen bg-black flex flex-col">
      {/* Video Player */}
      <div className="flex-1 relative">
        <VideoPlayer 
          video={video} 
          containerRef={{ current: null }} 
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex justify-between items-end">
          {/* Left Side - Video Info */}
          <div className="flex-1 pr-4">
            <div className="mb-2">
              <p className="text-white text-sm opacity-75">
                @{video.profiles?.email?.split('@')[0] || 'user'}
              </p>
            </div>
            
            <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2">
              {video.title}
            </h3>
            
            {video.description && (
              <p className="text-white text-sm opacity-90 line-clamp-2 mb-2">
                {video.description}
              </p>
            )}
            
            {video.spots && (
              <p className="text-turquoise text-sm mb-2">
                📍 {video.spots.name}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-white text-sm">
              <span>{video.views || 0} views</span>
              <span>{video.created_at ? new Date(video.created_at).toLocaleDateString() : ''}</span>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-col items-center space-y-4">
            {/* Three-dot menu for video owner */}
            {canShowDropdown && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="glass-button text-white h-12 w-12 rounded-full p-0"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDeleteVideo}
                    className="text-red-600 focus:text-red-600"
                    disabled={deleteVideoMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete video
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              className="glass-button text-white h-12 w-12 rounded-full p-0 flex-col"
              onClick={handleLikeClick}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-xs mt-1">{likesCount}</span>
            </Button>

            {/* Comment Button */}
            <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="glass-button text-white h-12 w-12 rounded-full p-0 flex-col"
                  onClick={handleCommentClick}
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-xs mt-1">{comments.length}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Comments</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="text-sm">
                      <p className="font-medium">{c.profiles?.email ?? 'user'}</p>
                      <p>{c.text}</p>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newComment.trim()) return;
                    await addComment(newComment.trim());
                    setNewComment('');
                  }}
                >
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment"
                    className="mb-2"
                  />
                  <DialogFooter>
                    <Button type="submit" size="sm">
                      Post
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="ghost" size="sm">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              className="glass-button text-white h-12 w-12 rounded-full p-0"
            >
              <Share className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FeedMobileCard;