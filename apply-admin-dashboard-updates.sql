-- Admin Dashboard Database Updates
-- Run this script in your Supabase SQL Editor to apply all necessary updates
-- for the comprehensive admin dashboard functionality

-- =============================================================================
-- 1. ENSURE USER ROLE ENUM EXISTS
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE public.user_role_enum AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- 2. ADD ROLE COLUMN TO USER_PROFILES (IF NOT EXISTS)
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN role public.user_role_enum NOT NULL DEFAULT 'user';
        RAISE NOTICE 'Column "role" added to "user_profiles".';
    ELSE
        RAISE NOTICE 'Column "role" already exists in "user_profiles".';
    END IF;
END $$;

-- =============================================================================
-- 3. CREATE CLIENT ASSIGNMENTS TABLE (IF NOT EXISTS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.client_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    created_at timestamp without time zone NULL DEFAULT now(),
    updated_at timestamp without time zone NULL DEFAULT now(),
    CONSTRAINT client_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT client_assignments_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users (id),
    CONSTRAINT client_assignments_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users (id),
    CONSTRAINT unique_client_assignment UNIQUE (client_id)
);

-- =============================================================================
-- 4. CREATE/UPDATE COMPREHENSIVE PROJECTS VIEW
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
-- 5. ENSURE PROPER PERMISSIONS
-- =============================================================================
-- Grant permissions on the view
GRANT SELECT ON public.projects_view TO authenticated;
GRANT SELECT ON public.projects_view TO service_role;

-- Grant permissions on client_assignments table
GRANT ALL ON public.client_assignments TO authenticated;
GRANT ALL ON public.client_assignments TO service_role;

-- Create admin helper function if it doesn't exist
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

-- Grant execute permissions on admin function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO service_role;

-- =============================================================================
-- 6. ROW LEVEL SECURITY POLICIES FOR CLIENT ASSIGNMENTS
-- =============================================================================
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can manage client assignments" ON public.client_assignments;

-- Create policies for client assignments
CREATE POLICY "Admins can manage client assignments" ON public.client_assignments FOR ALL USING (is_admin());

-- =============================================================================
-- 7. AUTO-CREATE USER PROFILES FOR NEW USERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to ensure it's properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
-- Your admin dashboard is now configured with:
-- ✅ User role management (user/admin)
-- ✅ Client assignment system
-- ✅ Comprehensive projects view (clients only)
-- ✅ Proper permissions and RLS policies
-- ✅ Automatic profile creation for new users

SELECT 'Admin Dashboard Database Updates Applied Successfully!' as status;
