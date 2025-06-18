-- FIND REAL USER IDS FOR TESTING
-- Run these queries in Supabase SQL Editor to get real user data for testing

-- 1. Find users with demo links (good for testing demo ready emails)
SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data->>'full_name' as name,
    dl.option_1_url,
    dl.option_2_url,
    dl.option_3_url,
    CASE 
        WHEN dl.option_1_url IS NOT NULL AND dl.option_2_url IS NOT NULL AND dl.option_3_url IS NOT NULL 
        THEN 'All demos ready - WILL TRIGGER EMAIL'
        ELSE 'Demos incomplete - good for testing'
    END as demo_status
FROM auth.users u
LEFT JOIN demo_links dl ON u.id = dl.user_id
WHERE u.email IS NOT NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 2. Find users with project status (good for testing website launch emails)
SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data->>'full_name' as name,
    ps.status,
    ps.website_url,
    CASE 
        WHEN ps.status = 'live' THEN 'Already live - will not trigger'
        ELSE 'Not live yet - good for testing'
    END as launch_status
FROM auth.users u
LEFT JOIN project_status ps ON u.id = ps.user_id
WHERE u.email IS NOT NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. Find users with kickoff forms (shows business names)
SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data->>'full_name' as name,
    kf.business_name,
    kf.created_at as kickoff_completed
FROM auth.users u
LEFT JOIN kickoff_forms kf ON u.id = kf.user_id
WHERE u.email IS NOT NULL AND kf.business_name IS NOT NULL
ORDER BY kf.created_at DESC
LIMIT 10;

-- 4. TESTING COMMANDS (replace USER_ID with actual ID from above)
-- Copy a user_id from the results above, then use these:

/*
-- Test demo ready email:
curl -X POST https://app.customerflows.ch/api/notify-demo-ready \
  -H "Content-Type: application/json" \
  -d '{"userId": "PASTE_USER_ID_HERE"}'

-- Test website launch email:
curl -X POST https://app.customerflows.ch/api/notify-website-launch \
  -H "Content-Type: application/json" \
  -d '{"userId": "PASTE_USER_ID_HERE"}'

-- Test database trigger for demo ready:
UPDATE demo_links 
SET option_1_url = 'https://demo1.test', 
    option_2_url = 'https://demo2.test', 
    option_3_url = 'https://demo3.test'
WHERE user_id = 'PASTE_USER_ID_HERE';

-- Test database trigger for website launch:
UPDATE project_status 
SET status = 'live'
WHERE user_id = 'PASTE_USER_ID_HERE';
*/
