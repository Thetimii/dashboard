-- SUPABASE DEBUGGING SCRIPT
-- Run these queries ONE BY ONE in Supabase SQL Editor to diagnose the issue

-- 1. CHECK IF HTTP EXTENSION IS ENABLED
SELECT * FROM pg_extension WHERE extname = 'http';
-- Expected: Should return a row with 'http' extension

-- 2. CHECK IF TRIGGERS EXIST
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
-- Expected: Should show demo_ready_notification_trigger and website_launch_notification_trigger

-- 3. CHECK IF FUNCTIONS EXIST
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('notify_demo_ready', 'notify_website_launch');
-- Expected: Should show both functions

-- 4. CHECK CURRENT DATA STATE
SELECT user_id, option_1_url, option_2_url, option_3_url, approved_option 
FROM demo_links;
-- This shows current demo data

SELECT user_id, status, updated_at 
FROM project_status;
-- This shows current project status data

-- 5. CHECK IF TABLES HAVE CORRECT STRUCTURE
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'project_status' AND table_schema = 'public'
ORDER BY ordinal_position;
-- Check if 'status' column exists and has correct type

-- 6. TEST TRIGGER MANUALLY (REPLACE 'your-user-id' WITH REAL USER ID)
-- First get a real user_id:
SELECT id, email FROM auth.users LIMIT 1;

-- Then test demo trigger (replace user-id):
-- INSERT INTO demo_links (user_id, option_1_url, option_2_url, option_3_url) 
-- VALUES ('YOUR-REAL-USER-ID', 'https://demo1.test.com', 'https://demo2.test.com', 'https://demo3.test.com');

-- Test website launch trigger (replace user-id):
-- UPDATE project_status SET status = 'live' WHERE user_id = 'YOUR-REAL-USER-ID';

-- 7. CHECK SUPABASE LOGS
-- Go to Supabase Dashboard > Logs > Database
-- Look for entries like: "Demo ready notification: status=%, success=%"
