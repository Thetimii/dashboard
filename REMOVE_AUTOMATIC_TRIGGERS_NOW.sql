-- URGENT: Remove Automatic Email Triggers
-- Run this script FIRST in your Supabase SQL Editor to stop automatic emails

-- =============================================================================
-- 1. REMOVE ALL AUTOMATIC EMAIL TRIGGERS
-- =============================================================================

-- Drop all automatic demo ready triggers
DROP TRIGGER IF EXISTS demo_ready_notification ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;

-- Drop all automatic website launch triggers
DROP TRIGGER IF EXISTS website_launch_notification ON public.project_status;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- Drop the trigger functions as well
DROP FUNCTION IF EXISTS notify_demo_ready();
DROP FUNCTION IF EXISTS notify_website_launch();

-- Verify triggers are removed
SELECT 
    trigger_name, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%demo%' OR trigger_name LIKE '%launch%';

SELECT 'All automatic email triggers have been removed!' as status;
