-- EMERGENCY: Check if triggers are actually installed
-- Run this in Supabase SQL Editor

-- 1. Check if HTTP extension is enabled
SELECT * FROM pg_extension WHERE extname = 'http';

-- 2. Check if trigger functions exist
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('notify_demo_ready', 'notify_website_launch');

-- 3. Check if triggers are actually created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%notification%';

-- 4. Test the trigger function directly (this should work)
SELECT notify_demo_ready();

-- 5. MANUAL TRIGGER TEST - This will fire the trigger
-- (Replace with your actual user ID)
UPDATE demo_links 
SET option_1_url = 'https://demo1-' || extract(epoch from now())::text
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 6. MANUAL WEBSITE LAUNCH TRIGGER TEST
UPDATE project_status 
SET status = 'live', 
    final_url = 'https://test-' || extract(epoch from now())::text
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- If triggers aren't found, you need to run FINAL_SETUP.sql first!
