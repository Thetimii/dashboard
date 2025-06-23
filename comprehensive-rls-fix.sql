-- Comprehensive RLS and database fix for demo_links and related tables
-- This addresses the 406 errors and React hydration issues

-- 1. First, let's ensure the demo_links table exists with proper structure
CREATE TABLE IF NOT EXISTS public.demo_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    option_1_url text,
    option_2_url text,
    option_3_url text,
    approved_option text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Add unique constraint to prevent duplicate entries per user
ALTER TABLE public.demo_links 
DROP CONSTRAINT IF EXISTS demo_links_user_id_unique;

ALTER TABLE public.demo_links 
ADD CONSTRAINT demo_links_user_id_unique UNIQUE (user_id);

-- 3. Enable RLS
ALTER TABLE public.demo_links ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Users can insert their own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Users can update their own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Users can upsert their own demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Admins can view all demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Admins can update all demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Admins can insert demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Service role can manage demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Service role full access demo_links" ON public.demo_links;

-- 5. Create comprehensive RLS policies
-- Users can view their own demo links
CREATE POLICY "Users can view their own demo links" ON public.demo_links
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own demo links
CREATE POLICY "Users can insert their own demo links" ON public.demo_links
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own demo links
CREATE POLICY "Users can update their own demo links" ON public.demo_links
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all demo links (check for admin role in user_profiles)
CREATE POLICY "Admins can view all demo links" ON public.demo_links
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Admins can insert demo links for any user
CREATE POLICY "Admins can insert demo links" ON public.demo_links
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Admins can update all demo links
CREATE POLICY "Admins can update all demo links" ON public.demo_links
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Service role can manage all demo links (bypasses RLS)
CREATE POLICY "Service role can manage demo links" ON public.demo_links
    FOR ALL
    USING (current_setting('role') = 'service_role')
    WITH CHECK (current_setting('role') = 'service_role');

-- 6. Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION public.update_demo_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_demo_links_updated_at ON public.demo_links;
CREATE TRIGGER update_demo_links_updated_at
    BEFORE UPDATE ON public.demo_links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_demo_links_updated_at();

-- 7. Fix project_status table RLS as well
ALTER TABLE public.project_status ENABLE ROW LEVEL SECURITY;

-- Drop existing project_status policies
DROP POLICY IF EXISTS "Users can view their own project status" ON public.project_status;
DROP POLICY IF EXISTS "Users can insert their own project status" ON public.project_status;
DROP POLICY IF EXISTS "Users can update their own project status" ON public.project_status;
DROP POLICY IF EXISTS "Admins can view all project status" ON public.project_status;
DROP POLICY IF EXISTS "Admins can update all project status" ON public.project_status;
DROP POLICY IF EXISTS "Service role can manage project status" ON public.project_status;

-- Create project_status RLS policies
CREATE POLICY "Users can view their own project status" ON public.project_status
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project status" ON public.project_status
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project status" ON public.project_status
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all project status" ON public.project_status
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all project status" ON public.project_status
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage project status" ON public.project_status
    FOR ALL
    USING (current_setting('role') = 'service_role')
    WITH CHECK (current_setting('role') = 'service_role');

-- 8. Add unique constraint to project_status as well
ALTER TABLE public.project_status 
DROP CONSTRAINT IF EXISTS project_status_user_id_unique;

ALTER TABLE public.project_status 
ADD CONSTRAINT project_status_user_id_unique UNIQUE (user_id);

-- 9. Create updated_at trigger for project_status
CREATE OR REPLACE FUNCTION public.update_project_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_status_updated_at ON public.project_status;
CREATE TRIGGER update_project_status_updated_at
    BEFORE UPDATE ON public.project_status
    FOR EACH ROW
    EXECUTE FUNCTION public.update_project_status_updated_at();

-- 10. Grant necessary permissions
GRANT ALL ON public.demo_links TO authenticated;
GRANT ALL ON public.project_status TO authenticated;
GRANT ALL ON public.demo_links TO service_role;
GRANT ALL ON public.project_status TO service_role;

-- 11. Test that we can query the tables
SELECT 'demo_links RLS test' as test_name, COUNT(*) as count FROM public.demo_links;
SELECT 'project_status RLS test' as test_name, COUNT(*) as count FROM public.project_status;
