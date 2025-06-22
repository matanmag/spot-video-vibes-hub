
import { supabase } from '@/integrations/supabase/client';

interface VideoForDeletion {
  id: string;
  title: string;
  video_url: string;
  optimized_url: string;
  thumbnail_url: string;
  views: number;
  created_at: string;
  file_count: number;
  estimated_size_mb: number;
}

interface DeletionStats {
  total_videos: number;
  videos_with_multiple_files: number;
  estimated_total_size_gb: number;
  low_view_videos: number;
  old_videos: number;
}

export const getVideosForDeletion = async (): Promise<VideoForDeletion[]> => {
  console.log('Fetching videos recommended for deletion...');
  
  const { data, error } = await supabase.rpc('get_videos_for_deletion');
  
  if (error) {
    console.error('Error fetching videos for deletion:', error);
    throw new Error(`Failed to fetch videos for deletion: ${error.message}`);
  }
  
  return data || [];
};

export const getDeletionStats = async (): Promise<DeletionStats> => {
  console.log('Fetching deletion statistics...');
  
  const { data, error } = await supabase.rpc('get_deletion_stats');
  
  if (error) {
    console.error('Error fetching deletion stats:', error);
    throw new Error(`Failed to fetch deletion stats: ${error.message}`);
  }
  
  return data || {
    total_videos: 0,
    videos_with_multiple_files: 0,
    estimated_total_size_gb: 0,
    low_view_videos: 0,
    old_videos: 0
  };
};

export const deleteVideoCompletely = async (videoId: string) => {
  console.log('Deleting video completely:', videoId);
  
  const { data, error } = await supabase.rpc('delete_video_completely', {
    video_id_param: videoId
  });
  
  if (error) {
    console.error('Error deleting video:', error);
    throw new Error(`Failed to delete video: ${error.message}`);
  }
  
  if (!data?.success) {
    throw new Error(data?.error || 'Unknown error deleting video');
  }
  
  console.log('Video deleted successfully:', data);
  return data;
};

export const deleteStorageFiles = async (urls: string[]) => {
  console.log('Deleting storage files:', urls);
  
  const deletePromises = urls.map(async (url) => {
    try {
      // Extract bucket and file path from URL
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'storage');
      
      if (bucketIndex === -1) {
        console.warn('Invalid storage URL format:', url);
        return;
      }
      
      const bucket = urlParts[bucketIndex + 2]; // Skip 'storage/v1/object/public'
      const filePath = urlParts.slice(bucketIndex + 3).join('/');
      
      console.log(`Deleting from bucket: ${bucket}, path: ${filePath}`);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      if (error) {
        console.error(`Error deleting file ${filePath} from ${bucket}:`, error);
      } else {
        console.log(`Successfully deleted file: ${filePath}`);
      }
    } catch (error) {
      console.error('Error processing file deletion:', error);
    }
  });
  
  await Promise.allSettled(deletePromises);
};

export const cleanupTopVideos = async (count: number = 4) => {
  console.log(`Starting cleanup of top ${count} storage-consuming videos...`);
  
  try {
    // Get videos recommended for deletion
    const videosForDeletion = await getVideosForDeletion();
    
    if (videosForDeletion.length === 0) {
      console.log('No videos found for deletion');
      return { success: true, deletedCount: 0, message: 'No videos to delete' };
    }
    
    // Take only the top N videos (they're already sorted by storage consumption)
    const videosToDelete = videosForDeletion.slice(0, count);
    console.log(`Deleting ${videosToDelete.length} videos:`, videosToDelete.map(v => ({ title: v.title, size: v.estimated_size_mb })));
    
    let deletedCount = 0;
    let totalSizeFreed = 0;
    
    for (const video of videosToDelete) {
      try {
        // Delete from database first
        const result = await deleteVideoCompletely(video.id);
        
        // Collect file URLs for deletion
        const filesToDelete = [
          result.video_url,
          result.optimized_url,
          result.thumbnail_url
        ].filter(Boolean);
        
        // Delete files from storage
        if (filesToDelete.length > 0) {
          await deleteStorageFiles(filesToDelete);
        }
        
        deletedCount++;
        totalSizeFreed += video.estimated_size_mb;
        
        console.log(`Successfully deleted video: ${video.title} (${video.estimated_size_mb}MB)`);
      } catch (error) {
        console.error(`Failed to delete video ${video.title}:`, error);
      }
    }
    
    const message = `Successfully deleted ${deletedCount} videos, freeing ~${totalSizeFreed}MB of storage`;
    console.log(message);
    
    return {
      success: true,
      deletedCount,
      totalSizeFreed,
      message
    };
  } catch (error) {
    console.error('Error during video cleanup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      deletedCount: 0
    };
  }
};
