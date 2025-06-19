-- Immediate Fix for 406 Errors - Run this in Supabase SQL Editor NOW
-- This script will fix the database access issues causing the infinite requests

-- 1. Ensure followup_questionnaires table exists with proper structure
CREATE TABLE IF NOT EXISTS public.followup_questionnaires (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  completed boolean null default false,
  core_business text null,
  revenue_generation text null,
  secondary_revenue text null,
  long_term_revenue text null,
  unique_selling_points text null,
  customer_choice_reasons text null,
  problems_solved text null,
  trust_building text null,
  potential_objections text null,
  main_competitors text null,
  competitor_strengths text null,
  target_group_demographics text null,
  target_group_needs text null,
  service_subpages boolean null default false,
  service_subpages_details text null,
  existing_content boolean null default false,
  existing_content_details text null,
  required_functions text[] null,
  ecommerce_needed boolean null default false,
  blog_needed boolean null default false,
  newsletter_needed boolean null default false,
  member_area_needed boolean null default false,
  social_media_needed boolean null default false,
  whatsapp_chat_needed boolean null default false,
  appointment_booking boolean null default false,
  appointment_tool text null,
  existing_seo_keywords text null,
  google_analytics_needed boolean null default false,
  desired_domain text null,
  privacy_policy_exists boolean null default false,
  privacy_policy_creation_needed boolean null default false,
  company_address text null,
  company_phone text null,
  company_email text null,
  vat_id text null,
  constraint followup_questionnaires_pkey primary key (id),
  constraint followup_questionnaires_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
);

-- 2. Enable Row Level Security
ALTER TABLE public.followup_questionnaires ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (in case they conflict)
DROP POLICY IF EXISTS "Users can manage their own questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Admins can access all questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Service role can access all questionnaires" ON public.followup_questionnaires;

-- 4. Create comprehensive RLS policies
CREATE POLICY "Users can manage their own questionnaires" ON public.followup_questionnaires
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can access all questionnaires" ON public.followup_questionnaires 
  FOR ALL USING (auth.role() = 'service_role');

-- 5. Create admin policy (if user_profiles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    EXECUTE 'CREATE POLICY "Admins can access all questionnaires" ON public.followup_questionnaires
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_profiles.id = auth.uid() 
          AND user_profiles.role = ''admin''
        )
      )';
  END IF;
END $$;

-- 6. Grant necessary permissions
GRANT ALL ON public.followup_questionnaires TO authenticated, service_role;
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_user_id on public.followup_questionnaires using btree (user_id);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_completed on public.followup_questionnaires using btree (completed);

-- 8. Verification - Check if table was created successfully
SELECT 
  'followup_questionnaires' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'followup_questionnaires') 
    THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Output success message
SELECT 'Database fix applied successfully! The followup_questionnaires table is now accessible.' as result;
