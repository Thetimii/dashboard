-- Verification queries to check if the database setup was successful
-- Run these in your Supabase SQL Editor to verify everything is working

-- 1. Check if enum types were created
SELECT typname, typtype FROM pg_type WHERE typname LIKE '%_enum' ORDER BY typname;

-- 2. Test the helper functions
SELECT 'Project Status Values:' as test, get_project_status_values() as values
UNION ALL
SELECT 'Payment Status Values:' as test, get_payment_status_values() as values;

-- 3. Check if tables exist and their column types
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('project_status', 'payments')
    AND column_name = 'status'
ORDER BY table_name, column_name;

-- 4. Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%notification%'
ORDER BY event_object_table, trigger_name;

-- 5. Check RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Verify configuration is set
SELECT name, setting FROM pg_settings WHERE name = 'app.base_url';
