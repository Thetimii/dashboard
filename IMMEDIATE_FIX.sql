-- IMMEDIATE FIX: Stop automatic emails and enable manual system
-- Copy and paste this into your Supabase SQL Editor RIGHT NOW

-- 1. Remove automatic triggers
DROP TRIGGER IF EXISTS demo_ready_notification ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;
DROP TRIGGER IF EXISTS website_launch_notification ON public.project_status;
DROP TRIGGER IF EXISTS website_launch_notification_trigger ON public.project_status;

-- 2. Drop trigger functions 
DROP FUNCTION IF EXISTS notify_demo_ready();
DROP FUNCTION IF EXISTS notify_website_launch();

-- 3. Create manual email tracking table
CREATE TABLE IF NOT EXISTS public.manual_email_sends (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type text NOT NULL CHECK (email_type IN ('demo_ready', 'website_launch')),
    sent_at timestamp with time zone DEFAULT now(),
    sent_by uuid REFERENCES auth.users(id),
    trigger_values jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Enable RLS on manual email tracking
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- 5. Create admin policy for manual email tracking
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

-- 6. Grant permissions
GRANT ALL ON public.manual_email_sends TO authenticated, service_role;

SELECT 'AUTOMATIC EMAILS STOPPED! Manual system ready.' as status;
