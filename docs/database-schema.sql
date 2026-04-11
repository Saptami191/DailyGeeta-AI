-- ============================================
-- Daily Geeta SaaS Features - Database Schema
-- ============================================

-- 1. Update profiles table with trial, referral, and points columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by_id TEXT;

-- 2. Create ratings table for verse ratings
CREATE TABLE IF NOT EXISTS ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    verse_id TEXT NOT NULL, -- Format: "chapter-verse" (e.g., "2-47")
    rating_value INT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure a user can only rate a verse once
    UNIQUE(user_id, verse_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_id ON profiles(referred_by_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_verse_id ON ratings(verse_id);
CREATE INDEX IF NOT EXISTS idx_ratings_value ON ratings(rating_value);

-- 4. Add Row Level Security (RLS) policies
-- Enable RLS on ratings table
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own ratings
CREATE POLICY "Users can view own ratings" ON ratings
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can only insert their own ratings
CREATE POLICY "Users can insert own ratings" ON ratings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can only update their own ratings
CREATE POLICY "Users can update own ratings" ON ratings
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Users can only delete their own ratings
CREATE POLICY "Users can delete own ratings" ON ratings
    FOR DELETE USING (auth.uid()::text = user_id);

-- 5. Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    prefix TEXT := 'GEETA';
    suffix TEXT;
BEGIN
    -- Generate 6-digit random number
    suffix := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    code := prefix || suffix;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = code) LOOP
        suffix := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        code := prefix || suffix;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to automatically generate referral code for new users
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_profile_insert_generate_referral_code ON profiles;
CREATE TRIGGER on_profile_insert_generate_referral_code
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_referral_code();

-- 7. Function to check if user is in trial period
CREATE OR REPLACE FUNCTION is_user_in_trial(user_clerk_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    trial_start TIMESTAMPTZ;
BEGIN
    SELECT trial_started_at INTO trial_start
    FROM profiles
    WHERE clerk_id = user_clerk_id;
    
    -- Return false if no trial start found
    IF trial_start IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if 7 days have passed
    RETURN trial_start > (now() - interval '7 days');
END;
$$ LANGUAGE plpgsql;

-- 8. Function to award points for referrals
CREATE OR REPLACE FUNCTION award_referral_points(referrer_id TEXT, referred_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Award 10 points to referrer
    UPDATE profiles 
    SET points = points + 10 
    WHERE clerk_id = referrer_id;
    
    -- Mark the new user as referred
    UPDATE profiles 
    SET referred_by_id = referrer_id 
    WHERE clerk_id = referred_id;
    
    -- Log the referral (optional - for analytics)
    INSERT INTO referrals_log (referrer_id, referred_id, points_awarded, created_at)
    VALUES (referrer_id, referred_id, 10, now());
END;
$$ LANGUAGE plpgsql;

-- 9. Create referrals_log table for tracking
CREATE TABLE IF NOT EXISTS referrals_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL,
    points_awarded INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on referrals_log
ALTER TABLE referrals_log ENABLE ROW LEVEL SECURITY;

-- 10. Sample data (for testing - remove in production)
-- This creates a test user with referral code GEETA123456
INSERT INTO profiles (clerk_id, email, trial_started_at, points, referral_code)
VALUES ('test-user-123', 'test@example.com', now(), 50, 'GEETA123456')
ON CONFLICT (clerk_id) DO NOTHING;
