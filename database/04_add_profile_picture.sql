-- ========================================
-- PSG TECHNOLOGY PLACEMENT MANAGEMENT SYSTEM
-- DATABASE MIGRATION: Add Profile Picture Column
-- FILE 4: Add profile_picture column to leetcode_stats
-- ========================================
-- Run this file in Supabase SQL Editor to add profile picture support
-- ========================================

-- Add profile_picture column to leetcode_stats table
ALTER TABLE leetcode_stats 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add index for profile_picture lookups (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_leetcode_stats_profile_picture 
ON leetcode_stats(profile_picture) 
WHERE profile_picture IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN leetcode_stats.profile_picture IS 'URL to user profile picture from LeetCode GraphQL API';

-- Display confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Successfully added profile_picture column to leetcode_stats table';
    RAISE NOTICE '📝 Profile pictures will be fetched from LeetCode GraphQL API';
    RAISE NOTICE '🖼️ Default profile icon will be shown for users without profile pictures';
END $$;
