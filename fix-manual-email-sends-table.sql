-- Add missing columns to the manual_email_sends table
-- Run this SQL to fix the missing columns

ALTER TABLE public.manual_email_sends 
ADD COLUMN IF NOT EXISTS email_subject text NOT NULL DEFAULT 'Manual Email',
ADD COLUMN IF NOT EXISTS email_recipient text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent',
ADD COLUMN IF NOT EXISTS error_message text NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Add missing constraints
ALTER TABLE public.manual_email_sends 
ADD CONSTRAINT IF NOT EXISTS manual_email_sends_status_check 
CHECK (status = ANY (ARRAY['sent'::text, 'failed'::text, 'pending'::text]));

-- Make sure sent_by and trigger_values are NOT NULL (they were created as nullable)
ALTER TABLE public.manual_email_sends 
ALTER COLUMN sent_by SET NOT NULL,
ALTER COLUMN trigger_values SET NOT NULL;

-- Enable RLS (if not already enabled)
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the admin policy with correct syntax
DROP POLICY IF EXISTS "Admin can manage email sends" ON public.manual_email_sends;
CREATE POLICY "Admin can manage email sends" ON public.manual_email_sends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON public.manual_email_sends TO authenticated;
GRANT ALL ON public.manual_email_sends TO service_role;
