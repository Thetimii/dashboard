-- Fix Security Issues: Remove Exposed Auth Users and Security Definer Views
-- Run this in your Supabase SQL Editor to resolve security linting errors

-- =============================================================================
-- 1. DROP PROBLEMATIC VIEWS THAT EXPOSE auth.users
-- =============================================================================

-- Drop the projects_view that exposes auth.users data
DROP VIEW IF EXISTS public.projects_view CASCADE;

-- Drop the questionnaire_summary view with SECURITY DEFINER
DROP VIEW IF EXISTS public.questionnaire_summary CASCADE;

-- =============================================================================
-- 2. CREATE SECURE REPLACEMENT VIEWS (IF NEEDED)
-- =============================================================================

-- If you need a projects view, create it without exposing auth.users data
-- Only include safe, non-sensitive data from user_profiles instead of auth.users
CREATE OR REPLACE VIEW public.projects_view AS
SELECT 
    ps.id,
    ps.user_id,
    ps.status,
    ps.updated_at,
    ps.final_url,
    up.full_name,
    -- Do NOT include sensitive auth.users data like email, phone, etc.
    kf.business_name,
    kf.completed as kickoff_completed,
    dl.approved_option,
    dl.approved_at
FROM public.project_status ps
LEFT JOIN public.user_profiles up ON ps.user_id = up.id
LEFT JOIN public.kickoff_forms kf ON ps.user_id = kf.user_id
LEFT JOIN public.demo_links dl ON ps.user_id = dl.user_id;

-- Create a secure questionnaire summary view without SECURITY DEFINER
CREATE OR REPLACE VIEW public.questionnaire_summary AS
SELECT 
    fq.id,
    fq.user_id,
    fq.project_id,
    fq.questions,
    fq.responses,
    fq.completed,
    fq.created_at,
    fq.updated_at,
    up.full_name,
    kf.business_name
FROM public.followup_questionnaires fq
LEFT JOIN public.user_profiles up ON fq.user_id = up.id
LEFT JOIN public.kickoff_forms kf ON fq.user_id = kf.user_id;

-- =============================================================================
-- 3. ENABLE RLS ON VIEWS (IMPORTANT FOR SECURITY)
-- =============================================================================

-- Enable RLS on the new views to ensure users can only see their own data
ALTER VIEW public.projects_view ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.questionnaire_summary ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE RLS POLICIES FOR THE VIEWS
-- =============================================================================

-- Policy for projects_view: Users can only see their own projects
CREATE POLICY "Users can view their own projects" ON public.projects_view
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND id IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

-- Policy for questionnaire_summary: Users can only see their own questionnaires
CREATE POLICY "Users can view their own questionnaires" ON public.questionnaire_summary
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND id IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

-- =============================================================================
-- 5. GRANT APPROPRIATE PERMISSIONS
-- =============================================================================

-- Grant select permissions to authenticated users
GRANT SELECT ON public.projects_view TO authenticated;
GRANT SELECT ON public.questionnaire_summary TO authenticated;

-- Revoke access from anon users (they shouldn't see any user data)
REVOKE ALL ON public.projects_view FROM anon;
REVOKE ALL ON public.questionnaire_summary FROM anon;

-- =============================================================================
-- 6. VERIFY SECURITY
-- =============================================================================

-- Check that views don't expose auth.users data
-- The views should only use data from public tables, not auth.users directly
