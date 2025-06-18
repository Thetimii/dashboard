-- SUPER SIMPLE: Fire when status is 'live', let API handle everything
-- Run this in Supabase SQL Editor

-- 1. Drop existing triggers
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- 2. Simple website launch trigger - just fire when status is 'live'
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-website-launch';
    payload jsonb;
    http_response record;
BEGIN
    -- Fire whenever status is 'live' - let API handle all validation
    IF (NEW.status = 'live') THEN
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        RAISE LOG 'Website launch trigger: status is live for user %', NEW.user_id;
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Website launch API called: status=%, content=%', http_response.status, http_response.content;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Simple demo ready trigger - fire when all 3 URLs exist
CREATE OR REPLACE FUNCTION notify_demo_ready()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-demo-ready';
    payload jsonb;
    http_response record;
BEGIN
    -- Fire whenever all 3 demos exist - let API handle validation
    IF (NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
        NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
        NEW.option_3_url IS NOT NULL AND NEW.option_3_url != '') THEN
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        RAISE LOG 'Demo ready trigger: all demos filled for user %', NEW.user_id;
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Demo ready API called: status=%, content=%', http_response.status, http_response.content;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create triggers
CREATE TRIGGER demo_ready_notification_trigger
    AFTER UPDATE ON public.demo_links
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE TRIGGER demo_ready_notification_trigger_insert
    AFTER INSERT ON public.demo_links
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE TRIGGER website_launch_notification_trigger
    AFTER UPDATE ON public.project_status
    FOR EACH ROW EXECUTE FUNCTION notify_website_launch();

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated, service_role;

-- DONE! Super simple: status='live' → call API → API gets final_url → sends email
