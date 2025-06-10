
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('Starting video upload:', fileName);

      // Upload video file to storage - using the correct bucket name
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos-public')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      setProgress(50);

      // Get public URL for the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos-public')
        .getPublicUrl(fileName);

      console.log('Video uploaded successfully, public URL:', publicUrl);

      // Use provided spotId or default spot
      const finalSpotId = spotId || '123e4567-e89b-12d3-a456-426614174000';

      // Save video metadata to database
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description: description || '',
          video_url: publicUrl,
          spot_id: finalSpotId,
          duration: null, // Could be calculated from the video file
          thumbnail_url: null // Could be generated from the video
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      // Update user's last location preference if a location was selected
      if (spotId) {
        try {
          await supabase
            .from('profiles')
            .update({ last_spot_id: spotId })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error updating user location preference:', error);
          // Don't throw here as the video upload was successful
        }
      }

      setProgress(100);

      toast({
        title: "Video uploaded successfully!",
        description: "Your video has been uploaded and is now available.",
      });

      console.log('Video metadata saved:', videoData);
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
