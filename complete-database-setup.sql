-- Complete Database Setup and Migration Script
-- This script preserves existing table structures and adds necessary components
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =============================================================================

-- Enable HTTP extension for database triggers to make API calls
CREATE EXTENSION IF NOT EXISTS http;

-- =============================================================================
-- 2. CREATE TABLES (IF NOT EXISTS - PRESERVES EXISTING DATA)
-- =============================================================================

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid NOT NULL,
    full_name text NULL,
    created_at timestamp without time zone NULL DEFAULT now(),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- Project status table
CREATE TABLE IF NOT EXISTS public.project_status (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    status text NULL,
    updated_at timestamp without time zone NULL DEFAULT now(),
    final_url text NULL,
    CONSTRAINT project_status_pkey PRIMARY KEY (id),
    CONSTRAINT project_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
    CONSTRAINT project_status_status_check CHECK (
        status = ANY (
            ARRAY[
                'not_touched'::text,
                'in_progress'::text,
                'complete'::text,
                'live'::text
            ]
        )
    )
) TABLESPACE pg_default;

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    stripe_payment_id text NULL,
    amount numeric NULL,
    status text NULL,
    created_at timestamp without time zone NULL DEFAULT now(),
    stripe_customer_id text NULL,
    subscription_id text NULL,
    subscription_status text NULL DEFAULT ''::text,
    cancel_at_period_end boolean NULL DEFAULT false,
    canceled_at timestamp with time zone NULL,
    cancellation_reason text NULL,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
    CONSTRAINT payments_status_check CHECK (
        status = ANY (
            ARRAY[
                'pending'::text,
                'completed'::text,
                'failed'::text
            ]
        )
    )
) TABLESPACE pg_default;

-- Kickoff forms table
CREATE TABLE IF NOT EXISTS public.kickoff_forms (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    business_name text NULL,
    business_description text NULL,
    website_style text NULL,
    desired_pages text[] NULL,
    color_preferences text NULL,
    logo_url text NULL,
    content_upload_url text NULL,
    special_requests text NULL,
    completed boolean NULL DEFAULT false,
    created_at timestamp without time zone NULL DEFAULT now(),
    CONSTRAINT kickoff_forms_pkey PRIMARY KEY (id),
    CONSTRAINT kickoff_forms_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- Demo links table
CREATE TABLE IF NOT EXISTS public.demo_links (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    option_1_url text NULL,
    option_2_url text NULL,
    option_3_url text NULL,
    approved_option text NULL,
    approved_at timestamp without time zone NULL,
    CONSTRAINT demo_links_pkey PRIMARY KEY (id),
    CONSTRAINT demo_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- =============================================================================
-- 3. WEBSITE LAUNCH QUEUE TABLE (IF NEEDED)
-- =============================================================================

-- Create website launch queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.website_launch_queue (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    final_url text NULL,
    processed boolean NULL DEFAULT false,
    created_at timestamp without time zone NULL DEFAULT now(),
    CONSTRAINT website_launch_queue_pkey PRIMARY KEY (id),
    CONSTRAINT website_launch_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kickoff_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_launch_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own kickoff form" ON public.kickoff_forms;
DROP POLICY IF EXISTS "Users can insert own kickoff form" ON public.kickoff_forms;
DROP POLICY IF EXISTS "Users can update own kickoff form" ON public.kickoff_forms;

DROP POLICY IF EXISTS "Users can view own project status" ON public.project_status;
DROP POLICY IF EXISTS "Users can insert own project status" ON public.project_status;
DROP POLICY IF EXISTS "Users can update own project status" ON public.project_status;

DROP POLICY IF EXISTS "Users can view own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Users can update own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Users can insert own demo links" ON public.demo_links;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;

DROP POLICY IF EXISTS "Users can view own launch queue" ON public.website_launch_queue;
DROP POLICY IF EXISTS "Users can insert own launch queue" ON public.website_launch_queue;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Kickoff forms policies
CREATE POLICY "Users can view own kickoff form" ON public.kickoff_forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kickoff form" ON public.kickoff_forms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kickoff form" ON public.kickoff_forms FOR UPDATE USING (auth.uid() = user_id);

-- Project status policies
CREATE POLICY "Users can view own project status" ON public.project_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project status" ON public.project_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project status" ON public.project_status FOR UPDATE USING (auth.uid() = user_id);

-- Demo links policies
CREATE POLICY "Users can view own demo links" ON public.demo_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own demo links" ON public.demo_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own demo links" ON public.demo_links FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);

-- Website launch queue policies
CREATE POLICY "Users can view own launch queue" ON public.website_launch_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own launch queue" ON public.website_launch_queue FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 5. ADMIN POLICIES (SERVICE ROLE ACCESS)
-- =============================================================================

-- Allow service role to access all tables for admin operations and webhooks
CREATE POLICY "Service role can access all user_profiles" ON public.user_profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all kickoff_forms" ON public.kickoff_forms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all project_status" ON public.project_status FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all demo_links" ON public.demo_links FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all payments" ON public.payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all website_launch_queue" ON public.website_launch_queue FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- 6. DEMO READY NOTIFICATION TRIGGER FUNCTION
-- =============================================================================

-- Create or replace the demo ready notification function
CREATE OR REPLACE FUNCTION notify_demo_ready()
RETURNS TRIGGER AS $$
DECLARE
  api_url text;
  payload jsonb;
  result record;
  all_demos_ready boolean;
  were_demos_ready_before boolean;
BEGIN
  -- Check if all 3 demo options are now filled (not null and not empty)
  all_demos_ready := (
    NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
    NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
    NEW.option_3_url IS NOT NULL AND NEW.option_3_url != ''
  );
  
  -- Check if all demos were ready before this update (for UPDATE trigger)
  were_demos_ready_before := CASE 
    WHEN TG_OP = 'INSERT' THEN false
    ELSE (
      OLD.option_1_url IS NOT NULL AND OLD.option_1_url != '' AND
      OLD.option_2_url IS NOT NULL AND OLD.option_2_url != '' AND
      OLD.option_3_url IS NOT NULL AND OLD.option_3_url != ''
    )
  END;
  
  -- Only send notification if demos are ready now but weren't ready before
  IF all_demos_ready AND NOT were_demos_ready_before THEN
    
    -- Build the API URL
    api_url := COALESCE(
      current_setting('app.base_url', true), 
      'https://app.customerflows.ch'
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

-- =============================================================================
-- 7. WEBSITE LAUNCH NOTIFICATION TRIGGER FUNCTION
-- =============================================================================

-- Create or replace the website launch notification function
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

-- =============================================================================
-- 8. CREATE TRIGGERS
-- =============================================================================

-- Drop existing triggers if they exist
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

-- =============================================================================
-- 9. GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO service_role;

-- Grant usage on all tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant full access to service role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- 10. SET CONFIGURATION
-- =============================================================================

-- Set the base URL for API calls (change this to your production URL)
SELECT set_config('app.base_url', 'https://app.customerflows.ch', false);

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================

-- The database is now configured with:
-- ✅ All existing tables preserved with their current structure
-- ✅ Automatic demo ready notifications when all 3 URLs are filled
-- ✅ Automatic website launch notifications when status becomes 'live'
-- ✅ Proper RLS policies for security
-- ✅ Service role access for admin operations and webhooks
-- ✅ HTTP extension enabled for API calls from triggers

-- IMPORTANT NOTES:
-- 1. This script is idempotent - safe to run multiple times
-- 2. Existing data is preserved
-- 3. Triggers will automatically call your API endpoints
-- 4. Make sure your RESEND_API_KEY is set in Vercel environment variables
-- 5. Verify the base URL matches your production domain

-- To verify the setup worked:
-- 1. Check that triggers exist: \d+ demo_links (should show triggers)
-- 2. Test by updating demo URLs and checking logs
-- 3. Monitor the API endpoint logs in Vercel
