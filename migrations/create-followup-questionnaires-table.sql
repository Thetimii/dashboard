-- Create followup_questionnaires table
-- This table stores the detailed questionnaire responses from users after kickoff
-- Run this script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.followup_questionnaires (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Business Goals
    core_business text NOT NULL,
    revenue_generation text NOT NULL,
    secondary_revenue text,
    long_term_revenue text,
    
    -- Competitive Environment
    unique_selling_points text NOT NULL,
    customer_choice_reasons text NOT NULL,
    problems_solved text NOT NULL,
    trust_building text NOT NULL,
    potential_objections text,
    main_competitors text,
    competitor_strengths text,
    
    -- Target Group Analysis
    target_group_demographics text NOT NULL,
    target_group_needs text,
    
    -- Content Planning
    service_subpages boolean DEFAULT false,
    service_subpages_details text,
    existing_content boolean DEFAULT false,
    existing_content_details text,
    
    -- Functionality
    required_functions text[], -- Array of strings for multiple functions
    ecommerce_needed boolean DEFAULT false,
    blog_needed boolean DEFAULT false,
    newsletter_needed boolean DEFAULT false,
    member_area_needed boolean DEFAULT false,
    social_media_needed boolean DEFAULT false,
    whatsapp_chat_needed boolean DEFAULT false,
    appointment_booking boolean DEFAULT false,
    appointment_tool text,
    existing_seo_keywords text,
    google_analytics_needed boolean DEFAULT false,
    
    -- Domain & Hosting
    desired_domain text,
    
    -- Legal Requirements
    privacy_policy_exists boolean DEFAULT false,
    privacy_policy_creation_needed boolean DEFAULT false,
    company_address text NOT NULL,
    company_phone text NOT NULL,
    company_email text NOT NULL,
    vat_id text,
    
    -- Meta fields
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_user_id ON public.followup_questionnaires(user_id);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_completed ON public.followup_questionnaires(completed);
CREATE INDEX IF NOT EXISTS idx_followup_questionnaires_created_at ON public.followup_questionnaires(created_at);

-- Create unique constraint to ensure one questionnaire per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_questionnaire_per_user ON public.followup_questionnaires(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.followup_questionnaires ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view and modify their own questionnaires
CREATE POLICY "Users can view their own questionnaires" ON public.followup_questionnaires
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaires" ON public.followup_questionnaires
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaires" ON public.followup_questionnaires
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questionnaires" ON public.followup_questionnaires
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_followup_questionnaires_updated_at
    BEFORE UPDATE ON public.followup_questionnaires
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.followup_questionnaires TO authenticated;
GRANT ALL ON public.followup_questionnaires TO service_role;

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW public.questionnaire_summary AS
SELECT 
    id,
    user_id,
    core_business,
    completed,
    created_at,
    updated_at
FROM public.followup_questionnaires;

-- Grant permissions on the view
GRANT SELECT ON public.questionnaire_summary TO authenticated;
GRANT ALL ON public.questionnaire_summary TO service_role;

-- Insert a comment for documentation
COMMENT ON TABLE public.followup_questionnaires IS 'Stores detailed questionnaire responses from users after the initial kickoff form';
