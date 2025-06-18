-- COMPLETE DATABASE SETUP - PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- This will fix all email notification triggers and set up the database correctly

-- =============================================================================
-- 1. ENABLE EXTENSIONS AND CREATE TYPES
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS http;

DO $$ BEGIN
    CREATE TYPE project_status_enum AS ENUM ('not_touched', 'in_progress', 'complete', 'live');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- 2. CREATE/UPDATE TABLES
-- =============================================================================

-- Project status table
CREATE TABLE IF NOT EXISTS public.project_status (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    status project_status_enum DEFAULT 'not_touched',
    updated_at timestamp DEFAULT now(),
    final_url text NULL,
    CONSTRAINT project_status_pkey PRIMARY KEY (id),
    CONSTRAINT project_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- Demo links table  
CREATE TABLE IF NOT EXISTS public.demo_links (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    option_1_url text NULL,
    option_2_url text NULL,
    option_3_url text NULL,
    approved_option text NULL,
    approved_at timestamp NULL,
    CONSTRAINT demo_links_pkey PRIMARY KEY (id),
    CONSTRAINT demo_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

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
    completed boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    CONSTRAINT kickoff_forms_pkey PRIMARY KEY (id),
    CONSTRAINT kickoff_forms_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    stripe_payment_id text NULL,
    amount numeric NULL,
    status payment_status_enum DEFAULT 'pending',
    created_at timestamp DEFAULT now(),
    stripe_customer_id text NULL,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- =============================================================================
-- 3. MIGRATE EXISTING DATA (IF ANY)
-- =============================================================================

-- Fix project_status column type if it exists as text
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'project_status' AND column_name = 'status' AND data_type = 'text') THEN
        ALTER TABLE public.project_status ALTER COLUMN status TYPE project_status_enum 
        USING status::project_status_enum;
    END IF;
END $$;

-- Migrate any website_is_live field to status = 'live'
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'project_status' AND column_name = 'website_is_live') THEN
        UPDATE public.project_status SET status = 'live' WHERE website_is_live = true;
        ALTER TABLE public.project_status DROP COLUMN website_is_live;
    END IF;
END $$;

-- =============================================================================
-- 4. EMAIL NOTIFICATION TRIGGER FUNCTIONS
-- =============================================================================

-- Demo ready notification function
CREATE OR REPLACE FUNCTION notify_demo_ready()
RETURNS TRIGGER AS $$
DECLARE
    api_url text;
    payload jsonb;
    result record;
    all_demos_ready boolean;
BEGIN
    -- Check if all 3 demo options are filled
    all_demos_ready := (
        NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
        NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
        NEW.option_3_url IS NOT NULL AND NEW.option_3_url != ''
    );
    
    -- Only notify if this is a new complete state
    IF all_demos_ready AND (
        OLD.option_1_url IS NULL OR OLD.option_1_url = '' OR
        OLD.option_2_url IS NULL OR OLD.option_2_url = '' OR
        OLD.option_3_url IS NULL OR OLD.option_3_url = ''
    ) THEN
        
        -- Production URL - FIXED!
        api_url := 'https://app.customerflows.ch/api/notify-demo-ready';
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        BEGIN
            SELECT INTO result content::json->'success' as success, status_code
            FROM http(('POST', api_url, ARRAY[http_header('Content-Type', 'application/json')], 'application/json', payload::text)::http_request);
            
            RAISE LOG 'Demo ready notification: status=%, success=%', result.status_code, result.success;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Demo ready notification failed: %', SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Website launch notification function  
CREATE OR REPLACE FUNCTION notify_website_launch()
RETURNS TRIGGER AS $$
DECLARE
    api_url text;
    payload jsonb;
    result record;
BEGIN
    -- FIXED: Check if status changed TO 'live' (not website_is_live field!)
    IF (OLD.status IS DISTINCT FROM 'live') AND (NEW.status = 'live') THEN
        
        -- Production URL - FIXED!
        api_url := 'https://app.customerflows.ch/api/notify-website-launch';
        
        payload := jsonb_build_object('userId', NEW.user_id::text);
        
        BEGIN
            SELECT INTO result content::json->'success' as success, status_code
            FROM http(('POST', api_url, ARRAY[http_header('Content-Type', 'application/json')], 'application/json', payload::text)::http_request);
            
            RAISE LOG 'Website launch notification: status=%, success=%', result.status_code, result.success;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Website launch notification failed: %', SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. CREATE TRIGGERS
-- =============================================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- Create demo ready triggers
CREATE TRIGGER demo_ready_notification_trigger
    AFTER UPDATE ON public.demo_links
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

CREATE TRIGGER demo_ready_notification_trigger_insert
    AFTER INSERT ON public.demo_links
    FOR EACH ROW EXECUTE FUNCTION notify_demo_ready();

-- Create website launch trigger
CREATE TRIGGER website_launch_notification_trigger
    AFTER UPDATE ON public.project_status
    FOR EACH ROW EXECUTE FUNCTION notify_website_launch();

-- =============================================================================
-- 6. PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated, service_role;

-- =============================================================================
-- 7. TEST QUERIES (UNCOMMENT TO TEST)
-- =============================================================================

-- Check triggers exist:
-- SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Test demo ready (replace user-id):
-- UPDATE demo_links SET option_3_url = 'https://test.com' WHERE user_id = 'your-user-id';

-- Test website launch (replace user-id):  
-- UPDATE project_status SET status = 'live' WHERE user_id = 'your-user-id';

DO $$ BEGIN
    RAISE NOTICE '✅ COMPLETE DATABASE SETUP FINISHED!';
    RAISE NOTICE '✅ URLs CONFIGURED FOR: app.customerflows.ch';
    RAISE NOTICE '🧪 TEST BY UPDATING demo_links OR setting project_status TO live';
END $$;
