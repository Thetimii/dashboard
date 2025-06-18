-- DEBUG: Check what status values actually exist vs what code expects
-- Run this in Supabase SQL Editor

-- 1. Show all possible status values in your database
SELECT DISTINCT status, COUNT(*) as count
FROM project_status 
WHERE status IS NOT NULL
GROUP BY status
ORDER BY count DESC;

-- 2. Show specific user's current status
SELECT 
    user_id,
    status,
    final_url,
    created_at,
    updated_at
FROM project_status 
WHERE user_id IN (
    SELECT user_id FROM project_status ORDER BY updated_at DESC LIMIT 5
)
ORDER BY updated_at DESC;

-- 3. Check if you're using 'complete' instead of 'live'
SELECT 
    user_id,
    status,
    final_url
FROM project_status 
WHERE status = 'complete';

-- 4. Check what the trigger should actually look for
-- If you use 'complete' instead of 'live', we need to update the trigger!
