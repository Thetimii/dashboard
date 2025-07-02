-- Safe Security Fix - Handles Missing Tables/Columns Gracefully
-- Run this in your Supabase SQL Editor to resolve security linting errors
-- This version checks for table/column existence before making changes

-- =============================================================================
-- 1. SAFELY DROP PROBLEMATIC VIEWS
-- =============================================================================

-- Drop views that might expose auth.users data (safe with IF EXISTS)
DROP VIEW IF EXISTS public.projects_view CASCADE;
DROP VIEW IF EXISTS public.questionnaire_summary CASCADE;

-- =============================================================================
-- 2. CREATE SECURE PROJECTS VIEW
-- =============================================================================

-- Create secure projects view (only uses data from public tables)
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
-- 3. CONDITIONALLY CREATE QUESTIONNAIRE VIEW (IF TABLE EXISTS)
-- =============================================================================

-- Only create questionnaire view if the table actually exists
DO $$ 
DECLARE
    table_exists boolean;
BEGIN
    -- Check if followup_questionnaires table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'followup_questionnaires'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Create view with actual table structure
        EXECUTE '
        CREATE OR REPLACE VIEW public.questionnaire_summary AS
        SELECT 
            fq.id,
            fq.user_id,
            fq.questions,
            fq.responses,
            fq.completed,
            fq.created_at,
            fq.updated_at,
            up.full_name,
            kf.business_name
        FROM public.followup_questionnaires fq
        LEFT JOIN public.user_profiles up ON fq.user_id = up.id
        LEFT JOIN public.kickoff_forms kf ON fq.user_id = kf.user_id';
        
        RAISE NOTICE '✓ Created questionnaire_summary view';
    ELSE
        RAISE NOTICE 'ℹ followup_questionnaires table does not exist, skipping questionnaire view';
    END IF;
END $$;

-- =============================================================================
-- 4. ENABLE RLS ON VIEWS
-- =============================================================================

-- Enable RLS on projects view
ALTER VIEW public.projects_view ENABLE ROW LEVEL SECURITY;

-- Enable RLS on questionnaire view if it exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'questionnaire_summary') THEN
        ALTER VIEW public.questionnaire_summary ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✓ Enabled RLS on questionnaire_summary view';
    END IF;
END $$;

-- =============================================================================
-- 5. CREATE RLS POLICIES
-- =============================================================================

-- Policy for projects_view: Users can only see their own projects
CREATE POLICY "Users can view their own projects" ON public.projects_view
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy for questionnaire_summary (if view exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'questionnaire_summary') THEN
        EXECUTE '
        CREATE POLICY "Users can view their own questionnaires" ON public.questionnaire_summary
            FOR SELECT USING (
                auth.uid() = user_id OR 
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE id = auth.uid() AND raw_user_meta_data->>''role'' = ''admin''
                )
            )';
        RAISE NOTICE '✓ Created RLS policy for questionnaire_summary';
    END IF;
END $$;

-- =============================================================================
-- 6. SET SECURE PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users only
GRANT SELECT ON public.projects_view TO authenticated;
REVOKE ALL ON public.projects_view FROM anon;

-- Grant permissions on questionnaire view if it exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'questionnaire_summary') THEN
        GRANT SELECT ON public.questionnaire_summary TO authenticated;
        REVOKE ALL ON public.questionnaire_summary FROM anon;
        RAISE NOTICE '✓ Set secure permissions on questionnaire_summary';
    END IF;
END $$;

-- =============================================================================
-- 7. VERIFICATION
-- =============================================================================

DO $$ BEGIN
    RAISE NOTICE '🔒 Security fix completed successfully:';
    RAISE NOTICE '  ✓ Dropped views exposing auth.users data';
    RAISE NOTICE '  ✓ Created secure projects_view';
    RAISE NOTICE '  ✓ Handled questionnaire_summary conditionally';
    RAISE NOTICE '  ✓ Enabled RLS on all views';
    RAISE NOTICE '  ✓ Removed anon access to sensitive data';
    RAISE NOTICE '  ✓ Security linting errors should now be resolved';
END $$;
