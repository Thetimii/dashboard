-- EMERGENCY DEBUG: Find real demo links data
-- Run this in Supabase SQL Editor to see what's actually in your database

-- 1. CHECK IF THE USER EXISTS AT ALL
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data->>'full_name' as name
FROM auth.users 
WHERE id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 2. FIND ALL USERS WITH DEMO LINKS (LATEST 10)
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as name,
    dl.option_1_url,
    dl.option_2_url,
    dl.option_3_url,
    dl.created_at,
    dl.updated_at,
    CASE 
        WHEN dl.option_1_url IS NOT NULL AND dl.option_1_url != '' AND
             dl.option_2_url IS NOT NULL AND dl.option_2_url != '' AND
             dl.option_3_url IS NOT NULL AND dl.option_3_url != ''
        THEN '✅ ALL 3 DEMOS READY'
        ELSE '❌ Missing demos'
    END as status
FROM auth.users u
LEFT JOIN demo_links dl ON u.id = dl.user_id
WHERE dl.user_id IS NOT NULL
ORDER BY dl.updated_at DESC NULLS LAST
LIMIT 10;

-- 3. CHECK IF DEMO_LINKS TABLE EXISTS AND HAS DATA
SELECT COUNT(*) as total_demo_records FROM demo_links;

-- 4. SHOW ALL DEMO LINKS DATA (IF NOT TOO MANY RECORDS)
SELECT 
    user_id,
    option_1_url,
    option_2_url,
    option_3_url,
    created_at,
    updated_at
FROM demo_links
ORDER BY updated_at DESC
LIMIT 20;

-- 5. FIND USERS WITH COMPLETE DEMO SETS
SELECT 
    dl.user_id,
    u.email,
    u.raw_user_meta_data->>'full_name' as name,
    dl.option_1_url,
    dl.option_2_url,
    dl.option_3_url
FROM demo_links dl
JOIN auth.users u ON dl.user_id = u.id
WHERE dl.option_1_url IS NOT NULL AND dl.option_1_url != ''
  AND dl.option_2_url IS NOT NULL AND dl.option_2_url != ''
  AND dl.option_3_url IS NOT NULL AND dl.option_3_url != '';

-- 6. SHOW PROJECT STATUS DATA
SELECT 
    ps.user_id,
    u.email,
    u.raw_user_meta_data->>'full_name' as name,
    ps.status,
    ps.website_url,
    ps.created_at,
    ps.updated_at
FROM project_status ps
JOIN auth.users u ON ps.user_id = u.id
ORDER BY ps.updated_at DESC
LIMIT 10;

-- COPY A REAL USER ID FROM ABOVE RESULTS AND TEST WITH:
/*
curl -X POST https://app.customerflows.ch/api/notify-demo-ready \
  -H "Content-Type: application/json" \
  -d '{"userId": "PASTE_REAL_USER_ID_HERE"}'
*/
