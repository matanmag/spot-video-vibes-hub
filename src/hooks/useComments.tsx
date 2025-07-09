import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: { email: string | null };
}

const fetchComments = async (videoId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, video_id, user_id, text, created_at, profiles(email)')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching comments:', error);
    throw new Error(error.message);
  }

  return data as Comment[];
};

const addComment = async ({ videoId, text }: { videoId: string; text: string }) => {
  const response = await fetch('/functions/v1/add_comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: videoId, text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add comment');
  }

  const result = await response.json();
  return result.comment as Comment;
};

export const useComments = (videoId: string) => {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => fetchComments(videoId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => addComment({ videoId, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  });

  return { ...commentsQuery, addComment: addCommentMutation.mutateAsync };
};
