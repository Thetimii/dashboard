-- TEST THE TRIGGERS PROPERLY
-- Run these queries ONE BY ONE in Supabase SQL Editor

-- 1. First, check current demo_links state
SELECT 
    user_id,
    option_1_url,
    option_2_url,
    option_3_url
FROM demo_links 
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 2. Test DEMO READY trigger by updating demo links
-- This should trigger the email if not all 3 were complete before
UPDATE demo_links 
SET 
    option_1_url = 'https://demo1-test-' || extract(epoch from now())::text,
    option_2_url = 'https://demo2-test-' || extract(epoch from now())::text,
    option_3_url = 'https://demo3-test-' || extract(epoch from now())::text
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 3. Check current project_status state  
SELECT 
    user_id,
    status,
    final_url
FROM project_status 
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 4. Test WEBSITE LAUNCH trigger by changing status to something else first, then to 'live'
UPDATE project_status 
SET status = 'pending'
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- Wait a moment, then set to live (this should trigger the email)
UPDATE project_status 
SET 
    status = 'live',
    final_url = 'https://live-site-' || extract(epoch from now())::text
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 5. Check trigger logs in Database > Logs or check your Vercel function logs
-- The triggers should have called your APIs and you should see emails sent!

-- 6. Verify triggers are active
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%notification%';
