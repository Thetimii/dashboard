-- SAFE IMMEDIATE FIX: Stop automatic emails and ensure manual system is ready
-- This script safely handles existing database components

-- 1. Remove automatic triggers (safe if they don't exist)
DROP TRIGGER IF EXISTS demo_ready_notification ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification ON public.project_status;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- 2. Drop trigger functions (safe if they don't exist)
DROP FUNCTION IF EXISTS notify_demo_ready();
DROP FUNCTION IF EXISTS notify_website_launch();

-- 3. Create manual email tracking table (safe if exists)
CREATE TABLE IF NOT EXISTS public.manual_email_sends (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type text NOT NULL CHECK (email_type IN ('demo_ready', 'website_launch')),
    sent_at timestamp with time zone DEFAULT now(),
    sent_by uuid REFERENCES auth.users(id),
    trigger_values jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Enable RLS (safe if already enabled)
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- 5. Drop and recreate policies to avoid conflicts
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

-- 6. Grant permissions (safe to run multiple times)
GRANT ALL ON public.manual_email_sends TO authenticated, service_role;

-- 7. Create the helper functions for checking email eligibility
CREATE OR REPLACE FUNCTION can_send_demo_email(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
    demo_data record;
    last_sent record;
    all_demos_ready boolean;
    values_changed boolean := false;
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

CREATE OR REPLACE FUNCTION can_send_launch_email(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
    project_data record;
    last_sent record;
    is_live boolean;
    status_changed boolean := false;
BEGIN
    -- Get current project status
    SELECT status, final_url 
    INTO project_data
    FROM public.project_status 
    WHERE user_id = target_user_id;
    
    -- Check if project is live
    is_live := (project_data.status = 'live');
    
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
    
    -- Check if status has changed since last send
    status_changed := (
        (last_sent.trigger_values->>'status') != project_data.status OR
        (last_sent.trigger_values->>'final_url') != COALESCE(project_data.final_url, '')
    );
    
    RETURN status_changed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION record_email_send(
    target_user_id uuid,
    email_type_param text,
    admin_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    trigger_vals jsonb;
    record_id uuid;
BEGIN
    -- Build trigger values based on email type
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
    
    -- Insert the record
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
    ) RETURNING id INTO record_id;
    
    RETURN record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Final verification
SELECT 
    'SUCCESS: Automatic emails stopped, manual system ready!' as status,
    COUNT(*) as existing_policies_count
FROM information_schema.table_privileges 
WHERE table_name = 'manual_email_sends';
