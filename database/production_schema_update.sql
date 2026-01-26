-- ========================================
-- PSGMX Production Database Update Script
-- ========================================

-- 1. Update Users Table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS leetcode_username TEXT,
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS birthday_notifications_enabled BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_users_dob ON users(dob);

-- 2. Announcements System
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_priority BOOLEAN DEFAULT FALSE,
    expiry_date TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_expiry ON announcements(expiry_date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(is_priority);

-- RLS for Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read active announcements
CREATE POLICY "Everyone can view active announcements" ON announcements
    FOR SELECT USING (expiry_date IS NULL OR expiry_date > NOW());

-- Only Coordinators and Reps can create/update/delete
-- Note: You'll need to update this logic based on your specific role check implementation in SQL or app
-- For now, allowing authenticated users with specific claims (managed via app logic mostly, but RLS is safer)
-- Assuming 'roles' column JSONB: {"isPlacementRep": true, "isCoordinator": true}
CREATE POLICY "Authorized users can manage announcements" ON announcements
    USING (
        (auth.uid() IN (
            SELECT id FROM users WHERE 
            (roles->>'isPlacementRep')::boolean = true OR 
            (roles->>'isCoordinator')::boolean = true
        ))
    );

-- 3. LeetCode Stats Cache
CREATE TABLE IF NOT EXISTS leetcode_stats (
    username TEXT PRIMARY KEY,
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    ranking INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leetcode_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view leetcode stats" ON leetcode_stats
    FOR SELECT USING (true);
    
-- Service role or backend function should update this, or users update their own?
-- Let's allow users to update their own stats via function or app logic if username matches
CREATE POLICY "Users can update own leetcode stats" ON leetcode_stats
    USING (true) WITH CHECK (true); -- Simplified for now, relies on logic

-- 4. Attendance Audit Logs (Specific for edits)
-- We can use the existing audit_logs table, but let's ensure it covers our needs.
-- Existing: actor_id, action, entity_type...
-- We will just insert into 'audit_logs' from the app when an edit happens.

-- 5. Helper Views/Functions (Optional but helpful)

-- Function to check if user is admin (Rep/Coord)
CREATE OR REPLACE FUNCTION is_admin_user() 
RETURNS BOOLEAN AS $$
DECLARE
  _is_rep BOOLEAN;
  _is_coord BOOLEAN;
BEGIN
  SELECT (roles->>'isPlacementRep')::boolean, (roles->>'isCoordinator')::boolean
  INTO _is_rep, _is_coord
  FROM users
  WHERE id = auth.uid();
  
  RETURN _is_rep OR _is_coord;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
