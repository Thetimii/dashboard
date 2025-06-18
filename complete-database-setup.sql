-- Complete Database Setup and Migration Script
-- This script preserves existing table structures and adds necessary components
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS AND CREATE ENUMS
-- =============================================================================

-- Enable HTTP extension for database triggers to make API calls
CREATE EXTENSION IF NOT EXISTS http;

-- Create enum types for better type safety
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
    status text NULL DEFAULT 'not_touched', -- Will be migrated to enum later
    updated_at timestamp without time zone NULL DEFAULT now(),
    final_url text NULL,
    CONSTRAINT project_status_pkey PRIMARY KEY (id),
    CONSTRAINT project_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    stripe_payment_id text NULL,
    amount numeric NULL,
    status text NULL DEFAULT 'pending', -- Will be migrated to enum later
    created_at timestamp without time zone NULL DEFAULT now(),
    stripe_customer_id text NULL,
    subscription_id text NULL,
    subscription_status text NULL DEFAULT ''::text,
    cancel_at_period_end boolean NULL DEFAULT false,
    canceled_at timestamp with time zone NULL,
    cancellation_reason text NULL,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
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
-- 2.5. MIGRATE STATUS COLUMNS TO ENUMS
-- =============================================================================

-- Migrate project_status.status to enum type
DO $$ 
BEGIN
    -- Check if the column is already using the enum type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'project_status' 
        AND column_name = 'status' 
        AND udt_name = 'project_status_enum'
    ) THEN
        -- Drop existing check constraints
        ALTER TABLE public.project_status DROP CONSTRAINT IF EXISTS project_status_status_check;
        
        -- Migrate to enum type
        ALTER TABLE public.project_status 
        ALTER COLUMN status TYPE project_status_enum 
        USING status::project_status_enum;
        
        -- Set default
        ALTER TABLE public.project_status 
        ALTER COLUMN status SET DEFAULT 'not_touched'::project_status_enum;
        
        RAISE NOTICE 'Migrated project_status.status to enum type';
    ELSE
        RAISE NOTICE 'project_status.status already using enum type';
    END IF;
END $$;

-- Migrate payments.status to enum type
DO $$ 
BEGIN
    -- Check if the column is already using the enum type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'status' 
        AND udt_name = 'payment_status_enum'
    ) THEN
        -- Drop existing check constraints
        ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
        
        -- Migrate to enum type
        ALTER TABLE public.payments 
        ALTER COLUMN status TYPE payment_status_enum 
        USING status::payment_status_enum;
        
        -- Set default
        ALTER TABLE public.payments 
        ALTER COLUMN status SET DEFAULT 'pending'::payment_status_enum;
        
        RAISE NOTICE 'Migrated payments.status to enum type';
    ELSE
        RAISE NOTICE 'payments.status already using enum type';
    END IF;
END $$;

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

-- Drop existing service role policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Service role can access all user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can access all kickoff_forms" ON public.kickoff_forms;
DROP POLICY IF EXISTS "Service role can access all project_status" ON public.project_status;
DROP POLICY IF EXISTS "Service role can access all demo_links" ON public.demo_links;
DROP POLICY IF EXISTS "Service role can access all payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can access all website_launch_queue" ON public.website_launch_queue;

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
  all_demos_ready boolean;
BEGIN
  RAISE LOG 'notify_demo_ready trigger fired for user_id: %', NEW.user_id;

  -- Check if all 3 demo options are now filled (not null and not empty)
  all_demos_ready := (
    NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
    NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
    NEW.option_3_url IS NOT NULL AND NEW.option_3_url != ''
  );

  RAISE LOG 'all_demos_ready: %', all_demos_ready;

  -- If all demos are ready, send the notification. Always.
  IF all_demos_ready THEN
    RAISE LOG 'All demos are ready, preparing to send notification.';

    -- Build the API URL
    api_url := COALESCE(
      current_setting('app.base_url', true),
      'https://app.customerflows.ch'
    ) || '/api/notify-demo-ready';

    -- Build the payload
    payload := jsonb_build_object(
      'userId', NEW.user_id::text
    );

    RAISE LOG 'Calling API URL: % with payload: %', api_url, payload;

    -- Make HTTP request to our API endpoint
    BEGIN
      PERFORM http_post(
        api_url,
        payload::text,
        'application/json'
      );
      RAISE LOG 'Successfully called demo ready notification API.';
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
BEGIN
  RAISE LOG 'notify_website_launch trigger fired for user_id: %', NEW.user_id;
  RAISE LOG 'Status: %, Final URL: %', NEW.status, NEW.final_url;

  -- If the status is 'live' AND the final_url is filled, send the notification. Always.
  IF NEW.status = 'live' AND NEW.final_url IS NOT NULL AND NEW.final_url != '' THEN
    RAISE LOG 'Status is live and final_url is present, preparing to send notification.';

    -- Build the API URL
    api_url := COALESCE(
      current_setting('app.base_url', true),
      'https://app.customerflows.ch'
    ) || '/api/notify-website-launch';

    -- Build the payload
    payload := jsonb_build_object(
      'userId', NEW.user_id::text
    );

    RAISE LOG 'Calling API URL: % with payload: %', api_url, payload;

    -- Make HTTP request to our API endpoint
    BEGIN
      PERFORM http_post(
        api_url,
        payload::text,
        'application/json'
      );
      RAISE LOG 'Successfully called website launch notification API.';
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

-- Drop existing triggers to ensure a clean setup
DROP TRIGGER IF EXISTS demo_ready_notification ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification ON public.project_status;

-- Create the trigger for demo ready notifications
-- Fires on INSERT or UPDATE of demo_links.
-- The function notify_demo_ready() will check if all 3 URLs are present.
CREATE TRIGGER demo_ready_notification
  AFTER INSERT OR UPDATE ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- Create the trigger for website launch notifications
-- Fires on any UPDATE of project_status.
-- The function notify_website_launch() will check if the status is 'live'.
CREATE TRIGGER website_launch_notification
  AFTER UPDATE ON public.project_status
  FOR EACH ROW
  EXECUTE FUNCTION notify_website_launch();

-- =============================================================================
-- 9. GRANT PERMISSIONS AND CREATE HELPER FUNCTIONS
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

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO service_role;
GRANT EXECUTE ON FUNCTION get_project_status_values() TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_status_values() TO service_role;
GRANT EXECUTE ON FUNCTION get_payment_status_values() TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_status_values() TO service_role;

-- Grant usage on enum types
GRANT USAGE ON TYPE project_status_enum TO authenticated;
GRANT USAGE ON TYPE project_status_enum TO service_role;
GRANT USAGE ON TYPE payment_status_enum TO authenticated;
GRANT USAGE ON TYPE payment_status_enum TO service_role;

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
-- ✅ PostgreSQL ENUM types for status fields (better type safety)
-- ✅ Automatic demo ready notifications when all 3 URLs are filled
-- ✅ Automatic website launch notifications when status becomes 'live'
-- ✅ Proper RLS policies for security
-- ✅ Service role access for admin operations and webhooks
-- ✅ HTTP extension enabled for API calls from triggers
-- ✅ Helper functions to get valid enum values

-- ENUM VALUES:
-- Project Status: 'not_touched', 'in_progress', 'complete', 'live'
-- Payment Status: 'pending', 'completed', 'failed', 'cancelled', 'scheduled_for_cancellation'

-- IMPORTANT NOTES:
-- 1. This script is idempotent - safe to run multiple times
-- 2. Existing data is preserved
-- 3. Triggers will automatically call your API endpoints
-- 4. Make sure your RESEND_API_KEY is set in Vercel environment variables
-- 5. Verify the base URL matches your production domain
-- 6. Status values are enforced at the database level (no invalid values allowed)

-- To verify the setup worked:
-- 1. Check enum types: SELECT typname FROM pg_type WHERE typname LIKE '%_enum';
-- 2. Test status options: SELECT * FROM get_project_status_values();
-- 3. Check triggers: \d+ demo_links (should show triggers)
-- 4. Test by updating demo URLs and checking logs
-- 5. Monitor the API endpoint logs in Vercel

-- For frontend usage:
-- You can now create dropdowns with the exact enum values
-- Invalid status values will be rejected by the database
-- Use the helper functions to get valid options: SELECT * FROM get_project_status_values();
