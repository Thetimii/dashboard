-- WORKING TRIGGER FIX FOR YOUR SUPABASE DATABASE
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and run it

-- =============================================================================
-- 1. ENABLE HTTP EXTENSION (Required for API calls)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS http;

-- =============================================================================
-- 2. CREATE THE DEMO READY NOTIFICATION FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_demo_ready()
RETURNS TRIGGER AS $$
DECLARE
  api_url text;
  payload jsonb;
  result record;
  all_demos_ready boolean;
  were_demos_ready_before boolean;
BEGIN
  -- Add detailed logging for debugging
  RAISE LOG 'Demo trigger fired! Operation: %, User: %', TG_OP, NEW.user_id;
  
  -- Check if all 3 demo options are now filled (not null and not empty)
  all_demos_ready := (
    NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
    NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
    NEW.option_3_url IS NOT NULL AND NEW.option_3_url != ''
  );
  
  RAISE LOG 'All demos ready: %, URLs: [%], [%], [%]', 
    all_demos_ready, NEW.option_1_url, NEW.option_2_url, NEW.option_3_url;
  
  -- Check if demos were ready before (for UPDATE operations)
  were_demos_ready_before := CASE 
    WHEN TG_OP = 'INSERT' THEN false
    ELSE (
      OLD.option_1_url IS NOT NULL AND OLD.option_1_url != '' AND
      OLD.option_2_url IS NOT NULL AND OLD.option_2_url != '' AND
      OLD.option_3_url IS NOT NULL AND OLD.option_3_url != ''
    )
  END;
  
  RAISE LOG 'Were demos ready before: %, Operation: %', were_demos_ready_before, TG_OP;
  
  -- Only send notification if demos are ready now but weren't ready before
  IF all_demos_ready AND NOT were_demos_ready_before THEN
    
    RAISE LOG 'TRIGGER CONDITION MET! Sending notification for user: %', NEW.user_id;
    
    -- Build the API URL - using your correct domain
    api_url := 'https://app.customerflows.ch/api/notify-demo-ready';
    
    -- Build the payload
    payload := jsonb_build_object(
      'userId', NEW.user_id::text
    );
    
    RAISE LOG 'Making API call to: % with payload: %', api_url, payload;
    
    -- Make HTTP request to our API endpoint
    BEGIN
      SELECT INTO result
        content::json->'success' as success,
        status_code
      FROM http((
        'POST',
        api_url,
        ARRAY[
          http_header('Content-Type', 'application/json')
        ],
        'application/json',
        payload::text
      )::http_request);
      
      -- Log the result
      RAISE LOG 'Demo ready notification API call result: status=%, success=%', 
        result.status_code, result.success;
        
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE LOG 'Failed to call demo ready notification API: %', SQLERRM;
    END;
  ELSE
    RAISE LOG 'TRIGGER CONDITION NOT MET: all_demos_ready=%, were_demos_ready_before=%', 
      all_demos_ready, were_demos_ready_before;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. DROP EXISTING TRIGGERS (IF ANY)
-- =============================================================================

DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;

-- =============================================================================
-- 4. CREATE NEW TRIGGERS
-- =============================================================================

-- Create UPDATE trigger
CREATE TRIGGER demo_ready_notification_trigger
  AFTER UPDATE ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- Create INSERT trigger (this is what will fire for new entries)
CREATE TRIGGER demo_ready_notification_trigger_insert
  AFTER INSERT ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- =============================================================================
-- 5. GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated, service_role;

-- =============================================================================
-- 6. VERIFICATION
-- =============================================================================

-- Check that triggers were created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%demo%';

-- =============================================================================
-- 7. TEST THE TRIGGERS
-- =============================================================================

-- Test with your existing user (replace with real user_id if different)
-- This should trigger the INSERT trigger and send an email

-- UNCOMMENT THE LINES BELOW TO TEST:
/*
INSERT INTO demo_links (user_id, option_1_url, option_2_url, option_3_url) 
VALUES ('d5b3cedb-ca44-42a1-8ff7-ff6e3251b25f', 'https://demo1.test', 'https://demo2.test', 'https://demo3.test');
*/

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ TRIGGERS SUCCESSFULLY CREATED!';
    RAISE NOTICE '🎯 To test: uncomment the INSERT statement above and run it';
    RAISE NOTICE '📋 Check Database → Logs for trigger execution messages';
    RAISE NOTICE '🔍 Look for: "Demo trigger fired! Operation: INSERT"';
END 
$$;
