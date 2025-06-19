-- Manual Email Tracking System
-- Run this in your Supabase SQL Editor to enable duplicate prevention

-- Create manual_email_sends table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.manual_email_sends (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type text NOT NULL CHECK (email_type IN ('demo_ready', 'website_launch')),
    sent_at timestamp with time zone DEFAULT now(),
    sent_by uuid REFERENCES auth.users(id), -- Admin who sent the email
    trigger_values jsonb, -- Store the values that triggered the email (demo URLs or project status)
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_user_id ON public.manual_email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_type ON public.manual_email_sends(email_type);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_sent_at ON public.manual_email_sends(sent_at);

-- Enable Row Level Security
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Grant permissions
GRANT ALL ON public.manual_email_sends TO authenticated, service_role;

-- Verify the table was created successfully
SELECT 'Manual email tracking system setup complete!' as status;
