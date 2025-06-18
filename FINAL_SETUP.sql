-- FINAL DATABASE SETUP - PASTE THIS INTO SUPABASE SQL EDITOR
-- This is the ONLY file you need

-- 1. Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS http;

-- 2. Create trigger function for demo ready
CREATE OR REPLACE FUNCTION notify_demo_ready()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-demo-ready';
    payload jsonb;
    http_response record;
BEGIN
    -- Only trigger when all 3 demos become ready for the first time
    IF (NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
        NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
        NEW.option_3_url IS NOT NULL AND NEW.option_3_url != '') AND
       (OLD IS NULL OR 
        OLD.option_1_url IS NULL OR OLD.option_1_url = '' OR
        OLD.option_2_url IS NULL OR OLD.option_2_url = '' OR
        OLD.option_3_url IS NULL OR OLD.option_3_url = '') THEN
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Demo ready API call: status=%, content=%', http_response.status, http_response.content;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger function for website launch
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-website-launch';
    payload jsonb;
    http_response record;
BEGIN
    -- Only trigger when status changes TO 'live'
    IF (OLD.status IS DISTINCT FROM 'live') AND (NEW.status = 'live') THEN
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Website launch API call: status=%, content=%', http_response.status, http_response.content;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop existing triggers
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- 5. Create new triggers
CREATE TRIGGER demo_ready_notification_trigger
    AFTER UPDATE ON public.demo_links
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE TRIGGER demo_ready_notification_trigger_insert
    AFTER INSERT ON public.demo_links
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE TRIGGER website_launch_notification_trigger
    AFTER UPDATE ON public.project_status
    FOR EACH ROW EXECUTE FUNCTION notify_website_launch();

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated, service_role;

-- DONE! Test with these queries:
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
-- UPDATE demo_links SET option_3_url = 'test' WHERE user_id = 'your-user-id';
-- UPDATE project_status SET status = 'live' WHERE user_id = 'your-user-id';
