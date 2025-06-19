-- Remove Automatic Email Triggers and Add Manual Tracking
-- This script removes the automatic email triggers and prepares the database for manual email sending

-- =============================================================================
-- 1. REMOVE AUTOMATIC TRIGGERS
-- =============================================================================

-- Drop the automatic demo ready triggers
DROP TRIGGER IF EXISTS demo_ready_notification ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;

-- Drop the automatic website launch trigger
DROP TRIGGER IF EXISTS website_launch_notification ON public.project_status;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- =============================================================================
-- 2. CREATE EMAIL TRACKING TABLES
-- =============================================================================

-- Create table to track manual email sends
CREATE TABLE IF NOT EXISTS public.manual_email_sends (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type text NOT NULL CHECK (email_type IN ('demo_ready', 'website_launch')),
    sent_at timestamp with time zone DEFAULT now(),
    sent_by uuid REFERENCES auth.users(id), -- Admin who sent the email
    trigger_values jsonb, -- Store the values that triggered eligibility (demo URLs or status)
    created_at timestamp with time zone DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_user_id ON public.manual_email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_type ON public.manual_email_sends(email_type);

-- =============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================================================

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

-- =============================================================================
-- 4. CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to check if demo emails can be sent
CREATE OR REPLACE FUNCTION can_send_demo_email(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
    demo_data record;
    last_sent record;
    all_demos_ready boolean;
    values_changed boolean;
BEGIN
    -- Get current demo data
    SELECT option_1_url, option_2_url, option_3_url 
    INTO demo_data
    FROM public.demo_links 
    WHERE user_id = target_user_id;
    
    -- Check if all demos are ready
    all_demos_ready := (
        demo_data.option_1_url IS NOT NULL AND demo_data.option_1_url != '' AND
        demo_data.option_2_url IS NOT NULL AND demo_data.option_2_url != '' AND
        demo_data.option_3_url IS NOT NULL AND demo_data.option_3_url != ''
    );
    
    -- If demos aren't ready, can't send
    IF NOT all_demos_ready THEN
        RETURN false;
    END IF;
    
    -- Get last sent demo email for this user
    SELECT trigger_values 
    INTO last_sent
    FROM public.manual_email_sends 
    WHERE user_id = target_user_id 
    AND email_type = 'demo_ready'
    ORDER BY sent_at DESC 
    LIMIT 1;
    
    -- If never sent before, can send
    IF last_sent IS NULL THEN
        RETURN true;
    END IF;
    
    -- Check if demo URLs have changed since last send
    values_changed := (
        (last_sent.trigger_values->>'option_1_url') != demo_data.option_1_url OR
        (last_sent.trigger_values->>'option_2_url') != demo_data.option_2_url OR
        (last_sent.trigger_values->>'option_3_url') != demo_data.option_3_url
    );
    
    RETURN values_changed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if website launch emails can be sent
CREATE OR REPLACE FUNCTION can_send_launch_email(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
    project_data record;
    last_sent record;
    is_live boolean;
    status_changed boolean;
BEGIN
    -- Get current project status
    SELECT status, final_url 
    INTO project_data
    FROM public.project_status 
    WHERE user_id = target_user_id;
    
    -- Check if project is live
    is_live := (project_data.status = 'live');
    
    -- If not live, can't send
    IF NOT is_live THEN
        RETURN false;
    END IF;
    
    -- Get last sent launch email for this user
    SELECT trigger_values 
    INTO last_sent
    FROM public.manual_email_sends 
    WHERE user_id = target_user_id 
    AND email_type = 'website_launch'
    ORDER BY sent_at DESC 
    LIMIT 1;
    
    -- If never sent before, can send
    IF last_sent IS NULL THEN
        RETURN true;
    END IF;
    
    -- Check if status changed from non-live to live since last send
    -- This is more complex - we track if the status was different
    status_changed := (
        (last_sent.trigger_values->>'status') != project_data.status OR
        (last_sent.trigger_values->>'final_url') != COALESCE(project_data.final_url, '')
    );
    
    RETURN status_changed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record email send
CREATE OR REPLACE FUNCTION record_email_send(
    target_user_id uuid,
    email_type_param text,
    admin_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid AS $$
DECLARE
    email_id uuid;
    trigger_vals jsonb;
BEGIN
    -- Prepare trigger values based on email type
    IF email_type_param = 'demo_ready' THEN
        SELECT jsonb_build_object(
            'option_1_url', option_1_url,
            'option_2_url', option_2_url,
            'option_3_url', option_3_url
        ) INTO trigger_vals
        FROM public.demo_links 
        WHERE user_id = target_user_id;
    ELSIF email_type_param = 'website_launch' THEN
        SELECT jsonb_build_object(
            'status', status,
            'final_url', COALESCE(final_url, '')
        ) INTO trigger_vals
        FROM public.project_status 
        WHERE user_id = target_user_id;
    END IF;
    
    -- Insert email send record
    INSERT INTO public.manual_email_sends (
        user_id,
        email_type,
        sent_by,
        trigger_values
    ) VALUES (
        target_user_id,
        email_type_param,
        admin_user_id,
        trigger_vals
    ) RETURNING id INTO email_id;
    
    RETURN email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5. GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION can_send_demo_email(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION can_send_launch_email(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_email_send(uuid, text, uuid) TO authenticated, service_role;

-- Grant table permissions
GRANT ALL ON public.manual_email_sends TO authenticated, service_role;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- Summary of changes:
-- ✅ Removed all automatic email triggers
-- ✅ Created manual_email_sends tracking table
-- ✅ Added functions to check email eligibility
-- ✅ Added function to record email sends
-- ✅ Set up proper RLS policies

SELECT 'Manual email trigger system setup complete!' as status;
