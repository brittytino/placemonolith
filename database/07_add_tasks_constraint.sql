-- ========================================
-- PSG TECHNOLOGY PLACEMENT MANAGEMENT SYSTEM
-- DATABASE FIX: Add Unique Constraint for Tasks
-- FILE 7: Add constraint to daily_tasks table
-- ========================================
-- Run this file to fix "ON CONFLICT" error in Bulk Upload
-- ========================================

-- 1. Clean up duplicate rows if they exist (keep the latest one)
-- This is complex, so we'll just try to add the constraint. 
-- If it fails due to duplicates, you might need to manually truncate or clean table.
-- TRUNCATE daily_tasks; -- WARNING: This deletes all tasks

-- 2. Add Unique Constraint
-- The Bulk Upload uses: onConflict: 'date, topic_type, title'
-- So we must have a UNIQUE constraint on these 3 columns.

DO $$
BEGIN
    -- Drop constraint if it exists to avoid errors on rerun
    ALTER TABLE daily_tasks DROP CONSTRAINT IF EXISTS daily_tasks_upsert_key;
    
    -- Add the constraint
    ALTER TABLE daily_tasks 
    ADD CONSTRAINT daily_tasks_upsert_key UNIQUE (date, topic_type, title);
    
    RAISE NOTICE '✅ Successfully added UNIQUE constraint to daily_tasks';
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE '⚠️ Constraint might already exist';
    WHEN unique_violation THEN
        RAISE NOTICE '❌ Could not add constraint: Duplicate data exists. Please clean daily_tasks table first.';
END $$;
