-- Create Project Status Enum Types
-- This script creates proper PostgreSQL enums for better type safety

-- =============================================================================
-- 1. CREATE ENUM TYPES
-- =============================================================================

-- Create the project status enum type
DO $$ BEGIN
    CREATE TYPE project_status_enum AS ENUM (
        'not_touched',
        'in_progress', 
        'complete',
        'live'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment status enum type (for consistency)
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'pending',
        'completed', 
        'failed',
        'cancelled',
        'scheduled_for_cancellation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- 2. UPDATE EXISTING TABLES TO USE ENUMS
-- =============================================================================

-- First, let's backup the current status values (optional)
-- CREATE TABLE IF NOT EXISTS project_status_backup AS SELECT * FROM public.project_status;
-- CREATE TABLE IF NOT EXISTS payments_backup AS SELECT * FROM public.payments;

-- Drop existing check constraints
ALTER TABLE public.project_status DROP CONSTRAINT IF EXISTS project_status_status_check;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- Add temporary columns with enum types
ALTER TABLE public.project_status ADD COLUMN IF NOT EXISTS status_enum project_status_enum;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status_enum payment_status_enum;

-- Migrate existing data to enum columns
UPDATE public.project_status 
SET status_enum = status::project_status_enum 
WHERE status IS NOT NULL;

UPDATE public.payments 
SET status_enum = status::payment_status_enum 
WHERE status IS NOT NULL;

-- Drop old text columns and rename enum columns
ALTER TABLE public.project_status DROP COLUMN IF EXISTS status;
ALTER TABLE public.project_status RENAME COLUMN status_enum TO status;

ALTER TABLE public.payments DROP COLUMN IF EXISTS status;
ALTER TABLE public.payments RENAME COLUMN status_enum TO status;

-- =============================================================================
-- 3. UPDATE TABLE DEFINITIONS FOR NEW RECORDS
-- =============================================================================

-- Make sure the columns have proper defaults and constraints
ALTER TABLE public.project_status 
    ALTER COLUMN status SET DEFAULT 'not_touched'::project_status_enum;

ALTER TABLE public.payments 
    ALTER COLUMN status SET DEFAULT 'pending'::payment_status_enum;

-- =============================================================================
-- 4. CREATE HELPER FUNCTIONS FOR ENUM VALUES
-- =============================================================================

-- Function to get all possible project status values
CREATE OR REPLACE FUNCTION get_project_status_values()
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY['not_touched', 'in_progress', 'complete', 'live'];
END;
$$ LANGUAGE plpgsql;

-- Function to get all possible payment status values  
CREATE OR REPLACE FUNCTION get_payment_status_values()
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY['pending', 'completed', 'failed', 'cancelled', 'scheduled_for_cancellation'];
END;
$$ LANGUAGE plpgsql;

-- Function to validate project status
CREATE OR REPLACE FUNCTION is_valid_project_status(status_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN status_value = ANY(get_project_status_values());
END;
$$ LANGUAGE plpgsql;

-- Function to validate payment status
CREATE OR REPLACE FUNCTION is_valid_payment_status(status_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN status_value = ANY(get_payment_status_values());
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. UPDATE TRIGGERS TO WORK WITH ENUMS
-- =============================================================================

-- Update the website launch notification function
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
  api_url text;
  payload jsonb;
  result record;
BEGIN
  -- Only proceed if status was changed from something other than 'live' to 'live'
  IF (OLD.status IS DISTINCT FROM 'live'::project_status_enum) AND (NEW.status = 'live'::project_status_enum) THEN
    
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;
CREATE TRIGGER website_launch_notification_trigger
  AFTER UPDATE ON public.project_status
  FOR EACH ROW
  EXECUTE FUNCTION notify_website_launch();

-- =============================================================================
-- 6. GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on enum types
GRANT USAGE ON TYPE project_status_enum TO authenticated;
GRANT USAGE ON TYPE project_status_enum TO service_role;
GRANT USAGE ON TYPE payment_status_enum TO authenticated;
GRANT USAGE ON TYPE payment_status_enum TO service_role;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_project_status_values() TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_status_values() TO service_role;
GRANT EXECUTE ON FUNCTION get_payment_status_values() TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_status_values() TO service_role;
GRANT EXECUTE ON FUNCTION is_valid_project_status(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_valid_project_status(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION is_valid_payment_status(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_valid_payment_status(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO service_role;

-- =============================================================================
-- 7. VERIFICATION QUERIES
-- =============================================================================

-- Verify enum types were created
-- SELECT typname, typtype FROM pg_type WHERE typname IN ('project_status_enum', 'payment_status_enum');

-- Verify data migration worked
-- SELECT status, COUNT(*) FROM public.project_status GROUP BY status;
-- SELECT status, COUNT(*) FROM public.payments GROUP BY status;

-- Test enum constraints (these should work)
-- INSERT INTO public.project_status (user_id, status) VALUES (gen_random_uuid(), 'live');
-- INSERT INTO public.payments (user_id, status) VALUES (gen_random_uuid(), 'completed');

-- Test invalid values (these should fail)
-- INSERT INTO public.project_status (user_id, status) VALUES (gen_random_uuid(), 'invalid_status');
-- INSERT INTO public.payments (user_id, status) VALUES (gen_random_uuid(), 'invalid_status');

-- Clean up test data
-- DELETE FROM public.project_status WHERE user_id NOT IN (SELECT id FROM auth.users);
-- DELETE FROM public.payments WHERE user_id NOT IN (SELECT id FROM auth.users);

RAISE NOTICE 'Enum migration completed successfully!';
RAISE NOTICE 'Project status enum: not_touched, in_progress, complete, live';
RAISE NOTICE 'Payment status enum: pending, completed, failed';
RAISE NOTICE 'All constraints are now enforced at the database level.';

-- =============================================================================
-- 8. ADDITIONAL HELPER VIEWS (OPTIONAL)
-- =============================================================================

-- Create a view to see all enum values easily
CREATE OR REPLACE VIEW status_options AS
SELECT 
    'project_status' as enum_type,
    unnest(get_project_status_values()) as status_value
UNION ALL
SELECT 
    'payment_status' as enum_type,
    unnest(get_payment_status_values()) as status_value;

GRANT SELECT ON status_options TO authenticated;
GRANT SELECT ON status_options TO service_role;
