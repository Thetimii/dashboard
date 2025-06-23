-- Create followup_questionnaires table with all required fields
-- This table stores detailed questionnaire responses from users after they have paid

CREATE TABLE IF NOT EXISTS public.followup_questionnaires (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- Step 1: Business Core
  core_business text,
  revenue_generation text,
  main_product_service text,
  secondary_revenue text,
  long_term_revenue text,
  
  -- Step 2: USPs & Competitive Advantages
  unique_selling_points text,
  customer_choice_reasons text,
  problems_solved text,
  trust_building text,
  company_market_since integer,
  references_customer_count text,
  special_services_support text,
  potential_objections text,
  main_competitors text,
  
  -- Step 3: Target Group Analysis
  target_group_demographics text,
  target_group_needs text,
  
  -- Step 4: Content & Media
  service_subpages boolean DEFAULT false,
  service_subpages_details text,
  existing_content boolean DEFAULT false,
  existing_content_details text,
  existing_content_files text[],
  blog_needed boolean DEFAULT false,
  blog_topics text,
  
  -- Step 5: Website Functions
  ecommerce_needed boolean DEFAULT false,
  ecommerce_details text,
  newsletter_needed boolean DEFAULT false,
  member_area_needed boolean DEFAULT false,
  member_area_details text,
  social_media_needed boolean DEFAULT false,
  whatsapp_chat_needed boolean DEFAULT false,
  appointment_booking boolean DEFAULT false,
  appointment_tool text,
  existing_seo_keywords text,
  google_analytics_needed boolean DEFAULT false,
  
  -- Step 6: Domain & Hosting
  desired_domain text,
  
  -- Step 7: Legal Requirements & Contact Data
  privacy_policy_exists boolean DEFAULT false,
  privacy_policy_creation_needed boolean DEFAULT false,
  privacy_policy_content text,
  company_address text,
  company_phone text,
  company_email text,
  vat_id text,
  
  -- Meta fields
  completed boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  
  CONSTRAINT followup_questionnaires_pkey PRIMARY KEY (id),
  CONSTRAINT followup_questionnaires_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.followup_questionnaires ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own questionnaires"
ON public.followup_questionnaires
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaires"
ON public.followup_questionnaires
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaires"
ON public.followup_questionnaires
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_user_id ON public.followup_questionnaires(user_id);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_completed ON public.followup_questionnaires(completed);

-- Add comments for documentation
COMMENT ON TABLE public.followup_questionnaires IS 'Detailed questionnaire responses collected after user payment';
COMMENT ON COLUMN public.followup_questionnaires.user_id IS 'Reference to the authenticated user';
COMMENT ON COLUMN public.followup_questionnaires.completed IS 'Whether the questionnaire has been fully completed';
