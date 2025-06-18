-- DEBUG SCRIPT - Run these queries ONE BY ONE in Supabase

-- 1. Check if triggers exist
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 2. Check if HTTP extension is enabled
SELECT * FROM pg_extension WHERE extname = 'http';

-- 3. Check current user data
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 4. Check current demo_links data
SELECT * FROM demo_links WHERE user_id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 5. Check current project_status data  
SELECT * FROM project_status WHERE user_id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 6. Test trigger manually (this should send email if everything works)
UPDATE demo_links SET 
  option_1_url = 'https://demo1-' || now()::text,
  option_2_url = 'https://demo2-' || now()::text,
  option_3_url = 'https://demo3-' || now()::text
WHERE user_id = 'a73df070-dcfd-4e11-a921-1bac2d7bd274';

-- 7. If demo_links doesn't exist, create it first
INSERT INTO demo_links (user_id, option_1_url, option_2_url, option_3_url) 
VALUES ('a73df070-dcfd-4e11-a921-1bac2d7bd274', 
        'https://demo1-' || now()::text, 
        'https://demo2-' || now()::text, 
        'https://demo3-' || now()::text)
ON CONFLICT (user_id) DO UPDATE SET
  option_1_url = EXCLUDED.option_1_url,
  option_2_url = EXCLUDED.option_2_url,
  option_3_url = EXCLUDED.option_3_url;
