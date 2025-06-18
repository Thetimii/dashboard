-- FIX: Use 'complete' instead of 'live' status
-- Run this in Supabase SQL Editor

-- 1. Update website launch trigger to look for 'complete' status
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-website-launch';
    payload jsonb;
    http_response record;
BEGIN
    -- Fire whenever status is 'complete' (not 'live')
    IF (NEW.status = 'complete') THEN
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        RAISE LOG 'Website launch trigger: status is complete for user %', NEW.user_id;
        
        SELECT INTO http_response *
        FROM http((
            'POST',
            api_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            payload::text
        )::http_request);
        
        RAISE LOG 'Website launch API called: status=%, content=%', http_response.status, http_response.content;
    ELSE
        RAISE LOG 'Website launch trigger NOT firing - status is: %', NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
