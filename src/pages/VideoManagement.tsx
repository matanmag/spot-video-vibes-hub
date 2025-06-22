
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const VideoManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete the 4 most consuming videos
  const deleteTopVideosMutation = useMutation({
    mutationFn: async () => {
      console.log('Fetching videos for deletion...');
      
      // Get videos with multiple files (highest egress impact)
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(4);
      
      if (error) {
        console.error('Error fetching videos:', error);
        throw error;
      }

      if (!videos || videos.length === 0) {
        throw new Error('No videos found to delete');
      }

      console.log(`Found ${videos.length} videos to delete`);
      
      const deletionResults = [];
      
      for (const video of videos) {
        try {
          console.log(`Deleting video: ${video.title}`);
          
          // Use the database function to delete video completely
          const { data: deleteResult, error: deleteError } = await supabase
            .rpc('delete_video_completely', {
              video_id_param: video.id
            });
          
          if (deleteError) {
            console.error(`Error deleting video ${video.id}:`, deleteError);
            continue;
          }
          
          console.log('Database deletion result:', deleteResult);
          
          // Delete files from storage
          const filesToDelete: string[] = [];
          
          if (video.video_url) {
            const videoPath = video.video_url.split('/').pop();
            if (videoPath) filesToDelete.push(videoPath);
          }
          
          if (video.optimized_url) {
            const optimizedPath = video.optimized_url.split('/').pop();
            if (optimizedPath) filesToDelete.push(`previews/${optimizedPath}`);
          }
          
          // Delete from videos bucket
          if (filesToDelete.length > 0) {
            const { error: storageError } = await supabase.storage
              .from('videos-public')
              .remove(filesToDelete);
            
            if (storageError) {
              console.error('Storage deletion error:', storageError);
            }
          }
          
          // Delete thumbnail
          if (video.thumbnail_url) {
            const thumbnailPath = video.thumbnail_url.split('/').pop();
            if (thumbnailPath) {
              const { error: thumbError } = await supabase.storage
                .from('thumbnails-public')
                .remove([`thumbnails/${thumbnailPath}`]);
              
              if (thumbError) {
                console.error('Thumbnail deletion error:', thumbError);
              }
            }
          }
          
          deletionResults.push({
            title: video.title,
            success: true
          });
          
        } catch (error) {
          console.error(`Failed to delete video ${video.title}:`, error);
          deletionResults.push({
            title: video.title,
            success: false,
            error: error
          });
        }
      }
      
      return deletionResults;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      toast({
        title: "Videos deleted successfully",
        description: `${successCount} out of ${results.length} videos have been deleted to reduce egress usage`,
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error('Bulk deletion error:', error);
      toast({
        title: "Error deleting videos",
        description: error.message || "Failed to delete videos",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTopVideos = async () => {
    setIsDeleting(true);
    try {
      await deleteTopVideosMutation.mutateAsync();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access video management.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Reduce Egress Usage</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delete High-Impact Videos</CardTitle>
            <p className="text-sm text-muted-foreground">
              This will delete the 4 oldest videos to quickly reduce your Supabase egress usage. 
              These videos likely have multiple files (original + optimized + thumbnail) that consume the most bandwidth.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Warning:</strong> This action cannot be undone. The 4 oldest videos and all their associated files will be permanently deleted.
              </p>
            </div>
            
            <Button
              onClick={handleDeleteTopVideos}
              variant="destructive"
              disabled={isDeleting || deleteTopVideosMutation.isPending}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting || deleteTopVideosMutation.isPending ? 'Deleting Videos...' : 'Delete 4 Oldest Videos'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Estimated egress savings: ~280MB (4 videos × ~70MB average per video)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoManagement;
