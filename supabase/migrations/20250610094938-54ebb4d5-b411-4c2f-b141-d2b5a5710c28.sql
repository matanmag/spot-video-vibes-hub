
-- Enable pg_trgm extension for trigram matching
create extension if not exists pg_trgm;

-- Create spots table (keeping existing structure but adding new columns)
-- Note: The spots table already exists, so we'll add the missing columns
alter table public.spots 
add column if not exists msw_id int unique,
add column if not exists country text;

-- Create trigram index for fast text search
create index if not exists spots_name_trgm
  on public.spots using gin (name gin_trgm_ops);

-- Create trigram index for country search as well
create index if not exists spots_country_trgm
  on public.spots using gin (country gin_trgm_ops);

-- The last_spot_id column already exists in profiles table from the migration

-- Create the search_spots RPC function
create or replace function public.search_spots(q text)
returns table(id uuid, name text, country text, lat numeric, lon numeric) as $$
  select id, name, country, latitude as lat, longitude as lon
  from spots
  where name % q or country % q           -- trigram match
  order by similarity(name, q) desc
  limit 10;
$$ language sql stable;
