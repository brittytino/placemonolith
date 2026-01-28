-- ========================================
-- PSG TECHNOLOGY PLACEMENT MANAGEMENT SYSTEM
-- DATABASE TRIGGER: Auto-sync Users with Whitelist
-- FILE 6: Auto-sync trigger for whitelist updates
-- ========================================
-- Run this file in Supabase SQL Editor to enable auto-sync
-- ========================================

-- Function to sync user data when whitelist is updated
CREATE OR REPLACE FUNCTION sync_user_from_whitelist()
RETURNS TRIGGER AS $$
BEGIN
    -- Update existing user if they exist
    UPDATE users
    SET 
        leetcode_username = NEW.leetcode_username,
        name = COALESCE(NEW.name, name),
        dob = COALESCE(NEW.dob, dob),
        team_id = COALESCE(NEW.team_id, team_id),
        batch = COALESCE(NEW.batch, batch),
        roles = COALESCE(NEW.roles, roles),
        updated_at = NOW()
    WHERE email = NEW.email;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on whitelist updates
DROP TRIGGER IF EXISTS sync_user_on_whitelist_update ON whitelist;
CREATE TRIGGER sync_user_on_whitelist_update
    AFTER INSERT OR UPDATE ON whitelist
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_from_whitelist();

-- Display confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Auto-sync trigger created successfully';
    RAISE NOTICE '📝 Whitelist updates will now automatically sync to users table';
    RAISE NOTICE '🔄 This keeps leetcode usernames and other data in sync';
END $$;

-- Test the trigger (optional - uncomment to test)
-- UPDATE whitelist SET leetcode_username = leetcode_username WHERE email = '25mx125@psgtech.ac.in';
