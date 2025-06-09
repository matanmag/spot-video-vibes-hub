
-- Update the videos-public bucket to support more video formats
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'video/mp4',
  'video/quicktime',
  'video/avi',
  'video/mov',
  'video/webm',
  'video/ogg'
]
WHERE id = 'videos-public';
