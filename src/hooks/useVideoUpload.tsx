
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadVideo = async (file: File, title: string, description?: string) => {
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

      // Upload video file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
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
        .from('videos')
        .getPublicUrl(fileName);

      console.log('Video uploaded successfully, public URL:', publicUrl);

      // For now, we'll use a default spot_id. In a real app, this would be selected by the user
      const defaultSpotId = '123e4567-e89b-12d3-a456-426614174000'; // This would need to exist in the spots table

      // Save video metadata to database
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description: description || '',
          video_url: publicUrl,
          spot_id: defaultSpotId, // This should be selected by user in a real app
          duration: null, // Could be calculated from the video file
          thumbnail_url: null // Could be generated from the video
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
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
