
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
  // Check if storage buckets exist
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('Error checking buckets:', bucketsError);
    throw new Error('Storage not configured. Please set up Supabase storage buckets.');
  }

  const videosBucket = buckets?.find(bucket => bucket.name === 'videos-public');
  
  if (!videosBucket) {
    console.error('videos-public bucket not found. Available buckets:', buckets?.map(b => b.name));
    throw new Error('Storage bucket "videos-public" not found. Please create it in Supabase dashboard.');
  }

  // Generate unique filenames
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const baseFileName = `${userId}/${timestamp}`;
  
  const originalFileName = `${baseFileName}.${fileExt}`;
  const previewFileName = `previews/${baseFileName}.mp4`;
  const thumbnailFileName = `thumbnails/${baseFileName}.jpg`;

  console.log('Uploading files:', { originalFileName, previewFileName, thumbnailFileName });

  try {
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
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
