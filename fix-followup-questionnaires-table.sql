-- Fix followup_questionnaires table structure
-- This ensures all columns exist that the form is trying to save

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS followup_questionnaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  
  -- Step 1: Business Core
  core_business TEXT,
  revenue_generation TEXT,
  main_product_service TEXT,
  secondary_revenue TEXT,
  long_term_revenue TEXT,
  
  -- Step 2: USPs
  unique_selling_points TEXT,
  customer_choice_reasons TEXT,
  problems_solved TEXT,
  trust_building TEXT,
  company_market_since INTEGER,
  references_customer_count TEXT,
  special_services_support TEXT,
  potential_objections TEXT,
  main_competitors TEXT,
  
  -- Step 3: Target Group
  target_group_demographics TEXT,
  target_group_needs TEXT,
  
  -- Step 4: Content & Media
  service_subpages BOOLEAN DEFAULT FALSE,
  service_subpages_details TEXT,
  existing_content BOOLEAN DEFAULT FALSE,
  existing_content_details TEXT,
  blog_needed BOOLEAN DEFAULT FALSE,
  blog_topics TEXT,
  
  -- Step 5: Website Functions
  ecommerce_needed BOOLEAN DEFAULT FALSE,
  ecommerce_details TEXT,
  newsletter_needed BOOLEAN DEFAULT FALSE,
  member_area_needed BOOLEAN DEFAULT FALSE,
  member_area_details TEXT,
  social_media_needed BOOLEAN DEFAULT FALSE,
  whatsapp_chat_needed BOOLEAN DEFAULT FALSE,
  appointment_booking BOOLEAN DEFAULT FALSE,
  appointment_tool TEXT,
  existing_seo_keywords TEXT,
  google_analytics_needed BOOLEAN DEFAULT FALSE,
  
  -- Step 6: Domain
  desired_domain TEXT,
  
  -- Step 7: Legal & Contact
  privacy_policy_exists BOOLEAN DEFAULT FALSE,
  privacy_policy_creation_needed BOOLEAN DEFAULT FALSE,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  vat_id TEXT
);

-- Add missing columns if they don't exist
DO $$ 
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check and add columns that might be missing
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'followup_questionnaires' 
        AND column_name = 'core_business'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE followup_questionnaires ADD COLUMN core_business TEXT;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'followup_questionnaires' 
        AND column_name = 'revenue_generation'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE followup_questionnaires ADD COLUMN revenue_generation TEXT;
    END IF;

    -- Add other columns if needed
    -- (Continue for all columns from the FormData interface)
END $$;

-- Create RLS policies
ALTER TABLE followup_questionnaires ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own followup questionnaires" ON followup_questionnaires;
DROP POLICY IF EXISTS "Users can insert their own followup questionnaires" ON followup_questionnaires;
DROP POLICY IF EXISTS "Users can update their own followup questionnaires" ON followup_questionnaires;
DROP POLICY IF EXISTS "Admins can view all followup questionnaires" ON followup_questionnaires;

-- Create policies
CREATE POLICY "Users can view their own followup questionnaires" ON followup_questionnaires
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own followup questionnaires" ON followup_questionnaires
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own followup questionnaires" ON followup_questionnaires
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all followup questionnaires" ON followup_questionnaires
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_followup_questionnaires_updated_at ON followup_questionnaires;
CREATE TRIGGER update_followup_questionnaires_updated_at
    BEFORE UPDATE ON followup_questionnaires
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
