-- FINAL FIX: Fire trigger whenever status IS 'live' with URL, not just when it CHANGES to live
-- Run this in Supabase SQL Editor

-- 1. Drop existing triggers
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- 2. Website launch trigger - fire WHENEVER status is 'live' with URL (ignore old state)
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-website-launch';
    payload jsonb;
    http_response record;
BEGIN
    -- Fire whenever NEW status is 'live' AND final_url exists (ignore OLD state)
    IF (NEW.status = 'live') AND (NEW.final_url IS NOT NULL AND NEW.final_url != '') THEN
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        RAISE LOG 'Website launch trigger firing for user: %, status: %, url: %', NEW.user_id, NEW.status, NEW.final_url;
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Website launch API response: status=%, content=%', http_response.status, http_response.content;
    ELSE
        RAISE LOG 'Website launch trigger NOT firing - status: %, has_url: %', NEW.status, (NEW.final_url IS NOT NULL AND NEW.final_url != '');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Demo ready trigger - fire whenever all 3 URLs exist (ignore old state) 
CREATE OR REPLACE FUNCTION notify_demo_ready()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-demo-ready';
    payload jsonb;
    http_response record;
BEGIN
    -- Fire whenever all 3 demos are filled (ignore OLD state completely)
    IF (NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
        NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
        NEW.option_3_url IS NOT NULL AND NEW.option_3_url != '') THEN
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        RAISE LOG 'Demo ready trigger firing for user: %, all demos filled', NEW.user_id;
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Demo ready API response: status=%, content=%', http_response.status, http_response.content;
    ELSE
        RAISE LOG 'Demo ready trigger NOT firing - demos filled: %', 
            (NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
             NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
             NEW.option_3_url IS NOT NULL AND NEW.option_3_url != '');
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

-- NOW: Every time you update and set status='live' with a URL, it will fire!
-- No matter what the previous state was!
