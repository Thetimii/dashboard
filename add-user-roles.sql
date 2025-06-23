-- Add user roles enum and update user_profiles table
-- This migration adds support for admin and user roles

-- Create user role enum
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'user',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to user_profiles if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.user_profiles 
    ADD COLUMN role user_role_enum NOT NULL DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles USING btree (role);

-- Add RLS policies for admin access (avoiding infinite recursion)
-- First, drop any existing conflicting policies
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all kickoff forms" ON public.kickoff_forms;
DROP POLICY IF EXISTS "Admins can update kickoff forms" ON public.kickoff_forms;
DROP POLICY IF EXISTS "Admins can view all project status" ON public.project_status;
DROP POLICY IF EXISTS "Admins can update project status" ON public.project_status;
DROP POLICY IF EXISTS "Admins can view all demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Admins can update demo links" ON public.demo_links;
DROP POLICY IF EXISTS "Admins can view all followup questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all client assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Admins can create client assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Admins can update client assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Admins can delete client assignments" ON public.client_assignments;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles 
FOR UPDATE USING (auth.uid() = id);

-- Service role can access everything (for admin operations via API)
CREATE POLICY "Service role full access user_profiles" ON public.user_profiles 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access kickoff_forms" ON public.kickoff_forms 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access project_status" ON public.project_status 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access demo_links" ON public.demo_links 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access followup_questionnaires" ON public.followup_questionnaires 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access payments" ON public.payments 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access client_assignments" ON public.client_assignments 
FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own kickoff forms
CREATE POLICY "Users can view own kickoff forms" ON public.kickoff_forms 
FOR SELECT USING (auth.uid() = user_id);

-- Users can create and update their own kickoff forms
CREATE POLICY "Users can manage own kickoff forms" ON public.kickoff_forms 
FOR ALL USING (auth.uid() = user_id);

-- Users can view their own project status
CREATE POLICY "Users can view own project status" ON public.project_status 
FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own demo links
CREATE POLICY "Users can view own demo links" ON public.demo_links 
FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own followup questionnaires
CREATE POLICY "Users can view own followup questionnaires" ON public.followup_questionnaires 
FOR SELECT USING (auth.uid() = user_id);

-- Users can create and update their own followup questionnaires
CREATE POLICY "Users can manage own followup questionnaires" ON public.followup_questionnaires 
FOR ALL USING (auth.uid() = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments 
FOR SELECT USING (auth.uid() = user_id);

-- Users can view client assignments where they are the client
CREATE POLICY "Users can view own client assignments" ON public.client_assignments 
FOR SELECT USING (auth.uid() = client_id);
