-- DEBUG SPECIFIC USER DATA
-- Run this in Supabase SQL Editor to see what data exists for the failing user

-- User ID that was failing: a73df070-dcfd-4e11-a921-1bac2d7bd274

-- 1. Check if user exists in auth.users
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as name,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 2. Check demo_links table
SELECT 
    user_id,
    option_1_url,
    option_2_url,
    option_3_url,
    created_at,
    updated_at
FROM demo_links 
WHERE user_id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 3. Check project_status table
SELECT 
    user_id,
    status,
    final_url,
    website_url,
    created_at,
    updated_at
FROM project_status 
WHERE user_id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 4. Check kickoff_forms table
SELECT 
    user_id,
    business_name,
    business_description,
    created_at
FROM kickoff_forms 
WHERE user_id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 5. Check if there are ANY demo_links records
SELECT COUNT(*) as total_demo_links FROM demo_links;

-- 6. Check if there are ANY project_status records
SELECT COUNT(*) as total_project_status FROM project_status;

-- 7. Show sample data from both tables
SELECT 'demo_links' as table_name, user_id, 'has_data' as info FROM demo_links LIMIT 3
UNION ALL
SELECT 'project_status' as table_name, user_id, status as info FROM project_status LIMIT 3;
