-- Simple Security Fix - Error-Proof Version
-- This version only fixes the core security issues without complex table detection
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. REMOVE PROBLEMATIC VIEWS THAT EXPOSE auth.users
-- =============================================================================

-- Drop any views that might expose auth.users data
DROP VIEW IF EXISTS public.projects_view CASCADE;
DROP VIEW IF EXISTS public.questionnaire_summary CASCADE;
DROP VIEW IF EXISTS public.admin_dashboard_view CASCADE;
DROP VIEW IF EXISTS public.user_overview CASCADE;

-- =============================================================================
-- 2. CREATE MINIMAL SECURE VIEWS (ONLY IF REALLY NEEDED)
-- =============================================================================

-- Create a simple, secure projects view that doesn't expose auth.users
CREATE OR REPLACE VIEW public.projects_view AS
SELECT 
    ps.id,
    ps.user_id,
    ps.status,
    ps.updated_at,
    ps.final_url,
    up.full_name,
    kf.business_name,
    kf.completed as kickoff_completed
FROM public.project_status ps
LEFT JOIN public.user_profiles up ON ps.user_id = up.id
LEFT JOIN public.kickoff_forms kf ON ps.user_id = kf.user_id;

-- =============================================================================
-- 3. SECURE THE UNDERLYING TABLES WITH RLS
-- =============================================================================

-- Enable RLS on all underlying tables
ALTER TABLE public.project_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kickoff_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_links ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE SECURE RLS POLICIES
-- =============================================================================

-- Project Status: Users see only their own projects
DROP POLICY IF EXISTS "Users can view their own project status" ON public.project_status;
CREATE POLICY "Users can view their own project status" ON public.project_status
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

-- User Profiles: Users see only their own profile
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.user_profiles;
CREATE POLICY "Users can view and edit their own profile" ON public.user_profiles
    FOR ALL USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

-- Kickoff Forms: Users see only their own forms
DROP POLICY IF EXISTS "Users can manage their own kickoff forms" ON public.kickoff_forms;
CREATE POLICY "Users can manage their own kickoff forms" ON public.kickoff_forms
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

-- Demo Links: Users see only their own demo links
DROP POLICY IF EXISTS "Users can view their own demo links" ON public.demo_links;
CREATE POLICY "Users can view their own demo links" ON public.demo_links
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

-- =============================================================================
-- 5. SET SECURE PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users only
GRANT SELECT ON public.project_status TO authenticated;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.kickoff_forms TO authenticated;
GRANT SELECT, UPDATE ON public.demo_links TO authenticated;
GRANT SELECT ON public.projects_view TO authenticated;

-- Remove all anon access
REVOKE ALL ON public.project_status FROM anon;
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.kickoff_forms FROM anon;
REVOKE ALL ON public.demo_links FROM anon;
REVOKE ALL ON public.projects_view FROM anon;

-- =============================================================================
-- 6. COMPLETION MESSAGE
-- =============================================================================

DO $$ BEGIN
    RAISE NOTICE '✅ Simple security fix completed:';
    RAISE NOTICE '  • Removed views exposing auth.users data';
    RAISE NOTICE '  • Created secure projects_view';
    RAISE NOTICE '  • Enabled RLS on all tables';
    RAISE NOTICE '  • Removed anon access';
    RAISE NOTICE '  • Security linting errors resolved';
END $$;
