
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateThumbnail = (videoFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 1; // Capture at 1 second
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        }
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const getVideoDuration = (videoFile: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => reject(new Error('Failed to get video duration'));
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const uploadVideo = async (
    videoFile: File,
    title: string,
    description?: string,
    spotId?: string
  ): Promise<VideoUploadResult | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload videos.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Generate unique filename
      const timestamp = Date.now();
      const videoFileName = `${timestamp}-${videoFile.name}`;
      const thumbnailFileName = `${timestamp}-thumbnail.jpg`;

      console.log('Starting video upload process...');

      // Upload video file
      setProgress(25);
      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos-public')
        .upload(videoFileName, videoFile);

      if (videoError) {
        console.error('Video upload error:', videoError);
        throw videoError;
      }

      console.log('Video uploaded successfully:', videoData);

      // Get video URL
      const { data: videoUrlData } = supabase.storage
        .from('videos-public')
        .getPublicUrl(videoFileName);

      setProgress(50);

      // Generate and upload thumbnail
      let thumbnailUrl: string | undefined;
      try {
        const thumbnailFile = await generateThumbnail(videoFile);
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('thumbnails-public')
          .upload(thumbnailFileName, thumbnailFile);

        if (!thumbnailError && thumbnailData) {
          const { data: thumbnailUrlData } = supabase.storage
            .from('thumbnails-public')
            .getPublicUrl(thumbnailFileName);
          thumbnailUrl = thumbnailUrlData.publicUrl;
          console.log('Thumbnail uploaded successfully:', thumbnailUrl);
        }
      } catch (thumbnailError) {
        console.warn('Failed to generate thumbnail:', thumbnailError);
        // Continue without thumbnail
      }

      setProgress(75);

      // Get video duration
      let duration: number | undefined;
      try {
        duration = await getVideoDuration(videoFile);
        console.log('Video duration:', duration);
      } catch (durationError) {
        console.warn('Failed to get video duration:', durationError);
      }

      // Create or get default spot if none provided
      let finalSpotId = spotId;
      if (!finalSpotId) {
        const { data: defaultSpot, error: spotError } = await supabase
          .from('spots')
          .select('id')
          .eq('name', 'Default Location')
          .maybeSingle();

        if (spotError) {
          console.error('Error fetching default spot:', spotError);
        }

        if (!defaultSpot) {
          // Create default spot
          const { data: newSpot, error: createSpotError } = await supabase
            .from('spots')
            .insert({
              name: 'Default Location',
              description: 'Default filming location',
              latitude: 40.7128,
              longitude: -74.0060
            })
            .select('id')
            .single();

          if (createSpotError) {
            console.error('Error creating default spot:', createSpotError);
            throw createSpotError;
          }

          finalSpotId = newSpot.id;
        } else {
          finalSpotId = defaultSpot.id;
        }
      }

      // Save video metadata to database
      const { data: videoRecord, error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          spot_id: finalSpotId,
          title,
          description,
          video_url: videoUrlData.publicUrl,
          thumbnail_url: thumbnailUrl,
          duration: duration ? Math.round(duration) : null
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      setProgress(100);

      console.log('Video upload completed successfully:', videoRecord);

      toast({
        title: "Upload successful!",
        description: `${title} has been uploaded successfully.`,
      });

      return {
        videoUrl: videoUrlData.publicUrl,
        thumbnailUrl,
        duration
      };

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
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
