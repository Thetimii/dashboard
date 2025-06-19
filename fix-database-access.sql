-- Complete Database Setup & Fix for 406 Errors
-- Run this in your Supabase SQL Editor to fix all access issues

-- 1. Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Ensure followup_questionnaires table exists with proper structure
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

-- Create indexes for followup_questionnaires
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_user_id on public.followup_questionnaires using btree (user_id);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_completed on public.followup_questionnaires using btree (completed);

-- Create trigger for followup_questionnaires
DROP TRIGGER IF EXISTS update_followup_questionnaires_updated_at ON public.followup_questionnaires;
CREATE TRIGGER update_followup_questionnaires_updated_at 
  BEFORE UPDATE ON public.followup_questionnaires 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Create payment_status_enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE public.payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled');
    END IF;
END $$;

-- 4. Ensure payments table exists with proper structure  
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  stripe_payment_id text null,
  amount numeric null,
  status public.payment_status_enum null default 'pending'::payment_status_enum,
  created_at timestamp without time zone null default now(),
  stripe_customer_id text null,
  subscription_id text null,
  subscription_status text null default ''::text,
  cancel_at_period_end boolean null default false,
  canceled_at timestamp with time zone null,
  cancellation_reason text null,
  constraint payments_pkey primary key (id),
  constraint payments_user_id_fkey foreign KEY (user_id) references auth.users (id)
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_id ON public.payments(stripe_payment_id);

-- 5. Enable Row Level Security on both tables
ALTER TABLE public.followup_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for followup_questionnaires

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Admins can access all questionnaires" ON public.followup_questionnaires;
DROP POLICY IF EXISTS "Service role can access all questionnaires" ON public.followup_questionnaires;

-- Create comprehensive policies
CREATE POLICY "Users can manage their own questionnaires" ON public.followup_questionnaires
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can access all questionnaires" ON public.followup_questionnaires
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can access all questionnaires" ON public.followup_questionnaires 
  FOR ALL USING (auth.role() = 'service_role');

-- 7. Create RLS policies for payments

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can access all payments" ON public.payments;

-- Create comprehensive policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can access all payments" ON public.payments 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 8. Grant necessary permissions
GRANT ALL ON public.followup_questionnaires TO authenticated, service_role;
GRANT ALL ON public.payments TO authenticated, service_role;
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- 9. Create manual_email_sends table for email tracking
CREATE TABLE IF NOT EXISTS public.manual_email_sends (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type text NOT NULL CHECK (email_type IN ('demo_ready', 'website_launch')),
    sent_at timestamp with time zone DEFAULT now(),
    sent_by uuid REFERENCES auth.users(id),
    trigger_values jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for manual_email_sends
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_user_id ON public.manual_email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_type ON public.manual_email_sends(email_type);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_sent_at ON public.manual_email_sends(sent_at);

-- Enable Row Level Security for manual_email_sends
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for manual_email_sends
DROP POLICY IF EXISTS "Admins can manage all email sends" ON public.manual_email_sends;
DROP POLICY IF EXISTS "Service role can access all email sends" ON public.manual_email_sends;

CREATE POLICY "Admins can manage all email sends" ON public.manual_email_sends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can access all email sends" ON public.manual_email_sends 
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions for manual_email_sends
GRANT ALL ON public.manual_email_sends TO authenticated, service_role;

-- 10. Verify tables were created successfully
SELECT 
  'followup_questionnaires' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'followup_questionnaires') 
    THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'payments' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') 
    THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'manual_email_sends' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'manual_email_sends') 
    THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Final confirmation
SELECT 'Database setup complete! All tables created with proper RLS policies.' as result;
