
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cleanupTopVideos, getDeletionStats } from '@/services/videoDeletionService';

export const useVideoDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  const executeCleanup = async (count: number = 4) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      console.log(`Starting cleanup of ${count} videos...`);
      
      const result = await cleanupTopVideos(count);
      
      if (result.success) {
        toast({
          title: "Cleanup Successful",
          description: result.message,
        });
        
        // Refresh stats after deletion
        await refreshStats();
        
        return result;
      } else {
        toast({
          title: "Cleanup Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
        
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Cleanup error:', error);
      
      toast({
        title: "Cleanup Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage, deletedCount: 0 };
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshStats = async () => {
    try {
      const deletionStats = await getDeletionStats();
      setStats(deletionStats);
      return deletionStats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deletion statistics",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    executeCleanup,
    refreshStats,
    isDeleting,
    stats
  };
};
