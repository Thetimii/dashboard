-- Complete Database Setup for Dashboard Application
-- This script sets up everything needed for the manual email trigger system
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

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('user', 'admin');
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
    role user_role_enum NOT NULL DEFAULT 'user',
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id)
);

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN role user_role_enum NOT NULL DEFAULT 'user';
        RAISE NOTICE 'Added role column to user_profiles';
    END IF;
END $$;

-- Project status table
CREATE TABLE IF NOT EXISTS public.project_status (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    status text NULL DEFAULT 'not_touched',
    updated_at timestamp without time zone NULL DEFAULT now(),
    final_url text NULL,
    CONSTRAINT project_status_pkey PRIMARY KEY (id),
    CONSTRAINT project_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    stripe_payment_id text NULL,
    amount numeric NULL,
    status text NULL DEFAULT 'pending',
    created_at timestamp without time zone NULL DEFAULT now(),
    stripe_customer_id text NULL,
    subscription_id text NULL,
    subscription_status text NULL DEFAULT ''::text,
    cancel_at_period_end boolean NULL DEFAULT false,
    canceled_at timestamp with time zone NULL,
    cancellation_reason text NULL,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
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
    completed boolean NULL DEFAULT false,
    created_at timestamp without time zone NULL DEFAULT now(),
    CONSTRAINT kickoff_forms_pkey PRIMARY KEY (id),
    CONSTRAINT kickoff_forms_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

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
);

-- Client assignments table
CREATE TABLE IF NOT EXISTS public.client_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL,
    client_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT client_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT client_assignments_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.user_profiles(id),
    CONSTRAINT client_assignments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.user_profiles(id)
);

-- Follow-up questionnaires table
CREATE TABLE IF NOT EXISTS public.followup_questionnaires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed BOOLEAN DEFAULT false,
    
    -- Business Goals
    core_business TEXT,
    revenue_generation TEXT,
    secondary_revenue TEXT,
    long_term_revenue TEXT,
    
    -- Competitive Environment
    unique_selling_points TEXT,
    customer_choice_reasons TEXT,
    problems_solved TEXT,
    trust_building TEXT,
    potential_objections TEXT,
    main_competitors TEXT,
    competitor_strengths TEXT,
    
    -- Target Group Analysis
    target_group_demographics TEXT,
    target_group_needs TEXT,
    
    -- Content Planning
    service_subpages BOOLEAN DEFAULT false,
    service_subpages_details TEXT,
    existing_content BOOLEAN DEFAULT false,
    existing_content_details TEXT,
    
    -- Functionality
    required_functions TEXT[],
    ecommerce_needed BOOLEAN DEFAULT false,
    blog_needed BOOLEAN DEFAULT false,
    newsletter_needed BOOLEAN DEFAULT false,
    member_area_needed BOOLEAN DEFAULT false,
    social_media_needed BOOLEAN DEFAULT false,
    whatsapp_chat_needed BOOLEAN DEFAULT false,
    appointment_booking BOOLEAN DEFAULT false,
    appointment_tool TEXT,
    existing_seo_keywords TEXT,
    google_analytics_needed BOOLEAN DEFAULT false,
    
    -- Domain & Hosting
    desired_domain TEXT,
    
    -- Legal Requirements
    privacy_policy_exists BOOLEAN DEFAULT false,
    privacy_policy_creation_needed BOOLEAN DEFAULT false,
    company_address TEXT,
    company_phone TEXT,
    company_email TEXT,
    vat_id TEXT
);

-- Website launch queue table
CREATE TABLE IF NOT EXISTS public.website_launch_queue (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    final_url text NULL,
    processed boolean NULL DEFAULT false,
    created_at timestamp without time zone NULL DEFAULT now(),
    CONSTRAINT website_launch_queue_pkey PRIMARY KEY (id),
    CONSTRAINT website_launch_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- =============================================================================
-- 3. MANUAL EMAIL TRACKING SYSTEM
-- =============================================================================

-- Create table to track manual email sends
CREATE TABLE IF NOT EXISTS public.manual_email_sends (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type text NOT NULL CHECK (email_type IN ('demo_ready', 'website_launch')),
    sent_at timestamp with time zone DEFAULT now(),
    sent_by uuid REFERENCES auth.users(id), -- Admin who sent the email
    trigger_values jsonb, -- Store the values that triggered eligibility (demo URLs or status)
    created_at timestamp with time zone DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_user_id ON public.manual_email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_type ON public.manual_email_sends(email_type);

-- =============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kickoff_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_launch_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. CREATE HELPER FUNCTIONS
-- =============================================================================

-- Helper function to check for admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check if demo emails can be sent
CREATE OR REPLACE FUNCTION can_send_demo_email(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
    demo_data record;
    last_sent record;
    all_demos_ready boolean;
    values_changed boolean;
BEGIN
    -- Get current demo data
    SELECT option_1_url, option_2_url, option_3_url 
    INTO demo_data
    FROM public.demo_links 
    WHERE user_id = target_user_id;
    
    -- Check if all demos are ready
    all_demos_ready := (
        demo_data.option_1_url IS NOT NULL AND demo_data.option_1_url != '' AND
        demo_data.option_2_url IS NOT NULL AND demo_data.option_2_url != '' AND
        demo_data.option_3_url IS NOT NULL AND demo_data.option_3_url != ''
    );
    
    -- If demos aren't ready, can't send
    IF NOT all_demos_ready THEN
        RETURN false;
    END IF;
    
    -- Get last sent demo email for this user
    SELECT trigger_values 
    INTO last_sent
    FROM public.manual_email_sends 
    WHERE user_id = target_user_id 
    AND email_type = 'demo_ready'
    ORDER BY sent_at DESC 
    LIMIT 1;
    
    -- If never sent before, can send
    IF last_sent IS NULL THEN
        RETURN true;
    END IF;
    
    -- Check if demo URLs have changed since last send
    values_changed := (
        (last_sent.trigger_values->>'option_1_url') != demo_data.option_1_url OR
        (last_sent.trigger_values->>'option_2_url') != demo_data.option_2_url OR
        (last_sent.trigger_values->>'option_3_url') != demo_data.option_3_url
    );
    
    RETURN values_changed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if website launch emails can be sent
CREATE OR REPLACE FUNCTION can_send_launch_email(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
    project_data record;
    last_sent record;
    is_live boolean;
    status_changed boolean;
BEGIN
    -- Get current project status
    SELECT status, final_url 
    INTO project_data
    FROM public.project_status 
    WHERE user_id = target_user_id;
    
    -- Check if project is live
    is_live := (project_data.status = 'live');
    
    -- If not live, can't send
    IF NOT is_live THEN
        RETURN false;
    END IF;
    
    -- Get last sent launch email for this user
    SELECT trigger_values 
    INTO last_sent
    FROM public.manual_email_sends 
    WHERE user_id = target_user_id 
    AND email_type = 'website_launch'
    ORDER BY sent_at DESC 
    LIMIT 1;
    
    -- If never sent before, can send
    IF last_sent IS NULL THEN
        RETURN true;
    END IF;
    
    -- Check if status changed from non-live to live since last send
    status_changed := (
        (last_sent.trigger_values->>'status') != project_data.status OR
        (last_sent.trigger_values->>'final_url') != COALESCE(project_data.final_url, '')
    );
    
    RETURN status_changed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record email send
CREATE OR REPLACE FUNCTION record_email_send(
    target_user_id uuid,
    email_type_param text,
    admin_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid AS $$
DECLARE
    email_id uuid;
    trigger_vals jsonb;
BEGIN
    -- Prepare trigger values based on email type
    IF email_type_param = 'demo_ready' THEN
        SELECT jsonb_build_object(
            'option_1_url', option_1_url,
            'option_2_url', option_2_url,
            'option_3_url', option_3_url
        ) INTO trigger_vals
        FROM public.demo_links 
        WHERE user_id = target_user_id;
    ELSIF email_type_param = 'website_launch' THEN
        SELECT jsonb_build_object(
            'status', status,
            'final_url', COALESCE(final_url, '')
        ) INTO trigger_vals
        FROM public.project_status 
        WHERE user_id = target_user_id;
    END IF;
    
    -- Insert email send record
    INSERT INTO public.manual_email_sends (
        user_id,
        email_type,
        sent_by,
        trigger_values
    ) VALUES (
        target_user_id,
        email_type_param,
        admin_user_id,
        trigger_vals
    ) RETURNING id INTO email_id;
    
    RETURN email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 6. DROP EXISTING POLICIES (TO AVOID CONFLICTS)
-- =============================================================================

-- Drop all existing policies to ensure clean setup
DO $$ 
DECLARE
    pol_name text;
BEGIN
    -- Drop policies for user_profiles
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON public.user_profiles';
    END LOOP;
    
    -- Drop policies for other tables
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename IN (
            'kickoff_forms', 'project_status', 'demo_links', 'payments', 
            'website_launch_queue', 'client_assignments', 'followup_questionnaires',
            'manual_email_sends'
        ) AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON public.' || 
            (SELECT tablename FROM pg_policies WHERE policyname = pol_name AND schemaname = 'public' LIMIT 1);
    END LOOP;
END $$;

-- =============================================================================
-- 7. CREATE RLS POLICIES
-- =============================================================================

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all user profiles" ON public.user_profiles FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all user_profiles" ON public.user_profiles FOR ALL USING (auth.role() = 'service_role');

-- Kickoff forms policies
CREATE POLICY "Users can view own kickoff form" ON public.kickoff_forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kickoff form" ON public.kickoff_forms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kickoff form" ON public.kickoff_forms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all kickoff forms" ON public.kickoff_forms FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all kickoff_forms" ON public.kickoff_forms FOR ALL USING (auth.role() = 'service_role');

-- Project status policies
CREATE POLICY "Users can view own project status" ON public.project_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project status" ON public.project_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project status" ON public.project_status FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all project status" ON public.project_status FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all project_status" ON public.project_status FOR ALL USING (auth.role() = 'service_role');

-- Demo links policies
CREATE POLICY "Users can view own demo links" ON public.demo_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own demo links" ON public.demo_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own demo links" ON public.demo_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all demo links" ON public.demo_links FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all demo_links" ON public.demo_links FOR ALL USING (auth.role() = 'service_role');

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all payments" ON public.payments FOR ALL USING (auth.role() = 'service_role');

-- Website launch queue policies
CREATE POLICY "Users can view own launch queue" ON public.website_launch_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own launch queue" ON public.website_launch_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all website launch queue" ON public.website_launch_queue FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all website_launch_queue" ON public.website_launch_queue FOR ALL USING (auth.role() = 'service_role');

-- Client assignments policies
CREATE POLICY "Admins can manage client assignments" ON public.client_assignments FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all client_assignments" ON public.client_assignments FOR ALL USING (auth.role() = 'service_role');

-- Follow-up questionnaires policies
CREATE POLICY "Users can view their own questionnaires" ON public.followup_questionnaires FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own questionnaires" ON public.followup_questionnaires FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own questionnaires" ON public.followup_questionnaires FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all questionnaires" ON public.followup_questionnaires FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all followup_questionnaires" ON public.followup_questionnaires FOR ALL USING (auth.role() = 'service_role');

-- Manual email sends policies
CREATE POLICY "Admins can manage all email sends" ON public.manual_email_sends FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all email sends" ON public.manual_email_sends FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- 8. CREATE TRIGGERS
-- =============================================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_followup_questionnaires_updated_at ON public.followup_questionnaires;

-- Create trigger to automate profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at on followup_questionnaires
CREATE TRIGGER update_followup_questionnaires_updated_at 
    BEFORE UPDATE ON public.followup_questionnaires 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_demo_links_user_id ON public.demo_links(user_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_admin_id ON public.client_assignments(admin_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_client_id ON public.client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_user_id ON public.followup_questionnaires(user_id);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_completed ON public.followup_questionnaires(completed);

-- =============================================================================
-- 10. CREATE PROJECTS VIEW
-- =============================================================================

DROP VIEW IF EXISTS public.projects_view;

CREATE OR REPLACE VIEW public.projects_view AS
SELECT
    kf.id,
    kf.user_id,
    kf.business_name,
    kf.business_description,
    kf.website_style,
    kf.desired_pages,
    kf.color_preferences,
    kf.logo_url,
    kf.content_upload_url,
    kf.special_requests,
    kf.completed as kickoff_completed,
    kf.created_at,
    up.full_name,
    up.role,
    au.email,
    ps.status AS project_status,
    ps.final_url,
    ps.updated_at as status_updated_at,
    dl.option_1_url,
    dl.option_2_url,
    dl.option_3_url,
    dl.approved_option,
    dl.approved_at,
    p.status as payment_status,
    p.amount as payment_amount,
    p.stripe_customer_id,
    p.subscription_status,
    p.cancel_at_period_end,
    p.canceled_at,
    ca.admin_id AS assigned_admin_id,
    admin_up.full_name AS assigned_admin_name
FROM
    public.kickoff_forms kf
LEFT JOIN
    public.user_profiles up ON kf.user_id = up.id
LEFT JOIN
    auth.users au ON kf.user_id = au.id
LEFT JOIN
    public.project_status ps ON kf.user_id = ps.user_id
LEFT JOIN
    public.demo_links dl ON kf.user_id = dl.user_id
LEFT JOIN
    public.payments p ON kf.user_id = p.user_id
LEFT JOIN
    public.client_assignments ca ON kf.user_id = ca.client_id
LEFT JOIN
    public.user_profiles admin_up ON ca.admin_id = admin_up.id
WHERE
    up.role = 'user';  -- Only show clients, not admins

-- =============================================================================
-- 11. GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION can_send_demo_email(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION can_send_launch_email(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_email_send(uuid, text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;

-- Grant table permissions
GRANT ALL ON public.manual_email_sends TO authenticated, service_role;

-- Grant permissions on the view
GRANT SELECT ON public.projects_view TO authenticated, service_role;

-- Grant usage on enum types
GRANT USAGE ON TYPE project_status_enum TO authenticated, service_role;
GRANT USAGE ON TYPE payment_status_enum TO authenticated, service_role;
GRANT USAGE ON TYPE user_role_enum TO authenticated, service_role;

-- Grant table permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant full access to service role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================

-- This script has created/configured:
-- ✅ All required tables with proper structure
-- ✅ Manual email tracking system (no automatic triggers)
-- ✅ User roles and admin functionality
-- ✅ Proper RLS policies for security
-- ✅ Helper functions for email eligibility checking
-- ✅ Comprehensive projects view for admin dashboard
-- ✅ Indexes for performance
-- ✅ Service role access for API operations

-- MANUAL EMAIL SYSTEM:
-- ✅ Tracks when emails are sent manually by admins
-- ✅ Prevents duplicate sends unless conditions change
-- ✅ Functions to check if emails can be sent:
--     - can_send_demo_email(user_id) - when all 3 demo URLs filled
--     - can_send_launch_email(user_id) - when project status = 'live'
-- ✅ Function to record email sends: record_email_send(user_id, type, admin_id)

-- NO AUTOMATIC TRIGGERS - ALL EMAIL SENDING IS MANUAL VIA ADMIN DASHBOARD

SELECT 'Complete Database Setup Finished Successfully!' as status;
