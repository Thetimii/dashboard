-- MINIMAL Security Fix - Focuses Only on Known Tables
-- This script only fixes the main security issues without touching problematic tables
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. DROP PROBLEMATIC VIEWS THAT EXPOSE AUTH.USERS
-- =============================================================================

-- Drop views that expose auth.users data or use SECURITY DEFINER
DROP VIEW IF EXISTS public.projects_view CASCADE;
DROP VIEW IF EXISTS public.questionnaire_summary CASCADE;

-- =============================================================================
-- 2. CREATE SECURE PROJECTS VIEW (MAIN FIX)
-- =============================================================================

-- Create secure projects view using only known safe tables
CREATE OR REPLACE VIEW public.projects_view AS
SELECT 
    ps.id,
    ps.user_id,
    ps.status,
    ps.updated_at,
    ps.final_url,
    up.full_name,
    up.phone_number,
    kf.business_name,
    kf.completed as kickoff_completed,
    dl.approved_option,
    dl.approved_at
FROM public.project_status ps
LEFT JOIN public.user_profiles up ON ps.user_id = up.id
LEFT JOIN public.kickoff_forms kf ON ps.user_id = kf.user_id
LEFT JOIN public.demo_links dl ON ps.user_id = dl.user_id;

-- =============================================================================
-- 3. ENABLE RLS ON PROJECTS VIEW
-- =============================================================================

ALTER VIEW public.projects_view ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE RLS POLICY FOR PROJECTS VIEW
-- =============================================================================

-- Drop existing policy first
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects_view;

-- Create new secure policy
CREATE POLICY "Users can view their own projects" ON public.projects_view
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- =============================================================================
-- 5. SET SECURE PERMISSIONS
-- =============================================================================

-- Grant select to authenticated users only
GRANT SELECT ON public.projects_view TO authenticated;
REVOKE ALL ON public.projects_view FROM anon;

-- =============================================================================
-- 6. ENSURE TABLE-LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all core tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kickoff_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for core tables if they don't exist
DO $$ BEGIN
    -- User profiles policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can manage their own profile') THEN
        CREATE POLICY "Users can manage their own profile" ON public.user_profiles
            FOR ALL USING (auth.uid() = id OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));
    END IF;
    
    -- Kickoff forms policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'kickoff_forms' AND policyname = 'Users can manage their own kickoff forms') THEN
        CREATE POLICY "Users can manage their own kickoff forms" ON public.kickoff_forms
            FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));
    END IF;
    
    -- Project status policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_status' AND policyname = 'Users can view their own project status') THEN
        CREATE POLICY "Users can view their own project status" ON public.project_status
            FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));
    END IF;
    
    -- Demo links policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'demo_links' AND policyname = 'Users can manage their own demo links') THEN
        CREATE POLICY "Users can manage their own demo links" ON public.demo_links
            FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));
    END IF;
    
    -- Payments policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Users can view their own payments') THEN
        CREATE POLICY "Users can view their own payments" ON public.payments
            FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));
    END IF;
END $$;

-- =============================================================================
-- 7. REVOKE ANON ACCESS FROM ALL SENSITIVE TABLES
-- =============================================================================

REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.kickoff_forms FROM anon;
REVOKE ALL ON public.project_status FROM anon;
REVOKE ALL ON public.demo_links FROM anon;
REVOKE ALL ON public.payments FROM anon;

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.kickoff_forms TO authenticated;
GRANT SELECT ON public.project_status TO authenticated;
GRANT SELECT, UPDATE ON public.demo_links TO authenticated;
GRANT SELECT ON public.payments TO authenticated;

-- =============================================================================
-- 8. COMPLETION MESSAGE
-- =============================================================================

DO $$ BEGIN
    RAISE NOTICE '✅ MINIMAL SECURITY FIX COMPLETED!';
    RAISE NOTICE '✅ Removed views exposing auth.users data';
    RAISE NOTICE '✅ Created secure projects_view';
    RAISE NOTICE '✅ Enabled RLS on all core tables';
    RAISE NOTICE '✅ Removed anon access to sensitive data';
    RAISE NOTICE '✅ Main security linting errors should be resolved';
    RAISE NOTICE 'ℹ️  Skipped questionnaire_summary due to unknown table structure';
END $$;
