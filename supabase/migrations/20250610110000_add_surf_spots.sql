-- Create surf_spots table
CREATE TABLE IF NOT EXISTS surf_spots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    best_season VARCHAR(100),
    wave_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster location-based queries
CREATE INDEX idx_surf_spots_location ON surf_spots(location);
CREATE INDEX idx_surf_spots_country ON surf_spots(country);

-- Add RLS policies
ALTER TABLE surf_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON surf_spots
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON surf_spots
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON surf_spots
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON surf_spots
    FOR DELETE
    USING (auth.role() = 'authenticated'); 