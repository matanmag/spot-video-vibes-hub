import { useState } from 'react';
import { MessageCircle, Send, LogIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CommentDialogProps {
  videoId: string;
  commentsCount?: number;
  children?: React.ReactNode;
}

const CommentDialog = ({ videoId, commentsCount = 0, children }: CommentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { comments, isLoading, addComment, isAddingComment } = useComments(videoId);

  const handleAddComment = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment on videos",
        action: (
          <Button
            size="sm"
            onClick={() => {
              setOpen(false);
              navigate('/login');
            }}
            className="flex items-center gap-1"
          >
            <LogIn className="h-3 w-3" />
            Sign in
          </Button>
        ),
      });
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    addComment(commentText);
    setCommentText('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="glass-button text-white h-12 w-12 rounded-full p-0 flex-col"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">{commentsCount}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col flex-1 gap-4">
          {/* Comments List */}
          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        @{comment.profiles?.email?.split('@')[0] || 'user'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Add Comment */}
          <div className="border-t pt-4 space-y-3">
            <Textarea
              placeholder={user ? "Add a comment..." : "Sign in to comment"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user || isAddingComment}
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {commentText.length}/1000
              </span>
              <Button
                onClick={handleAddComment}
                disabled={!user || !commentText.trim() || isAddingComment}
                size="sm"
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isAddingComment ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;