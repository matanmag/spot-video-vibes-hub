
import { supabase } from '@/integrations/supabase/client';

interface UploadResult {
  originalUrl: string;
  optimizedUrl: string;
  thumbnailUrl: string;
}

export const uploadVideoFiles = async (
  file: File,
  previewBlob: Blob,
  thumbnailBlob: Blob,
  userId: string
): Promise<UploadResult> => {
  // Generate unique filenames
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const baseFileName = `${userId}/${timestamp}`;
  
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

  return { originalUrl, optimizedUrl, thumbnailUrl };
};
