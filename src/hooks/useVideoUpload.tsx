
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const generatePreview = async (file: File): Promise<{ previewBlob: Blob; thumbnailBlob: Blob }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        // Set canvas dimensions for 720p
        const aspectRatio = video.videoWidth / video.videoHeight;
        canvas.height = 720;
        canvas.width = Math.round(720 * aspectRatio);

        // Generate thumbnail at 1 second
        video.currentTime = 1;
      };

      video.onseeked = () => {
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw frame for thumbnail
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((thumbnailBlob) => {
          if (!thumbnailBlob) {
            reject(new Error('Could not generate thumbnail'));
            return;
          }

          // For now, we'll use the original file as preview since FFmpeg.wasm would add significant complexity
          // In a production environment, you'd want to use FFmpeg.wasm or server-side processing
          resolve({
            previewBlob: file, // Using original file for now
            thumbnailBlob
          });
        }, 'image/jpeg', 0.8);
      };

      video.onerror = () => reject(new Error('Could not load video'));
      video.src = URL.createObjectURL(file);
    });
  };

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
      const { previewBlob, thumbnailBlob } = await generatePreview(file);
      
      setProgress(20);

      // Generate unique filenames
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const baseFileName = `${user.id}/${timestamp}`;
      
      const originalFileName = `${baseFileName}.${fileExt}`;
      const previewFileName = `previews/${baseFileName}.mp4`;
      const thumbnailFileName = `thumbnails/${baseFileName}.jpg`;

      console.log('Uploading files:', { originalFileName, previewFileName, thumbnailFileName });

      // Upload original video
      const { data: originalUpload, error: originalError } = await supabase.storage
        .from('videos-public')
        .upload(originalFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (originalError) {
        console.error('Original video upload error:', originalError);
        throw originalError;
      }

      setProgress(40);

      // Upload preview video (for now, same as original)
      const { data: previewUpload, error: previewError } = await supabase.storage
        .from('videos-public')
        .upload(previewFileName, previewBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (previewError) {
        console.error('Preview video upload error:', previewError);
        throw previewError;
      }

      setProgress(60);

      // Upload thumbnail
      const { data: thumbnailUpload, error: thumbnailError } = await supabase.storage
        .from('videos-public')
        .upload(thumbnailFileName, thumbnailBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (thumbnailError) {
        console.error('Thumbnail upload error:', thumbnailError);
        throw thumbnailError;
      }

      setProgress(80);

      // Get public URLs
      const { data: { publicUrl: originalUrl } } = supabase.storage
        .from('videos-public')
        .getPublicUrl(originalFileName);

      const { data: { publicUrl: optimizedUrl } } = supabase.storage
        .from('videos-public')
        .getPublicUrl(previewFileName);

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('videos-public')
        .getPublicUrl(thumbnailFileName);

      console.log('Files uploaded successfully:', { originalUrl, optimizedUrl, thumbnailUrl });

      // Use provided spotId or default spot
      const finalSpotId = spotId || '123e4567-e89b-12d3-a456-426614174000';

      // Save video metadata to database
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description: description || '',
          video_url: originalUrl,
          optimized_url: optimizedUrl,
          thumbnail_url: thumbnailUrl,
          spot_id: finalSpotId,
          duration: null,
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
