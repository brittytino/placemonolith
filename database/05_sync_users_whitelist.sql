-- ========================================
-- PSG TECHNOLOGY PLACEMENT MANAGEMENT SYSTEM
-- DATABASE FIX: Sync Users with Whitelist
-- FILE 5: Sync leetcode_username from whitelist to users
-- ========================================
-- Run this file in Supabase SQL Editor to fix missing leetcode usernames
-- ========================================

-- Update users table with leetcode_username from whitelist where missing
UPDATE users u
SET leetcode_username = w.leetcode_username,
    updated_at = NOW()
FROM whitelist w
WHERE u.email = w.email
  AND w.leetcode_username IS NOT NULL
  AND w.leetcode_username != ''
  AND w.leetcode_username != 'NULL'
  AND (u.leetcode_username IS NULL OR u.leetcode_username = '' OR u.leetcode_username = 'NULL');

-- Display results
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Successfully synced % user(s) with leetcode usernames from whitelist', updated_count;
    RAISE NOTICE '📝 All users now have their leetcode usernames if available in whitelist';
    RAISE NOTICE '🔄 Run this query anytime to sync new users or fix missing usernames';
END $$;

-- Verify the sync
SELECT 
    u.email,
    u.name,
    u.leetcode_username as user_leetcode,
    w.leetcode_username as whitelist_leetcode,
    CASE 
        WHEN u.leetcode_username = w.leetcode_username THEN '✅ Synced'
        WHEN u.leetcode_username IS NULL AND w.leetcode_username IS NULL THEN '⚪ No Username'
        ELSE '⚠️ Mismatch'
    END as status
FROM users u
LEFT JOIN whitelist w ON u.email = w.email
ORDER BY u.name;
