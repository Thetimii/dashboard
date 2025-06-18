-- FINAL FIX: Use DEFERRED triggers to wait for transaction commit
-- Run this in Supabase SQL Editor to fix the timing issue

-- 1. Drop existing triggers
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- 2. Create DEFERRED triggers that wait for transaction commit
CREATE CONSTRAINT TRIGGER demo_ready_notification_trigger
    AFTER UPDATE ON public.demo_links
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE CONSTRAINT TRIGGER demo_ready_notification_trigger_insert
    AFTER INSERT ON public.demo_links
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE CONSTRAINT TRIGGER website_launch_notification_trigger
    AFTER UPDATE ON public.project_status
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION notify_website_launch();

-- 3. Alternative: Use pg_notify approach (more reliable)
-- Drop constraint triggers if they don't work
-- DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
-- DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
-- DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- Create simple notification triggers instead
-- CREATE OR REPLACE FUNCTION notify_demo_ready_simple()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     IF (NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
--         NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
--         NEW.option_3_url IS NOT NULL AND NEW.option_3_url != '') AND
--        (OLD IS NULL OR 
--         OLD.option_1_url IS NULL OR OLD.option_1_url = '' OR
--         OLD.option_2_url IS NULL OR OLD.option_2_url = '' OR
--         OLD.option_3_url IS NULL OR OLD.option_3_url = '') THEN
--         
--         PERFORM pg_notify('demo_ready', NEW.user_id::text);
--     END IF;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER demo_ready_notification_trigger
--     AFTER UPDATE ON public.demo_links
--     FOR EACH ROW EXECUTE FUNCTION notify_demo_ready_simple();

-- Note: DEFERRED triggers should fix the timing issue.
-- If they don't work, uncomment the pg_notify approach above.
