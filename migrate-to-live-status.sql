-- Migration Script: Add 'live' status and remove website_is_live field
-- Run this script to update your existing project_status table

-- Step 1: Add the 'live' status to the check constraint
-- First, drop the existing constraint
ALTER TABLE public.project_status DROP CONSTRAINT IF EXISTS project_status_status_check;

-- Add the new constraint with 'live' status included
ALTER TABLE public.project_status ADD CONSTRAINT project_status_status_check CHECK (
    status = ANY (
        ARRAY[
            'not_touched'::text,
            'in_progress'::text,
            'complete'::text,
            'live'::text
        ]
    )
);

-- Step 2: Migrate existing website_is_live data to status field
-- Update records where website_is_live = true to have status = 'live'
UPDATE public.project_status 
SET status = 'live' 
WHERE website_is_live = true AND status != 'live';

-- Step 3: Remove the website_is_live column (optional - can be done later)
-- Uncomment the line below if you want to remove the old column immediately
-- ALTER TABLE public.project_status DROP COLUMN IF EXISTS website_is_live;

-- Step 4: Update the website launch trigger function
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
  api_url text;
  payload jsonb;
  result record;
BEGIN
  -- Only proceed if status was changed from something other than 'live' to 'live'
  IF (OLD.status IS DISTINCT FROM 'live') AND (NEW.status = 'live') THEN
    
    -- Build the API URL
    api_url := COALESCE(
      current_setting('app.base_url', true), 
      'https://app.customerflows.ch'
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

-- Step 5: Recreate the trigger (it will use the updated function)
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;
CREATE TRIGGER website_launch_notification_trigger
  AFTER UPDATE ON public.project_status
  FOR EACH ROW
  EXECUTE FUNCTION notify_website_launch();

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO service_role;

-- Verification queries (run these to check the migration worked):
-- 1. Check the new constraint allows 'live' status
-- SELECT status, COUNT(*) FROM public.project_status GROUP BY status;

-- 2. Verify the trigger exists
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'website_launch_notification_trigger';

-- 3. Test the constraint (this should work now)
-- INSERT INTO public.project_status (user_id, status) VALUES (gen_random_uuid(), 'live');
-- DELETE FROM public.project_status WHERE status = 'live' AND user_id NOT IN (SELECT id FROM auth.users);

RAISE NOTICE 'Migration completed! The project_status table now supports "live" status and the trigger has been updated.';
