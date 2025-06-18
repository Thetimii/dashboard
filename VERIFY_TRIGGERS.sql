-- VERIFY DATABASE TRIGGERS ARE WORKING
-- Run this AFTER applying FINAL_SETUP.sql

-- 1. Check that triggers were created successfully
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%notification%'
ORDER BY trigger_name;

-- 2. Check that functions were created successfully  
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'notify_%';

-- 3. Test the demo ready trigger (REPLACE USER_ID with real user)
-- This should send an email to the customer
UPDATE demo_links 
SET option_1_url = 'https://demo1-test.com', 
    option_2_url = 'https://demo2-test.com', 
    option_3_url = 'https://demo3-test.com'
WHERE user_id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 4. Test the website launch trigger (REPLACE USER_ID with real user)  
-- This should send an email to the customer
UPDATE project_status 
SET status = 'live'
WHERE user_id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 5. Check Supabase logs after running the above
-- Go to: Database → Logs → Look for HTTP requests to your API endpoints
-- You should see successful 200 responses

-- Expected results:
-- - Customer receives "demos ready" email when step 3 runs
-- - Customer receives "website launch" email when step 4 runs  
-- - Both emails go to customer email address (not admin)
-- - Logs show successful API calls with 200 status codes
