-- DEBUG TRIGGERS - Find out why your INSERT trigger didn't fire
-- Run this in Supabase SQL Editor to diagnose the issue

-- =============================================================================
-- 1. CHECK IF TRIGGERS EXIST
-- =============================================================================

SELECT '🔍 CHECKING TRIGGERS...' AS status;

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%demo%'
ORDER BY trigger_name;

-- =============================================================================
-- 2. CHECK IF FUNCTION EXISTS
-- =============================================================================

SELECT '🔍 CHECKING FUNCTIONS...' AS status;

SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'notify_demo_ready';

-- =============================================================================
-- 3. CHECK HTTP EXTENSION
-- =============================================================================

SELECT '🔍 CHECKING HTTP EXTENSION...' AS status;

SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension 
WHERE extname = 'http';

-- =============================================================================
-- 4. CHECK YOUR RECENT DEMO_LINKS DATA
-- =============================================================================

SELECT '🔍 CHECKING RECENT DEMO_LINKS DATA...' AS status;

SELECT 
  id,
  user_id,
  option_1_url,
  option_2_url,
  option_3_url,
  created_at
FROM demo_links 
ORDER BY created_at DESC 
LIMIT 5;

-- =============================================================================
-- 5. CHECK SUPABASE LOGS QUERY
-- =============================================================================

SELECT '📋 TO CHECK LOGS:' AS instruction;
SELECT 'Go to Supabase Dashboard → Logs → Search for: "Demo ready notification"' AS log_check;

-- =============================================================================
-- 6. TEST TRIGGER MANUALLY
-- =============================================================================

SELECT '🧪 MANUAL TRIGGER TEST:' AS test_info;
SELECT 'Copy a user_id from above and run this test:' AS instruction;

-- REPLACE 'YOUR_USER_ID_HERE' with actual user_id from the query above
/*
-- Test INSERT trigger (uncomment and replace user_id):
INSERT INTO demo_links (user_id, option_1_url, option_2_url, option_3_url) 
VALUES ('YOUR_USER_ID_HERE', 'https://test1.com', 'https://test2.com', 'https://test3.com');

-- Check logs immediately after running above INSERT
*/

-- =============================================================================
-- 7. DIAGNOSTIC SUMMARY
-- =============================================================================

SELECT '📊 DIAGNOSTIC CHECKLIST:' AS summary;
SELECT '1. ✅ Triggers exist (check above results)' AS check1;
SELECT '2. ✅ Function exists (check above results)' AS check2;
SELECT '3. ✅ HTTP extension enabled (check above results)' AS check3;
SELECT '4. ✅ Data inserted correctly (check above results)' AS check4;
SELECT '5. ❓ Check Supabase logs for trigger execution' AS check5;

-- =============================================================================
-- EXPECTED RESULTS:
-- =============================================================================
/*
IF WORKING CORRECTLY, YOU SHOULD SEE:

1. TRIGGERS: 
   - demo_ready_notification_trigger (UPDATE)
   - demo_ready_notification_trigger_insert (INSERT)

2. FUNCTION:
   - notify_demo_ready (function, trigger)

3. HTTP EXTENSION:
   - http (version 1.5 or similar)

4. IN LOGS (after INSERT):
   - "Demo ready notification API call result: status=200, success=true"
   
IF ANY OF THESE ARE MISSING, THAT'S YOUR PROBLEM!
*/
