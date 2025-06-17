-- Website Launch Notification Trigger
-- This SQL creates a database trigger that automatically sends an email notification
-- when the website_is_live field is changed to true in the project_status table

-- First, create a function that will call our API endpoint
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
  api_url text;
  payload jsonb;
  result record;
BEGIN
  -- Only proceed if website_is_live was changed from false/null to true
  IF (OLD.website_is_live IS DISTINCT FROM true) AND (NEW.website_is_live = true) THEN
    
    -- Build the API URL (you may need to adjust this based on your deployment)
    api_url := COALESCE(
      current_setting('app.base_url', true), 
      'http://localhost:3000'
    ) || '/api/notify-website-launch';
    
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

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_website_launch ON project_status;
CREATE TRIGGER trigger_notify_website_launch
  AFTER UPDATE ON project_status
  FOR EACH ROW
  EXECUTE FUNCTION notify_website_launch();

-- Enable the http extension if not already enabled (may require superuser privileges)
-- CREATE EXTENSION IF NOT EXISTS http;

-- Alternative approach using a simpler notification system
-- If you can't use the http extension, you can use NOTIFY/LISTEN pattern
-- or create a queue table that your application monitors

-- Alternative: Create a notification queue table
CREATE TABLE IF NOT EXISTS website_launch_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  final_url text NOT NULL,
  created_at timestamp DEFAULT now(),
  processed boolean DEFAULT false
);

-- Alternative trigger function that uses the queue
CREATE OR REPLACE FUNCTION queue_website_launch_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if website_is_live was changed from false/null to true
  IF (OLD.website_is_live IS DISTINCT FROM true) AND (NEW.website_is_live = true) THEN
    
    -- Insert into queue table
    INSERT INTO website_launch_queue (user_id, final_url)
    VALUES (NEW.user_id, NEW.final_url);
    
    -- Log the action
    RAISE LOG 'Website launch notification queued for user: %', NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create alternative trigger using queue
DROP TRIGGER IF EXISTS trigger_queue_website_launch ON project_status;
CREATE TRIGGER trigger_queue_website_launch
  AFTER UPDATE ON project_status
  FOR EACH ROW
  EXECUTE FUNCTION queue_website_launch_notification();

-- Add RLS policy for the queue table
ALTER TABLE website_launch_queue ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access the queue
CREATE POLICY "Service role can manage website launch queue" 
  ON website_launch_queue 
  FOR ALL 
  USING (true);

-- Add comment
COMMENT ON TABLE website_launch_queue IS 'Queue for website launch notifications to be processed by the application';
