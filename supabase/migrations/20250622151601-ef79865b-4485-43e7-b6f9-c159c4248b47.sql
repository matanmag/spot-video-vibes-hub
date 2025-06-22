
-- Create a function to delete a video and all its associated data
CREATE OR REPLACE FUNCTION delete_video_completely(video_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    video_record RECORD;
    result JSON;
    files_deleted INTEGER := 0;
BEGIN
    -- Get video details first
    SELECT * INTO video_record FROM videos WHERE id = video_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Video not found');
    END IF;
    
    -- Delete related records first (to avoid foreign key constraints)
    DELETE FROM video_views WHERE video_id = video_id_param;
    DELETE FROM likes WHERE video_id = video_id_param;
    
    -- Delete video record from database
    DELETE FROM videos WHERE id = video_id_param;
    
    -- Return success with video details for file cleanup
    result := json_build_object(
        'success', true,
        'video_id', video_id_param,
        'video_url', video_record.video_url,
        'optimized_url', video_record.optimized_url,
        'thumbnail_url', video_record.thumbnail_url,
        'title', video_record.title
    );
    
    RETURN result;
END;
$$;

-- Create a function to get videos recommended for deletion
CREATE OR REPLACE FUNCTION get_videos_for_deletion()
RETURNS TABLE(
    id UUID,
    title TEXT,
    video_url TEXT,
    optimized_url TEXT,
    thumbnail_url TEXT,
    views INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    file_count INTEGER,
    estimated_size_mb INTEGER
) 
LANGUAGE sql
STABLE
AS $$
    SELECT 
        v.id,
        v.title,
        v.video_url,
        v.optimized_url,
        v.thumbnail_url,
        COALESCE(v.views, 0) as views,
        v.created_at,
        -- Count number of files (original + optimized + thumbnail)
        CASE 
            WHEN v.optimized_url IS NOT NULL AND v.thumbnail_url IS NOT NULL THEN 3
            WHEN v.optimized_url IS NOT NULL OR v.thumbnail_url IS NOT NULL THEN 2
            ELSE 1
        END as file_count,
        -- Rough estimate of file sizes (original ~50MB, optimized ~20MB, thumbnail ~1MB)
        CASE 
            WHEN v.optimized_url IS NOT NULL AND v.thumbnail_url IS NOT NULL THEN 71
            WHEN v.optimized_url IS NOT NULL THEN 70
            WHEN v.thumbnail_url IS NOT NULL THEN 51
            ELSE 50
        END as estimated_size_mb
    FROM videos v
    ORDER BY 
        -- Prioritize videos with multiple files
        file_count DESC,
        -- Then by low view count
        COALESCE(v.views, 0) ASC,
        -- Then by age (older first)
        v.created_at ASC;
$$;

-- Create a function to get deletion statistics
CREATE OR REPLACE FUNCTION get_deletion_stats()
RETURNS JSON
LANGUAGE sql
STABLE
AS $$
    SELECT json_build_object(
        'total_videos', COUNT(*),
        'videos_with_multiple_files', COUNT(*) FILTER (WHERE 
            (optimized_url IS NOT NULL AND thumbnail_url IS NOT NULL) OR
            (optimized_url IS NOT NULL) OR 
            (thumbnail_url IS NOT NULL)
        ),
        'estimated_total_size_gb', ROUND(
            SUM(
                CASE 
                    WHEN optimized_url IS NOT NULL AND thumbnail_url IS NOT NULL THEN 71
                    WHEN optimized_url IS NOT NULL THEN 70
                    WHEN thumbnail_url IS NOT NULL THEN 51
                    ELSE 50
                END
            ) / 1024.0, 2
        ),
        'low_view_videos', COUNT(*) FILTER (WHERE COALESCE(views, 0) < 5),
        'old_videos', COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '30 days')
    )
    FROM videos;
$$;
