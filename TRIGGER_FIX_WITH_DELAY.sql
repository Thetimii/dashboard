-- FIX: Add delay to database triggers to avoid race conditions
-- Run this in Supabase SQL Editor

-- 1. Update demo ready trigger with delay
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
        
        -- Add small delay to ensure transaction is committed
        PERFORM pg_sleep(1);
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        RAISE LOG 'Calling demo ready API for user: %', NEW.user_id;
        
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

-- 2. Update website launch trigger with delay
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
    api_url text := 'https://app.customerflows.ch/api/notify-website-launch';
    payload jsonb;
    http_response record;
BEGIN
    -- Only trigger when status changes TO 'live'
    IF (OLD.status IS DISTINCT FROM 'live') AND (NEW.status = 'live') THEN
        
        -- Add small delay to ensure transaction is committed
        PERFORM pg_sleep(1);
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        RAISE LOG 'Calling website launch API for user: %', NEW.user_id;
        
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
