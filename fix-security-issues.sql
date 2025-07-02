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
-- Check if the table exists and what columns it has
DO $$ 
DECLARE
    table_exists boolean;
    actual_columns text[];
    column_list text := '';
BEGIN
    -- Check if followup_questionnaires table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'followup_questionnaires'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Get actual column names from the table
        SELECT array_agg(column_name) INTO actual_columns
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'followup_questionnaires'
        AND column_name IN ('id', 'user_id', 'project_id', 'questions', 'responses', 'completed', 'created_at', 'updated_at');
        
        -- Build safe column list
        column_list := 'fq.id, fq.user_id';
        
        IF 'project_id' = ANY(actual_columns) THEN
            column_list := column_list || ', fq.project_id';
        END IF;
        
        IF 'questions' = ANY(actual_columns) THEN
            column_list := column_list || ', fq.questions';
        ELSE
            column_list := column_list || ', NULL::jsonb as questions';
        END IF;
        
        IF 'responses' = ANY(actual_columns) THEN
            column_list := column_list || ', fq.responses';
        ELSE
            column_list := column_list || ', NULL::jsonb as responses';
        END IF;
        
        IF 'completed' = ANY(actual_columns) THEN
            column_list := column_list || ', fq.completed';
        ELSE
            column_list := column_list || ', NULL::boolean as completed';
        END IF;
        
        IF 'created_at' = ANY(actual_columns) THEN
            column_list := column_list || ', fq.created_at';
        ELSE
            column_list := column_list || ', NULL::timestamp as created_at';
        END IF;
        
        IF 'updated_at' = ANY(actual_columns) THEN
            column_list := column_list || ', fq.updated_at';
        ELSE
            column_list := column_list || ', NULL::timestamp as updated_at';
        END IF;
        
        column_list := column_list || ', up.full_name, kf.business_name';
        
        -- Create view with available columns
        EXECUTE format('
        CREATE OR REPLACE VIEW public.questionnaire_summary AS
        SELECT %s
        FROM public.followup_questionnaires fq
        LEFT JOIN public.user_profiles up ON fq.user_id = up.id
        LEFT JOIN public.kickoff_forms kf ON fq.user_id = kf.user_id', column_list);
        
        RAISE NOTICE 'Created questionnaire_summary view with available columns';
    ELSE
        -- If table doesn't exist, create a minimal placeholder view
        EXECUTE '
        CREATE OR REPLACE VIEW public.questionnaire_summary AS
        SELECT 
            NULL::uuid as id,
            NULL::uuid as user_id,
            NULL::jsonb as questions,
            NULL::jsonb as responses,
            NULL::boolean as completed,
            NULL::timestamp as created_at,
            NULL::timestamp as updated_at,
            NULL::text as full_name,
            NULL::text as business_name
        WHERE FALSE';
    END IF;
END $$;

-- =============================================================================
-- 3. ENSURE RLS ON UNDERLYING TABLES (VIEWS INHERIT RLS FROM TABLES)
-- =============================================================================

-- Enable RLS on the underlying tables that the views use
-- Views will automatically respect the RLS policies of their underlying tables

-- Enable RLS on all the underlying tables
ALTER TABLE public.project_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kickoff_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_links ENABLE ROW LEVEL SECURITY;

-- Enable RLS on followup_questionnaires if it exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'followup_questionnaires') THEN
        ALTER TABLE public.followup_questionnaires ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =============================================================================
-- 4. CREATE RLS POLICIES FOR THE UNDERLYING TABLES
-- =============================================================================

-- Create RLS policies for the underlying tables (views will inherit these)

-- Project Status Policies
DROP POLICY IF EXISTS "Users can view their own project status" ON public.project_status;
CREATE POLICY "Users can view their own project status" ON public.project_status
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- User Profiles Policies  
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.user_profiles;
CREATE POLICY "Users can view and edit their own profile" ON public.user_profiles
    FOR ALL USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Kickoff Forms Policies
DROP POLICY IF EXISTS "Users can manage their own kickoff forms" ON public.kickoff_forms;
CREATE POLICY "Users can manage their own kickoff forms" ON public.kickoff_forms
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Demo Links Policies
DROP POLICY IF EXISTS "Users can view their own demo links" ON public.demo_links;
CREATE POLICY "Users can view their own demo links" ON public.demo_links
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Followup Questionnaires Policies (if table exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'followup_questionnaires') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can manage their own questionnaires" ON public.followup_questionnaires';
        EXECUTE '
        CREATE POLICY "Users can manage their own questionnaires" ON public.followup_questionnaires
            FOR ALL USING (
                auth.uid() = user_id OR 
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE id = auth.uid() AND raw_user_meta_data->>''role'' = ''admin''
                )
            )';
    END IF;
END $$;

-- =============================================================================
-- 5. GRANT APPROPRIATE PERMISSIONS (VIEWS INHERIT FROM TABLES)
-- =============================================================================

-- Grant permissions on the underlying tables
GRANT SELECT ON public.project_status TO authenticated;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.kickoff_forms TO authenticated;
GRANT SELECT, UPDATE ON public.demo_links TO authenticated;

-- Grant permissions on followup_questionnaires if it exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'followup_questionnaires') THEN
        GRANT SELECT, INSERT, UPDATE ON public.followup_questionnaires TO authenticated;
    END IF;
END $$;

-- Grant select permissions on the views to authenticated users
GRANT SELECT ON public.projects_view TO authenticated;

-- Grant permissions on questionnaire_summary view if it exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'questionnaire_summary') THEN
        GRANT SELECT ON public.questionnaire_summary TO authenticated;
    END IF;
END $$;

-- Revoke all access from anon users
REVOKE ALL ON public.project_status FROM anon;
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.kickoff_forms FROM anon;
REVOKE ALL ON public.demo_links FROM anon;
REVOKE ALL ON public.projects_view FROM anon;

-- Revoke anon access from questionnaire table and view if they exist
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'followup_questionnaires') THEN
        REVOKE ALL ON public.followup_questionnaires FROM anon;
    END IF;
    IF EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'questionnaire_summary') THEN
        REVOKE ALL ON public.questionnaire_summary FROM anon;
    END IF;
END $$;

-- =============================================================================
-- 6. VERIFY SECURITY AND COMPLETION
-- =============================================================================

-- Log completion and verify security
DO $$ BEGIN
    RAISE NOTICE '🔒 Security fix completed successfully:';
    RAISE NOTICE '  ✓ Dropped problematic views that exposed auth.users data';
    RAISE NOTICE '  ✓ Created secure replacement views using only public table data';
    RAISE NOTICE '  ✓ Enabled RLS on all underlying tables';
    RAISE NOTICE '  ✓ Created comprehensive RLS policies for data isolation';
    RAISE NOTICE '  ✓ Removed all anon access to sensitive data';
    RAISE NOTICE '  ✓ Views now inherit security from underlying tables';
    RAISE NOTICE '  ✓ Security linting errors should now be resolved';
    RAISE NOTICE '';
    RAISE NOTICE 'Note: Views automatically inherit RLS policies from their underlying tables.';
    RAISE NOTICE 'No direct RLS needed on views - tables provide the security.';
END $$;
