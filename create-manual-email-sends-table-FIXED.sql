-- Create table for tracking manual email sends with duplicate prevention
-- Fixed version with correct user_profiles column references

CREATE TABLE IF NOT EXISTS public.manual_email_sends (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_type text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_by uuid NOT NULL, -- Admin user who sent the email
  trigger_values jsonb NOT NULL, -- Store current state when email sent
  email_subject text NOT NULL,
  email_recipient text NOT NULL, -- Store actual email address used
  status text NOT NULL DEFAULT 'sent', -- sent, failed, pending
  error_message text NULL, -- Store any error details
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT manual_email_sends_pkey PRIMARY KEY (id),
  CONSTRAINT manual_email_sends_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES auth.users (id),
  CONSTRAINT manual_email_sends_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT manual_email_sends_email_type_check CHECK (
    email_type = ANY (ARRAY['demo_ready'::text, 'website_launch'::text])
  ),
  CONSTRAINT manual_email_sends_status_check CHECK (
    status = ANY (ARRAY['sent'::text, 'failed'::text, 'pending'::text])
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_user_id ON public.manual_email_sends USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_type ON public.manual_email_sends USING btree (email_type);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_sent_at ON public.manual_email_sends USING btree (sent_at);
CREATE INDEX IF NOT EXISTS idx_manual_email_sends_user_type ON public.manual_email_sends USING btree (user_id, email_type);

-- Enable RLS
ALTER TABLE public.manual_email_sends ENABLE ROW LEVEL SECURITY;

-- Policy for admin access only (FIXED: uses correct column name 'id' not 'user_id')
CREATE POLICY "Admin can manage email sends" ON public.manual_email_sends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_manual_email_sends_updated_at ON public.manual_email_sends;
CREATE TRIGGER update_manual_email_sends_updated_at 
  BEFORE UPDATE ON public.manual_email_sends 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.manual_email_sends TO authenticated;
GRANT ALL ON public.manual_email_sends TO service_role;
