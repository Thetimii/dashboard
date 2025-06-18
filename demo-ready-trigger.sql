-- Demo Ready Notification Trigger
-- This SQL creates a database trigger that automatically sends an email notification
-- when all 3 demo options (option_1_url, option_2_url, option_3_url) are filled in the demo_links table

-- First, create a function that will call our API endpoint
CREATE OR REPLACE FUNCTION notify_demo_ready()
RETURNS TRIGGER AS $$
DECLARE
  api_url text;
  payload jsonb;
  result record;
  all_demos_ready boolean;
BEGIN
  -- Check if all 3 demo options are now filled (not null and not empty)
  all_demos_ready := (
    NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
    NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
    NEW.option_3_url IS NOT NULL AND NEW.option_3_url != ''
  );
  
  -- Check if this is a new state (previously not all demos were ready)
  IF all_demos_ready AND (
    OLD.option_1_url IS NULL OR OLD.option_1_url = '' OR
    OLD.option_2_url IS NULL OR OLD.option_2_url = '' OR
    OLD.option_3_url IS NULL OR OLD.option_3_url = ''
  ) THEN
    
    -- Build the API URL (you may need to adjust this based on your deployment)
    api_url := COALESCE(
      current_setting('app.base_url', true), 
      'https://app.customerflows.ch'
    ) || '/api/notify-demo-ready';
    
    -- Build the payload
    payload := jsonb_build_object(
      'userId', NEW.user_id::text
    );
    
    -- Make HTTP request to our API endpoint
    -- Note: This uses the http extension which needs to be enabled
    -- You can also use pg_cron or other methods if http extension is not available
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON demo_links;
CREATE TRIGGER demo_ready_notification_trigger
  AFTER UPDATE ON demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- Also create a trigger for INSERT (in case all 3 URLs are provided at once)
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON demo_links;
CREATE TRIGGER demo_ready_notification_trigger_insert
  AFTER INSERT ON demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO service_role;

-- Instructions for setup:
-- 1. Run this SQL in your Supabase SQL editor
-- 2. Make sure the http extension is enabled: CREATE EXTENSION IF NOT EXISTS http;
-- 3. Set the base URL setting if needed: SELECT set_config('app.base_url', 'https://app.customerflows.ch', false);
