-- SIMPLE TEST - Run this AFTER applying FIX_INSERT_TRIGGER.sql
-- This will test the INSERT trigger with verbose logging

-- =============================================================================
-- 1. FIRST, GET A REAL USER ID TO TEST WITH
-- =============================================================================

SELECT 'Step 1: Pick a user_id from this list:' AS instruction;

SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- =============================================================================
-- 2. TEST THE INSERT TRIGGER
-- =============================================================================

SELECT 'Step 2: Copy a user_id from above and replace YOUR_USER_ID_HERE below:' AS instruction;

-- ⚠️  REPLACE 'YOUR_USER_ID_HERE' WITH A REAL USER ID FROM ABOVE
-- Then uncomment and run the INSERT:

/*
INSERT INTO demo_links (user_id, option_1_url, option_2_url, option_3_url) 
VALUES ('YOUR_USER_ID_HERE', 'https://test1.example.com', 'https://test2.example.com', 'https://test3.example.com');
*/

-- =============================================================================
-- 3. CHECK WHAT HAPPENED
-- =============================================================================

SELECT 'Step 3: After running the INSERT above, check these:' AS instruction;

-- See if the record was created
SELECT 'Recent demo_links entries:' AS check1;
SELECT 
  user_id,
  option_1_url,
  option_2_url, 
  option_3_url,
  created_at
FROM demo_links 
ORDER BY created_at DESC 
LIMIT 3;

-- =============================================================================
-- 4. CHECK LOGS IN SUPABASE
-- =============================================================================

SELECT 'Step 4: Go to Supabase Dashboard → Database → Logs' AS log_check;
SELECT 'Look for these log messages:' AS log_messages;
SELECT '✅ "Demo trigger fired! Operation: INSERT"' AS expected_log1;
SELECT '✅ "All demos ready: true"' AS expected_log2;
SELECT '✅ "TRIGGER CONDITION MET! Sending notification"' AS expected_log3;
SELECT '✅ "Demo ready notification API call result: status=200"' AS expected_log4;

-- =============================================================================
-- 5. WHAT TO DO IF IT STILL DOESN'T WORK
-- =============================================================================

SELECT 'If you still see no logs or errors:' AS troubleshoot;
SELECT '1. Make sure you ran FIX_INSERT_TRIGGER.sql first' AS step1;
SELECT '2. Make sure HTTP extension is enabled' AS step2;
SELECT '3. Check if the user_id you used actually exists in auth.users' AS step3;
SELECT '4. Look for any error messages in Supabase logs' AS step4;
SELECT '5. Try the API endpoint directly: /api/test-demo-ready-email' AS step5;

-- Quick check if HTTP extension is enabled
SELECT 'HTTP Extension Check:' AS http_check;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') 
    THEN '✅ HTTP extension is enabled'
    ELSE '❌ HTTP extension is NOT enabled - run: CREATE EXTENSION IF NOT EXISTS http;'
  END AS http_status;
