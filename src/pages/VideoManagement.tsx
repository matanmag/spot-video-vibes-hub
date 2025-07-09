
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Database, HardDrive, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface VideoForDeletion {
  id: string;
  title: string;
  video_url: string;
  optimized_url: string;
  thumbnail_url: string;
  views: number;
  created_at: string;
  likes_count: number;
}

interface DeletionStats {
  total_videos: number;
  videos_with_multiple_files: number;
  estimated_total_size_gb: number;
  low_view_videos: number;
  old_videos: number;
}

const VideoManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

  // Fetch deletion statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['deletion-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_deletion_stats');
      if (error) throw error;
      return data as unknown as DeletionStats;
    },
  });

  // Fetch videos for deletion
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['videos-for-deletion'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_videos_for_deletion');
      if (error) throw error;
      return data as VideoForDeletion[];
    },
  });

  // Delete video mutation (admin)
  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      logger.info('Admin deleting video:', videoId);
      
      const { data, error } = await supabase.functions.invoke('delete_video_admin', {
        body: { id: videoId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Video deleted successfully",
        description: `"${(data as any).title}" has been removed`,
      });
      queryClient.invalidateQueries({ queryKey: ['deletion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['videos-for-deletion'] });
    },
    onError: (error: any) => {
      logger.error('Deletion error:', error);
      toast({
        title: "Error deleting video",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (videoIds: string[]) => {
      const results = [];
      for (const videoId of videoIds) {
        try {
          const result = await deleteVideoMutation.mutateAsync(videoId);
          results.push(result);
        } catch (error) {
          logger.error(`Failed to delete video ${videoId}:`, error);
        }
      }
      return results;
    },
    onSuccess: (results) => {
      toast({
        title: "Bulk deletion completed",
        description: `${results.length} videos have been deleted`,
      });
      setSelectedVideos(new Set());
    },
  });

  const handleSelectVideo = (videoId: string) => {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(videoId)) {
      newSelection.delete(videoId);
    } else {
      newSelection.add(videoId);
    }
    setSelectedVideos(newSelection);
  };

  const handleSelectHighImpact = () => {
    if (!videos) return;
    
    // Select videos with low views and high likes ratio
    const highImpactVideos = videos
      .filter(v => v.views < 5 && v.likes_count === 0)
      .slice(0, 10)
      .map(v => v.id);
    
    setSelectedVideos(new Set(highImpactVideos));
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Video Management</h1>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Total Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_videos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Estimated Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.estimated_total_size_gb} GB</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Low View Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.low_view_videos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Old Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.old_videos}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Selection Actions */}
        <div className="flex flex-wrap gap-3 items-center">
          <Button onClick={handleSelectHighImpact} variant="outline">
            Select High Impact Videos
          </Button>
          
          <Button 
            onClick={() => setSelectedVideos(new Set())} 
            variant="outline"
            disabled={selectedVideos.size === 0}
          >
            Clear Selection
          </Button>
          
          <Button
            onClick={() => bulkDeleteMutation.mutate(Array.from(selectedVideos))}
            variant="destructive"
            disabled={selectedVideos.size === 0 || bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedVideos.size})
          </Button>
          
          {selectedVideos.size > 0 && (
            <Badge variant="secondary">
              Selected: {selectedVideos.size} videos
            </Badge>
          )}
        </div>

        {/* Videos List */}
        <Card>
          <CardHeader>
            <CardTitle>Videos Recommended for Deletion</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sorted by storage impact and view count to help you maximize egress savings
            </p>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <div>Loading videos...</div>
            ) : !videos?.length ? (
              <div>No videos found</div>
            ) : (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVideos.has(video.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleSelectVideo(video.id)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{video.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          {video.views} views
                        </Badge>
                        <Badge variant="outline">
                          ❤️ {video.likes_count} likes
                        </Badge>
                        <Badge variant="outline">
                          {new Date(video.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVideoMutation.mutate(video.id);
                      }}
                      variant="destructive"
                      size="sm"
                      disabled={deleteVideoMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoManagement;
