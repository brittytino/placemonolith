# Database Setup Guide

## 📁 Files Overview

This folder contains **2 SQL files** that set up the complete database for PSGMX Flutter App:

1. **`01_create_schema.sql`** - Database schema (tables, functions, policies, indexes)
2. **`02_insert_data.sql`** - Student data (123 users with LeetCode usernames)

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Create Schema
Open **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste **`01_create_schema.sql`**, then click **Run**

This creates:
- ✅ 9 Tables (users, whitelist, leetcode_stats, attendance, etc.)
- ✅ 6 Helper Functions (has_role, is_working_day, etc.)
- ✅ 40+ RLS Policies (security rules)
- ✅ 30+ Indexes (performance optimization)
- ✅ 4 Triggers (auto-update timestamps)
- ✅ 2 Views (attendance analytics)

**Expected Output:**
```
✅ SCHEMA CREATION COMPLETE!
Next Step: Run file: 02_insert_data.sql
```

---

### Step 2: Insert Data
In the same **SQL Editor**, create **New Query**

Copy and paste **`02_insert_data.sql`**, then click **Run**

This inserts:
- ✅ 123 students into `whitelist` table
- ✅ Syncs data to `users` table
- ✅ LeetCode usernames for all students
- ✅ Date of birth, batch, team assignments

**Expected Output:**
```
✅ DATA INSERTION COMPLETE!
Whitelist entries: 123
Users with LeetCode usernames: 122
```

---

## ✨ Done!

Your database is now fully set up with:
- Complete schema with RLS security
- 123 students ready for LeetCode tracking
- Attendance system configured
- All permissions and policies active

**Next:** Restart your Flutter app to see everything in action!

---

## 📊 What's Included

### Tables Created:
1. **users** - Student/staff profiles with roles
2. **whitelist** - Approved registration emails
3. **leetcode_stats** - LeetCode performance tracking
4. **attendance** - Daily attendance records
5. **attendance_days** - Working day configuration
6. **daily_tasks** - LeetCode and core subject tasks
7. **notifications** - App announcements
8. **notification_reads** - Read/dismissed tracking
9. **audit_logs** - System activity logging

### Key Features:
- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (Student, Team Leader, Coordinator, Placement Rep)
- **Automatic timestamp updates** on record modifications
- **Optimized indexes** for fast queries
- **Attendance analytics views** for reporting
- **LeetCode integration** with weekly/overall leaderboards

---

## 🔍 Verification

Check if everything worked:

```sql
-- Count total students
SELECT COUNT(*) FROM users WHERE (roles->>'isStudent')::BOOLEAN = TRUE;

-- Count students with LeetCode usernames
SELECT COUNT(*) FROM users WHERE leetcode_username IS NOT NULL;

-- View whitelist entries
SELECT email, name, leetcode_username FROM whitelist LIMIT 10;

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 🛠️ Troubleshooting

### Issue: "relation already exists"
**Solution:** Tables already created. Skip Step 1, go to Step 2.

### Issue: "duplicate key value violates unique constraint"
**Solution:** Data already inserted. Check with:
```sql
SELECT COUNT(*) FROM whitelist;
```

### Issue: RLS policy errors
**Solution:** Re-run Step 1 to recreate all policies.

---

## 📞 Need Help?

1. Check Supabase SQL Editor for error messages
2. Verify you have admin access to Supabase project
3. Ensure both files are run in correct order (01 then 02)

---

**Last Updated:** January 2026  
**Status:** ✅ Production Ready
