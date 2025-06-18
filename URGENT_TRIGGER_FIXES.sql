-- URGENT FIX: Website Launch Trigger 
-- The current trigger is looking for the wrong field!

-- Step 1: Fix the website launch trigger function to use the correct 'status' field
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
  api_url text;
  payload jsonb;
  result record;
BEGIN
  -- FIXED: Check if status was changed to 'live' (not website_is_live field)
  IF (OLD.status IS DISTINCT FROM 'live') AND (NEW.status = 'live') THEN
    
    -- Build the API URL - Use production URL with multiple fallbacks
    api_url := COALESCE(
      current_setting('app.base_url', true),
      'https://dashboard-thetimii.vercel.app',  -- Primary Vercel URL
      'https://dashboard-git-main-thetimii.vercel.app',  -- Git branch URL
      'https://dashboard-thetimii.vercel.app'   -- Fallback
    ) || '/api/notify-website-launch';
    
    -- Build the payload
    payload := jsonb_build_object(
      'userId', NEW.user_id::text
    );
    
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
      RAISE LOG 'Website launch notification API call result: status=%, success=%', 
        result.status_code, result.success;
        
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE LOG 'Failed to call website launch notification API: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Fix the demo ready trigger function with correct production URL
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
    
    -- Build the API URL - Use production URL with multiple fallbacks
    api_url := COALESCE(
      current_setting('app.base_url', true),
      'https://dashboard-thetimii.vercel.app',  -- Primary Vercel URL
      'https://dashboard-git-main-thetimii.vercel.app',  -- Git branch URL  
      'https://dashboard-thetimii.vercel.app'   -- Fallback
    ) || '/api/notify-demo-ready';
    
    -- Build the payload
    payload := jsonb_build_object(
      'userId', NEW.user_id::text
    );
    
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Ensure HTTP extension is enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Step 4: Drop and recreate triggers to ensure they're working
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- Create demo ready triggers
CREATE TRIGGER demo_ready_notification_trigger
  AFTER UPDATE ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

CREATE TRIGGER demo_ready_notification_trigger_insert
  AFTER INSERT ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- Create website launch trigger
CREATE TRIGGER website_launch_notification_trigger
  AFTER UPDATE ON public.project_status
  FOR EACH ROW
  EXECUTE FUNCTION notify_website_launch();

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO service_role;

-- Step 6: Set the correct base URL for production (adjust as needed)
SELECT set_config('app.base_url', 'https://dashboard-thetimii.vercel.app', false);

-- Verification queries:
-- 1. Check if triggers exist:
-- SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

-- 2. Check if HTTP extension is enabled:
-- SELECT * FROM pg_extension WHERE extname = 'http';

-- 3. Test demo ready trigger (replace with real user_id):
-- UPDATE demo_links SET option_3_url = 'https://test.com' WHERE user_id = 'your-user-id';

-- 4. Test website launch trigger (replace with real user_id):
-- UPDATE project_status SET status = 'live' WHERE user_id = 'your-user-id';

RAISE NOTICE '🚨 CRITICAL FIXES APPLIED:';
RAISE NOTICE '✅ Website launch trigger now checks "status = live" instead of "website_is_live"';
RAISE NOTICE '✅ API URLs updated to production Vercel URL';
RAISE NOTICE '✅ HTTP extension enabled for API calls';
RAISE NOTICE '✅ All triggers recreated with correct functions';
RAISE NOTICE '🔄 Please test by updating demo URLs or setting project status to "live"';
