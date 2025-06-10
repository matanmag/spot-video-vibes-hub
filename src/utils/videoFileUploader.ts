
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
      throw new Error(`Failed to upload video: ${originalError.message}`);
    }

    // Upload preview video
    const { data: previewUpload, error: previewError } = await supabase.storage
      .from('videos-public')
      .upload(previewFileName, previewBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (previewError) {
      console.error('Preview video upload error:', previewError);
      throw new Error(`Failed to upload preview: ${previewError.message}`);
    }

    // Upload thumbnail to thumbnails bucket
    const { data: thumbnailUpload, error: thumbnailError } = await supabase.storage
      .from('thumbnails-public')
      .upload(thumbnailFileName, thumbnailBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (thumbnailError) {
      console.error('Thumbnail upload error:', thumbnailError);
      throw new Error(`Failed to upload thumbnail: ${thumbnailError.message}`);
    }

    // Get public URLs
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('videos-public')
      .getPublicUrl(originalFileName);

    const { data: { publicUrl: optimizedUrl } } = supabase.storage
      .from('videos-public')
      .getPublicUrl(previewFileName);

    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from('thumbnails-public')
      .getPublicUrl(thumbnailFileName);

    console.log('Generated URLs:', { originalUrl, optimizedUrl, thumbnailUrl });

    // Verify URLs are accessible with detailed logging
    try {
      console.log('Testing original URL accessibility...');
      const originalTest = await fetch(originalUrl, { method: 'HEAD' });
      console.log(`Original URL test: ${originalTest.status} ${originalTest.statusText}`);
      console.log('Original URL headers:', Object.fromEntries(originalTest.headers.entries()));

      console.log('Testing optimized URL accessibility...');
      const optimizedTest = await fetch(optimizedUrl, { method: 'HEAD' });
      console.log(`Optimized URL test: ${optimizedTest.status} ${optimizedTest.statusText}`);
      console.log('Optimized URL headers:', Object.fromEntries(optimizedTest.headers.entries()));

      console.log('Testing thumbnail URL accessibility...');
      const thumbnailTest = await fetch(thumbnailUrl, { method: 'HEAD' });
      console.log(`Thumbnail URL test: ${thumbnailTest.status} ${thumbnailTest.statusText}`);
      console.log('Thumbnail URL headers:', Object.fromEntries(thumbnailTest.headers.entries()));
    } catch (error) {
      console.error('Error testing URLs:', error);
    }

    return { originalUrl, optimizedUrl, thumbnailUrl };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
