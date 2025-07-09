import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: {
    email: string;
  };
}

export const useComments = (videoId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments for a video
  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          video_id,
          user_id,
          text,
          created_at,
          profiles!inner(email)
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!videoId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      console.log('Adding comment - User:', user?.id, 'VideoId:', videoId, 'Text:', text);
      
      if (!user) {
        throw new Error('User must be authenticated to add comments');
      }

      const { data, error } = await supabase.functions.invoke('add_comment', {
        body: {
          video_id: videoId,
          text: text.trim()
        }
      });

      console.log('Comment response:', { data, error });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const addComment = (text: string) => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addCommentMutation.mutate(text);
  };

  return {
    comments,
    isLoading,
    error,
    addComment,
    isAddingComment: addCommentMutation.isPending,
    refetch,
  };
};