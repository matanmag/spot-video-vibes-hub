-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  last_spot_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spots table for surf locations
CREATE TABLE public.spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  optimized_url TEXT,
  thumbnail_url TEXT,
  spot_id UUID REFERENCES public.spots ON DELETE SET NULL,
  duration INTEGER,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create video_views table for tracking views
CREATE TABLE public.video_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos ON DELETE CASCADE,
  viewer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, viewer)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Spots policies (public read access)
CREATE POLICY "Anyone can view spots" ON public.spots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create spots" ON public.spots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update spots" ON public.spots FOR UPDATE TO authenticated USING (true);

-- Videos policies
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Users can create their own videos" ON public.videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own videos" ON public.videos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own videos" ON public.videos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Video views policies
CREATE POLICY "Anyone can view video_views" ON public.video_views FOR SELECT USING (true);
CREATE POLICY "Anyone can create video views" ON public.video_views FOR INSERT WITH CHECK (true);

-- Create function to search spots
CREATE OR REPLACE FUNCTION public.search_spots(q TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  country TEXT,
  lat DECIMAL,
  lon DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    spots.id,
    spots.name,
    spots.country,
    spots.latitude as lat,
    spots.longitude as lon
  FROM public.spots
  WHERE 
    spots.name ILIKE '%' || q || '%' 
    OR spots.country ILIKE '%' || q || '%'
  ORDER BY spots.name
  LIMIT 50;
END;
$$;

-- Create function to increment video views
CREATE OR REPLACE FUNCTION public.increment_video_views(video_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.videos 
  SET views = COALESCE(views, 0) + 1
  WHERE id = video_id;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spots_updated_at
  BEFORE UPDATE ON public.spots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();