
-- Create the videos-public storage bucket for video files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos-public', 
  'videos-public', 
  true, 
  209715200, -- 200MB in bytes
  ARRAY['video/mp4']
);

-- Create RLS policies for the videos-public bucket
CREATE POLICY "Anyone can view videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos-public');

CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'videos-public');

CREATE POLICY "Users can update their own videos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'videos-public' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own videos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'videos-public' AND auth.uid() = owner);

-- Create the thumbnails-public storage bucket for thumbnail images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails-public', 
  'thumbnails-public', 
  true, 
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policies for the thumbnails-public bucket
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails-public');

CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'thumbnails-public');

CREATE POLICY "Users can update their own thumbnails" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'thumbnails-public' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own thumbnails" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'thumbnails-public' AND auth.uid() = owner);
