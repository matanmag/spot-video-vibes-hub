
import { supabase } from '@/integrations/supabase/client';

interface VideoMetadata {
  title: string;
  description: string;
  videoUrl: string;
  optimizedUrl: string;
  thumbnailUrl: string;
  spotId: string;
  userId: string;
}

export const saveVideoMetadata = async (metadata: VideoMetadata) => {
  console.log('Saving video metadata:', metadata);
  
  const { data: videoData, error: dbError } = await supabase
    .from('videos')
    .insert({
      user_id: metadata.userId,
      title: metadata.title,
      description: metadata.description,
      video_url: metadata.videoUrl,
      optimized_url: metadata.optimizedUrl,
      thumbnail_url: metadata.thumbnailUrl,
      spot_id: metadata.spotId,
      duration: null,
    })
    .select()
    .single();

  if (dbError) {
    console.error('Database error:', dbError);
    throw new Error(`Failed to save video metadata: ${dbError.message}`);
  }

  console.log('Video metadata saved successfully:', videoData);
  return videoData;
};

export const updateUserLocationPreference = async (userId: string, spotId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ last_spot_id: spotId })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating user location preference:', error);
    }
  } catch (error) {
    console.error('Error updating user location preference:', error);
    // Don't throw here as the video upload was successful
  }
};
