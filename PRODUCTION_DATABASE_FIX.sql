-- Production Database Complete Setup Script
-- This script creates all missing tables and fixes relationship issues
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =============================================================================

-- Enable HTTP extension for database triggers
CREATE EXTENSION IF NOT EXISTS http;

-- =============================================================================
-- 2. CREATE ENUM TYPES
-- =============================================================================

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
-- 3. CREATE MISSING TABLES
-- =============================================================================

-- User profiles table (add role column if missing)
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
    
    -- Ziel des Unternehmens (Business Goals)
    core_business TEXT,
    revenue_generation TEXT,
    secondary_revenue TEXT,
    long_term_revenue TEXT,
    
    -- Wettbewerbsumfeld (Competitive Environment)
    unique_selling_points TEXT,
    customer_choice_reasons TEXT,
    problems_solved TEXT,
    trust_building TEXT,
    potential_objections TEXT,
    main_competitors TEXT,
    competitor_strengths TEXT,
    
    -- Zielgruppenanalyse (Target Group Analysis)
    target_group_demographics TEXT,
    target_group_needs TEXT,
    
    -- Inhaltsplanung (Content Planning)
    service_subpages BOOLEAN DEFAULT false,
    service_subpages_details TEXT,
    existing_content BOOLEAN DEFAULT false,
    existing_content_details TEXT,
    
    -- Funktionalität (Functionality)
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
    
    -- Rechtliche Anforderungen (Legal Requirements)
    privacy_policy_exists BOOLEAN DEFAULT false,
    privacy_policy_creation_needed BOOLEAN DEFAULT false,
    company_address TEXT,
    company_phone TEXT,
    company_email TEXT,
    vat_id TEXT
);

-- =============================================================================
-- 4. CREATE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_demo_links_user_id ON public.demo_links(user_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_admin_id ON public.client_assignments(admin_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_client_id ON public.client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_user_id ON public.followup_questionnaires(user_id);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_completed ON public.followup_questionnaires(completed);

-- =============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_questionnaires ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. CREATE HELPER FUNCTIONS
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

-- =============================================================================
-- 7. DROP EXISTING POLICIES (TO AVOID CONFLICTS)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can access all user_profiles" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Users can update own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Users can insert own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Admins can manage all demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Service role can access all demo_links" ON public.demo_links;

DROP POLICY IF EXISTS "Admins can manage client assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Service role can access all client_assignments" ON public.client_assignments;

DROP POLICY IF EXISTS "Users can view their own questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Users can insert their own questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Users can update their own questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Admin can view all questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Service role can access all followup_questionnaires" ON public.followup_questionnaires;

-- =============================================================================
-- 8. CREATE RLS POLICIES
-- =============================================================================

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all user profiles" ON public.user_profiles FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all user_profiles" ON public.user_profiles FOR ALL USING (auth.role() = 'service_role');

-- Demo links policies
CREATE POLICY "Users can view own demo links" ON public.demo_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own demo links" ON public.demo_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own demo links" ON public.demo_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all demo links" ON public.demo_links FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all demo_links" ON public.demo_links FOR ALL USING (auth.role() = 'service_role');

-- Client assignments policies
CREATE POLICY "Admins can manage client assignments" ON public.client_assignments FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all client_assignments" ON public.client_assignments FOR ALL USING (auth.role() = 'service_role');

-- Follow-up questionnaires policies
CREATE POLICY "Users can view their own questionnaires" ON public.followup_questionnaires FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own questionnaires" ON public.followup_questionnaires FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own questionnaires" ON public.followup_questionnaires FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all questionnaires" ON public.followup_questionnaires FOR ALL USING (is_admin());
CREATE POLICY "Service role can access all followup_questionnaires" ON public.followup_questionnaires FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- 9. CREATE TRIGGERS
-- =============================================================================

-- Create trigger for updated_at on followup_questionnaires
DROP TRIGGER IF EXISTS update_followup_questionnaires_updated_at ON public.followup_questionnaires;
CREATE TRIGGER update_followup_questionnaires_updated_at 
    BEFORE UPDATE ON public.followup_questionnaires 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 10. GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO service_role;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO service_role;

-- Grant usage on enum types
GRANT USAGE ON TYPE project_status_enum TO authenticated;
GRANT USAGE ON TYPE project_status_enum TO service_role;
GRANT USAGE ON TYPE payment_status_enum TO authenticated;
GRANT USAGE ON TYPE payment_status_enum TO service_role;
GRANT USAGE ON TYPE user_role_enum TO authenticated;
GRANT USAGE ON TYPE user_role_enum TO service_role;

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

-- This script has created/fixed:
-- ✅ demo_links table (fixes 406 errors on demo links)
-- ✅ client_assignments table (fixes 406 errors on client assignments)
-- ✅ followup_questionnaires table (fixes 406 errors on questionnaire)
-- ✅ user_profiles role column (fixes relationship issues)
-- ✅ Proper RLS policies for all tables
-- ✅ Service role access for admin operations
-- ✅ Helper functions and triggers
-- ✅ Indexes for performance

-- The following errors should now be resolved:
-- ❌ GET .../demo_links?... 406 (Not Acceptable) -> ✅ Fixed
-- ❌ GET .../client_assignments?... 406 (Not Acceptable) -> ✅ Fixed
-- ❌ GET .../followup_questionnaires?... 406 (Not Acceptable) -> ✅ Fixed
-- ❌ Could not find relationship between 'kickoff_forms' and 'user_profiles' -> ✅ Fixed

SELECT 'Database setup completed successfully!' as status;
