-- Additional database functions needed for the SaaS features

-- Function to increment user points safely
CREATE OR REPLACE FUNCTION increment_points(user_id TEXT, increment INT)
RETURNS INT AS $$
DECLARE
    current_points INT;
BEGIN
    -- Get current points
    SELECT points INTO current_points
    FROM profiles
    WHERE clerk_id = user_id;
    
    -- Update points
    UPDATE profiles
    SET points = points + increment
    WHERE clerk_id = user_id;
    
    -- Return new total
    RETURN COALESCE(current_points, 0) + increment;
END;
$$ LANGUAGE plpgsql;

-- Function to get verse rating statistics
CREATE OR REPLACE FUNCTION get_verse_rating_stats(verse_identifier TEXT)
RETURNS TABLE(
    average_rating DECIMAL,
    total_ratings INT,
    rating_1_count INT,
    rating_2_count INT,
    rating_3_count INT,
    rating_4_count INT,
    rating_5_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(rating_value), 2) as average_rating,
        COUNT(*) as total_ratings,
        COUNT(CASE WHEN rating_value = 1 THEN 1 END) as rating_1_count,
        COUNT(CASE WHEN rating_value = 2 THEN 1 END) as rating_2_count,
        COUNT(CASE WHEN rating_value = 3 THEN 1 END) as rating_3_count,
        COUNT(CASE WHEN rating_value = 4 THEN 1 END) as rating_4_count,
        COUNT(CASE WHEN rating_value = 5 THEN 1 END) as rating_5_count
    FROM ratings
    WHERE verse_id = verse_identifier;
END;
$$ LANGUAGE plpgsql;
