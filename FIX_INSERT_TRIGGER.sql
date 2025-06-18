-- COMPREHENSIVE TRIGGER FIX - Run this if DEBUG_TRIGGERS.sql shows issues
-- This fixes the most common problems that prevent triggers from firing

-- =============================================================================
-- 1. ENABLE HTTP EXTENSION (Required for API calls)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS http;

-- =============================================================================
-- 2. RECREATE THE TRIGGER FUNCTION WITH BETTER LOGGING
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
    
    -- Build the API URL - Use your correct production URL
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
-- 3. DROP AND RECREATE TRIGGERS
-- =============================================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;

-- Create UPDATE trigger
CREATE TRIGGER demo_ready_notification_trigger
  AFTER UPDATE ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- Create INSERT trigger (this is what should have fired for your new entry)
CREATE TRIGGER demo_ready_notification_trigger_insert
  AFTER INSERT ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- =============================================================================
-- 4. GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated, service_role;

-- =============================================================================
-- 5. VERIFICATION
-- =============================================================================

SELECT '✅ TRIGGERS RECREATED!' AS status;

-- Check triggers exist
SELECT 
  'Trigger: ' || trigger_name || ' on ' || event_manipulation AS created_triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%demo%';

-- =============================================================================
-- 6. TEST WITH YOUR DATA
-- =============================================================================

SELECT '🧪 NOW TEST:' AS test_instruction;
SELECT 'Run this with a real user_id from your database:' AS instruction;

/*
-- COPY A REAL USER_ID FROM YOUR DATABASE AND TEST:

-- Test INSERT (should trigger email):
INSERT INTO demo_links (user_id, option_1_url, option_2_url, option_3_url) 
VALUES ('YOUR_REAL_USER_ID', 'https://demo1.test', 'https://demo2.test', 'https://demo3.test');

-- Then check Supabase Logs for messages like:
-- "Demo trigger fired! Operation: INSERT"
-- "All demos ready: true"
-- "TRIGGER CONDITION MET! Sending notification"
-- "Demo ready notification API call result: status=200"
*/

RAISE NOTICE '🎯 TRIGGERS FIXED! Now test with a real INSERT and check the logs.';
RAISE NOTICE '📋 Go to Supabase Dashboard → Logs to see detailed trigger execution.';
