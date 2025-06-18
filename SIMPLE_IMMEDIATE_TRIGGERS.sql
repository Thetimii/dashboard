-- SIMPLE FIX: Check URL in trigger, fire immediately
-- Run this in Supabase SQL Editor

-- 1. Drop existing triggers
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- 2. Create simple immediate triggers that check conditions in the trigger itself

-- Demo ready trigger - fires immediately when all 3 URLs are filled
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
        
        RAISE LOG 'Demo ready trigger firing for user: %', NEW.user_id;
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Demo ready API response: status=%, content=%', http_response.status, http_response.content;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Website launch trigger - check URL exists in trigger, fire immediately
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-website-launch';
    payload jsonb;
    http_response record;
BEGIN
    -- Only trigger when status changes TO 'live' AND final_url exists
    IF (OLD.status IS DISTINCT FROM 'live') AND (NEW.status = 'live') AND 
       (NEW.final_url IS NOT NULL AND NEW.final_url != '') THEN
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        RAISE LOG 'Website launch trigger firing for user: %, url: %', NEW.user_id, NEW.final_url;
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Website launch API response: status=%, content=%', http_response.status, http_response.content;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create immediate triggers (no deferral)
CREATE TRIGGER demo_ready_notification_trigger
    AFTER UPDATE ON public.demo_links
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE TRIGGER demo_ready_notification_trigger_insert
    AFTER INSERT ON public.demo_links
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE TRIGGER website_launch_notification_trigger
    AFTER UPDATE ON public.project_status
    FOR EACH ROW EXECUTE FUNCTION notify_website_launch();

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated, service_role;

-- Done! Now when you set status='live' with a final_url, it will fire immediately and work!
