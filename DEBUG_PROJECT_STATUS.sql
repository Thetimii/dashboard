-- DEBUG: Check project_status for specific user
-- Run this in Supabase SQL Editor to see what's wrong

-- 1. Check if project_status record exists for this user
SELECT 
    user_id,
    status,
    final_url,
    website_url,
    created_at,
    updated_at
FROM project_status 
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 2. Check if user exists
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as name
FROM auth.users 
WHERE id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 3. Check demo_links for this user
SELECT 
    user_id,
    option_1_url,
    option_2_url,
    option_3_url,
    created_at,
    updated_at
FROM demo_links 
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 4. Check kickoff_forms for business name
SELECT 
    user_id,
    business_name,
    created_at
FROM kickoff_forms 
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 5. Show all possible status values in project_status table
SELECT DISTINCT status FROM project_status WHERE status IS NOT NULL;

-- 6. SOLUTION: If project_status doesn't exist or status != 'live', create/update it:
/*
-- If no record exists, insert one:
INSERT INTO project_status (user_id, status, final_url, website_url)
VALUES ('a23cd6e7-ef58-48fa-802b-24371b27f328', 'live', 'https://example.com', 'https://example.com')
ON CONFLICT (user_id) DO UPDATE SET
    status = 'live',
    final_url = 'https://example.com',
    website_url = 'https://example.com',
    updated_at = NOW();

-- Or if record exists but status is wrong, update it:
UPDATE project_status 
SET status = 'live', 
    final_url = 'https://example.com',
    website_url = 'https://example.com'
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';
*/
