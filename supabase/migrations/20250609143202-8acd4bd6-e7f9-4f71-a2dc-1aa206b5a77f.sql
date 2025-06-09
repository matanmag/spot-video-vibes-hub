
-- Create spots table for filming locations
CREATE TABLE public.spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- duration in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate likes from the same user on the same video
CREATE UNIQUE INDEX likes_user_video_uq ON likes (user_id, video_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for spots (publicly readable, authenticated users can create/update)
CREATE POLICY "Anyone can view spots" 
  ON public.spots 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create spots" 
  ON public.spots 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update spots" 
  ON public.spots 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- RLS policies for videos (publicly readable, users can manage their own)
CREATE POLICY "Anyone can view videos" 
  ON public.videos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own videos" 
  ON public.videos 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" 
  ON public.videos 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" 
  ON public.videos 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for likes (users can manage their own likes, all can view)
CREATE POLICY "Anyone can view likes" 
  ON public.likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own likes" 
  ON public.likes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
  ON public.likes 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);
