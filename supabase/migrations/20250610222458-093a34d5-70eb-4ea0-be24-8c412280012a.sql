
-- Add type column to spots table
ALTER TABLE public.spots 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'surf';

-- Update existing spots to have 'surf' type
UPDATE public.spots 
SET type = 'surf' 
WHERE type IS NULL;

-- Insert the 15 famous surf spots (without ON CONFLICT since there's no unique constraint)
INSERT INTO public.spots (name, country, latitude, longitude, description, type) 
SELECT * FROM (VALUES
('Pipeline', 'USA', 21.6611, -158.0489, 'World-famous reef break located on the North Shore of Oahu, Hawaii. Known for its powerful, barreling waves.', 'surf'),
('Bells Beach', 'Australia', -38.3725, 144.2817, 'Iconic right-hand point break in Victoria, Australia. Home to the Rip Curl Pro surfing competition.', 'surf'),
('Trestles', 'USA', 33.3892, -117.5511, 'World-class point break located in San Clemente, California. Known for its consistent, high-quality waves.', 'surf'),
('Uluwatu', 'Indonesia', -8.8290, 115.0851, 'Famous left-hand reef break in Bali. Offers long, barreling rides with stunning clifftop views.', 'surf'),
('Jeffreys Bay', 'South Africa', -34.0333, 24.9167, 'World-class right-hand point break in the Eastern Cape. Famous for its long, fast waves.', 'surf'),
('Teahupoo', 'French Polynesia', -17.8333, -149.2833, 'Heavy reef break in Tahiti known for its thick, powerful barrels. One of the most dangerous waves in the world.', 'surf'),
('Mundaka', 'Spain', 43.4167, -2.7000, 'World-class left-hand river mouth wave in the Basque Country. Known for its long, perfect barrels.', 'surf'),
('Snapper Rocks', 'Australia', -28.1667, 153.5500, 'Superbank point break on the Gold Coast. Famous for its long rides and consistent waves.', 'surf'),
('Hossegor', 'France', 43.6500, -1.4000, 'Powerful beach break in southwestern France. Known for its heavy, barreling waves.', 'surf'),
('Cloudbreak', 'Fiji', -17.7500, 177.8333, 'World-class left-hand reef break near Tavarua Island. Offers massive, perfect waves.', 'surf'),
('Rincon', 'USA', 34.3472, -119.4756, 'Classic right-hand point break in California. Known as the "Queen of the Coast" for its perfect waves.', 'surf'),
('Supertubos', 'Portugal', 39.3667, -9.3833, 'Powerful beach break in Peniche. Famous for its heavy, barreling waves and professional competitions.', 'surf'),
('Punta de Lobos', 'Chile', -34.4000, -72.0167, 'Long left-hand point break near Pichilemu. Known for its consistent waves and long rides.', 'surf'),
('Skeleton Bay', 'Namibia', -23.0000, 14.5167, 'Mysterious left-hand sand bottom point break in the Namib Desert. Offers incredibly long rides.', 'surf'),
('Tavarua Rights', 'Fiji', -17.8500, 177.2000, 'Perfect right-hand reef break near Tavarua Island. Known for its consistent, world-class waves.', 'surf')
) AS new_spots(name, country, latitude, longitude, description, type)
WHERE NOT EXISTS (
  SELECT 1 FROM public.spots 
  WHERE spots.name = new_spots.name AND spots.country = new_spots.country
);

-- Update the search_spots function to filter by surf spots only and improve search logic
CREATE OR REPLACE FUNCTION public.search_spots(q text)
RETURNS TABLE(id uuid, name text, country text, lat numeric, lon numeric) AS $$
  SELECT s.id, s.name, s.country, s.latitude as lat, s.longitude as lon
  FROM spots s
  WHERE s.type = 'surf' 
    AND (s.name ILIKE '%' || q || '%' OR s.country ILIKE '%' || q || '%')
  ORDER BY 
    CASE 
      WHEN LOWER(s.name) = LOWER(q) THEN 1
      WHEN LOWER(s.country) = LOWER(q) THEN 2
      WHEN LOWER(s.name) LIKE LOWER(q) || '%' THEN 3
      WHEN LOWER(s.country) LIKE LOWER(q) || '%' THEN 4
      ELSE 5
    END,
    similarity(s.name, q) DESC,
    s.name
  LIMIT 10;
$$ LANGUAGE sql STABLE;
