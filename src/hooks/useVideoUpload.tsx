
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { videoCompressionService, COMPRESSION_QUALITIES } from '@/services/videoCompression';

interface UploadProgress {
  overall: number;
  compression?: number;
  upload?: number;
  stage: 'compression' | 'upload' | 'complete';
}

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    overall: 0,
    stage: 'compression'
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadVideo = async (
    file: File, 
    title: string, 
    description?: string, 
    spotId?: string,
    enableCompression: boolean = true
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload videos.",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    setProgress({ overall: 0, stage: 'compression' });

    try {
      let originalFileUrl = '';
      let compressedUrls: Record<string, string> = {};
      let thumbnailUrl = '';
      let duration = 0;

      // Initialize compression service
      if (enableCompression) {
        await videoCompressionService.initialize();
        
        // Generate thumbnail
        setProgress({ overall: 10, compression: 0, stage: 'compression' });
        const thumbnailFile = await videoCompressionService.generateThumbnail(file);
        
        // Upload thumbnail
        const thumbnailPath = `${user.id}/${Date.now()}_thumb.webp`;
        const { data: thumbUpload, error: thumbError } = await supabase.storage
          .from('videos-public')
          .upload(thumbnailPath, thumbnailFile);

        if (!thumbError) {
          const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
            .from('videos-public')
            .getPublicUrl(thumbnailPath);
          thumbnailUrl = thumbPublicUrl;
        }

        // Get video duration
        duration = await videoCompressionService.getVideoDuration(file);

        // Compress videos in different qualities
        for (let i = 0; i < COMPRESSION_QUALITIES.length; i++) {
          const quality = COMPRESSION_QUALITIES[i];
          const baseProgress = 20 + (i * 30);

          try {
            const compressedFile = await videoCompressionService.compressVideo(
              file,
              quality,
              (compressionProgress) => {
                setProgress({
                  overall: baseProgress + (compressionProgress * 0.3),
                  compression: compressionProgress,
                  stage: 'compression'
                });
              }
            );

            // Upload compressed version
            const compressedPath = `${user.id}/${Date.now()}${quality.suffix}.mp4`;
            const { data: compressedUpload, error: compressedError } = await supabase.storage
              .from('videos-public')
              .upload(compressedPath, compressedFile);

            if (!compressedError) {
              const { data: { publicUrl } } = supabase.storage
                .from('videos-public')
                .getPublicUrl(compressedPath);
              compressedUrls[`optimized_${quality.name}_url`] = publicUrl;
            }
          } catch (error) {
            console.warn(`Failed to compress ${quality.name}:`, error);
          }
        }
      }

      // Upload original file
      setProgress({ overall: 85, stage: 'upload' });
      const originalPath = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { data: originalUpload, error: originalError } = await supabase.storage
        .from('videos-public')
        .upload(originalPath, file);

      if (originalError) throw originalError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos-public')
        .getPublicUrl(originalPath);
      originalFileUrl = publicUrl;

      // Save to database
      setProgress({ overall: 95, stage: 'upload' });
      const finalSpotId = spotId || '123e4567-e89b-12d3-a456-426614174000';

      const videoData = {
        user_id: user.id,
        title,
        description: description || '',
        video_url: originalFileUrl,
        spot_id: finalSpotId,
        duration: duration || null,
        thumbnail_url: thumbnailUrl || null,
        ...compressedUrls
      };

      const { data: savedVideo, error: dbError } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();

      if (dbError) throw dbError;

      // Update user's last location preference
      if (spotId) {
        try {
          await supabase
            .from('profiles')
            .update({ last_spot_id: spotId })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error updating user location preference:', error);
        }
      }

      setProgress({ overall: 100, stage: 'complete' });

      toast({
        title: "Video uploaded successfully!",
        description: enableCompression 
          ? "Your video has been optimized and uploaded."
          : "Your video has been uploaded.",
      });

      return savedVideo;

    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setProgress({ overall: 0, stage: 'compression' });
    }
  };

  return {
    uploadVideo,
    uploading,
    progress
  };
};
