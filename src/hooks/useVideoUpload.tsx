
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { generateVideoPreview } from '@/utils/videoPreviewGenerator';
import { uploadVideoFiles } from '@/utils/videoFileUploader';
import { saveVideoMetadata, updateUserLocationPreference } from '@/services/videoMetadataService';

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadVideo = async (file: File, title: string, description?: string, spotId?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload videos.",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log('Starting video upload process:', title);

      // Generate preview and thumbnail
      setProgress(10);
      const { previewBlob, thumbnailBlob } = await generateVideoPreview(file);
      
      setProgress(20);

      // Upload files to storage
      const { originalUrl, optimizedUrl, thumbnailUrl } = await uploadVideoFiles(
        file,
        previewBlob,
        thumbnailBlob,
        user.id
      );

      setProgress(80);

      // Use provided spotId or default spot
      const finalSpotId = spotId || '123e4567-e89b-12d3-a456-426614174000';

      // Save video metadata to database
      const videoData = await saveVideoMetadata({
        title,
        description: description || '',
        videoUrl: originalUrl,
        optimizedUrl,
        thumbnailUrl,
        spotId: finalSpotId,
        userId: user.id,
      });

      // Update user's last location preference if a location was selected
      if (spotId) {
        await updateUserLocationPreference(user.id, spotId);
      }

      setProgress(100);

      toast({
        title: "Video uploaded successfully!",
        description: "Your video has been uploaded and is now available.",
      });

      return videoData;

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
      setProgress(0);
    }
  };

  return {
    uploadVideo,
    uploading,
    progress
  };
};
